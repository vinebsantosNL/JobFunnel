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
import { STAGES } from '@/lib/stages'
import { KanbanColumn } from './kanban-column'
import { ApplicationCard } from './application-card'
import { ApplicationModal } from './application-modal'
import { FilterBar } from './filter-bar'
import { useJobs, useCreateJob, useUpdateJob, useDeleteJob } from '@/hooks/use-jobs'
import type { CreateJobInput, UpdateJobInput } from '@/lib/validations/job'

export function KanbanBoard() {
  const [search, setSearch] = useState('')
  const [priority, setPriority] = useState('all')
  const [cvVersionIds, setCVVersionIds] = useState<string[]>([])
  const [selectedJob, setSelectedJob] = useState<JobApplication | null>(null)
  const [activeJob, setActiveJob] = useState<JobApplication | null>(null)

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

    if (job.stage !== newStage && STAGES.includes(newStage)) {
      updateJob.mutate({ id: job.id, input: { stage: newStage } })
    }
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
        totalCount={jobs.length}
      />

      <DndContext sensors={sensors} onDragStart={handleDragStart} onDragEnd={handleDragEnd}>
        <div className="flex gap-3 overflow-x-auto pb-4 min-w-0">
          {STAGES.map(stage => (
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
    </div>
  )
}
