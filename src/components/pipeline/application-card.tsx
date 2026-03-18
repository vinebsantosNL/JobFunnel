'use client'

import { useSortable } from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import type { JobApplication } from '@/types/database'
import { PRIORITY_CONFIG } from '@/lib/stages'
import { Badge } from '@/components/ui/badge'

interface ApplicationCardProps {
  job: JobApplication
  onClick: (job: JobApplication) => void
}

function getDaysInStage(stageUpdatedAt: string): number {
  const diff = Date.now() - new Date(stageUpdatedAt).getTime()
  return Math.floor(diff / (1000 * 60 * 60 * 24))
}

export function ApplicationCard({ job, onClick }: ApplicationCardProps) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: job.id,
    data: { job },
  })

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  }

  const days = getDaysInStage(job.stage_updated_at)
  const priority = PRIORITY_CONFIG[job.priority]

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      onClick={() => onClick(job)}
      className="bg-white rounded-lg border border-gray-100 p-3 shadow-sm hover:shadow-md hover:border-gray-200 transition-all cursor-grab active:cursor-grabbing select-none"
    >
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0 flex-1">
          <p className="font-medium text-sm text-gray-900 truncate">{job.company_name}</p>
          <p className="text-xs text-gray-500 truncate mt-0.5">{job.job_title}</p>
        </div>
        <div
          className={`w-2 h-2 rounded-full mt-1 flex-shrink-0 ${priority.color}`}
          title={`${priority.label} priority`}
        />
      </div>

      <div className="flex items-center justify-between mt-2">
        {job.location && (
          <span className="text-xs text-gray-400 truncate">{job.location}</span>
        )}
        <Badge variant="secondary" className="text-xs ml-auto">
          {days === 0 ? 'Today' : `${days}d`}
        </Badge>
      </div>

      {job.salary_min && (
        <p className="text-xs text-gray-400 mt-1">
          {job.salary_currency ?? '€'}{job.salary_min.toLocaleString()}
          {job.salary_max ? `–${job.salary_max.toLocaleString()}` : '+'}
        </p>
      )}

      {job.cv_versions && (
        <div className="mt-2">
          <span className="bg-gray-100 text-gray-500 text-xs px-1.5 py-0.5 rounded">
            {job.cv_versions.name.length > 15
              ? `${job.cv_versions.name.slice(0, 15)}…`
              : job.cv_versions.name}
          </span>
        </div>
      )}
    </div>
  )
}
