'use client'

import { useForm, Controller } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { Loader2, Check } from 'lucide-react'
import { useState } from 'react'
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'

const TECH_ROLES = [
  { group: 'Engineering', roles: [
    'Software Engineer', 'Senior Software Engineer', 'Staff Engineer',
    'Principal Engineer', 'Engineering Manager', 'VP of Engineering', 'CTO',
    'Frontend Engineer', 'Backend Engineer', 'Full Stack Engineer',
    'Mobile Engineer (iOS/Android)', 'DevOps / Platform Engineer',
    'Data Engineer', 'ML Engineer', 'Security Engineer',
    'Site Reliability Engineer (SRE)', 'QA / Automation Engineer',
    'Solutions Architect', 'Technical Lead',
  ]},
  { group: 'Product', roles: [
    'Product Manager', 'Senior Product Manager', 'Principal Product Manager',
    'Group Product Manager', 'Director of Product', 'VP of Product', 'CPO',
    'Product Owner', 'Technical Product Manager',
  ]},
  { group: 'Data & AI', roles: [
    'Data Scientist', 'Senior Data Scientist', 'Data Analyst',
    'Analytics Engineer', 'ML Researcher', 'AI Engineer',
    'Business Intelligence Analyst',
  ]},
  { group: 'Design', roles: [
    'Product Designer', 'UX Designer', 'UI Designer',
    'Design Lead', 'Head of Design',
  ]},
  { group: 'Other', roles: [
    'Technical Program Manager', 'Scrum Master / Agile Coach',
    'Developer Advocate', 'Engineering Consultant',
  ]},
]

const SALARY_RANGES = [
  { label: 'Up to €50,000',         min: 0,      max: 50000  },
  { label: '€50,000 – €75,000',     min: 50000,  max: 75000  },
  { label: '€75,000 – €100,000',    min: 75000,  max: 100000 },
  { label: '€100,000 – €125,000',   min: 100000, max: 125000 },
  { label: '€125,000 – €150,000',   min: 125000, max: 150000 },
  { label: '€150,000 – €200,000',   min: 150000, max: 200000 },
  { label: '€200,000+',             min: 200000, max: null   },
]

function salaryKey(min: number | null | undefined, max: number | null | undefined): string {
  return `${min ?? ''}-${max ?? ''}`
}

// Form schema uses string keys for selects; transformation happens at submit
const careerGoalSchema = z.object({
  target_role:   z.string().optional(),
  target_date:   z.string().optional(),
  salary_key:    z.string().optional(),
})
type CareerGoalFormData = z.infer<typeof careerGoalSchema>

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

export function CareerGoalModal({ open, onOpenChange, initialValues }: CareerGoalModalProps) {
  const queryClient = useQueryClient()
  const [justSaved, setJustSaved] = useState(false)

  const {
    handleSubmit,
    control,
    formState: { isSubmitting },
  } = useForm<CareerGoalFormData>({
    resolver: zodResolver(careerGoalSchema),
    defaultValues: {
      target_role: initialValues?.target_role ?? '',
      target_date: initialValues?.target_date?.slice(0, 7) ?? '',
      salary_key: salaryKey(initialValues?.target_salary_min, initialValues?.target_salary_max),
    },
  })

  const mutation = useMutation({
    mutationFn: async (data: CareerGoalFormData) => {
      const selectedRange = SALARY_RANGES.find(
        (r) => salaryKey(r.min, r.max) === data.salary_key
      ) ?? null

      const payload = {
        target_role: data.target_role || null,
        target_date: data.target_date ? `${data.target_date}-01` : null,
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
      setJustSaved(true)
      setTimeout(() => { setJustSaved(false); onOpenChange(false) }, 1000)
    },
    onError: (err: Error) => toast.error(err.message),
  })

  const isPending = isSubmitting || mutation.isPending

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent size="md">
        <DialogHeader>
          <DialogTitle>Edit Career Goal</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit((data) => mutation.mutate(data))} className="space-y-5 pt-2">
          {/* Target Role */}
          <div className="space-y-1.5">
            <Label>Target Role</Label>
            <Controller
              name="target_role"
              control={control}
              render={({ field }) => (
                <Select value={field.value || undefined} onValueChange={field.onChange}>
                  <SelectTrigger className="w-full h-9">
                    <SelectValue placeholder="Select a role…" />
                  </SelectTrigger>
                  <SelectContent>
                    {TECH_ROLES.map(({ group, roles }) => (
                      <SelectGroup key={group}>
                        <SelectLabel>{group}</SelectLabel>
                        {roles.map((r) => (
                          <SelectItem key={r} value={r}>{r}</SelectItem>
                        ))}
                      </SelectGroup>
                    ))}
                  </SelectContent>
                </Select>
              )}
            />
          </div>

          {/* Target Date */}
          <div className="space-y-1.5">
            <Label htmlFor="target-date">Target Date</Label>
            <Controller
              name="target_date"
              control={control}
              render={({ field }) => (
                <input
                  id="target-date"
                  type="month"
                  value={field.value ?? ''}
                  onChange={field.onChange}
                  min={new Date().toISOString().slice(0, 7)}
                  className="flex h-9 w-full rounded-lg border border-input bg-transparent px-3 text-sm outline-none focus-visible:border-ring focus-visible:ring-2 focus-visible:ring-ring/30"
                />
              )}
            />
            <p className="text-xs text-gray-500">The month you aim to have an offer</p>
          </div>

          {/* Target Salary */}
          <div className="space-y-1.5">
            <Label>Target Salary Range</Label>
            <Controller
              name="salary_key"
              control={control}
              render={({ field }) => (
                <Select value={field.value} onValueChange={field.onChange}>
                  <SelectTrigger className="w-full h-9">
                    <SelectValue placeholder="Select a range…" />
                  </SelectTrigger>
                  <SelectContent>
                    {SALARY_RANGES.map((r) => (
                      <SelectItem key={salaryKey(r.min, r.max)} value={salaryKey(r.min, r.max)}>
                        {r.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            />
          </div>

          {/* Actions */}
          <DialogFooter>
            <Button type="button" variant="ghost" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={isPending} className="gap-1.5">
              {isPending ? (
                <><Loader2 className="w-3.5 h-3.5 animate-spin" />Saving…</>
              ) : justSaved ? (
                <><Check className="w-3.5 h-3.5" />Saved!</>
              ) : 'Save Goal'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
