'use client'

import { useState, useEffect } from 'react'
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet'
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
import { Badge } from '@/components/ui/badge'
import type { JobApplication, Stage, Priority } from '@/types/database'
import { STAGE_CONFIG, STAGES, PRIORITY_CONFIG } from '@/lib/stages'
import type { UpdateJobInput } from '@/lib/validations/job'
import { CVVersionPicker } from '@/components/cv-versions/CVVersionPicker'

interface ApplicationModalProps {
  job: JobApplication | null
  open: boolean
  onClose: () => void
  onUpdate: (id: string, input: UpdateJobInput) => void
  onDelete: (id: string) => void
}

export function ApplicationModal({ job, open, onClose, onUpdate, onDelete }: ApplicationModalProps) {
  const [editing, setEditing] = useState(false)
  const [form, setForm] = useState<Partial<JobApplication>>({})

  useEffect(() => {
    if (job) setForm(job)
    setEditing(false)
  }, [job])

  if (!job) return null

  const LOCKED_STAGES: Stage[] = ['screening', 'interviewing', 'offer', 'rejected', 'withdrawn']
  const isCVVersionLocked = LOCKED_STAGES.includes(job?.stage ?? 'saved')

  function handleSave() {
    if (!job) return
    onUpdate(job.id, {
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
    if (!job) return
    onUpdate(job.id, { stage })
    onClose()
  }

  const stageConfig = STAGE_CONFIG[job.stage]

  return (
    <Sheet open={open} onOpenChange={(isOpen) => { if (!isOpen) onClose() }}>
      <SheetContent className="w-full sm:max-w-lg overflow-y-auto">
        <SheetHeader>
          <div className="flex items-start justify-between pr-8">
            <SheetTitle className="text-left">
              {editing ? 'Edit Application' : job.company_name}
            </SheetTitle>
            <Badge className={`${stageConfig.bgColor} ${stageConfig.color} border ${stageConfig.borderColor} text-xs ml-2 flex-shrink-0`}>
              {stageConfig.label}
            </Badge>
          </div>
        </SheetHeader>

        <div className="mt-6 space-y-5 px-4 pb-6">
          {!editing ? (
            <>
              {/* View mode */}
              <div>
                <p className="text-lg font-semibold text-gray-900">{job.job_title}</p>
                <p className="text-sm text-gray-500">{job.company_name}</p>
                {job.location && <p className="text-sm text-gray-400 mt-1">{job.location}</p>}
                {job.job_url && (
                  <a href={job.job_url} target="_blank" rel="noopener noreferrer"
                    className="text-sm text-blue-600 hover:underline mt-1 block truncate">
                    View job posting
                  </a>
                )}
              </div>

              {(job.salary_min || job.salary_max) && (
                <div>
                  <p className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-1">Salary</p>
                  <p className="text-sm text-gray-700">
                    {job.salary_currency ?? '€'}{job.salary_min?.toLocaleString() ?? '?'}
                    {job.salary_max ? ` – ${job.salary_max.toLocaleString()}` : '+'}
                  </p>
                </div>
              )}

              <div>
                <p className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-1">Priority</p>
                <div className="flex items-center gap-2">
                  <div className={`w-2 h-2 rounded-full ${PRIORITY_CONFIG[job.priority].color}`} />
                  <span className="text-sm text-gray-700">{PRIORITY_CONFIG[job.priority].label}</span>
                </div>
              </div>

              <div>
                <p className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-2">Move to stage</p>
                <div className="grid grid-cols-2 gap-2">
                  {STAGES.filter(s => s !== job.stage).map(stage => (
                    <Button
                      key={stage}
                      variant="outline"
                      size="sm"
                      className="text-xs justify-start"
                      onClick={() => handleStageChange(stage)}
                    >
                      <span className={`w-2 h-2 rounded-full mr-2 ${STAGE_CONFIG[stage].dotColor}`} />
                      {STAGE_CONFIG[stage].label}
                    </Button>
                  ))}
                </div>
              </div>

              {job.notes && (
                <div>
                  <p className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-1">Notes</p>
                  <p className="text-sm text-gray-700 whitespace-pre-wrap">{job.notes}</p>
                </div>
              )}

              <div>
                <p className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-1">CV Version</p>
                <p className="text-sm text-gray-700">
                  {job.cv_versions ? job.cv_versions.name : 'Untagged'}
                </p>
              </div>

              <div className="flex gap-2 pt-2">
                <Button onClick={() => setEditing(true)} variant="outline" size="sm" className="flex-1">
                  Edit
                </Button>
                <Button
                  onClick={() => { onDelete(job.id); onClose() }}
                  variant="destructive"
                  size="sm"
                >
                  Delete
                </Button>
              </div>
            </>
          ) : (
            <>
              {/* Edit mode */}
              <div className="space-y-3">
                <div>
                  <Label htmlFor="company">Company</Label>
                  <Input id="company" value={form.company_name ?? ''} onChange={e => setForm(f => ({ ...f, company_name: e.target.value }))} />
                </div>
                <div>
                  <Label htmlFor="title">Job Title</Label>
                  <Input id="title" value={form.job_title ?? ''} onChange={e => setForm(f => ({ ...f, job_title: e.target.value }))} />
                </div>
                <div>
                  <Label htmlFor="url">Job URL</Label>
                  <Input id="url" value={form.job_url ?? ''} onChange={e => setForm(f => ({ ...f, job_url: e.target.value }))} placeholder="https://..." />
                </div>
                <div>
                  <Label htmlFor="location">Location</Label>
                  <Input id="location" value={form.location ?? ''} onChange={e => setForm(f => ({ ...f, location: e.target.value }))} />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <Label htmlFor="salary_min">Salary Min</Label>
                    <Input
                      id="salary_min"
                      type="number"
                      value={form.salary_min ?? ''}
                      onChange={e => setForm(f => ({ ...f, salary_min: e.target.value ? Number(e.target.value) : null }))}
                    />
                  </div>
                  <div>
                    <Label htmlFor="salary_max">Salary Max</Label>
                    <Input
                      id="salary_max"
                      type="number"
                      value={form.salary_max ?? ''}
                      onChange={e => setForm(f => ({ ...f, salary_max: e.target.value ? Number(e.target.value) : null }))}
                    />
                  </div>
                </div>
                <div>
                  <Label htmlFor="priority">Priority</Label>
                  <Select
                    value={form.priority}
                    onValueChange={(v) => setForm(f => ({ ...f, priority: v as Priority }))}
                  >
                    <SelectTrigger id="priority" className="w-full">
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
                  <Label htmlFor="notes">Notes</Label>
                  <Textarea
                    id="notes"
                    value={form.notes ?? ''}
                    onChange={e => setForm(f => ({ ...f, notes: e.target.value }))}
                    rows={4}
                  />
                </div>
                <div>
                  <Label>CV Version</Label>
                  <CVVersionPicker
                    value={form.cv_version_id ?? null}
                    onChange={(id) => setForm(f => ({ ...f, cv_version_id: id }))}
                    disabled={isCVVersionLocked}
                  />
                </div>
              </div>

              <div className="flex gap-2 pt-2">
                <Button onClick={handleSave} size="sm" className="flex-1">Save</Button>
                <Button onClick={() => { setForm(job); setEditing(false) }} variant="outline" size="sm">Cancel</Button>
              </div>
            </>
          )}
        </div>
      </SheetContent>
    </Sheet>
  )
}
