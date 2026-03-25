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

function getCompanyColor(name: string): string {
  const colors = ['#1DB954','#003580','#E50914','#FF6B00','#0A0A0A','#00B8D9','#FF5722','#4A90D9','#607D8B','#4CAF50']
  let hash = 0
  for (let i = 0; i < name.length; i++) hash = name.charCodeAt(i) + ((hash << 5) - hash)
  return colors[Math.abs(hash) % colors.length]
}

function getInitials(name: string): string {
  const parts = name.trim().split(/\s+/)
  if (parts.length >= 2) return (parts[0][0] + parts[1][0]).toUpperCase()
  return name.slice(0, 2).toUpperCase()
}

function getDaysInStage(stageUpdatedAt: string): number {
  const diff = Date.now() - new Date(stageUpdatedAt).getTime()
  return Math.floor(diff / (1000 * 60 * 60 * 24))
}

const PRIORITY_DOT_HEX: Record<string, string | undefined> = {
  high: '#EF4444',
  medium: '#F59E0B',
  low: '#10B981',
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
  const priorityDotColor = PRIORITY_DOT_HEX[job.priority]
  const isRejectedOrWithdrawn = job.stage === 'rejected' || job.stage === 'withdrawn'
  const isInterviewing = job.stage === 'interviewing'

  // Days label
  const isAppliedOrLater = job.stage !== 'saved'
  const daysLabel = days === 0 ? 'Today' : `${days}d ${isAppliedOrLater ? 'in stage' : 'ago'}`
  const daysColor = days >= 14 ? 'var(--jf-warning)' : 'var(--jf-text-muted)'

  // Salary display
  const salaryDisplay = (job.salary_min || job.salary_max)
    ? `€${job.salary_min ? Math.round(job.salary_min / 1000) + 'k' : '?'}–€${job.salary_max ? Math.round(job.salary_max / 1000) + 'k' : '?'}`
    : null

  return (
    <div
      ref={setNodeRef}
      style={dndStyle}
      {...attributes}
      {...listeners}
      className="cursor-grab active:cursor-grabbing focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-1"
      style-x-extra=""
    >
      <motion.div
        onClick={() => onClick(job)}
        animate={justDropped ? { scale: [1, 1.02, 1] } : { scale: 1 }}
        transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] }}
        style={{
          background: 'var(--jf-bg-card)',
          border: `1px solid ${isInterviewing ? 'rgba(245,158,11,0.3)' : 'var(--jf-border)'}`,
          borderRadius: 12,
          padding: 14,
          boxShadow: isOverlay
            ? '0 10px 25px rgba(0,0,0,.15), 0 0 0 1px rgba(37,99,235,.3)'
            : 'var(--jf-shadow-sm)',
          cursor: isOverlay ? 'grabbing' : 'pointer',
          transition: 'box-shadow 0.15s, border-color 0.15s',
          opacity: isRejectedOrWithdrawn ? 0.6 : 1,
          userSelect: 'none' as const,
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
            e.currentTarget.style.borderColor = isInterviewing ? 'rgba(245,158,11,0.3)' : 'var(--jf-border)'
          }
        }}
      >
        {/* Top row: company identity */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 10 }}>
          <div
            aria-hidden="true"
            style={{
              width: 30,
              height: 30,
              borderRadius: 8,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: 11,
              fontWeight: 700,
              color: '#fff',
              flexShrink: 0,
              background: getCompanyColor(job.company_name),
            }}
          >
            {getInitials(job.company_name)}
          </div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div
              style={{
                fontSize: 13,
                fontWeight: 600,
                color: 'var(--jf-text-primary)',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                whiteSpace: 'nowrap',
              }}
            >
              {job.company_name}
            </div>
            <div
              style={{
                fontSize: 11,
                color: 'var(--jf-text-muted)',
                marginTop: 1,
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                whiteSpace: 'nowrap',
              }}
            >
              {job.job_title}{job.location ? ` · ${job.location}` : ''}
            </div>
          </div>
          {priorityDotColor && (
            <span
              role="img"
              aria-label={`${priority.label} priority`}
              style={{
                width: 7,
                height: 7,
                borderRadius: '50%',
                background: priorityDotColor,
                flexShrink: 0,
              }}
            />
          )}
        </div>

        {/* Tags row */}
        {(job.cv_versions?.name || salaryDisplay) && (
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 5, marginBottom: 10 }}>
            {job.cv_versions?.name && (
              <span
                style={{
                  fontFamily: 'var(--font-dm-mono, monospace)',
                  fontSize: 10,
                  padding: '2px 7px',
                  borderRadius: 100,
                  background: 'rgba(139,92,246,0.08)',
                  border: '1px solid rgba(139,92,246,0.2)',
                  color: 'var(--jf-purple, #8B5CF6)',
                  maxWidth: 120,
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  whiteSpace: 'nowrap',
                }}
              >
                {job.cv_versions.name}
              </span>
            )}
            {salaryDisplay && (
              <span
                style={{
                  fontFamily: 'var(--font-dm-mono, monospace)',
                  fontSize: 10,
                  padding: '2px 7px',
                  borderRadius: 100,
                  background: 'var(--jf-bg-subtle)',
                  border: '1px solid var(--jf-border)',
                  color: 'var(--jf-text-muted)',
                }}
              >
                {salaryDisplay}
              </span>
            )}
          </div>
        )}

        {/* Footer row */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            paddingTop: 10,
            borderTop: '1px solid var(--jf-border)',
          }}
        >
          <span
            style={{
              fontFamily: 'var(--font-dm-mono, monospace)',
              fontSize: 11,
              display: 'flex',
              alignItems: 'center',
              gap: 4,
              color: daysColor,
            }}
          >
            <svg
              aria-hidden="true"
              viewBox="0 0 20 20"
              fill="currentColor"
              style={{ width: 12, height: 12 }}
            >
              <path
                fillRule="evenodd"
                d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z"
                clipRule="evenodd"
              />
            </svg>
            {daysLabel}
          </span>
          <span
            style={{
              fontSize: 11,
              color: 'var(--jf-text-muted)',
            }}
          >
            {priority.label}
          </span>
        </div>
      </motion.div>
    </div>
  )
}
