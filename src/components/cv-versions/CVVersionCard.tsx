'use client'

import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
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

interface CVVersionCardProps {
  version: CVVersion
  applicationCount?: number
}

export function CVVersionCard({ version, applicationCount = 0 }: CVVersionCardProps) {
  const [editOpen, setEditOpen] = useState(false)
  const [deleteOpen, setDeleteOpen] = useState(false)

  const updateMutation = useUpdateCVVersion()
  const deleteMutation = useDeleteCVVersion()

  async function handleArchiveToggle() {
    await updateMutation.mutateAsync({
      id: version.id,
      input: { is_archived: !version.is_archived },
    })
  }

  async function handleDelete() {
    await deleteMutation.mutateAsync(version.id)
    setDeleteOpen(false)
  }

  return (
    <>
      <Card className={cn('transition-colors', version.is_archived && 'opacity-60')}>
        <CardHeader className="pb-2">
          <div className="flex items-start justify-between gap-2">
            <CardTitle className="text-base font-semibold leading-snug">
              {version.name}
            </CardTitle>
            <div className="flex items-center gap-1 flex-shrink-0">
              {version.is_default && (
                <Badge className="bg-blue-100 text-blue-700 hover:bg-blue-100 text-xs">
                  Default
                </Badge>
              )}
              {version.is_archived && (
                <Badge variant="secondary" className="text-xs">
                  Archived
                </Badge>
              )}
            </div>
          </div>
        </CardHeader>

        <CardContent className="space-y-3">
          {/* Description */}
          {version.description && (
            <p className="text-sm text-gray-500 line-clamp-2">{version.description}</p>
          )}

          {/* Tags */}
          {version.tags.length > 0 && (
            <div className="flex flex-wrap gap-1">
              {version.tags.map((tag) => (
                <Badge key={tag} variant="outline" className="text-xs">
                  {tag}
                </Badge>
              ))}
            </div>
          )}

          {/* Stats */}
          <p className="text-xs text-gray-400">
            {applicationCount} application{applicationCount !== 1 ? 's' : ''}
          </p>

          {/* Actions */}
          <div className="flex gap-2 pt-1">
            <Button
              size="sm"
              variant="outline"
              onClick={() => setEditOpen(true)}
            >
              Edit
            </Button>
            <Button
              size="sm"
              variant="ghost"
              onClick={handleArchiveToggle}
              disabled={updateMutation.isPending}
            >
              {version.is_archived ? 'Unarchive' : 'Archive'}
            </Button>
            <Button
              size="sm"
              variant="ghost"
              className="text-red-500 hover:text-red-600 hover:bg-red-50"
              onClick={() => setDeleteOpen(true)}
            >
              Delete
            </Button>
          </div>

          {updateMutation.error && (
            <p className="text-xs text-red-500">{updateMutation.error.message}</p>
          )}
        </CardContent>
      </Card>

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
              undone. If this version is linked to applications, deletion will be blocked.
            </DialogDescription>
          </DialogHeader>
          <div className="flex gap-2 justify-end mt-4">
            <Button variant="ghost" onClick={() => setDeleteOpen(false)}>
              Cancel
            </Button>
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
