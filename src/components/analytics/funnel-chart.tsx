'use client'

import type { FunnelData } from '@/types/analytics'
import type { Stage } from '@/types/database'
import { ArrowDown } from 'lucide-react'

const STAGE_COLORS: Partial<Record<Stage, string>> = {
  applied: '#2563EB',
  screening: '#7C3AED',
  interviewing: '#F59E0B',
  offer: '#10B981',
  hired: '#059669',
  rejected: '#EF4444',
}

const STAGE_LABELS: Partial<Record<Stage, string>> = {
  applied: 'Applied',
  screening: 'Screening',
  interviewing: 'Interviewing',
  offer: 'Offer',
  hired: 'Hired',
  rejected: 'Rejected',
}

// Funnel bars: current stage only (matches what user sees in pipeline)
const FUNNEL_STAGES: Stage[] = ['applied', 'screening', 'interviewing', 'offer']

// Bottom summary: all outcome stages so they sum to Total Applied
const SUMMARY_STAGES: Stage[] = ['applied', 'screening', 'interviewing', 'offer', 'hired', 'rejected']

const CONVERSION_LABELS: Partial<Record<Stage, string>> = {
  screening: 'Applied → Screening',
  interviewing: 'Screening → Interview',
  offer: 'Interview → Offer',
}

interface FunnelChartProps {
  data: FunnelData
}

export function FunnelChart({ data }: FunnelChartProps) {
  // Bars use current stage_counts — matches pipeline columns exactly
  const stageCounts = data.stage_counts
  const maxCount = Math.max(stageCounts.applied ?? 0, 1)

  const conversionRates: Partial<Record<Stage, number>> = {
    screening: data.applied_to_screening,
    interviewing: data.screening_to_interview,
    offer: data.interview_to_offer,
  }

  return (
    <div className="space-y-0">
      {FUNNEL_STAGES.map((stage, idx) => {
        const count = stageCounts[stage] ?? 0
        const pct = Math.round((count / maxCount) * 100)
        const color = STAGE_COLORS[stage]!
        const convRate = conversionRates[stage]
        const convLabel = CONVERSION_LABELS[stage]

        return (
          <div key={stage}>
            {/* Conversion rate arrow between stages (from funnel_counts — cumulative) */}
            {idx > 0 && (
              <div className="flex items-center gap-2 py-1.5 pl-1">
                <ArrowDown className="w-3.5 h-3.5 text-gray-300 flex-shrink-0" />
                <span className="text-xs text-gray-400">{convLabel}:</span>
                <span className={`text-xs font-semibold ${
                  (convRate ?? 0) >= 50 ? 'text-green-600' :
                  (convRate ?? 0) >= 25 ? 'text-amber-600' : 'text-red-500'
                }`}>{convRate ?? 0}%</span>
              </div>
            )}

            {/* Bar row */}
            <div className="flex items-center gap-3">
              <div className="w-24 text-right flex-shrink-0">
                <span className="text-sm font-medium text-gray-700">{STAGE_LABELS[stage]}</span>
                <span className="text-xs text-gray-400 ml-1">({count})</span>
              </div>
              <div className="flex-1 bg-gray-100 rounded-full h-7 relative overflow-hidden">
                <div
                  className="h-full rounded-full transition-all duration-700 flex items-center justify-end pr-2"
                  style={{ width: `${Math.max(pct, pct > 0 ? 4 : 0)}%`, backgroundColor: color }}
                >
                  {pct >= 15 && (
                    <span className="text-white text-xs font-semibold">{pct}%</span>
                  )}
                </div>
                {pct < 15 && pct > 0 && (
                  <span
                    className="absolute top-1/2 -translate-y-1/2 text-xs font-semibold text-gray-600"
                    style={{ left: `calc(${pct}% + 8px)` }}
                  >
                    {pct}%
                  </span>
                )}
              </div>
            </div>
          </div>
        )
      })}

      {/* Summary row — 6 stages so they sum to Total Applied */}
      <div className="flex items-end justify-between mt-5 pt-4 border-t border-gray-100">
        {SUMMARY_STAGES.map((stage) => (
          <div key={stage} className="text-center">
            <p className="text-2xl font-bold tabular-nums" style={{ color: STAGE_COLORS[stage] }}>
              {String(stageCounts[stage] ?? 0).padStart(2, '0')}
            </p>
            <p className="text-[10px] text-gray-400 uppercase tracking-wider mt-0.5">
              {STAGE_LABELS[stage]}
            </p>
          </div>
        ))}
      </div>
    </div>
  )
}
