'use client'

import { useState } from 'react'
import { Badge } from '@/components/ui/badge'
import type { CVComparisonRow } from '@/app/api/analytics/cv-comparison/route'

const LOW_DATA_THRESHOLD = 10

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

function ConfidenceBadge({ count, isUntagged }: { count: number; isUntagged: boolean }) {
  if (isUntagged) {
    return (
      <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-amber-100 text-amber-700">
        Untracked
      </span>
    )
  }
  if (count < LOW_DATA_THRESHOLD) {
    return (
      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs font-medium bg-amber-50 text-amber-600 border border-amber-200">
        ⚠ &lt; {LOW_DATA_THRESHOLD} apps
      </span>
    )
  }
  return (
    <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-green-50 text-green-700 border border-green-200">
      Good
    </span>
  )
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

  const columns: { key: SortKey; label: string }[] = [
    { key: 'version_name', label: 'CV Version' },
    { key: 'total_applied', label: 'Applications' },
    { key: 'screening_rate', label: 'Applied → Screen' },
    { key: 'interview_rate', label: 'Screen → Interview' },
    { key: 'overall_conversion', label: 'Overall (Applied → Offer)' },
    { key: 'avg_days_in_applied', label: 'Avg Days in Applied' },
  ]

  return (
    <div className="space-y-3">
      {/* Show archived checkbox — top right */}
      <div className="flex justify-end">
        <label className="flex items-center gap-2 text-xs text-gray-500 cursor-pointer select-none">
          <input
            type="checkbox"
            checked={showArchived}
            onChange={(e) => setShowArchived(e.target.checked)}
            className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
          />
          Show archived versions
        </label>
      </div>

      <div className="overflow-x-auto rounded-lg border border-gray-200">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 border-b border-gray-200">
            <tr>
              {columns.map(({ key, label }) => (
                <th
                  key={key}
                  className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide cursor-pointer select-none hover:bg-gray-100 transition-colors whitespace-nowrap"
                  onClick={() => handleSort(key)}
                >
                  {label}
                  <SortIndicator col={key} />
                </th>
              ))}
              <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide whitespace-nowrap">
                Confidence
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {sorted.length === 0 ? (
              <tr>
                <td colSpan={7} className="px-4 py-8 text-center text-gray-400 text-sm">
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
                    className={`transition-colors ${isUntagged ? 'bg-gray-50/50' : 'hover:bg-gray-50'}`}
                  >
                    {/* Version name */}
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2 flex-wrap">
                        {isUntagged ? (
                          <span className="text-gray-400 italic text-sm">Untagged</span>
                        ) : (
                          <span className="font-semibold text-gray-900">{row.version_name}</span>
                        )}
                        {isDefault && (
                          <Badge variant="secondary" className="text-xs px-1.5 py-0">
                            DEFAULT
                          </Badge>
                        )}
                      </div>
                    </td>

                    {/* Applications */}
                    <td className="px-4 py-3 text-gray-700">{row.total_applied}</td>

                    {/* Applied → Screen */}
                    <td className={`px-4 py-3 font-medium ${isBestScreening ? 'text-green-600' : 'text-gray-700'}`}>
                      {fmt(row.screening_rate)}
                    </td>

                    {/* Screen → Interview */}
                    <td className={`px-4 py-3 font-medium ${isBestScreening && row.interview_rate ? 'text-green-600' : 'text-gray-700'}`}>
                      {fmt(row.interview_rate)}
                    </td>

                    {/* Overall conversion */}
                    <td className="px-4 py-3 text-gray-700">{fmt(row.overall_conversion)}</td>

                    {/* Avg days */}
                    <td className="px-4 py-3 text-gray-700">
                      {row.avg_days_in_applied !== null ? `${row.avg_days_in_applied} days` : '—'}
                    </td>

                    {/* Confidence */}
                    <td className="px-4 py-3">
                      <ConfidenceBadge count={row.total_applied} isUntagged={isUntagged} />
                    </td>
                  </tr>
                )
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}
