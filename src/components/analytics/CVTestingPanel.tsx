'use client'

import { useMemo, useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import Link from 'next/link'
import { Skeleton } from '@/components/ui/skeleton'
import { MetricCard } from '@/components/analytics/metric-card'
import { CVComparisonChart } from '@/components/analytics/CVComparisonChart'
import { CVComparisonTable } from '@/components/analytics/CVComparisonTable'
import {
  DateFilterPills,
  DEFAULT_DATE_PRESETS,
  getDateRange,
} from '@/components/analytics/date-filter-pills'
import { useUserStore } from '@/store/userStore'
import type { CVComparisonRow } from '@/lib/services/analyticsService'
import type { CVVersion } from '@/types/database.types'

const EU_AVG_SCREENING_LABEL = '2–4%'
const LOW_SAMPLE_THRESHOLD = 10

async function fetchCVComparison(params: {
  from?: string
  to?: string
}): Promise<CVComparisonRow[]> {
  const url = new URL('/api/analytics/cv-comparison', window.location.origin)
  if (params.from) url.searchParams.set('from', params.from)
  if (params.to) url.searchParams.set('to', params.to)
  const res = await fetch(url.toString())
  if (!res.ok) throw new Error('Failed to fetch CV comparison data')
  return res.json()
}

async function fetchAllCVVersions(): Promise<CVVersion[]> {
  const url = new URL('/api/cv-versions', window.location.origin)
  url.searchParams.set('include_archived', 'true')
  const res = await fetch(url.toString())
  if (!res.ok) throw new Error('Failed to fetch CV versions')
  return res.json()
}

function SummaryCards({ rows }: { rows: CVComparisonRow[] }) {
  // Only tagged (non-untagged) versions that actually reached screening
  const tagged = rows.filter((r) => r.version_id !== null)
  const withScreening = tagged.filter((r) => (r.reached_screening ?? 0) > 0)
  const untagged = rows.find((r) => r.version_id === null)
  const untaggedCount = untagged?.total_applied ?? 0

  // Best performer — only among versions that reached screening
  const best = withScreening.reduce<CVComparisonRow | null>((acc, r) => {
    if ((r.screening_rate ?? 0) > (acc?.screening_rate ?? 0)) return r
    return acc
  }, null)

  // Total tracked (tagged only)
  const totalTracked = tagged.reduce((acc, r) => acc + r.total_applied, 0)

  // Overall screening rate across all tagged
  const totalReachedScreening = tagged.reduce((acc, r) => acc + r.reached_screening, 0)
  const overallScreening =
    totalTracked > 0 ? Math.round((totalReachedScreening / totalTracked) * 100) : 0

  // Advantage of best vs average
  const avgScreeningRate = totalTracked > 0 ? (totalReachedScreening / totalTracked) * 100 : 0
  const bestAdvantage = best ? ((best.screening_rate ?? 0) - avgScreeningRate).toFixed(1) : '0.0'
  const bestIsLowSample = best ? best.total_applied < LOW_SAMPLE_THRESHOLD : false

  return (
    <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
      {/* Best Performing Version */}
      <MetricCard
        label="Best Performing Version"
        value={best ? best.version_name : '—'}
        icon={
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
          </svg>
        }
        accentColor="#2563EB"
      >
        {best ? (
          <>
            <div className="w-10 h-10 rounded-xl flex items-center justify-center mb-3" style={{ background: '#2563EB1F', color: '#2563EB' }}>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
              </svg>
            </div>
            <p className="font-mono text-xl font-bold text-[--jf-text-primary] leading-tight">{best.version_name}</p>
            <div className="mt-1.5 flex items-center gap-1.5 flex-wrap">
              <span className="inline-flex items-center bg-green-50 text-green-700 border border-green-200 text-xs px-2 py-0.5 rounded-full dark:bg-green-950 dark:text-green-400 dark:border-green-800">
                +{bestAdvantage}% vs Avg
              </span>
              {bestIsLowSample && (
                <span className="inline-flex items-center gap-0.5 text-amber-600 text-xs">
                  Low sample
                </span>
              )}
            </div>
            <p className="text-xs text-[--jf-text-secondary] mt-1">{best.screening_rate ?? 0}% screening rate</p>
          </>
        ) : (
          <>
            <div className="w-10 h-10 rounded-xl flex items-center justify-center mb-3" style={{ background: '#2563EB1F', color: '#2563EB' }}>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
              </svg>
            </div>
            <p className="text-sm text-[--jf-text-muted]">No data yet</p>
          </>
        )}
      </MetricCard>

      {/* Screening Rate All Versions */}
      <MetricCard
        label={totalTracked > 0 ? `${overallScreening}% vs. EU avg. ${EU_AVG_SCREENING_LABEL}` : 'Screening Rate (All Versions)'}
        value={`${overallScreening}%`}
        icon={
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
          </svg>
        }
        accentColor="#10B981"
      />

      {/* Untagged Applications */}
      <MetricCard
        label="Untagged Applications"
        value={untaggedCount}
        icon={
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M20.59 13.41l-7.17 7.17a2 2 0 0 1-2.83 0L2 12V2h10l8.59 8.59a2 2 0 0 1 0 2.82z"/><line x1="7" y1="7" x2="7.01" y2="7"/>
          </svg>
        }
        accentColor="#F59E0B"
      >
        <div className="w-10 h-10 rounded-xl flex items-center justify-center mb-3" style={{ background: '#F59E0B1F', color: '#F59E0B' }}>
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M20.59 13.41l-7.17 7.17a2 2 0 0 1-2.83 0L2 12V2h10l8.59 8.59a2 2 0 0 1 0 2.82z"/><line x1="7" y1="7" x2="7.01" y2="7"/>
          </svg>
        </div>
        <p className={`font-mono text-3xl font-bold ${untaggedCount > 0 ? 'text-amber-500' : 'text-[--jf-text-primary]'}`}>
          {untaggedCount}
        </p>
        <p className="text-sm text-[--jf-text-secondary] mt-1">Untagged Applications</p>
        {untaggedCount > 0 && (
          <Link
            href="/pipeline"
            className="text-xs text-[--jf-text-muted] hover:text-[--jf-interactive] underline underline-offset-2 mt-1 inline-block transition-colors"
          >
            Tag them →
          </Link>
        )}
      </MetricCard>
    </div>
  )
}

function LockedCVTestingPanel() {
  return (
    <div className="relative rounded-2xl border border-[--jf-border] overflow-hidden">
      {/* Blurred preview of the real content */}
      <div className="filter blur-sm pointer-events-none select-none opacity-60 p-6">
        {/* Show a placeholder skeleton of the CV testing UI */}
        <div className="space-y-4">
          <div className="h-8 bg-[--jf-border] rounded-lg w-48" />
          <div className="grid grid-cols-2 gap-4">
            <div className="h-24 bg-[--jf-border] rounded-xl" />
            <div className="h-24 bg-[--jf-border] rounded-xl" />
          </div>
          <div className="h-48 bg-[--jf-border] rounded-xl" />
        </div>
      </div>
      {/* Upgrade overlay */}
      <div className="absolute inset-0 flex flex-col items-center justify-center bg-white/80 backdrop-blur-sm p-6 text-center">
        <div
          className="w-12 h-12 rounded-2xl flex items-center justify-center mb-3"
          style={{ background: 'var(--jf-interactive-subtle)' }}
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="var(--jf-interactive)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <rect x="3" y="11" width="18" height="11" rx="2" ry="2"/>
            <path d="M7 11V7a5 5 0 0 1 10 0v4"/>
          </svg>
        </div>
        <p className="text-base font-semibold text-[--jf-text-primary] mb-1">CV A/B Testing</p>
        <p className="text-sm text-[--jf-text-secondary] mb-4 max-w-xs">
          See which CV version drives better screening rates. Available on Pro.
        </p>
        <a
          href="/settings"
          className="inline-flex items-center justify-center px-4 py-2 rounded-xl text-sm font-semibold text-white transition-colors"
          style={{ background: 'var(--jf-interactive)', minHeight: 44 }}
        >
          Upgrade to Pro
        </a>
      </div>
    </div>
  )
}

export function CVTestingPanel() {
  const profile = useUserStore((s) => s.profile)
  const subscriptionTier = profile?.subscription_tier

  if (subscriptionTier !== 'pro') {
    return <LockedCVTestingPanel />
  }

  return <CVTestingPanelContent />
}

function CVTestingPanelContent() {
  const [presetIndex, setPresetIndex] = useState(0)

  const preset = DEFAULT_DATE_PRESETS[presetIndex]
  const dateRange = useMemo(() => getDateRange(preset.days), [preset.days])

  const { data: cvVersions, isLoading: versionsLoading } = useQuery({
    queryKey: ['cv-versions-all'],
    queryFn: fetchAllCVVersions,
  })

  const { data: comparisonRows, isLoading: comparisonLoading } = useQuery({
    queryKey: ['cv-comparison', dateRange],
    queryFn: () => fetchCVComparison(dateRange),
  })

  const isLoading = versionsLoading || comparisonLoading

  // Build archived lookup for table
  const cvVersionDefaults: Record<string, boolean> = {}
  const cvVersionArchived: Record<string, boolean> = {}
  for (const v of cvVersions ?? []) {
    cvVersionDefaults[v.id] = v.is_default
    cvVersionArchived[v.id] = v.is_archived
  }

  const hasNoVersions = !versionsLoading && (cvVersions ?? []).length === 0
  const hasNoData = !comparisonLoading && (comparisonRows ?? []).length === 0

  return (
    <div className="space-y-6">
      {/* Time filter */}
      <DateFilterPills selectedIndex={presetIndex} onSelect={setPresetIndex} />

      {/* Summary cards */}
      {!isLoading && !hasNoData && (
        <SummaryCards rows={comparisonRows ?? []} />
      )}

      {/* Empty: no CV versions at all */}
      {hasNoVersions ? (
        <div className="flex flex-col items-center justify-center py-16 text-center space-y-3">
          <p className="text-[--jf-text-muted] text-sm">
            Create your first CV version to start tracking performance
          </p>
          <Link
            href="/cv-versions"
            className="text-sm font-medium hover:opacity-80 underline underline-offset-2 transition-opacity"
            style={{ color: 'var(--jf-interactive)' }}
          >
            Go to CV Versions
          </Link>
        </div>
      ) : isLoading ? (
        <div className="space-y-4">
          <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
            {[1, 2, 3].map((n) => (
              <div
                key={n}
                className="rounded-2xl border border-[--jf-border] bg-[--jf-bg-card] shadow-[--jf-shadow-sm] p-5"
              >
                <Skeleton className="h-3 w-2/3 mb-3" />
                <Skeleton className="h-7 w-1/2 mb-2" />
                <Skeleton className="h-2.5 w-3/4" />
              </div>
            ))}
          </div>
          <Skeleton className="h-56 w-full rounded-xl" />
        </div>
      ) : hasNoData ? (
        <div className="flex flex-col items-center justify-center py-16 text-center space-y-3">
          <p className="text-[--jf-text-muted] text-sm">
            No applications found for the selected date range.
          </p>
          <p className="text-[--jf-text-muted] text-xs">
            Tag your applications with a CV version to start comparing performance.
          </p>
        </div>
      ) : (
        <>
          <div className="rounded-2xl border border-[--jf-border] bg-[--jf-bg-card] shadow-[--jf-shadow-sm] p-5">
            <h3 className="text-base font-semibold text-[--jf-text-primary] mb-4">
              Applied → Screening Rate by CV Version
            </h3>
            <CVComparisonChart rows={comparisonRows ?? []} />
          </div>

          <div className="rounded-2xl border border-[--jf-border] bg-[--jf-bg-card] shadow-[--jf-shadow-sm] p-5">
            <h3 className="text-base font-semibold text-[--jf-text-primary] mb-4">
              CV Performance Comparison
            </h3>
            <CVComparisonTable
              rows={comparisonRows ?? []}
              cvVersionDefaults={cvVersionDefaults}
              cvVersionArchived={cvVersionArchived}
            />
          </div>
        </>
      )}
    </div>
  )
}
