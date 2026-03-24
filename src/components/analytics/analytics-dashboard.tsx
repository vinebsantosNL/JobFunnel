'use client'

import { useState, useMemo } from 'react'
import { MetricCard } from '@/components/analytics/metric-card'
import { FunnelChart } from '@/components/analytics/funnel-chart'
import { TimelineChart } from '@/components/analytics/timeline-chart'
import { StageTimeChart } from '@/components/analytics/stage-time-chart'
import { CVTestingPanel } from '@/components/analytics/CVTestingPanel'
import {
  DateFilterPills,
  DEFAULT_DATE_PRESETS,
  getDateRange,
} from '@/components/analytics/date-filter-pills'
import { Skeleton } from '@/components/ui/skeleton'
import { useFunnelData, useTimelineData, useStageTimeData } from '@/hooks/use-analytics'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import Link from 'next/link'

type Tab = 'funnel' | 'timeline' | 'cv-testing'

export function AnalyticsDashboard() {
  const [activeTab, setActiveTab] = useState<Tab>('funnel')
  const [presetIndex, setPresetIndex] = useState(0)

  const preset = DEFAULT_DATE_PRESETS[presetIndex]
  // useMemo prevents new Date() from running on every render (which changes milliseconds
  // → different query key → infinite refetch loop stuck on Loading...)
  const dateRange = useMemo(() => getDateRange(preset.days), [preset.days])

  const { data: funnel, isLoading: funnelLoading } = useFunnelData(dateRange)
  const { data: timeline, isLoading: timelineLoading } = useTimelineData()
  const { data: stageTime, isLoading: stageTimeLoading } = useStageTimeData(dateRange)

  // Total Applied = all jobs that ever reached the Applied stage (funnel cumulative count)
  const totalApplied = funnel?.funnel_counts.applied ?? 0

  // Active = currently in Screening, Interviewing, or Offer (current stage distribution)
  const activeApps = funnel
    ? (funnel.stage_counts.screening ?? 0) +
      (funnel.stage_counts.interviewing ?? 0) +
      (funnel.stage_counts.offer ?? 0)
    : 0

  // Offers = currently in Offer or Hired (received an offer)
  const offers = funnel
    ? (funnel.stage_counts.offer ?? 0) + (funnel.stage_counts.hired ?? 0)
    : 0
  const conversion = funnel?.overall_conversion ?? 0

  return (
    <div className="p-6">
      <div className="space-y-6">
        {/* Tab navigation */}
        <div className="flex gap-1 border-b border-border">
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
                  ? 'border-primary text-primary'
                  : 'border-transparent text-muted-foreground hover:text-foreground hover:border-border'
              }`}
            >
              {label}
              {dot && (
                <span className="w-1.5 h-1.5 rounded-full bg-primary inline-block" />
              )}
            </button>
          ))}
        </div>

        {(activeTab === 'funnel' || activeTab === 'timeline') && (
          <DateFilterPills
            selectedIndex={presetIndex}
            onSelect={setPresetIndex}
          />
        )}

        {activeTab === 'funnel' && (
          <>
            {/* Metric cards — Total Applied → Active → Offers → Conversion */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              <MetricCard
                title="Total Applied"
                value={funnelLoading ? '—' : String(totalApplied)}
                subtitle="Applications submitted"
                accentColor="border-l-blue-500"
              />
              <MetricCard
                title="Active"
                value={funnelLoading ? '—' : String(activeApps)}
                subtitle="Screening · Interview · Offer"
                accentColor="border-l-blue-400"
              />
              <MetricCard
                title="Offers"
                value={funnelLoading ? '—' : String(offers)}
                subtitle="Received"
                accentColor="border-l-amber-500"
              />
              <MetricCard
                title="Conversion"
                value={funnelLoading ? '—' : `${conversion}%`}
                subtitle="Applied → Offer"
                accentColor="border-l-green-500"
              />
            </div>

            {/* Funnel + Stage Efficiency side-by-side */}
            <div className="flex flex-col lg:flex-row gap-4">
              {/* Funnel chart */}
              <Card className="flex-1">
                <CardHeader>
                  <CardTitle className="text-base">Application Funnel</CardTitle>
                </CardHeader>
                <CardContent>
                  {funnelLoading ? (
                    <div className="space-y-3 py-2">
                      {[100, 75, 50, 30].map((w, i) => (
                        <div key={i} className="flex items-center gap-3">
                          <Skeleton className="w-36 h-4" />
                          <Skeleton
                            className="flex-1 h-7 rounded-full"
                            style={{ maxWidth: `${w}%` }}
                          />
                        </div>
                      ))}
                    </div>
                  ) : funnel ? (
                    <FunnelChart data={funnel} />
                  ) : (
                    <div className="h-64 flex flex-col items-center justify-center gap-2 text-center px-4">
                      <p className="text-sm font-medium text-foreground">
                        No funnel data yet
                      </p>
                      <p className="text-xs text-muted-foreground">
                        Start tracking applications to see your conversion funnel.
                      </p>
                      <Link
                        href="/pipeline"
                        className="text-xs text-primary font-medium hover:opacity-80 transition-opacity mt-1"
                      >
                        Add your first application →
                      </Link>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Stage Efficiency — anchored to funnel, desktop only */}
              <div className="w-60 flex-shrink-0 hidden lg:flex flex-col">
                <Card className="flex-1">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-semibold">
                      Stage Efficiency
                    </CardTitle>
                    <p className="text-xs text-muted-foreground">
                      Average days spent per stage
                    </p>
                  </CardHeader>
                  <CardContent className="space-y-0 pt-0">
                    {[
                      {
                        label: 'Applied → Screened',
                        stage: 'applied' as const,
                        color: 'bg-blue-500',
                      },
                      {
                        label: 'Screening → Interview',
                        stage: 'screening' as const,
                        color: 'bg-purple-500',
                      },
                      {
                        label: 'Interview → Offer',
                        stage: 'interviewing' as const,
                        color: 'bg-amber-500',
                      },
                    ].map(({ label, stage, color }) => {
                      const days = stageTime?.find(s => s.stage === stage)?.avg_days
                      return (
                        <div
                          key={stage}
                          className="flex items-center gap-2 py-2.5 border-b border-border/50 last:border-0"
                        >
                          <span
                            className={`w-2 h-2 rounded-full flex-shrink-0 ${color}`}
                          />
                          <span className="text-xs text-muted-foreground flex-1 leading-tight">
                            {label}
                          </span>
                          <span className="text-xs font-semibold text-foreground tabular-nums">
                            {days != null ? `${days}d` : '—'}
                          </span>
                        </div>
                      )
                    })}

                    {/* Avg total process time */}
                    {stageTime && stageTime.length > 0 &&
                      (() => {
                        const total = stageTime
                          .filter(s =>
                            ['applied', 'screening', 'interviewing'].includes(s.stage)
                          )
                          .reduce((sum, s) => sum + s.avg_days, 0)
                        return (
                          <div className="mt-3 pt-3 border-t border-border flex items-center gap-2">
                            <span className="w-2 h-2 rounded-full flex-shrink-0 bg-muted-foreground/40" />
                            <span className="text-xs text-muted-foreground flex-1">
                              Avg total process
                            </span>
                            <span className="text-xs font-semibold text-foreground">
                              {Math.round(total)}d
                            </span>
                          </div>
                        )
                      })()}

                    <Link
                      href="/pipeline"
                      className="block mt-4 text-center text-xs text-primary hover:opacity-80 font-medium transition-opacity"
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
                  <div className="h-56 flex items-end gap-3 px-4 pb-6">
                    {[60, 40, 80, 50, 70].map((h, i) => (
                      <Skeleton
                        key={i}
                        className="flex-1 rounded-t rounded-b-none"
                        style={{ height: `${h}%` }}
                      />
                    ))}
                  </div>
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
                <div className="h-56 flex items-end gap-2 px-4 pb-4">
                  {[30, 50, 40, 70, 55, 80, 60, 75, 45, 90, 65, 50].map((h, i) => (
                    <Skeleton
                      key={i}
                      className="flex-1 rounded-t rounded-b-none"
                      style={{ height: `${h}%` }}
                    />
                  ))}
                </div>
              ) : timeline && timeline.length > 0 ? (
                <TimelineChart data={timeline} />
              ) : (
                <div className="h-56 flex flex-col items-center justify-center gap-2 text-center px-4">
                  <p className="text-sm font-medium text-foreground">
                    No timeline data yet
                  </p>
                  <p className="text-xs text-muted-foreground">
                    Applications will appear here as you add them over time.
                  </p>
                  <Link
                    href="/pipeline"
                    className="text-xs text-primary font-medium hover:opacity-80 transition-opacity mt-1"
                  >
                    Go to Pipeline →
                  </Link>
                </div>
              )}
            </CardContent>
          </Card>
        )}

        {activeTab === 'cv-testing' && <CVTestingPanel />}
      </div>
    </div>
  )
}
