'use client'

import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts'
import type { TimelinePoint } from '@/types/analytics'
import { STAGE_HEX } from '@/lib/stages'

interface TimelineChartProps {
  data: TimelinePoint[]
}

export function TimelineChart({ data }: TimelineChartProps) {
  const chartData = data.map(d => ({
    ...d,
    label: new Date(d.week).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' }),
  }))

  return (
    <div className="w-full h-56">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={chartData} margin={{ left: 0, right: 16, top: 8, bottom: 8 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9" />
          <XAxis dataKey="label" tick={{ fontSize: 11 }} />
          <YAxis allowDecimals={false} tick={{ fontSize: 11 }} />
          <Tooltip contentStyle={{ fontSize: 12 }} />
          <Line type="monotone" dataKey="count" stroke={STAGE_HEX.applied} strokeWidth={2} dot={{ r: 3 }} />
        </LineChart>
      </ResponsiveContainer>
    </div>
  )
}
