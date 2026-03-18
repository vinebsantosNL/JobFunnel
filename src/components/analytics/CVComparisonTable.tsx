'use client'

import { useState } from 'react'
import { Badge } from '@/components/ui/badge'
import { LowConfidenceBadge } from '@/components/analytics/LowConfidenceBadge'
import type { CVComparisonRow } from '@/app/api/analytics/cv-comparison/route'

type SortKey = keyof Pick<
  CVComparisonRow,
  | 'version_name'
  | 'total_applied'
  | 'screening_rate'
  | 'interview_rate'
  | 'overall_conversion'
  | 'avg_days_in_applied'
>

interface CVComparisonTableProps {
  rows: CVComparisonRow[]
  cvVersionDefaults: Record<string, boolean>
  cvVersionArchived: Record<string, boolean>
}

function fmt(value: number | null, suffix = '%'): string {
  if (value === null) return '—'
  return `${value}${suffix}`
}

export function CVComparisonTable({
  rows,
  cvVersionDefaults,
  cvVersionArchived,
}: CVComparisonTableProps) {
  const [sortKey, setSortKey] = useState<SortKey>('total_applied')
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>('desc')
  const [showArchived, setShowArchived] = useState(false)

  function handleSort(key: SortKey) {
    if (sortKey === key) {
      setSortDir((d) => (d === 'asc' ? 'desc' : 'asc'))
    } else {
      setSortKey(key)
      setSortDir('desc')
    }
  }

  // Best screening rate (highest non-zero, non-Untagged)
  const bestScreeningRate = Math.max(
    0,
    ...rows
      .filter((r) => r.version_id !== null && (r.screening_rate ?? 0) > 0)
      .map((r) => r.screening_rate ?? 0)
  )

  const filtered = showArchived
    ? rows
    : rows.filter((r) => {
        if (r.version_id === null) return true
        return !cvVersionArchived[r.version_id]
      })

  const sorted = [...filtered].sort((a, b) => {
    const av = a[sortKey]
    const bv = b[sortKey]

    if (av === null && bv === null) return 0
    if (av === null) return 1
    if (bv === null) return -1

    const cmp =
      typeof av === 'string' && typeof bv === 'string'
        ? av.localeCompare(bv)
        : (av as number) - (bv as number)

    return sortDir === 'asc' ? cmp : -cmp
  })

  function SortIndicator({ col }: { col: SortKey }) {
    if (sortKey !== col) return <span className="text-gray-300 ml-1">↕</span>
    return <span className="text-blue-600 ml-1">{sortDir === 'asc' ? '↑' : '↓'}</span>
  }

  return (
    <div className="space-y-3">
      <div className="overflow-x-auto rounded-lg border border-gray-200">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 border-b border-gray-200">
            <tr>
              {(
                [
                  { key: 'version_name', label: 'Version Name' },
                  { key: 'total_applied', label: 'Applications' },
                  { key: 'screening_rate', label: 'Screening Rate' },
                  { key: 'interview_rate', label: 'Interview Rate' },
                  { key: 'overall_conversion', label: 'Overall Conversion' },
                  { key: 'avg_days_in_applied', label: 'Avg Days in Applied' },
                ] as { key: SortKey; label: string }[]
              ).map(({ key, label }) => (
                <th
                  key={key}
                  className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wide cursor-pointer select-none hover:bg-gray-100 transition-colors"
                  onClick={() => handleSort(key)}
                >
                  {label}
                  <SortIndicator col={key} />
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {sorted.length === 0 ? (
              <tr>
                <td colSpan={6} className="px-4 py-8 text-center text-gray-400 text-sm">
                  No data available
                </td>
              </tr>
            ) : (
              sorted.map((row) => {
                const isUntagged = row.version_id === null
                const isDefault = row.version_id ? cvVersionDefaults[row.version_id] : false
                const isBestScreening =
                  !isUntagged &&
                  bestScreeningRate > 0 &&
                  row.screening_rate === bestScreeningRate

                return (
                  <tr
                    key={row.version_id ?? 'untagged'}
                    className="hover:bg-gray-50 transition-colors"
                  >
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2 flex-wrap">
                        {isUntagged ? (
                          <span className="text-gray-400 italic">Untagged</span>
                        ) : (
                          <span className="font-medium text-gray-900">{row.version_name}</span>
                        )}
                        {isDefault && (
                          <Badge
                            variant="secondary"
                            className="text-xs px-1.5 py-0"
                          >
                            Default
                          </Badge>
                        )}
                        <LowConfidenceBadge count={row.total_applied} />
                      </div>
                    </td>
                    <td className="px-4 py-3 text-gray-700">{row.total_applied}</td>
                    <td
                      className={`px-4 py-3 font-medium ${
                        isBestScreening ? 'text-green-600' : 'text-gray-700'
                      }`}
                    >
                      {fmt(row.screening_rate)}
                    </td>
                    <td className="px-4 py-3 text-gray-700">{fmt(row.interview_rate)}</td>
                    <td className="px-4 py-3 text-gray-700">{fmt(row.overall_conversion)}</td>
                    <td className="px-4 py-3 text-gray-700">
                      {row.avg_days_in_applied !== null ? `${row.avg_days_in_applied}d` : '—'}
                    </td>
                  </tr>
                )
              })
            )}
          </tbody>
        </table>
      </div>

      <div className="flex items-center gap-2">
        <button
          onClick={() => setShowArchived((v) => !v)}
          className="text-xs text-gray-500 hover:text-gray-700 underline underline-offset-2 transition-colors"
        >
          {showArchived ? 'Hide archived versions' : 'Show archived versions'}
        </button>
      </div>
    </div>
  )
}
