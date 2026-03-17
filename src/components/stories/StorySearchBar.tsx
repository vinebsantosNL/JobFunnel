'use client'

import { Input } from '@/components/ui/input'
import { ALL_COMPETENCIES } from '@/lib/competencies'

interface StorySearchBarProps {
  search: string
  competencyFilter: string | undefined
  onChange: (search: string, competency: string | undefined) => void
}

const FILTER_COMPETENCIES = ALL_COMPETENCIES.slice(0, 8)

export function StorySearchBar({ search, competencyFilter, onChange }: StorySearchBarProps) {
  return (
    <div className="space-y-3">
      <Input
        placeholder="Search stories..."
        value={search}
        onChange={e => onChange(e.target.value, competencyFilter)}
        className="max-w-xs"
      />
      <div className="flex gap-2 flex-wrap">
        <button
          onClick={() => onChange(search, undefined)}
          className={`px-3 py-1 rounded-full text-xs border transition-colors ${
            !competencyFilter
              ? 'bg-blue-600 text-white border-blue-600'
              : 'bg-white text-gray-600 border-gray-200 hover:border-gray-300'
          }`}
        >
          All
        </button>
        {FILTER_COMPETENCIES.map(c => (
          <button
            key={c}
            onClick={() => onChange(search, competencyFilter === c ? undefined : c)}
            className={`px-3 py-1 rounded-full text-xs border transition-colors ${
              competencyFilter === c
                ? 'bg-blue-600 text-white border-blue-600'
                : 'bg-white text-gray-600 border-gray-200 hover:border-gray-300'
            }`}
          >
            {c}
          </button>
        ))}
      </div>
    </div>
  )
}
