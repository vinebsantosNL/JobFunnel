'use client'

import { useState } from 'react'
import { MetricCard } from '@/components/analytics/metric-card'
import { FunnelChart } from '@/components/analytics/funnel-chart'
import { TimelineChart } from '@/components/analytics/timeline-chart'
import { StageTimeChart } from '@/components/analytics/stage-time-chart'
import { CVTestingPanel } from '@/components/analytics/CVTestingPanel'
import { useFunnelData, useTimelineData, useStageTimeData } from '@/hooks/use-analytics'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import Link from 'next/link'

const DATE_PRESETS = [
  { label: 'Last 30 days', days: 30 },
  { label: 'Last 45 days', days: 45 },
  { label: 'Last 90 days', days: 90 },
] as const

type Tab = 'funnel' | 'timeline' | 'cv-testing'

function getDateRange(days: number): { from: string; to: string } {
  const to = new Date()
  const from = new Date()
  from.setDate(from.getDate() - days)
  return { from: from.toISOString(), to: to.toISOString() }
}

function formatDateRangeLabel(days: number): string {
  const to = new Date()
  const from = new Date()
  from.setDate(from.getDate() - days)
  const fmt = (d: Date) => d.toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })
  return `${fmt(from)} – ${fmt(to)}`
}

export function AnalyticsDashboard() {
  const [activeTab, setActiveTab] = useState<Tab>('funnel')
  const [presetIndex, setPresetIndex] = useState(0)

  const preset = DATE_PRESETS[presetIndex]
  const dateRange = getDateRange(preset.days)

  const { data: funnel, isLoading: funnelLoading } = useFunnelData(dateRange)
  const { data: timeline, isLoading: timelineLoading } = useTimelineData()
  const { data: stageTime, isLoading: stageTimeLoading } = useStageTimeData(dateRange)

  // Total Applied = jobs in Applied stage only
  const totalApplied = funnel?.stage_counts.applied ?? 0

  // Active = Screening + Interviewing + Offer
  const activeApps = funnel
    ? (funnel.stage_counts.screening ?? 0) + (funnel.stage_counts.interviewing ?? 0) + (funnel.stage_counts.offer ?? 0)
    : 0

  const offers = funnel?.stage_counts.offer ?? 0
  const conversion = funnel?.overall_conversion ?? 0

  return (
    <div className="flex-1 p-6 overflow-auto">
      <div className="space-y-6">
        {/* Tab navigation */}
        <div className="flex gap-1 border-b border-gray-200">
          {(
            [
              { key: 'funnel', label: 'Funnel Overview' },
              { key: 'timeline', label: 'Timeline' },
              { key: 'cv-testing', label: 'CV Testing', dot: true },
            ] as { key: Tab; label: string; dot?: boolean }[]
          ).map(({ key, label, dot }) => (
            <button
              key={key}
              onClick={() => setActiveTab(key)}
              className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors -mb-px flex items-center gap-1.5 ${
                activeTab === key
                  ? 'border-blue-600 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              {label}
              {dot && <span className="w-1.5 h-1.5 rounded-full bg-blue-500 inline-block" />}
            </button>
          ))}
        </div>

        {(activeTab === 'funnel' || activeTab === 'timeline') && (
          <div className="flex flex-col gap-1 w-fit">
            {/* Date filter pills */}
            <div className="border border-gray-200 rounded-lg overflow-hidden flex">
              {DATE_PRESETS.map((p, i) => (
                <button
                  key={i}
                  onClick={() => setPresetIndex(i)}
                  className={`px-4 py-1.5 text-sm transition-colors ${
                    presetIndex === i
                      ? 'bg-gray-900 text-white'
                      : 'bg-white text-gray-600 hover:bg-gray-50'
                  }`}
                >
                  {p.label}
                </button>
              ))}
            </div>
            {/* Active range subtitle */}
            <p className="text-xs text-gray-400 pl-1">{formatDateRangeLabel(preset.days)}</p>
          </div>
        )}

        {activeTab === 'funnel' && (
          <>
            {/* Metric cards — Total Applied → Active → Offers → Conversion */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              <MetricCard
                title="Total Applied"
                value={funnelLoading ? '—' : String(totalApplied)}
                subtitle="Applications submitted"
                borderColor="border-blue-500"
              />
              <MetricCard
                title="Active"
                value={funnelLoading ? '—' : String(activeApps)}
                subtitle="Screening · Interview · Offer"
                borderColor="border-blue-400"
              />
              <MetricCard
                title="Offers"
                value={funnelLoading ? '—' : String(offers)}
                subtitle="Received"
                borderColor="border-amber-500"
              />
              <MetricCard
                title="Conversion"
                value={funnelLoading ? '—' : `${conversion}%`}
                subtitle="Applied → Offer"
                borderColor="border-green-500"
              />
            </div>

            {/* Funnel + Stage Efficiency side-by-side */}
            <div className="flex gap-4">
              {/* Funnel chart */}
              <Card className="flex-1">
                <CardHeader>
                  <CardTitle className="text-base">Application Funnel</CardTitle>
                </CardHeader>
                <CardContent>
                  {funnelLoading ? (
                    <div className="h-64 flex items-center justify-center text-gray-400 text-sm">Loading...</div>
                  ) : funnel ? (
                    <FunnelChart data={funnel} />
                  ) : (
                    <div className="h-64 flex items-center justify-center text-gray-400 text-sm">No data yet</div>
                  )}
                </CardContent>
              </Card>

              {/* Stage Efficiency — anchored to funnel */}
              <div className="w-60 flex-shrink-0 hidden lg:flex flex-col">
                <Card className="flex-1">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-semibold text-gray-900">Stage Efficiency</CardTitle>
                    <p className="text-xs text-gray-400">Average days spent per stage</p>
                  </CardHeader>
                  <CardContent className="space-y-0 pt-0">
                    {[
                      {
                        label: 'Applied → Screened',
                        stage: 'applied' as const,
                        color: 'bg-blue-500',
                        link: '#funnel',
                      },
                      {
                        label: 'Screening → Interview',
                        stage: 'screening' as const,
                        color: 'bg-purple-500',
                        link: '#funnel',
                      },
                      {
                        label: 'Interview → Offer',
                        stage: 'interviewing' as const,
                        color: 'bg-amber-500',
                        link: '#funnel',
                      },
                    ].map(({ label, stage, color }) => {
                      const days = stageTime?.find(s => s.stage === stage)?.avg_days
                      return (
                        <div key={stage} className="flex items-center gap-2 py-2.5 border-b border-gray-50 last:border-0">
                          <span className={`w-2 h-2 rounded-full flex-shrink-0 ${color}`} />
                          <span className="text-xs text-gray-500 flex-1 leading-tight">{label}</span>
                          <span className="text-xs font-semibold text-gray-900 tabular-nums">
                            {days != null ? `${days}d` : '—'}
                          </span>
                        </div>
                      )
                    })}

                    {/* Avg total process time */}
                    {stageTime && stageTime.length > 0 && (() => {
                      const total = stageTime
                        .filter(s => ['applied', 'screening', 'interviewing'].includes(s.stage))
                        .reduce((sum, s) => sum + s.avg_days, 0)
                      return (
                        <div className="mt-3 pt-3 border-t border-gray-100 flex items-center gap-2">
                          <span className="w-2 h-2 rounded-full flex-shrink-0 bg-gray-300" />
                          <span className="text-xs text-gray-500 flex-1">Avg total process</span>
                          <span className="text-xs font-semibold text-gray-900">{Math.round(total)}d</span>
                        </div>
                      )
                    })()}

                    <Link
                      href="/pipeline"
                      className="block mt-4 text-center text-xs text-blue-600 hover:text-blue-700 font-medium transition-colors"
                    >
                      View Pipeline →
                    </Link>
                  </CardContent>
                </Card>
              </div>
            </div>

            {/* Average Days per Stage */}
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Average Days per Stage</CardTitle>
              </CardHeader>
              <CardContent>
                {stageTimeLoading ? (
                  <div className="h-56 flex items-center justify-center text-gray-400 text-sm">Loading...</div>
                ) : (
                  <StageTimeChart data={stageTime ?? []} />
                )}
              </CardContent>
            </Card>
          </>
        )}

        {activeTab === 'timeline' && (
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
        )}

        {activeTab === 'cv-testing' && <CVTestingPanel />}
      </div>
    </div>
  )
}
