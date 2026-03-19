'use client'

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

const FUNNEL_STAGES: Stage[] = ['applied', 'screening', 'interviewing', 'offer']

const BOTTOM_LABELS: Partial<Record<Stage, string>> = {
  applied: 'APPLIED',
  screening: 'SCREENED',
  interviewing: 'INTERVIEW',
  offer: 'OFFER',
}

interface FunnelChartProps {
  data: FunnelData
}

export function FunnelChart({ data }: FunnelChartProps) {
  const maxCount = data.stage_counts.applied ?? 1

  return (
    <div>
      {/* Horizontal progress bars */}
      <div className="space-y-4">
        {FUNNEL_STAGES.map((stage) => {
          const count = data.stage_counts[stage] ?? 0
          const pct = maxCount > 0 ? Math.round((count / maxCount) * 100) : 0

          return (
            <div key={stage}>
              <div className="flex items-center justify-between mb-1">
                <span className="text-sm font-medium text-gray-700">
                  {STAGE_LABELS[stage]} ({count})
                </span>
                <span className="text-sm text-gray-500">{pct}%</span>
              </div>
              <div className="w-full bg-gray-100 rounded-full h-3">
                <div
                  className="h-3 rounded-full transition-all duration-500"
                  style={{
                    width: `${pct}%`,
                    backgroundColor: STAGE_COLORS[stage],
                  }}
                />
              </div>
            </div>
          )
        })}
      </div>

      {/* Bottom row with numbers */}
      <div className="flex items-end justify-between mt-6 pt-4 border-t border-gray-100">
        {FUNNEL_STAGES.map((stage) => (
          <div key={stage} className="text-center">
            <p
              className="text-xl font-bold"
              style={{ color: STAGE_COLORS[stage] }}
            >
              {String(data.stage_counts[stage] ?? 0).padStart(2, '0')}
            </p>
            <p className="text-xs text-gray-400 uppercase tracking-wide mt-0.5">
              {BOTTOM_LABELS[stage]}
            </p>
          </div>
        ))}
      </div>
    </div>
  )
}
