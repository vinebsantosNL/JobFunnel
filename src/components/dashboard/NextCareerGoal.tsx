'use client'

import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { Briefcase, Crosshair } from 'lucide-react'
import { CareerGoalModal } from './CareerGoalModal'
import type { Profile } from '@/types/database.types'

interface NextCareerGoalProps {
  initialProfile: {
    full_name?: string | null
    target_role?: string | null
    target_date?: string | null
    target_salary_min?: number | null
    target_salary_max?: number | null
    target_salary_currency?: string | null
    location_country?: string | null
  }
}

function formatSalary(
  min: number | null | undefined,
  max: number | null | undefined,
  currency: string | null | undefined
): string | null {
  if (min === null || min === undefined) return null
  const sym = currency === 'EUR' ? '\u20AC' : currency ?? '\u20AC'
  const fmtK = (n: number) => `${sym}${(n / 1000).toFixed(0)}k`
  if (!max) return `${fmtK(min)}+`
  return `${fmtK(min)}\u2013${fmtK(max)}`
}

function formatDate(dateStr: string | null | undefined): string | null {
  if (!dateStr) return null
  const d = new Date(dateStr)
  return d.toLocaleDateString('en-GB', { month: 'short', year: 'numeric' })
}

function Chip({ children }: { children: React.ReactNode }) {
  return (
    <span
      className="inline-flex items-center gap-[5px]"
      style={{
        padding: '4px 10px',
        borderRadius: 100,
        border: '1px solid var(--jf-border)',
        background: 'var(--jf-bg-subtle)',
        fontSize: 12,
        fontWeight: 500,
        color: 'var(--jf-text-secondary)',
      }}
    >
      {children}
    </span>
  )
}

export function NextCareerGoal({ initialProfile }: NextCareerGoalProps) {
  const [modalOpen, setModalOpen] = useState(false)

  const { data: profile } = useQuery({
    queryKey: ['career-goal'],
    queryFn: async (): Promise<Partial<Profile>> => {
      const res = await fetch('/api/profile')
      if (!res.ok) throw new Error('Failed to fetch')
      return res.json()
    },
    initialData: initialProfile,
    staleTime: 60_000,
  })

  const hasGoal = profile?.target_role != null && profile.target_role.trim() !== ''

  // Progress calculation
  let weeksToTarget = 0
  let pct = 0
  let weeksLabel = ''
  if (profile?.target_date) {
    weeksToTarget = Math.max(0, Math.round((new Date(profile.target_date).getTime() - Date.now()) / (1000 * 60 * 60 * 24 * 7)))
    pct = Math.min(100, Math.max(0, Math.round((1 - weeksToTarget / 26) * 100)))
    weeksLabel = weeksToTarget <= 0 ? 'Goal date passed' : `${weeksToTarget} weeks to target`
  }

  const salaryStr = formatSalary(profile?.target_salary_min, profile?.target_salary_max, profile?.target_salary_currency)
  const dateStr = formatDate(profile?.target_date)

  return (
    <>
      <div
        className="rounded-2xl"
        style={{
          background: 'var(--jf-bg-card)',
          border: '1px solid var(--jf-border)',
          borderRadius: 16,
          padding: '18px 20px',
          boxShadow: 'var(--jf-shadow-sm)',
        }}
      >
        {/* Header */}
        <div className="flex items-center justify-between">
          <h3 style={{ fontSize: 14, fontWeight: 600, color: 'var(--jf-text-primary)' }}>
            Next Career Goal
          </h3>
          <button
            type="button"
            onClick={() => setModalOpen(true)}
            className="flex-shrink-0 min-h-[44px] min-w-[44px] flex items-center justify-center transition-colors"
            style={{
              fontSize: 13,
              color: 'var(--jf-text-muted)',
              background: 'none',
              border: 'none',
              cursor: 'pointer',
            }}
            onMouseEnter={(e) => { e.currentTarget.style.color = 'var(--jf-text-primary)' }}
            onMouseLeave={(e) => { e.currentTarget.style.color = 'var(--jf-text-muted)' }}
          >
            Edit goal
          </button>
        </div>

        {hasGoal ? (
          <>
            {/* Chips */}
            <div className="flex flex-wrap gap-2 mt-3">
              <Chip>
                <Briefcase size={12} />
                {profile?.target_role ?? '\u2014'}
              </Chip>
              {profile?.location_country && (
                <Chip>{profile.location_country}</Chip>
              )}
              {salaryStr && (
                <Chip>
                  <span style={{ fontFamily: 'var(--font-dm-mono, monospace)' }}>{salaryStr}</span>
                </Chip>
              )}
              {dateStr && (
                <Chip>{dateStr}</Chip>
              )}
            </div>

            {/* Progress bar */}
            {profile?.target_date && (
              <div className="mt-4">
                <div className="flex justify-between">
                  <span style={{ fontSize: 12, color: 'var(--jf-text-muted)' }}>Progress to goal</span>
                  <span style={{ fontFamily: 'var(--font-dm-mono, monospace)', fontSize: 12, color: 'var(--jf-text-muted)' }}>
                    {pct}%
                  </span>
                </div>
                <div
                  className="mt-2 overflow-hidden"
                  style={{ height: 6, background: 'var(--jf-border)', borderRadius: 100 }}
                >
                  <div
                    style={{
                      height: '100%',
                      width: `${pct}%`,
                      background: 'var(--jf-success)',
                      borderRadius: 100,
                      transition: 'width 500ms ease',
                    }}
                  />
                </div>
                <p
                  className="mt-1.5"
                  style={{
                    fontFamily: 'var(--font-dm-mono, monospace)',
                    fontSize: 11,
                    color: 'var(--jf-text-muted)',
                  }}
                >
                  {weeksLabel}
                </p>
              </div>
            )}
          </>
        ) : (
          /* No goal set */
          <div className="flex items-center gap-3 mt-3">
            <Crosshair size={20} style={{ color: 'var(--jf-text-muted)' }} />
            <span style={{ fontSize: 13, color: 'var(--jf-text-muted)' }}>No career goal set yet</span>
            <button
              type="button"
              onClick={() => setModalOpen(true)}
              className="transition-colors"
              style={{
                fontSize: 13,
                fontWeight: 600,
                color: 'var(--jf-interactive)',
                background: 'none',
                border: 'none',
                cursor: 'pointer',
                padding: '4px 8px',
              }}
            >
              + Set Goal
            </button>
          </div>
        )}
      </div>

      <CareerGoalModal
        open={modalOpen}
        onOpenChange={setModalOpen}
        initialValues={{
          target_role: profile?.target_role,
          target_date: profile?.target_date,
          target_salary_min: profile?.target_salary_min,
          target_salary_max: profile?.target_salary_max,
        }}
      />
    </>
  )
}
