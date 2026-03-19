'use client'

import { useState } from 'react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog'
import { CVVersionForm } from './CVVersionForm'
import { useUpdateCVVersion, useDeleteCVVersion } from '@/hooks/useCVVersions'
import type { CVVersion } from '@/types/database'
import { cn } from '@/lib/utils'

const LOW_DATA_THRESHOLD = 10

interface CVVersionStats {
  total_applied: number
  screening_rate: number | null
  avg_days_in_applied: number | null
}

interface CVVersionCardProps {
  version: CVVersion
  stats?: CVVersionStats
}

function ScreenRateValue({ rate, count }: { rate: number | null; count: number }) {
  if (count < LOW_DATA_THRESHOLD || rate === null) {
    return <span className="text-xl font-bold text-gray-300">—</span>
  }
  const color = rate >= 20 ? 'text-green-600' : 'text-amber-500'
  return <span className={cn('text-xl font-bold', color)}>{rate}%</span>
}

export function CVVersionCard({ version, stats }: CVVersionCardProps) {
  const [editOpen, setEditOpen] = useState(false)
  const [deleteOpen, setDeleteOpen] = useState(false)

  const updateMutation = useUpdateCVVersion()
  const deleteMutation = useDeleteCVVersion()

  const totalApplied = stats?.total_applied ?? 0
  const isLowData = totalApplied < LOW_DATA_THRESHOLD && totalApplied > 0
  const hasNoApps = totalApplied === 0

  async function handleArchiveToggle() {
    await updateMutation.mutateAsync({
      id: version.id,
      input: { is_archived: !version.is_archived },
    })
  }

  async function handleSetDefault() {
    await updateMutation.mutateAsync({
      id: version.id,
      input: { is_default: true },
    })
  }

  async function handleDelete() {
    await deleteMutation.mutateAsync(version.id)
    setDeleteOpen(false)
  }

  // Determine top pills
  const topPills: string[] = []
  if (version.tags.length > 0) {
    topPills.push(...version.tags)
  } else if (version.is_default) {
    topPills.push('DEFAULT')
  }

  return (
    <>
      <div
        className={cn(
          'rounded-xl border bg-white p-5 flex flex-col gap-4 transition-all',
          version.is_default
            ? 'border-2 border-blue-500 shadow-sm'
            : 'border border-gray-200',
          version.is_archived && 'opacity-60'
        )}
      >
        {/* Top pills */}
        {topPills.length > 0 && (
          <div className="flex flex-wrap gap-1.5">
            {topPills.map((tag) => (
              <span
                key={tag}
                className="text-xs uppercase tracking-wider text-gray-500 bg-gray-100 px-2.5 py-0.5 rounded-full font-medium"
              >
                {tag}
              </span>
            ))}
          </div>
        )}

        {/* Header */}
        <div className="flex items-start justify-between gap-2">
          <h3 className="text-lg font-bold text-gray-900 leading-snug">{version.name}</h3>
          <div className="flex items-center gap-1 flex-shrink-0">
            {version.is_archived && (
              <Badge variant="secondary" className="text-xs">Archived</Badge>
            )}
          </div>
        </div>

        {/* Description */}
        {version.description && (
          <p className="text-sm text-gray-500 leading-relaxed -mt-2">{version.description}</p>
        )}

        {/* Stats */}
        <div className="border-t border-gray-100 pt-4">
          <div className="grid grid-cols-3 gap-4">
            {/* Applications */}
            <div>
              <p className="text-xl font-bold text-gray-900">{totalApplied}</p>
              <p className="text-xs text-gray-400 mt-0.5 whitespace-nowrap">Applications</p>
            </div>

            {/* Screen Rate */}
            <div>
              <ScreenRateValue rate={stats?.screening_rate ?? null} count={totalApplied} />
              <p className="text-xs text-gray-400 mt-0.5 whitespace-nowrap">Screen Rate</p>
            </div>

            {/* Avg Response */}
            <div>
              {totalApplied < LOW_DATA_THRESHOLD || stats?.avg_days_in_applied === null ? (
                <span className="text-xl font-bold text-gray-300">—</span>
              ) : (
                <span className="text-xl font-bold text-gray-900">
                  {stats?.avg_days_in_applied}d
                </span>
              )}
              <p className="text-xs text-gray-400 mt-0.5 whitespace-nowrap">Avg Response</p>
            </div>
          </div>

          {/* Low data warning */}
          {isLowData && (
            <div className="mt-3 inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-amber-50 border border-amber-200 text-xs text-amber-700">
              ⚠ Too few applications for reliable data
            </div>
          )}
        </div>

        {/* Overlapping avatar circles */}
        <div className="flex items-center">
          <div className="w-6 h-6 rounded-full bg-blue-200" />
          <div className="w-6 h-6 rounded-full bg-green-200 -ml-1" />
          <div className="w-6 h-6 rounded-full bg-purple-200 -ml-1" />
        </div>

        {/* Actions */}
        <div className="flex items-center justify-between pt-1">
          <span className="text-sm text-blue-600 hover:text-blue-700 font-medium cursor-pointer">
            View Full Stats →
          </span>
          <div className="flex items-center gap-3">
            <button
              onClick={() => setEditOpen(true)}
              className="text-sm text-gray-500 hover:text-gray-700 transition-colors"
            >
              Edit
            </button>
            {!version.is_default && (
              <button
                onClick={handleSetDefault}
                disabled={updateMutation.isPending}
                className="text-sm text-gray-500 hover:text-gray-700 transition-colors"
              >
                Set Default
              </button>
            )}
            {hasNoApps ? (
              <button
                onClick={() => setDeleteOpen(true)}
                className="text-sm text-red-500 hover:text-red-600 transition-colors"
              >
                Delete
              </button>
            ) : (
              <button
                onClick={handleArchiveToggle}
                disabled={updateMutation.isPending}
                className="text-sm text-gray-500 hover:text-gray-700 transition-colors"
              >
                {version.is_archived ? 'Unarchive' : 'Archive'}
              </button>
            )}
          </div>
        </div>

        {updateMutation.error && (
          <p className="text-xs text-red-500">{updateMutation.error.message}</p>
        )}
      </div>

      {/* Edit Sheet */}
      <Sheet open={editOpen} onOpenChange={setEditOpen}>
        <SheetContent>
          <SheetHeader>
            <SheetTitle>Edit CV Version</SheetTitle>
          </SheetHeader>
          <div className="mt-6">
            <CVVersionForm
              version={version}
              onSuccess={() => setEditOpen(false)}
              onCancel={() => setEditOpen(false)}
            />
          </div>
        </SheetContent>
      </Sheet>

      {/* Delete Confirmation Dialog */}
      <Dialog open={deleteOpen} onOpenChange={setDeleteOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete CV version?</DialogTitle>
            <DialogDescription>
              This will permanently delete &ldquo;{version.name}&rdquo;. This action cannot be
              undone.
            </DialogDescription>
          </DialogHeader>
          <div className="flex gap-2 justify-end mt-4">
            <Button variant="ghost" onClick={() => setDeleteOpen(false)}>Cancel</Button>
            <Button
              variant="destructive"
              onClick={handleDelete}
              disabled={deleteMutation.isPending}
            >
              {deleteMutation.isPending ? 'Deleting…' : 'Delete'}
            </Button>
          </div>
          {deleteMutation.error && (
            <p className="text-sm text-red-500 mt-2">{deleteMutation.error.message}</p>
          )}
        </DialogContent>
      </Dialog>
    </>
  )
}
