'use client'

import { useState, useCallback, useRef, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import {
  ArrowLeft,
  Lock,
  ChevronDown,
  ChevronUp,
  Plus,
  Trash2,
  Save,
  FileText,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useUpdateCVVersion, useDuplicateCVVersion } from '@/hooks/useCVVersions'
import type { CVVersion } from '@/types/database.types'
import type {
  ResumeData,
  ResumeExperience,
  ResumeEducation,
  ResumeLanguage,
  CEFRLevel,
} from '@/types/resume'
import { EMPTY_RESUME_DATA } from '@/types/resume'
import { cn } from '@/lib/utils'

// ─── Constants ────────────────────────────────────────────────────────────────

const AUTOSAVE_DELAY = 30_000 // 30s

const CEFR_LEVELS: CEFRLevel[] = ['A1', 'A2', 'B1', 'B2', 'C1', 'C2']

const CEFR_LABELS: Record<CEFRLevel, string> = {
  A1: 'A1 – Beginner',
  A2: 'A2 – Elementary',
  B1: 'B1 – Intermediate',
  B2: 'B2 – Upper Intermediate',
  C1: 'C1 – Advanced',
  C2: 'C2 – Mastery',
}

type EditorTab = 'content' | 'design' | 'ats' | 'keywords'

function newId() {
  return crypto.randomUUID()
}

function relativeTime(ts: number): string {
  const diff = Math.floor((Date.now() - ts) / 1000)
  if (diff < 5) return 'just now'
  if (diff < 60) return `${diff}s ago`
  return `${Math.floor(diff / 60)}m ago`
}

// ─── Section wrapper ──────────────────────────────────────────────────────────

function Section({
  title,
  open,
  onToggle,
  optional,
  children,
}: {
  title: string
  open: boolean
  onToggle: () => void
  optional?: boolean
  children: React.ReactNode
}) {
  return (
    <div className="border border-gray-200 rounded-xl overflow-hidden">
      <button
        type="button"
        onClick={onToggle}
        className="w-full flex items-center justify-between px-4 py-3.5 bg-white hover:bg-gray-50 transition-colors text-left"
      >
        <div className="flex items-center gap-2">
          <span className="text-sm font-semibold text-gray-800">{title}</span>
          {optional && (
            <span className="text-xs text-gray-400 font-normal">Optional</span>
          )}
        </div>
        {open ? (
          <ChevronUp className="w-4 h-4 text-gray-400" />
        ) : (
          <ChevronDown className="w-4 h-4 text-gray-400" />
        )}
      </button>
      {open && (
        <div className="px-4 pb-5 pt-1 bg-white border-t border-gray-100 space-y-4">
          {children}
        </div>
      )}
    </div>
  )
}

// ─── Field components ─────────────────────────────────────────────────────────

function Field({
  label,
  required,
  children,
}: {
  label: string
  required?: boolean
  children: React.ReactNode
}) {
  return (
    <div className="flex flex-col gap-1">
      <label className="text-xs font-medium text-gray-600">
        {label}
        {required && <span className="text-red-500 ml-0.5">*</span>}
      </label>
      {children}
    </div>
  )
}

const inputCls =
  'w-full rounded-md border border-gray-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-50 disabled:text-gray-400'

const textareaCls =
  'w-full rounded-md border border-gray-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-50 disabled:text-gray-400 resize-none min-h-[80px]'

// ─── Contact section ──────────────────────────────────────────────────────────

function ContactSection({
  data,
  onChange,
  locked,
}: {
  data: ResumeData['contact']
  onChange: (contact: ResumeData['contact']) => void
  locked: boolean
}) {
  function set(key: keyof ResumeData['contact'], value: string) {
    onChange({ ...data, [key]: value })
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
      <Field label="First name" required>
        <input
          className={inputCls}
          value={data.firstName}
          onChange={(e) => set('firstName', e.target.value)}
          disabled={locked}
          placeholder="Ada"
        />
      </Field>
      <Field label="Last name" required>
        <input
          className={inputCls}
          value={data.lastName}
          onChange={(e) => set('lastName', e.target.value)}
          disabled={locked}
          placeholder="Lovelace"
        />
      </Field>
      <Field label="Target job title" required>
        <input
          className={inputCls}
          value={data.targetTitle}
          onChange={(e) => set('targetTitle', e.target.value)}
          disabled={locked}
          placeholder="Senior Software Engineer"
        />
      </Field>
      <Field label="Email" required>
        <input
          type="email"
          className={inputCls}
          value={data.email}
          onChange={(e) => set('email', e.target.value)}
          disabled={locked}
          placeholder="ada@example.com"
        />
      </Field>
      <Field label="Location" required>
        <input
          className={inputCls}
          value={data.location}
          onChange={(e) => set('location', e.target.value)}
          disabled={locked}
          placeholder="Amsterdam, NL"
        />
      </Field>
      <Field label="LinkedIn URL">
        <input
          className={inputCls}
          value={data.linkedin ?? ''}
          onChange={(e) => set('linkedin', e.target.value)}
          disabled={locked}
          placeholder="linkedin.com/in/ada"
        />
      </Field>
      <Field label="Phone">
        <input
          type="tel"
          className={inputCls}
          value={data.phone ?? ''}
          onChange={(e) => set('phone', e.target.value)}
          disabled={locked}
          placeholder="+31 6 00 00 00 00"
        />
      </Field>
      <Field label="Website / Portfolio">
        <input
          className={inputCls}
          value={data.website ?? ''}
          onChange={(e) => set('website', e.target.value)}
          disabled={locked}
          placeholder="github.com/ada"
        />
      </Field>
    </div>
  )
}

// ─── Summary section ──────────────────────────────────────────────────────────

function SummarySection({
  value,
  onChange,
  locked,
}: {
  value: string
  onChange: (v: string) => void
  locked: boolean
}) {
  const words = value.trim().split(/\s+/).filter(Boolean).length
  return (
    <div className="space-y-2">
      <textarea
        className={textareaCls}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        disabled={locked}
        placeholder="Write 2–4 sentences summarising your experience, key skills, and what you're looking for. Keep it under 150 words for best ATS results."
        rows={4}
      />
      {words > 150 && (
        <p className="text-xs text-amber-600">
          {words} words — most ATS systems prefer summaries under 150 words.
        </p>
      )}
    </div>
  )
}

// ─── Experience section ───────────────────────────────────────────────────────

function ExperienceSection({
  entries,
  onChange,
  locked,
}: {
  entries: ResumeExperience[]
  onChange: (entries: ResumeExperience[]) => void
  locked: boolean
}) {
  function addEntry() {
    onChange([
      ...entries,
      {
        id: newId(),
        company: '',
        title: '',
        startDate: '',
        endDate: 'Present',
        bullets: [{ id: newId(), text: '' }],
      },
    ])
  }

  function removeEntry(id: string) {
    onChange(entries.filter((e) => e.id !== id))
  }

  function updateEntry(id: string, patch: Partial<ResumeExperience>) {
    onChange(entries.map((e) => (e.id === id ? { ...e, ...patch } : e)))
  }

  function addBullet(entryId: string) {
    updateEntry(entryId, {
      bullets: [
        ...(entries.find((e) => e.id === entryId)?.bullets ?? []),
        { id: newId(), text: '' },
      ],
    })
  }

  function removeBullet(entryId: string, bulletId: string) {
    const entry = entries.find((e) => e.id === entryId)
    if (!entry) return
    updateEntry(entryId, { bullets: entry.bullets.filter((b) => b.id !== bulletId) })
  }

  function updateBullet(entryId: string, bulletId: string, text: string) {
    const entry = entries.find((e) => e.id === entryId)
    if (!entry) return
    updateEntry(entryId, {
      bullets: entry.bullets.map((b) => (b.id === bulletId ? { ...b, text } : b)),
    })
  }

  return (
    <div className="space-y-6">
      {entries.map((entry, i) => (
        <div key={entry.id} className="space-y-3 p-4 bg-gray-50 rounded-lg">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-gray-500 uppercase tracking-wide">
              Experience {i + 1}
            </span>
            {!locked && (
              <button
                type="button"
                onClick={() => removeEntry(entry.id)}
                className="text-gray-400 hover:text-red-500 transition-colors p-1"
                aria-label="Remove"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <Field label="Company" required>
              <input
                className={inputCls}
                value={entry.company}
                onChange={(e) => updateEntry(entry.id, { company: e.target.value })}
                disabled={locked}
                placeholder="Acme Corp"
              />
            </Field>
            <Field label="Job title" required>
              <input
                className={inputCls}
                value={entry.title}
                onChange={(e) => updateEntry(entry.id, { title: e.target.value })}
                disabled={locked}
                placeholder="Senior Engineer"
              />
            </Field>
            <Field label="Location">
              <input
                className={inputCls}
                value={entry.location ?? ''}
                onChange={(e) => updateEntry(entry.id, { location: e.target.value })}
                disabled={locked}
                placeholder="Amsterdam, NL"
              />
            </Field>
            <div className="grid grid-cols-2 gap-2">
              <Field label="Start date" required>
                <input
                  className={inputCls}
                  value={entry.startDate}
                  onChange={(e) => updateEntry(entry.id, { startDate: e.target.value })}
                  disabled={locked}
                  placeholder="Jan 2022"
                />
              </Field>
              <Field label="End date" required>
                <input
                  className={inputCls}
                  value={entry.endDate}
                  onChange={(e) => updateEntry(entry.id, { endDate: e.target.value })}
                  disabled={locked}
                  placeholder="Present"
                />
              </Field>
            </div>
          </div>

          {/* Bullets */}
          <div className="space-y-2">
            <label className="text-xs font-medium text-gray-600">
              Bullet points <span className="text-gray-400 font-normal">(start with an action verb)</span>
            </label>
            {entry.bullets.map((bullet) => (
              <div key={bullet.id} className="flex items-start gap-2">
                <span className="mt-2.5 w-1 h-1 rounded-full bg-gray-400 flex-shrink-0" />
                <input
                  className={cn(inputCls, 'flex-1')}
                  value={bullet.text}
                  onChange={(e) => updateBullet(entry.id, bullet.id, e.target.value)}
                  disabled={locked}
                  placeholder="Led migration of monolith to microservices, reducing p99 latency by 40%"
                />
                {!locked && entry.bullets.length > 1 && (
                  <button
                    type="button"
                    onClick={() => removeBullet(entry.id, bullet.id)}
                    className="mt-2 text-gray-300 hover:text-red-400 transition-colors flex-shrink-0"
                    aria-label="Remove bullet"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>
            ))}
            {!locked && (
              <button
                type="button"
                onClick={() => addBullet(entry.id)}
                className="flex items-center gap-1.5 text-xs text-blue-600 hover:text-blue-700 font-medium mt-1"
              >
                <Plus className="w-3.5 h-3.5" /> Add bullet
              </button>
            )}
          </div>
        </div>
      ))}

      {!locked && (
        <button
          type="button"
          onClick={addEntry}
          className="w-full rounded-lg border-2 border-dashed border-gray-200 py-3 text-sm text-gray-400 hover:border-blue-300 hover:text-blue-500 transition-colors flex items-center justify-center gap-1.5"
        >
          <Plus className="w-4 h-4" /> Add work experience
        </button>
      )}

      {entries.length === 0 && locked && (
        <p className="text-sm text-gray-400 text-center py-4">No work experience added.</p>
      )}
    </div>
  )
}

// ─── Skills section ───────────────────────────────────────────────────────────

function SkillsSection({
  skills,
  onChange,
  locked,
}: {
  skills: string[]
  onChange: (skills: string[]) => void
  locked: boolean
}) {
  const [draft, setDraft] = useState('')

  function addSkill() {
    const trimmed = draft.trim()
    if (!trimmed || skills.includes(trimmed)) return
    onChange([...skills, trimmed])
    setDraft('')
  }

  function removeSkill(skill: string) {
    onChange(skills.filter((s) => s !== skill))
  }

  return (
    <div className="space-y-3">
      {!locked && (
        <div className="flex gap-2">
          <input
            className={cn(inputCls, 'flex-1')}
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') { e.preventDefault(); addSkill() }
            }}
            placeholder="Type a skill and press Enter"
          />
          <Button type="button" variant="outline" size="sm" onClick={addSkill}>
            Add
          </Button>
        </div>
      )}
      <div className="flex flex-wrap gap-2">
        {skills.map((skill) => (
          <span
            key={skill}
            className="inline-flex items-center gap-1 text-sm text-blue-700 bg-blue-50 border border-blue-200 px-2.5 py-1 rounded-full"
          >
            {skill}
            {!locked && (
              <button
                type="button"
                onClick={() => removeSkill(skill)}
                className="text-blue-400 hover:text-blue-700 leading-none ml-0.5"
                aria-label={`Remove ${skill}`}
              >
                ×
              </button>
            )}
          </span>
        ))}
        {skills.length === 0 && (
          <p className="text-sm text-gray-400">No skills added yet.</p>
        )}
      </div>
    </div>
  )
}

// ─── Languages section ────────────────────────────────────────────────────────

function LanguagesSection({
  languages,
  onChange,
  locked,
}: {
  languages: ResumeLanguage[]
  onChange: (langs: ResumeLanguage[]) => void
  locked: boolean
}) {
  function addLanguage() {
    onChange([...languages, { id: newId(), language: '', level: 'B2' }])
  }

  function updateLanguage(id: string, patch: Partial<ResumeLanguage>) {
    onChange(languages.map((l) => (l.id === id ? { ...l, ...patch } : l)))
  }

  function removeLanguage(id: string) {
    onChange(languages.filter((l) => l.id !== id))
  }

  return (
    <div className="space-y-3">
      {languages.map((lang) => (
        <div key={lang.id} className="flex items-center gap-3">
          <input
            className={cn(inputCls, 'flex-1')}
            value={lang.language}
            onChange={(e) => updateLanguage(lang.id, { language: e.target.value })}
            disabled={locked}
            placeholder="English"
          />
          <select
            value={lang.level}
            onChange={(e) => updateLanguage(lang.id, { level: e.target.value as CEFRLevel })}
            disabled={locked}
            className={cn(inputCls, 'w-52 flex-shrink-0')}
          >
            {CEFR_LEVELS.map((lvl) => (
              <option key={lvl} value={lvl}>
                {CEFR_LABELS[lvl]}
              </option>
            ))}
          </select>
          {!locked && (
            <button
              type="button"
              onClick={() => removeLanguage(lang.id)}
              className="text-gray-400 hover:text-red-500 transition-colors flex-shrink-0 p-1"
              aria-label="Remove"
            >
              <Trash2 className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      ))}
      {!locked && (
        <button
          type="button"
          onClick={addLanguage}
          className="flex items-center gap-1.5 text-sm text-blue-600 hover:text-blue-700 font-medium"
        >
          <Plus className="w-4 h-4" /> Add language
        </button>
      )}
    </div>
  )
}

// ─── Education section ────────────────────────────────────────────────────────

function EducationSection({
  entries,
  onChange,
  locked,
}: {
  entries: ResumeEducation[]
  onChange: (entries: ResumeEducation[]) => void
  locked: boolean
}) {
  function addEntry() {
    onChange([...entries, { id: newId(), institution: '', degree: '' }])
  }

  function updateEntry(id: string, patch: Partial<ResumeEducation>) {
    onChange(entries.map((e) => (e.id === id ? { ...e, ...patch } : e)))
  }

  function removeEntry(id: string) {
    onChange(entries.filter((e) => e.id !== id))
  }

  return (
    <div className="space-y-4">
      {entries.map((entry, i) => (
        <div key={entry.id} className="space-y-3 p-4 bg-gray-50 rounded-lg">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-gray-500 uppercase tracking-wide">
              Education {i + 1}
            </span>
            {!locked && (
              <button
                type="button"
                onClick={() => removeEntry(entry.id)}
                className="text-gray-400 hover:text-red-500 transition-colors p-1"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <Field label="Institution" required>
              <input
                className={inputCls}
                value={entry.institution}
                onChange={(e) => updateEntry(entry.id, { institution: e.target.value })}
                disabled={locked}
                placeholder="Delft University of Technology"
              />
            </Field>
            <Field label="Degree" required>
              <input
                className={inputCls}
                value={entry.degree}
                onChange={(e) => updateEntry(entry.id, { degree: e.target.value })}
                disabled={locked}
                placeholder="MSc Computer Science"
              />
            </Field>
            <Field label="Field of study">
              <input
                className={inputCls}
                value={entry.field ?? ''}
                onChange={(e) => updateEntry(entry.id, { field: e.target.value })}
                disabled={locked}
                placeholder="Software Engineering"
              />
            </Field>
            <Field label="Grade / GPA">
              <input
                className={inputCls}
                value={entry.grade ?? ''}
                onChange={(e) => updateEntry(entry.id, { grade: e.target.value })}
                disabled={locked}
                placeholder="8.2 / 10"
              />
            </Field>
            <Field label="Start year">
              <input
                className={inputCls}
                value={entry.startDate ?? ''}
                onChange={(e) => updateEntry(entry.id, { startDate: e.target.value })}
                disabled={locked}
                placeholder="Sep 2018"
              />
            </Field>
            <Field label="End year">
              <input
                className={inputCls}
                value={entry.endDate ?? ''}
                onChange={(e) => updateEntry(entry.id, { endDate: e.target.value })}
                disabled={locked}
                placeholder="Jun 2020"
              />
            </Field>
          </div>
        </div>
      ))}

      {!locked && (
        <button
          type="button"
          onClick={addEntry}
          className="w-full rounded-lg border-2 border-dashed border-gray-200 py-3 text-sm text-gray-400 hover:border-blue-300 hover:text-blue-500 transition-colors flex items-center justify-center gap-1.5"
        >
          <Plus className="w-4 h-4" /> Add education
        </button>
      )}
    </div>
  )
}

// ─── Preview placeholder ──────────────────────────────────────────────────────

function PreviewPane() {
  return (
    <div className="flex flex-col items-center justify-center h-full min-h-[500px] bg-gray-50 rounded-xl border border-dashed border-gray-200 gap-3">
      <FileText className="w-10 h-10 text-gray-300" strokeWidth={1.2} />
      <p className="text-sm font-medium text-gray-400">Live preview</p>
      <p className="text-xs text-gray-400 text-center max-w-[180px]">
        PDF preview will be available in the next update.
      </p>
    </div>
  )
}

// ─── Editor ───────────────────────────────────────────────────────────────────

interface ResumeEditorProps {
  version: CVVersion
}

export function ResumeEditor({ version }: ResumeEditorProps) {
  const router = useRouter()
  const updateMutation = useUpdateCVVersion()
  const duplicateMutation = useDuplicateCVVersion()

  // ── State ──────────────────────────────────────────────────────────────────
  const [cvName, setCvName] = useState(version.name)
  const [activeTab, setActiveTab] = useState<EditorTab>('content')
  const [lastSaved, setLastSaved] = useState<number | null>(null)
  const [mobileTab, setMobileTab] = useState<'edit' | 'preview'>('edit')

  // Parse resume_data from the version (may be empty {})
  const parsed = version.resume_data as Partial<ResumeData>
  const [data, setData] = useState<ResumeData>({
    ...EMPTY_RESUME_DATA,
    ...parsed,
    contact: { ...EMPTY_RESUME_DATA.contact, ...(parsed.contact ?? {}) },
  })

  // Section open/close state — contact open by default for new CVs
  const hasContent = !!(parsed.contact?.firstName || parsed.contact?.email)
  const [openSections, setOpenSections] = useState<Record<string, boolean>>({
    contact: true,
    summary: hasContent,
    experience: hasContent,
    skills: hasContent,
    languages: false,
    education: false,
  })

  const saveTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const locked = version.is_locked

  // ── Autosave ───────────────────────────────────────────────────────────────
  const save = useCallback(
    async (payload: ResumeData, name: string) => {
      if (locked) return
      await updateMutation.mutateAsync({
        id: version.id,
        input: { resume_data: payload as unknown as Record<string, unknown>, name },
      })
      setLastSaved(Date.now())
    },
    [locked, updateMutation, version.id]
  )

  function scheduleAutosave(payload: ResumeData, name: string) {
    if (saveTimerRef.current) clearTimeout(saveTimerRef.current)
    saveTimerRef.current = setTimeout(() => save(payload, name), AUTOSAVE_DELAY)
  }

  useEffect(() => {
    return () => {
      if (saveTimerRef.current) clearTimeout(saveTimerRef.current)
    }
  }, [])

  function handleDataChange(next: ResumeData) {
    setData(next)
    scheduleAutosave(next, cvName)
  }

  function handleNameChange(name: string) {
    setCvName(name)
    scheduleAutosave(data, name)
  }

  function handleBlurSave() {
    if (saveTimerRef.current) clearTimeout(saveTimerRef.current)
    save(data, cvName)
  }

  async function handleExplicitSave() {
    if (saveTimerRef.current) clearTimeout(saveTimerRef.current)
    await save(data, cvName)
  }

  function toggleSection(key: string) {
    setOpenSections((prev) => ({ ...prev, [key]: !prev[key] }))
  }

  // ── Tabs ───────────────────────────────────────────────────────────────────
  const tabs: { id: EditorTab; label: string }[] = [
    { id: 'content', label: 'Content' },
    { id: 'design', label: 'Design' },
    { id: 'ats', label: 'ATS Score' },
    { id: 'keywords', label: 'Pipeline Keywords' },
  ]

  // ── Save indicator text ────────────────────────────────────────────────────
  const saveIndicator = updateMutation.isPending
    ? 'Saving…'
    : lastSaved
    ? `Saved ${relativeTime(lastSaved)}`
    : null

  return (
    <div className="flex flex-col h-full overflow-hidden">
      {/* ── Top bar ─────────────────────────────────────────────────────────── */}
      <div className="flex-shrink-0 flex items-center gap-3 px-4 sm:px-6 h-14 border-b border-gray-200 bg-white">
        <button
          onClick={() => router.push('/app/cv-versions')}
          className="p-1.5 rounded-lg text-gray-500 hover:text-gray-800 hover:bg-gray-100 transition-colors flex-shrink-0"
          aria-label="Back to library"
        >
          <ArrowLeft className="w-4 h-4" />
        </button>

        {locked ? (
          <div className="flex items-center gap-1.5 flex-1 min-w-0">
            <Lock className="w-3.5 h-3.5 text-gray-400 flex-shrink-0" />
            <span className="text-sm font-semibold text-gray-700 truncate">{cvName}</span>
          </div>
        ) : (
          <input
            type="text"
            value={cvName}
            onChange={(e) => handleNameChange(e.target.value)}
            onBlur={handleBlurSave}
            className="flex-1 min-w-0 text-sm font-semibold text-gray-800 bg-transparent border-none outline-none focus:bg-gray-50 focus:px-2 rounded-md transition-all truncate"
            aria-label="Resume name"
          />
        )}

        {saveIndicator && (
          <span className="hidden sm:block text-xs text-gray-400 flex-shrink-0">{saveIndicator}</span>
        )}

        {!locked && (
          <Button
            size="sm"
            variant="outline"
            onClick={handleExplicitSave}
            disabled={updateMutation.isPending}
            className="flex-shrink-0 hidden sm:flex items-center gap-1.5"
          >
            <Save className="w-3.5 h-3.5" />
            Save
          </Button>
        )}
      </div>

      {/* ── Lock banner ─────────────────────────────────────────────────────── */}
      {locked && (
        <div className="flex-shrink-0 flex flex-col sm:flex-row items-start sm:items-center gap-3 px-4 sm:px-6 py-3 bg-amber-50 border-b border-amber-200">
          <div className="flex items-start gap-2 flex-1">
            <Lock className="w-4 h-4 text-amber-600 mt-0.5 flex-shrink-0" />
            <p className="text-sm text-amber-800">
              <span className="font-semibold">This resume is locked.</span>{' '}
              An application linked to it has reached Screening — editing would break your performance data.
            </p>
          </div>
          <Button
            size="sm"
            variant="outline"
            className="flex-shrink-0 border-amber-300 text-amber-800 hover:bg-amber-100"
            onClick={async () => {
              const copy = await duplicateMutation.mutateAsync({
                id: version.id,
                name: `${cvName} – Copy`,
              })
              router.push(`/app/cv-versions/${copy.id}/edit`)
            }}
            disabled={duplicateMutation.isPending}
          >
            Duplicate to edit
          </Button>
        </div>
      )}

      {/* ── Mobile preview toggle ────────────────────────────────────────────── */}
      <div className="sm:hidden flex-shrink-0 flex border-b border-gray-200 bg-white">
        {(['edit', 'preview'] as const).map((t) => (
          <button
            key={t}
            onClick={() => setMobileTab(t)}
            className={cn(
              'flex-1 py-2.5 text-sm font-medium transition-colors',
              mobileTab === t
                ? 'text-blue-600 border-b-2 border-blue-600'
                : 'text-gray-500 hover:text-gray-700'
            )}
          >
            {t === 'edit' ? 'Edit' : 'Preview'}
          </button>
        ))}
      </div>

      {/* ── Main area ────────────────────────────────────────────────────────── */}
      <div className="flex-1 flex overflow-hidden">
        {/* Form side */}
        <div
          className={cn(
            'flex flex-col overflow-hidden',
            'w-full sm:w-1/2 lg:w-[45%]',
            mobileTab === 'preview' && 'hidden sm:flex'
          )}
        >
          {/* Tab bar */}
          <div className="flex-shrink-0 flex border-b border-gray-200 bg-white px-4 overflow-x-auto">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={cn(
                  'flex-shrink-0 px-3 py-3 text-sm font-medium transition-colors border-b-2 -mb-px',
                  activeTab === tab.id
                    ? 'text-blue-600 border-blue-600'
                    : 'text-gray-500 border-transparent hover:text-gray-700'
                )}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* Tab content */}
          <div className="flex-1 overflow-y-auto p-4 sm:p-5">
            {activeTab === 'content' && (
              <div className="space-y-3">
                <Section
                  title="Contact"
                  open={openSections.contact}
                  onToggle={() => toggleSection('contact')}
                >
                  <ContactSection
                    data={data.contact}
                    onChange={(contact) => handleDataChange({ ...data, contact })}
                    locked={locked}
                  />
                </Section>

                <Section
                  title="Professional Summary"
                  open={openSections.summary}
                  onToggle={() => toggleSection('summary')}
                  optional
                >
                  <SummarySection
                    value={data.summary ?? ''}
                    onChange={(summary) => handleDataChange({ ...data, summary })}
                    locked={locked}
                  />
                </Section>

                <Section
                  title="Work Experience"
                  open={openSections.experience}
                  onToggle={() => toggleSection('experience')}
                >
                  <ExperienceSection
                    entries={data.experience}
                    onChange={(experience) => handleDataChange({ ...data, experience })}
                    locked={locked}
                  />
                </Section>

                <Section
                  title="Skills"
                  open={openSections.skills}
                  onToggle={() => toggleSection('skills')}
                >
                  <SkillsSection
                    skills={data.skills}
                    onChange={(skills) => handleDataChange({ ...data, skills })}
                    locked={locked}
                  />
                </Section>

                <Section
                  title="Languages"
                  open={openSections.languages}
                  onToggle={() => toggleSection('languages')}
                  optional
                >
                  <LanguagesSection
                    languages={data.languages}
                    onChange={(languages) => handleDataChange({ ...data, languages })}
                    locked={locked}
                  />
                </Section>

                <Section
                  title="Education"
                  open={openSections.education}
                  onToggle={() => toggleSection('education')}
                >
                  <EducationSection
                    entries={data.education}
                    onChange={(education) => handleDataChange({ ...data, education })}
                    locked={locked}
                  />
                </Section>
              </div>
            )}

            {activeTab === 'design' && (
              <div className="flex flex-col items-center justify-center py-16 gap-3 text-center">
                <p className="text-sm font-medium text-gray-500">Template design controls</p>
                <p className="text-xs text-gray-400 max-w-xs">
                  Colour, font, and spacing customisation will be available in a future update.
                </p>
              </div>
            )}

            {activeTab === 'ats' && (
              <div className="flex flex-col items-center justify-center py-16 gap-3 text-center">
                <p className="text-sm font-medium text-gray-500">ATS Score</p>
                <p className="text-xs text-gray-400 max-w-xs">
                  The ATS rule engine is coming in the next sprint. Fill in your content and come back to check your score.
                </p>
              </div>
            )}

            {activeTab === 'keywords' && (
              <div className="flex flex-col items-center justify-center py-16 gap-3 text-center">
                <p className="text-sm font-medium text-gray-500">Pipeline Keywords</p>
                <p className="text-xs text-gray-400 max-w-xs">
                  Add jobs to your pipeline first. Keyword gaps will appear here once your saved applications have job descriptions.
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Preview side — desktop */}
        <div
          className={cn(
            'hidden sm:flex flex-1 flex-col p-4 overflow-y-auto bg-gray-100 border-l border-gray-200',
            mobileTab === 'preview' && '!flex w-full sm:w-auto'
          )}
        >
          <PreviewPane />
        </div>
      </div>
    </div>
  )
}
