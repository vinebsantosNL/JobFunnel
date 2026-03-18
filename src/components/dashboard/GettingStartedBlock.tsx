'use client'

import Link from 'next/link'
import { useDashboardStats } from '@/hooks/use-dashboard-stats'

interface ChecklistItem {
  label: string
  done: boolean
  href?: string
  soon?: boolean
}

function CheckItem({ item }: { item: ChecklistItem }) {
  const content = (
    <div className="flex items-start gap-3 py-4 border-b border-gray-100 last:border-0">
      <div
        className={`mt-0.5 flex-shrink-0 w-5 h-5 rounded-full border-2 flex items-center justify-center transition-colors ${
          item.done
            ? 'bg-blue-600 border-blue-600'
            : item.soon
            ? 'border-gray-200'
            : 'border-gray-300'
        }`}
      >
        {item.done && (
          <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 12 12">
            <path d="M2 6l3 3 5-5" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        )}
      </div>
      <div className="flex-1 min-w-0">
        <p
          className={`text-sm font-medium ${
            item.done
              ? 'text-gray-400 line-through'
              : item.soon
              ? 'text-gray-400'
              : 'text-gray-900'
          }`}
        >
          {item.label}
          {item.soon && (
            <span className="ml-2 text-xs text-gray-400 font-normal">(Soon)</span>
          )}
        </p>
      </div>
      {!item.done && !item.soon && item.href && (
        <span className="flex-shrink-0 text-xs border border-gray-200 text-gray-500 rounded-full px-2.5 py-0.5 hover:border-blue-400 hover:text-blue-600 transition-colors">
          Start →
        </span>
      )}
      {item.done && (
        <span className="flex-shrink-0 text-xs bg-gray-100 text-gray-400 rounded-full px-2.5 py-0.5">
          Done ✓
        </span>
      )}
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

  const completedCount = [data?.hasFirstJob, (data?.storiesCreated ?? 0) > 0].filter(Boolean).length
  const totalCompletable = 2
  const pct = Math.round((completedCount / totalCompletable) * 100)

  const items: ChecklistItem[] = [
    {
      label: 'Add a job to my Job Pipeline',
      done: data?.hasFirstJob ?? false,
      href: '/pipeline',
    },
    {
      label: 'Create a Story',
      done: (data?.storiesCreated ?? 0) > 0,
      href: '/stories',
    },
    {
      label: 'Get started with my Resume Builder',
      done: false,
      soon: true,
    },
  ]

  return (
    <div className="bg-white rounded-xl border border-gray-200 p-5 h-full">
      <h2 className="text-base font-semibold text-gray-900 mb-1">Getting Started</h2>

      {/* Progress bar */}
      <div className="flex items-center justify-between mb-3">
        {isLoading ? (
          <div className="h-4 w-24 bg-gray-100 rounded animate-pulse" />
        ) : (
          <span className="text-sm font-semibold text-gray-700">{pct}% Complete</span>
        )}
        <span className="text-sm text-gray-500">{completedCount} of {totalCompletable} Tasks</span>
      </div>
      <div className="w-full h-1.5 bg-gray-100 rounded-full mb-4 overflow-hidden">
        <div
          className="h-full bg-blue-600 rounded-full transition-all duration-500"
          style={{ width: isLoading ? '0%' : `${pct}%` }}
        />
      </div>

      {/* Checklist */}
      {isLoading ? (
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="flex items-center gap-3 py-3 border-b border-gray-100">
              <div className="w-5 h-5 rounded-full bg-gray-100 animate-pulse" />
              <div className="h-4 flex-1 bg-gray-100 rounded animate-pulse" />
            </div>
          ))}
        </div>
      ) : (
        <div>
          {items.map((item) => (
            <CheckItem key={item.label} item={item} />
          ))}
        </div>
      )}
    </div>
  )
}
