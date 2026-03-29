'use client'

import { useState, useRef, useEffect } from 'react'
import Link from 'next/link'
import { Pencil, Copy, Archive, ArchiveRestore, Lock, MoreHorizontal, ExternalLink, Loader2 } from 'lucide-react'
import { toast } from 'sonner'
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
  const [dropdownOpen, setDropdownOpen] = useState(false)
  const [isDownloading, setIsDownloading] = useState(false)
  const dropdownRef = useRef<HTMLDivElement>(null)

  const updateMutation = useUpdateCVVersion()
  const duplicateMutation = useDuplicateCVVersion()

  // Close dropdown on outside click
  useEffect(() => {
    if (!dropdownOpen) return
    function handleClick(e: MouseEvent) {
      if (!dropdownRef.current?.contains(e.target as Node)) setDropdownOpen(false)
    }
    document.addEventListener('mousedown', handleClick)
    return () => document.removeEventListener('mousedown', handleClick)
  }, [dropdownOpen])

  async function handleDownloadPDF() {
    if (isDownloading) return
    setIsDownloading(true)
    try {
      const res = await fetch(`/api/cv-versions/${version.id}/export/pdf`, { method: 'POST' })
      if (!res.ok) throw new Error('PDF export failed')
      const blob = await res.blob()
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      const safeName = version.name.replace(/[^\w\s-]/g, '_')
      a.download = `${safeName}.pdf`
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      URL.revokeObjectURL(url)
    } catch (err) {
      toast.error('Failed to download PDF. Please try again.')
      console.error('PDF download error:', err)
    } finally {
      setIsDownloading(false)
    }
  }

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
    setDropdownOpen(false)
  }

  async function handleSetDefault() {
    await updateMutation.mutateAsync({
      id: version.id,
      input: { is_default: true },
    })
    setDropdownOpen(false)
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
    setDropdownOpen(false)
  }

  function openEdit() {
    setEditOpen(true)
    setDropdownOpen(false)
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
                  background: 'var(--jf-success-tint)',
                  border: '1px solid var(--jf-success-border)',
                  color: 'var(--jf-success)',
                }}
              >
                Default
              </span>
            )}
            {/* Actions dropdown */}
            <div ref={dropdownRef} style={{ position: 'relative' }}>
              <button
                onClick={() => setDropdownOpen((v) => !v)}
                className="p-1 rounded-md hover:bg-[var(--jf-bg-subtle)]"
                style={{ color: 'var(--jf-text-muted)', minHeight: '36px', minWidth: '36px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                aria-label="Actions"
              >
                <MoreHorizontal className="w-4 h-4" />
              </button>
              {dropdownOpen && (
                <div
                  style={{
                    position: 'absolute',
                    top: '100%',
                    right: 0,
                    zIndex: 50,
                    marginTop: 4,
                    minWidth: 180,
                    background: 'var(--jf-bg-card)',
                    border: '1px solid var(--jf-border)',
                    borderRadius: 12,
                    boxShadow: 'var(--jf-shadow-md)',
                    padding: '4px',
                  }}
                >
                  <Link
                    href={`/cv-versions/${version.id}/edit`}
                    onClick={() => setDropdownOpen(false)}
                    className="flex items-center gap-2 w-full px-3 py-2.5 rounded-lg text-sm hover:bg-[var(--jf-bg-subtle)] transition-colors min-h-[40px]"
                    style={{ color: 'var(--jf-text-primary)', textDecoration: 'none' }}
                  >
                    <ExternalLink className="w-3.5 h-3.5" style={{ color: 'var(--jf-text-muted)' }} />
                    {version.is_locked ? 'View resume' : 'Open editor'}
                  </Link>
                  <button
                    onClick={() => { openEdit(); setDropdownOpen(false) }}
                    className="flex items-center gap-2 w-full px-3 py-2.5 rounded-lg text-sm hover:bg-[var(--jf-bg-subtle)] transition-colors min-h-[40px] text-left"
                    style={{ color: 'var(--jf-text-primary)', background: 'transparent', border: 'none', cursor: 'pointer', width: '100%' }}
                  >
                    <Pencil className="w-3.5 h-3.5" style={{ color: 'var(--jf-text-muted)' }} />
                    Rename
                  </button>
                  <button
                    onClick={() => { openDuplicate(); setDropdownOpen(false) }}
                    className="flex items-center gap-2 w-full px-3 py-2.5 rounded-lg text-sm hover:bg-[var(--jf-bg-subtle)] transition-colors min-h-[40px] text-left"
                    style={{ color: 'var(--jf-text-primary)', background: 'transparent', border: 'none', cursor: 'pointer', width: '100%' }}
                  >
                    <Copy className="w-3.5 h-3.5" style={{ color: 'var(--jf-text-muted)' }} />
                    Duplicate
                  </button>
                  {!version.is_default && !version.is_locked && (
                    <button
                      onClick={() => { handleSetDefault(); setDropdownOpen(false) }}
                      className="flex items-center gap-2 w-full px-3 py-2.5 rounded-lg text-sm hover:bg-[var(--jf-bg-subtle)] transition-colors min-h-[40px] text-left"
                      style={{ color: 'var(--jf-text-primary)', background: 'transparent', border: 'none', cursor: 'pointer', width: '100%' }}
                    >
                      <span className="w-3.5 h-3.5 rounded-full border-2 flex items-center justify-center" style={{ borderColor: 'var(--jf-success)' }} />
                      Set as default
                    </button>
                  )}
                  <div style={{ height: 1, background: 'var(--jf-border)', margin: '4px 0' }} />
                  <button
                    onClick={() => { handleArchiveToggle(); setDropdownOpen(false) }}
                    className="flex items-center gap-2 w-full px-3 py-2.5 rounded-lg text-sm hover:bg-[var(--jf-bg-subtle)] transition-colors min-h-[40px] text-left"
                    style={{ color: version.is_archived ? 'var(--jf-text-secondary)' : 'var(--jf-error)', background: 'transparent', border: 'none', cursor: 'pointer', width: '100%' }}
                  >
                    {version.is_archived
                      ? <ArchiveRestore className="w-3.5 h-3.5" />
                      : <Archive className="w-3.5 h-3.5" />
                    }
                    {version.is_archived ? 'Unarchive' : 'Archive'}
                  </button>
                </div>
              )}
            </div>
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

        {/* Section 3 — Stats grid */}
        <div
          className="grid grid-cols-3"
          style={{ borderTop: '1px solid var(--jf-border)', borderBottom: '1px solid var(--jf-border)' }}
        >
          <StatCell value={String(totalApplied)} label="applications" />
          <StatCell
            value={screeningRate !== null ? `${screeningRate}%` : '—'}
            label="screening"
            color={screeningRate !== null && screeningRate > 0 ? 'var(--jf-success)' : undefined}
            bordered
          />
          <StatCell
            value={interviewRate !== null ? `${interviewRate}%` : '—'}
            label="interviews"
            color={interviewRate !== null && interviewRate > 0 ? 'var(--jf-warning)' : undefined}
            bordered
          />
        </div>

        {/* Section 4 — Footer: date + actions */}
        <div className="flex items-center justify-between gap-2">
          <p
            style={{
              fontFamily: 'var(--font-dm-mono, monospace)',
              fontSize: '10.5px',
              color: 'var(--jf-text-muted)',
            }}
          >
            Updated {updatedDateStr}
          </p>

          {/* Actions row */}
          <div className="flex gap-[6px]">
            <CardActionButton
              primary
              disabled={isDownloading}
              icon={
                isDownloading
                  ? <Loader2 className="w-3 h-3 animate-spin" />
                  : <svg className="w-3 h-3" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M3 17a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm3.293-7.707a1 1 0 011.414 0L9 10.586V3a1 1 0 112 0v7.586l1.293-1.293a1 1 0 111.414 1.414l-3 3a1 1 0 01-1.414 0l-3-3a1 1 0 010-1.414z" clipRule="evenodd" />
                    </svg>
              }
              label={isDownloading ? 'Exporting…' : 'PDF'}
              onClick={handleDownloadPDF}
            />
            <CardActionButton
              icon={<Copy className="w-3 h-3" />}
              label="Duplicate"
              onClick={openDuplicate}
            />
          </div>
        </div>

        {updateMutation.error && (
          <p className="text-xs text-[var(--jf-error)]">{updateMutation.error.message}</p>
        )}
      </div>

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
            className="w-full rounded-lg px-3 py-2 text-sm outline-none transition-shadow"
            style={{
              border: '1px solid var(--jf-border)',
              color: 'var(--jf-text-primary)',
              background: 'var(--jf-bg-card)',
            }}
            onFocus={(e) => { e.currentTarget.style.borderColor = 'var(--jf-interactive)'; e.currentTarget.style.boxShadow = 'var(--jf-focus-ring)' }}
            onBlur={(e) => { e.currentTarget.style.borderColor = 'var(--jf-border)'; e.currentTarget.style.boxShadow = 'none' }}
            autoFocus
          />
          {duplicateMutation.error && (
            <p className="text-xs text-[var(--jf-error)]">{duplicateMutation.error.message}</p>
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

// ─── Stat cell ───────────────────────────────────────────────────────────────

function StatCell({
  value,
  label,
  color,
  bordered,
}: {
  value: string
  label: string
  color?: string
  bordered?: boolean
}) {
  return (
    <div
      className="flex flex-col gap-[3px] py-2.5 px-3"
      style={bordered ? { borderLeft: '1px solid var(--jf-border)' } : undefined}
    >
      <span
        style={{
          fontFamily: 'var(--font-dm-mono, monospace)',
          fontSize: '16px',
          fontWeight: 500,
          color: color ?? 'var(--jf-text-primary)',
          lineHeight: 1,
        }}
      >
        {value}
      </span>
      <span
        style={{
          fontFamily: 'var(--font-dm-mono, monospace)',
          fontSize: '9.5px',
          color: 'var(--jf-text-muted)',
          lineHeight: 1,
          textTransform: 'uppercase',
          letterSpacing: '0.05em',
        }}
      >
        {label}
      </span>
    </div>
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

