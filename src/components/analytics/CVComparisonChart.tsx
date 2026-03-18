'use client'

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  LabelList,
  Cell,
} from 'recharts'
import type { CVComparisonRow } from '@/app/api/analytics/cv-comparison/route'

const BAR_PALETTE = ['#2563EB', '#10B981', '#7C3AED', '#F59E0B', '#EF4444', '#06B6D4', '#EC4899']

interface CVComparisonChartProps {
  rows: CVComparisonRow[]
}

interface TooltipPayloadItem {
  name: string
  value: number
}

interface CustomTooltipProps {
  active?: boolean
  payload?: TooltipPayloadItem[]
  label?: string
}

function CustomTooltip({ active, payload, label }: CustomTooltipProps) {
  if (!active || !payload || payload.length === 0) return null

  // Find the row matching this label
  return (
    <div className="bg-white border border-gray-200 rounded-lg shadow-lg p-3 text-xs space-y-1">
      <p className="font-semibold text-gray-800 mb-2">{label}</p>
      {payload.map((item) => (
        <p key={item.name} className="text-gray-600">
          {item.name}: <span className="font-medium text-gray-900">{item.value}%</span>
        </p>
      ))}
    </div>
  )
}

interface ChartDataPoint {
  name: string
  screening_rate: number
  interview_rate: number | null
  overall_conversion: number | null
  total_applied: number
  reached_offer: number
}

export function CVComparisonChart({ rows }: CVComparisonChartProps) {
  if (rows.length === 0) return null

  const chartData: ChartDataPoint[] = rows.map((row) => ({
    name: row.version_name,
    screening_rate: row.screening_rate ?? 0,
    interview_rate: row.interview_rate ?? 0,
    overall_conversion: row.overall_conversion ?? 0,
    total_applied: row.total_applied,
    reached_offer: row.reached_offer,
  }))

  return (
    <div className="w-full h-[300px]">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart
          data={chartData}
          margin={{ left: 8, right: 24, top: 20, bottom: 8 }}
        >
          <XAxis
            dataKey="name"
            tick={{ fontSize: 12 }}
            interval={0}
            tickFormatter={(v: string) => (v.length > 12 ? `${v.slice(0, 12)}…` : v)}
          />
          <YAxis
            domain={[0, 100]}
            tickFormatter={(v: number) => `${v}%`}
            tick={{ fontSize: 11 }}
            width={40}
          />
          <Tooltip content={<CustomTooltip />} />
          <Bar dataKey="screening_rate" name="Screening Rate" radius={[4, 4, 0, 0]}>
            {chartData.map((_, i) => (
              <Cell key={i} fill={BAR_PALETTE[i % BAR_PALETTE.length]} />
            ))}
            <LabelList
              dataKey="screening_rate"
              position="top"
              formatter={(v: unknown) => {
                const n = v as number
                return n > 0 ? `${n}%` : ''
              }}
              style={{ fontSize: 11, fill: '#374151' }}
            />
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  )
}
