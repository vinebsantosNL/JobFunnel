'use client'

import {
  BarChart,
  Bar,
  XAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
} from 'recharts'
import type { TimelinePoint, StageTimePoint } from '@/types/analytics'
import type { Stage } from '@/types/database.types'
import { STAGE_HEX, STAGE_CONFIG } from '@/lib/stages'

const STAGE_TIME_STAGES: Stage[] = ['applied', 'screening', 'interviewing']

interface RightAnalyticsPanelProps {
  weeklyData: TimelinePoint[]
  stageTimeData: StageTimePoint[]
}

export function RightAnalyticsPanel({
  weeklyData,
  stageTimeData,
}: RightAnalyticsPanelProps) {
  // Transform weekly data to W1, W2, etc labels
  const chartData = weeklyData.map((d, i) => ({
    ...d,
    label: `W${i + 1}`,
  }))

  const monoTick = {
    fontFamily: 'DM Mono, monospace',
    fontSize: 11,
    fill: 'var(--jf-text-muted)',
  }

  // Stage time data
  const stageMap = new Map(stageTimeData.map((d) => [d.stage, d]))
  const maxDays = Math.max(
    ...STAGE_TIME_STAGES.map(
      (s) => stageMap.get(s)?.avg_days ?? 0
    ),
    1
  )

  return (
    <div>
      {/* Applications Over Time */}
      <div>
        <h3
          className="text-base font-semibold"
          style={{ color: 'var(--jf-text-primary)' }}
        >
          Applications Over Time
        </h3>
        <p
          className="font-mono text-xs mt-0.5 mb-3"
          style={{ color: 'var(--jf-text-muted)' }}
        >
          Weekly volume &middot; last 30 days
        </p>
        <div className="w-full" style={{ height: 200 }}>
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={chartData}
              margin={{ left: 0, right: 8, top: 8, bottom: 8 }}
            >
              <CartesianGrid
                strokeDasharray="3 3"
                stroke="var(--jf-border)"
                vertical={false}
              />
              <XAxis dataKey="label" tick={monoTick} axisLine={false} tickLine={false} />
              <Tooltip
                contentStyle={{
                  fontSize: 12,
                  fontFamily: 'DM Mono, monospace',
                  borderRadius: 8,
                  border: '1px solid var(--jf-border)',
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

      {/* Separator */}
      <div
        className="my-4"
        style={{ borderTop: '1px solid var(--jf-border)' }}
      />

      {/* Avg. days per stage */}
      <div>
        <h4
          className="text-sm font-semibold mb-3"
          style={{ color: 'var(--jf-text-secondary)' }}
        >
          Avg. days per stage
        </h4>
        <div className="space-y-0">
          {STAGE_TIME_STAGES.map((stage) => {
            const point = stageMap.get(stage)
            const days = point?.avg_days ?? 0
            const pct = maxDays > 0 ? (days / maxDays) * 100 : 0
            const color = STAGE_HEX[stage] ?? '#94A3B8'
            const label = STAGE_CONFIG[stage]?.label ?? stage

            return (
              <div
                key={stage}
                className="flex items-center gap-3 py-2"
              >
                {/* Colored dot */}
                <span
                  className="w-2 h-2 rounded-full shrink-0"
                  style={{ background: color }}
                />
                {/* Stage name */}
                <span
                  className="text-sm w-24 shrink-0"
                  style={{ color: 'var(--jf-text-secondary)' }}
                >
                  {label}
                </span>
                {/* Days value */}
                <span
                  className="font-mono font-semibold text-sm w-14 shrink-0"
                  style={{ color: 'var(--jf-text-primary)' }}
                >
                  {days > 0 ? `${days.toFixed(1)}d` : '\u2014'}
                </span>
                {/* Bar */}
                <div
                  className="flex-1 h-1.5 rounded-full"
                  style={{ background: 'var(--jf-border)' }}
                >
                  <div
                    className="h-1.5 rounded-full transition-all duration-300"
                    style={{
                      background: color,
                      width: `${pct}%`,
                    }}
                  />
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}
