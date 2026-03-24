import React from 'react'

interface MetricCardProps {
  title: string
  value?: string
  subtitle?: string
  /** Tailwind left-border color class, e.g. 'border-l-blue-500' */
  accentColor?: string
  children?: React.ReactNode
}

export function MetricCard({
  title,
  value,
  subtitle,
  accentColor = 'border-l-blue-500',
  children,
}: MetricCardProps) {
  return (
    <div className={`bg-card rounded-xl border border-border border-l-4 ${accentColor} p-5`}>
      <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-1">{title}</p>
      {children ?? (
        <>
          {value !== undefined && (
            <p className="text-2xl font-bold text-foreground">{value}</p>
          )}
          {subtitle && <p className="text-xs text-muted-foreground mt-1">{subtitle}</p>}
        </>
      )}
    </div>
  )
}
