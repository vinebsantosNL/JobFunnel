'use client'

import type { FunnelData } from '@/types/analytics'
import type { Stage } from '@/types/database'
import { ArrowDown } from 'lucide-react'

const STAGE_COLORS: Partial<Record<Stage, string>> = {
  applied:      '#2563EB',
  screening:    '#7C3AED',
  interviewing: '#F59E0B',
  offer:        '#10B981',
}

const FUNNEL_STAGES: Stage[] = ['applied', 'screening', 'interviewing', 'offer']

const STAGE_LABELS: Partial<Record<Stage, string>> = {
  applied:      'Applied',
  screening:    'Screening',
  interviewing: 'Interviewing',
  offer:        'Offer',
}

// Conversion rate for each stage transition (shown between bars)
const CONVERSION_LABELS: Partial<Record<Stage, string>> = {
  screening:    'Applied → Screening',
  interviewing: 'Screening → Interview',
  offer:        'Interview → Offer',
}

interface FunnelChartProps {
  data: FunnelData
}

export function FunnelChart({ data }: FunnelChartProps) {
  const stageCounts = data.stage_counts
  const funnelCounts = data.funnel_counts

  // Bar width = step-over-step conversion rate so bar and label tell the same story
  // Applied is always 100% (the baseline anchor)
  const barWidths: Partial<Record<Stage, number>> = {
    applied:      100,
    screening:    data.applied_to_screening,
    interviewing: data.screening_to_interview,
    offer:        data.interview_to_offer,
  }

  const conversionRates: Partial<Record<Stage, number>> = {
    screening:    data.applied_to_screening,
    interviewing: data.screening_to_interview,
    offer:        data.interview_to_offer,
  }

  // Count to show next to label — Applied uses cumulative, others use current stage
  function getCount(stage: Stage): number {
    if (stage === 'applied') return funnelCounts.applied ?? 0
    return stageCounts[stage] ?? 0
  }

  return (
    <div className="space-y-0">
      {FUNNEL_STAGES.map((stage, idx) => {
        const width = barWidths[stage] ?? 0
        const count = getCount(stage)
        const color = STAGE_COLORS[stage]!
        const convRate = conversionRates[stage]
        const convLabel = CONVERSION_LABELS[stage]
        const isApplied = stage === 'applied'

        return (
          <div key={stage}>
            {/* Step-over-step conversion label between stages */}
            {idx > 0 && convRate !== undefined && (
              <div className="flex items-center gap-2 py-1.5 pl-1">
                <ArrowDown className="w-3.5 h-3.5 text-gray-300 flex-shrink-0" />
                <span className="text-xs text-gray-400">{convLabel}:</span>
                <span className={`text-xs font-semibold ${
                  convRate >= 50  ? 'text-green-600' :
                  convRate >= 25  ? 'text-amber-500' : 'text-red-500'
                }`}>
                  {convRate}%
                </span>
              </div>
            )}

            {/* Bar row */}
            <div className="flex items-center gap-3">
              {/* Left label: Stage · X jobs */}
              <div className="w-32 text-right flex-shrink-0">
                {isApplied ? (
                  <span className="text-sm font-bold text-gray-900">
                    Applied · <span className="font-normal text-gray-500">{count} jobs</span>
                  </span>
                ) : (
                  <span className="text-sm text-gray-600">
                    {STAGE_LABELS[stage]} · <span className="text-gray-400">{count}</span>
                  </span>
                )}
              </div>

              {/* Bar — width equals the step-over-step conversion rate */}
              <div className="flex-1 bg-gray-100 rounded-full h-7 relative overflow-hidden">
                <div
                  className="h-full rounded-full transition-all duration-700"
                  style={{
                    width: `${Math.max(width, width > 0 ? 3 : 0)}%`,
                    backgroundColor: color,
                    opacity: isApplied ? 1 : 0.85,
                  }}
                />
              </div>
            </div>
          </div>
        )
      })}
    </div>
  )
}
