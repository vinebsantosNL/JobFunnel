'use client'

import { useState } from 'react'

export type DateFilterValue = '7d' | '60d' | 'custom'

const PILL_OPTIONS: { value: DateFilterValue; label: string; days: number }[] = [
  { value: '7d', label: '7d', days: 7 },
  { value: '60d', label: '60d', days: 60 },
]

export function getDateRange(days: number): { from: string; to: string } {
  const to = new Date()
  const from = new Date()
  from.setDate(from.getDate() - days)
  return { from: from.toISOString(), to: to.toISOString() }
}

export function getDaysFromFilter(value: DateFilterValue): number {
  const option = PILL_OPTIONS.find((o) => o.value === value)
  return option?.days ?? 60
}

interface DateFilterPillsProps {
  value: DateFilterValue
  onChange: (v: DateFilterValue) => void
  customFrom?: string
  customTo?: string
  onCustomFromChange?: (v: string) => void
  onCustomToChange?: (v: string) => void
}

export function DateFilterPills({
  value,
  onChange,
  customFrom,
  customTo,
  onCustomFromChange,
  onCustomToChange,
}: DateFilterPillsProps) {
  return (
    <div className="flex flex-col gap-2">
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

      {/* Custom date range picker — shown inline when Custom is active */}
      {value === 'custom' && (
        <div
          className="flex items-center gap-3 ml-auto flex-wrap"
          style={{ marginTop: 2 }}
        >
          <span
            className="text-[11px] font-medium font-mono"
            style={{ color: 'var(--jf-text-muted)' }}
          >
            From
          </span>
          <input
            type="date"
            value={customFrom ?? ''}
            max={customTo || undefined}
            onChange={(e) => onCustomFromChange?.(e.target.value)}
            className="rounded-lg px-2 py-1 text-xs font-mono border outline-none"
            style={{
              borderColor: 'var(--jf-border)',
              color: 'var(--jf-text-primary)',
              background: 'var(--jf-bg-card)',
              minHeight: 32,
            }}
          />
          <span
            className="text-[11px] font-medium font-mono"
            style={{ color: 'var(--jf-text-muted)' }}
          >
            To
          </span>
          <input
            type="date"
            value={customTo ?? ''}
            min={customFrom || undefined}
            max={new Date().toISOString().split('T')[0]}
            onChange={(e) => onCustomToChange?.(e.target.value)}
            className="rounded-lg px-2 py-1 text-xs font-mono border outline-none"
            style={{
              borderColor: 'var(--jf-border)',
              color: 'var(--jf-text-primary)',
              background: 'var(--jf-bg-card)',
              minHeight: 32,
            }}
          />
        </div>
      )}
    </div>
  )
}
