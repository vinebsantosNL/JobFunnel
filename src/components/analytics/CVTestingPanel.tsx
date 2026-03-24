'use client'

import { useMemo, useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import Link from 'next/link'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { MetricCard } from '@/components/analytics/metric-card'
import { CVComparisonChart } from '@/components/analytics/CVComparisonChart'
import { CVComparisonTable } from '@/components/analytics/CVComparisonTable'
import {
  DateFilterPills,
  DEFAULT_DATE_PRESETS,
  getDateRange,
} from '@/components/analytics/date-filter-pills'
import type { CVComparisonRow } from '@/lib/services/analyticsService'
import type { CVVersion } from '@/types/database.types'

const EU_AVG_SCREENING_LABEL = '2–4%'
const LOW_SAMPLE_THRESHOLD = 10

async function fetchCVComparison(params: {
  from?: string
  to?: string
}): Promise<CVComparisonRow[]> {
  const url = new URL('/api/analytics/cv-comparison', window.location.origin)
  if (params.from) url.searchParams.set('from', params.from)
  if (params.to) url.searchParams.set('to', params.to)
  const res = await fetch(url.toString())
  if (!res.ok) throw new Error('Failed to fetch CV comparison data')
  return res.json()
}

async function fetchAllCVVersions(): Promise<CVVersion[]> {
  const url = new URL('/api/cv-versions', window.location.origin)
  url.searchParams.set('include_archived', 'true')
  const res = await fetch(url.toString())
  if (!res.ok) throw new Error('Failed to fetch CV versions')
  return res.json()
}

function SummaryCards({ rows }: { rows: CVComparisonRow[] }) {
  // Only tagged (non-untagged) versions that actually reached screening
  const tagged = rows.filter((r) => r.version_id !== null)
  const withScreening = tagged.filter((r) => (r.reached_screening ?? 0) > 0)
  const untagged = rows.find((r) => r.version_id === null)
  const untaggedCount = untagged?.total_applied ?? 0

  // Best performer — only among versions that reached screening
  const best = withScreening.reduce<CVComparisonRow | null>((acc, r) => {
    if ((r.screening_rate ?? 0) > (acc?.screening_rate ?? 0)) return r
    return acc
  }, null)

  // Total tracked (tagged only)
  const totalTracked = tagged.reduce((acc, r) => acc + r.total_applied, 0)
  const versionCount = tagged.length

  // Overall screening rate across all tagged
  const totalReachedScreening = tagged.reduce((acc, r) => acc + r.reached_screening, 0)
  const overallScreening =
    totalTracked > 0 ? Math.round((totalReachedScreening / totalTracked) * 100) : 0

  // Advantage of best vs average
  const avgScreeningRate = totalTracked > 0 ? (totalReachedScreening / totalTracked) * 100 : 0
  const bestAdvantage = best ? ((best.screening_rate ?? 0) - avgScreeningRate).toFixed(1) : '0.0'
  const bestIsLowSample = best ? best.total_applied < LOW_SAMPLE_THRESHOLD : false

  return (
    <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
      {/* Best Performing Version */}
      <MetricCard title="Best Performing Version" accentColor="border-l-blue-500">
        {best ? (
          <>
            <p className="text-xl font-bold text-foreground leading-tight">{best.version_name}</p>
            <div className="mt-1.5 flex items-center gap-1.5 flex-wrap">
              <span className="inline-flex items-center bg-green-50 text-green-700 border border-green-200 text-xs px-2 py-0.5 rounded-full dark:bg-green-950 dark:text-green-400 dark:border-green-800">
                +{bestAdvantage}% vs Avg
              </span>
              {bestIsLowSample && (
                <span className="inline-flex items-center gap-0.5 text-amber-600 text-xs">
                  ⚠ Low sample
                </span>
              )}
            </div>
            <p className="text-xs text-muted-foreground mt-1">{best.screening_rate ?? 0}% screening rate</p>
          </>
        ) : (
          <p className="text-sm text-muted-foreground">No data yet</p>
        )}
      </MetricCard>

      {/* Screening Rate All Versions */}
      <MetricCard
        title="Screening Rate (All Versions)"
        value={`${overallScreening}%`}
        subtitle={totalTracked > 0 ? `${overallScreening}% vs. EU avg. ${EU_AVG_SCREENING_LABEL}` : undefined}
        accentColor="border-l-green-500"
      />

      {/* Untagged Applications */}
      <MetricCard title="Untagged Applications" accentColor="border-l-amber-500">
        <p className={`text-2xl font-bold ${untaggedCount > 0 ? 'text-amber-500' : 'text-foreground'}`}>
          {untaggedCount}
        </p>
        {untaggedCount > 0 && (
          <Link
            href="/pipeline"
            className="text-xs text-muted-foreground hover:text-primary underline underline-offset-2 mt-1 inline-block transition-colors"
          >
            Tag them →
          </Link>
        )}
      </MetricCard>
    </div>
  )
}

export function CVTestingPanel() {
  const [presetIndex, setPresetIndex] = useState(0)

  const preset = DEFAULT_DATE_PRESETS[presetIndex]
  const dateRange = useMemo(() => getDateRange(preset.days), [preset.days])

  const { data: cvVersions, isLoading: versionsLoading } = useQuery({
    queryKey: ['cv-versions-all'],
    queryFn: fetchAllCVVersions,
  })

  const { data: comparisonRows, isLoading: comparisonLoading } = useQuery({
    queryKey: ['cv-comparison', dateRange],
    queryFn: () => fetchCVComparison(dateRange),
  })

  const isLoading = versionsLoading || comparisonLoading

  // Build archived lookup for table
  const cvVersionDefaults: Record<string, boolean> = {}
  const cvVersionArchived: Record<string, boolean> = {}
  for (const v of cvVersions ?? []) {
    cvVersionDefaults[v.id] = v.is_default
    cvVersionArchived[v.id] = v.is_archived
  }

  const hasNoVersions = !versionsLoading && (cvVersions ?? []).length === 0
  const hasNoData = !comparisonLoading && (comparisonRows ?? []).length === 0

  return (
    <div className="space-y-6">
      {/* Time filter */}
      <DateFilterPills selectedIndex={presetIndex} onSelect={setPresetIndex} />

      {/* Summary cards */}
      {!isLoading && !hasNoData && (
        <SummaryCards rows={comparisonRows ?? []} />
      )}

      {/* Empty: no CV versions at all */}
      {hasNoVersions ? (
        <div className="flex flex-col items-center justify-center py-16 text-center space-y-3">
          <p className="text-muted-foreground text-sm">
            Create your first CV version to start tracking performance
          </p>
          <Link
            href="/cv-versions"
            className="text-sm font-medium text-primary hover:opacity-80 underline underline-offset-2 transition-opacity"
          >
            Go to CV Versions
          </Link>
        </div>
      ) : isLoading ? (
        <div className="space-y-4">
          <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
            {[1, 2, 3].map((n) => (
              <div
                key={n}
                className="bg-card rounded-xl border border-border border-l-4 border-l-border p-5"
              >
                <Skeleton className="h-3 w-2/3 mb-3" />
                <Skeleton className="h-7 w-1/2 mb-2" />
                <Skeleton className="h-2.5 w-3/4" />
              </div>
            ))}
          </div>
          <Skeleton className="h-56 w-full rounded-xl" />
        </div>
      ) : hasNoData ? (
        <div className="flex flex-col items-center justify-center py-16 text-center space-y-3">
          <p className="text-muted-foreground text-sm">
            No applications found for the selected date range.
          </p>
          <p className="text-muted-foreground text-xs">
            Tag your applications with a CV version to start comparing performance.
          </p>
        </div>
      ) : (
        <>
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Applied → Screening Rate by CV Version</CardTitle>
            </CardHeader>
            <CardContent>
              <CVComparisonChart rows={comparisonRows ?? []} />
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-base">CV Performance Comparison</CardTitle>
            </CardHeader>
            <CardContent>
              <CVComparisonTable
                rows={comparisonRows ?? []}
                cvVersionDefaults={cvVersionDefaults}
                cvVersionArchived={cvVersionArchived}
              />
            </CardContent>
          </Card>
        </>
      )}
    </div>
  )
}
