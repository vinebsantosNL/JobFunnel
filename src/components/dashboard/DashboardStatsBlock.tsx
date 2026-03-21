'use client'

import Link from 'next/link'
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip'
import { useDashboardStats } from '@/hooks/use-dashboard-stats'

function StatTile({
  label,
  value,
  loading,
  borderColor,
  descriptor,
  descriptorClass,
  href,
  tooltip,
}: {
  label: string
  value: number
  loading: boolean
  borderColor: string
  descriptor: string
  descriptorClass: string
  href: string
  tooltip?: React.ReactNode
}) {
  const inner = (
    <Link
      href={href}
      className={`bg-white rounded-xl border border-gray-200 border-l-4 ${borderColor} p-5 hover:shadow-sm transition-all group block`}
    >
      {loading ? (
        <div className="space-y-2">
          <div className="h-8 w-16 bg-gray-100 rounded animate-pulse" />
          <div className="h-4 w-24 bg-gray-100 rounded animate-pulse" />
        </div>
      ) : (
        <>
          <p className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-1">
            {label}
          </p>
          <p className="text-3xl font-bold text-gray-900 group-hover:text-blue-600 transition-colors">
            {value}
          </p>
          <p className={`text-xs mt-1 ${descriptorClass}`}>{descriptor}</p>
        </>
      )}
    </Link>
  )

  if (tooltip) {
    return (
      <Tooltip>
        <TooltipTrigger render={<div />}>{inner}</TooltipTrigger>
        <TooltipContent side="bottom" className="text-xs">{tooltip}</TooltipContent>
      </Tooltip>
    )
  }

  return inner
}

export function DashboardStatsBlock() {
  const { data, isLoading } = useDashboardStats()

  const breakdown = data?.activeBreakdown
  const breakdownTooltip = breakdown ? (
    <span>
      {breakdown.screening} Screening · {breakdown.interviewing} Interviewing · {breakdown.offer} Offer
    </span>
  ) : undefined

  return (
    <TooltipProvider delay={200}>
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <StatTile
          label="TOTAL APPLICATIONS"
          value={data?.totalApplications ?? 0}
          loading={isLoading}
          borderColor="border-blue-500"
          descriptor="Last 30 days"
          descriptorClass="text-gray-400"
          href="/pipeline"
        />
        <StatTile
          label="ACTIVE PIPELINE"
          value={data?.activeApplications ?? 0}
          loading={isLoading}
          borderColor="border-blue-400"
          descriptor="Screening · Interviewing · Offer"
          descriptorClass="text-gray-400"
          href="/pipeline"
          tooltip={breakdownTooltip}
        />
        <StatTile
          label="INTERVIEWS"
          value={data?.interviews ?? 0}
          loading={isLoading}
          borderColor="border-purple-500"
          descriptor="Active now"
          descriptorClass="text-gray-400"
          href="/pipeline"
        />
        <StatTile
          label="STAR STORIES"
          value={data?.storiesCreated ?? 0}
          loading={isLoading}
          borderColor="border-amber-500"
          descriptor="All time"
          descriptorClass="text-gray-400"
          href="/stories"
        />
      </div>
    </TooltipProvider>
  )
}
