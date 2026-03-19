'use client'

import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { useCVVersions } from '@/hooks/useCVVersions'
import { useSubscription } from '@/hooks/use-subscription'
import { CVVersionCard } from './CVVersionCard'
import { CVVersionForm } from './CVVersionForm'
import { Button } from '@/components/ui/button'
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet'
import type { CVComparisonRow } from '@/app/api/analytics/cv-comparison/route'

const FREE_TIER_LIMIT = 2

async function fetchCVComparison(): Promise<CVComparisonRow[]> {
  const res = await fetch('/api/analytics/cv-comparison')
  if (!res.ok) return []
  return res.json()
}

export function CVVersionList() {
  const [showArchived, setShowArchived] = useState(false)
  const [createOpen, setCreateOpen] = useState(false)

  const { data: allVersions, isLoading } = useCVVersions(true)
  const { tier } = useSubscription()

  const { data: comparisonRows } = useQuery({
    queryKey: ['cv-comparison-list'],
    queryFn: fetchCVComparison,
  })

  // Build stats lookup by version_id
  const statsMap: Record<string, CVComparisonRow> = {}
  for (const row of comparisonRows ?? []) {
    if (row.version_id) statsMap[row.version_id] = row
  }

  const active = (allVersions ?? []).filter((v) => !v.is_archived)
  const archived = (allVersions ?? []).filter((v) => v.is_archived)
  const totalCount = (allVersions ?? []).length
  const atFreeLimit = tier === 'free' && totalCount >= FREE_TIER_LIMIT

  if (isLoading) {
    return (
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {[1, 2, 3].map((n) => (
          <div key={n} className="h-48 bg-gray-100 rounded-xl animate-pulse" />
        ))}
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <p className="text-sm text-gray-500">
          Create and manage different CV variants to find what works best
        </p>
        <Button
          onClick={() => setCreateOpen(true)}
          disabled={atFreeLimit}
          title={atFreeLimit ? 'Upgrade to Pro for unlimited CV versions' : undefined}
          className="bg-blue-600 hover:bg-blue-700 text-white flex-shrink-0 ml-4"
        >
          + New Version
        </Button>
      </div>

      {/* Free tier warning */}
      {atFreeLimit && (
        <div className="rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800">
          You&apos;ve reached the free tier limit of {FREE_TIER_LIMIT} CV versions.{' '}
          <span className="font-medium">Upgrade to Pro</span> for unlimited versions.
        </div>
      )}

      {/* Active versions grid */}
      {active.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-gray-200 py-16 text-center">
          <span className="text-4xl mb-3">📄</span>
          <p className="text-gray-600 font-medium">No CV versions yet</p>
          <p className="text-sm text-gray-400 mt-1 mb-4">
            Create your first version to start tracking which CV performs best.
          </p>
          <Button onClick={() => setCreateOpen(true)}>+ New Version</Button>
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {active.map((version) => (
            <CVVersionCard
              key={version.id}
              version={version}
              stats={statsMap[version.id]}
            />
          ))}

          {/* "Create new" placeholder card */}
          {!atFreeLimit && (
            <button
              onClick={() => setCreateOpen(true)}
              className="rounded-xl border-2 border-dashed border-gray-200 flex flex-col items-center justify-center gap-2 py-12 text-gray-400 hover:border-blue-300 hover:text-blue-400 transition-colors min-h-[200px]"
            >
              <span className="text-2xl font-light">+</span>
              <span className="text-sm">Create a new CV version</span>
            </button>
          )}
        </div>
      )}

      {/* Archived section */}
      {archived.length > 0 && (
        <div className="space-y-3">
          <button
            onClick={() => setShowArchived((prev) => !prev)}
            className="text-sm text-gray-500 hover:text-gray-700 font-medium flex items-center gap-1"
          >
            <span>{showArchived ? '▾' : '▸'}</span>
            {showArchived ? 'Hide' : 'Show'} archived ({archived.length})
          </button>
          {showArchived && (
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {archived.map((version) => (
                <CVVersionCard
                  key={version.id}
                  version={version}
                  stats={statsMap[version.id]}
                />
              ))}
            </div>
          )}
        </div>
      )}

      {/* Strategy Insight + AI Optimizer */}
      {active.length >= 1 && (
        <div className="grid grid-cols-1 lg:grid-cols-[1fr_280px] gap-4 mt-6">
          {/* Strategy Insight */}
          <div className="bg-blue-600 text-white rounded-xl p-6">
            <h3 className="text-lg font-bold mb-2">Strategy Insight</h3>
            <p className="text-sm text-blue-100 leading-relaxed">
              Versions with localized keywords are seeing higher response rates. Consider creating a targeted variant for specific markets.
            </p>
            <div className="flex gap-3 mt-4">
              <button className="bg-white text-blue-600 text-sm font-medium px-4 py-2 rounded-lg hover:bg-blue-50 transition-colors">
                Apply Recommendation
              </button>
              <button className="border border-white text-white text-sm font-medium px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors">
                Dismiss
              </button>
            </div>
          </div>
          {/* AI Optimizer placeholder */}
          <div className="bg-white border border-gray-200 rounded-xl p-6 flex flex-col items-center justify-center text-center">
            <div className="w-12 h-12 bg-blue-50 rounded-full flex items-center justify-center mb-3">
              <span className="text-blue-600 text-xl">✦</span>
            </div>
            <h3 className="font-semibold text-gray-900 mb-1">AI Optimizer</h3>
            <p className="text-sm text-gray-500 mb-4">Let AI analyze your CV versions and suggest the best one for each job post automatically.</p>
            <div className="w-full bg-gray-100 rounded-full h-1.5">
              <div className="bg-blue-600 h-1.5 rounded-full" style={{ width: '75%' }} />
            </div>
            <p className="text-xs text-gray-400 mt-1">75% OPTIMIZED</p>
          </div>
        </div>
      )}

      {/* Create Sheet */}
      <Sheet open={createOpen} onOpenChange={setCreateOpen}>
        <SheetContent>
          <SheetHeader>
            <SheetTitle>New CV Version</SheetTitle>
          </SheetHeader>
          <div className="mt-6">
            <CVVersionForm
              onSuccess={() => setCreateOpen(false)}
              onCancel={() => setCreateOpen(false)}
            />
          </div>
        </SheetContent>
      </Sheet>
    </div>
  )
}
