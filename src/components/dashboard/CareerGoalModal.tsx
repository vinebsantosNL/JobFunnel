'use client'

import { useRef, useEffect, useState } from 'react'
import { useForm, Controller } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { Loader2, Check, X, Briefcase, Calendar, ChevronRight } from 'lucide-react'
import {
  Dialog,
  DialogContent,
  DialogTitle,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'

// ─── Data ────────────────────────────────────────────────────────────────────

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
  { label: 'Up to €50k',   min: 0,      max: 50000  },
  { label: '€50–75k',      min: 50000,  max: 75000  },
  { label: '€75–100k',     min: 75000,  max: 100000 },
  { label: '€100–125k',    min: 100000, max: 125000 },
  { label: '€125–150k',    min: 125000, max: 150000 },
  { label: '€150–200k',    min: 150000, max: 200000 },
  { label: '€200k+',       min: 200000, max: null   },
]

function salaryKey(min: number | null | undefined, max: number | null | undefined): string {
  return `${min ?? ''}-${max ?? ''}`
}

function formatMonthDisplay(ym: string): string {
  if (!ym) return ''
  const [year, month] = ym.split('-')
  const d = new Date(parseInt(year), parseInt(month) - 1)
  return d.toLocaleDateString('en-GB', { month: 'short', year: 'numeric' })
}

// ─── Schema ───────────────────────────────────────────────────────────────────

const careerGoalSchema = z.object({
  target_role:  z.string().optional(),
  target_date:  z.string().optional(),
  salary_key:   z.string().optional(),
})
type CareerGoalFormData = z.infer<typeof careerGoalSchema>

// ─── Props ────────────────────────────────────────────────────────────────────

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

// ─── Shared label style ───────────────────────────────────────────────────────

const labelStyle: React.CSSProperties = {
  display: 'block',
  fontSize: 10,
  fontWeight: 600,
  textTransform: 'uppercase',
  letterSpacing: '0.08em',
  color: 'var(--jf-text-muted)',
  marginBottom: 6,
}

// ─── Role selector sub-component ─────────────────────────────────────────────

function RoleSelector({ value, onChange }: { value: string | undefined; onChange: (v: string) => void }) {
  const [open, setOpen] = useState(false)
  const containerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!open) return
    function handler(e: MouseEvent) {
      if (!containerRef.current?.contains(e.target as Node)) setOpen(false)
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [open])

  return (
    <div ref={containerRef} style={{ position: 'relative' }}>
      {/* Trigger */}
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        style={{
          width: '100%',
          background: 'var(--jf-bg-card)',
          border: `1px solid ${open ? 'var(--jf-interactive)' : 'var(--jf-border)'}`,
          borderRadius: 10,
          padding: '9px 12px',
          display: 'flex',
          alignItems: 'center',
          gap: 8,
          cursor: 'pointer',
          transition: 'border-color 0.12s, box-shadow 0.12s',
          boxShadow: open ? '0 0 0 3px var(--jf-interactive-tint)' : 'none',
          textAlign: 'left',
          minHeight: 44,
        }}
      >
        <Briefcase style={{ width: 15, height: 15, color: 'var(--jf-text-muted)', flexShrink: 0 }} />
        <span
          style={{
            flex: 1,
            fontSize: 13,
            color: value ? 'var(--jf-text-primary)' : 'var(--jf-text-muted)',
            fontWeight: value ? 500 : 400,
          }}
        >
          {value || 'Select a role…'}
        </span>
        <ChevronRight
          style={{
            width: 14,
            height: 14,
            color: 'var(--jf-text-muted)',
            flexShrink: 0,
            transform: open ? 'rotate(90deg)' : 'none',
            transition: 'transform 0.15s ease',
          }}
        />
      </button>

      {/* Dropdown */}
      {open && (
        <div
          style={{
            position: 'absolute',
            top: 'calc(100% + 4px)',
            left: 0,
            right: 0,
            background: 'var(--jf-bg-card)',
            border: '1px solid var(--jf-border)',
            borderRadius: 10,
            boxShadow: '0 8px 24px rgba(0,0,0,0.08)',
            zIndex: 50,
            overflow: 'hidden',
          }}
        >
          <div style={{ maxHeight: 220, overflowY: 'auto', padding: 6 }}>
            {TECH_ROLES.map(({ group, roles }) => (
              <div key={group}>
                <div
                  style={{
                    fontSize: 10,
                    fontWeight: 600,
                    textTransform: 'uppercase',
                    letterSpacing: '0.08em',
                    color: 'var(--jf-text-muted)',
                    padding: '8px 8px 4px',
                  }}
                >
                  {group}
                </div>
                {roles.map((role) => {
                  const selected = value === role
                  return (
                    <div
                      key={role}
                      onClick={() => { onChange(role); setOpen(false) }}
                      style={{
                        fontSize: 13,
                        color: selected ? 'var(--jf-interactive)' : 'var(--jf-text-secondary)',
                        padding: '7px 8px',
                        borderRadius: 6,
                        cursor: 'pointer',
                        fontWeight: selected ? 500 : 400,
                        background: selected ? 'var(--jf-interactive-subtle)' : 'transparent',
                        display: 'flex',
                        alignItems: 'center',
                        gap: 8,
                        transition: 'background 0.1s, color 0.1s',
                      }}
                      onMouseEnter={(e) => {
                        if (!selected) (e.currentTarget as HTMLDivElement).style.background = 'var(--jf-bg-subtle)'
                      }}
                      onMouseLeave={(e) => {
                        if (!selected) (e.currentTarget as HTMLDivElement).style.background = 'transparent'
                      }}
                    >
                      <Check
                        style={{
                          width: 13,
                          height: 13,
                          flexShrink: 0,
                          visibility: selected ? 'visible' : 'hidden',
                          color: 'var(--jf-interactive)',
                        }}
                      />
                      {role}
                    </div>
                  )
                })}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

// ─── Date selector ────────────────────────────────────────────────────────────

function DateSelector({ value, onChange }: { value: string | undefined; onChange: (v: string) => void }) {
  const nativeRef = useRef<HTMLInputElement>(null)

  return (
    <div style={{ position: 'relative' }}>
      <button
        type="button"
        onClick={() => nativeRef.current?.showPicker?.()}
        style={{
          width: '100%',
          background: 'var(--jf-bg-card)',
          border: '1px solid var(--jf-border)',
          borderRadius: 10,
          padding: '9px 12px',
          display: 'flex',
          alignItems: 'center',
          gap: 8,
          cursor: 'pointer',
          textAlign: 'left',
          minHeight: 44,
        }}
      >
        <Calendar style={{ width: 15, height: 15, color: 'var(--jf-text-muted)', flexShrink: 0 }} />
        <span
          style={{
            flex: 1,
            fontSize: 13,
            fontFamily: value ? 'var(--font-dm-mono, monospace)' : 'inherit',
            color: value ? 'var(--jf-text-primary)' : 'var(--jf-text-muted)',
            fontWeight: value ? 500 : 400,
          }}
        >
          {value ? formatMonthDisplay(value) : 'e.g. Jun 2026'}
        </span>
      </button>
      <input
        ref={nativeRef}
        type="month"
        value={value ?? ''}
        onChange={(e) => onChange(e.target.value)}
        min={new Date().toISOString().slice(0, 7)}
        style={{
          position: 'absolute',
          inset: 0,
          opacity: 0,
          pointerEvents: 'none',
          width: '100%',
          height: '100%',
        }}
        tabIndex={-1}
        aria-hidden="true"
      />
      <p style={{ fontSize: 11, color: 'var(--jf-text-muted)', marginTop: 4 }}>
        The month you aim to have an offer
      </p>
    </div>
  )
}

// ─── Salary pills ─────────────────────────────────────────────────────────────

function SalaryPills({ value, onChange }: { value: string | undefined; onChange: (v: string) => void }) {
  return (
    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
      {SALARY_RANGES.map((r) => {
        const key = salaryKey(r.min, r.max)
        const active = value === key
        return (
          <button
            key={key}
            type="button"
            onClick={() => onChange(active ? '' : key)}
            style={{
              padding: '5px 12px',
              borderRadius: 100,
              border: `1px solid ${active ? 'var(--jf-interactive-border)' : 'var(--jf-border)'}`,
              background: active ? 'var(--jf-interactive-subtle)' : 'var(--jf-bg-card)',
              color: active ? 'var(--jf-interactive)' : 'var(--jf-text-secondary)',
              fontSize: 11,
              fontFamily: 'var(--font-dm-mono, monospace)',
              fontWeight: 500,
              cursor: 'pointer',
              minHeight: 32,
              transition: 'background 0.12s, border-color 0.12s, color 0.12s',
              whiteSpace: 'nowrap',
            }}
          >
            {r.label}
          </button>
        )
      })}
    </div>
  )
}

// ─── Main modal ───────────────────────────────────────────────────────────────

export function CareerGoalModal({ open, onOpenChange, initialValues }: CareerGoalModalProps) {
  const queryClient = useQueryClient()
  const [justSaved, setJustSaved] = useState(false)

  const hasGoal = !!(initialValues?.target_role?.trim())

  const {
    handleSubmit,
    control,
    formState: { isSubmitting },
  } = useForm<CareerGoalFormData>({
    resolver: zodResolver(careerGoalSchema),
    defaultValues: {
      target_role:  initialValues?.target_role ?? '',
      target_date:  initialValues?.target_date?.slice(0, 7) ?? '',
      salary_key:   salaryKey(initialValues?.target_salary_min, initialValues?.target_salary_max),
    },
  })

  const mutation = useMutation({
    mutationFn: async (data: CareerGoalFormData) => {
      const selectedRange = SALARY_RANGES.find(
        (r) => salaryKey(r.min, r.max) === data.salary_key
      ) ?? null

      const payload = {
        target_role:            data.target_role || null,
        target_date:            data.target_date ? `${data.target_date}-01` : null,
        target_salary_min:      selectedRange?.min ?? null,
        target_salary_max:      selectedRange?.max ?? null,
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
      <DialogContent
        size="md"
        showCloseButton={false}
        className="p-0 gap-0 overflow-hidden"
        style={{ maxWidth: 480 }}
      >
        <DialogTitle className="sr-only">
          {hasGoal ? 'Edit Career Goal' : 'Set Career Goal'}
        </DialogTitle>

        {/* ── Header ── */}
        <div style={{ padding: '20px 20px 0 20px', flexShrink: 0 }}>
          <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 4 }}>
            <h2
              style={{
                fontSize: 16,
                fontWeight: 700,
                color: 'var(--jf-text-primary)',
                letterSpacing: '-0.01em',
              }}
            >
              {hasGoal ? 'Edit Career Goal' : 'Set Career Goal'}
            </h2>
            <button
              type="button"
              onClick={() => onOpenChange(false)}
              style={{
                width: 36,
                height: 36,
                borderRadius: 8,
                border: 'none',
                background: 'transparent',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer',
                color: 'var(--jf-text-muted)',
                flexShrink: 0,
                marginTop: -4,
                marginRight: -4,
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = 'var(--jf-bg-subtle)'
                e.currentTarget.style.color = 'var(--jf-text-secondary)'
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = 'transparent'
                e.currentTarget.style.color = 'var(--jf-text-muted)'
              }}
              aria-label="Close"
            >
              <X style={{ width: 16, height: 16 }} />
            </button>
          </div>
          <p style={{ fontSize: 12, color: 'var(--jf-text-muted)', lineHeight: 1.5, maxWidth: 380 }}>
            Define where you want to be — JobFunnel tracks your progress and flags if you&apos;re off pace.
          </p>
          <div style={{ height: 1, background: 'var(--jf-border)', marginTop: 16 }} />
        </div>

        {/* ── Body ── */}
        <form onSubmit={handleSubmit((data) => mutation.mutate(data))}>
          <div
            style={{
              padding: 20,
              display: 'flex',
              flexDirection: 'column',
              gap: 16,
              overflowY: 'auto',
              maxHeight: 'calc(90vh - 180px)',
            }}
          >
            {/* Target Role */}
            <div>
              <label style={labelStyle}>Target Role</label>
              <Controller
                name="target_role"
                control={control}
                render={({ field }) => (
                  <RoleSelector value={field.value ?? undefined} onChange={field.onChange} />
                )}
              />
            </div>

            {/* Target Date */}
            <div>
              <label style={labelStyle}>Target Date</label>
              <Controller
                name="target_date"
                control={control}
                render={({ field }) => (
                  <DateSelector value={field.value ?? undefined} onChange={field.onChange} />
                )}
              />
            </div>

            {/* Target Salary */}
            <div>
              <label style={labelStyle}>Target Salary (EUR)</label>
              <Controller
                name="salary_key"
                control={control}
                render={({ field }) => (
                  <SalaryPills value={field.value ?? undefined} onChange={field.onChange} />
                )}
              />
            </div>
          </div>

          {/* ── Footer ── */}
          <div
            style={{
              borderTop: '1px solid var(--jf-border)',
              padding: '14px 20px',
              display: 'flex',
              justifyContent: 'flex-end',
              gap: 8,
              flexShrink: 0,
            }}
          >
            <Button
              type="button"
              variant="ghost"
              onClick={() => onOpenChange(false)}
              style={{ minHeight: 44 }}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={isPending}
              style={{
                minHeight: 44,
                background: justSaved ? 'var(--jf-success)' : undefined,
              }}
              className="gap-1.5"
            >
              {isPending ? (
                <><Loader2 className="w-3.5 h-3.5 animate-spin" />Saving…</>
              ) : justSaved ? (
                <><Check className="w-3.5 h-3.5" />Saved!</>
              ) : (
                'Save Goal'
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
