'use client'

export interface DatePreset {
  label: string
  days: number
}

export const DEFAULT_DATE_PRESETS: readonly DatePreset[] = [
  { label: 'Last 30 days', days: 30 },
  { label: 'Last 45 days', days: 45 },
  { label: 'Last 90 days', days: 90 },
] as const

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

interface DateFilterPillsProps {
  presets?: readonly DatePreset[]
  selectedIndex: number
  onSelect: (index: number) => void
}

export function DateFilterPills({
  presets = DEFAULT_DATE_PRESETS,
  selectedIndex,
  onSelect,
}: DateFilterPillsProps) {
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
