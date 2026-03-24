'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Pencil, Copy, Archive, ArchiveRestore, Lock, MoreHorizontal, ExternalLink } from 'lucide-react'
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
import type { CVVersion } from '@/types/database.types'
import { cn } from '@/lib/utils'

// ─── Types ────────────────────────────────────────────────────────────────────

interface CVVersionStats {
  total_applied: number
  reached_screening: number
  screening_rate: number | null
  interview_rate?: number | null
}

interface CVVersionCardProps {
  version: CVVersion
  stats?: CVVersionStats
  index: number
}

// ─── Card ─────────────────────────────────────────────────────────────────────

export function CVVersionCard({ version, stats, index }: CVVersionCardProps) {
  const [editOpen, setEditOpen] = useState(false)
  const [duplicateOpen, setDuplicateOpen] = useState(false)
  const [duplicateName, setDuplicateName] = useState('')
  const [mobileSheetOpen, setMobileSheetOpen] = useState(false)

  const updateMutation = useUpdateCVVersion()
  const duplicateMutation = useDuplicateCVVersion()

  const totalApplied = stats?.total_applied ?? 0
  const screeningRate = stats?.screening_rate ?? null
  const interviewRate = stats?.interview_rate ?? null

  const versionLabel = `VERSION ${(index + 1).toString().padStart(2, '0')}`

  const updatedDateStr = new Date(version.updated_at).toLocaleDateString('en-GB', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  })

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
        className="flex flex-col gap-[14px] rounded-[16px] border p-5"
        style={{
          background: 'var(--jf-bg-card)',
          borderColor: 'var(--jf-border)',
          boxShadow: 'var(--jf-shadow-sm)',
        }}
      >
        {/* Section 1 — Header row */}
        <div className="flex items-start justify-between gap-[10px]">
          <div>
            <p
              className="uppercase mb-1"
              style={{
                fontFamily: 'var(--font-dm-mono, monospace)',
                fontSize: '10px',
                letterSpacing: '0.1em',
                color: 'var(--jf-text-muted)',
              }}
            >
              {versionLabel}
            </p>
            <h3
              className="font-bold truncate"
              style={{
                fontSize: '14px',
                color: 'var(--jf-text-primary)',
              }}
            >
              {version.is_locked && (
                <Lock className="inline w-3.5 h-3.5 mr-1 align-text-bottom" style={{ color: 'var(--jf-text-muted)' }} />
              )}
              {version.name}
            </h3>
          </div>
          <div className="flex items-center gap-2 flex-shrink-0">
            {version.is_default && (
              <span
                className="inline-block"
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
            {/* Mobile actions trigger */}
            <button
              onClick={() => setMobileSheetOpen(true)}
              className="sm:hidden p-1 rounded-md hover:bg-[var(--jf-bg-subtle)]"
              style={{ color: 'var(--jf-text-muted)', minHeight: '44px', minWidth: '44px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
              aria-label="Actions"
            >
              <MoreHorizontal className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Section 2 — Tags row */}
        {version.tags.length > 0 && (
          <div className="flex gap-[5px] flex-wrap">
            {version.tags.map((tag) => (
              <span
                key={tag}
                className="font-medium"
                style={{
                  fontSize: '11px',
                  padding: '3px 8px',
                  borderRadius: '100px',
                  background: 'var(--jf-bg-subtle, #F8FAFC)',
                  border: '1px solid var(--jf-border)',
                  color: 'var(--jf-text-secondary)',
                }}
              >
                {tag}
              </span>
            ))}
          </div>
        )}

        {/* Section 3 — Stats row */}
        <div
          className="py-[10px]"
          style={{
            fontFamily: 'var(--font-dm-mono, monospace)',
            fontSize: '11px',
            color: 'var(--jf-text-muted)',
            borderTop: '1px solid var(--jf-border)',
            borderBottom: '1px solid var(--jf-border)',
          }}
        >
          {totalApplied > 0 ? (
            <span>
              <strong style={{ color: 'var(--jf-text-secondary)' }}>{totalApplied}</strong> applications
              {' · '}
              <strong style={{ color: 'var(--jf-text-secondary)' }}>
                {screeningRate !== null ? `${screeningRate}%` : '—'}
              </strong> screening rate
              {' · '}
              <strong style={{ color: 'var(--jf-text-secondary)' }}>
                {interviewRate !== null ? `${interviewRate}%` : '—'}
              </strong> interview rate
            </span>
          ) : (
            <span>
              <strong style={{ color: 'var(--jf-text-secondary)' }}>0</strong> applications
              {' · '}
              <strong style={{ color: 'var(--jf-text-secondary)' }}>—</strong> screening rate
            </span>
          )}
        </div>

        {/* Section 4 — Updated date */}
        <p
          style={{
            fontFamily: 'var(--font-dm-mono, monospace)',
            fontSize: '11px',
            color: 'var(--jf-text-muted)',
          }}
        >
          Updated {updatedDateStr}
        </p>

        {/* Section 5 — Actions row */}
        <div className="flex gap-[6px] flex-wrap">
          {/* PDF button — primary */}
          <CardActionButton
            primary
            icon={
              <svg className="w-3 h-3" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M3 17a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm3.293-7.707a1 1 0 011.414 0L9 10.586V3a1 1 0 112 0v7.586l1.293-1.293a1 1 0 111.414 1.414l-3 3a1 1 0 01-1.414 0l-3-3a1 1 0 010-1.414z" clipRule="evenodd" />
              </svg>
            }
            label="PDF"
            onClick={() => {
              // PDF download — to be wired to export logic
            }}
          />

          {/* Duplicate */}
          <CardActionButton
            icon={<Copy className="w-3 h-3" />}
            label="Duplicate"
            onClick={openDuplicate}
          />

          {/* Archive or Set Default */}
          {version.is_default ? (
            <CardActionButton
              icon={version.is_archived ? <ArchiveRestore className="w-3 h-3" /> : <Archive className="w-3 h-3" />}
              label={version.is_archived ? 'Unarchive' : 'Archive'}
              onClick={handleArchiveToggle}
              disabled={updateMutation.isPending}
            />
          ) : (
            <CardActionButton
              icon={null}
              label="Set Default"
              onClick={handleSetDefault}
              disabled={updateMutation.isPending}
            />
          )}
        </div>

        {updateMutation.error && (
          <p className="text-xs text-red-500">{updateMutation.error.message}</p>
        )}
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
              <SheetAction icon={null} label="Set as default" onClick={handleSetDefault} />
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

// ─── Card action button ──────────────────────────────────────────────────────

function CardActionButton({
  icon,
  label,
  onClick,
  disabled,
  primary,
}: {
  icon: React.ReactNode
  label: string
  onClick: () => void
  disabled?: boolean
  primary?: boolean
}) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={cn(
        'flex items-center gap-[5px] font-medium cursor-pointer transition-colors disabled:opacity-50',
        primary ? 'hover:opacity-90' : 'hover:bg-[var(--jf-bg-subtle)]'
      )}
      style={{
        padding: '6px 10px',
        border: primary ? '1px solid var(--jf-interactive)' : '1px solid var(--jf-border)',
        borderRadius: '10px',
        background: primary ? 'var(--jf-interactive)' : 'transparent',
        fontSize: '11px',
        fontWeight: 500,
        color: primary ? '#fff' : 'var(--jf-text-secondary)',
        minHeight: '32px',
        fontFamily: 'inherit',
      }}
    >
      {icon}
      {label}
    </button>
  )
}

// ─── Mobile sheet helpers ────────────────────────────────────────────────────

function SheetAction({
  icon,
  label,
  onClick,
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
      {icon && <span className="text-gray-500">{icon}</span>}
      {label}
    </button>
  )
}

function SheetActionLink({
  href,
  icon,
  label,
  onClick,
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
