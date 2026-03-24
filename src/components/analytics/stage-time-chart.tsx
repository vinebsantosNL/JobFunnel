'use client'

import type { StageTimePoint } from '@/types/analytics'
import { STAGE_CONFIG, STAGE_HEX } from '@/lib/stages'
import type { Stage } from '@/types/database.types'

// Enforce display order: saved → applied → screening → interviewing → offer
const ORDERED_STAGES: Stage[] = ['saved', 'applied', 'screening', 'interviewing', 'offer']

interface StageTimeChartProps {
  data: StageTimePoint[]
}

export function StageTimeChart({ data }: StageTimeChartProps) {
  // Sort by canonical order, suppress stages with 0 avg days
  const stageMap = new Map(data.map(d => [d.stage, d]))

  const rows = ORDERED_STAGES
    .filter(stage => {
      const point = stageMap.get(stage)
      return point && point.avg_days > 0
    })
    .map(stage => {
      const point = stageMap.get(stage)!
      return {
        stage,
        label: STAGE_CONFIG[stage]?.label ?? stage,
        avg_days: point.avg_days,
        color: STAGE_HEX[stage] ?? '#94A3B8',
      }
    })

  if (rows.length === 0) {
    return (
      <p className="text-sm text-[--jf-text-muted] py-8 text-center">
        No stage transition data yet
      </p>
    )
  }

  const maxDays = Math.max(...rows.map(r => r.avg_days))

  return (
    <div className="space-y-3">
      {rows.map(row => {
        const pct = maxDays > 0 ? (row.avg_days / maxDays) * 100 : 0

        return (
          <div key={row.stage} className="flex items-center gap-3">
            {/* Stage dot */}
            <span
              className="w-2.5 h-2.5 rounded-full shrink-0"
              style={{ background: row.color }}
            />

            {/* Stage name */}
            <span className="text-sm text-[--jf-text-secondary] w-24 shrink-0">
              {row.label}
            </span>

            {/* Bar track */}
            <div className="flex-1 h-2 rounded-full bg-[--jf-border]">
              <div
                className="h-2 rounded-full transition-all duration-300"
                style={{
                  background: row.color,
                  width: `${pct}%`,
                }}
              />
            </div>

            {/* Days value */}
            <span className="font-mono text-sm text-[--jf-text-primary] w-16 text-right shrink-0">
              {row.avg_days.toFixed(1)} days
            </span>
          </div>
        )
      })}
    </div>
  )
}
