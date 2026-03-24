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
  onAddClick?: (stage: Stage) => void
}

export function KanbanColumn({ stage, jobs, onCardClick, onAddJob, onAddClick }: KanbanColumnProps) {
  const { setNodeRef, isOver } = useDroppable({ id: stage })
  const config = STAGE_CONFIG[stage]

  return (
    <div
      role="region"
      aria-label={`${config.label} column`}
      style={{
        width: 220,
        minWidth: 220,
        display: 'flex',
        flexDirection: 'column',
        gap: 10,
        height: '100%',
        flexShrink: 0,
      }}
    >
      {/* Column header */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: 8,
          padding: '8px 10px',
          borderRadius: 10,
          background: 'var(--jf-bg-card)',
          border: '1px solid var(--jf-border)',
          flexShrink: 0,
        }}
      >
        <span
          aria-hidden="true"
          style={{
            width: 8,
            height: 8,
            borderRadius: '50%',
            background: config.hex,
            flexShrink: 0,
          }}
        />
        <span
          style={{
            fontSize: 12,
            fontWeight: 600,
            color: 'var(--jf-text-secondary)',
            flex: 1,
          }}
        >
          {config.label}
        </span>
        <span
          aria-label={`${jobs.length} job${jobs.length !== 1 ? 's' : ''}`}
          style={{
            fontFamily: 'var(--font-dm-mono, monospace)',
            fontSize: 11,
            color: 'var(--jf-text-muted)',
            background: 'var(--jf-bg-subtle)',
            padding: '1px 6px',
            borderRadius: 100,
          }}
        >
          {jobs.length}
        </span>
        <button
          type="button"
          onClick={() => onAddClick?.(stage)}
          style={{
            width: 22,
            height: 22,
            borderRadius: 6,
            border: '1px solid var(--jf-border)',
            background: 'transparent',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: 'var(--jf-text-muted)',
            fontSize: 16,
            lineHeight: 1,
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.borderColor = 'var(--jf-interactive)'
            e.currentTarget.style.color = 'var(--jf-interactive)'
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.borderColor = 'var(--jf-border)'
            e.currentTarget.style.color = 'var(--jf-text-muted)'
          }}
          aria-label={`Add application to ${config.label}`}
        >
          +
        </button>
      </div>

      {/* Cards area / drop zone */}
      <div
        ref={setNodeRef}
        style={{
          flex: 1,
          display: 'flex',
          flexDirection: 'column',
          gap: 8,
          overflowY: 'auto',
          minHeight: 80,
          transition: 'background 0.1s',
          ...(isOver
            ? {
                background: 'var(--jf-interactive-subtle)',
                borderRadius: 10,
                border: '1px dashed var(--jf-interactive)',
                padding: 4,
              }
            : {}),
        }}
      >
        <SortableContext items={jobs.map(j => j.id)} strategy={verticalListSortingStrategy}>
          {jobs.length === 0 && !isOver && (
            <div
              style={{
                padding: '20px 12px',
                textAlign: 'center',
                color: 'var(--jf-text-muted)',
                fontSize: 12,
                border: '1px dashed var(--jf-border)',
                borderRadius: 10,
              }}
            >
              No {config.label.toLowerCase()} yet
            </div>
          )}
          {jobs.map(job => (
            <ApplicationCard key={job.id} job={job} onClick={onCardClick} />
          ))}
        </SortableContext>

        <QuickAddForm stage={stage} onAdd={onAddJob} />
      </div>
    </div>
  )
}
