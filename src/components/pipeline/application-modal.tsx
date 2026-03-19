'use client'

import { useState, useEffect } from 'react'
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
import type { JobApplication, Stage, Priority } from '@/types/database'
import { STAGE_CONFIG, STAGES, PRIORITY_CONFIG } from '@/lib/stages'
import type { UpdateJobInput } from '@/lib/validations/job'
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
  const [form, setForm] = useState<Partial<JobApplication>>({})
  const [confirmDelete, setConfirmDelete] = useState(false)
  const [activeTab, setActiveTab] = useState<TabId>('details')

  useEffect(() => {
    if (job) setForm(job)
    setEditing(false)
    setConfirmDelete(false)
    setActiveTab('details')
  }, [job])

  if (!job) return null

  const LOCKED_STAGES: Stage[] = ['screening', 'interviewing', 'offer', 'rejected', 'withdrawn']
  const isCVVersionLocked = LOCKED_STAGES.includes(job.stage)

  const stageConfig = STAGE_CONFIG[job.stage]
  const nextStage = STAGE_NEXT[job.stage]

  function handleSave() {
    onUpdate(job!.id, {
      company_name: form.company_name,
      job_title: form.job_title,
      job_url: form.job_url ?? undefined,
      location: form.location ?? undefined,
      notes: form.notes ?? undefined,
      priority: form.priority,
      salary_min: form.salary_min,
      salary_max: form.salary_max,
      salary_currency: form.salary_currency ?? undefined,
      applied_at: form.applied_at ?? undefined,
      cv_version_id: form.cv_version_id,
    })
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
        showCloseButton={false}
        className="!max-w-2xl w-full p-0 gap-0 overflow-hidden rounded-2xl sm:!max-w-2xl"
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
              className="flex items-center gap-1.5 text-xs text-gray-500 hover:text-gray-700 transition-colors px-2 py-1.5 rounded-lg hover:bg-gray-50"
            >
              <Share2 className="w-3.5 h-3.5" />
              Share
            </button>
            {nextStage && (
              <button
                type="button"
                onClick={() => handleStageChange(nextStage)}
                className="flex items-center gap-1.5 text-xs font-medium text-white bg-blue-600 hover:bg-blue-700 transition-colors px-3 py-1.5 rounded-lg"
              >
                Move to {STAGE_CONFIG[nextStage].label}
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            )}
            <button
              type="button"
              onClick={onClose}
              className="w-7 h-7 flex items-center justify-center text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Body */}
        <div className="overflow-y-auto max-h-[80vh] bg-white">
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
              <span className={cn(
                'px-3 py-1 rounded-full text-xs font-semibold border flex-shrink-0',
                stageConfig.bgColor, stageConfig.color, stageConfig.borderColor
              )}>
                {stageConfig.label.toUpperCase()}
              </span>
            </div>

            {/* Job title */}
            <h2 className="text-2xl font-bold text-gray-900 mb-5">{job.job_title}</h2>

            {/* Metadata row */}
            <div className="grid grid-cols-3 gap-4 mb-6">
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
              <div className="space-y-3">
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <Label htmlFor="edit-company" className="text-xs font-medium text-gray-500 uppercase tracking-wide">Company</Label>
                    <Input id="edit-company" value={form.company_name ?? ''} onChange={e => setForm(f => ({ ...f, company_name: e.target.value }))} className="mt-1" />
                  </div>
                  <div>
                    <Label htmlFor="edit-title" className="text-xs font-medium text-gray-500 uppercase tracking-wide">Job Title</Label>
                    <Input id="edit-title" value={form.job_title ?? ''} onChange={e => setForm(f => ({ ...f, job_title: e.target.value }))} className="mt-1" />
                  </div>
                </div>
                <div>
                  <Label htmlFor="edit-url" className="text-xs font-medium text-gray-500 uppercase tracking-wide">Job URL</Label>
                  <Input id="edit-url" value={form.job_url ?? ''} onChange={e => setForm(f => ({ ...f, job_url: e.target.value }))} placeholder="https://..." className="mt-1" />
                </div>
                <div>
                  <Label htmlFor="edit-location" className="text-xs font-medium text-gray-500 uppercase tracking-wide">Location</Label>
                  <Input id="edit-location" value={form.location ?? ''} onChange={e => setForm(f => ({ ...f, location: e.target.value }))} className="mt-1" />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <Label htmlFor="edit-smin" className="text-xs font-medium text-gray-500 uppercase tracking-wide">Salary Min</Label>
                    <Input id="edit-smin" type="number" value={form.salary_min ?? ''} onChange={e => setForm(f => ({ ...f, salary_min: e.target.value ? Number(e.target.value) : null }))} className="mt-1" />
                  </div>
                  <div>
                    <Label htmlFor="edit-smax" className="text-xs font-medium text-gray-500 uppercase tracking-wide">Salary Max</Label>
                    <Input id="edit-smax" type="number" value={form.salary_max ?? ''} onChange={e => setForm(f => ({ ...f, salary_max: e.target.value ? Number(e.target.value) : null }))} className="mt-1" />
                  </div>
                </div>
                <div>
                  <Label htmlFor="edit-priority" className="text-xs font-medium text-gray-500 uppercase tracking-wide">Priority</Label>
                  <Select value={form.priority} onValueChange={(v) => setForm(f => ({ ...f, priority: v as Priority }))}>
                    <SelectTrigger id="edit-priority" className="w-full mt-1">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="low">Low</SelectItem>
                      <SelectItem value="medium">Medium</SelectItem>
                      <SelectItem value="high">High</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="edit-notes" className="text-xs font-medium text-gray-500 uppercase tracking-wide">Notes</Label>
                  <Textarea id="edit-notes" value={form.notes ?? ''} onChange={e => setForm(f => ({ ...f, notes: e.target.value }))} rows={4} className="mt-1" />
                </div>
                <div>
                  <Label className="text-xs font-medium text-gray-500 uppercase tracking-wide">CV Version</Label>
                  <div className="mt-1">
                    <CVVersionPicker value={form.cv_version_id ?? null} onChange={(id) => setForm(f => ({ ...f, cv_version_id: id }))} disabled={isCVVersionLocked} />
                  </div>
                </div>
                <div className="flex gap-2 pt-1">
                  <Button onClick={handleSave} size="sm" className="flex-1 bg-blue-600 hover:bg-blue-700">Save Changes</Button>
                  <Button onClick={() => { setForm(job); setEditing(false) }} variant="outline" size="sm">Cancel</Button>
                </div>
              </div>
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
