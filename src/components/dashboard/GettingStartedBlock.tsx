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
    <div className="flex items-center gap-3 py-3.5 border-b border-gray-100 last:border-0">
      {/* Square checkbox */}
      <div
        className={`flex-shrink-0 w-5 h-5 rounded border-2 flex items-center justify-center transition-colors ${
          item.done
            ? 'bg-blue-600 border-blue-600'
            : item.soon
            ? 'border-gray-200'
            : 'border-gray-400'
        }`}
      >
        {item.done && (
          <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 12 12">
            <path d="M2 6l3 3 5-5" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        )}
      </div>

      {/* Text */}
      <div className="flex-1 min-w-0">
        <p
          className={`text-sm font-medium ${
            item.done ? 'text-gray-400 line-through' : item.soon ? 'text-gray-400' : 'text-gray-900'
          }`}
        >
          {item.label}
          {item.soon && <span className="ml-2 text-xs text-gray-400 font-normal">(Soon)</span>}
        </p>
        {item.subtitle && !item.done && (
          <p className={`text-xs mt-0.5 ${item.priority === 'high' ? 'text-blue-600 font-medium' : 'text-gray-400'}`}>
            {item.subtitle}
          </p>
        )}
        {item.subtitle && item.done && (
          <p className="text-xs text-gray-400 mt-0.5">{item.subtitle}</p>
        )}
      </div>

      {/* Right side */}
      <div className="flex items-center gap-2 flex-shrink-0">
        {item.priority === 'high' && !item.done && (
          <span className="text-xs font-medium text-gray-500 bg-gray-100 border border-gray-200 px-2 py-0.5 rounded-full uppercase tracking-wide">
            High Priority
          </span>
        )}
        {!item.done && !item.soon && item.href && (
          <svg className="w-4 h-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
          </svg>
        )}
      </div>
    </div>
  )

  if (!item.done && !item.soon && item.href) {
    return <Link href={item.href}>{content}</Link>
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

  return (
    <div className="bg-white rounded-xl border border-gray-200 p-5">
      {/* Header row */}
      <div className="flex items-start justify-between mb-4">
        <div>
          <h2 className="text-base font-semibold text-gray-900">Getting Started</h2>
          <p className="text-xs text-gray-500 mt-0.5">Complete these tasks to kickstart your job search.</p>
        </div>
        <div className="text-right flex-shrink-0 ml-4">
          {isLoading ? (
            <div className="h-4 w-20 bg-gray-100 rounded animate-pulse mb-1" />
          ) : (
            <span className="text-sm font-semibold text-gray-700">{pct}% Complete</span>
          )}
          <div className="w-32 h-1.5 bg-gray-100 rounded-full mt-1.5 overflow-hidden">
            <div
              className="h-full bg-blue-600 rounded-full transition-all duration-500"
              style={{ width: isLoading ? '0%' : `${pct}%` }}
            />
          </div>
        </div>
      </div>

      {/* Checklist */}
      {isLoading ? (
        <div className="space-y-1">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="flex items-center gap-3 py-3 border-b border-gray-100">
              <div className="w-5 h-5 rounded bg-gray-100 animate-pulse flex-shrink-0" />
              <div className="flex-1 space-y-1">
                <div className="h-3.5 bg-gray-100 rounded animate-pulse w-3/4" />
                <div className="h-3 bg-gray-100 rounded animate-pulse w-1/2" />
              </div>
            </div>
          ))}
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
