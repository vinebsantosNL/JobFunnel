'use client'

import { useState } from 'react'
import { Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import type { Stage } from '@/types/database.types'
import type { CreateJobInput } from '@/lib/validations/job'

interface QuickAddFormProps {
  stage: Stage
  onAdd: (input: CreateJobInput) => Promise<void>
}

export function QuickAddForm({ stage, onAdd }: QuickAddFormProps) {
  const [open, setOpen] = useState(false)
  const [company, setCompany] = useState('')
  const [title, setTitle] = useState('')
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!company.trim() || !title.trim()) return
    setLoading(true)
    try {
      await onAdd({ company_name: company.trim(), job_title: title.trim(), stage, priority: 'medium' })
      setCompany('')
      setTitle('')
      setOpen(false)
    } finally {
      setLoading(false)
    }
  }

  if (!open) {
    return (
      <Button
        variant="ghost"
        size="sm"
        className="w-full text-gray-400 hover:text-gray-600 border-2 border-dashed border-gray-200 hover:border-gray-300"
        onClick={() => setOpen(true)}
      >
        + Add job
      </Button>
    )
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-2 bg-white rounded-lg p-3 border border-gray-200 shadow-sm">
      <Input
        placeholder="Company name"
        value={company}
        onChange={(e) => setCompany(e.target.value)}
        autoFocus
        required
        className="text-sm h-8"
      />
      <Input
        placeholder="Job title"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        required
        className="text-sm h-8"
      />
      <div className="flex gap-2">
        <Button type="submit" size="sm" className="flex-1 h-7 text-xs gap-1" disabled={loading}>
          {loading ? <><Loader2 className="w-3 h-3 animate-spin" />Adding…</> : 'Add'}
        </Button>
        <Button
          type="button"
          variant="ghost"
          size="sm"
          className="h-7 text-xs"
          onClick={() => { setOpen(false); setCompany(''); setTitle('') }}
        >
          Cancel
        </Button>
      </div>
    </form>
  )
}
