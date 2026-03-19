'use client'

import { useState } from 'react'
import Link from 'next/link'
import { MetricCard } from '@/components/analytics/metric-card'
import { FunnelChart } from '@/components/analytics/funnel-chart'
import { TimelineChart } from '@/components/analytics/timeline-chart'
import { StageTimeChart } from '@/components/analytics/stage-time-chart'
import { CVTestingPanel } from '@/components/analytics/CVTestingPanel'
import { useFunnelData, useTimelineData, useStageTimeData } from '@/hooks/use-analytics'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

const DATE_PRESETS = [
  { label: 'All time', days: undefined },
  { label: 'Last 30 days', days: 30 },
  { label: 'Last 90 days', days: 90 },
  { label: 'Last 6 months', days: 180 },
] as const

type Tab = 'funnel' | 'timeline' | 'cv-testing'

function getDateRange(days?: number): { from?: string; to?: string } {
  if (!days) return {}
  const from = new Date()
  from.setDate(from.getDate() - days)
  return { from: from.toISOString() }
}

export function AnalyticsDashboard() {
  const [activeTab, setActiveTab] = useState<Tab>('funnel')
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
    <div className="flex-1 p-6 overflow-auto">
      <div className="max-w-6xl mx-auto space-y-6">
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
          /* Date filter — tab-style */
          <div className="border border-gray-200 rounded-lg overflow-hidden flex w-fit">
            {DATE_PRESETS.map((preset, i) => (
              <button
                key={i}
                onClick={() => setPresetIndex(i)}
                className={`px-4 py-1.5 text-sm transition-colors ${
                  presetIndex === i
                    ? 'bg-gray-900 text-white'
                    : 'bg-white text-gray-600 hover:bg-gray-50'
                }`}
              >
                {preset.label}
              </button>
            ))}
          </div>
        )}

        {activeTab === 'funnel' && (
          <>
            {/* Metric cards */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              <MetricCard title="Total Applied" value={funnelLoading ? '—' : String(totalApplied)} subtitle="Applications submitted" borderColor="border-blue-500" />
              <MetricCard title="Active" value={funnelLoading ? '—' : String(activeApps)} subtitle="In pipeline" borderColor="border-blue-400" />
              <MetricCard title="Conversion" value={funnelLoading ? '—' : `${funnel?.overall_conversion ?? 0}%`} subtitle="Applied → Offer" borderColor="border-green-500" />
              <MetricCard title="Offers" value={funnelLoading ? '—' : String(funnel?.stage_counts.offer ?? 0)} subtitle="Received" borderColor="border-amber-500" />
            </div>

            {/* Funnel + Sidebar layout */}
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

              {/* Right sidebar */}
              <div className="w-64 flex-shrink-0 space-y-4 hidden lg:block">
                {/* Key Insight blue card */}
                <div className="bg-blue-600 text-white rounded-xl p-4">
                  <h3 className="text-sm font-bold mb-2">Key Insight</h3>
                  <p className="text-xs text-blue-100 leading-relaxed">
                    Candidates with tagged CVs are getting higher screening rates. Tag all applications for better insights.
                  </p>
                  <Link
                    href="/analytics/cv-testing"
                    className="block border border-white text-white text-sm px-4 py-2 rounded-lg hover:bg-blue-700 w-full mt-3 text-center transition-colors"
                  >
                    View CV Testing
                  </Link>
                </div>

                {/* Stage Efficiency card */}
                <div className="bg-white rounded-xl border border-gray-200 p-4">
                  <h3 className="text-sm font-semibold text-gray-900 mb-3">Stage Efficiency</h3>
                  <div className="space-y-3">
                    <div className="flex items-center gap-2">
                      <span className="w-2 h-2 rounded-full bg-green-500 flex-shrink-0" />
                      <span className="text-xs text-gray-500 flex-1">Screening Speed</span>
                      <span className="text-xs font-semibold text-gray-900">
                        {stageTime && stageTime.length > 0
                          ? `${stageTime.find(s => s.stage === 'applied')?.avg_days ?? '2.4'} days`
                          : '2.4 days'}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="w-2 h-2 rounded-full bg-amber-500 flex-shrink-0" />
                      <span className="text-xs text-gray-500 flex-1">Interview Lead Time</span>
                      <span className="text-xs font-semibold text-gray-900">
                        {stageTime && stageTime.length > 0
                          ? `${stageTime.find(s => s.stage === 'screening')?.avg_days ?? '8.1'} days`
                          : '8.1 days'}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="w-2 h-2 rounded-full bg-blue-500 flex-shrink-0" />
                      <span className="text-xs text-gray-500 flex-1">Avg Process Time</span>
                      <span className="text-xs font-semibold text-gray-900">14 days</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Stage time chart */}
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
