'use client'

import type { FunnelData } from '@/types/analytics'
import type { Stage } from '@/types/database'

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

interface FunnelChartProps {
  data: FunnelData
}

export function FunnelChart({ data }: FunnelChartProps) {
  const funnelCounts = data.funnel_counts

  // Bar width = step-over-step conversion rate (Applied is baseline at 100%)
  const barWidths: Partial<Record<Stage, number>> = {
    applied:      100,
    screening:    data.applied_to_screening,
    interviewing: data.screening_to_interview,
    offer:        data.interview_to_offer,
  }

  // Conversion rate shown inside each non-applied bar
  const conversionRates: Partial<Record<Stage, number>> = {
    screening:    data.applied_to_screening,
    interviewing: data.screening_to_interview,
    offer:        data.interview_to_offer,
  }

  // All counts are cumulative: how many jobs ever passed through each stage
  function getCount(stage: Stage): number {
    return funnelCounts[stage as keyof typeof funnelCounts] ?? 0
  }

  return (
    <div className="space-y-3">
      {FUNNEL_STAGES.map((stage) => {
        const width = barWidths[stage] ?? 0
        const count = getCount(stage)
        const color = STAGE_COLORS[stage]!
        const convRate = conversionRates[stage]
        const isApplied = stage === 'applied'

        return (
          <div key={stage} className="flex items-center gap-3">
            {/* Left label: Stage · X jobs */}
            <div className="w-36 text-right flex-shrink-0">
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

            {/* Bar — width equals the step-over-step conversion rate, % label inside */}
            <div className="flex-1 bg-gray-100 rounded-full h-7 relative overflow-hidden">
              <div
                className="h-full rounded-full transition-all duration-700 flex items-center justify-end pr-3"
                style={{
                  width: `${Math.max(width, width > 0 ? 4 : 0)}%`,
                  backgroundColor: color,
                  opacity: isApplied ? 1 : 0.85,
                }}
              >
                {convRate !== undefined && convRate > 0 && (
                  <span className="text-xs font-semibold text-white/90 leading-none">
                    {convRate}%
                  </span>
                )}
              </div>
            </div>
          </div>
        )
      })}
    </div>
  )
}
