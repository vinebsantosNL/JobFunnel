'use client'

import { useQuery } from '@tanstack/react-query'
import Link from 'next/link'
import { Skeleton } from '@/components/ui/skeleton'
import { useUserStore } from '@/store/userStore'
import { STAGE_HEX } from '@/lib/stages'
import type { CVComparisonRow } from '@/lib/services/analyticsService'
import type { CVVersion } from '@/types/database.types'

const RESUME_STAGES = [
  { key: 'screening', label: 'Screening', color: STAGE_HEX.screening },
  { key: 'interviewing', label: 'Interviewing', color: STAGE_HEX.interviewing },
  { key: 'offer', label: 'Offer', color: STAGE_HEX.offer },
] as const

async function fetchCVComparison(): Promise<CVComparisonRow[]> {
  const res = await fetch('/api/analytics/cv-comparison')
  if (!res.ok) throw new Error('Failed to fetch CV comparison data')
  return res.json()
}

async function fetchActiveVersions(): Promise<CVVersion[]> {
  const res = await fetch('/api/cv-versions')
  if (!res.ok) throw new Error('Failed to fetch CV versions')
  return res.json()
}

function getStageRate(row: CVComparisonRow, key: string): number {
  switch (key) {
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

function LockedResumePanel() {
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
          Resume Performance
        </p>
        <p
          className="text-sm mb-4 max-w-xs"
          style={{ color: 'var(--jf-text-secondary)' }}
        >
          Track funnel conversion rates for each resume version. Available on Pro.
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

  if (profile?.subscription_tier !== 'pro') {
    return <LockedResumePanel />
  }

  return <ResumePerformanceContent />
}

function ResumePerformanceContent() {
  const { data: activeVersions, isLoading: versionsLoading } = useQuery({
    queryKey: ['cv-versions-active'],
    queryFn: fetchActiveVersions,
  })

  const { data: comparisonRows, isLoading: comparisonLoading } = useQuery({
    queryKey: ['cv-comparison-all'],
    queryFn: fetchCVComparison,
  })

  const isLoading = versionsLoading || comparisonLoading

  // Build a lookup map from version_id → comparison row
  const rowMap = new Map<string, CVComparisonRow>()
  for (const row of comparisonRows ?? []) {
    if (row.version_id) rowMap.set(row.version_id, row)
  }

  const versions = (activeVersions ?? []).filter((v) => !v.is_archived)
  const hasNoVersions = !versionsLoading && versions.length === 0

  if (isLoading) {
    return (
      <div className="rounded-2xl border border-[--jf-border] bg-[--jf-bg-card] shadow-[--jf-shadow-sm] p-6">
        <Skeleton className="h-6 w-52 mb-2" />
        <Skeleton className="h-4 w-40 mb-6" />
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Skeleton className="h-36 rounded-xl" />
          <Skeleton className="h-36 rounded-xl" />
        </div>
      </div>
    )
  }

  return (
    <div className="rounded-2xl border border-[--jf-border] bg-[--jf-bg-card] shadow-[--jf-shadow-sm] p-6">
      {/* Header */}
      <div className="mb-5">
        <h3
          className="text-base font-semibold"
          style={{ color: 'var(--jf-text-primary)' }}
        >
          Resume Performance
        </h3>
        <p
          className="text-xs mt-0.5"
          style={{ color: 'var(--jf-text-muted)' }}
        >
          Funnel conversion rates by resume version · all time
        </p>
      </div>

      {hasNoVersions ? (
        <div className="flex flex-col items-center justify-center py-10 text-center gap-3">
          <p className="text-sm" style={{ color: 'var(--jf-text-muted)' }}>
            Create your first resume version to start tracking performance
          </p>
          <Link
            href="/cv-versions"
            className="text-sm font-medium hover:opacity-80 underline underline-offset-2 transition-opacity"
            style={{ color: 'var(--jf-interactive)' }}
          >
            Go to Resume Builder
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {versions.map((version) => {
            const row = rowMap.get(version.id) ?? null

            return (
              <div
                key={version.id}
                className="rounded-xl p-4"
                style={{
                  border: '1px solid var(--jf-border)',
                  background: 'var(--jf-bg-subtle, #F8FAFC)',
                }}
              >
                {/* Version header */}
                <div className="flex items-center gap-2 mb-1 flex-wrap">
                  <span
                    className="text-xs font-semibold px-2.5 py-1 rounded-full"
                    style={{
                      background: 'rgba(37,99,235,0.08)',
                      color: 'var(--jf-interactive)',
                      border: '1px solid rgba(37,99,235,0.2)',
                    }}
                  >
                    {version.name}
                  </span>
                  {version.is_default && (
                    <span
                      className="text-[10px] font-medium px-2 py-0.5 rounded-full"
                      style={{
                        background: 'var(--jf-success-tint)',
                        color: 'var(--jf-success)',
                        border: '1px solid var(--jf-success-border)',
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
                  {row ? `${row.total_applied} application${row.total_applied !== 1 ? 's' : ''} linked` : 'No applications linked yet'}
                </p>

                {/* Stage bars */}
                {row ? (
                  <div className="space-y-2">
                    {RESUME_STAGES.map(({ key, label, color }) => {
                      const rate = getStageRate(row, key)
                      const barWidth = Math.max(rate, rate > 0 ? 6 : 0)

                      return (
                        <div key={key} className="flex items-center gap-3">
                          <span
                            className="text-[12px] w-22 shrink-0"
                            style={{ color: 'var(--jf-text-secondary)', width: 88 }}
                          >
                            {label}
                          </span>
                          <div
                            className="flex-1 h-7 rounded-lg relative overflow-hidden"
                            style={{ background: 'var(--jf-border)' }}
                          >
                            <div
                              className="h-full rounded-lg absolute left-0 top-0 flex items-center justify-center transition-all duration-500"
                              style={{
                                width: `${barWidth}%`,
                                minWidth: rate > 0 ? 32 : 0,
                                background: color,
                              }}
                            >
                              {rate > 0 && (
                                <span className="text-[11px] font-mono font-bold text-white">
                                  {rate}%
                                </span>
                              )}
                            </div>
                            {rate === 0 && (
                              <span
                                className="absolute inset-0 flex items-center pl-2 text-[11px] font-mono"
                                style={{ color: 'var(--jf-text-muted)' }}
                              >
                                0%
                              </span>
                            )}
                          </div>
                        </div>
                      )
                    })}
                  </div>
                ) : (
                  <div
                    className="text-xs py-3 text-center rounded-lg"
                    style={{
                      color: 'var(--jf-text-muted)',
                      border: '1px dashed var(--jf-border)',
                    }}
                  >
                    Tag applications with this version to see funnel data
                  </div>
                )}
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
