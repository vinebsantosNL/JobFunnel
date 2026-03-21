'use client'

import { useState } from 'react'
import { FileText } from 'lucide-react'
import { useQuery } from '@tanstack/react-query'
import { useCVVersions } from '@/hooks/useCVVersions'
import { useSubscription } from '@/hooks/use-subscription'
import { CVVersionCard } from './CVVersionCard'
import { CVVersionForm } from './CVVersionForm'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
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
          Create and compare resume variants to find what converts best.
        </p>
        <Button
          onClick={() => setCreateOpen(true)}
          disabled={atFreeLimit}
          title={atFreeLimit ? 'Upgrade to Pro for unlimited resume versions' : undefined}
          className="flex-shrink-0 ml-4"
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
          <div className="w-12 h-12 bg-gray-100 rounded-2xl flex items-center justify-center mb-4">
            <FileText className="w-6 h-6 text-gray-300" strokeWidth={1.5} />
          </div>
          <p className="text-gray-700 font-semibold mb-1">No resume versions yet</p>
          <p className="text-sm text-gray-400 mb-5">
            Create your first version to start tracking which resume performs best.
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

      {/* Create Dialog */}
      <Dialog open={createOpen} onOpenChange={setCreateOpen}>
        <DialogContent size="md">
          <DialogHeader>
            <DialogTitle>New Resume Version</DialogTitle>
          </DialogHeader>
          <CVVersionForm
            onSuccess={() => setCreateOpen(false)}
            onCancel={() => setCreateOpen(false)}
          />
        </DialogContent>
      </Dialog>
    </div>
  )
}
