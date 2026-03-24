'use client'

import { useMemo, useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import Link from 'next/link'
import { Skeleton } from '@/components/ui/skeleton'
import {
  DateFilterPills,
  DEFAULT_DATE_PRESETS,
  getDateRange,
} from '@/components/analytics/date-filter-pills'
import { useUserStore } from '@/store/userStore'
import { STAGE_HEX } from '@/lib/stages'
import type { CVComparisonRow } from '@/lib/services/analyticsService'
import type { CVVersion } from '@/types/database.types'

const LOW_SAMPLE_THRESHOLD = 10

const AB_STAGES = [
  { key: 'screening', label: 'Screening' },
  { key: 'interviewing', label: 'Interviewing' },
  { key: 'offer', label: 'Offer' },
] as const

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

function LockedCVTestingPanel() {
  return (
    <div className="relative rounded-2xl border border-[--jf-border] overflow-hidden">
      {/* Blurred preview */}
      <div className="filter blur-sm pointer-events-none select-none opacity-60 p-6">
        <div className="space-y-4">
          <div className="h-8 bg-[--jf-border] rounded-lg w-48" />
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
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
          <svg
            width="20"
            height="20"
            viewBox="0 0 24 24"
            fill="none"
            stroke="var(--jf-interactive)"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
            <path d="M7 11V7a5 5 0 0 1 10 0v4" />
          </svg>
        </div>
        <p
          className="text-base font-semibold mb-1"
          style={{ color: 'var(--jf-text-primary)' }}
        >
          CV A/B Testing
        </p>
        <p
          className="text-sm mb-4 max-w-xs"
          style={{ color: 'var(--jf-text-secondary)' }}
        >
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

  // Build lookup maps
  const cvVersionDefaults: Record<string, boolean> = {}
  for (const v of cvVersions ?? []) {
    cvVersionDefaults[v.id] = v.is_default
  }

  const hasNoVersions = !versionsLoading && (cvVersions ?? []).length === 0
  const hasNoData = !comparisonLoading && (comparisonRows ?? []).length === 0

  // Get tagged rows only (exclude untagged)
  const taggedRows = (comparisonRows ?? []).filter((r) => r.version_id !== null)

  // Sort by screening rate descending, pick top 2 for A/B comparison
  const sortedRows = [...taggedRows].sort(
    (a, b) => (b.screening_rate ?? 0) - (a.screening_rate ?? 0)
  )
  const versionA = sortedRows[0] ?? null
  const versionB = sortedRows[1] ?? null

  // Determine winner
  const hasWinner =
    versionA &&
    versionB &&
    (versionA.screening_rate ?? 0) > 0 &&
    (versionB.screening_rate ?? 0) > 0 &&
    (versionA.screening_rate ?? 0) !== (versionB.screening_rate ?? 0)

  const winnerName = versionA?.version_name ?? ''
  const winnerRate = versionA?.screening_rate ?? 0
  const loserRate = versionB?.screening_rate ?? 0
  const rateMultiplier =
    loserRate > 0 ? Math.round(winnerRate / loserRate) : 0

  // Low confidence check
  const anyLowConfidence =
    taggedRows.some((r) => r.total_applied < LOW_SAMPLE_THRESHOLD)

  // Rate getter for a row
  function getStageRate(
    row: CVComparisonRow,
    stageKey: string
  ): number {
    switch (stageKey) {
      case 'screening':
        return row.screening_rate ?? 0
      case 'interviewing':
        return row.interview_rate ?? 0
      case 'offer':
        return row.overall_conversion ?? 0
      default:
        return 0
    }
  }

  if (hasNoVersions) {
    return (
      <div className="rounded-2xl border border-[--jf-border] bg-[--jf-bg-card] shadow-[--jf-shadow-sm] p-6">
        <div className="flex items-start justify-between mb-4">
          <div>
            <h3
              className="text-base font-semibold"
              style={{ color: 'var(--jf-text-primary)' }}
            >
              CV A/B Performance Testing
            </h3>
            <p
              className="text-xs mt-0.5"
              style={{ color: 'var(--jf-text-muted)' }}
            >
              Which CV version gets more screenings?
            </p>
          </div>
        </div>
        <div className="flex flex-col items-center justify-center py-12 text-center space-y-3">
          <p style={{ color: 'var(--jf-text-muted)' }} className="text-sm">
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
      </div>
    )
  }

  if (isLoading) {
    return (
      <div className="rounded-2xl border border-[--jf-border] bg-[--jf-bg-card] shadow-[--jf-shadow-sm] p-6">
        <Skeleton className="h-6 w-64 mb-2" />
        <Skeleton className="h-4 w-48 mb-6" />
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          <Skeleton className="h-40 rounded-xl" />
          <Skeleton className="h-40 rounded-xl" />
        </div>
      </div>
    )
  }

  if (hasNoData || taggedRows.length < 2) {
    return (
      <div className="rounded-2xl border border-[--jf-border] bg-[--jf-bg-card] shadow-[--jf-shadow-sm] p-6">
        <div className="flex items-start justify-between mb-4">
          <div>
            <h3
              className="text-base font-semibold"
              style={{ color: 'var(--jf-text-primary)' }}
            >
              CV A/B Performance Testing
            </h3>
            <p
              className="text-xs mt-0.5"
              style={{ color: 'var(--jf-text-muted)' }}
            >
              Which CV version gets more screenings?
            </p>
          </div>
        </div>
        <div className="flex flex-col items-center justify-center py-12 text-center space-y-3">
          <p style={{ color: 'var(--jf-text-muted)' }} className="text-sm">
            {taggedRows.length < 2
              ? 'Tag applications with at least 2 different CV versions to compare performance.'
              : 'No applications found for the selected date range.'}
          </p>
          <p
            className="text-xs"
            style={{ color: 'var(--jf-text-muted)' }}
          >
            Tag your applications with a CV version to start comparing.
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="rounded-2xl border border-[--jf-border] bg-[--jf-bg-card] shadow-[--jf-shadow-sm] p-6">
      {/* Header row */}
      <div className="flex items-start justify-between mb-5 gap-3 flex-wrap">
        <div>
          <h3
            className="text-base font-semibold"
            style={{ color: 'var(--jf-text-primary)' }}
          >
            CV A/B Performance Testing
          </h3>
          <p
            className="text-xs mt-0.5"
            style={{ color: 'var(--jf-text-muted)' }}
          >
            Which CV version gets more screenings?
          </p>
        </div>
        <div className="flex items-center gap-2">
          {/* Date filter for CV testing */}
          <DateFilterPills
            selectedIndex={presetIndex}
            onSelect={setPresetIndex}
          />
          {anyLowConfidence && (
            <span
              className="font-mono text-[11px] px-2.5 py-1 rounded-full whitespace-nowrap"
              style={{
                background: 'rgba(245,158,11,0.1)',
                color: '#F59E0B',
                border: '1px solid rgba(245,158,11,0.25)',
              }}
            >
              Low confidence — need 10+ apps/version
            </span>
          )}
        </div>
      </div>

      {/* Winner banner */}
      {hasWinner && (
        <div
          className="flex items-center justify-between px-4 py-3 rounded-lg mb-5 flex-wrap gap-2"
          style={{
            background: 'rgba(16,185,129,0.06)',
            border: '1px solid rgba(16,185,129,0.2)',
          }}
        >
          <div className="flex items-center gap-2 font-medium text-sm" style={{ color: '#10B981' }}>
            <svg
              viewBox="0 0 20 20"
              fill="currentColor"
              style={{ width: 16, height: 16 }}
            >
              <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
            </svg>
            {winnerName} is performing better
          </div>
          <div className="text-sm" style={{ color: 'var(--jf-text-secondary)' }}>
            {rateMultiplier > 1 ? `${rateMultiplier}\u00d7` : ''} higher screening rate{' '}
            &middot;{' '}
            <span className="font-mono">
              {winnerRate}% vs {loserRate}%
            </span>
          </div>
        </div>
      )}

      {/* Two-column A/B comparison */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
        {/* Version A */}
        {versionA && (
          <VersionColumn
            row={versionA}
            label="A"
            colorScheme="blue"
            isDefault={
              versionA.version_id
                ? cvVersionDefaults[versionA.version_id] ?? false
                : false
            }
            getStageRate={getStageRate}
          />
        )}
        {/* Version B */}
        {versionB && (
          <VersionColumn
            row={versionB}
            label="B"
            colorScheme="purple"
            isDefault={
              versionB.version_id
                ? cvVersionDefaults[versionB.version_id] ?? false
                : false
            }
            getStageRate={getStageRate}
          />
        )}
      </div>

      {/* Low confidence warning */}
      {anyLowConfidence && (
        <div
          className="mt-4 pt-4 text-sm flex items-start gap-1.5"
          style={{
            borderTop: '1px solid var(--jf-border)',
            color: 'var(--jf-text-muted)',
          }}
        >
          <svg
            viewBox="0 0 20 20"
            fill="currentColor"
            className="shrink-0 mt-0.5"
            style={{ width: 14, height: 14, color: 'var(--jf-warning)' }}
          >
            <path
              fillRule="evenodd"
              d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z"
              clipRule="evenodd"
            />
          </svg>
          <span>
            Results have low statistical confidence. Add more applications to each
            version to improve accuracy. Minimum 10 applications per version
            recommended.
          </span>
        </div>
      )}
    </div>
  )
}

function VersionColumn({
  row,
  label,
  colorScheme,
  isDefault,
  getStageRate,
}: {
  row: CVComparisonRow
  label: string
  colorScheme: 'blue' | 'purple'
  isDefault: boolean
  getStageRate: (row: CVComparisonRow, stageKey: string) => number
}) {
  const badgeStyles =
    colorScheme === 'blue'
      ? {
          background: 'rgba(37,99,235,0.08)',
          color: '#2563EB',
          border: '1px solid rgba(37,99,235,0.2)',
        }
      : {
          background: 'rgba(139,92,246,0.08)',
          color: '#8B5CF6',
          border: '1px solid rgba(139,92,246,0.2)',
        }

  return (
    <div>
      {/* Header badges */}
      <div className="flex items-center gap-2 mb-1">
        <span
          className="text-xs font-semibold px-2.5 py-1 rounded-full"
          style={badgeStyles}
        >
          {label} — {row.version_name}
        </span>
        {isDefault && (
          <span
            className="text-[10px] font-medium px-2 py-0.5 rounded-full"
            style={{
              background: 'var(--jf-border)',
              color: 'var(--jf-text-secondary)',
            }}
          >
            Default
          </span>
        )}
      </div>
      <p
        className="font-mono text-[11px] mb-3"
        style={{ color: 'var(--jf-text-muted)' }}
      >
        {row.total_applied} applications linked
      </p>

      {/* Stage rows */}
      <div className="space-y-2">
        {AB_STAGES.map(({ key, label: stageLabel }) => {
          const rate = getStageRate(row, key)
          const color = STAGE_HEX[key as keyof typeof STAGE_HEX] ?? '#94A3B8'
          const barWidth = Math.max(rate, rate > 0 ? 8 : 2)

          return (
            <div key={key} className="flex items-center gap-2">
              <span
                className="text-sm w-24 shrink-0"
                style={{ color: 'var(--jf-text-secondary)' }}
              >
                {stageLabel}
              </span>
              <div
                className="flex-1 h-8 rounded-lg relative overflow-hidden"
                style={{ background: 'var(--jf-border)' }}
              >
                <div
                  className="h-full rounded-lg absolute left-0 top-0 flex items-center justify-center"
                  style={{
                    width: `${barWidth}%`,
                    minWidth: rate > 0 ? 30 : 28,
                    background: color,
                  }}
                >
                  <span className="text-xs font-mono font-bold text-white">
                    {rate}%
                  </span>
                </div>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
