'use client'

import { useState } from 'react'
import { MetricCard } from '@/components/analytics/metric-card'
import { FunnelChart } from '@/components/analytics/funnel-chart'
import { TimelineChart } from '@/components/analytics/timeline-chart'
import { StageTimeChart } from '@/components/analytics/stage-time-chart'
import { useFunnelData, useTimelineData, useStageTimeData } from '@/hooks/use-analytics'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

const DATE_PRESETS = [
  { label: 'All time', days: undefined },
  { label: 'Last 30 days', days: 30 },
  { label: 'Last 90 days', days: 90 },
  { label: 'Last 6 months', days: 180 },
] as const

function getDateRange(days?: number): { from?: string; to?: string } {
  if (!days) return {}
  const from = new Date()
  from.setDate(from.getDate() - days)
  return { from: from.toISOString() }
}

export function AnalyticsDashboard() {
  const [presetIndex, setPresetIndex] = useState(0)
  const dateRange = getDateRange(DATE_PRESETS[presetIndex].days)

  const { data: funnel, isLoading: funnelLoading } = useFunnelData(dateRange)
  const { data: timeline, isLoading: timelineLoading } = useTimelineData()
  const { data: stageTime, isLoading: stageTimeLoading } = useStageTimeData()

  const totalApplied = funnel?.stage_counts.applied ?? 0
  const activeApps = funnel
    ? Object.entries(funnel.stage_counts)
        .filter(([s]) => !['rejected', 'withdrawn', 'saved'].includes(s))
        .reduce((acc, [, v]) => acc + v, 0)
    : 0

  return (
    <main className="flex-1 p-6 overflow-auto">
      <div className="max-w-6xl mx-auto space-y-6">
        {/* Date filter */}
        <div className="flex gap-2 flex-wrap">
          {DATE_PRESETS.map((preset, i) => (
            <button
              key={i}
              onClick={() => setPresetIndex(i)}
              className={`px-3 py-1 rounded-full text-sm border transition-colors ${
                presetIndex === i
                  ? 'bg-blue-600 text-white border-blue-600'
                  : 'bg-white text-gray-600 border-gray-200 hover:border-gray-300'
              }`}
            >
              {preset.label}
            </button>
          ))}
        </div>

        {/* Metric cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <MetricCard title="Total Applied" value={funnelLoading ? '—' : String(totalApplied)} subtitle="Applications submitted" />
          <MetricCard title="Active" value={funnelLoading ? '—' : String(activeApps)} subtitle="In pipeline" />
          <MetricCard title="Conversion" value={funnelLoading ? '—' : `${funnel?.overall_conversion ?? 0}%`} subtitle="Applied → Offer" />
          <MetricCard title="Offers" value={funnelLoading ? '—' : String(funnel?.stage_counts.offer ?? 0)} subtitle="Received" />
        </div>

        {/* Funnel chart */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Application Funnel</CardTitle>
          </CardHeader>
          <CardContent>
            {funnelLoading ? (
              <div className="h-64 flex items-center justify-center text-gray-400 text-sm">Loading...</div>
            ) : funnel ? (
              <FunnelChart data={funnel} />
            ) : null}
            {funnel && (
              <div className="flex gap-4 flex-wrap mt-4 text-xs text-gray-500">
                <span>Applied → Screening: <strong>{funnel.applied_to_screening}%</strong></span>
                <span>Screening → Interview: <strong>{funnel.screening_to_interview}%</strong></span>
                <span>Interview → Offer: <strong>{funnel.interview_to_offer}%</strong></span>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Charts row */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Applications Over Time</CardTitle>
            </CardHeader>
            <CardContent>
              {timelineLoading ? (
                <div className="h-56 flex items-center justify-center text-gray-400 text-sm">Loading...</div>
              ) : timeline && timeline.length > 0 ? (
                <TimelineChart data={timeline} />
              ) : (
                <div className="h-56 flex items-center justify-center text-gray-400 text-sm">No data yet</div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-base">Average Days per Stage</CardTitle>
            </CardHeader>
            <CardContent>
              {stageTimeLoading ? (
                <div className="h-56 flex items-center justify-center text-gray-400 text-sm">Loading...</div>
              ) : stageTime && stageTime.length > 0 ? (
                <StageTimeChart data={stageTime} />
              ) : (
                <div className="h-56 flex items-center justify-center text-gray-400 text-sm">No data yet</div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </main>
  )
}
