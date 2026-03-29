'use client'

import { useState, useCallback, useRef, useEffect } from 'react'
import dynamic from 'next/dynamic'
import { useRouter } from 'next/navigation'
import {
  ArrowLeft,
  Lock,
  ChevronDown,
  ChevronUp,
  Plus,
  Trash2,
  Save,
  Download,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useUpdateCVVersion, useDuplicateCVVersion } from '@/hooks/useCVVersions'
import type { CVVersion, TemplateId } from '@/types/database.types'
import type {
  ResumeData,
  ResumeExperience,
  ResumeEducation,
  ResumeLanguage,
  CEFRLevel,
} from '@/types/resume'
import { EMPTY_RESUME_DATA } from '@/types/resume'
import { cn } from '@/lib/utils'
import { scoreResume } from '@/lib/ats-engine'
import type { AtsScoreResult, AtsRuleResult } from '@/lib/ats-engine'
import Link from 'next/link'
import { useJobs } from '@/hooks/use-jobs'

// PDFViewer uses browser-only APIs — must be loaded dynamically
const ResumePreview = dynamic(
  () => import('./pdf/ResumePreview').then((m) => m.ResumePreview),
  { ssr: false, loading: () => <PreviewLoading /> }
)

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

type EditorTab = 'content' | 'ats'

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
    <div className="border border-[var(--jf-border)] rounded-xl overflow-hidden">
      <button
        type="button"
        onClick={onToggle}
        className="w-full flex items-center justify-between px-4 py-3.5 bg-[var(--jf-bg-card)] hover:bg-[var(--jf-bg-subtle)] transition-colors text-left"
      >
        <div className="flex items-center gap-2">
          <span className="text-sm font-semibold text-[var(--jf-text-primary)]">{title}</span>
          {optional && (
            <span className="text-xs text-[var(--jf-text-muted)] font-normal">Optional</span>
          )}
        </div>
        {open ? (
          <ChevronUp className="w-4 h-4 text-[var(--jf-text-muted)]" />
        ) : (
          <ChevronDown className="w-4 h-4 text-[var(--jf-text-muted)]" />
        )}
      </button>
      {open && (
        <div className="px-4 pb-5 pt-1 bg-[var(--jf-bg-card)] border-t border-[var(--jf-border)] space-y-4">
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
      <label className="text-xs font-medium text-[var(--jf-text-secondary)]">
        {label}
        {required && <span className="text-[var(--jf-error)] ml-0.5">*</span>}
      </label>
      {children}
    </div>
  )
}

const inputCls =
  'w-full rounded-md border border-[var(--jf-border)] bg-[var(--jf-bg-card)] text-[var(--jf-text-primary)] px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[var(--jf-interactive)] disabled:bg-[var(--jf-bg-subtle)] disabled:text-[var(--jf-text-muted)]'

const textareaCls =
  'w-full rounded-md border border-[var(--jf-border)] bg-[var(--jf-bg-card)] text-[var(--jf-text-primary)] px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[var(--jf-interactive)] disabled:bg-[var(--jf-bg-subtle)] disabled:text-[var(--jf-text-muted)] resize-none min-h-[80px]'

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
        <p className="text-xs text-[var(--jf-warning)]">
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
        <div key={entry.id} className="space-y-3 p-4 bg-[var(--jf-bg-subtle)] rounded-lg">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-[var(--jf-text-muted)] uppercase tracking-wide">
              Experience {i + 1}
            </span>
            {!locked && (
              <button
                type="button"
                onClick={() => removeEntry(entry.id)}
                className="text-[var(--jf-text-muted)] hover:text-[var(--jf-error)] transition-colors p-1"
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
            <label className="text-xs font-medium text-[var(--jf-text-secondary)]">
              Bullet points <span className="text-[var(--jf-text-muted)] font-normal">(start with an action verb)</span>
            </label>
            {entry.bullets.map((bullet) => (
              <div key={bullet.id} className="flex items-start gap-2">
                <span className="mt-2.5 w-1 h-1 rounded-full bg-[var(--jf-text-muted)] flex-shrink-0" />
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
                    className="mt-2 text-[var(--jf-text-muted)] hover:text-[var(--jf-error)] transition-colors flex-shrink-0"
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
                className="flex items-center gap-1.5 text-xs text-[var(--jf-interactive)] hover:text-[var(--jf-interactive-hover)] font-medium mt-1"
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
          className="w-full rounded-lg border-2 border-dashed border-[var(--jf-border)] py-3 text-sm text-[var(--jf-text-muted)] hover:border-[var(--jf-interactive)] hover:text-[var(--jf-interactive)] transition-colors flex items-center justify-center gap-1.5"
        >
          <Plus className="w-4 h-4" /> Add work experience
        </button>
      )}

      {entries.length === 0 && locked && (
        <p className="text-sm text-[var(--jf-text-muted)] text-center py-4">No work experience added.</p>
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
            className="inline-flex items-center gap-1 text-sm text-[var(--jf-interactive)] bg-[var(--jf-interactive-subtle)] border border-[var(--jf-interactive-border)] px-2.5 py-1 rounded-full"
          >
            {skill}
            {!locked && (
              <button
                type="button"
                onClick={() => removeSkill(skill)}
                className="text-[var(--jf-interactive)] hover:text-[var(--jf-interactive-hover)] leading-none ml-0.5"
                aria-label={`Remove ${skill}`}
              >
                ×
              </button>
            )}
          </span>
        ))}
        {skills.length === 0 && (
          <p className="text-sm text-[var(--jf-text-muted)]">No skills added yet.</p>
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
              className="text-[var(--jf-text-muted)] hover:text-[var(--jf-error)] transition-colors flex-shrink-0 p-1"
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
          className="flex items-center gap-1.5 text-sm text-[var(--jf-interactive)] hover:text-[var(--jf-interactive-hover)] font-medium"
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
        <div key={entry.id} className="space-y-3 p-4 bg-[var(--jf-bg-subtle)] rounded-lg">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-[var(--jf-text-muted)] uppercase tracking-wide">
              Education {i + 1}
            </span>
            {!locked && (
              <button
                type="button"
                onClick={() => removeEntry(entry.id)}
                className="text-[var(--jf-text-muted)] hover:text-[var(--jf-error)] transition-colors p-1"
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
          className="w-full rounded-lg border-2 border-dashed border-[var(--jf-border)] py-3 text-sm text-[var(--jf-text-muted)] hover:border-[var(--jf-interactive)] hover:text-[var(--jf-interactive)] transition-colors flex items-center justify-center gap-1.5"
        >
          <Plus className="w-4 h-4" /> Add education
        </button>
      )}
    </div>
  )
}

// ─── Preview loading skeleton ─────────────────────────────────────────────────

function PreviewLoading() {
  return (
    <div className="w-full h-full flex items-center justify-center bg-[var(--jf-bg-subtle)]">
      <div className="flex flex-col items-center gap-3">
        <div className="w-8 h-8 border-2 border-[var(--jf-interactive-border)] border-t-[var(--jf-interactive)] rounded-full animate-spin" />
        <p className="text-xs text-[var(--jf-text-muted)]">Rendering preview…</p>
      </div>
    </div>
  )
}

// ─── ATS Score tab ────────────────────────────────────────────────────────────

function AtsScoreGauge({ score }: { score: number }) {
  const color = score >= 80 ? 'text-[var(--jf-success)]' : score >= 60 ? 'text-[var(--jf-warning)]' : 'text-[var(--jf-error)]'
  const bg    = score >= 80 ? 'bg-[var(--jf-success-tint)] border-[var(--jf-success-border)]' : score >= 60 ? 'bg-[var(--jf-warning-tint)] border-[var(--jf-warning-border)]' : 'bg-[var(--jf-error-tint)] border-[var(--jf-error-border)]'
  const label = score >= 80 ? 'Strong' : score >= 60 ? 'Needs work' : 'Critical issues'

  return (
    <div className={cn('rounded-xl border p-5 flex items-center gap-5', bg)}>
      <div className={cn('text-5xl font-black tabular-nums', color)}>{score}</div>
      <div>
        <p className={cn('text-sm font-bold', color)}>{label}</p>
        <p className="text-xs text-[var(--jf-text-secondary)] mt-0.5">out of 100 · deterministic ATS rule engine</p>
      </div>
    </div>
  )
}

function AtsRuleRow({ rule }: { rule: AtsRuleResult }) {
  const icon = rule.severity === 'pass'
    ? <span className="w-4 h-4 rounded-full bg-[var(--jf-success)] flex-shrink-0 flex items-center justify-center text-white text-[9px] font-bold">✓</span>
    : rule.severity === 'error'
    ? <span className="w-4 h-4 rounded-full bg-[var(--jf-error)] flex-shrink-0 flex items-center justify-center text-white text-[9px] font-bold">✕</span>
    : <span className="w-4 h-4 rounded-full bg-[var(--jf-warning)] flex-shrink-0 flex items-center justify-center text-white text-[9px] font-bold">!</span>

  return (
    <div className="flex gap-3 py-3 border-b border-[var(--jf-border)] last:border-0">
      <div className="mt-0.5">{icon}</div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-[var(--jf-text-primary)]">{rule.title}</p>
        <p className="text-xs text-[var(--jf-text-secondary)] mt-0.5 leading-relaxed">{rule.detail}</p>
        {rule.penalty > 0 && (
          <span className="text-xs text-[var(--jf-error)] font-medium">−{rule.penalty} pts</span>
        )}
      </div>
    </div>
  )
}

function AtsScoreTab({ data, templateId }: { data: ResumeData; templateId: TemplateId }) {
  const result: AtsScoreResult = scoreResume(data, templateId)

  return (
    <div className="space-y-5">
      <AtsScoreGauge score={result.score} />

      <div className="flex gap-4 text-center">
        <div className="flex-1 rounded-lg bg-[var(--jf-error-tint)] border border-[var(--jf-error-border)] py-3 text-center">
          <p className="text-xl font-bold text-[var(--jf-error)]">{result.errors.length}</p>
          <p className="text-xs text-[var(--jf-text-secondary)] mt-0.5">Errors</p>
        </div>
        <div className="flex-1 rounded-lg bg-[var(--jf-warning-tint)] border border-[var(--jf-warning-border)] py-3 text-center">
          <p className="text-xl font-bold text-[var(--jf-warning)]">{result.warnings.length}</p>
          <p className="text-xs text-[var(--jf-text-secondary)] mt-0.5">Warnings</p>
        </div>
        <div className="flex-1 rounded-lg bg-[var(--jf-success-tint)] border border-[var(--jf-success-border)] py-3 text-center">
          <p className="text-xl font-bold text-[var(--jf-success)]">{result.passes.length}</p>
          <p className="text-xs text-[var(--jf-text-secondary)] mt-0.5">Passing</p>
        </div>
      </div>

      {result.errors.length > 0 && (
        <div>
          <p className="text-xs font-semibold text-[var(--jf-error)] uppercase tracking-wide mb-1">Errors — fix these first</p>
          <div className="rounded-xl border border-[var(--jf-error-border)] px-4 divide-y divide-[var(--jf-border)]">
            {result.errors.map((r) => <AtsRuleRow key={r.id} rule={r} />)}
          </div>
        </div>
      )}

      {result.warnings.length > 0 && (
        <div>
          <p className="text-xs font-semibold text-[var(--jf-warning)] uppercase tracking-wide mb-1">Warnings — recommended fixes</p>
          <div className="rounded-xl border border-[var(--jf-warning-border)] px-4 divide-y divide-[var(--jf-border)]">
            {result.warnings.map((r) => <AtsRuleRow key={r.id} rule={r} />)}
          </div>
        </div>
      )}

      {result.passes.length > 0 && (
        <div>
          <p className="text-xs font-semibold text-[var(--jf-success)] uppercase tracking-wide mb-1">Passing checks</p>
          <div className="rounded-xl border border-[var(--jf-success-border)] px-4 divide-y divide-[var(--jf-border)]">
            {result.passes.map((r) => <AtsRuleRow key={r.id} rule={r} />)}
          </div>
        </div>
      )}
    </div>
  )
}

// ─── Pipeline Keywords tab ────────────────────────────────────────────────────

const STOP_WORDS = new Set([
  'a','an','the','and','or','but','in','on','at','to','for','of','with','by',
  'from','up','about','into','through','during','is','are','was','were','be',
  'been','being','have','has','had','do','does','did','will','would','could',
  'should','may','might','this','that','these','those','i','we','you','they',
  'he','she','it','as','if','then','than','so','not','no','nor','yet','both',
  'either','each','few','more','most','other','some','such','own','same',
])

function extractKeywords(text: string): string[] {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9\s\-+#.]/g, ' ')
    .split(/\s+/)
    .filter((w) => w.length >= 3 && !STOP_WORDS.has(w))
}

function buildCvKeywordSet(data: ResumeData): Set<string> {
  const text = [
    data.summary ?? '',
    ...data.experience.flatMap((e) => [e.title, e.company, ...e.bullets.map((b) => b.text)]),
    ...data.skills,
    ...data.education.flatMap((e) => [e.degree, e.field ?? '']),
  ].join(' ')
  return new Set(extractKeywords(text))
}

function PipelineKeywordsTab({ data }: { data: ResumeData }) {
  const { data: jobs, isLoading } = useJobs()

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-16">
        <div className="w-6 h-6 border-2 border-[var(--jf-interactive-tint-border)] border-t-[var(--jf-interactive)] rounded-full animate-spin" />
      </div>
    )
  }

  const activeJobs = (jobs ?? []).filter(
    (j) => !['rejected', 'withdrawn'].includes(j.stage)
  )

  if (activeJobs.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-16 gap-3 text-center">
        <p className="text-sm font-medium text-[var(--jf-text-secondary)]">No active pipeline jobs</p>
        <p className="text-xs text-[var(--jf-text-muted)] max-w-xs">
          Add jobs to your pipeline first. Keyword gaps will appear here once you have active applications.
        </p>
        <Link href="/pipeline" className="text-xs text-[var(--jf-interactive)] underline">Go to Pipeline →</Link>
      </div>
    )
  }

  // Build keyword frequency map from pipeline job titles + notes
  const pipelineText = activeJobs
    .flatMap((j) => [j.job_title, j.company_name, j.notes ?? ''])
    .join(' ')
  const pipelineKeywords = extractKeywords(pipelineText)

  const freqMap = new Map<string, number>()
  for (const kw of pipelineKeywords) {
    freqMap.set(kw, (freqMap.get(kw) ?? 0) + 1)
  }

  const cvKeywords = buildCvKeywordSet(data)

  // Missing = in pipeline ≥2 times but not in CV
  const missing = Array.from(freqMap.entries())
    .filter(([kw, count]) => count >= 2 && !cvKeywords.has(kw))
    .sort(([, a], [, b]) => b - a)
    .slice(0, 30)

  // Present = in pipeline AND in CV
  const present = Array.from(freqMap.entries())
    .filter(([kw]) => cvKeywords.has(kw))
    .sort(([, a], [, b]) => b - a)
    .slice(0, 20)

  return (
    <div className="space-y-5">
      <div className="rounded-xl border border-[var(--jf-interactive-border)] bg-[var(--jf-interactive-subtle)] px-4 py-3">
        <p className="text-sm font-semibold text-[var(--jf-interactive)]">Based on {activeJobs.length} active pipeline jobs</p>
        <p className="text-xs text-[var(--jf-interactive)] mt-0.5 opacity-80">Keywords ranked by frequency across your saved job titles and notes.</p>
      </div>

      {missing.length > 0 && (
        <div>
          <p className="text-xs font-semibold text-[var(--jf-error)] uppercase tracking-wide mb-2">Missing from your CV</p>
          <div className="flex flex-wrap gap-2">
            {missing.map(([kw, count]) => (
              <span
                key={kw}
                className="inline-flex items-center gap-1.5 text-xs px-2.5 py-1 rounded-full bg-[var(--jf-error-tint)] border border-[var(--jf-error-border)] text-[var(--jf-error)] font-medium"
              >
                {kw}
                <span className="text-[var(--jf-error)] opacity-60 text-[10px]">×{count}</span>
              </span>
            ))}
          </div>
        </div>
      )}

      {present.length > 0 && (
        <div>
          <p className="text-xs font-semibold text-[var(--jf-success)] uppercase tracking-wide mb-2">Already in your CV</p>
          <div className="flex flex-wrap gap-2">
            {present.map(([kw, count]) => (
              <span
                key={kw}
                className="inline-flex items-center gap-1.5 text-xs px-2.5 py-1 rounded-full bg-[var(--jf-success-tint)] border border-[var(--jf-success-border)] text-[var(--jf-success)] font-medium"
              >
                {kw}
                <span className="text-[var(--jf-success)] opacity-60 text-[10px]">×{count}</span>
              </span>
            ))}
          </div>
        </div>
      )}

      {missing.length === 0 && (
        <div className="rounded-xl border border-[var(--jf-success-border)] bg-[var(--jf-success-tint)] px-4 py-3 text-center">
          <p className="text-sm font-semibold text-[var(--jf-success)]">Great keyword coverage!</p>
          <p className="text-xs text-[var(--jf-success)] mt-0.5 opacity-80">Your CV already contains the most frequent keywords from your pipeline.</p>
        </div>
      )}
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

  // Debounced preview data — updated 300ms after every change to avoid re-rendering on every keystroke
  const [previewData, setPreviewData] = useState<ResumeData>({
    ...EMPTY_RESUME_DATA,
    ...parsed,
    contact: { ...EMPTY_RESUME_DATA.contact, ...(parsed.contact ?? {}) },
  })
  const previewTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  function schedulePreviewUpdate(next: ResumeData) {
    if (previewTimerRef.current) clearTimeout(previewTimerRef.current)
    previewTimerRef.current = setTimeout(() => setPreviewData(next), 300)
  }

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
      if (previewTimerRef.current) clearTimeout(previewTimerRef.current)
    }
  }, [])

  function handleDataChange(next: ResumeData) {
    setData(next)
    scheduleAutosave(next, cvName)
    schedulePreviewUpdate(next)
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
    { id: 'ats', label: 'ATS Score' },
  ]

  // ── Download handlers ──────────────────────────────────────────────────────
  const [downloading, setDownloading] = useState<'pdf' | 'docx' | null>(null)
  const [downloadError, setDownloadError] = useState<string | null>(null)

  async function handleDownload(format: 'pdf' | 'docx') {
    setDownloading(format)
    setDownloadError(null)
    try {
      const res = await fetch(`/api/cv-versions/${version.id}/export/${format}`, { method: 'POST' })
      if (!res.ok) throw new Error(`Export failed: ${res.status}`)
      const blob = await res.blob()
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `${cvName.replace(/[^a-z0-9\-_]/gi, '_')}.${format}`
      a.click()
      URL.revokeObjectURL(url)
    } catch {
      setDownloadError(format)
    } finally {
      setDownloading(null)
    }
  }

  // ── Save indicator text ────────────────────────────────────────────────────
  const saveIndicator = updateMutation.isPending
    ? 'Saving…'
    : lastSaved
    ? `Saved ${relativeTime(lastSaved)}`
    : null

  return (
    <div className="flex flex-col h-full overflow-hidden">
      {/* ── Top bar ─────────────────────────────────────────────────────────── */}
      <div className="flex-shrink-0 flex items-center gap-3 px-4 sm:px-6 h-14 border-b border-[var(--jf-border)] bg-[var(--jf-bg-card)]">
        <button
          onClick={() => router.push('/cv-versions')}
          className="p-1.5 rounded-lg text-[var(--jf-text-secondary)] hover:text-[var(--jf-text-primary)] hover:bg-[var(--jf-bg-subtle)] transition-colors flex-shrink-0"
          aria-label="Back to library"
        >
          <ArrowLeft className="w-4 h-4" />
        </button>

        {locked ? (
          <div className="flex items-center gap-1.5 flex-1 min-w-0">
            <Lock className="w-3.5 h-3.5 text-[var(--jf-text-muted)] flex-shrink-0" />
            <span className="text-sm font-semibold text-[var(--jf-text-secondary)] truncate">{cvName}</span>
          </div>
        ) : (
          <input
            type="text"
            value={cvName}
            onChange={(e) => handleNameChange(e.target.value)}
            onBlur={handleBlurSave}
            className="flex-1 min-w-0 text-sm font-semibold text-[var(--jf-text-primary)] bg-transparent border-none outline-none focus:bg-[var(--jf-bg-subtle)] focus:px-2 rounded-md transition-all truncate"
            aria-label="Resume name"
          />
        )}

        {saveIndicator && (
          <span className="hidden sm:block text-xs text-[var(--jf-text-muted)] flex-shrink-0">{saveIndicator}</span>
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

        {/* Download buttons — desktop */}
        <Button
          size="sm"
          variant="outline"
          onClick={() => handleDownload('pdf')}
          disabled={downloading !== null}
          className="flex-shrink-0 hidden sm:flex items-center gap-1.5"
          title="Download as PDF"
        >
          <Download className="w-3.5 h-3.5" />
          {downloading === 'pdf' ? 'Generating…' : 'PDF'}
        </Button>
        <Button
          size="sm"
          variant="outline"
          onClick={() => handleDownload('docx')}
          disabled={downloading !== null}
          className="flex-shrink-0 hidden sm:flex items-center gap-1.5"
          title="Download as DOCX (recommended for Taleo/SAP)"
        >
          <Download className="w-3.5 h-3.5" />
          {downloading === 'docx' ? 'Generating…' : 'DOCX'}
        </Button>
      </div>

      {/* ── Download error banner ─────────────────────────────────────────────── */}
      {downloadError && (
        <div className="flex-shrink-0 flex items-center justify-between gap-3 px-4 sm:px-6 py-2.5 bg-[var(--jf-error-tint)] border-b border-[var(--jf-error-border)]">
          <p className="text-sm text-[var(--jf-error)]">
            {downloadError.toUpperCase()} generation failed — please try again.
          </p>
          <button
            onClick={() => handleDownload(downloadError as 'pdf' | 'docx')}
            className="text-sm font-semibold text-[var(--jf-error)] underline flex-shrink-0 min-h-[44px] px-2"
          >
            Retry
          </button>
        </div>
      )}

      {/* ── Mobile download strip ─────────────────────────────────────────────── */}
      <div className="sm:hidden flex-shrink-0 flex gap-2 px-4 py-2 border-b border-[var(--jf-border)] bg-[var(--jf-bg-card)]">
        <button
          onClick={() => handleDownload('pdf')}
          disabled={downloading !== null}
          className="flex-1 flex items-center justify-center gap-1.5 text-sm font-medium text-[var(--jf-text-secondary)] border border-[var(--jf-border)] rounded-lg py-2 min-h-[44px] hover:bg-[var(--jf-bg-subtle)] disabled:opacity-50"
        >
          <Download className="w-4 h-4" />
          {downloading === 'pdf' ? 'Generating…' : 'Download PDF'}
        </button>
        <button
          onClick={() => handleDownload('docx')}
          disabled={downloading !== null}
          className="flex-1 flex items-center justify-center gap-1.5 text-sm font-medium text-[var(--jf-text-secondary)] border border-[var(--jf-border)] rounded-lg py-2 min-h-[44px] hover:bg-[var(--jf-bg-subtle)] disabled:opacity-50"
        >
          <Download className="w-4 h-4" />
          {downloading === 'docx' ? 'Generating…' : 'Download DOCX'}
        </button>
      </div>

      {/* ── Lock banner ─────────────────────────────────────────────────────── */}
      {locked && (
        <div className="flex-shrink-0 flex flex-col sm:flex-row items-start sm:items-center gap-3 px-4 sm:px-6 py-3 bg-[var(--jf-warning-tint)] border-b border-[var(--jf-warning-border)]">
          <div className="flex items-start gap-2 flex-1">
            <Lock className="w-4 h-4 text-[var(--jf-warning)] mt-0.5 flex-shrink-0" />
            <p className="text-sm text-[var(--jf-text-primary)]">
              <span className="font-semibold">This resume is locked.</span>{' '}
              An application linked to it has reached Screening — editing would break your performance data.
            </p>
          </div>
          <Button
            size="sm"
            variant="outline"
            className="flex-shrink-0 border-[var(--jf-warning-border)] text-[var(--jf-text-primary)] hover:bg-[var(--jf-warning-tint)]"
            onClick={async () => {
              const copy = await duplicateMutation.mutateAsync({
                id: version.id,
                name: `${cvName} – Copy`,
              })
              router.push(`/cv-versions/${copy.id}/edit`)
            }}
            disabled={duplicateMutation.isPending}
          >
            Duplicate to edit
          </Button>
        </div>
      )}

      {/* ── Mobile preview toggle ────────────────────────────────────────────── */}
      <div className="sm:hidden flex-shrink-0 flex border-b border-[var(--jf-border)] bg-[var(--jf-bg-card)]">
        {(['edit', 'preview'] as const).map((t) => (
          <button
            key={t}
            onClick={() => setMobileTab(t)}
            className={cn(
              'flex-1 py-2.5 text-sm font-medium transition-colors',
              mobileTab === t
                ? 'text-[var(--jf-interactive)] border-b-2 border-[var(--jf-interactive)]'
                : 'text-[var(--jf-text-muted)] hover:text-[var(--jf-text-secondary)]'
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
          <div className="flex-shrink-0 flex border-b border-[var(--jf-border)] bg-[var(--jf-bg-card)] px-4 overflow-x-auto">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={cn(
                  'flex-shrink-0 px-3 py-3 text-sm font-medium transition-colors border-b-2 -mb-px',
                  activeTab === tab.id
                    ? 'text-[var(--jf-interactive)] border-[var(--jf-interactive)]'
                    : 'text-[var(--jf-text-muted)] border-transparent hover:text-[var(--jf-text-secondary)]'
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

            {activeTab === 'ats' && (
              <AtsScoreTab data={data} templateId={version.template_id as TemplateId} />
            )}
          </div>
        </div>

        {/* Preview side — desktop + mobile preview tab */}
        <div
          className={cn(
            'hidden sm:flex flex-1 flex-col bg-[var(--jf-bg-subtle)] border-l border-[var(--jf-border)] overflow-hidden',
            mobileTab === 'preview' && '!flex w-full sm:w-auto'
          )}
        >
          <ResumePreview data={previewData} templateId={version.template_id as TemplateId} />
        </div>
      </div>
    </div>
  )
}
