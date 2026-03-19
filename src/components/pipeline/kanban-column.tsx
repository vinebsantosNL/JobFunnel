'use client'

import { useDroppable } from '@dnd-kit/core'
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable'
import type { JobApplication, Stage } from '@/types/database'
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
    <div className="flex flex-col w-72 flex-shrink-0">
      {/* Column header */}
      <div className={`flex items-center justify-between px-3 py-2 rounded-t-xl ${config.bgColor} border ${config.borderColor}`}>
        <div className="flex items-center gap-2">
          <span className={`w-2 h-2 rounded-full ${config.dotColor}`} />
          <span className={`text-sm font-medium ${config.color}`}>{config.label}</span>
        </div>
        <span className="text-xs text-gray-400 bg-white rounded-full px-2 py-0.5 border">
          {jobs.length}
        </span>
      </div>

      {/* Drop zone */}
      <div
        ref={setNodeRef}
        className={`flex-1 min-h-[200px] p-2 space-y-2 rounded-b-xl border-x border-b transition-colors ${
          isOver ? 'bg-blue-50 border-blue-200' : 'bg-gray-50/80 border-gray-200'
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
