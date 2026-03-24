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
      className="flex flex-col w-64 min-w-[220px] flex-1 max-w-xs xl:max-w-sm 2xl:max-w-none"
    >
      {/* Column header */}
      <div
        className="flex items-center justify-between"
        style={{
          padding: '10px 12px',
          background: 'var(--jf-bg-card)',
          border: '1px solid var(--jf-border)',
          borderRadius: '12px 12px 0 0',
          borderBottom: 'none',
        }}
      >
        <div className="flex items-center gap-2">
          <span
            aria-hidden="true"
            className="flex-shrink-0"
            style={{
              width: 8,
              height: 8,
              borderRadius: '50%',
              background: config.hex,
            }}
          />
          <span
            style={{
              fontSize: 13,
              fontWeight: 600,
              color: 'var(--jf-text-primary)',
            }}
          >
            {config.label}
          </span>
        </div>
        <div className="flex items-center" style={{ gap: 6 }}>
          <span
            aria-label={`${jobs.length} job${jobs.length !== 1 ? 's' : ''}`}
            style={{
              fontFamily: 'var(--font-dm-mono, monospace)',
              fontSize: 11,
              color: 'var(--jf-text-muted)',
              background: 'var(--jf-bg-subtle)',
              border: '1px solid var(--jf-border)',
              borderRadius: 100,
              padding: '1px 7px',
            }}
          >
            {jobs.length}
          </span>
          <button
            type="button"
            onClick={() => onAddClick?.(stage)}
            className="flex items-center justify-center w-6 h-6 rounded-md transition-colors"
            style={{
              border: '1px solid var(--jf-border)',
              background: 'var(--jf-bg-card)',
              color: 'var(--jf-text-muted)',
              fontSize: 14,
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
      </div>

      {/* Drop zone */}
      <div
        ref={setNodeRef}
        className="flex-1 flex flex-col transition-colors duration-100"
        style={{
          minHeight: 180,
          padding: 10,
          gap: 8,
          borderRadius: '0 0 12px 12px',
          ...(isOver
            ? {
                background: 'var(--jf-interactive-subtle)',
                borderLeft: '1px dashed var(--jf-interactive)',
                borderRight: '1px dashed var(--jf-interactive)',
                borderBottom: '1px dashed var(--jf-interactive)',
              }
            : {
                background: 'var(--jf-bg-subtle)',
                borderLeft: '1px solid var(--jf-border)',
                borderRight: '1px solid var(--jf-border)',
                borderBottom: '1px solid var(--jf-border)',
              }),
        }}
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
