'use client'

export type DateFilterValue = '7d' | '30d' | '60d' | '90d' | 'custom'

export interface DatePreset {
  label: string
  days: number
}

export const DEFAULT_DATE_PRESETS: readonly DatePreset[] = [
  { label: 'Last 30 days', days: 30 },
  { label: 'Last 45 days', days: 45 },
  { label: 'Last 90 days', days: 90 },
] as const

const PILL_OPTIONS: { value: DateFilterValue; label: string; days: number }[] = [
  { value: '7d', label: '7d', days: 7 },
  { value: '30d', label: '30d', days: 30 },
  { value: '60d', label: '60d', days: 60 },
  { value: '90d', label: '90d', days: 90 },
]

export function formatDateRangeLabel(days: number): string {
  const to = new Date()
  const from = new Date()
  from.setDate(from.getDate() - days)
  const fmt = (d: Date) =>
    d.toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })
  return `${fmt(from)} – ${fmt(to)}`
}

export function getDateRange(days: number): { from: string; to: string } {
  const to = new Date()
  const from = new Date()
  from.setDate(from.getDate() - days)
  return { from: from.toISOString(), to: to.toISOString() }
}

export function getDaysFromFilter(value: DateFilterValue): number {
  const option = PILL_OPTIONS.find((o) => o.value === value)
  return option?.days ?? 30
}

interface DateFilterPillsProps {
  value: DateFilterValue
  onChange: (v: DateFilterValue) => void
}

// Keep legacy interface for backward compat (CVTestingPanel uses it)
interface LegacyDateFilterPillsProps {
  presets?: readonly DatePreset[]
  selectedIndex: number
  onSelect: (index: number) => void
}

export function DateFilterPills(props: DateFilterPillsProps | LegacyDateFilterPillsProps) {
  // Detect legacy usage
  if ('selectedIndex' in props) {
    return <LegacyDateFilterPillsImpl {...props} />
  }
  return <DateFilterPillsImpl {...props} />
}

function DateFilterPillsImpl({ value, onChange }: DateFilterPillsProps) {
  return (
    <div className="flex items-center justify-between flex-wrap gap-3">
      <span
        className="text-[13px] font-medium"
        style={{ color: 'var(--jf-text-secondary)' }}
      >
        Showing data for the last
      </span>
      <div className="flex items-center gap-1.5">
        {PILL_OPTIONS.map((option) => {
          const isActive = value === option.value
          return (
            <button
              key={option.value}
              onClick={() => onChange(option.value)}
              className="rounded-full px-3 py-1.5 text-xs font-medium font-mono transition-all"
              style={
                isActive
                  ? {
                      background: 'var(--jf-interactive)',
                      color: '#fff',
                      boxShadow: '0 1px 3px rgba(37,99,235,0.3)',
                    }
                  : {
                      background: 'var(--jf-bg-card)',
                      color: 'var(--jf-text-secondary)',
                      border: '1px solid var(--jf-border)',
                    }
              }
            >
              {option.label}
            </button>
          )
        })}
        <button
          onClick={() => onChange('custom')}
          className="rounded-full px-3 py-1.5 text-xs font-medium font-mono transition-all flex items-center gap-1.5"
          style={
            value === 'custom'
              ? {
                  background: 'var(--jf-interactive)',
                  color: '#fff',
                  boxShadow: '0 1px 3px rgba(37,99,235,0.3)',
                }
              : {
                  background: 'var(--jf-bg-card)',
                  color: 'var(--jf-text-secondary)',
                  border: '1px solid var(--jf-border)',
                }
          }
        >
          <svg
            viewBox="0 0 20 20"
            fill="currentColor"
            style={{ width: 12, height: 12 }}
          >
            <path
              fillRule="evenodd"
              d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z"
              clipRule="evenodd"
            />
          </svg>
          Custom
        </button>
      </div>
    </div>
  )
}

function LegacyDateFilterPillsImpl({
  presets = DEFAULT_DATE_PRESETS,
  selectedIndex,
  onSelect,
}: LegacyDateFilterPillsProps) {
  const selectedPreset = presets[selectedIndex]

  return (
    <div className="flex flex-col gap-1 w-fit">
      <div className="rounded-xl border border-[--jf-border] overflow-hidden flex">
        {presets.map((p, i) => (
          <button
            key={i}
            onClick={() => onSelect(i)}
            className="px-4 py-1.5 font-mono text-xs transition-colors"
            style={
              selectedIndex === i
                ? {
                    background: 'var(--jf-interactive-subtle)',
                    color: 'var(--jf-interactive)',
                    fontWeight: 600,
                  }
                : {
                    background: 'transparent',
                    color: 'var(--jf-text-secondary)',
                  }
            }
          >
            {p.label}
          </button>
        ))}
      </div>
      {selectedPreset && (
        <p className="font-mono text-xs text-[--jf-text-muted] pl-1">
          {formatDateRangeLabel(selectedPreset.days)}
        </p>
      )}
    </div>
  )
}
