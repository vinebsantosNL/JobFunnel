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
import { STAGE_HEX } from '@/lib/stages'
import Link from 'next/link'

type Tab = 'funnel' | 'timeline' | 'cv-testing'

export function AnalyticsDashboard() {
  const [activeTab, setActiveTab] = useState<Tab>('funnel')
  const [presetIndex, setPresetIndex] = useState(0)

  const preset = DEFAULT_DATE_PRESETS[presetIndex]
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
        <div className="flex gap-1 border-b border-[--jf-border]">
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
              className="px-4 py-2 text-sm font-medium border-b-2 transition-colors -mb-px flex items-center gap-1.5"
              style={
                activeTab === key
                  ? {
                      background: 'var(--jf-interactive-subtle)',
                      color: 'var(--jf-interactive)',
                      borderColor: 'var(--jf-interactive)',
                    }
                  : {
                      borderColor: 'transparent',
                      color: 'var(--jf-text-secondary)',
                    }
              }
            >
              {label}
              {dot && (
                <span
                  className="w-1.5 h-1.5 rounded-full inline-block"
                  style={{ background: 'var(--jf-interactive)' }}
                />
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
                label="Total Applied"
                value={funnelLoading ? '—' : String(totalApplied)}
                icon={
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/>
                  </svg>
                }
                accentColor="#2563EB"
              />
              <MetricCard
                label="Screening Rate"
                value={funnelLoading ? '—' : `${funnel?.applied_to_screening ?? 0}%`}
                icon={
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
                  </svg>
                }
                accentColor="#8B5CF6"
              />
              <MetricCard
                label="Interview Rate"
                value={funnelLoading ? '—' : `${funnel?.screening_to_interview ?? 0}%`}
                icon={
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/>
                  </svg>
                }
                accentColor="#F59E0B"
              />
              <MetricCard
                label="Offer Rate"
                value={funnelLoading ? '—' : `${conversion}%`}
                icon={
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <polyline points="20 6 9 17 4 12"/>
                  </svg>
                }
                accentColor="#10B981"
              />
            </div>

            {/* Funnel + Stage Efficiency side-by-side */}
            <div className="flex flex-col lg:flex-row gap-4">
              {/* Funnel chart */}
              <div className="flex-1 rounded-2xl border border-[--jf-border] bg-[--jf-bg-card] shadow-[--jf-shadow-sm] p-5">
                <h3 className="text-base font-semibold text-[--jf-text-primary] mb-4">
                  Application Funnel
                </h3>
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
                    <p className="text-sm font-medium text-[--jf-text-primary]">
                      No funnel data yet
                    </p>
                    <p className="text-xs text-[--jf-text-muted]">
                      Start tracking applications to see your conversion funnel.
                    </p>
                    <Link
                      href="/pipeline"
                      className="text-xs font-medium hover:opacity-80 transition-opacity mt-1"
                      style={{ color: 'var(--jf-interactive)' }}
                    >
                      Add your first application →
                    </Link>
                  </div>
                )}
              </div>

              {/* Stage Efficiency — anchored to funnel, desktop only */}
              <div className="w-60 flex-shrink-0 hidden lg:flex flex-col">
                <div className="flex-1 rounded-2xl border border-[--jf-border] bg-[--jf-bg-card] shadow-[--jf-shadow-sm] p-5">
                  <h3 className="text-base font-semibold text-[--jf-text-primary] mb-1">
                    Stage Efficiency
                  </h3>
                  <p className="text-xs text-[--jf-text-muted] mb-3">
                    Average days spent per stage
                  </p>
                  <div className="space-y-0">
                    {(
                      [
                        {
                          label: 'Applied → Screened',
                          stage: 'applied' as const,
                        },
                        {
                          label: 'Screening → Interview',
                          stage: 'screening' as const,
                        },
                        {
                          label: 'Interview → Offer',
                          stage: 'interviewing' as const,
                        },
                      ] as const
                    ).map(({ label, stage }) => {
                      const days = stageTime?.find(s => s.stage === stage)?.avg_days
                      return (
                        <div
                          key={stage}
                          className="flex items-center gap-2 py-2.5 border-b border-[--jf-border] last:border-0"
                          style={{ borderColor: 'var(--jf-border)' }}
                        >
                          <span
                            className="w-2 h-2 rounded-full flex-shrink-0"
                            style={{ background: STAGE_HEX[stage] }}
                          />
                          <span className="text-xs text-[--jf-text-secondary] flex-1 leading-tight">
                            {label}
                          </span>
                          <span className="text-xs font-semibold text-[--jf-text-primary] tabular-nums">
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
                          <div className="mt-3 pt-3 border-t border-[--jf-border] flex items-center gap-2">
                            <span className="w-2 h-2 rounded-full flex-shrink-0 bg-muted-foreground/40" />
                            <span className="text-xs text-[--jf-text-muted] flex-1">
                              Avg total process
                            </span>
                            <span className="text-xs font-semibold text-[--jf-text-primary]">
                              {Math.round(total)}d
                            </span>
                          </div>
                        )
                      })()}

                    <Link
                      href="/pipeline"
                      className="block mt-4 text-center text-xs font-medium hover:opacity-80 transition-opacity"
                      style={{ color: 'var(--jf-interactive)' }}
                    >
                      View Pipeline →
                    </Link>
                  </div>
                </div>
              </div>
            </div>

            {/* Average Days per Stage */}
            <div className="rounded-2xl border border-[--jf-border] bg-[--jf-bg-card] shadow-[--jf-shadow-sm] p-5">
              <h3 className="text-base font-semibold text-[--jf-text-primary] mb-4">
                Average Days per Stage
              </h3>
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
            </div>
          </>
        )}

        {activeTab === 'timeline' && (
          <div className="rounded-2xl border border-[--jf-border] bg-[--jf-bg-card] shadow-[--jf-shadow-sm] p-5">
            <h3 className="text-base font-semibold text-[--jf-text-primary] mb-4">
              Applications Over Time
            </h3>
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
                <p className="text-sm font-medium text-[--jf-text-primary]">
                  No timeline data yet
                </p>
                <p className="text-xs text-[--jf-text-muted]">
                  Applications will appear here as you add them over time.
                </p>
                <Link
                  href="/pipeline"
                  className="text-xs font-medium hover:opacity-80 transition-opacity mt-1"
                  style={{ color: 'var(--jf-interactive)' }}
                >
                  Go to Pipeline →
                </Link>
              </div>
            )}
          </div>
        )}

        {activeTab === 'cv-testing' && <CVTestingPanel />}
      </div>
    </div>
  )
}
