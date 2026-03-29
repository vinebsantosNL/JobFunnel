'use client'

import { useEffect, useState } from 'react'
import type { FunnelData } from '@/types/analytics'
import type { Stage } from '@/types/database.types'
import { STAGE_HEX } from '@/lib/stages'

const FUNNEL_STAGES: Stage[] = ['applied', 'screening', 'interviewing', 'offer']

const STAGE_LABELS: Partial<Record<Stage, string>> = {
  applied: 'Applied',
  screening: 'Screening',
  interviewing: 'Interviewing',
  offer: 'Offer',
}

const BENCHMARKS: Partial<Record<string, number>> = {
  screening: 22,
  interviewing: 12,
  offer: 3,
}

interface FunnelChartProps {
  data: FunnelData
  dateLabel?: string
  totalApplications?: number
}

export function FunnelChart({ data, dateLabel, totalApplications }: FunnelChartProps) {
  const [mounted, setMounted] = useState(false)
  useEffect(() => {
    setMounted(true)
  }, [])

  const appliedCount = data.funnel_counts.applied
  const total = totalApplications ?? appliedCount

  // Compute percentages relative to applied count
  function getPercentage(stage: Stage): number {
    if (stage === 'applied') return 100
    const count = data.funnel_counts[stage as keyof typeof data.funnel_counts] ?? 0
    return appliedCount > 0 ? Math.round((count / appliedCount) * 100) : 0
  }

  function getCount(stage: Stage): number {
    return data.funnel_counts[stage as keyof typeof data.funnel_counts] ?? 0
  }

  // Find worst performing stage vs benchmark for summary chip
  const worstStage = (() => {
    let worst: { stage: string; rate: number; bench: number; diff: number } | null = null
    for (const stage of FUNNEL_STAGES) {
      if (stage === 'applied') continue
      const rate = getPercentage(stage)
      const bench = BENCHMARKS[stage]
      if (bench === undefined) continue
      const diff = rate - bench
      if (diff < 0 && (worst === null || diff < worst.diff)) {
        worst = { stage, rate, bench, diff }
      }
    }
    return worst
  })()

  // Summary chip — show worst conversion vs benchmark
  const summaryChip = (() => {
    if (worstStage) {
      const fromStage = FUNNEL_STAGES[FUNNEL_STAGES.indexOf(worstStage.stage as Stage) - 1]
      const fromLabel = fromStage === 'applied' ? 'Applied' : STAGE_LABELS[fromStage] ?? fromStage
      const toLabel = STAGE_LABELS[worstStage.stage as Stage] ?? worstStage.stage
      return {
        text: `${fromLabel}\u2192${toLabel}: ${worstStage.rate}% \u2193 bench ${worstStage.bench}%`,
        isGood: false,
      }
    }
    // All stages at or above benchmark
    const screeningRate = getPercentage('screening')
    const screeningBench = BENCHMARKS['screening'] ?? 0
    if (screeningRate >= screeningBench && appliedCount > 0) {
      return {
        text: `Applied\u2192Screen: ${screeningRate}% \u2191 bench ${screeningBench}%`,
        isGood: true,
      }
    }
    return null
  })()

  return (
    <div>
      {/* Card header */}
      <div className="flex items-start justify-between mb-4 gap-3">
        <div>
          <h3
            className="text-base font-semibold"
            style={{ color: 'var(--jf-text-primary)' }}
          >
            Application Funnel
          </h3>
          <p
            className="font-mono text-xs mt-0.5"
            style={{ color: 'var(--jf-text-muted)' }}
          >
            {dateLabel ?? 'Last 30 days'} &middot; {total} applications
          </p>
        </div>
        {summaryChip && (
          <span
            className="font-mono text-[11px] px-2 py-0.5 rounded-full whitespace-nowrap shrink-0"
            style={{
              background: summaryChip.isGood ? 'var(--jf-success-tint)' : 'var(--jf-error-tint)',
              color: summaryChip.isGood ? 'var(--jf-success)' : 'var(--jf-error)',
              border: `1px solid ${summaryChip.isGood ? 'var(--jf-success-border)' : 'var(--jf-error-border)'}`,
            }}
          >
            {summaryChip.text}
          </span>
        )}
      </div>

      {/* Funnel rows */}
      <div className="divide-y" style={{ borderColor: 'var(--jf-border)' }}>
        {FUNNEL_STAGES.map((stage, index) => {
          const percentage = getPercentage(stage)
          const count = getCount(stage)
          const color = STAGE_HEX[stage] ?? '#94A3B8'
          const isApplied = stage === 'applied'
          const benchmark = BENCHMARKS[stage]
          const barWidth = Math.max(percentage, percentage > 0 ? 4 : 0)
          const staggerDelay = `${index * 120}ms`

          // Benchmark comparison
          const isBelowBench =
            benchmark !== undefined && percentage < benchmark
          const isAtOrAboveBench =
            benchmark !== undefined && percentage >= benchmark

          return (
            <div
              key={stage}
              className="flex items-center gap-3 py-4"
              style={{ borderColor: 'var(--jf-border)' }}
            >
              {/* Stage label */}
              <span
                className="w-20 shrink-0 text-sm font-medium"
                style={{ color: 'var(--jf-text-secondary)' }}
              >
                {STAGE_LABELS[stage]}
              </span>

              {/* Bar track */}
              <div
                className="flex-1 rounded-lg h-10 relative overflow-hidden"
                style={{ background: 'var(--jf-border)' }}
              >
                <div
                  className="h-full rounded-lg absolute left-0 top-0 flex items-center justify-center"
                  style={{
                    width: mounted ? `${barWidth}%` : '0%',
                    background: color,
                    transition: `width 0.4s cubic-bezier(0.16,1,0.3,1) ${staggerDelay}`,
                  }}
                >
                  {/* Count badge inside the bar */}
                  {count > 0 && (
                    <span
                      className="rounded-md px-2 py-0.5 text-xs font-mono font-bold text-white whitespace-nowrap"
                      style={{
                        background: 'rgba(255,255,255,0.2)',
                        opacity: mounted ? 1 : 0,
                        transition: `opacity 0.2s ease ${index * 80 + 200}ms`,
                      }}
                    >
                      {isApplied ? `${count} apps` : String(count)}
                    </span>
                  )}
                </div>
              </div>

              {/* Percentage + benchmark */}
              <div className="w-16 shrink-0 text-right">
                <div
                  className="font-mono font-bold text-lg"
                  style={{ color: 'var(--jf-text-primary)' }}
                >
                  {percentage}%
                </div>
                <div className="font-mono text-xs">
                  {isApplied ? (
                    <span style={{ color: 'var(--jf-text-muted)' }}>
                      baseline
                    </span>
                  ) : benchmark !== undefined ? (
                    <span
                      style={{
                        color: isBelowBench
                          ? 'var(--jf-warning)'
                          : isAtOrAboveBench
                            ? 'var(--jf-success)'
                            : 'var(--jf-text-muted)',
                      }}
                    >
                      bench {benchmark}%
                    </span>
                  ) : null}
                </div>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
