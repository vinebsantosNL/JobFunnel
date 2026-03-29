'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { Briefcase, Activity, Users, BookOpen } from 'lucide-react'
import type { LucideIcon } from 'lucide-react'
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip'
import { useDashboardStats } from '@/hooks/use-dashboard-stats'

function useCountUp(target: number, loading: boolean): number {
  const [count, setCount] = useState(0)

  useEffect(() => {
    if (loading) return
    if (target === 0) { setCount(0); return }

    const duration = 600
    const start = performance.now()

    function tick(now: number) {
      const elapsed = now - start
      const progress = Math.min(elapsed / duration, 1)
      const eased = 1 - Math.pow(1 - progress, 3)
      setCount(Math.round(eased * target))
      if (progress < 1) requestAnimationFrame(tick)
    }

    requestAnimationFrame(tick)
  }, [target, loading])

  return count
}

function StatTileLoading() {
  return (
    <div
      className="rounded-2xl p-[18px_20px] flex flex-col gap-3"
      style={{
        background: 'var(--jf-bg-card)',
        border: '1px solid var(--jf-border)',
        boxShadow: 'var(--jf-shadow-sm)',
      }}
    >
      <div className="flex justify-between items-start">
        <div>
          <div className="h-7 w-10 rounded animate-pulse" style={{ background: 'var(--jf-border)' }} />
          <div className="h-3 w-[60px] rounded animate-pulse mt-1" style={{ background: 'var(--jf-border)' }} />
        </div>
        <div className="w-9 h-9 rounded-[10px] animate-pulse" style={{ background: 'var(--jf-border)' }} />
      </div>
    </div>
  )
}

function StatTile({
  label,
  value,
  loading,
  icon: Icon,
  tintBg,
  iconColor,
  href,
  tooltip,
}: {
  label: string
  value: number
  loading: boolean
  icon: LucideIcon
  tintBg: string
  iconColor: string
  href: string
  tooltip?: React.ReactNode
}) {
  const displayValue = useCountUp(value, loading)

  if (loading) return <StatTileLoading />

  const inner = (
    <Link
      href={href}
      className="rounded-2xl flex flex-col gap-3 cursor-pointer transition-shadow duration-150"
      style={{
        background: 'var(--jf-bg-card)',
        border: '1px solid var(--jf-border)',
        boxShadow: 'var(--jf-shadow-sm)',
        padding: '18px 20px',
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.boxShadow = 'var(--jf-shadow-md)'
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.boxShadow = 'var(--jf-shadow-sm)'
      }}
    >
      <div className="flex justify-between items-start">
        {/* Value block */}
        <div>
          <p
            className="leading-none"
            style={{
              fontFamily: 'var(--font-dm-mono, monospace)',
              fontSize: 28,
              fontWeight: 500,
              color: 'var(--jf-text-primary)',
            }}
            aria-live="polite"
            aria-atomic="true"
          >
            {displayValue}
          </p>
          <p
            className="uppercase mt-1"
            style={{
              fontSize: 12,
              fontWeight: 500,
              color: 'var(--jf-text-muted)',
              letterSpacing: '0.04em',
            }}
          >
            {label}
          </p>
        </div>

        {/* Icon container */}
        <div
          className="flex items-center justify-center flex-shrink-0"
          style={{
            width: 36,
            height: 36,
            borderRadius: 10,
            background: tintBg,
          }}
        >
          <Icon size={18} style={{ color: iconColor }} />
        </div>
      </div>
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
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3.5">
        <StatTile
          label="TOTAL APPS"
          value={data?.totalApplications ?? 0}
          loading={isLoading}
          icon={Briefcase}
          tintBg="var(--jf-interactive-tint)"
          iconColor="var(--jf-interactive)"
          href="/pipeline"
        />
        <StatTile
          label="ACTIVE PIPELINE"
          value={data?.activeApplications ?? 0}
          loading={isLoading}
          icon={Activity}
          tintBg="var(--jf-success-tint)"
          iconColor="var(--jf-success)"
          href="/pipeline"
          tooltip={breakdownTooltip}
        />
        <StatTile
          label="INTERVIEWS"
          value={data?.interviews ?? 0}
          loading={isLoading}
          icon={Users}
          tintBg="var(--jf-warning-tint)"
          iconColor="var(--jf-warning)"
          href="/pipeline"
        />
        <StatTile
          label="STAR STORIES"
          value={data?.storiesCreated ?? 0}
          loading={isLoading}
          icon={BookOpen}
          tintBg="var(--jf-purple-tint)"
          iconColor="var(--jf-purple)"
          href="/stories"
        />
      </div>
    </TooltipProvider>
  )
}
