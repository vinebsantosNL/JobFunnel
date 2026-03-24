'use client'

import { Search, Plus } from 'lucide-react'
import { Input } from '@/components/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
} from '@/components/ui/select'
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip'
import { useCVVersions } from '@/hooks/useCVVersions'

interface FilterBarProps {
  search: string
  priority: string
  cvVersionIds: string[]
  onSearchChange: (v: string) => void
  onPriorityChange: (v: string) => void
  onCVVersionChange: (ids: string[]) => void
  activeCount: number
  onOpenAddModal?: () => void
}

export function FilterBar({
  search,
  priority,
  cvVersionIds,
  onSearchChange,
  onPriorityChange,
  onCVVersionChange,
  activeCount,
  onOpenAddModal,
}: FilterBarProps) {
  const { data: versions = [] } = useCVVersions(false)
  const activeVersions = versions.filter((v) => !v.is_archived)

  const cvSelectValue = cvVersionIds.length === 0 ? '__all__' : cvVersionIds[0]
  const selectedResume = activeVersions.find((v) => v.id === cvSelectValue)

  function handleCVVersionSelect(v: string | null) {
    if (!v || v === '__all__') {
      onCVVersionChange([])
    } else {
      onCVVersionChange([v])
    }
  }

  const priorityLabel =
    priority === 'all'
      ? 'Priority'
      : `Priority: ${priority.charAt(0).toUpperCase() + priority.slice(1)}`

  let resumeLabel = 'Resumes'
  if (cvSelectValue === '__untagged__') {
    resumeLabel = 'Resume: Untagged'
  } else if (selectedResume) {
    resumeLabel = `Resume: ${selectedResume.name.length > 12 ? selectedResume.name.slice(0, 12) + '\u2026' : selectedResume.name}`
  }

  return (
    <div className="flex items-center gap-2.5 flex-wrap">
      <div className="relative min-w-[200px] max-w-[240px]">
        <Search
          aria-hidden="true"
          className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground"
          style={{ width: 14, height: 14 }}
        />
        <Input
          placeholder="Search company or title..."
          value={search}
          onChange={(e) => onSearchChange(e.target.value)}
          className="h-9 text-sm pl-9"
        />
      </div>

      <Select value={priority} onValueChange={(v) => onPriorityChange(v ?? 'all')}>
        <SelectTrigger className="w-40 h-9 text-sm">
          <span className={priority !== 'all' ? 'text-primary font-medium' : 'text-muted-foreground'}>
            {priorityLabel}
          </span>
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">All priorities</SelectItem>
          <SelectItem value="high">High</SelectItem>
          <SelectItem value="medium">Medium</SelectItem>
          <SelectItem value="low">Low</SelectItem>
        </SelectContent>
      </Select>

      {activeVersions.length > 0 && (
        <Select value={cvSelectValue} onValueChange={handleCVVersionSelect}>
          <SelectTrigger className="w-44 h-9 text-sm">
            <span className={cvSelectValue !== '__all__' ? 'text-primary font-medium' : 'text-muted-foreground'}>
              {resumeLabel}
            </span>
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="__all__">All resumes</SelectItem>
            <SelectItem value="__untagged__">Untagged</SelectItem>
            {activeVersions.map((v) => (
              <SelectItem key={v.id} value={v.id}>
                {v.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      )}

      <TooltipProvider delay={300}>
        <Tooltip>
          <TooltipTrigger
            render={
              <span className="text-xs text-muted-foreground ml-auto cursor-default" />
            }
          >
            {activeCount} active application{activeCount !== 1 ? 's' : ''}
          </TooltipTrigger>
          <TooltipContent side="bottom">
            Active: Applied, Screening, Interviewing &amp; Offer
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>

      <button
        type="button"
        onClick={() => onOpenAddModal?.()}
        className="flex items-center gap-1.5 ml-auto text-white transition-colors"
        style={{
          padding: '8px 16px',
          minHeight: 44,
          borderRadius: 12,
          background: 'var(--jf-interactive)',
          fontSize: 13,
          fontWeight: 600,
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.background = 'var(--jf-interactive-hover)'
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.background = 'var(--jf-interactive)'
        }}
      >
        <Plus aria-hidden="true" style={{ width: 14, height: 14 }} />
        Add Application
      </button>
    </div>
  )
}
