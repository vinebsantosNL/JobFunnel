'use client'

import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { CareerGoalModal } from './CareerGoalModal'
import type { Profile } from '@/types/database'

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

  const { data: profile } = useQuery<Profile>({
    queryKey: ['career-goal'],
    queryFn: async () => {
      const res = await fetch('/api/profile')
      if (!res.ok) throw new Error('Failed to fetch')
      return res.json()
    },
    initialData: initialProfile as Profile,
    staleTime: 60_000,
  })

  const firstName = profile?.full_name?.split(' ')[0] ?? null
  const greeting = firstName ? `Hi, ${firstName}` : 'Welcome back'

  return (
    <>
      <div className="bg-white rounded-xl border border-gray-200 p-5">
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="text-xs text-gray-500 mb-1">Next Career Goal</p>
            <h3 className="text-lg font-semibold text-gray-900">{greeting} 👋</h3>
            <p className="text-sm text-gray-500 mt-1">
              Track your job search, prepare your stories, and land your next role.
            </p>
          </div>
          <button
            onClick={() => setModalOpen(true)}
            className="flex-shrink-0 text-sm text-blue-600 hover:text-blue-700 font-medium transition-colors"
          >
            Edit Goals
          </button>
        </div>

        <div className="grid grid-cols-3 gap-4 mt-5 pt-5 border-t border-gray-100">
          <div>
            <p className="text-xs text-gray-400 mb-1">Target Title</p>
            <p className="text-sm font-medium text-gray-900">
              {profile?.target_role ?? '—'}
            </p>
          </div>
          <div>
            <p className="text-xs text-gray-400 mb-1">Target Date</p>
            <p className="text-sm font-medium text-gray-900">
              {formatDate(profile?.target_date)}
            </p>
          </div>
          <div>
            <p className="text-xs text-gray-400 mb-1">Target Salary</p>
            <p className="text-sm font-medium text-gray-900">
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
