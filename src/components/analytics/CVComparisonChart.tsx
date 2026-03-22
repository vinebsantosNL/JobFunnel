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
import type { CVComparisonRow } from '@/lib/services/analyticsService'
import { CHART_PALETTE } from '@/lib/stages'

const BAR_PALETTE = CHART_PALETTE
const LOW_DATA_THRESHOLD = 10

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
  total_applied: number
  isLowData: boolean
}

// Custom label that shows % + warning triangle for low data
function CustomLabel(props: Record<string, unknown>) {
  const x = typeof props.x === 'number' ? props.x : 0
  const y = typeof props.y === 'number' ? props.y : 0
  const width = typeof props.width === 'number' ? props.width : 0
  const value = typeof props.value === 'number' ? props.value : 0
  const index = typeof props.index === 'number' ? props.index : 0
  const data = Array.isArray(props.data) ? (props.data as ChartDataPoint[]) : []

  if (!value || value === 0) return null

  const isLowData = data[index]?.isLowData
  const cx = x + width / 2

  return (
    <g>
      <text
        x={cx}
        y={y - (isLowData ? 18 : 8)}
        textAnchor="middle"
        fill="#374151"
        fontSize={11}
        fontWeight={500}
      >
        {value}%
      </text>
      {isLowData && (
        <text
          x={cx}
          y={y - 6}
          textAnchor="middle"
          fill="#F59E0B"
          fontSize={11}
        >
          ▲
        </text>
      )}
    </g>
  )
}

export function CVComparisonChart({ rows }: CVComparisonChartProps) {
  if (rows.length === 0) return null

  const chartData: ChartDataPoint[] = rows.map((row) => ({
    name: row.version_name,
    screening_rate: row.screening_rate ?? 0,
    total_applied: row.total_applied,
    isLowData: row.total_applied < LOW_DATA_THRESHOLD,
  }))

  return (
    <div className="w-full h-[300px]">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart
          data={chartData}
          margin={{ left: 8, right: 24, top: 32, bottom: 8 }}
        >
          <XAxis
            dataKey="name"
            tick={{ fontSize: 12 }}
            interval={0}
            tickFormatter={(v: string) => (v.length > 14 ? `${v.slice(0, 14)}…` : v)}
          />
          <YAxis
            domain={[0, 100]}
            tickFormatter={(v: number) => `${v}%`}
            tick={{ fontSize: 11 }}
            width={40}
          />
          <Tooltip content={<CustomTooltip />} />
          <Bar dataKey="screening_rate" name="Screening Rate" radius={[4, 4, 0, 0]}>
            {chartData.map((entry, i) => (
              <Cell
                key={i}
                fill={entry.isLowData ? `${BAR_PALETTE[i % BAR_PALETTE.length]}80` : BAR_PALETTE[i % BAR_PALETTE.length]}
              />
            ))}
            <LabelList
              content={(props) => (
                <CustomLabel {...props} data={chartData} />
              )}
            />
          </Bar>
        </BarChart>
      </ResponsiveContainer>
      {chartData.some((d) => d.isLowData) && (
        <p className="text-xs text-amber-500 mt-1 flex items-center gap-1">
          <span>▲</span> Low sample size (&lt;{LOW_DATA_THRESHOLD} apps) — data may not be statistically significant
        </p>
      )}
    </div>
  )
}
