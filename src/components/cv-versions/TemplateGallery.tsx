'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { ArrowLeft, CheckCircle, AlertCircle } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog'
import { useCreateCVVersion } from '@/hooks/useCVVersions'
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

type FilterPill = 'all' | 'ats-safe' | 'eu-a4' | 'compact'

const FILTER_LABELS: Record<FilterPill, string> = {
  all: 'All',
  'ats-safe': 'ATS-Safe',
  'eu-a4': 'EU / A4',
  compact: 'Compact',
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
        'group relative rounded-xl border bg-white flex flex-col cursor-pointer transition-all hover:shadow-md',
        selected ? 'border-2 border-blue-500 shadow-md' : 'border border-gray-200 hover:border-gray-300'
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
                ? 'bg-blue-600 text-white'
                : 'bg-green-600 text-white'
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
          <h3 className="font-semibold text-gray-900 text-sm">{template.name}</h3>
          <p className="text-xs text-gray-500 mt-0.5 leading-relaxed">{template.description}</p>
        </div>

        {/* ATS compatibility chips */}
        <div className="flex flex-wrap gap-1">
          {passes.map((sys) => (
            <span
              key={sys}
              className="inline-flex items-center gap-0.5 text-xs text-green-700 bg-green-50 border border-green-200 px-1.5 py-0.5 rounded-full"
            >
              <CheckCircle className="w-3 h-3" />
              {sys}
            </span>
          ))}
          {warns.map((sys) => (
            <span
              key={sys}
              className="inline-flex items-center gap-0.5 text-xs text-amber-700 bg-amber-50 border border-amber-200 px-1.5 py-0.5 rounded-full"
            >
              <AlertCircle className="w-3 h-3" />
              {sys}
            </span>
          ))}
        </div>

        {/* Hover CTA */}
        <div className="mt-auto pt-2 opacity-0 group-hover:opacity-100 sm:transition-opacity">
          <Button
            size="sm"
            className="w-full"
            onClick={(e) => { e.stopPropagation(); onSelect(template.id) }}
          >
            Use {template.name} →
          </Button>
        </div>
        {/* Mobile: always visible */}
        <div className="sm:hidden">
          <Button size="sm" variant={selected ? 'default' : 'outline'} className="w-full">
            {selected ? '✓ Selected' : `Use ${template.name}`}
          </Button>
        </div>
      </div>
    </div>
  )
}

// ─── Gallery ──────────────────────────────────────────────────────────────────

export function TemplateGallery() {
  const router = useRouter()
  const [activeFilter, setActiveFilter] = useState<FilterPill>('all')
  const [selectedId, setSelectedId] = useState<TemplateId | null>(null)
  const [namingOpen, setNamingOpen] = useState(false)
  const [resumeName, setResumeName] = useState('')

  const createMutation = useCreateCVVersion()

  const now = new Date()
  const monthYear = now.toLocaleDateString('en-GB', { month: 'short', year: 'numeric' })

  const filtered =
    activeFilter === 'all'
      ? TEMPLATES
      : TEMPLATES.filter((t) => t.tags.includes(activeFilter as 'ats-safe' | 'eu-a4' | 'compact'))

  function handleSelectTemplate(id: TemplateId) {
    setSelectedId(id)
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
    router.push(`/app/cv-versions/${version.id}/edit`)
  }

  return (
    <div className="flex flex-col gap-6">
      {/* Back + heading */}
      <div className="flex items-center gap-3">
        <button
          onClick={() => router.back()}
          className="p-2 rounded-lg text-gray-500 hover:text-gray-800 hover:bg-gray-100 transition-colors"
          aria-label="Back"
        >
          <ArrowLeft className="w-4 h-4" />
        </button>
        <div>
          <h2 className="text-lg font-bold text-gray-900">Choose a template</h2>
          <p className="text-sm text-gray-500">All templates are ATS-optimised for European job applications.</p>
        </div>
      </div>

      {/* Filter pills */}
      <div className="flex items-center gap-2 flex-wrap">
        {(Object.keys(FILTER_LABELS) as FilterPill[]).map((pill) => (
          <button
            key={pill}
            onClick={() => setActiveFilter(pill)}
            className={cn(
              'px-3 py-1.5 rounded-full text-sm font-medium transition-colors',
              activeFilter === pill
                ? 'bg-blue-600 text-white'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            )}
          >
            {FILTER_LABELS[pill]}
          </button>
        ))}
      </div>

      {/* Template grid */}
      <div className="grid gap-5 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
        {filtered.map((tpl) => (
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
            className="w-full rounded-md border border-gray-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            autoFocus
          />
          {createMutation.error && (
            <p className="text-xs text-red-500">{createMutation.error.message}</p>
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
