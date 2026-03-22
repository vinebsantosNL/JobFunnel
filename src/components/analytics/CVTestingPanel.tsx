'use client'

import { useMemo } from 'react'
import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import Link from 'next/link'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { CVComparisonChart } from '@/components/analytics/CVComparisonChart'
import { CVComparisonTable } from '@/components/analytics/CVComparisonTable'
import type { CVComparisonRow } from '@/lib/services/analyticsService'
import type { CVVersion, Profile } from '@/types/database.types'

const EU_AVG_SCREENING_LABEL = '2–4%'
const LOW_SAMPLE_THRESHOLD = 10

const DATE_PRESETS = [
  { label: 'Last 30 days', days: 30 },
  { label: 'Last 45 days', days: 45 },
  { label: 'Last 90 days', days: 90 },
] as const

function getDateRange(days: number): { from: string; to: string } {
  const to = new Date()
  const from = new Date()
  from.setDate(from.getDate() - days)
  return { from: from.toISOString(), to: to.toISOString() }
}

function formatDateRangeLabel(days: number): string {
  const to = new Date()
  const from = new Date()
  from.setDate(from.getDate() - days)
  const fmt = (d: Date) => d.toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })
  return `${fmt(from)} – ${fmt(to)}`
}

async function fetchProfile(): Promise<Profile> {
  const res = await fetch('/api/auth/me')
  if (!res.ok) throw new Error('Failed to fetch profile')
  return res.json()
}

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
  const versionCount = tagged.length

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
      <div className="bg-white rounded-xl border border-gray-200 border-l-4 border-l-blue-500 p-5">
        <p className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-1">Best Performing Version</p>
        {best ? (
          <>
            <p className="text-xl font-bold text-gray-900 leading-tight">{best.version_name}</p>
            <div className="mt-1.5 flex items-center gap-1.5 flex-wrap">
              <span className="inline-flex items-center bg-green-50 text-green-700 border border-green-200 text-xs px-2 py-0.5 rounded-full">
                +{bestAdvantage}% vs Avg
              </span>
              {bestIsLowSample && (
                <span className="inline-flex items-center gap-0.5 text-amber-600 text-xs">
                  ⚠ Low sample
                </span>
              )}
            </div>
            <p className="text-xs text-gray-500 mt-1">{best.screening_rate ?? 0}% screening rate</p>
          </>
        ) : (
          <p className="text-sm text-gray-400">No data yet</p>
        )}
      </div>

      {/* Screening Rate All Versions */}
      <div className="bg-white rounded-xl border border-gray-200 border-l-4 border-l-green-500 p-5">
        <p className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-1">Screening Rate (All Versions)</p>
        <p className="text-2xl font-bold text-gray-900">{overallScreening}%</p>
        {totalTracked > 0 && (
          <p className="text-xs mt-1 text-green-600">
            {overallScreening}% vs. EU avg. {EU_AVG_SCREENING_LABEL}
          </p>
        )}
      </div>

      {/* Untagged Applications */}
      <div className="bg-white rounded-xl border border-gray-200 border-l-4 border-l-amber-500 p-5">
        <p className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-1">Untagged Applications</p>
        <p className={`text-2xl font-bold ${untaggedCount > 0 ? 'text-amber-500' : 'text-gray-900'}`}>
          {untaggedCount}
        </p>
        {untaggedCount > 0 && (
          <Link
            href="/pipeline"
            className="text-xs text-gray-500 hover:text-blue-600 underline underline-offset-2 mt-1 inline-block"
          >
            Tag them →
          </Link>
        )}
      </div>
    </div>
  )
}

export function CVTestingPanel() {
  const [presetIndex, setPresetIndex] = useState(0)

  const preset = DATE_PRESETS[presetIndex]
  const dateRange = useMemo(() => getDateRange(preset.days), [preset.days])

  const { data: profile, isLoading: profileLoading } = useQuery({
    queryKey: ['profile'],
    queryFn: fetchProfile,
  })

  const { data: cvVersions, isLoading: versionsLoading } = useQuery({
    queryKey: ['cv-versions-all'],
    queryFn: fetchAllCVVersions,
  })

  const { data: comparisonRows, isLoading: comparisonLoading } = useQuery({
    queryKey: ['cv-comparison', dateRange],
    queryFn: () => fetchCVComparison(dateRange),
  })

  const isPro = profile?.subscription_tier === 'pro'
  const isLoading = profileLoading || versionsLoading || comparisonLoading

  // Build archived lookup for table
  const cvVersionDefaults: Record<string, boolean> = {}
  const cvVersionArchived: Record<string, boolean> = {}
  for (const v of cvVersions ?? []) {
    cvVersionDefaults[v.id] = v.is_default
    cvVersionArchived[v.id] = v.is_archived
  }

  const hasNoVersions = !versionsLoading && (cvVersions ?? []).length === 0
  const hasNoData = !comparisonLoading && (comparisonRows ?? []).length === 0

  const dataSection = (
    <div className="space-y-6">
      {/* Time filter header — same as Funnel Overview */}
      <div className="flex flex-col gap-1 w-fit">
        <div className="border border-gray-200 rounded-lg overflow-hidden flex">
          {DATE_PRESETS.map((p, i) => (
            <button
              key={i}
              onClick={() => setPresetIndex(i)}
              className={`px-4 py-1.5 text-sm transition-colors ${
                presetIndex === i
                  ? 'bg-gray-900 text-white'
                  : 'bg-white text-gray-600 hover:bg-gray-50'
              }`}
            >
              {p.label}
            </button>
          ))}
        </div>
        <p className="text-xs text-gray-400 pl-1">{formatDateRangeLabel(preset.days)}</p>
      </div>

      {/* Summary cards */}
      {!isLoading && !hasNoData && (
        <SummaryCards rows={comparisonRows ?? []} />
      )}

      {/* Empty: no CV versions at all */}
      {hasNoVersions ? (
        <div className="flex flex-col items-center justify-center py-16 text-center space-y-3">
          <p className="text-gray-500 text-sm">
            Create your first CV version to start tracking performance
          </p>
          <Link
            href="/cv-versions"
            className="text-sm font-medium text-blue-600 hover:text-blue-700 underline underline-offset-2"
          >
            Go to CV Versions
          </Link>
        </div>
      ) : isLoading ? (
        <div className="space-y-4">
          <div className="h-[300px] flex items-center justify-center text-gray-400 text-sm">
            Loading...
          </div>
        </div>
      ) : hasNoData ? (
        <div className="flex flex-col items-center justify-center py-16 text-center space-y-3">
          <p className="text-gray-500 text-sm">
            No applications found for the selected date range.
          </p>
          <p className="text-gray-400 text-xs">
            Tag your applications with a CV version to start comparing performance.
          </p>
        </div>
      ) : (
        <>
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Applied → Screening Rate by CV Version</CardTitle>
            </CardHeader>
            <CardContent>
              <CVComparisonChart rows={comparisonRows ?? []} />
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-base">CV Performance Comparison</CardTitle>
            </CardHeader>
            <CardContent>
              <CVComparisonTable
                rows={comparisonRows ?? []}
                cvVersionDefaults={cvVersionDefaults}
                cvVersionArchived={cvVersionArchived}
              />
            </CardContent>
          </Card>
        </>
      )}
    </div>
  )

  if (profileLoading) {
    return (
      <div className="h-64 flex items-center justify-center text-gray-400 text-sm">
        Loading...
      </div>
    )
  }

  if (!isPro) {
    return (
      <div className="space-y-4">
        <div className="relative">
          <div className="pointer-events-none select-none blur-sm opacity-60">
            {dataSection}
          </div>
          <div className="absolute inset-0 backdrop-blur-sm bg-white/50 z-10 flex items-center justify-center">
            <Card className="max-w-sm w-full mx-4 shadow-xl border-blue-100">
              <CardContent className="pt-8 pb-8 text-center space-y-4">
                <div className="text-3xl">🔒</div>
                <div>
                  <h3 className="text-base font-semibold text-gray-900">
                    Upgrade to Pro to unlock CV A/B Testing
                  </h3>
                  <p className="text-sm text-gray-500 mt-1">
                    Compare how different CV versions perform across your job applications.
                  </p>
                </div>
                <Link
                  href="/settings/billing"
                  className="inline-flex items-center justify-center px-5 py-2 rounded-md bg-blue-600 text-white text-sm font-medium hover:bg-blue-700 transition-colors"
                >
                  Upgrade to Pro
                </Link>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    )
  }

  return dataSection
}
