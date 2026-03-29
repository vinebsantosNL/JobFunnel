'use client'

import { useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { CheckCircle, AlertCircle } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog'
import { useCreateCVVersion, useUpdateCVVersion } from '@/hooks/useCVVersions'
import type { TemplateId } from '@/types/database.types'
import { cn } from '@/lib/utils'

// ─── Template metadata ────────────────────────────────────────────────────────

type ATSSystemKey = 'workday' | 'taleo' | 'sap' | 'greenhouse' | 'lever'
type ATSResult = 'pass' | 'warn'

interface TemplateConfig {
  id: TemplateId
  name: string
  description: string
  columns: 1 | 2
  ats: Record<ATSSystemKey, ATSResult>
  tags: Array<'ats-safe' | 'eu-a4' | 'compact'>
  badge?: 'popular' | 'eu-recommended'
}

const TEMPLATES: TemplateConfig[] = [
  {
    id: 'precision',
    name: 'Precision',
    description: 'Clean single-column layout. Highest ATS compatibility across all major systems.',
    columns: 1,
    ats: { workday: 'pass', taleo: 'pass', sap: 'pass', greenhouse: 'pass', lever: 'pass' },
    tags: ['ats-safe', 'eu-a4'],
    badge: 'popular',
  },
  {
    id: 'compact_eu',
    name: 'Compact EU',
    description: 'Single-column, information-dense. Fits two pages of experience onto one A4.',
    columns: 1,
    ats: { workday: 'pass', taleo: 'pass', sap: 'pass', greenhouse: 'pass', lever: 'pass' },
    tags: ['ats-safe', 'eu-a4', 'compact'],
  },
  {
    id: 'europass',
    name: 'Europass',
    description: 'Standard EU institutional format. Expected by public sector and academic roles.',
    columns: 1,
    ats: { workday: 'pass', taleo: 'pass', sap: 'pass', greenhouse: 'pass', lever: 'pass' },
    tags: ['ats-safe', 'eu-a4'],
    badge: 'eu-recommended',
  },
  {
    id: 'senior_ic',
    name: 'Senior IC',
    description: 'Achievement-focused. Designed for leads and senior ICs running 5–10+ year histories.',
    columns: 1,
    ats: { workday: 'pass', taleo: 'pass', sap: 'pass', greenhouse: 'pass', lever: 'pass' },
    tags: ['ats-safe', 'eu-a4'],
  },
  {
    id: 'modern_tech',
    name: 'Modern Tech',
    description: 'Two-column sidebar layout. Visually distinct — best for Greenhouse and Lever.',
    columns: 2,
    ats: { workday: 'warn', taleo: 'warn', sap: 'warn', greenhouse: 'pass', lever: 'pass' },
    tags: ['compact'],
  },
]

const ATS_LABELS: Record<ATSSystemKey, string> = {
  workday: 'Workday',
  taleo: 'Taleo',
  sap: 'SAP',
  greenhouse: 'Greenhouse',
  lever: 'Lever',
}

// ─── Template thumbnail wireframes ───────────────────────────────────────────

function GalleryThumbnail({ templateId }: { templateId: TemplateId }) {
  const base = 'w-full h-[140px] rounded-lg overflow-hidden bg-gray-50 border border-gray-100 p-3'

  if (templateId === 'modern_tech') {
    return (
      <div className={cn(base, 'flex gap-2')}>
        <div className="w-[38%] flex flex-col gap-1.5">
          <div className="w-8 h-8 rounded-full bg-gray-200 mx-auto" />
          <div className="h-1.5 bg-gray-300 rounded-sm w-3/4 mx-auto" />
          <div className="mt-1 space-y-1">
            <div className="h-1 bg-gray-200 rounded-sm w-full" />
            <div className="h-1 bg-gray-200 rounded-sm w-4/5" />
            <div className="h-1 bg-gray-200 rounded-sm w-full" />
            <div className="h-1 bg-gray-200 rounded-sm w-3/4" />
          </div>
        </div>
        <div className="w-px bg-gray-200 self-stretch" />
        <div className="flex-1 flex flex-col gap-1.5">
          <div className="h-2 bg-gray-300 rounded-sm w-3/4" />
          <div className="space-y-1">
            <div className="h-1.5 bg-gray-300 rounded-sm w-1/2" />
            <div className="h-1 bg-gray-200 rounded-sm w-full" />
            <div className="h-1 bg-gray-200 rounded-sm w-5/6" />
            <div className="h-1 bg-gray-200 rounded-sm w-full" />
          </div>
          <div className="space-y-1 mt-1">
            <div className="h-1.5 bg-gray-300 rounded-sm w-1/2" />
            <div className="h-1 bg-gray-200 rounded-sm w-full" />
            <div className="h-1 bg-gray-200 rounded-sm w-2/3" />
          </div>
        </div>
      </div>
    )
  }

  if (templateId === 'europass') {
    return (
      <div className={cn(base, 'flex flex-col gap-2')}>
        <div className="h-8 bg-blue-100 rounded-md flex items-center px-2 gap-2">
          <div className="w-5 h-5 rounded-full bg-blue-200 flex-shrink-0" />
          <div className="flex-1 space-y-1">
            <div className="h-1.5 bg-blue-200 rounded-sm w-2/3" />
            <div className="h-1 bg-blue-100 rounded-sm w-1/2" />
          </div>
        </div>
        <div className="space-y-1.5">
          <div className="flex items-center gap-1.5">
            <div className="h-1 w-6 bg-blue-300 rounded-sm flex-shrink-0" />
            <div className="h-1.5 bg-gray-300 rounded-sm flex-1" />
          </div>
          <div className="h-1 bg-gray-200 rounded-sm w-full" />
          <div className="h-1 bg-gray-200 rounded-sm w-5/6" />
          <div className="flex items-center gap-1.5 mt-1">
            <div className="h-1 w-6 bg-blue-300 rounded-sm flex-shrink-0" />
            <div className="h-1.5 bg-gray-300 rounded-sm flex-1" />
          </div>
          <div className="h-1 bg-gray-200 rounded-sm w-full" />
          <div className="h-1 bg-gray-200 rounded-sm w-3/4" />
        </div>
      </div>
    )
  }

  if (templateId === 'compact_eu') {
    return (
      <div className={cn(base, 'flex flex-col gap-1.5')}>
        <div className="flex items-center justify-between gap-2">
          <div className="h-2.5 bg-gray-800 rounded-sm w-2/5" />
          <div className="flex gap-1">
            <div className="h-1 bg-gray-200 rounded-sm w-10" />
            <div className="h-1 bg-gray-200 rounded-sm w-8" />
          </div>
        </div>
        <div className="h-px bg-gray-300 w-full" />
        <div className="grid grid-cols-2 gap-2">
          <div className="space-y-1">
            <div className="h-1.5 bg-gray-300 rounded-sm w-3/4" />
            <div className="h-1 bg-gray-200 rounded-sm w-full" />
            <div className="h-1 bg-gray-200 rounded-sm w-4/5" />
            <div className="h-1 bg-gray-200 rounded-sm w-full" />
          </div>
          <div className="space-y-1">
            <div className="h-1.5 bg-gray-300 rounded-sm w-3/4" />
            <div className="h-1 bg-gray-200 rounded-sm w-full" />
            <div className="h-1 bg-gray-200 rounded-sm w-2/3" />
            <div className="h-1 bg-gray-200 rounded-sm w-full" />
          </div>
        </div>
        <div className="h-px bg-gray-200 w-full" />
        <div className="grid grid-cols-2 gap-2">
          <div className="space-y-1">
            <div className="h-1.5 bg-gray-300 rounded-sm w-2/3" />
            <div className="h-1 bg-gray-200 rounded-sm w-full" />
          </div>
          <div className="space-y-1">
            <div className="h-1.5 bg-gray-300 rounded-sm w-2/3" />
            <div className="h-1 bg-gray-200 rounded-sm w-3/4" />
          </div>
        </div>
      </div>
    )
  }

  if (templateId === 'senior_ic') {
    return (
      <div className={cn(base, 'flex flex-col gap-2')}>
        <div>
          <div className="h-2.5 bg-gray-800 rounded-sm w-2/5" />
          <div className="h-1 bg-gray-400 rounded-sm w-3/5 mt-1" />
        </div>
        <div className="h-px bg-gray-200 w-full" />
        <div className="space-y-1.5">
          <div className="h-1.5 bg-gray-300 rounded-sm w-1/4" />
          <div className="pl-2 space-y-1 border-l-2 border-gray-200">
            <div className="h-1 bg-gray-200 rounded-sm w-full" />
            <div className="h-1 bg-gray-200 rounded-sm w-full" />
            <div className="h-1 bg-gray-200 rounded-sm w-4/5" />
          </div>
          <div className="h-1.5 bg-gray-300 rounded-sm w-1/4" />
          <div className="pl-2 space-y-1 border-l-2 border-gray-200">
            <div className="h-1 bg-gray-200 rounded-sm w-full" />
            <div className="h-1 bg-gray-200 rounded-sm w-3/4" />
          </div>
        </div>
      </div>
    )
  }

  // Precision (default)
  return (
    <div className={cn(base, 'flex flex-col gap-2')}>
      <div className="flex items-center justify-between">
        <div className="h-2.5 bg-gray-800 rounded-sm w-2/5" />
        <div className="h-1.5 bg-gray-300 rounded-sm w-1/4" />
      </div>
      <div className="h-px bg-gray-200 w-full" />
      <div className="space-y-1.5">
        <div className="h-1.5 bg-gray-300 rounded-sm w-1/3" />
        <div className="h-1 bg-gray-200 rounded-sm w-full" />
        <div className="h-1 bg-gray-200 rounded-sm w-5/6" />
        <div className="h-1 bg-gray-200 rounded-sm w-full" />
        <div className="h-1.5 bg-gray-300 rounded-sm w-1/3 mt-0.5" />
        <div className="h-1 bg-gray-200 rounded-sm w-full" />
        <div className="h-1 bg-gray-200 rounded-sm w-2/3" />
      </div>
    </div>
  )
}

// ─── Template card ────────────────────────────────────────────────────────────

function TemplateCard({
  template,
  selected,
  onSelect,
}: {
  template: TemplateConfig
  selected: boolean
  onSelect: (id: TemplateId) => void
}) {
  const passes = Object.entries(template.ats)
    .filter(([, v]) => v === 'pass')
    .map(([k]) => ATS_LABELS[k as ATSSystemKey])

  const warns = Object.entries(template.ats)
    .filter(([, v]) => v === 'warn')
    .map(([k]) => ATS_LABELS[k as ATSSystemKey])

  return (
    <div
      className={cn(
        'group relative rounded-xl border bg-[var(--jf-bg-card)] flex flex-col cursor-pointer transition-all hover:shadow-md',
        selected ? 'border-2 border-[var(--jf-interactive)] shadow-md' : 'border border-[var(--jf-border)] hover:border-[var(--jf-border-hover)]'
      )}
      onClick={() => onSelect(template.id)}
    >
      {/* Badge */}
      {template.badge && (
        <div className="absolute top-3 right-3 z-10">
          <span
            className={cn(
              'text-xs px-2 py-0.5 rounded-full font-semibold',
              template.badge === 'popular'
                ? 'bg-[var(--jf-interactive)] text-white'
                : 'bg-[var(--jf-success)] text-white'
            )}
          >
            {template.badge === 'popular' ? 'Popular' : 'EU recommended'}
          </span>
        </div>
      )}

      {/* Thumbnail */}
      <div className="p-4 pb-0">
        <GalleryThumbnail templateId={template.id} />
      </div>

      {/* Info */}
      <div className="p-4 flex flex-col gap-3 flex-1">
        <div>
          <h3 className="font-semibold text-[var(--jf-text-primary)] text-sm">{template.name}</h3>
          <p className="text-xs text-[var(--jf-text-secondary)] mt-0.5 leading-relaxed">{template.description}</p>
        </div>

        {/* ATS compatibility chips */}
        <div className="flex flex-wrap gap-1">
          {passes.map((sys) => (
            <span
              key={sys}
              className="inline-flex items-center gap-0.5 text-xs text-[var(--jf-success)] bg-[var(--jf-success-tint)] border border-[var(--jf-success-border)] px-1.5 py-0.5 rounded-full"
            >
              <CheckCircle className="w-3 h-3" />
              {sys}
            </span>
          ))}
          {warns.map((sys) => (
            <span
              key={sys}
              className="inline-flex items-center gap-0.5 text-xs text-[var(--jf-warning)] bg-[var(--jf-warning-tint)] border border-[var(--jf-warning-border)] px-1.5 py-0.5 rounded-full"
            >
              <AlertCircle className="w-3 h-3" />
              {sys}
            </span>
          ))}
        </div>

        <div className="mt-auto pt-2">
          <Button
            size="sm"
            variant={selected ? 'default' : 'outline'}
            className="w-full"
            onClick={(e) => { e.stopPropagation(); onSelect(template.id) }}
          >
            {selected ? '✓ Selected' : `Use ${template.name} →`}
          </Button>
        </div>
      </div>
    </div>
  )
}

// ─── Gallery ──────────────────────────────────────────────────────────────────

export function TemplateGallery() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const versionId = searchParams.get('version_id')

  const [selectedId, setSelectedId] = useState<TemplateId | null>(null)
  const [namingOpen, setNamingOpen] = useState(false)
  const [resumeName, setResumeName] = useState('')

  const createMutation = useCreateCVVersion()
  const updateMutation = useUpdateCVVersion()

  const now = new Date()
  const monthYear = now.toLocaleDateString('en-GB', { month: 'short', year: 'numeric' })

  async function handleSelectTemplate(id: TemplateId) {
    setSelectedId(id)

    // Upload flow: version already exists — just update it with the chosen template
    if (versionId) {
      await updateMutation.mutateAsync({ id: versionId, input: { template_id: id } })
      router.push(`/cv-versions/${versionId}/edit`)
      return
    }

    // Build-from-template flow: open naming dialog
    const tpl = TEMPLATES.find((t) => t.id === id)
    setResumeName(`${tpl?.name ?? 'My Resume'} – ${monthYear}`)
    setNamingOpen(true)
  }

  async function handleCreate() {
    if (!selectedId || !resumeName.trim()) return
    const version = await createMutation.mutateAsync({
      name: resumeName.trim(),
      template_id: selectedId,
    })
    router.push(`/cv-versions/${version.id}/edit`)
  }

  return (
    <div className="flex flex-col gap-6">
      {/* Template grid */}
      <div className="grid gap-5 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
        {TEMPLATES.map((tpl) => (
          <TemplateCard
            key={tpl.id}
            template={tpl}
            selected={selectedId === tpl.id}
            onSelect={handleSelectTemplate}
          />
        ))}
      </div>

      {/* Naming modal */}
      <Dialog open={namingOpen} onOpenChange={setNamingOpen}>
        <DialogContent size="sm">
          <DialogHeader>
            <DialogTitle>Name your resume</DialogTitle>
            <DialogDescription>
              Give it a name you&apos;ll recognise — you can always rename it later.
            </DialogDescription>
          </DialogHeader>
          <input
            type="text"
            value={resumeName}
            onChange={(e) => setResumeName(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && !createMutation.isPending && handleCreate()}
            placeholder={`e.g. Precision – ${monthYear}`}
            className="w-full rounded-md border border-[var(--jf-border)] bg-[var(--jf-bg-card)] text-[var(--jf-text-primary)] px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[var(--jf-interactive)]"
            autoFocus
          />
          {(createMutation.error ?? updateMutation.error) && (
            <p className="text-xs text-[var(--jf-error)]">{(createMutation.error ?? updateMutation.error)?.message}</p>
          )}
          <DialogFooter>
            <Button variant="ghost" onClick={() => setNamingOpen(false)}>
              Cancel
            </Button>
            <Button
              onClick={handleCreate}
              disabled={!resumeName.trim() || createMutation.isPending}
            >
              {createMutation.isPending ? 'Creating…' : 'Create resume'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
