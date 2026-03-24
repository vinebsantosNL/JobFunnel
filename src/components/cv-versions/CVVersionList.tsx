'use client'

import { useState } from 'react'
import Link from 'next/link'
import { FileText, Lock, Sparkles } from 'lucide-react'
import { useQuery } from '@tanstack/react-query'
import { useCVVersions } from '@/hooks/useCVVersions'
import { useSubscription } from '@/hooks/use-subscription'
import { CVVersionCard } from './CVVersionCard'
import { Button, buttonVariants } from '@/components/ui/button'
import type { CVComparisonRow } from '@/lib/services/analyticsService'
import { cn } from '@/lib/utils'

const FREE_TIER_LIMIT = 2
const NEW_RESUME_HREF = '/cv-versions/new'

type FilterTab = 'all' | 'active' | 'archived'

async function fetchCVComparison(): Promise<CVComparisonRow[]> {
  const res = await fetch('/api/analytics/cv-comparison')
  if (!res.ok) return []
  return res.json()
}

export function CVVersionList() {
  const [filter, setFilter] = useState<FilterTab>('active')

  const { data: allVersions, isLoading } = useCVVersions(true)
  const { tier } = useSubscription()

  const { data: comparisonRows } = useQuery({
    queryKey: ['cv-comparison-list'],
    queryFn: fetchCVComparison,
  })

  // Stats lookup by version_id
  const statsMap: Record<string, CVComparisonRow> = {}
  for (const row of comparisonRows ?? []) {
    if (row.version_id) statsMap[row.version_id] = row
  }

  const active = (allVersions ?? []).filter((v) => !v.is_archived)
  const archived = (allVersions ?? []).filter((v) => v.is_archived)
  const activeCount = active.length
  const atFreeLimit = tier === 'free' && activeCount >= FREE_TIER_LIMIT

  const displayVersions =
    filter === 'all'
      ? (allVersions ?? [])
      : filter === 'active'
      ? active
      : archived

  if (isLoading) {
    return (
      <div className="space-y-4">
        <div className="flex gap-2">
          {['All', 'Active', 'Archived'].map((t) => (
            <div key={t} className="h-8 w-16 bg-gray-100 rounded-full animate-pulse" />
          ))}
        </div>
        <div className="grid gap-[14px] grid-cols-1 sm:grid-cols-2">
          {[1, 2].map((n) => (
            <div key={n} className="h-64 bg-gray-100 rounded-[16px] animate-pulse" />
          ))}
        </div>
      </div>
    )
  }

  // For Performance Comparison, pick first 2 active (non-archived) versions
  const comparisonVersions = active.slice(0, 2)
  const hasComparison = comparisonVersions.length >= 2

  return (
    <div className="flex flex-col gap-5">
      {/* ─── Section Heading Row ─────────────────────────────────────────── */}
      <div className="flex items-center justify-between gap-3">
        <div>
          <h2
            className="font-bold"
            style={{ fontSize: '16px', color: 'var(--jf-text-primary)' }}
          >
            CV Versions
          </h2>
          <p
            style={{ fontSize: '12px', color: 'var(--jf-text-muted)', marginTop: '2px' }}
          >
            Manage and compare your CV versions
          </p>
        </div>
        {atFreeLimit ? (
          <Button
            disabled
            className="flex-shrink-0 rounded-xl min-h-[44px]"
            title="Upgrade to Pro for unlimited resume versions"
          >
            + New Version
          </Button>
        ) : (
          <Link
            href={NEW_RESUME_HREF}
            className={cn(
              buttonVariants(),
              'flex-shrink-0 rounded-xl min-h-[44px] inline-flex items-center gap-1.5'
            )}
          >
            <svg className="w-4 h-4" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clipRule="evenodd" />
            </svg>
            New Version
          </Link>
        )}
      </div>

      {/* Free tier warning */}
      {atFreeLimit && (
        <div className="rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800">
          You&apos;re using {activeCount}/{FREE_TIER_LIMIT} CV versions.{' '}
          <span className="font-semibold">Upgrade to Pro</span> to track unlimited versions and see which one
          gets you more interviews.{' '}
          <button className="underline font-medium hover:text-amber-900">Upgrade · €15/mo</button>
        </div>
      )}

      {/* ─── CV Cards Grid ───────────────────────────────────────────────── */}
      {displayVersions.length === 0 && !atFreeLimit ? (
        <EmptyState filter={filter} />
      ) : (
        <div className="grid gap-[14px] grid-cols-1 sm:grid-cols-2">
          {displayVersions.map((version, idx) => (
            <CVVersionCard
              key={version.id}
              version={version}
              stats={statsMap[version.id]}
              index={idx}
            />
          ))}

          {/* Pro-locked placeholder for free users at limit */}
          {(filter === 'active' || filter === 'all') && atFreeLimit && <ProLockedCard />}
        </div>
      )}

      {/* ─── Performance Comparison Card ─────────────────────────────────── */}
      {hasComparison && (
        <PerformanceComparison
          versionA={comparisonVersions[0]}
          versionB={comparisonVersions[1]}
          statsA={statsMap[comparisonVersions[0].id]}
          statsB={statsMap[comparisonVersions[1].id]}
        />
      )}
    </div>
  )
}

// ─── Performance Comparison ──────────────────────────────────────────────────

function PerformanceComparison({
  versionA,
  versionB,
  statsA,
  statsB,
}: {
  versionA: { id: string; name: string; is_default: boolean }
  versionB: { id: string; name: string; is_default: boolean }
  statsA?: CVComparisonRow
  statsB?: CVComparisonRow
}) {
  const appsA = statsA?.total_applied ?? 0
  const appsB = statsB?.total_applied ?? 0
  const lowConfidence = appsA < 10 || appsB < 10

  const screenA = statsA?.screening_rate ?? 0
  const screenB = statsB?.screening_rate ?? 0
  const interviewA = statsA?.interview_rate ?? 0
  const interviewB = statsB?.interview_rate ?? 0
  const offerA = statsA?.overall_conversion ?? 0
  const offerB = statsB?.overall_conversion ?? 0

  return (
    <div
      className="rounded-[16px] border p-5 flex flex-col gap-4"
      style={{
        background: 'var(--jf-bg-card)',
        borderColor: 'var(--jf-border)',
        boxShadow: 'var(--jf-shadow-sm)',
      }}
    >
      {/* Header row */}
      <div className="flex items-center justify-between">
        <h3
          className="font-semibold"
          style={{ fontSize: '14px', color: 'var(--jf-text-primary)' }}
        >
          Performance Comparison
        </h3>
        {lowConfidence && (
          <span
            style={{
              fontFamily: 'var(--font-dm-mono, monospace)',
              fontSize: '10px',
              padding: '3px 8px',
              borderRadius: '100px',
              background: 'rgba(245,158,11,0.08)',
              border: '1px solid rgba(245,158,11,0.25)',
              color: 'var(--jf-warning)',
            }}
          >
            Low confidence — need 10+ apps per version
          </span>
        )}
      </div>

      {/* AB comparison grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {/* Column A */}
        <div>
          <div className="flex items-center gap-2 mb-[14px] flex-wrap">
            <span
              style={{
                fontFamily: 'var(--font-dm-mono, monospace)',
                fontSize: '11px',
                padding: '3px 10px',
                borderRadius: '100px',
                background: 'rgba(37,99,235,0.08)',
                border: '1px solid rgba(37,99,235,0.2)',
                color: 'var(--jf-interactive)',
              }}
            >
              {versionA.name} ({appsA} apps)
            </span>
            {versionA.is_default && (
              <span
                style={{
                  fontFamily: 'var(--font-dm-mono, monospace)',
                  fontSize: '10px',
                  padding: '3px 8px',
                  borderRadius: '100px',
                  background: 'rgba(16,185,129,0.1)',
                  border: '1px solid rgba(16,185,129,0.25)',
                  color: 'var(--jf-success)',
                }}
              >
                Default
              </span>
            )}
          </div>
          <ComparisonMetrics
            screening={screenA}
            interviewing={interviewA}
            offer={offerA}
          />
        </div>

        {/* Column B */}
        <div>
          <div className="flex items-center gap-2 mb-[14px] flex-wrap">
            <span
              style={{
                fontFamily: 'var(--font-dm-mono, monospace)',
                fontSize: '11px',
                padding: '3px 10px',
                borderRadius: '100px',
                background: 'rgba(139,92,246,0.08)',
                border: '1px solid rgba(139,92,246,0.2)',
                color: 'var(--jf-purple)',
              }}
            >
              {versionB.name} ({appsB} apps)
            </span>
            {versionB.is_default && (
              <span
                style={{
                  fontFamily: 'var(--font-dm-mono, monospace)',
                  fontSize: '10px',
                  padding: '3px 8px',
                  borderRadius: '100px',
                  background: 'rgba(16,185,129,0.1)',
                  border: '1px solid rgba(16,185,129,0.25)',
                  color: 'var(--jf-success)',
                }}
              >
                Default
              </span>
            )}
          </div>
          <ComparisonMetrics
            screening={screenB}
            interviewing={interviewB}
            offer={offerB}
          />
        </div>
      </div>
    </div>
  )
}

function ComparisonMetrics({
  screening,
  interviewing,
  offer,
}: {
  screening: number
  interviewing: number
  offer: number
}) {
  const rows: Array<{ label: string; value: number; color: string }> = [
    { label: 'Screening', value: screening, color: '#8B5CF6' },
    { label: 'Interviewing', value: interviewing, color: '#F59E0B' },
    { label: 'Offer', value: offer, color: '#10B981' },
  ]

  return (
    <div className="flex flex-col gap-[10px]">
      {rows.map((row) => (
        <div key={row.label} className="flex items-center gap-[10px]">
          <span
            className="font-medium flex-shrink-0"
            style={{
              fontSize: '12px',
              color: 'var(--jf-text-secondary)',
              width: '80px',
            }}
          >
            {row.label}
          </span>
          <div
            className="flex-1 overflow-hidden"
            style={{
              height: '20px',
              background: 'var(--jf-bg-subtle, #F8FAFC)',
              borderRadius: '5px',
            }}
          >
            <div
              className="flex items-center"
              style={{
                height: '100%',
                borderRadius: '5px',
                background: row.color,
                width: `${Math.max(row.value, 0)}%`,
                minWidth: row.value > 0 ? '28px' : '0px',
                padding: '0 8px',
              }}
            >
              {row.value > 0 && (
                <span
                  className="font-medium text-white"
                  style={{
                    fontFamily: 'var(--font-dm-mono, monospace)',
                    fontSize: '10px',
                  }}
                >
                  {row.value}%
                </span>
              )}
            </div>
          </div>
        </div>
      ))}
    </div>
  )
}

// ─── Empty state ───────────────────────────────────────────────────────────────

function EmptyState({ filter }: { filter: FilterTab }) {
  if (filter === 'archived') {
    return (
      <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-gray-200 py-16 text-center">
        <div className="w-12 h-12 bg-gray-100 rounded-2xl flex items-center justify-center mb-4">
          <Lock className="w-5 h-5 text-gray-300" strokeWidth={1.5} />
        </div>
        <p className="text-gray-700 font-semibold mb-1">No archived resumes</p>
        <p className="text-sm text-gray-400">Archived versions will appear here.</p>
      </div>
    )
  }

  return (
    <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-gray-200 py-16 text-center">
      <div className="w-12 h-12 bg-gray-100 rounded-2xl flex items-center justify-center mb-4">
        <FileText className="w-6 h-6 text-gray-300" strokeWidth={1.5} />
      </div>
      <p className="text-gray-700 font-semibold mb-1">Your resume library is empty</p>
      <p className="text-sm text-gray-400 mb-5 max-w-xs">
        Build an ATS-validated resume tailored to your target roles and track which version gets you the most interviews.
      </p>
      <Link href={NEW_RESUME_HREF} className={buttonVariants()}>Create first resume</Link>
    </div>
  )
}

// ─── Pro locked placeholder ────────────────────────────────────────────────────

function ProLockedCard() {
  return (
    <div className="relative rounded-[16px] border-2 border-dashed border-gray-200 min-h-[200px] overflow-hidden flex flex-col items-center justify-center gap-3 p-6 text-center">
      {/* Blurred fake content */}
      <div className="absolute inset-0 flex flex-col gap-2 p-4 pointer-events-none select-none">
        <div className="h-[90px] rounded-lg bg-gray-100" />
        <div className="h-3 bg-gray-100 rounded-sm w-2/3" />
        <div className="h-2 bg-gray-100 rounded-sm w-1/2" />
        <div className="grid grid-cols-3 gap-2 mt-1">
          {[1, 2, 3].map((n) => <div key={n} className="h-8 bg-gray-100 rounded-md" />)}
        </div>
      </div>
      <div className="absolute inset-0 bg-white/80 backdrop-blur-[2px]" />

      {/* Overlay content */}
      <div className="relative z-10 flex flex-col items-center gap-2">
        <div className="w-10 h-10 bg-blue-50 rounded-full flex items-center justify-center">
          <Sparkles className="w-5 h-5 text-blue-600" />
        </div>
        <p className="text-sm font-semibold text-gray-800">Unlock unlimited CVs</p>
        <p className="text-xs text-gray-500 max-w-[160px]">
          See which version gets you more interviews.
        </p>
        <button className="mt-1 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 px-4 py-2 rounded-lg transition-colors min-h-[44px]">
          Upgrade to Pro · €15/mo
        </button>
      </div>
    </div>
  )
}
