'use client'

import Link from 'next/link'
import { useDashboardStats } from '@/hooks/use-dashboard-stats'

const TILE_CONFIG = [
  {
    label: 'TOTAL APPLICATIONS',
    key: 'totalApplications' as const,
    borderColor: 'border-blue-500',
    descriptor: '+12%',
    descriptorClass: 'text-green-500',
  },
  {
    label: 'ACTIVE PIPELINE',
    key: 'activeApplications' as const,
    borderColor: 'border-blue-400',
    descriptor: '↑ Active',
    descriptorClass: 'text-gray-400',
  },
  {
    label: 'INTERVIEWS',
    key: 'interviews' as const,
    borderColor: 'border-purple-500',
    descriptor: 'This month',
    descriptorClass: 'text-gray-400',
  },
  {
    label: 'STORIES CREATED',
    key: 'storiesCreated' as const,
    borderColor: 'border-amber-500',
    descriptor: 'Total',
    descriptorClass: 'text-gray-400',
  },
]

function StatTile({
  label,
  value,
  loading,
  borderColor,
  descriptor,
  descriptorClass,
}: {
  label: string
  value: number
  loading: boolean
  borderColor: string
  descriptor: string
  descriptorClass: string
}) {
  return (
    <Link
      href="/pipeline"
      className={`bg-white rounded-xl border border-gray-200 border-l-4 ${borderColor} p-5 hover:shadow-sm transition-all group`}
    >
      {loading ? (
        <div className="space-y-2">
          <div className="h-8 w-16 bg-gray-100 rounded animate-pulse" />
          <div className="h-4 w-24 bg-gray-100 rounded animate-pulse" />
        </div>
      ) : (
        <>
          <p className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-1">
            {label}
          </p>
          <p className="text-3xl font-bold text-gray-900 group-hover:text-blue-600 transition-colors">
            {value}
          </p>
          {value > 0 && (
            <p className={`text-xs mt-1 ${descriptorClass}`}>{descriptor}</p>
          )}
        </>
      )}
    </Link>
  )
}

export function DashboardStatsBlock() {
  const { data, isLoading } = useDashboardStats()

  return (
    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
      {TILE_CONFIG.map((tile) => (
        <StatTile
          key={tile.label}
          label={tile.label}
          value={data?.[tile.key] ?? 0}
          loading={isLoading}
          borderColor={tile.borderColor}
          descriptor={tile.descriptor}
          descriptorClass={tile.descriptorClass}
        />
      ))}
    </div>
  )
}
