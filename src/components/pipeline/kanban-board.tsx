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
import type { JobApplication, Stage } from '@/types/database'
import { STAGES, STAGE_CONFIG, SEQUENTIAL_STAGES, STAGE_ORDER, ACTIVE_STAGES } from '@/lib/stages'
import { KanbanColumn } from './kanban-column'
import { ApplicationCard } from './application-card'
import { ApplicationModal } from './application-modal'
import { FilterBar } from './filter-bar'
import { useJobs, useCreateJob, useUpdateJob, useDeleteJob } from '@/hooks/use-jobs'
import type { CreateJobInput, UpdateJobInput } from '@/lib/validations/job'
import {
  Dialog,
  DialogContent,
  DialogTitle,
} from '@/components/ui/dialog'

export function KanbanBoard() {
  const [search, setSearch] = useState('')
  const [priority, setPriority] = useState('all')
  const [cvVersionIds, setCVVersionIds] = useState<string[]>([])
  const [selectedJob, setSelectedJob] = useState<JobApplication | null>(null)
  const [activeJob, setActiveJob] = useState<JobApplication | null>(null)
  const [pendingMove, setPendingMove] = useState<{ job: JobApplication; newStage: Stage } | null>(null)

  const { data: rawJobs = [], isLoading, error } = useJobs({ search, priority })

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
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } })
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
      <div className="flex items-center justify-center h-64">
        <p className="text-gray-400 text-sm">Loading pipeline...</p>
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-64">
        <p className="text-red-500 text-sm">Failed to load jobs. Please refresh.</p>
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
            />
          ))}
        </div>

        <DragOverlay>
          {activeJob && (
            <ApplicationCard job={activeJob} onClick={() => {}} />
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

      {/* Skip Stage Confirmation Modal */}
      {pendingMove && (
        <Dialog open onOpenChange={(open) => { if (!open) setPendingMove(null) }}>
          <DialogContent className="max-w-md">
            <DialogTitle className="text-base font-semibold">Confirm Stage Jump</DialogTitle>
            <div className="text-sm text-gray-600 space-y-1 mt-1">
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
                    <p className="text-gray-400 mt-2">
                      Was this intentional? If you confirm, intermediate stages will be logged
                      automatically to preserve your funnel metrics.
                    </p>
                    <div className="flex flex-col gap-2 mt-4">
                      <button
                        className="w-full px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded-lg transition-colors"
                        onClick={() => {
                          updateJob.mutate({ id: pendingMove.job.id, input: { stage: pendingMove.newStage } })
                          setPendingMove(null)
                        }}
                      >
                        Yes, move to {toLabel}
                      </button>
                      {nextStage && nextStage !== pendingMove.newStage && (
                        <button
                          className="w-full px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 text-sm font-medium rounded-lg transition-colors"
                          onClick={() => {
                            updateJob.mutate({ id: pendingMove.job.id, input: { stage: nextStage } })
                            setPendingMove(null)
                          }}
                        >
                          No, move to {STAGE_CONFIG[nextStage].label} instead
                        </button>
                      )}
                      <button
                        className="w-full px-4 py-2 text-gray-400 hover:text-gray-600 text-sm transition-colors"
                        onClick={() => setPendingMove(null)}
                      >
                        Cancel
                      </button>
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
