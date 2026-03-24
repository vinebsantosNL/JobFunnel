'use client'

import { useDroppable } from '@dnd-kit/core'
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable'
import type { JobApplication, Stage } from '@/types/database.types'
import { STAGE_CONFIG } from '@/lib/stages'
import { ApplicationCard } from './application-card'
import { QuickAddForm } from './quick-add-form'
import type { CreateJobInput } from '@/lib/validations/job'

interface KanbanColumnProps {
  stage: Stage
  jobs: JobApplication[]
  onCardClick: (job: JobApplication) => void
  onAddJob: (input: CreateJobInput) => Promise<void>
}

export function KanbanColumn({ stage, jobs, onCardClick, onAddJob }: KanbanColumnProps) {
  const { setNodeRef, isOver } = useDroppable({ id: stage })
  const config = STAGE_CONFIG[stage]

  return (
    <div
      role="region"
      aria-label={`${config.label} column`}
      className="flex flex-col w-64 min-w-[220px] flex-1 max-w-xs xl:max-w-sm 2xl:max-w-none"
    >
      {/* Column header */}
      <div className={`flex items-center justify-between px-3 py-2 rounded-t-xl ${config.bgColor} border ${config.borderColor}`}>
        <div className="flex items-center gap-2">
          {/* aria-hidden — color is decorative; label conveys stage identity */}
          <span aria-hidden="true" className={`w-2 h-2 rounded-full ${config.dotColor}`} />
          <span className={`text-sm font-medium ${config.color}`}>{config.label}</span>
        </div>
        <span
          aria-label={`${jobs.length} job${jobs.length !== 1 ? 's' : ''}`}
          className="text-xs text-muted-foreground bg-card rounded-full px-2 py-0.5 border border-border"
        >
          {jobs.length}
        </span>
      </div>

      {/* Drop zone */}
      <div
        ref={setNodeRef}
        className={`flex-1 min-h-[200px] p-2 space-y-2 rounded-b-xl border-x border-b transition-colors duration-100 ${
          isOver ? 'bg-primary/5 border-primary/30' : 'bg-muted/50 border-border'
        }`}
      >
        <SortableContext items={jobs.map(j => j.id)} strategy={verticalListSortingStrategy}>
          {jobs.map(job => (
            <ApplicationCard key={job.id} job={job} onClick={onCardClick} />
          ))}
        </SortableContext>

        <QuickAddForm stage={stage} onAdd={onAddJob} />
      </div>
    </div>
  )
}
