'use client'

import { Input } from '@/components/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'

interface FilterBarProps {
  search: string
  priority: string
  onSearchChange: (v: string) => void
  onPriorityChange: (v: string) => void
  totalCount: number
}

export function FilterBar({ search, priority, onSearchChange, onPriorityChange, totalCount }: FilterBarProps) {
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
      <span className="text-xs text-gray-400 ml-auto">{totalCount} application{totalCount !== 1 ? 's' : ''}</span>
    </div>
  )
}
