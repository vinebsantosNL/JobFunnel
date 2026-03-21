'use client'

import { useState } from 'react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
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
        {/* Header */}
        <div className="flex items-start justify-between gap-2">
          <div className="flex items-center gap-2 flex-1 min-w-0">
            <h3 className="text-lg font-bold text-gray-900 leading-snug">{version.name}</h3>
            {version.is_default && (
              <span className="text-xs uppercase tracking-wider text-gray-500 bg-gray-100 px-2.5 py-0.5 rounded-full font-medium flex-shrink-0">
                DEFAULT
              </span>
            )}
          </div>
          <div className="flex items-center gap-1 flex-shrink-0">
            {version.is_archived && (
              <Badge variant="secondary" className="text-xs">Archived</Badge>
            )}
          </div>
        </div>

        {/* Tags */}
        {version.tags.length > 0 && (
          <div className="flex flex-wrap gap-1.5 -mt-2">
            {version.tags.map((tag) => (
              <span
                key={tag}
                className="text-xs uppercase tracking-wider text-gray-500 bg-gray-100 px-2.5 py-0.5 rounded-full font-medium"
              >
                {tag}
              </span>
            ))}
          </div>
        )}

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

      {/* Edit Dialog */}
      <Dialog open={editOpen} onOpenChange={setEditOpen}>
        <DialogContent size="md">
          <DialogHeader>
            <DialogTitle>Edit CV Version</DialogTitle>
          </DialogHeader>
          <CVVersionForm
            version={version}
            onSuccess={() => setEditOpen(false)}
            onCancel={() => setEditOpen(false)}
          />
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={deleteOpen} onOpenChange={setDeleteOpen}>
        <DialogContent size="sm">
          <DialogHeader>
            <DialogTitle>Delete CV version?</DialogTitle>
            <DialogDescription>
              This will permanently delete &ldquo;{version.name}&rdquo;. This action cannot be
              undone.
            </DialogDescription>
          </DialogHeader>
          {deleteMutation.error && (
            <p className="text-sm text-red-500">{deleteMutation.error.message}</p>
          )}
          <DialogFooter>
            <Button variant="ghost" onClick={() => setDeleteOpen(false)}>Cancel</Button>
            <Button
              variant="destructive"
              onClick={handleDelete}
              disabled={deleteMutation.isPending}
            >
              {deleteMutation.isPending ? 'Deleting…' : 'Delete'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}
