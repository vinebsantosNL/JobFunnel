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
const NEW_RESUME_HREF = '/app/cv-versions/new'

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
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {[1, 2, 3].map((n) => (
            <div key={n} className="h-64 bg-gray-100 rounded-xl animate-pulse" />
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-5">
      {/* Filter pills + action */}
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-1.5">
          {(['active', 'all', 'archived'] as FilterTab[]).map((tab) => {
            const label = tab === 'active' ? 'Active' : tab === 'all' ? 'All' : 'Archived'
            const count =
              tab === 'active' ? activeCount : tab === 'all' ? (allVersions ?? []).length : archived.length
            return (
              <button
                key={tab}
                onClick={() => setFilter(tab)}
                className={cn(
                  'flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-medium transition-colors',
                  filter === tab
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                )}
              >
                {label}
                <span
                  className={cn(
                    'text-xs px-1.5 py-0.5 rounded-full font-semibold leading-none',
                    filter === tab ? 'bg-blue-500 text-white' : 'bg-white text-gray-500'
                  )}
                >
                  {count}
                </span>
              </button>
            )
          })}
        </div>

        {atFreeLimit ? (
          <Button
            disabled
            size="sm"
            className="flex-shrink-0"
            title="Upgrade to Pro for unlimited resume versions"
          >
            + New resume
          </Button>
        ) : (
          <Link href={NEW_RESUME_HREF} className={cn(buttonVariants({ size: 'sm' }), 'flex-shrink-0')}>
            + New resume
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

      {/* Grid */}
      {displayVersions.length === 0 && !atFreeLimit ? (
        <EmptyState filter={filter} />
      ) : (
        <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
          {displayVersions.map((version) => (
            <CVVersionCard
              key={version.id}
              version={version}
              stats={statsMap[version.id]}
            />
          ))}

          {/* "+ New" dashed card — shown in active/all when not at limit */}
          {(filter === 'active' || filter === 'all') && !atFreeLimit && (
            <Link
              href={NEW_RESUME_HREF}
              className="rounded-xl border-2 border-dashed border-gray-200 flex flex-col items-center justify-center gap-2 py-12 text-gray-400 hover:border-blue-300 hover:text-blue-400 transition-colors min-h-[200px]"
            >
              <span className="text-2xl font-light leading-none">+</span>
              <span className="text-sm">New resume version</span>
            </Link>
          )}

          {/* Pro-locked placeholder for free users at limit */}
          {(filter === 'active' || filter === 'all') && atFreeLimit && <ProLockedCard />}
        </div>
      )}

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
    <div className="relative rounded-xl border-2 border-dashed border-gray-200 min-h-[200px] overflow-hidden flex flex-col items-center justify-center gap-3 p-6 text-center">
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
