'use client'

import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import type { Stage } from '@/types/database.types'
import type { CreateJobInput } from '@/lib/validations/job'

const quickAddSchema = z.object({
  company_name: z.string().min(1, 'Required').max(100),
  job_title:    z.string().min(1, 'Required').max(100),
})
type QuickAddData = z.infer<typeof quickAddSchema>

interface QuickAddFormProps {
  stage: Stage
  onAdd: (input: CreateJobInput) => Promise<void>
}

export function QuickAddForm({ stage, onAdd }: QuickAddFormProps) {
  const [open, setOpen] = useState(false)

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<QuickAddData>({
    resolver: zodResolver(quickAddSchema),
  })

  async function onSubmit(data: QuickAddData) {
    await onAdd({ company_name: data.company_name, job_title: data.job_title, stage, priority: 'medium' })
    reset()
    setOpen(false)
  }

  function handleCancel() {
    reset()
    setOpen(false)
  }

  if (!open) {
    return (
      <Button
        variant="ghost"
        size="sm"
        className="w-full text-muted-foreground hover:text-foreground border-2 border-dashed border-border hover:border-border"
        onClick={() => setOpen(true)}
      >
        + Add job
      </Button>
    )
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-2 bg-card rounded-lg p-3 border border-border shadow-sm">
      <div>
        <Input
          placeholder="Company name"
          autoFocus
          className="text-sm h-8"
          aria-invalid={!!errors.company_name}
          {...register('company_name')}
        />
        {errors.company_name && (
          <p className="text-xs text-[var(--jf-error)] mt-0.5">{errors.company_name.message}</p>
        )}
      </div>
      <div>
        <Input
          placeholder="Job title"
          className="text-sm h-8"
          aria-invalid={!!errors.job_title}
          {...register('job_title')}
        />
        {errors.job_title && (
          <p className="text-xs text-[var(--jf-error)] mt-0.5">{errors.job_title.message}</p>
        )}
      </div>
      <div className="flex gap-2">
        <Button type="submit" size="sm" className="flex-1 h-8 text-xs gap-1" disabled={isSubmitting}>
          {isSubmitting ? <><Loader2 className="w-3 h-3 animate-spin" />Adding…</> : 'Add'}
        </Button>
        <Button type="button" variant="ghost" size="sm" className="h-8 text-xs" onClick={handleCancel}>
          Cancel
        </Button>
      </div>
    </form>
  )
}
