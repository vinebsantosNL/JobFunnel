'use client'

import { useState, useMemo } from 'react'
import { FunnelChart } from '@/components/analytics/funnel-chart'
import { RightAnalyticsPanel } from '@/components/analytics/right-analytics-panel'
import { CVTestingPanel } from '@/components/analytics/CVTestingPanel'
import {
  DateFilterPills,
  getDaysFromFilter,
  getDateRange,
} from '@/components/analytics/date-filter-pills'
import type { DateFilterValue } from '@/components/analytics/date-filter-pills'
import { Skeleton } from '@/components/ui/skeleton'
import { useFunnelData, useTimelineData, useStageTimeData } from '@/hooks/use-analytics'
import Link from 'next/link'

const FILTER_LABELS: Record<DateFilterValue, string> = {
  '7d': 'Last 7 days',
  '30d': 'Last 30 days',
  '60d': 'Last 60 days',
  custom: 'Custom range',
}

export function AnalyticsDashboard() {
  const [dateFilter, setDateFilter] = useState<DateFilterValue>('60d')
  const [customFrom, setCustomFrom] = useState('')
  const [customTo, setCustomTo] = useState('')

  const dateRange = useMemo(() => {
    if (dateFilter === 'custom' && customFrom && customTo) {
      return {
        from: new Date(customFrom).toISOString(),
        to: new Date(customTo + 'T23:59:59').toISOString(),
      }
    }
    return getDateRange(getDaysFromFilter(dateFilter))
  }, [dateFilter, customFrom, customTo])

  const { data: funnel, isLoading: funnelLoading } = useFunnelData(dateRange)
  const { data: timeline, isLoading: timelineLoading } = useTimelineData(dateRange)
  const { data: stageTime, isLoading: stageTimeLoading } = useStageTimeData(dateRange)

  const totalApplied = funnel?.funnel_counts.applied ?? 0

  const dateLabel =
    dateFilter === 'custom' && customFrom && customTo
      ? `${customFrom} – ${customTo}`
      : FILTER_LABELS[dateFilter].toLowerCase()

  return (
    <div className="p-6">
      <div className="space-y-5">
        {/* Date filter bar */}
        <DateFilterPills
          value={dateFilter}
          onChange={setDateFilter}
          customFrom={customFrom}
          customTo={customTo}
          onCustomFromChange={setCustomFrom}
          onCustomToChange={setCustomTo}
        />

        {/* Two-column grid: Funnel (left) + Timeline+StageTime (right) */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
          {/* Left: Application Funnel */}
          <div className="rounded-2xl border border-[--jf-border] bg-[--jf-bg-card] shadow-[--jf-shadow-sm] p-5">
            {funnelLoading ? (
              <div className="space-y-3 py-2">
                <Skeleton className="h-5 w-40 mb-1" />
                <Skeleton className="h-3 w-48 mb-4" />
                {[100, 75, 50, 30].map((w, i) => (
                  <div key={i} className="flex items-center gap-3 py-3">
                    <Skeleton className="w-20 h-4" />
                    <Skeleton
                      className="flex-1 h-10 rounded-lg"
                      style={{ maxWidth: `${w}%` }}
                    />
                    <Skeleton className="w-12 h-8" />
                  </div>
                ))}
              </div>
            ) : funnel ? (
              <FunnelChart
                data={funnel}
                dateLabel={FILTER_LABELS[dateFilter]}
                totalApplications={totalApplied}
              />
            ) : (
              <div className="h-64 flex flex-col items-center justify-center gap-2 text-center px-4">
                <p
                  className="text-sm font-medium"
                  style={{ color: 'var(--jf-text-primary)' }}
                >
                  Add 5+ applications to unlock your conversion rates
                </p>
                <p
                  className="text-xs"
                  style={{ color: 'var(--jf-text-muted)' }}
                >
                  Most users see meaningful patterns after 10 applications.
                </p>
                <Link
                  href="/pipeline"
                  className="text-xs font-medium hover:opacity-80 transition-opacity mt-1"
                  style={{ color: 'var(--jf-interactive)' }}
                >
                  Go to pipeline &rarr;
                </Link>
              </div>
            )}
          </div>

          {/* Right: Applications Over Time + Avg days per stage */}
          <div className="rounded-2xl border border-[--jf-border] bg-[--jf-bg-card] shadow-[--jf-shadow-sm] p-5">
            {timelineLoading || stageTimeLoading ? (
              <div className="space-y-4">
                <Skeleton className="h-5 w-44 mb-1" />
                <Skeleton className="h-3 w-36 mb-3" />
                <Skeleton className="h-[200px] w-full rounded-lg" />
                <div
                  className="my-4"
                  style={{ borderTop: '1px solid var(--jf-border)' }}
                />
                <Skeleton className="h-4 w-32 mb-3" />
                {[1, 2, 3].map((i) => (
                  <div key={i} className="flex items-center gap-3 py-2">
                    <Skeleton className="w-2 h-2 rounded-full" />
                    <Skeleton className="w-24 h-3" />
                    <Skeleton className="w-14 h-3" />
                    <Skeleton className="flex-1 h-1.5 rounded-full" />
                  </div>
                ))}
              </div>
            ) : (
              <RightAnalyticsPanel
                weeklyData={timeline ?? []}
                stageTimeData={stageTime ?? []}
                dateLabel={dateLabel}
              />
            )}
          </div>
        </div>

        {/* Full-width: Resume Performance */}
        <CVTestingPanel />
      </div>
    </div>
  )
}
