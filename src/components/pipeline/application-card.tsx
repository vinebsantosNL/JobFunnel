'use client'

import { useEffect, useRef, useState } from 'react'
import { useSortable } from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import { motion } from 'framer-motion'
import type { JobApplication } from '@/types/database.types'
import { PRIORITY_CONFIG } from '@/lib/stages'

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

function getInitials(name: string): string {
  const parts = name.trim().split(/\s+/)
  if (parts.length >= 2) return (parts[0][0] + parts[1][0]).toUpperCase()
  return name.slice(0, 2).toUpperCase()
}

const PRIORITY_HEX: Record<string, string | undefined> = {
  high: '#EF4444',
  medium: '#F59E0B',
  low: undefined,
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

  const dndStyle = {
    transform: CSS.Transform.toString(transform),
    transition: isDragging ? undefined : 'transform 120ms cubic-bezier(0.16, 1, 0.3, 1)',
    opacity: !isOverlay && isDragging ? 0.3 : 1,
  }

  const days = getDaysInStage(job.stage_updated_at)
  const priority = PRIORITY_CONFIG[job.priority]

  const colorIdx = job.company_name.charCodeAt(0) % AVATAR_COLORS.length
  const avatarColor = AVATAR_COLORS[colorIdx]
  const initials = getInitials(job.company_name)

  const priorityDotColor = PRIORITY_HEX[job.priority]

  // Days color coding
  let daysColor = 'var(--jf-text-muted)'
  if (days >= 30) daysColor = 'var(--jf-error)'
  else if (days >= 14) daysColor = 'var(--jf-warning)'

  const daysLabel = days === 0 ? 'Today' : `${days}d`

  return (
    <div
      ref={setNodeRef}
      style={dndStyle}
      {...attributes}
      {...listeners}
      className="cursor-grab active:cursor-grabbing rounded-xl focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-1"
    >
      <motion.div
        onClick={() => onClick(job)}
        animate={justDropped ? { scale: [1, 1.02, 1] } : { scale: 1 }}
        transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] }}
        className={`select-none transition-[box-shadow,border-color] duration-150${
          isOverlay ? ' rotate-1 cursor-grabbing' : ' cursor-grab active:cursor-grabbing'
        }`}
        style={{
          background: 'var(--jf-bg-card)',
          border: '1px solid var(--jf-border)',
          borderRadius: 12,
          padding: '12px 14px',
          boxShadow: isOverlay
            ? '0 10px 25px rgba(0,0,0,.15), 0 0 0 1px rgba(37,99,235,.3)'
            : 'var(--jf-shadow-sm)',
        }}
        onMouseEnter={(e) => {
          if (!isOverlay) {
            e.currentTarget.style.boxShadow = 'var(--jf-shadow-md)'
            e.currentTarget.style.borderColor = '#CBD5E1'
          }
        }}
        onMouseLeave={(e) => {
          if (!isOverlay) {
            e.currentTarget.style.boxShadow = 'var(--jf-shadow-sm)'
            e.currentTarget.style.borderColor = 'var(--jf-border)'
          }
        }}
      >
        {/* Row 1: Company identity */}
        <div className="flex items-center gap-2">
          <div
            aria-hidden="true"
            className="flex items-center justify-center text-white flex-shrink-0"
            style={{
              width: 32,
              height: 32,
              borderRadius: 8,
              backgroundColor: avatarColor,
              fontSize: 11,
              fontWeight: 700,
            }}
          >
            {initials}
          </div>
          <span
            className="truncate flex-1"
            style={{
              fontSize: 13,
              fontWeight: 600,
              color: 'var(--jf-text-primary)',
            }}
          >
            {job.company_name}
          </span>
          {priorityDotColor && (
            <span
              role="img"
              aria-label={`${priority.label} priority`}
              className="flex-shrink-0"
              style={{
                width: 6,
                height: 6,
                borderRadius: '50%',
                background: priorityDotColor,
              }}
            />
          )}
        </div>

        {/* Row 2: Job title */}
        <p
          className="truncate mt-1.5"
          style={{
            fontSize: 13,
            fontWeight: 500,
            color: 'var(--jf-text-secondary)',
          }}
        >
          {job.job_title}
        </p>

        {/* Row 3: Meta row */}
        <div className="flex items-center flex-wrap mt-2" style={{ gap: 6 }}>
          {job.location && (
            <span
              className="flex items-center"
              style={{
                fontSize: 11,
                color: 'var(--jf-text-muted)',
                gap: 3,
              }}
            >
              <span aria-hidden="true" style={{ fontSize: 10 }}>&#x1F4CD;</span>
              {job.location}
            </span>
          )}
          <span
            style={{
              fontFamily: 'var(--font-dm-mono, monospace)',
              fontSize: 11,
              color: daysColor,
            }}
          >
            {daysLabel}
          </span>
        </div>

        {/* Row 4: CV version badge */}
        {job.cv_versions?.name && (
          <div
            className="mt-2"
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              padding: '2px 8px',
              borderRadius: 6,
              background: 'rgba(37,99,235,0.08)',
              border: '1px solid rgba(37,99,235,0.2)',
              fontFamily: 'var(--font-dm-mono, monospace)',
              fontSize: 11,
              color: 'var(--jf-interactive)',
              maxWidth: 140,
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              whiteSpace: 'nowrap',
            }}
          >
            {job.cv_versions.name}
          </div>
        )}
      </motion.div>
    </div>
  )
}
