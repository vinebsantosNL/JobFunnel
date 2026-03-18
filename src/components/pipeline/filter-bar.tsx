'use client'

import { Input } from '@/components/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { useCVVersions } from '@/hooks/useCVVersions'

interface FilterBarProps {
  search: string
  priority: string
  cvVersionIds: string[] // selected cv version ids; empty array = no filter; ['__untagged__'] = untagged only
  onSearchChange: (v: string) => void
  onPriorityChange: (v: string) => void
  onCVVersionChange: (ids: string[]) => void
  totalCount: number
}

export function FilterBar({
  search,
  priority,
  cvVersionIds,
  onSearchChange,
  onPriorityChange,
  onCVVersionChange,
  totalCount,
}: FilterBarProps) {
  const { data: versions = [] } = useCVVersions(false)
  const activeVersions = versions.filter((v) => !v.is_archived)

  // Derive a single display value for the Select (simple single-select for composability)
  // '__all__' means no filter; '__untagged__' means only untagged; a uuid means filter by that version
  const selectValue =
    cvVersionIds.length === 0
      ? '__all__'
      : cvVersionIds[0]

  function handleCVVersionSelect(v: string | null) {
    if (!v || v === '__all__') {
      onCVVersionChange([])
    } else {
      onCVVersionChange([v])
    }
  }

  return (
    <div className="flex items-center gap-3 flex-wrap">
      <Input
        placeholder="Search company or title..."
        value={search}
        onChange={e => onSearchChange(e.target.value)}
        className="max-w-xs h-9 text-sm"
      />
      <Select value={priority} onValueChange={(v) => onPriorityChange(v ?? 'all')}>
        <SelectTrigger className="w-36 h-9 text-sm">
          <SelectValue placeholder="All priorities" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">All priorities</SelectItem>
          <SelectItem value="high">High</SelectItem>
          <SelectItem value="medium">Medium</SelectItem>
          <SelectItem value="low">Low</SelectItem>
        </SelectContent>
      </Select>

      {activeVersions.length > 0 && (
        <Select value={selectValue} onValueChange={handleCVVersionSelect}>
          <SelectTrigger className="w-44 h-9 text-sm">
            <SelectValue placeholder="CV Version" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="__all__">All CV versions</SelectItem>
            <SelectItem value="__untagged__">Untagged</SelectItem>
            {activeVersions.map((v) => (
              <SelectItem key={v.id} value={v.id}>
                {v.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      )}

      <span className="text-xs text-gray-400 ml-auto">{totalCount} application{totalCount !== 1 ? 's' : ''}</span>
    </div>
  )
}
