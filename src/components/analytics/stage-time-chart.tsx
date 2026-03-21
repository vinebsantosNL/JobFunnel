'use client'

import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts'
import type { StageTimePoint } from '@/types/analytics'
import { STAGE_CONFIG } from '@/lib/stages'
import type { Stage } from '@/types/database'

const STAGE_HEX: Partial<Record<Stage, string>> = {
  saved: '#94A3B8',
  applied: '#2563EB',
  screening: '#7C3AED',
  interviewing: '#F59E0B',
  offer: '#10B981',
}

// Enforce display order: saved → applied → screening → interviewing → offer
const ORDERED_STAGES: Stage[] = ['saved', 'applied', 'screening', 'interviewing', 'offer']

interface StageTimeChartProps {
  data: StageTimePoint[]
}

export function StageTimeChart({ data }: StageTimeChartProps) {
  // Sort by canonical order, suppress stages with 0 avg days
  const stageMap = new Map(data.map(d => [d.stage, d]))

  const chartData = ORDERED_STAGES
    .filter(stage => {
      const point = stageMap.get(stage)
      return point && point.avg_days > 0
    })
    .map(stage => {
      const point = stageMap.get(stage)!
      return {
        stage: STAGE_CONFIG[stage]?.label ?? stage,
        avg_days: point.avg_days,
        color: STAGE_HEX[stage] ?? '#94A3B8',
      }
    })

  if (chartData.length === 0) {
    return (
      <div className="h-56 flex items-center justify-center text-gray-400 text-sm">
        No stage data yet
      </div>
    )
  }

  return (
    <div className="w-full h-56">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={chartData} margin={{ left: 0, right: 16, top: 8, bottom: 8 }}>
          <XAxis dataKey="stage" tick={{ fontSize: 11 }} />
          <YAxis tick={{ fontSize: 11 }} label={{ value: 'Days', angle: -90, position: 'insideLeft', fontSize: 11 }} />
          <Tooltip formatter={(v) => [`${v} days`, 'Avg time']} contentStyle={{ fontSize: 12 }} />
          <Bar dataKey="avg_days" radius={[4, 4, 0, 0]}>
            {chartData.map((entry, i) => (
              <Cell key={i} fill={entry.color} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  )
}
