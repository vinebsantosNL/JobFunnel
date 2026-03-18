'use client'

import { useState } from 'react'
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

const FREE_TIER_LIMIT = 2

export function CVVersionList() {
  const [showArchived, setShowArchived] = useState(false)
  const [createOpen, setCreateOpen] = useState(false)

  const { data: allVersions, isLoading } = useCVVersions(true)
  const { tier } = useSubscription()

  const active = (allVersions ?? []).filter((v) => !v.is_archived)
  const archived = (allVersions ?? []).filter((v) => v.is_archived)
  const totalCount = (allVersions ?? []).length
  const atFreeLimit = tier === 'free' && totalCount >= FREE_TIER_LIMIT

  if (isLoading) {
    return (
      <div className="space-y-4">
        {[1, 2].map((n) => (
          <div key={n} className="h-32 bg-gray-100 rounded-lg animate-pulse" />
        ))}
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-semibold text-gray-900">CV Versions</h2>
          <p className="text-sm text-gray-500 mt-0.5">
            Manage and compare your CV versions
          </p>
        </div>
        <Button
          onClick={() => setCreateOpen(true)}
          disabled={atFreeLimit}
          title={atFreeLimit ? 'Upgrade to Pro for unlimited CV versions' : undefined}
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

      {/* Active versions */}
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
        <div className="grid gap-4 sm:grid-cols-2">
          {active.map((version) => (
            <CVVersionCard key={version.id} version={version} />
          ))}
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
            <div className="grid gap-4 sm:grid-cols-2">
              {archived.map((version) => (
                <CVVersionCard key={version.id} version={version} />
              ))}
            </div>
          )}
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
