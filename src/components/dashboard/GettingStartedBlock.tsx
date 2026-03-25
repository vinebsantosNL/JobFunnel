'use client'

import Link from 'next/link'
import { motion } from 'framer-motion'
import { useDashboardStats } from '@/hooks/use-dashboard-stats'

interface ChecklistItem {
  label: string
  subtitle: string
  done: boolean
  href?: string
  soon?: boolean
  priority?: 'high'
}

function CheckItem({ item }: { item: ChecklistItem }) {
  const content = (
    <div
      className="flex items-center gap-3 py-3.5 last:border-0"
      style={{ borderBottom: '1px solid var(--jf-border)' }}
    >
      {/* Visual checkbox */}
      <div
        role="checkbox"
        aria-checked={item.done}
        aria-label={item.label}
        className="flex-shrink-0 w-5 h-5 rounded flex items-center justify-center transition-colors"
        style={{
          borderWidth: 2,
          borderStyle: 'solid',
          borderColor: item.done ? 'var(--jf-success)' : 'var(--jf-border)',
          background: item.done ? 'var(--jf-success)' : 'transparent',
        }}
      >
        {item.done && (
          <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 12 12" aria-hidden="true">
            <path d="M2 6l3 3 5-5" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        )}
      </div>

      {/* Text */}
      <div className="flex-1 min-w-0">
        <p
          className="text-sm font-medium"
          style={{
            color: item.done ? 'var(--jf-text-muted)' : 'var(--jf-text-primary)',
            textDecoration: item.done ? 'line-through' : 'none',
          }}
        >
          {item.label}
          {item.soon && (
            <span className="ml-2 text-xs font-normal" style={{ color: 'var(--jf-text-muted)' }}>(Soon)</span>
          )}
        </p>
        {item.subtitle && !item.done && (
          <p
            className="text-xs mt-0.5"
            style={{ color: item.priority === 'high' ? 'var(--jf-interactive)' : 'var(--jf-text-muted)' }}
          >
            {item.subtitle}
          </p>
        )}
        {item.subtitle && item.done && (
          <p className="text-xs mt-0.5" style={{ color: 'var(--jf-text-muted)' }}>{item.subtitle}</p>
        )}
      </div>

      {/* Right side */}
      <div className="flex items-center gap-2 flex-shrink-0">
        {item.priority === 'high' && !item.done && (
          <span
            className="uppercase tracking-wide"
            style={{
              fontFamily: 'var(--font-dm-mono, monospace)',
              fontSize: 10,
              background: 'rgba(37,99,235,0.08)',
              border: '1px solid rgba(37,99,235,0.2)',
              color: 'var(--jf-interactive)',
              padding: '2px 8px',
              borderRadius: 100,
            }}
          >
            High Priority
          </span>
        )}
        {!item.done && !item.soon && item.href && (
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2} aria-hidden="true" style={{ color: 'var(--jf-text-muted)' }}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
          </svg>
        )}
      </div>
    </div>
  )

  if (!item.done && !item.soon && item.href) {
    return (
      <Link href={item.href} aria-label={item.label}>
        {content}
      </Link>
    )
  }

  return (
    <div className={item.soon ? 'cursor-not-allowed opacity-60' : undefined}>
      {content}
    </div>
  )
}

export function GettingStartedBlock() {
  const { data, isLoading } = useDashboardStats()

  const completedCount = [data?.hasFirstJob, (data?.storiesCreated ?? 0) > 0, data?.hasCVVersion].filter(Boolean).length
  const totalCompletable = 3
  const pct = Math.round((completedCount / totalCompletable) * 100)

  const items: ChecklistItem[] = [
    {
      label: 'Add a job to my Pipeline',
      subtitle: 'Start tracking your applications',
      done: data?.hasFirstJob ?? false,
      href: '/pipeline',
    },
    {
      label: 'Create a STAR Story',
      subtitle: 'Recommended for interviews',
      done: (data?.storiesCreated ?? 0) > 0,
      href: '/stories',
      priority: 'high',
    },
    {
      label: 'Set up CV Versions',
      subtitle: 'Track which resume performs best',
      done: data?.hasCVVersion ?? false,
      href: '/cv-versions',
    },
    {
      label: 'Get started with Resume Builder',
      subtitle: 'AI-powered resume optimization',
      done: false,
      soon: true,
    },
  ]

  const allDone = completedCount === totalCompletable && !isLoading

  return (
    <div
      className="rounded-2xl"
      style={{
        background: 'var(--jf-bg-card)',
        border: '1px solid var(--jf-border)',
        borderRadius: 16,
        padding: '18px 20px',
        boxShadow: 'var(--jf-shadow-sm)',
      }}
    >
      {/* Header row */}
      <div className="flex items-start justify-between mb-4">
        <div>
          <h2 style={{ fontSize: 14, fontWeight: 600, color: 'var(--jf-text-primary)' }}>Getting Started</h2>
          <p className="mt-0.5" style={{ fontSize: 12, color: 'var(--jf-text-muted)' }}>Complete these tasks to kickstart your job search.</p>
        </div>
        <div className="text-right flex-shrink-0 ml-4">
          {isLoading ? (
            <div className="h-4 w-20 rounded animate-pulse mb-1" style={{ background: 'var(--jf-border)' }} />
          ) : (
            <span
              style={{
                fontFamily: 'var(--font-dm-mono, monospace)',
                fontSize: 13,
                fontWeight: 600,
                color: 'var(--jf-text-primary)',
              }}
            >
              {pct}% Complete
            </span>
          )}
          {/* Progress bar */}
          <div
            role="progressbar"
            aria-valuenow={isLoading ? 0 : pct}
            aria-valuemin={0}
            aria-valuemax={100}
            aria-label="Getting started progress"
            className="w-32 mt-1.5 overflow-hidden"
            style={{ height: 6, background: 'var(--jf-border)', borderRadius: 100 }}
          >
            <div
              style={{
                height: '100%',
                background: 'var(--jf-success)',
                borderRadius: 100,
                width: isLoading ? '0%' : `${pct}%`,
                transition: 'width 500ms ease',
              }}
            />
          </div>
        </div>
      </div>

      {/* Checklist or all-done state */}
      {isLoading ? (
        <div className="space-y-1">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="flex items-center gap-3 py-3" style={{ borderBottom: '1px solid var(--jf-border)' }}>
              <div className="w-5 h-5 rounded animate-pulse flex-shrink-0" style={{ background: 'var(--jf-border)' }} />
              <div className="flex-1 space-y-1">
                <div className="h-3.5 rounded animate-pulse w-3/4" style={{ background: 'var(--jf-border)' }} />
                <div className="h-3 rounded animate-pulse w-1/2" style={{ background: 'var(--jf-border)' }} />
              </div>
            </div>
          ))}
        </div>
      ) : allDone ? (
        <div className="text-center py-4">
          <p style={{ fontSize: 24 }}>&#127881;</p>
          <p style={{ fontSize: 14, fontWeight: 600, color: 'var(--jf-success)' }}>All done!</p>
          <p className="mt-1" style={{ fontSize: 12, color: 'var(--jf-text-muted)' }}>Your job search foundation is set.</p>
        </div>
      ) : (
        <motion.div
          initial="hidden"
          animate="visible"
          variants={{
            hidden: {},
            visible: { transition: { staggerChildren: 0.07, delayChildren: 0.05 } },
          }}
        >
          {items.map((item) => (
            <motion.div
              key={item.label}
              variants={{
                hidden: { opacity: 0, y: 6 },
                visible: { opacity: 1, y: 0, transition: { duration: 0.25, ease: 'easeOut' } },
              }}
            >
              <CheckItem item={item} />
            </motion.div>
          ))}
        </motion.div>
      )}
    </div>
  )
}
