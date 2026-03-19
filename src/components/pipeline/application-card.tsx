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

const AVATAR_COLORS = ['#2563EB', '#7C3AED', '#059669', '#D97706', '#DC2626']

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

  const colorIdx = job.company_name.charCodeAt(0) % AVATAR_COLORS.length
  const avatarColor = AVATAR_COLORS[colorIdx]
  const firstLetter = job.company_name.charAt(0).toUpperCase()

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      onClick={() => onClick(job)}
      className="bg-white rounded-lg border border-gray-100 p-3 shadow-sm hover:shadow-md hover:border-gray-200 transition-all cursor-grab active:cursor-grabbing select-none"
    >
      {/* Top row: avatar + company + priority dot + days */}
      <div className="flex items-center gap-2">
        <div
          className="w-7 h-7 rounded flex items-center justify-center text-white text-xs font-bold flex-shrink-0"
          style={{ backgroundColor: avatarColor }}
        >
          {firstLetter}
        </div>
        <span className="text-xs text-gray-500 truncate flex-1">{job.company_name}</span>
        <div
          className={`w-2 h-2 rounded-full flex-shrink-0 ${priority.color}`}
          title={`${priority.label} priority`}
        />
        <Badge variant="secondary" className="text-xs flex-shrink-0">
          {days === 0 ? 'Today' : `${days}d`}
        </Badge>
      </div>

      {/* Job title */}
      <p className="font-bold text-sm text-gray-900 truncate mt-1.5">{job.job_title}</p>

      {/* Tags row */}
      <div className="flex items-center gap-1.5 mt-2 flex-wrap">
        {job.location && (
          <span className="bg-gray-100 text-gray-600 text-xs px-2 py-0.5 rounded-full">
            {job.location}
          </span>
        )}
        {job.salary_min && (
          <span className="bg-gray-100 text-gray-600 text-xs px-2 py-0.5 rounded-full">
            {job.salary_currency ?? '€'}{job.salary_min.toLocaleString()}
            {job.salary_max ? `–${job.salary_max.toLocaleString()}` : '+'}
          </span>
        )}
      </div>

      {/* Thin progress bar for applied stage */}
      {job.stage === 'applied' && (
        <div className="w-full h-1 bg-gray-100 rounded-full mt-2">
          <div className="bg-blue-500 h-full rounded-full" style={{ width: '66%' }} />
        </div>
      )}
    </div>
  )
}
