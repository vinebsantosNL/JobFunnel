'use client'

import { useState, useMemo } from 'react'
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
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { useJobs, useCreateJob, useUpdateJob, useDeleteJob } from '@/hooks/use-jobs'
import { createJobSchema, type CreateJobInput, type UpdateJobInput } from '@/lib/validations/job'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'

/* ------------------------------------------------------------------ */
/*  AddJobForm — local component for the "Add Application" dialog     */
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
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
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

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <div>
          <Label htmlFor="add-company" className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
            Company Name *
          </Label>
          <Input
            id="add-company"
            className="mt-1"
            aria-invalid={!!errors.company_name}
            {...register('company_name')}
          />
          {errors.company_name && <p className="text-xs text-red-500 mt-0.5">{errors.company_name.message}</p>}
        </div>
        <div>
          <Label htmlFor="add-title" className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
            Job Title *
          </Label>
          <Input
            id="add-title"
            className="mt-1"
            aria-invalid={!!errors.job_title}
            {...register('job_title')}
          />
          {errors.job_title && <p className="text-xs text-red-500 mt-0.5">{errors.job_title.message}</p>}
        </div>
      </div>

      <div>
        <Label htmlFor="add-location" className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
          Location
        </Label>
        <Input id="add-location" placeholder="Amsterdam, NL" className="mt-1" {...register('location')} />
      </div>

      <div>
        <Label htmlFor="add-url" className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
          Job URL
        </Label>
        <Input id="add-url" type="url" placeholder="https://..." className="mt-1" {...register('job_url')} />
        {errors.job_url && <p className="text-xs text-red-500 mt-0.5">{errors.job_url.message}</p>}
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div>
          <Label htmlFor="add-smin" className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
            Salary Min
          </Label>
          <Input id="add-smin" type="number" className="mt-1" {...register('salary_min', { valueAsNumber: true })} />
        </div>
        <div>
          <Label htmlFor="add-smax" className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
            Salary Max
          </Label>
          <Input id="add-smax" type="number" className="mt-1" {...register('salary_max', { valueAsNumber: true })} />
        </div>
      </div>

      {/* Stage pills */}
      <div>
        <Label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Stage</Label>
        <Controller
          name="stage"
          control={control}
          render={({ field }) => (
            <div className="flex flex-wrap gap-2 mt-1.5">
              {STAGES.filter(s => s !== 'hired').map((stage) => {
                const cfg = STAGE_CONFIG[stage]
                const selected = field.value === stage
                return (
                  <button
                    key={stage}
                    type="button"
                    onClick={() => field.onChange(stage)}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium transition-colors"
                    style={{
                      border: selected ? `2px solid ${cfg.hex}` : '1px solid var(--jf-border)',
                      background: selected ? `${cfg.hex}15` : 'transparent',
                      color: selected ? cfg.hex : 'var(--jf-text-secondary)',
                    }}
                  >
                    <span
                      aria-hidden="true"
                      style={{
                        width: 6,
                        height: 6,
                        borderRadius: '50%',
                        background: cfg.hex,
                      }}
                    />
                    {cfg.label}
                  </button>
                )
              })}
            </div>
          )}
        />
      </div>

      {/* Priority pills */}
      <div>
        <Label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Priority</Label>
        <Controller
          name="priority"
          control={control}
          render={({ field }) => {
            const priorities: { value: Priority; label: string; color: string }[] = [
              { value: 'high', label: 'High', color: '#EF4444' },
              { value: 'medium', label: 'Medium', color: '#F59E0B' },
              { value: 'low', label: 'Low', color: '#94A3B8' },
            ]
            return (
              <div className="flex gap-2 mt-1.5">
                {priorities.map((p) => {
                  const selected = field.value === p.value
                  return (
                    <button
                      key={p.value}
                      type="button"
                      onClick={() => field.onChange(p.value)}
                      className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium transition-colors"
                      style={{
                        border: selected ? `2px solid ${p.color}` : '1px solid var(--jf-border)',
                        background: selected ? `${p.color}15` : 'transparent',
                        color: selected ? p.color : 'var(--jf-text-secondary)',
                      }}
                    >
                      <span
                        aria-hidden="true"
                        style={{
                          width: 6,
                          height: 6,
                          borderRadius: '50%',
                          background: p.color,
                        }}
                      />
                      {p.label}
                    </button>
                  )
                })}
              </div>
            )
          }}
        />
      </div>

      {/* Notes */}
      <div>
        <Label htmlFor="add-notes" className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
          Notes
        </Label>
        <Textarea id="add-notes" rows={3} className="mt-1" {...register('notes')} />
      </div>

      {/* Actions */}
      <div className="flex flex-col gap-2 pt-1">
        <Button type="submit" className="w-full" disabled={isSubmitting}>
          {isSubmitting ? 'Adding...' : 'Add Application'}
        </Button>
        <Button type="button" variant="ghost" className="w-full" onClick={onCancel}>
          Cancel
        </Button>
      </div>
    </form>
  )
}

/* ------------------------------------------------------------------ */
/*  KanbanBoard                                                        */
/* ------------------------------------------------------------------ */

export function KanbanBoard() {
  const [search, setSearch] = useState('')
  const [priority, setPriority] = useState('all')
  const [cvVersionIds, setCVVersionIds] = useState<string[]>([])
  const [selectedJob, setSelectedJob] = useState<JobApplication | null>(null)
  const [activeJob, setActiveJob] = useState<JobApplication | null>(null)
  const [pendingMove, setPendingMove] = useState<{ job: JobApplication; newStage: Stage } | null>(null)
  const [addModalOpen, setAddModalOpen] = useState(false)
  const [addModalStage, setAddModalStage] = useState<Stage>('saved')

  const { data: rawJobs = [], isLoading, error, refetch } = useJobs({ search, priority })

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
    <div className="flex flex-col h-full gap-4">
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
        <div className="flex gap-3 overflow-x-auto pb-4 min-w-0">
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
          <DialogContent size="lg">
            <DialogHeader>
              <DialogTitle>Add Application</DialogTitle>
            </DialogHeader>
            <AddJobForm
              defaultStage={addModalStage}
              onSubmit={async (input) => {
                await handleAddJob(input)
                setAddModalOpen(false)
              }}
              onCancel={() => setAddModalOpen(false)}
            />
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
