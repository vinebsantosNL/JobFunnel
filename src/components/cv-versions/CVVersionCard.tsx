'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Pencil, Copy, Archive, ArchiveRestore, Lock, Star, MoreHorizontal, ExternalLink } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog'
import { CVVersionForm } from './CVVersionForm'
import { useUpdateCVVersion, useDuplicateCVVersion } from '@/hooks/useCVVersions'
import type { CVVersion, TemplateId } from '@/types/database.types'
import { cn } from '@/lib/utils'

// ─── Constants ────────────────────────────────────────────────────────────────

const SCREENING_RATE_HIGH = 18
const LOW_DATA_THRESHOLD = 10

const TEMPLATE_LABELS: Record<TemplateId, string> = {
  precision:   'Precision',
  modern_tech: 'Modern Tech',
  compact_eu:  'Compact EU',
  europass:    'Europass',
  senior_ic:   'Senior IC',
}

// ATS safety: modern_tech is two-column → "Review needed", all others → "ATS Safe"
function getAtsBadge(templateId: TemplateId): { label: string; safe: boolean } {
  return templateId === 'modern_tech'
    ? { label: 'Review needed', safe: false }
    : { label: 'ATS Safe', safe: true }
}

// ─── Template Thumbnail ────────────────────────────────────────────────────────

function TemplateThumbnail({ templateId }: { templateId: TemplateId }) {
  const base = 'w-full h-[90px] rounded-lg overflow-hidden bg-gray-50 border border-gray-100 flex p-2 gap-1.5'

  if (templateId === 'modern_tech') {
    return (
      <div className={base}>
        <div className="w-1/3 flex flex-col gap-1">
          <div className="h-2 bg-gray-300 rounded-sm w-full" />
          <div className="h-1.5 bg-gray-200 rounded-sm w-4/5" />
          <div className="mt-1 space-y-1">
            <div className="h-1 bg-gray-200 rounded-sm w-full" />
            <div className="h-1 bg-gray-200 rounded-sm w-3/4" />
            <div className="h-1 bg-gray-200 rounded-sm w-full" />
          </div>
        </div>
        <div className="w-px bg-gray-200 self-stretch" />
        <div className="flex-1 flex flex-col gap-1">
          <div className="h-1.5 bg-gray-300 rounded-sm w-2/3" />
          <div className="space-y-0.5 mt-0.5">
            <div className="h-1 bg-gray-200 rounded-sm w-full" />
            <div className="h-1 bg-gray-200 rounded-sm w-5/6" />
            <div className="h-1 bg-gray-200 rounded-sm w-full" />
          </div>
          <div className="h-1.5 bg-gray-300 rounded-sm w-1/2 mt-1" />
          <div className="space-y-0.5">
            <div className="h-1 bg-gray-200 rounded-sm w-full" />
            <div className="h-1 bg-gray-200 rounded-sm w-3/4" />
          </div>
        </div>
      </div>
    )
  }

  if (templateId === 'europass') {
    return (
      <div className={cn(base, 'flex-col gap-1')}>
        <div className="h-4 bg-blue-100 rounded-sm w-full flex items-center px-1.5 gap-1">
          <div className="w-3 h-3 rounded-full bg-blue-200 flex-shrink-0" />
          <div className="flex-1 space-y-0.5">
            <div className="h-1 bg-blue-200 rounded-sm w-2/3" />
            <div className="h-0.5 bg-blue-100 rounded-sm w-1/2" />
          </div>
        </div>
        <div className="space-y-1 mt-0.5">
          <div className="h-1.5 bg-gray-300 rounded-sm w-1/3" />
          <div className="h-1 bg-gray-200 rounded-sm w-full" />
          <div className="h-1 bg-gray-200 rounded-sm w-5/6" />
          <div className="h-1.5 bg-gray-300 rounded-sm w-1/3 mt-0.5" />
          <div className="h-1 bg-gray-200 rounded-sm w-full" />
        </div>
      </div>
    )
  }

  if (templateId === 'compact_eu') {
    return (
      <div className={cn(base, 'flex-col gap-1')}>
        <div className="flex items-center gap-1">
          <div className="h-2 bg-gray-800 rounded-sm w-1/2" />
          <div className="flex-1 flex justify-end gap-0.5">
            <div className="h-1 bg-gray-200 rounded-sm w-8" />
            <div className="h-1 bg-gray-200 rounded-sm w-6" />
          </div>
        </div>
        <div className="h-px bg-gray-300 w-full" />
        <div className="grid grid-cols-2 gap-1 mt-0.5">
          <div className="space-y-0.5">
            <div className="h-1.5 bg-gray-300 rounded-sm w-3/4" />
            <div className="h-1 bg-gray-200 rounded-sm w-full" />
            <div className="h-1 bg-gray-200 rounded-sm w-4/5" />
          </div>
          <div className="space-y-0.5">
            <div className="h-1.5 bg-gray-300 rounded-sm w-3/4" />
            <div className="h-1 bg-gray-200 rounded-sm w-full" />
            <div className="h-1 bg-gray-200 rounded-sm w-2/3" />
          </div>
        </div>
      </div>
    )
  }

  if (templateId === 'senior_ic') {
    return (
      <div className={cn(base, 'flex-col gap-1')}>
        <div className="h-2.5 bg-gray-800 rounded-sm w-2/5" />
        <div className="h-1 bg-gray-300 rounded-sm w-3/5" />
        <div className="h-px bg-gray-200 w-full mt-0.5" />
        <div className="space-y-0.5 mt-0.5">
          <div className="h-1.5 bg-gray-300 rounded-sm w-1/4" />
          <div className="h-1 bg-gray-200 rounded-sm w-full" />
          <div className="h-1 bg-gray-200 rounded-sm w-full" />
          <div className="h-1 bg-gray-200 rounded-sm w-3/4" />
        </div>
      </div>
    )
  }

  // Default: precision — clean single-column
  return (
    <div className={cn(base, 'flex-col gap-1')}>
      <div className="flex items-center justify-between">
        <div className="h-2 bg-gray-800 rounded-sm w-2/5" />
        <div className="h-1.5 bg-gray-200 rounded-sm w-1/4" />
      </div>
      <div className="h-px bg-gray-200 w-full" />
      <div className="space-y-0.5 mt-0.5">
        <div className="h-1.5 bg-gray-300 rounded-sm w-1/3" />
        <div className="h-1 bg-gray-200 rounded-sm w-full" />
        <div className="h-1 bg-gray-200 rounded-sm w-5/6" />
        <div className="h-1.5 bg-gray-300 rounded-sm w-1/3 mt-0.5" />
        <div className="h-1 bg-gray-200 rounded-sm w-full" />
        <div className="h-1 bg-gray-200 rounded-sm w-2/3" />
      </div>
    </div>
  )
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function relativeTime(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime()
  const minutes = Math.floor(diff / 60_000)
  if (minutes < 2) return 'just now'
  if (minutes < 60) return `${minutes}m ago`
  const hours = Math.floor(minutes / 60)
  if (hours < 24) return `${hours}h ago`
  const days = Math.floor(hours / 24)
  if (days < 30) return `${days}d ago`
  return new Date(iso).toLocaleDateString('en-GB', { month: 'short', year: 'numeric' })
}

function ScreeningRateBadge({ rate, count }: { rate: number | null; count: number }) {
  if (count < LOW_DATA_THRESHOLD || rate === null) return null
  if (rate >= SCREENING_RATE_HIGH) {
    return (
      <span className="inline-flex items-center text-xs px-2 py-0.5 rounded-full font-medium bg-green-50 text-green-700 border border-green-200">
        {rate}% screening
      </span>
    )
  }
  return (
    <span className="inline-flex items-center text-xs px-2 py-0.5 rounded-full font-medium bg-amber-50 text-amber-700 border border-amber-200">
      {rate}% screening
    </span>
  )
}

// ─── Types ────────────────────────────────────────────────────────────────────

interface CVVersionStats {
  total_applied: number
  reached_screening: number
  screening_rate: number | null
}

interface CVVersionCardProps {
  version: CVVersion
  stats?: CVVersionStats
}

// ─── Card ─────────────────────────────────────────────────────────────────────

export function CVVersionCard({ version, stats }: CVVersionCardProps) {
  const [editOpen, setEditOpen] = useState(false)
  const [duplicateOpen, setDuplicateOpen] = useState(false)
  const [duplicateName, setDuplicateName] = useState('')
  const [mobileSheetOpen, setMobileSheetOpen] = useState(false)

  const updateMutation = useUpdateCVVersion()
  const duplicateMutation = useDuplicateCVVersion()

  const totalApplied = stats?.total_applied ?? 0
  const screenings = stats?.reached_screening ?? 0
  const ats = getAtsBadge(version.template_id)

  // Safe access into resume_data for role tag
  const resumeData = version.resume_data as { contact?: { targetTitle?: string } } | null
  const targetTitle = resumeData?.contact?.targetTitle ?? null

  async function handleArchiveToggle() {
    await updateMutation.mutateAsync({
      id: version.id,
      input: { is_archived: !version.is_archived },
    })
    setMobileSheetOpen(false)
  }

  async function handleSetDefault() {
    await updateMutation.mutateAsync({
      id: version.id,
      input: { is_default: true },
    })
    setMobileSheetOpen(false)
  }

  async function handleDuplicateConfirm() {
    if (!duplicateName.trim()) return
    await duplicateMutation.mutateAsync({ id: version.id, name: duplicateName.trim() })
    setDuplicateOpen(false)
    setDuplicateName('')
  }

  function openDuplicate() {
    setDuplicateName(`${version.name} – Copy`)
    setDuplicateOpen(true)
    setMobileSheetOpen(false)
  }

  function openEdit() {
    setEditOpen(true)
    setMobileSheetOpen(false)
  }

  return (
    <>
      {/* ─── Card ─────────────────────────────────────────────────────────── */}
      <div
        className={cn(
          'group rounded-xl border bg-white flex flex-col transition-all',
          version.is_default
            ? 'border-2 border-blue-500 shadow-sm'
            : 'border border-gray-200 hover:border-gray-300 hover:shadow-sm',
          version.is_archived && 'opacity-60'
        )}
      >
        {/* Thumbnail — click to open full editor */}
        <Link
          href={`/cv-versions/${version.id}/edit`}
          className="p-3 pb-0 block group/thumb"
        >
          <div className="relative">
            <TemplateThumbnail templateId={version.template_id} />
            <div className="absolute inset-0 rounded-lg bg-black/0 group-hover/thumb:bg-black/5 transition-colors flex items-center justify-center opacity-0 group-hover/thumb:opacity-100">
              <span className="text-xs font-medium text-gray-700 bg-white/90 px-2 py-1 rounded-md shadow-sm flex items-center gap-1">
                <ExternalLink className="w-3 h-3" />
                {version.is_locked ? 'View' : 'Open editor'}
              </span>
            </div>
          </div>
        </Link>

        {/* Body */}
        <div className="p-4 flex flex-col gap-3 flex-1">
          {/* Title row */}
          <div className="flex items-start gap-1.5">
            {version.is_locked && (
              <Lock className="w-3.5 h-3.5 text-gray-400 mt-0.5 flex-shrink-0" />
            )}
            <h3 className="text-[15px] font-bold text-gray-900 leading-snug truncate flex-1">
              {version.name}
            </h3>
            {/* Set default — top right, only when not default */}
            {!version.is_default && !version.is_locked && (
              <button
                onClick={handleSetDefault}
                disabled={updateMutation.isPending}
                title="Set as default"
                className="hidden sm:flex flex-shrink-0 p-1 rounded-md text-gray-300 hover:text-amber-400 hover:bg-gray-100 transition-colors disabled:opacity-50"
              >
                <Star className="w-4 h-4" />
              </button>
            )}
            {version.is_default && (
              <Star className="w-4 h-4 text-blue-500 fill-blue-500 flex-shrink-0" />
            )}
            {/* Mobile actions trigger */}
            <button
              onClick={() => setMobileSheetOpen(true)}
              className="sm:hidden ml-1 flex-shrink-0 p-1 rounded-md text-gray-400 hover:text-gray-600 hover:bg-gray-100"
              aria-label="Actions"
            >
              <MoreHorizontal className="w-4 h-4" />
            </button>
          </div>

          {/* Meta */}
          <p className="text-xs text-gray-400 -mt-2">
            {TEMPLATE_LABELS[version.template_id]} · Edited {relativeTime(version.updated_at)}
          </p>

          {/* Tags row */}
          {(version.target_country || targetTitle) && (
            <div className="flex flex-wrap gap-1.5">
              {version.target_country && (
                <span className="text-xs text-blue-600 bg-blue-50 border border-blue-200 px-2 py-0.5 rounded-full font-medium">
                  {version.target_country}
                </span>
              )}
              {targetTitle && (
                <span className="text-xs text-gray-500 bg-gray-100 px-2 py-0.5 rounded-full font-medium truncate max-w-[120px]">
                  {targetTitle}
                </span>
              )}
            </div>
          )}

          {/* Badges */}
          <div className="flex items-center gap-2 flex-wrap">
            <ScreeningRateBadge rate={stats?.screening_rate ?? null} count={totalApplied} />
            <span
              className={cn(
                'inline-flex items-center text-xs px-2 py-0.5 rounded-full font-medium border',
                ats.safe
                  ? 'bg-green-50 text-green-700 border-green-200'
                  : 'bg-amber-50 text-amber-700 border-amber-200'
              )}
            >
              {ats.label}
            </span>
          </div>

          {/* Stats grid */}
          <div className="border-t border-gray-100 pt-3 grid grid-cols-3 gap-2">
            <div>
              <p className="text-xl font-bold text-gray-900">{totalApplied}</p>
              <p className="text-xs text-gray-400 mt-0.5">Applied</p>
            </div>
            <div>
              <p className="text-xl font-bold text-gray-900">{screenings}</p>
              <p className="text-xs text-gray-400 mt-0.5">Screenings</p>
            </div>
            <div>
              {totalApplied < LOW_DATA_THRESHOLD || stats?.screening_rate === null ? (
                <p className="text-xl font-bold text-gray-300">—</p>
              ) : (
                <p
                  className={cn(
                    'text-xl font-bold',
                    (stats?.screening_rate ?? 0) >= SCREENING_RATE_HIGH
                      ? 'text-green-600'
                      : 'text-amber-500'
                  )}
                >
                  {stats?.screening_rate}%
                </p>
              )}
              <p className="text-xs text-gray-400 mt-0.5">Rate</p>
            </div>
          </div>

          {/* Desktop actions — visible on group-hover */}
          <div
            className={cn(
              'hidden sm:flex items-center justify-end gap-1 pt-1',
              'opacity-0 group-hover:opacity-100 transition-opacity'
            )}
          >
            {version.is_locked ? (
              // Locked: view editor (read-only), Rename, Duplicate, Archive
              <>
                <ActionLinkButton href={`/cv-versions/${version.id}/edit`} icon={<ExternalLink className="w-3.5 h-3.5" />} label="View" />
                <ActionButton icon={<Pencil className="w-3.5 h-3.5" />} label="Rename" onClick={openEdit} />
                <ActionButton icon={<Copy className="w-3.5 h-3.5" />} label="Duplicate" onClick={openDuplicate} />
                <ActionButton
                  icon={version.is_archived ? <ArchiveRestore className="w-3.5 h-3.5" /> : <Archive className="w-3.5 h-3.5" />}
                  label={version.is_archived ? 'Unarchive' : 'Archive'}
                  onClick={handleArchiveToggle}
                  disabled={updateMutation.isPending}
                />
              </>
            ) : (
              // Unlocked: open editor, Rename, Duplicate, Archive
              <>
                <ActionLinkButton href={`/cv-versions/${version.id}/edit`} icon={<ExternalLink className="w-3.5 h-3.5" />} label="Edit" />
                <ActionButton icon={<Pencil className="w-3.5 h-3.5" />} label="Rename" onClick={openEdit} />
                <ActionButton icon={<Copy className="w-3.5 h-3.5" />} label="Duplicate" onClick={openDuplicate} />
                <ActionButton
                  icon={version.is_archived ? <ArchiveRestore className="w-3.5 h-3.5" /> : <Archive className="w-3.5 h-3.5" />}
                  label={version.is_archived ? 'Unarchive' : 'Archive'}
                  onClick={handleArchiveToggle}
                  disabled={updateMutation.isPending}
                />
              </>
            )}
          </div>

          {updateMutation.error && (
            <p className="text-xs text-red-500">{updateMutation.error.message}</p>
          )}
        </div>
      </div>

      {/* ─── Mobile bottom sheet ──────────────────────────────────────────── */}
      <Sheet open={mobileSheetOpen} onOpenChange={setMobileSheetOpen}>
        <SheetContent side="bottom" className="rounded-t-2xl pb-8">
          <SheetHeader className="mb-4">
            <SheetTitle className="text-left truncate">{version.name}</SheetTitle>
          </SheetHeader>
          <div className="flex flex-col gap-1">
            <SheetActionLink href={`/cv-versions/${version.id}/edit`} icon={<ExternalLink className="w-4 h-4" />} label={version.is_locked ? 'View resume' : 'Open editor'} onClick={() => setMobileSheetOpen(false)} />
            <SheetAction icon={<Pencil className="w-4 h-4" />} label="Rename" onClick={openEdit} />
            <SheetAction icon={<Copy className="w-4 h-4" />} label="Duplicate" onClick={openDuplicate} />
            {!version.is_default && !version.is_locked && (
              <SheetAction icon={<Star className="w-4 h-4" />} label="Set as default" onClick={handleSetDefault} />
            )}
            <SheetAction
              icon={version.is_archived ? <ArchiveRestore className="w-4 h-4" /> : <Archive className="w-4 h-4" />}
              label={version.is_archived ? 'Unarchive' : 'Archive'}
              onClick={handleArchiveToggle}
            />
          </div>
        </SheetContent>
      </Sheet>

      {/* ─── Edit Dialog ──────────────────────────────────────────────────── */}
      <Dialog open={editOpen} onOpenChange={setEditOpen}>
        <DialogContent size="md">
          <DialogHeader>
            <DialogTitle>Rename resume version</DialogTitle>
          </DialogHeader>
          <CVVersionForm
            version={version}
            onSuccess={() => setEditOpen(false)}
            onCancel={() => setEditOpen(false)}
          />
        </DialogContent>
      </Dialog>

      {/* ─── Duplicate Dialog ─────────────────────────────────────────────── */}
      <Dialog open={duplicateOpen} onOpenChange={setDuplicateOpen}>
        <DialogContent size="sm">
          <DialogHeader>
            <DialogTitle>Duplicate resume version</DialogTitle>
            <DialogDescription>Give the duplicate a name to tell them apart.</DialogDescription>
          </DialogHeader>
          <input
            type="text"
            value={duplicateName}
            onChange={(e) => setDuplicateName(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleDuplicateConfirm()}
            placeholder="e.g. Precision – NL variant"
            className="w-full rounded-md border border-gray-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            autoFocus
          />
          {duplicateMutation.error && (
            <p className="text-xs text-red-500">{duplicateMutation.error.message}</p>
          )}
          <DialogFooter>
            <Button variant="ghost" onClick={() => setDuplicateOpen(false)}>Cancel</Button>
            <Button
              onClick={handleDuplicateConfirm}
              disabled={!duplicateName.trim() || duplicateMutation.isPending}
            >
              {duplicateMutation.isPending ? 'Creating…' : 'Create duplicate'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}

// ─── Small helpers ─────────────────────────────────────────────────────────────

function ActionButton({
  icon, label, onClick, disabled,
}: {
  icon: React.ReactNode
  label: string
  onClick: () => void
  disabled?: boolean
}) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      title={label}
      className="flex items-center gap-1 text-xs text-gray-500 hover:text-gray-800 hover:bg-gray-100 px-2 py-1 rounded-md transition-colors disabled:opacity-50 min-h-[44px] sm:min-h-0"
    >
      {icon}
      <span className="hidden lg:inline">{label}</span>
    </button>
  )
}

function ActionLinkButton({
  href, icon, label,
}: {
  href: string
  icon: React.ReactNode
  label: string
}) {
  return (
    <Link
      href={href}
      title={label}
      className="flex items-center gap-1 text-xs text-gray-500 hover:text-gray-800 hover:bg-gray-100 px-2 py-1 rounded-md transition-colors min-h-[44px] sm:min-h-0"
    >
      {icon}
      <span className="hidden lg:inline">{label}</span>
    </Link>
  )
}

function SheetAction({
  icon, label, onClick,
}: {
  icon: React.ReactNode
  label: string
  onClick: () => void
}) {
  return (
    <button
      onClick={onClick}
      className="flex items-center gap-3 w-full px-3 py-3.5 rounded-xl text-sm text-gray-700 hover:bg-gray-50 active:bg-gray-100 transition-colors min-h-[44px]"
    >
      <span className="text-gray-500">{icon}</span>
      {label}
    </button>
  )
}

function SheetActionLink({
  href, icon, label, onClick,
}: {
  href: string
  icon: React.ReactNode
  label: string
  onClick: () => void
}) {
  return (
    <Link
      href={href}
      onClick={onClick}
      className="flex items-center gap-3 w-full px-3 py-3.5 rounded-xl text-sm text-gray-700 hover:bg-gray-50 active:bg-gray-100 transition-colors min-h-[44px]"
    >
      <span className="text-gray-500">{icon}</span>
      {label}
    </Link>
  )
}
