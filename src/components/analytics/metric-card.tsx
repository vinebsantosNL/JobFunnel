import React from 'react'

interface MetricCardProps {
  /** Display value (number or formatted string) */
  value: number | string
  /** Label shown below value */
  label: string
  /** Icon element rendered in the tinted container */
  icon: React.ReactNode
  /** Hex color string used for icon container tint and icon color */
  accentColor: string
  /** Optional delta string, e.g. "+12%" or "-5%" */
  delta?: string
  children?: React.ReactNode
}

export function MetricCard({
  value,
  label,
  icon,
  accentColor,
  delta,
  children,
}: MetricCardProps) {
  const isPositiveDelta = delta && delta.startsWith('+')
  const isNegativeDelta = delta && delta.startsWith('-')

  return (
    <div className="rounded-2xl bg-[--jf-bg-card] border border-[--jf-border] shadow-[--jf-shadow-sm] p-5">
      {children ?? (
        <>
          {/* Icon container */}
          <div
            className="w-10 h-10 rounded-xl flex items-center justify-center mb-3"
            style={{
              background: `${accentColor}1F`,
              color: accentColor,
            }}
          >
            {icon}
          </div>

          {/* Value */}
          <p className="text-3xl font-bold text-[--jf-text-primary]" style={{ fontFamily: 'var(--font-dm-mono, ui-monospace, monospace)' }}>
            {value}
          </p>

          {/* Label */}
          <p className="text-sm text-[--jf-text-secondary] mt-1">{label}</p>

          {/* Delta */}
          {delta && (
            <p
              className="text-xs mt-1"
              style={{
                fontFamily: 'var(--font-dm-mono, ui-monospace, monospace)',
                color: isPositiveDelta
                  ? 'var(--jf-success)'
                  : isNegativeDelta
                    ? 'var(--jf-error)'
                    : 'var(--jf-text-muted)',
              }}
            >
              {delta}
            </p>
          )}
        </>
      )}
    </div>
  )
}
