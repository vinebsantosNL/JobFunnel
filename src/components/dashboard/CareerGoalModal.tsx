'use client'

import { useState } from 'react'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'

const TECH_ROLES = [
  // Engineering
  { group: 'Engineering', roles: [
    'Software Engineer', 'Senior Software Engineer', 'Staff Engineer',
    'Principal Engineer', 'Engineering Manager', 'VP of Engineering', 'CTO',
    'Frontend Engineer', 'Backend Engineer', 'Full Stack Engineer',
    'Mobile Engineer (iOS/Android)', 'DevOps / Platform Engineer',
    'Data Engineer', 'ML Engineer', 'Security Engineer',
    'Site Reliability Engineer (SRE)', 'QA / Automation Engineer',
    'Solutions Architect', 'Technical Lead',
  ]},
  // Product
  { group: 'Product', roles: [
    'Product Manager', 'Senior Product Manager', 'Principal Product Manager',
    'Group Product Manager', 'Director of Product', 'VP of Product', 'CPO',
    'Product Owner', 'Technical Product Manager',
  ]},
  // Data & AI
  { group: 'Data & AI', roles: [
    'Data Scientist', 'Senior Data Scientist', 'Data Analyst',
    'Analytics Engineer', 'ML Researcher', 'AI Engineer',
    'Business Intelligence Analyst',
  ]},
  // Design
  { group: 'Design', roles: [
    'Product Designer', 'UX Designer', 'UI Designer',
    'Design Lead', 'Head of Design',
  ]},
  // Other
  { group: 'Other', roles: [
    'Technical Program Manager', 'Scrum Master / Agile Coach',
    'Developer Advocate', 'Engineering Consultant',
  ]},
]

const SALARY_RANGES = [
  { label: 'Up to €50,000', min: 0, max: 50000 },
  { label: '€50,000 – €75,000', min: 50000, max: 75000 },
  { label: '€75,000 – €100,000', min: 75000, max: 100000 },
  { label: '€100,000 – €125,000', min: 100000, max: 125000 },
  { label: '€125,000 – €150,000', min: 125000, max: 150000 },
  { label: '€150,000 – €200,000', min: 150000, max: 200000 },
  { label: '€200,000+', min: 200000, max: null },
]

interface CareerGoalModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  initialValues?: {
    target_role?: string | null
    target_date?: string | null
    target_salary_min?: number | null
    target_salary_max?: number | null
  }
}

function salaryRangeKey(min: number | null, max: number | null | undefined): string {
  return `${min ?? ''}-${max ?? ''}`
}

export function CareerGoalModal({ open, onOpenChange, initialValues }: CareerGoalModalProps) {
  const queryClient = useQueryClient()

  const [role, setRole] = useState(initialValues?.target_role ?? '')
  const [date, setDate] = useState(initialValues?.target_date?.slice(0, 7) ?? '') // YYYY-MM
  const [salaryKey, setSalaryKey] = useState(
    salaryRangeKey(initialValues?.target_salary_min ?? null, initialValues?.target_salary_max)
  )

  const selectedRange = SALARY_RANGES.find(
    (r) => salaryRangeKey(r.min, r.max) === salaryKey
  ) ?? null

  const mutation = useMutation({
    mutationFn: async () => {
      const payload = {
        target_role: role || null,
        target_date: date ? `${date}-01` : null, // store as first of month
        target_salary_min: selectedRange?.min ?? null,
        target_salary_max: selectedRange?.max ?? null,
        target_salary_currency: 'EUR',
      }
      const res = await fetch('/api/profile', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })
      if (!res.ok) {
        const err = await res.json() as { error?: string }
        throw new Error(err.error ?? 'Failed to save')
      }
      return res.json()
    },
    onSuccess: () => {
      toast.success('Career goal saved')
      queryClient.invalidateQueries({ queryKey: ['profile'] })
      queryClient.invalidateQueries({ queryKey: ['career-goal'] })
      onOpenChange(false)
    },
    onError: (err: Error) => toast.error(err.message),
  })

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Edit Career Goal</DialogTitle>
        </DialogHeader>

        <div className="space-y-5 pt-2">
          {/* Target Role */}
          <div className="space-y-1.5">
            <Label htmlFor="target-role">Target Role</Label>
            <select
              id="target-role"
              value={role}
              onChange={(e) => setRole(e.target.value)}
              className="flex h-9 w-full rounded-lg border border-input bg-transparent px-3 text-sm outline-none focus-visible:border-ring focus-visible:ring-2 focus-visible:ring-ring/30"
            >
              <option value="">Select a role…</option>
              {TECH_ROLES.map(({ group, roles }) => (
                <optgroup key={group} label={group}>
                  {roles.map((r) => (
                    <option key={r} value={r}>{r}</option>
                  ))}
                </optgroup>
              ))}
            </select>
          </div>

          {/* Target Date */}
          <div className="space-y-1.5">
            <Label htmlFor="target-date">Target Date</Label>
            <input
              id="target-date"
              type="month"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              min={new Date().toISOString().slice(0, 7)}
              className="flex h-9 w-full rounded-lg border border-input bg-transparent px-3 text-sm outline-none focus-visible:border-ring focus-visible:ring-2 focus-visible:ring-ring/30"
            />
            <p className="text-xs text-gray-400">The month you aim to have an offer</p>
          </div>

          {/* Target Salary */}
          <div className="space-y-1.5">
            <Label htmlFor="target-salary">Target Salary Range</Label>
            <select
              id="target-salary"
              value={salaryKey}
              onChange={(e) => setSalaryKey(e.target.value)}
              className="flex h-9 w-full rounded-lg border border-input bg-transparent px-3 text-sm outline-none focus-visible:border-ring focus-visible:ring-2 focus-visible:ring-ring/30"
            >
              <option value="-">Select a range…</option>
              {SALARY_RANGES.map((r) => (
                <option key={salaryRangeKey(r.min, r.max)} value={salaryRangeKey(r.min, r.max)}>
                  {r.label}
                </option>
              ))}
            </select>
          </div>

          {/* Actions */}
          <div className="flex justify-end gap-2 pt-2">
            <Button variant="ghost" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button onClick={() => mutation.mutate()} disabled={mutation.isPending}>
              {mutation.isPending ? 'Saving…' : 'Save Goal'}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
