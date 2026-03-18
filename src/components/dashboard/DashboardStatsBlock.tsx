'use client'

import Link from 'next/link'
import { useDashboardStats } from '@/hooks/use-dashboard-stats'

function StatTile({
  label,
  value,
  loading,
}: {
  label: string
  value: number
  loading: boolean
}) {
  return (
    <Link
      href="/pipeline"
      className="bg-white rounded-xl border border-gray-200 p-5 hover:border-blue-300 hover:shadow-sm transition-all group"
    >
      {loading ? (
        <div className="space-y-2">
          <div className="h-8 w-16 bg-gray-100 rounded animate-pulse" />
          <div className="h-4 w-24 bg-gray-100 rounded animate-pulse" />
        </div>
      ) : (
        <>
          <p className="text-3xl font-bold text-gray-900 group-hover:text-blue-600 transition-colors">
            {value}
          </p>
          <p className="text-sm text-gray-500 mt-1">{label}</p>
        </>
      )}
    </Link>
  )
}

export function DashboardStatsBlock() {
  const { data, isLoading } = useDashboardStats()

  const tiles = [
    { label: 'Total Applications', value: data?.totalApplications ?? 0 },
    { label: 'Active', value: data?.activeApplications ?? 0 },
    { label: 'Interviews', value: data?.interviews ?? 0 },
    { label: 'Stories Created', value: data?.storiesCreated ?? 0 },
  ]

  return (
    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
      {tiles.map((tile) => (
        <StatTile key={tile.label} label={tile.label} value={tile.value} loading={isLoading} />
      ))}
    </div>
  )
}
