'use client'

import { useState, useEffect } from 'react'
import { useForm, Controller } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import {
  Dialog,
  DialogContent,
  DialogTitle,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { MapPin, DollarSign, ExternalLink, BookOpen, FileText, ArrowRight, Share2, Pencil, Trash2, X } from 'lucide-react'
import { AnimatePresence, motion } from 'framer-motion'
import type { JobApplication, Stage, Priority } from '@/types/database.types'
import { STAGE_CONFIG, STAGES, PRIORITY_CONFIG } from '@/lib/stages'
import { updateJobSchema, type UpdateJobInput } from '@/lib/validations/job'
import { CVVersionPicker } from '@/components/cv-versions/CVVersionPicker'
import { cn } from '@/lib/utils'
import Link from 'next/link'

interface ApplicationModalProps {
  job: JobApplication | null
  open: boolean
  onClose: () => void
  onUpdate: (id: string, input: UpdateJobInput) => void
  onDelete: (id: string) => void
}

type TabId = 'details' | 'notes' | 'stages'

function timeAgo(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime()
  const minutes = Math.floor(diff / 60000)
  if (minutes < 60) return `${minutes}m ago`
  const hours = Math.floor(minutes / 60)
  if (hours < 24) return `${hours}h ago`
  const days = Math.floor(hours / 24)
  return `${days}d ago`
}

const STAGE_NEXT: Partial<Record<Stage, Stage>> = {
  saved: 'applied',
  applied: 'screening',
  screening: 'interviewing',
  interviewing: 'offer',
  offer: 'hired',
}

const avatarColors = [
  'bg-blue-100 text-blue-700',
  'bg-purple-100 text-purple-700',
  'bg-amber-100 text-amber-700',
  'bg-green-100 text-green-700',
  'bg-rose-100 text-rose-700',
]

export function ApplicationModal({ job, open, onClose, onUpdate, onDelete }: ApplicationModalProps) {
  const [editing, setEditing] = useState(false)
  const [confirmDelete, setConfirmDelete] = useState(false)
  const [activeTab, setActiveTab] = useState<TabId>('details')

  const {
    register,
    handleSubmit,
    reset,
    control,
    formState: { errors },
  } = useForm<UpdateJobInput>({
    resolver: zodResolver(updateJobSchema),
  })

  useEffect(() => {
    if (job) {
      reset({
        company_name: job.company_name,
        job_title: job.job_title,
        job_url: job.job_url ?? '',
        location: job.location ?? '',
        notes: job.notes ?? '',
        priority: job.priority,
        salary_min: job.salary_min ?? undefined,
        salary_max: job.salary_max ?? undefined,
        salary_currency: job.salary_currency ?? undefined,
        applied_at: job.applied_at ?? undefined,
        cv_version_id: job.cv_version_id ?? undefined,
      })
    }
    setEditing(false)
    setConfirmDelete(false)
    setActiveTab('details')
  }, [job, reset])

  if (!job) return null

  const LOCKED_STAGES: Stage[] = ['screening', 'interviewing', 'offer', 'hired', 'rejected', 'withdrawn']
  const isCVVersionLocked = LOCKED_STAGES.includes(job.stage)

  const stageConfig = STAGE_CONFIG[job.stage]
  const nextStage = STAGE_NEXT[job.stage]

  function onEditSubmit(data: UpdateJobInput) {
    onUpdate(job!.id, data)
    setEditing(false)
  }

  function handleStageChange(stage: Stage) {
    onUpdate(job!.id, { stage })
    onClose()
  }

  const avatarColor = avatarColors[job.company_name.charCodeAt(0) % avatarColors.length]
  const companyInitial = job.company_name.charAt(0).toUpperCase()

  const salaryDisplay = (job.salary_min || job.salary_max)
    ? `${job.salary_currency ?? '€'}${job.salary_min?.toLocaleString() ?? '?'}${job.salary_max ? ` – ${job.salary_max.toLocaleString()}` : '+'}`
    : null

  const tabs: { id: TabId; label: string }[] = [
    { id: 'details', label: 'Details' },
    { id: 'notes', label: 'Notes' },
    { id: 'stages', label: 'Move Stage' },
  ]

  return (
    <Dialog open={open} onOpenChange={(isOpen) => { if (!isOpen) onClose() }}>
      <DialogContent
        size="2xl"
        showCloseButton={false}
        className="p-0 gap-0"
      >
        <DialogTitle className="sr-only">{job.job_title} at {job.company_name}</DialogTitle>

        {/* Header bar */}
        <div className="flex items-center justify-between px-5 py-3 border-b border-gray-100 bg-white">
          <div className="flex items-center gap-2 text-sm text-gray-500 min-w-0">
            <span className="text-gray-400">Applications</span>
            <span className="text-gray-300 mx-1">/</span>
            <span className="font-medium text-gray-700 truncate">{job.job_title}</span>
          </div>
          <div className="flex items-center gap-2 flex-shrink-0">
            <button
              type="button"
              className="flex items-center gap-1.5 text-xs text-gray-500 hover:text-gray-700 transition-colors px-2 py-2 rounded-lg hover:bg-gray-50 min-h-[36px]"
            >
              <Share2 className="w-3.5 h-3.5" />
              Share
            </button>
            {nextStage && (
              <button
                type="button"
                onClick={() => handleStageChange(nextStage)}
                className="flex items-center gap-1.5 text-xs font-medium text-white bg-blue-600 hover:bg-blue-700 transition-colors px-3 py-2 rounded-lg min-h-[36px]"
              >
                Move to {STAGE_CONFIG[nextStage].label}
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            )}
            <button
              type="button"
              onClick={onClose}
              className="w-9 h-9 flex items-center justify-center text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
              aria-label="Close"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Body */}
        <div className="overflow-y-auto max-h-[calc(90dvh-52px)] sm:max-h-[80vh] bg-white">
          <div className="px-6 pt-6 pb-4">
            {/* Company row + stage badge */}
            <div className="flex items-start justify-between gap-4 mb-4">
              <div className="flex items-center gap-3">
                <div className={cn('w-12 h-12 rounded-xl flex items-center justify-center text-lg font-bold flex-shrink-0', avatarColor)}>
                  {companyInitial}
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-600">{job.company_name}</p>
                  <p className="text-xs text-gray-400">Updated {timeAgo(job.updated_at)}</p>
                </div>
              </div>
              <AnimatePresence mode="wait">
                <motion.span
                  key={job.stage}
                  initial={{ opacity: 0, y: -4 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 4 }}
                  transition={{ duration: 0.15 }}
                  className={cn(
                    'px-3 py-1 rounded-full text-xs font-semibold border flex-shrink-0',
                    stageConfig.bgColor, stageConfig.color, stageConfig.borderColor
                  )}
                >
                  {stageConfig.label.toUpperCase()}
                </motion.span>
              </AnimatePresence>
            </div>

            {/* Job title */}
            <h2 className="text-2xl font-bold text-gray-900 mb-5">{job.job_title}</h2>

            {/* Metadata row */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
              <div>
                <p className="text-xs font-medium text-gray-400 uppercase tracking-wide mb-1.5">Location</p>
                <div className="flex items-center gap-1.5">
                  <MapPin className="w-3.5 h-3.5 text-gray-400 flex-shrink-0" />
                  <span className="text-sm text-gray-700">{job.location ?? '—'}</span>
                </div>
              </div>
              <div>
                <p className="text-xs font-medium text-gray-400 uppercase tracking-wide mb-1.5">Salary Range</p>
                <div className="flex items-center gap-1.5">
                  <DollarSign className="w-3.5 h-3.5 text-gray-400 flex-shrink-0" />
                  <span className="text-sm text-gray-700">{salaryDisplay ?? '—'}</span>
                </div>
              </div>
              <div>
                <p className="text-xs font-medium text-gray-400 uppercase tracking-wide mb-1.5">External Link</p>
                <div className="flex items-center gap-1.5">
                  <ExternalLink className="w-3.5 h-3.5 text-gray-400 flex-shrink-0" />
                  {job.job_url ? (
                    <a href={job.job_url} target="_blank" rel="noopener noreferrer"
                      className="text-sm text-blue-600 hover:underline truncate">
                      Job Posting
                    </a>
                  ) : (
                    <span className="text-sm text-gray-400">—</span>
                  )}
                </div>
              </div>
            </div>

            {/* Prep materials */}
            <div className="mb-2">
              <p className="text-xs font-medium text-gray-400 uppercase tracking-wide mb-3">Preparation Materials</p>
              <div className="grid grid-cols-2 gap-3">
                <Link href="/stories" onClick={onClose}
                  className="flex items-center gap-3 p-3 rounded-xl border border-gray-200 hover:border-blue-200 hover:bg-blue-50 transition-colors group">
                  <div className="w-8 h-8 rounded-lg bg-blue-100 flex items-center justify-center flex-shrink-0">
                    <BookOpen className="w-4 h-4 text-blue-600" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-800 group-hover:text-blue-700">STAR Stories</p>
                    <p className="text-xs text-gray-400">Interview answers</p>
                  </div>
                </Link>
                <Link href="/cv-versions" onClick={onClose}
                  className="flex items-center gap-3 p-3 rounded-xl border border-gray-200 hover:border-purple-200 hover:bg-purple-50 transition-colors group">
                  <div className="w-8 h-8 rounded-lg bg-purple-100 flex items-center justify-center flex-shrink-0">
                    <FileText className="w-4 h-4 text-purple-600" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-800 group-hover:text-purple-700">Resume Builder</p>
                    <p className="text-xs text-gray-400">CV versions</p>
                  </div>
                </Link>
              </div>
            </div>
          </div>

          {/* Inline tabs */}
          <div className="px-6 pb-6">
            {/* Tab bar */}
            <div className="flex gap-0 border-b border-gray-100 mb-4">
              {tabs.map(tab => (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => { setActiveTab(tab.id); setEditing(false) }}
                  className={cn(
                    'px-4 pb-2.5 text-sm font-medium border-b-2 transition-colors',
                    activeTab === tab.id
                      ? 'border-blue-600 text-blue-700'
                      : 'border-transparent text-gray-500 hover:text-gray-700'
                  )}
                >
                  {tab.label}
                </button>
              ))}
            </div>

            {/* Tab: Details */}
            {activeTab === 'details' && !editing && (
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-xs font-medium text-gray-400 uppercase tracking-wide mb-1">Priority</p>
                    <div className="flex items-center gap-2">
                      <div className={cn('w-2 h-2 rounded-full', PRIORITY_CONFIG[job.priority].color)} />
                      <span className="text-sm text-gray-700">{PRIORITY_CONFIG[job.priority].label}</span>
                    </div>
                  </div>
                  <div>
                    <p className="text-xs font-medium text-gray-400 uppercase tracking-wide mb-1">CV Version</p>
                    <span className="text-sm text-gray-700">{job.cv_versions?.name ?? 'Untagged'}</span>
                  </div>
                  {job.applied_at && (
                    <div>
                      <p className="text-xs font-medium text-gray-400 uppercase tracking-wide mb-1">Applied</p>
                      <span className="text-sm text-gray-700">
                        {new Date(job.applied_at).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}
                      </span>
                    </div>
                  )}
                </div>
                <div className="flex gap-2 pt-1">
                  <Button onClick={() => setEditing(true)} variant="outline" size="sm" className="gap-1.5">
                    <Pencil className="w-3.5 h-3.5" /> Edit
                  </Button>
                  <Button
                    onClick={() => {
                      if (!confirmDelete) { setConfirmDelete(true); return }
                      onDelete(job.id); onClose()
                    }}
                    variant={confirmDelete ? 'destructive' : 'outline'}
                    size="sm"
                    className={cn('gap-1.5', !confirmDelete && 'text-red-500 border-red-200 hover:bg-red-50')}
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    {confirmDelete ? 'Confirm Delete' : 'Delete'}
                  </Button>
                </div>
              </div>
            )}

            {/* Tab: Details — Edit mode */}
            {activeTab === 'details' && editing && (
              <form onSubmit={handleSubmit(onEditSubmit)} className="space-y-3">
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <Label htmlFor="edit-company" className="text-xs font-medium text-gray-500 uppercase tracking-wide">Company</Label>
                    <Input id="edit-company" className="mt-1" aria-invalid={!!errors.company_name} {...register('company_name')} />
                    {errors.company_name && <p className="text-xs text-red-500 mt-0.5">{errors.company_name.message}</p>}
                  </div>
                  <div>
                    <Label htmlFor="edit-title" className="text-xs font-medium text-gray-500 uppercase tracking-wide">Job Title</Label>
                    <Input id="edit-title" className="mt-1" aria-invalid={!!errors.job_title} {...register('job_title')} />
                    {errors.job_title && <p className="text-xs text-red-500 mt-0.5">{errors.job_title.message}</p>}
                  </div>
                </div>
                <div>
                  <Label htmlFor="edit-url" className="text-xs font-medium text-gray-500 uppercase tracking-wide">Job URL</Label>
                  <Input id="edit-url" placeholder="https://..." className="mt-1" {...register('job_url')} />
                </div>
                <div>
                  <Label htmlFor="edit-location" className="text-xs font-medium text-gray-500 uppercase tracking-wide">Location</Label>
                  <Input id="edit-location" className="mt-1" {...register('location')} />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <Label htmlFor="edit-smin" className="text-xs font-medium text-gray-500 uppercase tracking-wide">Salary Min</Label>
                    <Input id="edit-smin" type="number" className="mt-1" {...register('salary_min', { valueAsNumber: true })} />
                  </div>
                  <div>
                    <Label htmlFor="edit-smax" className="text-xs font-medium text-gray-500 uppercase tracking-wide">Salary Max</Label>
                    <Input id="edit-smax" type="number" className="mt-1" {...register('salary_max', { valueAsNumber: true })} />
                  </div>
                </div>
                <div>
                  <Label htmlFor="edit-priority" className="text-xs font-medium text-gray-500 uppercase tracking-wide">Priority</Label>
                  <Controller
                    name="priority"
                    control={control}
                    render={({ field }) => (
                      <Select value={field.value} onValueChange={(v) => field.onChange(v as Priority)}>
                        <SelectTrigger id="edit-priority" className="w-full mt-1">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="low">Low</SelectItem>
                          <SelectItem value="medium">Medium</SelectItem>
                          <SelectItem value="high">High</SelectItem>
                        </SelectContent>
                      </Select>
                    )}
                  />
                </div>
                <div>
                  <Label htmlFor="edit-notes" className="text-xs font-medium text-gray-500 uppercase tracking-wide">Notes</Label>
                  <Textarea id="edit-notes" rows={4} className="mt-1" {...register('notes')} />
                </div>
                <div>
                  <Label className="text-xs font-medium text-gray-500 uppercase tracking-wide">CV Version</Label>
                  <div className="mt-1">
                    <Controller
                      name="cv_version_id"
                      control={control}
                      render={({ field }) => (
                        <CVVersionPicker
                          value={field.value ?? null}
                          onChange={(id) => field.onChange(id)}
                          disabled={isCVVersionLocked}
                        />
                      )}
                    />
                  </div>
                </div>
                <div className="flex gap-2 pt-1">
                  <Button type="submit" size="sm" className="flex-1">Save Changes</Button>
                  <Button type="button" onClick={() => { reset(); setEditing(false) }} variant="outline" size="sm">Cancel</Button>
                </div>
              </form>
            )}

            {/* Tab: Notes */}
            {activeTab === 'notes' && (
              <div>
                {job.notes ? (
                  <p className="text-sm text-gray-700 whitespace-pre-wrap leading-relaxed">{job.notes}</p>
                ) : (
                  <p className="text-sm text-gray-400 italic">No notes yet. Go to Details → Edit to add notes.</p>
                )}
              </div>
            )}

            {/* Tab: Move Stage */}
            {activeTab === 'stages' && (
              <div className="grid grid-cols-2 gap-2">
                {STAGES.filter(s => s !== job.stage).map(stage => (
                  <button
                    key={stage}
                    type="button"
                    onClick={() => handleStageChange(stage)}
                    className="flex items-center gap-2 px-3 py-2.5 rounded-lg border border-gray-200 hover:border-gray-300 hover:bg-gray-50 transition-colors text-left"
                  >
                    <span className={cn('w-2 h-2 rounded-full flex-shrink-0', STAGE_CONFIG[stage].dotColor)} />
                    <span className="text-sm font-medium text-gray-700">{STAGE_CONFIG[stage].label}</span>
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
