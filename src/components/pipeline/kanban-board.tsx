'use client'

import { useState, useMemo, useEffect } from 'react'
import {
  DndContext,
  DragOverlay,
  PointerSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
  type DragStartEvent,
} from '@dnd-kit/core'
import { useForm, Controller } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import type { JobApplication, Stage, Priority } from '@/types/database.types'
import { STAGES, STAGE_CONFIG, SEQUENTIAL_STAGES, STAGE_ORDER, ACTIVE_STAGES } from '@/lib/stages'
import { KanbanColumn } from './kanban-column'
import { ApplicationCard } from './application-card'
import { ApplicationModal } from './application-modal'
import { FilterBar } from './filter-bar'
import { Button } from '@/components/ui/button'
import { useJobs, useCreateJob, useUpdateJob, useDeleteJob } from '@/hooks/use-jobs'
import { createJobSchema, type CreateJobInput, type UpdateJobInput } from '@/lib/validations/job'
import { useCVVersions } from '@/hooks/useCVVersions'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'

/* ------------------------------------------------------------------ */
/*  ADD_MODAL_STAGES — stages available when creating a new app        */
/* ------------------------------------------------------------------ */
const ADD_MODAL_STAGES: Stage[] = ['saved', 'applied', 'screening', 'interviewing', 'offer']

/* ------------------------------------------------------------------ */
/*  AddJobForm — local component for the "Add Application" dialog      */
/* ------------------------------------------------------------------ */

interface AddJobFormProps {
  defaultStage: Stage
  onSubmit: (input: CreateJobInput) => Promise<void>
  onCancel: () => void
}

function AddJobForm({ defaultStage, onSubmit, onCancel }: AddJobFormProps) {
  const {
    register,
    handleSubmit,
    control,
    formState: { errors, isSubmitting },
  } = useForm<CreateJobInput>({
    resolver: zodResolver(createJobSchema) as never,
    defaultValues: {
      stage: defaultStage,
      priority: 'medium',
      company_name: '',
      job_title: '',
      job_url: '',
      location: '',
      notes: '',
    },
  })

  const { data: versions = [] } = useCVVersions(false)
  const activeVersions = versions.filter((v) => !v.is_archived)

  const inputStyle: React.CSSProperties = {
    padding: '9px 12px',
    border: '1px solid var(--jf-border)',
    borderRadius: 10,
    fontSize: 13,
    color: 'var(--jf-text-primary)',
    background: 'var(--jf-bg-card)',
    outline: 'none',
    width: '100%',
  }

  const labelStyle: React.CSSProperties = {
    fontSize: 12,
    fontWeight: 600,
    color: 'var(--jf-text-secondary)',
  }

  function handleInputFocus(e: React.FocusEvent<HTMLInputElement | HTMLSelectElement>) {
    e.currentTarget.style.borderColor = 'var(--jf-interactive)'
    e.currentTarget.style.boxShadow = 'var(--jf-focus-ring)'
  }
  function handleInputBlur(e: React.FocusEvent<HTMLInputElement | HTMLSelectElement>) {
    e.currentTarget.style.borderColor = 'var(--jf-border)'
    e.currentTarget.style.boxShadow = 'none'
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      {/* Form fields */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
        {/* Company Name — full width */}
        <div style={{ gridColumn: '1 / -1' }}>
          <label style={labelStyle}>Company Name *</label>
          <input
            {...register('company_name')}
            aria-invalid={!!errors.company_name}
            style={{ ...inputStyle, marginTop: 4 }}
            onFocus={handleInputFocus}
            onBlur={handleInputBlur}
          />
          {errors.company_name && <p style={{ fontSize: 11, color: 'var(--jf-error)', marginTop: 2 }}>{errors.company_name.message}</p>}
        </div>

        {/* Job Title — full width */}
        <div style={{ gridColumn: '1 / -1' }}>
          <label style={labelStyle}>Job Title *</label>
          <input
            {...register('job_title')}
            aria-invalid={!!errors.job_title}
            style={{ ...inputStyle, marginTop: 4 }}
            onFocus={handleInputFocus}
            onBlur={handleInputBlur}
          />
          {errors.job_title && <p style={{ fontSize: 11, color: 'var(--jf-error)', marginTop: 2 }}>{errors.job_title.message}</p>}
        </div>

        {/* Location */}
        <div>
          <label style={labelStyle}>Location</label>
          <input
            {...register('location')}
            placeholder="Amsterdam, NL"
            style={{ ...inputStyle, marginTop: 4 }}
            onFocus={handleInputFocus}
            onBlur={handleInputBlur}
          />
        </div>

        {/* Job URL */}
        <div>
          <label style={labelStyle}>Job URL</label>
          <input
            {...register('job_url')}
            type="url"
            placeholder="https://..."
            style={{ ...inputStyle, marginTop: 4 }}
            onFocus={handleInputFocus}
            onBlur={handleInputBlur}
          />
          {errors.job_url && <p style={{ fontSize: 11, color: 'var(--jf-error)', marginTop: 2 }}>{errors.job_url.message}</p>}
        </div>

        {/* Salary Min */}
        <div>
          <label style={labelStyle}>Salary Min (&euro;)</label>
          <input
            type="number"
            {...register('salary_min', { valueAsNumber: true })}
            style={{ ...inputStyle, marginTop: 4 }}
            onFocus={handleInputFocus}
            onBlur={handleInputBlur}
          />
        </div>

        {/* Salary Max */}
        <div>
          <label style={labelStyle}>Salary Max (&euro;)</label>
          <input
            type="number"
            {...register('salary_max', { valueAsNumber: true })}
            style={{ ...inputStyle, marginTop: 4 }}
            onFocus={handleInputFocus}
            onBlur={handleInputBlur}
          />
        </div>
      </div>

      {/* Stage selector */}
      <div style={{ marginTop: 14 }}>
        <label style={labelStyle}>Stage</label>
        <Controller
          name="stage"
          control={control}
          render={({ field }) => (
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginTop: 6 }}>
              {ADD_MODAL_STAGES.map((stage) => {
                const cfg = STAGE_CONFIG[stage]
                const selected = field.value === stage
                return (
                  <button
                    key={stage}
                    type="button"
                    onClick={() => field.onChange(stage)}
                    style={{
                      padding: '6px 14px',
                      borderRadius: 100,
                      border: selected
                        ? `1px solid ${cfg.hex}`
                        : '1px solid var(--jf-border)',
                      fontSize: 12,
                      fontWeight: 500,
                      cursor: 'pointer',
                      fontFamily: 'var(--font-dm-mono, monospace)',
                      background: selected ? cfg.hex : 'var(--jf-bg-subtle)',
                      color: selected ? '#fff' : 'var(--jf-text-secondary)',
                    }}
                  >
                    {cfg.label}
                  </button>
                )
              })}
            </div>
          )}
        />
      </div>

      {/* Priority selector */}
      <div style={{ marginTop: 14 }}>
        <label style={labelStyle}>Priority</label>
        <Controller
          name="priority"
          control={control}
          render={({ field }) => {
            const priorities: { value: Priority; label: string; emoji: string; bg: string; border: string; color: string }[] = [
              { value: 'high', label: 'High', emoji: '\uD83D\uDD34', bg: 'var(--jf-priority-high-bg)', border: 'var(--jf-priority-high-border)', color: 'var(--jf-error)' },
              { value: 'medium', label: 'Medium', emoji: '\uD83D\uDFE1', bg: 'var(--jf-priority-medium-bg)', border: 'var(--jf-priority-medium-border)', color: 'var(--jf-warning)' },
              { value: 'low', label: 'Low', emoji: '\uD83D\uDFE2', bg: 'var(--jf-interactive-subtle)', border: 'var(--jf-priority-low-border)', color: 'var(--jf-interactive)' },
            ]
            return (
              <div style={{ display: 'flex', gap: 8, marginTop: 6 }}>
                {priorities.map((p) => {
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
                      {p.emoji} {p.label}
                    </button>
                  )
                })}
              </div>
            )
          }}
        />
      </div>

      {/* CV Version select */}
      {activeVersions.length > 0 && (
        <div style={{ marginTop: 14 }}>
          <label style={labelStyle}>CV Version</label>
          <Controller
            name="cv_version_id"
            control={control}
            render={({ field }) => (
              <select
                value={field.value ?? ''}
                onChange={(e) => field.onChange(e.target.value || undefined)}
                style={{ ...inputStyle, marginTop: 4 }}
                onFocus={handleInputFocus}
                onBlur={handleInputBlur}
              >
                <option value="">No CV version</option>
                {activeVersions.map((v) => (
                  <option key={v.id} value={v.id}>{v.name}</option>
                ))}
              </select>
            )}
          />
        </div>
      )}

      {/* Footer */}
      <div style={{
        display: 'flex',
        justifyContent: 'flex-end',
        gap: 10,
        marginTop: 20,
        paddingTop: 16,
        borderTop: '1px solid var(--jf-border)',
      }}>
        <button
          type="button"
          onClick={onCancel}
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
          disabled={isSubmitting}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 6,
            borderRadius: 10,
            padding: '8px 16px',
            fontSize: 13,
            fontWeight: 600,
            color: '#fff',
            background: 'var(--jf-interactive)',
            border: 'none',
            cursor: isSubmitting ? 'not-allowed' : 'pointer',
            opacity: isSubmitting ? 0.7 : 1,
          }}
        >
          <svg aria-hidden="true" viewBox="0 0 20 20" fill="currentColor" style={{ width: 14, height: 14 }}>
            <path fillRule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clipRule="evenodd" />
          </svg>
          {isSubmitting ? 'Adding...' : 'Add to Pipeline'}
        </button>
      </div>
    </form>
  )
}

/* ------------------------------------------------------------------ */
/*  KanbanBoard                                                        */
/* ------------------------------------------------------------------ */

export function KanbanBoard() {
  const [search, setSearch] = useState('')
  const [debouncedSearch, setDebouncedSearch] = useState('')
  const [priority, setPriority] = useState('all')
  const [cvVersionIds, setCVVersionIds] = useState<string[]>([])
  const [selectedJob, setSelectedJob] = useState<JobApplication | null>(null)
  const [activeJob, setActiveJob] = useState<JobApplication | null>(null)
  const [pendingMove, setPendingMove] = useState<{ job: JobApplication; newStage: Stage } | null>(null)
  const [addModalOpen, setAddModalOpen] = useState(false)
  const [addModalStage, setAddModalStage] = useState<Stage>('saved')

  // Debounce search to avoid re-fetching on every keystroke
  useEffect(() => {
    const timer = setTimeout(() => setDebouncedSearch(search), 300)
    return () => clearTimeout(timer)
  }, [search])

  const { data: rawJobs = [], isLoading, isFetching, error, refetch } = useJobs({ search: debouncedSearch, priority })

  // Client-side CV version filter (AND logic with server-side priority/search filters)
  const jobs = useMemo(() => {
    if (cvVersionIds.length === 0) return rawJobs
    return rawJobs.filter((job) => {
      const selected = cvVersionIds[0]
      if (selected === '__untagged__') return job.cv_version_id === null
      return job.cv_version_id === selected
    })
  }, [rawJobs, cvVersionIds])

  const activeCount = useMemo(
    () => jobs.filter((j) => ACTIVE_STAGES.includes(j.stage)).length,
    [jobs]
  )

  const createJob = useCreateJob()
  const updateJob = useUpdateJob()
  const deleteJob = useDeleteJob()

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 3 } })
  )

  const jobsByStage = useMemo(() => {
    const map = {} as Record<Stage, JobApplication[]>
    for (const stage of STAGES) map[stage] = []
    for (const job of jobs) map[job.stage]?.push(job)
    return map
  }, [jobs])

  function handleDragStart(event: DragStartEvent) {
    const job = (event.active.data.current as { job: JobApplication }).job
    setActiveJob(job)
  }

  function handleDragEnd(event: DragEndEvent) {
    setActiveJob(null)
    const { active, over } = event
    if (!over) return

    const job = (active.data.current as { job: JobApplication }).job
    const newStage = over.id as Stage

    if (job.stage === newStage || !STAGES.includes(newStage)) return

    const oldIdx = STAGE_ORDER[job.stage]
    const newIdx = STAGE_ORDER[newStage]
    const isSkip = oldIdx !== undefined && newIdx !== undefined && (newIdx - oldIdx) > 1

    if (isSkip) {
      setPendingMove({ job, newStage })
      return
    }

    updateJob.mutate({ id: job.id, input: { stage: newStage } })
  }

  async function handleAddJob(input: CreateJobInput) {
    await createJob.mutateAsync(input)
  }

  function handleUpdate(id: string, input: UpdateJobInput) {
    updateJob.mutate({ id, input })
  }

  function handleDelete(id: string) {
    deleteJob.mutate(id)
  }

  if (isLoading) {
    return (
      <div role="status" aria-label="Loading pipeline" className="flex gap-3 p-4 overflow-x-auto">
        <span className="sr-only">Loading your pipeline...</span>
        {[1, 2, 3, 4, 5].map((col) => (
          <div key={col} className="w-64 min-w-[220px] flex-shrink-0 space-y-2">
            <div className="h-9 bg-muted rounded-lg animate-pulse" />
            {[1, 2, 3].map((card) => (
              <div key={card} className="h-24 bg-muted rounded-xl animate-pulse" />
            ))}
          </div>
        ))}
      </div>
    )
  }

  if (error) {
    return (
      <div role="alert" className="flex flex-col items-center justify-center h-64 gap-3">
        <p className="text-destructive text-sm">Failed to load jobs.</p>
        <Button variant="outline" size="sm" onClick={() => refetch()}>
          Retry
        </Button>
      </div>
    )
  }

  return (
    <div className="flex flex-col h-full">
      <FilterBar
        search={search}
        priority={priority}
        cvVersionIds={cvVersionIds}
        onSearchChange={setSearch}
        onPriorityChange={setPriority}
        onCVVersionChange={setCVVersionIds}
        activeCount={activeCount}
        onOpenAddModal={() => { setAddModalStage('saved'); setAddModalOpen(true) }}
      />

      <DndContext sensors={sensors} onDragStart={handleDragStart} onDragEnd={handleDragEnd}>
        <div
          className="flex gap-3 overflow-x-auto p-4 min-w-0 flex-1"
          style={{ opacity: isFetching ? 0.6 : 1, transition: 'opacity 0.2s ease' }}
        >
          {STAGES.map((stage) => (
            <KanbanColumn
              key={stage}
              stage={stage}
              jobs={jobsByStage[stage]}
              onCardClick={setSelectedJob}
              onAddJob={handleAddJob}
              onAddClick={(s) => { setAddModalStage(s); setAddModalOpen(true) }}
            />
          ))}
        </div>

        <DragOverlay dropAnimation={null}>
          {activeJob && (
            <ApplicationCard job={activeJob} onClick={() => {}} isOverlay />
          )}
        </DragOverlay>
      </DndContext>

      <ApplicationModal
        job={selectedJob}
        open={selectedJob !== null}
        onClose={() => setSelectedJob(null)}
        onUpdate={handleUpdate}
        onDelete={handleDelete}
      />

      {/* Add Application Modal */}
      {addModalOpen && (
        <Dialog open={addModalOpen} onOpenChange={(o) => { if (!o) setAddModalOpen(false) }}>
          <DialogContent size="lg" showCloseButton={false} className="p-0 gap-0">
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '16px 24px',
                borderBottom: '1px solid var(--jf-border)',
              }}
            >
              <DialogTitle style={{ fontSize: 17, fontWeight: 700, color: 'var(--jf-text-primary)' }}>
                Add Application
              </DialogTitle>
              <button
                type="button"
                onClick={() => setAddModalOpen(false)}
                style={{
                  width: 32,
                  height: 32,
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
            <div style={{ padding: 24 }}>
              <AddJobForm
                defaultStage={addModalStage}
                onSubmit={async (input) => {
                  await handleAddJob(input)
                  setAddModalOpen(false)
                }}
                onCancel={() => setAddModalOpen(false)}
              />
            </div>
          </DialogContent>
        </Dialog>
      )}

      {/* Skip Stage Confirmation Modal */}
      {pendingMove && (
        <Dialog open onOpenChange={(open) => { if (!open) setPendingMove(null) }}>
          <DialogContent size="md">
            <DialogHeader>
              <DialogTitle>Confirm Stage Jump</DialogTitle>
            </DialogHeader>
            <div className="text-sm text-muted-foreground space-y-1 mt-1">
              {(() => {
                const fromLabel = STAGE_CONFIG[pendingMove.job.stage].label
                const toLabel = STAGE_CONFIG[pendingMove.newStage].label
                const fromIdx = STAGE_ORDER[pendingMove.job.stage] ?? 0
                const toIdx = STAGE_ORDER[pendingMove.newStage] ?? 0
                const skipped = SEQUENTIAL_STAGES.slice(fromIdx + 1, toIdx).map(
                  (s) => STAGE_CONFIG[s].label
                )
                const nextStage = SEQUENTIAL_STAGES[fromIdx + 1]
                return (
                  <>
                    <p>
                      You&apos;re moving <strong>{pendingMove.job.job_title}</strong> from{' '}
                      <strong>{fromLabel}</strong> directly to <strong>{toLabel}</strong>
                      {skipped.length > 0 && `, skipping ${skipped.join(', ')}`}.
                    </p>
                    <p className="text-muted-foreground/70 mt-2">
                      Was this intentional? If you confirm, intermediate stages will be logged
                      automatically to preserve your funnel metrics.
                    </p>
                    <div className="flex flex-col gap-2 mt-4">
                      <Button
                        className="w-full"
                        onClick={() => {
                          updateJob.mutate({ id: pendingMove.job.id, input: { stage: pendingMove.newStage } })
                          setPendingMove(null)
                        }}
                      >
                        Yes, move to {toLabel}
                      </Button>
                      {nextStage && nextStage !== pendingMove.newStage && (
                        <Button
                          variant="secondary"
                          className="w-full"
                          onClick={() => {
                            updateJob.mutate({ id: pendingMove.job.id, input: { stage: nextStage } })
                            setPendingMove(null)
                          }}
                        >
                          No, move to {STAGE_CONFIG[nextStage].label} instead
                        </Button>
                      )}
                      <Button
                        variant="ghost"
                        className="w-full"
                        onClick={() => setPendingMove(null)}
                      >
                        Cancel
                      </Button>
                    </div>
                  </>
                )
              })()}
            </div>
          </DialogContent>
        </Dialog>
      )}
    </div>
  )
}
