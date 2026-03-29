'use client'

import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts'
import type { TimelinePoint } from '@/types/analytics'

interface TimelineChartProps {
  data: TimelinePoint[]
}

export function TimelineChart({ data }: TimelineChartProps) {
  const chartData = data.map(d => ({
    ...d,
    label: new Date(d.week).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' }),
  }))

  const monoTick = {
    fontFamily: 'var(--font-dm-mono, monospace)',
    fontSize: 11,
    fill: 'var(--jf-text-muted)',
  }

  return (
    <div>
      <p className="text-sm font-medium text-[--jf-text-secondary] mb-3">
        Applications / week
      </p>
      <div className="w-full" style={{ height: 200 }}>
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={chartData} margin={{ left: 0, right: 16, top: 8, bottom: 8 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="var(--jf-border)" />
            <XAxis dataKey="label" tick={monoTick} />
            <YAxis allowDecimals={false} tick={monoTick} />
            <Tooltip
              contentStyle={{
                fontSize: 12,
                fontFamily: 'var(--font-dm-mono, monospace)',
              }}
            />
            <Bar
              dataKey="count"
              fill="var(--jf-interactive)"
              radius={[4, 4, 0, 0]}
            />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  )
}
