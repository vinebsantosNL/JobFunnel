'use client'

import { useState, useEffect, useCallback } from 'react'
import { useForm, Controller } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import {
  Dialog,
  DialogContent,
  DialogTitle,
} from '@/components/ui/dialog'
import { AnimatePresence, motion } from 'framer-motion'
import type { JobApplication, Stage, StageHistory } from '@/types/database.types'
import { STAGE_CONFIG, STAGES } from '@/lib/stages'
import { updateJobSchema, type UpdateJobInput } from '@/lib/validations/job'
import { CVVersionPicker } from '@/components/cv-versions/CVVersionPicker'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'

/* ------------------------------------------------------------------ */
/*  Helpers                                                             */
/* ------------------------------------------------------------------ */

function getCompanyColor(name: string): string {
  const colors = ['#1DB954','#003580','#E50914','#FF6B00','#0A0A0A','#00B8D9','#FF5722','#4A90D9','#607D8B','#4CAF50']
  let hash = 0
  for (let i = 0; i < name.length; i++) hash = name.charCodeAt(i) + ((hash << 5) - hash)
  return colors[Math.abs(hash) % colors.length]
}

function getInitials(name: string): string {
  const parts = name.trim().split(/\s+/)
  if (parts.length >= 2) return (parts[0][0] + parts[1][0]).toUpperCase()
  return name.slice(0, 2).toUpperCase()
}

function getDaysInStage(stageUpdatedAt: string): number {
  const diff = Date.now() - new Date(stageUpdatedAt).getTime()
  return Math.floor(diff / (1000 * 60 * 60 * 24))
}

function formatHistoryDate(dateStr: string): string {
  const d = new Date(dateStr)
  const month = d.toLocaleDateString('en-US', { month: 'short' })
  const day = d.getDate()
  const year = d.getFullYear()
  const hours = d.getHours().toString().padStart(2, '0')
  const minutes = d.getMinutes().toString().padStart(2, '0')
  return `${month} ${day}, ${year} · ${hours}:${minutes}`
}

/** Get the rgba() version of a stage color */
function stageRgba(hex: string, alpha: number): string {
  const r = parseInt(hex.slice(1, 3), 16)
  const g = parseInt(hex.slice(3, 5), 16)
  const b = parseInt(hex.slice(5, 7), 16)
  return `rgba(${r},${g},${b},${alpha})`
}

/* ------------------------------------------------------------------ */
/*  Stage History Hook (local)                                         */
/* ------------------------------------------------------------------ */

function useStageHistory(jobId: string | null) {
  const [history, setHistory] = useState<StageHistory[]>([])
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (!jobId) { setHistory([]); return }
    setLoading(true)
    const supabase = createClient()
    supabase
      .from('stage_history')
      .select('*')
      .eq('job_id', jobId)
      .order('transitioned_at', { ascending: false })
      .then(({ data }: { data: StageHistory[] | null }) => {
        setHistory(data ?? [])
        setLoading(false)
      })
  }, [jobId])

  return { history, loading }
}

/* ------------------------------------------------------------------ */
/*  Props                                                               */
/* ------------------------------------------------------------------ */

interface ApplicationModalProps {
  job: JobApplication | null
  open: boolean
  onClose: () => void
  onUpdate: (id: string, input: UpdateJobInput) => void
  onDelete: (id: string) => void
}

/* ------------------------------------------------------------------ */
/*  Component                                                           */
/* ------------------------------------------------------------------ */

export function ApplicationModal({ job, open, onClose, onUpdate, onDelete }: ApplicationModalProps) {
  const [editing, setEditing] = useState(false)
  const [confirmDelete, setConfirmDelete] = useState(false)
  const [notesValue, setNotesValue] = useState('')

  const { history } = useStageHistory(job?.id ?? null)

  const {
    register,
    handleSubmit,
    reset,
    control,
    formState: { errors },
  } = useForm<UpdateJobInput>({
    resolver: zodResolver(updateJobSchema),
  })

  useEffect(() => {
    if (job) {
      reset({
        company_name: job.company_name,
        job_title: job.job_title,
        job_url: job.job_url ?? '',
        location: job.location ?? '',
        notes: job.notes ?? '',
        priority: job.priority,
        salary_min: job.salary_min ?? undefined,
        salary_max: job.salary_max ?? undefined,
        salary_currency: job.salary_currency ?? undefined,
        applied_at: job.applied_at ?? undefined,
        cv_version_id: job.cv_version_id ?? undefined,
      })
      setNotesValue(job.notes ?? '')
    }
    setEditing(false)
    setConfirmDelete(false)
  }, [job, reset])

  const handleNotesBlur = useCallback(() => {
    if (!job) return
    if (notesValue !== (job.notes ?? '')) {
      onUpdate(job.id, { notes: notesValue })
    }
  }, [job, notesValue, onUpdate])

  if (!job) return null

  const LOCKED_STAGES: Stage[] = ['screening', 'interviewing', 'offer', 'hired', 'rejected', 'withdrawn']
  // Lock if stage is past saved/applied, OR if a resume is already attached (to preserve analytics integrity)
  const isCVVersionLocked = LOCKED_STAGES.includes(job.stage) || !!job.cv_version_id

  const stageConfig = STAGE_CONFIG[job.stage]
  const days = getDaysInStage(job.stage_updated_at)

  const salaryDisplay = (job.salary_min || job.salary_max)
    ? `${job.salary_currency ?? '€'}${job.salary_min?.toLocaleString() ?? '?'} – ${job.salary_max?.toLocaleString() ?? '?'}`
    : null

  function onEditSubmit(data: UpdateJobInput) {
    onUpdate(job!.id, data)
    setEditing(false)
  }

  function handleStageChange(stage: Stage) {
    onUpdate(job!.id, { stage })
  }

  function handleDeleteClick() {
    if (!confirmDelete) {
      setConfirmDelete(true)
      return
    }
    onDelete(job!.id)
    onClose()
  }

  // Edit form modal (simple overlay when editing=true)
  if (editing) {
    return (
      <Dialog open={open} onOpenChange={(isOpen) => { if (!isOpen) { setEditing(false); onClose() } }}>
        <DialogContent
          size="lg"
          showCloseButton={false}
          className="p-0 gap-0"
        >
          <DialogTitle className="sr-only">Edit {job.job_title} at {job.company_name}</DialogTitle>
          <div style={{ padding: '20px 24px', borderBottom: '1px solid var(--jf-border)' }}>
            <div style={{ fontSize: 17, fontWeight: 700, color: 'var(--jf-text-primary)' }}>
              Edit Application
            </div>
          </div>
          <form onSubmit={handleSubmit(onEditSubmit)} style={{ padding: 24 }}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
              <div style={{ gridColumn: '1 / -1' }}>
                <label style={{ fontSize: 12, fontWeight: 600, color: 'var(--jf-text-secondary)' }}>Company Name *</label>
                <input
                  {...register('company_name')}
                  aria-invalid={!!errors.company_name}
                  style={{
                    marginTop: 4,
                    padding: '9px 12px',
                    border: '1px solid var(--jf-border)',
                    borderRadius: 10,
                    fontSize: 13,
                    color: 'var(--jf-text-primary)',
                    background: 'var(--jf-bg-card)',
                    outline: 'none',
                    width: '100%',
                  }}
                />
                {errors.company_name && <p style={{ fontSize: 11, color: '#EF4444', marginTop: 2 }}>{errors.company_name.message}</p>}
              </div>
              <div style={{ gridColumn: '1 / -1' }}>
                <label style={{ fontSize: 12, fontWeight: 600, color: 'var(--jf-text-secondary)' }}>Job Title *</label>
                <input
                  {...register('job_title')}
                  aria-invalid={!!errors.job_title}
                  style={{
                    marginTop: 4,
                    padding: '9px 12px',
                    border: '1px solid var(--jf-border)',
                    borderRadius: 10,
                    fontSize: 13,
                    color: 'var(--jf-text-primary)',
                    background: 'var(--jf-bg-card)',
                    outline: 'none',
                    width: '100%',
                  }}
                />
                {errors.job_title && <p style={{ fontSize: 11, color: '#EF4444', marginTop: 2 }}>{errors.job_title.message}</p>}
              </div>
              <div>
                <label style={{ fontSize: 12, fontWeight: 600, color: 'var(--jf-text-secondary)' }}>Location</label>
                <input
                  {...register('location')}
                  style={{
                    marginTop: 4,
                    padding: '9px 12px',
                    border: '1px solid var(--jf-border)',
                    borderRadius: 10,
                    fontSize: 13,
                    color: 'var(--jf-text-primary)',
                    background: 'var(--jf-bg-card)',
                    outline: 'none',
                    width: '100%',
                  }}
                />
              </div>
              <div>
                <label style={{ fontSize: 12, fontWeight: 600, color: 'var(--jf-text-secondary)' }}>Job URL</label>
                <input
                  {...register('job_url')}
                  placeholder="https://..."
                  style={{
                    marginTop: 4,
                    padding: '9px 12px',
                    border: '1px solid var(--jf-border)',
                    borderRadius: 10,
                    fontSize: 13,
                    color: 'var(--jf-text-primary)',
                    background: 'var(--jf-bg-card)',
                    outline: 'none',
                    width: '100%',
                  }}
                />
              </div>
              <div>
                <label style={{ fontSize: 12, fontWeight: 600, color: 'var(--jf-text-secondary)' }}>Salary Min</label>
                <input
                  type="number"
                  {...register('salary_min', { valueAsNumber: true })}
                  style={{
                    marginTop: 4,
                    padding: '9px 12px',
                    border: '1px solid var(--jf-border)',
                    borderRadius: 10,
                    fontSize: 13,
                    color: 'var(--jf-text-primary)',
                    background: 'var(--jf-bg-card)',
                    outline: 'none',
                    width: '100%',
                  }}
                />
              </div>
              <div>
                <label style={{ fontSize: 12, fontWeight: 600, color: 'var(--jf-text-secondary)' }}>Salary Max</label>
                <input
                  type="number"
                  {...register('salary_max', { valueAsNumber: true })}
                  style={{
                    marginTop: 4,
                    padding: '9px 12px',
                    border: '1px solid var(--jf-border)',
                    borderRadius: 10,
                    fontSize: 13,
                    color: 'var(--jf-text-primary)',
                    background: 'var(--jf-bg-card)',
                    outline: 'none',
                    width: '100%',
                  }}
                />
              </div>
              <div style={{ gridColumn: '1 / -1' }}>
                <label style={{ fontSize: 12, fontWeight: 600, color: 'var(--jf-text-secondary)' }}>Priority</label>
                <Controller
                  name="priority"
                  control={control}
                  render={({ field }) => (
                    <div style={{ display: 'flex', gap: 8, marginTop: 6 }}>
                      {([
                        { value: 'high' as const, label: 'High', bg: '#FEF2F2', border: '#FCA5A5', color: '#EF4444' },
                        { value: 'medium' as const, label: 'Medium', bg: '#FFFBEB', border: '#FCD34D', color: '#F59E0B' },
                        { value: 'low' as const, label: 'Low', bg: 'var(--jf-interactive-subtle)', border: '#BFDBFE', color: 'var(--jf-interactive)' },
                      ]).map((p) => {
                        const selected = field.value === p.value
                        return (
                          <button
                            key={p.value}
                            type="button"
                            onClick={() => field.onChange(p.value)}
                            style={{
                              padding: '6px 14px',
                              borderRadius: 10,
                              border: `1px solid ${selected ? p.border : 'var(--jf-border)'}`,
                              fontSize: 12,
                              fontWeight: 500,
                              cursor: 'pointer',
                              background: selected ? p.bg : 'var(--jf-bg-subtle)',
                              color: selected ? p.color : 'var(--jf-text-secondary)',
                            }}
                          >
                            {p.label}
                          </button>
                        )
                      })}
                    </div>
                  )}
                />
              </div>
              <div style={{ gridColumn: '1 / -1' }}>
                <label style={{ fontSize: 12, fontWeight: 600, color: 'var(--jf-text-secondary)' }}>CV Version</label>
                <div style={{ marginTop: 4 }}>
                  <Controller
                    name="cv_version_id"
                    control={control}
                    render={({ field }) => (
                      <CVVersionPicker
                        value={field.value ?? null}
                        onChange={(id) => field.onChange(id)}
                        disabled={isCVVersionLocked}
                      />
                    )}
                  />
                </div>
              </div>
            </div>
            <div style={{ display: 'flex', gap: 10, marginTop: 20, justifyContent: 'flex-end' }}>
              <button
                type="button"
                onClick={() => { reset(); setEditing(false) }}
                style={{
                  border: '1px solid var(--jf-border)',
                  borderRadius: 10,
                  padding: '8px 16px',
                  fontSize: 13,
                  fontWeight: 500,
                  color: 'var(--jf-text-secondary)',
                  background: 'transparent',
                  cursor: 'pointer',
                }}
              >
                Cancel
              </button>
              <button
                type="submit"
                style={{
                  borderRadius: 10,
                  padding: '8px 16px',
                  fontSize: 13,
                  fontWeight: 600,
                  color: '#fff',
                  background: 'var(--jf-interactive)',
                  border: 'none',
                  cursor: 'pointer',
                }}
              >
                Save Changes
              </button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    )
  }

  return (
    <Dialog open={open} onOpenChange={(isOpen) => { if (!isOpen) onClose() }}>
      <DialogContent
        size="2xl"
        showCloseButton={false}
        className="p-0 gap-0"
        style={{ maxWidth: 800 }}
      >
        <DialogTitle className="sr-only">{job.job_title} at {job.company_name}</DialogTitle>

        {/* ──── HEADER ──── */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '20px 24px',
            borderBottom: '1px solid var(--jf-border)',
          }}
        >
          {/* Left group */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <div
              aria-hidden="true"
              style={{
                width: 36,
                height: 36,
                borderRadius: 10,
                fontSize: 13,
                fontWeight: 700,
                color: '#fff',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                background: getCompanyColor(job.company_name),
                flexShrink: 0,
              }}
            >
              {getInitials(job.company_name)}
            </div>
            <div>
              <div style={{ fontSize: 17, fontWeight: 700, color: 'var(--jf-text-primary)' }}>
                {job.company_name}
              </div>
              <div style={{ fontSize: 13, color: 'var(--jf-text-muted)' }}>
                {job.job_title}
              </div>
            </div>
            <AnimatePresence mode="wait">
              <motion.span
                key={job.stage}
                aria-live="polite"
                initial={{ opacity: 0, y: -4 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 4 }}
                transition={{ duration: 0.15 }}
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: 6,
                  padding: '5px 12px',
                  borderRadius: 100,
                  fontSize: 12,
                  fontWeight: 600,
                  fontFamily: 'var(--font-dm-mono, monospace)',
                  marginLeft: 4,
                  background: stageRgba(stageConfig.hex, 0.1),
                  border: `1px solid ${stageRgba(stageConfig.hex, 0.25)}`,
                  color: stageConfig.hex,
                }}
              >
                <span style={{
                  width: 6,
                  height: 6,
                  borderRadius: '50%',
                  background: stageConfig.hex,
                }} />
                {stageConfig.label}
              </motion.span>
            </AnimatePresence>
          </div>

          {/* Right group */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <button
              type="button"
              onClick={() => setEditing(true)}
              style={{
                border: '1px solid var(--jf-border)',
                borderRadius: 8,
                padding: '6px 12px',
                fontSize: 12,
                fontWeight: 500,
                color: 'var(--jf-text-secondary)',
                background: 'transparent',
                display: 'flex',
                alignItems: 'center',
                gap: 5,
                cursor: 'pointer',
              }}
            >
              <svg aria-hidden="true" viewBox="0 0 20 20" fill="currentColor" style={{ width: 13, height: 13 }}>
                <path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z" />
              </svg>
              Edit
            </button>
            <button
              type="button"
              onClick={onClose}
              style={{
                width: 36,
                height: 36,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                borderRadius: 8,
                border: 'none',
                background: 'transparent',
                cursor: 'pointer',
                color: 'var(--jf-text-muted)',
              }}
              aria-label="Close"
            >
              <svg viewBox="0 0 20 20" fill="currentColor" style={{ width: 16, height: 16 }}>
                <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
              </svg>
            </button>
          </div>
        </div>

        {/* ──── META ROW ──── */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 20,
            flexWrap: 'wrap',
            padding: '14px 24px',
            borderBottom: '1px solid var(--jf-border)',
          }}
        >
          {/* Location */}
          {job.location && (
            <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 13, color: 'var(--jf-text-secondary)' }}>
              <svg aria-hidden="true" viewBox="0 0 20 20" fill="currentColor" style={{ width: 14, height: 14, color: 'var(--jf-text-muted)' }}>
                <path fillRule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd" />
              </svg>
              <span style={{ fontFamily: 'var(--font-dm-mono, monospace)', fontWeight: 500, color: 'var(--jf-text-primary)' }}>
                {job.location}
              </span>
            </div>
          )}

          {/* Salary */}
          {salaryDisplay && (
            <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 13, color: 'var(--jf-text-secondary)' }}>
              <svg aria-hidden="true" viewBox="0 0 20 20" fill="currentColor" style={{ width: 14, height: 14, color: 'var(--jf-text-muted)' }}>
                <path d="M8.433 7.418c.155-.103.346-.196.567-.267v1.698a2.305 2.305 0 01-.567-.267C8.07 8.34 8 8.114 8 8c0-.114.07-.34.433-.582zM11 12.849v-1.698c.22.071.412.164.567.267.364.243.433.468.433.582 0 .114-.07.34-.433.582a2.305 2.305 0 01-.567.267z" />
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-13a1 1 0 10-2 0v.092a4.535 4.535 0 00-1.676.662C6.602 6.234 6 7.009 6 8c0 .99.602 1.765 1.324 2.246.48.32 1.054.545 1.676.662v1.941c-.391-.127-.68-.317-.843-.504a1 1 0 10-1.51 1.31c.562.649 1.413 1.076 2.353 1.253V15a1 1 0 102 0v-.092a4.535 4.535 0 001.676-.662C13.398 13.766 14 12.991 14 12c0-.99-.602-1.765-1.324-2.246A4.535 4.535 0 0011 9.092V7.151c.391.127.68.317.843.504a1 1 0 101.511-1.31c-.563-.649-1.413-1.076-2.354-1.253V5z" clipRule="evenodd" />
              </svg>
              <span style={{ fontFamily: 'var(--font-dm-mono, monospace)', fontWeight: 500, color: 'var(--jf-text-primary)' }}>
                {salaryDisplay}
              </span>
            </div>
          )}

          {/* CV Version */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 13, color: 'var(--jf-text-secondary)' }}>
            <svg aria-hidden="true" viewBox="0 0 20 20" fill="currentColor" style={{ width: 14, height: 14, color: 'var(--jf-text-muted)' }}>
              <path d="M9 2a2 2 0 00-2 2v8a2 2 0 002 2h6a2 2 0 002-2V6.414A2 2 0 0016.414 5L14 2.586A2 2 0 0012.586 2H9z" />
            </svg>
            <span style={{ fontFamily: 'var(--font-dm-mono, monospace)', fontWeight: 500, color: 'var(--jf-text-primary)' }}>
              {job.cv_versions?.name ?? 'Untagged'}
            </span>
          </div>

          {/* Days in stage */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 13, color: 'var(--jf-text-secondary)' }}>
            <svg aria-hidden="true" viewBox="0 0 20 20" fill="currentColor" style={{ width: 14, height: 14, color: 'var(--jf-text-muted)' }}>
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd" />
            </svg>
            <span style={{ fontFamily: 'var(--font-dm-mono, monospace)', fontWeight: 500, color: days >= 14 ? 'var(--jf-warning)' : 'var(--jf-text-primary)' }}>
              {days === 0 ? 'Today' : `${days}d in stage`}
            </span>
          </div>

          {/* Priority */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 13, color: 'var(--jf-text-secondary)', marginLeft: 'auto' }}>
            <span
              style={{
                width: 7,
                height: 7,
                borderRadius: '50%',
                background: job.priority === 'high' ? '#EF4444' : job.priority === 'medium' ? '#F59E0B' : '#10B981',
              }}
            />
            <span style={{ fontWeight: 500, color: 'var(--jf-text-primary)' }}>
              {job.priority.charAt(0).toUpperCase() + job.priority.slice(1)} priority
            </span>
          </div>
        </div>

        {/* ──── TWO COLUMN BODY ──── */}
        <div
          className="overflow-y-auto"
          style={{
            maxHeight: 'calc(90dvh - 160px)',
            display: 'grid',
            gridTemplateColumns: '1fr 320px',
          }}
        >
          {/* ──── LEFT COLUMN ──── */}
          <div style={{ padding: 24, borderRight: '1px solid var(--jf-border)' }}>

            {/* MOVE TO STAGE */}
            <div>
              <div style={{
                fontSize: 12,
                fontWeight: 600,
                textTransform: 'uppercase' as const,
                letterSpacing: '0.06em',
                color: 'var(--jf-text-muted)',
                marginBottom: 12,
                fontFamily: 'var(--font-dm-mono, monospace)',
              }}>
                Move to Stage
              </div>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                {STAGES.map((stage) => {
                  const cfg = STAGE_CONFIG[stage]
                  const isCurrent = job.stage === stage
                  return (
                    <button
                      key={stage}
                      type="button"
                      onClick={() => { if (!isCurrent) handleStageChange(stage) }}
                      style={{
                        padding: '6px 12px',
                        borderRadius: 100,
                        border: isCurrent
                          ? `1px solid ${cfg.hex}`
                          : '1px solid var(--jf-border)',
                        fontSize: 11,
                        fontWeight: isCurrent ? 600 : 500,
                        cursor: isCurrent ? 'default' : 'pointer',
                        fontFamily: 'var(--font-dm-mono, monospace)',
                        background: isCurrent ? cfg.hex : 'var(--jf-bg-subtle)',
                        color: isCurrent ? '#fff' : 'var(--jf-text-secondary)',
                      }}
                    >
                      {isCurrent ? `● ${cfg.label}` : cfg.label}
                    </button>
                  )
                })}
              </div>
            </div>

            {/* NOTES */}
            <div style={{ marginTop: 24 }}>
              <div style={{
                fontSize: 12,
                fontWeight: 600,
                textTransform: 'uppercase' as const,
                letterSpacing: '0.06em',
                color: 'var(--jf-text-muted)',
                marginBottom: 12,
                fontFamily: 'var(--font-dm-mono, monospace)',
              }}>
                Notes
              </div>
              <textarea
                value={notesValue}
                onChange={(e) => setNotesValue(e.target.value)}
                onBlur={handleNotesBlur}
                placeholder="Add notes about this application..."
                style={{
                  padding: '9px 12px',
                  border: '1px solid var(--jf-border)',
                  borderRadius: 10,
                  fontSize: 13,
                  color: 'var(--jf-text-primary)',
                  background: 'var(--jf-bg-card)',
                  outline: 'none',
                  resize: 'vertical',
                  minHeight: 80,
                  width: '100%',
                  lineHeight: 1.5,
                  fontFamily: 'inherit',
                }}
                onFocus={(e) => {
                  e.currentTarget.style.borderColor = 'var(--jf-interactive)'
                  e.currentTarget.style.boxShadow = '0 0 0 3px rgba(37,99,235,0.1)'
                }}
                onBlurCapture={(e) => {
                  e.currentTarget.style.borderColor = 'var(--jf-border)'
                  e.currentTarget.style.boxShadow = 'none'
                }}
              />
            </div>

            {/* JOB POSTING */}
            <div style={{ marginTop: 24 }}>
              <div style={{
                fontSize: 12,
                fontWeight: 600,
                textTransform: 'uppercase' as const,
                letterSpacing: '0.06em',
                color: 'var(--jf-text-muted)',
                marginBottom: 12,
                fontFamily: 'var(--font-dm-mono, monospace)',
              }}>
                Job Posting
              </div>
              {job.job_url ? (
                <a
                  href={job.job_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 8,
                    padding: '10px 14px',
                    border: '1px solid var(--jf-border)',
                    borderRadius: 10,
                    background: 'var(--jf-bg-subtle)',
                    textDecoration: 'none',
                  }}
                >
                  <svg aria-hidden="true" viewBox="0 0 20 20" fill="currentColor" style={{ width: 14, height: 14, color: 'var(--jf-interactive)', flexShrink: 0 }}>
                    <path fillRule="evenodd" d="M12.586 4.586a2 2 0 112.828 2.828l-3 3a2 2 0 01-2.828 0 1 1 0 00-1.414 1.414 4 4 0 005.656 0l3-3a4 4 0 00-5.656-5.656l-1.5 1.5a1 1 0 101.414 1.414l1.5-1.5zm-5 5a2 2 0 012.828 0 1 1 0 101.414-1.414 4 4 0 00-5.656 0l-3 3a4 4 0 105.656 5.656l1.5-1.5a1 1 0 10-1.414-1.414l-1.5 1.5a2 2 0 11-2.828-2.828l3-3z" clipRule="evenodd" />
                  </svg>
                  <span style={{
                    fontFamily: 'var(--font-dm-mono, monospace)',
                    fontSize: 13,
                    color: 'var(--jf-interactive)',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    whiteSpace: 'nowrap',
                  }}>
                    {job.job_url}
                  </span>
                </a>
              ) : (
                <div style={{
                  fontSize: 12,
                  color: 'var(--jf-text-muted)',
                  padding: 12,
                  background: 'var(--jf-bg-subtle)',
                  borderRadius: 10,
                  border: '1px dashed var(--jf-border)',
                  textAlign: 'center',
                }}>
                  No job URL added. Click Edit to add one.
                </div>
              )}
            </div>
          </div>

          {/* ──── RIGHT COLUMN ──── */}
          <div style={{ padding: 24 }}>

            {/* STAGE HISTORY */}
            <div>
              <div style={{
                fontSize: 12,
                fontWeight: 600,
                textTransform: 'uppercase' as const,
                letterSpacing: '0.06em',
                color: 'var(--jf-text-muted)',
                marginBottom: 12,
                fontFamily: 'var(--font-dm-mono, monospace)',
              }}>
                Stage History
              </div>
              <div style={{ display: 'flex', flexDirection: 'column' }}>
                {history.length === 0 ? (
                  <div style={{
                    fontSize: 12,
                    color: 'var(--jf-text-muted)',
                    padding: 12,
                    background: 'var(--jf-bg-subtle)',
                    borderRadius: 10,
                    border: '1px dashed var(--jf-border)',
                    textAlign: 'center',
                  }}>
                    No stage transitions yet.
                  </div>
                ) : (
                  history.map((entry, idx) => {
                    const stageCfg = STAGE_CONFIG[entry.to_stage]
                    const isLast = idx === history.length - 1
                    return (
                      <div
                        key={entry.id}
                        style={{
                          display: 'flex',
                          gap: 14,
                          position: 'relative',
                          paddingBottom: isLast ? 0 : 16,
                        }}
                      >
                        {/* Dot */}
                        <div style={{ position: 'relative', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                          <span
                            style={{
                              width: 10,
                              height: 10,
                              borderRadius: '50%',
                              flexShrink: 0,
                              marginTop: 5,
                              zIndex: 1,
                              background: stageCfg?.hex ?? '#94A3B8',
                            }}
                          />
                          {!isLast && (
                            <span
                              style={{
                                position: 'absolute',
                                left: 4,
                                top: 15,
                                bottom: 0,
                                width: 2,
                                background: 'var(--jf-border)',
                              }}
                            />
                          )}
                        </div>
                        {/* Content */}
                        <div>
                          <div style={{ fontSize: 13, fontWeight: 500, color: 'var(--jf-text-primary)' }}>
                            {stageCfg?.label ?? entry.to_stage}
                          </div>
                          <div style={{
                            fontSize: 11,
                            color: 'var(--jf-text-muted)',
                            fontFamily: 'var(--font-dm-mono, monospace)',
                            marginTop: 2,
                          }}>
                            {formatHistoryDate(entry.transitioned_at)}
                          </div>
                        </div>
                      </div>
                    )
                  })
                )}
              </div>
            </div>

            {/* LINKED STORIES */}
            <div style={{ marginTop: 24 }}>
              <div style={{
                fontSize: 12,
                fontWeight: 600,
                textTransform: 'uppercase' as const,
                letterSpacing: '0.06em',
                color: 'var(--jf-text-muted)',
                marginBottom: 12,
                fontFamily: 'var(--font-dm-mono, monospace)',
              }}>
                Linked Stories
              </div>
              <div style={{
                fontSize: 12,
                color: 'var(--jf-text-muted)',
                padding: 12,
                background: 'var(--jf-bg-subtle)',
                borderRadius: 10,
                border: '1px dashed var(--jf-border)',
                textAlign: 'center',
              }}>
                No stories linked yet.
                <br />
                <Link
                  href="/app/stories"
                  onClick={onClose}
                  style={{
                    color: 'var(--jf-interactive)',
                    fontSize: 12,
                    fontWeight: 500,
                    textDecoration: 'none',
                    marginTop: 4,
                    display: 'inline-block',
                  }}
                >
                  Browse Story Library →
                </Link>
              </div>
            </div>

            {/* DANGER ZONE */}
            <div style={{ marginTop: 24 }}>
              <div style={{
                fontSize: 12,
                fontWeight: 600,
                textTransform: 'uppercase' as const,
                letterSpacing: '0.06em',
                color: 'var(--jf-text-muted)',
                marginBottom: 12,
                fontFamily: 'var(--font-dm-mono, monospace)',
              }}>
                Danger Zone
              </div>
              <button
                type="button"
                onClick={handleDeleteClick}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 6,
                  padding: '8px 14px',
                  border: confirmDelete ? '1px solid #EF4444' : '1px solid rgba(239,68,68,0.3)',
                  borderRadius: 10,
                  background: confirmDelete ? 'rgba(239,68,68,0.1)' : 'rgba(239,68,68,0.04)',
                  color: '#EF4444',
                  fontSize: 12,
                  fontWeight: 500,
                  cursor: 'pointer',
                  width: '100%',
                }}
              >
                <svg aria-hidden="true" viewBox="0 0 20 20" fill="currentColor" style={{ width: 14, height: 14 }}>
                  <path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" />
                </svg>
                {confirmDelete ? 'Click again to confirm' : 'Delete Application'}
              </button>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
