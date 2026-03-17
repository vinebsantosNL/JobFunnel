'use client'

import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts'
import type { FunnelData } from '@/types/analytics'
import type { Stage } from '@/types/database'

const STAGE_COLORS: Partial<Record<Stage, string>> = {
  applied: '#2563EB',
  screening: '#7C3AED',
  interviewing: '#F59E0B',
  offer: '#10B981',
  rejected: '#EF4444',
}

const STAGE_LABELS: Partial<Record<Stage, string>> = {
  applied: 'Applied',
  screening: 'Screening',
  interviewing: 'Interviewing',
  offer: 'Offer',
  rejected: 'Rejected',
}

interface FunnelChartProps {
  data: FunnelData
}

export function FunnelChart({ data }: FunnelChartProps) {
  const chartData = (['applied', 'screening', 'interviewing', 'offer', 'rejected'] as Stage[]).map(stage => ({
    stage: STAGE_LABELS[stage] ?? stage,
    count: data.stage_counts[stage] ?? 0,
    color: STAGE_COLORS[stage] ?? '#64748B',
  }))

  return (
    <div className="w-full h-64">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={chartData} layout="vertical" margin={{ left: 16, right: 24, top: 8, bottom: 8 }}>
          <XAxis type="number" tick={{ fontSize: 12 }} />
          <YAxis type="category" dataKey="stage" width={90} tick={{ fontSize: 12 }} />
          <Tooltip
            formatter={(value) => [value, 'Applications']}
            contentStyle={{ fontSize: 12 }}
          />
          <Bar dataKey="count" radius={[0, 4, 4, 0]}>
            {chartData.map((entry, i) => (
              <Cell key={i} fill={entry.color} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  )
}
