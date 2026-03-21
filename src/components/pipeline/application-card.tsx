'use client'

import { useEffect, useRef, useState } from 'react'
import { useSortable } from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import { motion } from 'framer-motion'
import { Clock } from 'lucide-react'
import type { JobApplication, Stage } from '@/types/database'
import { PRIORITY_CONFIG } from '@/lib/stages'
import { Badge } from '@/components/ui/badge'

interface ApplicationCardProps {
  job: JobApplication
  onClick: (job: JobApplication) => void
  isOverlay?: boolean
}

const AVATAR_COLORS = ['#2563EB', '#7C3AED', '#059669', '#D97706', '#DC2626']

function getDaysInStage(stageUpdatedAt: string): number {
  const diff = Date.now() - new Date(stageUpdatedAt).getTime()
  return Math.floor(diff / (1000 * 60 * 60 * 24))
}

const STALE_THRESHOLDS: Partial<Record<Stage, number>> = {
  screening: 5,
  interviewing: 7,
  offer: 5,
}

export function ApplicationCard({ job, onClick, isOverlay = false }: ApplicationCardProps) {
  const { attributes, listeners, setNodeRef, transform, isDragging } = useSortable({
    id: job.id,
    data: { job },
  })

  const prevIsDragging = useRef(false)
  const [justDropped, setJustDropped] = useState(false)

  useEffect(() => {
    if (prevIsDragging.current && !isDragging) {
      setJustDropped(true)
      const t = setTimeout(() => setJustDropped(false), 250)
      return () => clearTimeout(t)
    }
    prevIsDragging.current = isDragging
  }, [isDragging])

  // Outer div: dnd-kit positional transform only — no Framer Motion interference
  const dndStyle = {
    transform: CSS.Transform.toString(transform),
    transition: isDragging ? undefined : 'transform 120ms cubic-bezier(0.16, 1, 0.3, 1)',
    // isOverlay = the card rendered inside DragOverlay — always full opacity
    // isDragging = the source placeholder left behind in the column — faded
    opacity: !isOverlay && isDragging ? 0.3 : 1,
  }

  const days = getDaysInStage(job.stage_updated_at)
  const priority = PRIORITY_CONFIG[job.priority]

  const staleThreshold = STALE_THRESHOLDS[job.stage]
  const isStale = staleThreshold !== undefined && days >= staleThreshold

  const colorIdx = job.company_name.charCodeAt(0) % AVATAR_COLORS.length
  const avatarColor = AVATAR_COLORS[colorIdx]
  const firstLetter = job.company_name.charAt(0).toUpperCase()

  return (
    // Outer: dnd-kit handles position — plain div, no animation library
    <div
      ref={setNodeRef}
      style={dndStyle}
      {...attributes}
      {...listeners}
      className="cursor-grab active:cursor-grabbing"
    >
    {/* Inner: Framer Motion handles visual micro-interactions only */}
    <motion.div
      onClick={() => onClick(job)}
      animate={justDropped ? { scale: [1, 1.02, 1] } : { scale: 1 }}
      transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] }}
      className={`bg-white rounded-lg border border-gray-100 p-3 shadow-sm select-none transition-[box-shadow,border-color,translate] duration-150${isOverlay ? ' shadow-xl ring-1 ring-blue-200 rotate-1 cursor-grabbing' : ' hover:shadow-md hover:-translate-y-0.5 hover:border-gray-200 cursor-grab active:cursor-grabbing'}${isStale && !isDragging ? ' ring-1 ring-amber-300 animate-pulse' : ''}`}
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
        {isStale && (
          <span title="Follow-up recommended">
            <Clock className="w-3 h-3 text-amber-500 flex-shrink-0" />
          </span>
        )}
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
    </motion.div>
    </div>
  )
}
