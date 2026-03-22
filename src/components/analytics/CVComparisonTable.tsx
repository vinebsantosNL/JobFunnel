'use client'

import { useState } from 'react'
import { Badge } from '@/components/ui/badge'
import type { CVComparisonRow } from '@/lib/services/analyticsService'

type SortKey = keyof Pick<
  CVComparisonRow,
  | 'version_name'
  | 'total_applied'
  | 'screening_rate'
  | 'interview_rate'
  | 'overall_conversion'
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

const ROW_BORDER_COLORS = ['#2563EB', '#64748B', '#93C5FD', '#7C3AED', '#059669']

export function CVComparisonTable({
  rows,
  cvVersionDefaults,
  cvVersionArchived,
}: CVComparisonTableProps) {
  const [sortKey, setSortKey] = useState<SortKey>('total_applied')
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>('desc')

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

  // Always exclude archived versions
  const filtered = rows.filter((r) => {
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
  ]

  return (
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
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-100">
          {sorted.length === 0 ? (
            <tr>
              <td colSpan={5} className="px-4 py-8 text-center text-gray-400 text-sm">
                No data available
              </td>
            </tr>
          ) : (
            sorted.map((row, rowIndex) => {
              const isUntagged = row.version_id === null
              const isDefault = row.version_id ? cvVersionDefaults[row.version_id] : false
              const isBestScreening =
                !isUntagged &&
                bestScreeningRate > 0 &&
                row.screening_rate === bestScreeningRate
              const borderColor = ROW_BORDER_COLORS[rowIndex % ROW_BORDER_COLORS.length]

              return (
                <tr
                  key={row.version_id ?? 'untagged'}
                  className={`transition-colors ${isUntagged ? 'bg-gray-50/50' : 'hover:bg-gray-50'}`}
                >
                  {/* Version name with colored left border */}
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2 flex-wrap">
                      <div
                        className="w-[3px] h-6 rounded-full flex-shrink-0"
                        style={{ backgroundColor: borderColor }}
                      />
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
                </tr>
              )
            })
          )}
        </tbody>
      </table>
    </div>
  )
}
