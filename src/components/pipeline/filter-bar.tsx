'use client'

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
}

export function FilterBar({
  search,
  priority,
  cvVersionIds,
  onSearchChange,
  onPriorityChange,
  onCVVersionChange,
  activeCount,
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
    resumeLabel = `Resume: ${selectedResume.name.length > 12 ? selectedResume.name.slice(0, 12) + '…' : selectedResume.name}`
  }

  return (
    <div className="flex items-center gap-3 flex-wrap">
      <Input
        placeholder="Search company or title..."
        value={search}
        onChange={(e) => onSearchChange(e.target.value)}
        className="max-w-xs h-8 text-sm"
      />

      <Select value={priority} onValueChange={(v) => onPriorityChange(v ?? 'all')}>
        <SelectTrigger className="w-40 h-8 text-sm">
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
          <SelectTrigger className="w-44 h-8 text-sm">
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
    </div>
  )
}
