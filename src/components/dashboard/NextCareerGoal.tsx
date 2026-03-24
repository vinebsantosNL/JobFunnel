'use client'

import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
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
  }
}

function formatDate(dateStr: string | null | undefined): string {
  if (!dateStr) return '—'
  const d = new Date(dateStr)
  return d.toLocaleDateString('en-GB', { month: 'long', year: 'numeric' })
}

function formatSalary(
  min: number | null | undefined,
  max: number | null | undefined,
  currency: string | null | undefined
): string {
  if (min === null || min === undefined) return '—'
  const sym = currency === 'EUR' ? '€' : currency ?? '€'
  const fmtK = (n: number) => `${sym}${(n / 1000).toFixed(0)}k`
  if (!max) return `${fmtK(min)}+`
  return `${fmtK(min)} – ${fmtK(max)}`
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

  const firstName = profile?.full_name?.split(' ')[0] ?? null
  const greeting = firstName ? `Hi, ${firstName}` : 'Welcome back'

  return (
    <>
      <div className="bg-card rounded-xl border border-border p-5">
        <div className="flex items-start justify-between gap-4">
          <div>
            <h3 className="text-2xl font-bold text-foreground">{greeting}</h3>
            <p className="text-sm text-muted-foreground mt-1">
              You&apos;re making great progress towards your next career milestone.
            </p>
          </div>
          {/* min-h-[44px] + px-3 ensures 44×44px touch target on mobile */}
          <button
            onClick={() => setModalOpen(true)}
            className="flex-shrink-0 min-h-[44px] px-3 rounded-lg text-sm text-primary hover:text-primary/90 font-medium transition-colors"
          >
            Edit Goals
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-5 pt-5 border-t border-border">
          <div>
            <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-1">Target Title</p>
            <p className="text-sm font-semibold text-primary">
              {profile?.target_role ?? '—'}
            </p>
          </div>
          <div>
            <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-1">Target Date</p>
            <p className="text-sm font-semibold text-foreground">
              {formatDate(profile?.target_date)}
            </p>
          </div>
          <div>
            <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-1">Target Salary</p>
            <p className="text-sm font-semibold text-foreground">
              {formatSalary(profile?.target_salary_min, profile?.target_salary_max, profile?.target_salary_currency)}
            </p>
          </div>
        </div>
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
