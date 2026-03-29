'use client'

import { COMPETENCY_CATEGORIES } from '@/lib/competencies'

interface CompetencyPickerProps {
  selected: string[]
  onChange: (selected: string[]) => void
}

export function CompetencyPicker({ selected, onChange }: CompetencyPickerProps) {
  function toggle(competency: string) {
    if (selected.includes(competency)) {
      onChange(selected.filter(c => c !== competency))
    } else {
      onChange([...selected, competency])
    }
  }

  return (
    <div className="space-y-3">
      {Object.entries(COMPETENCY_CATEGORIES).map(([category, competencies]) => (
        <div key={category}>
          <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-1.5">{category}</p>
          <div className="flex flex-wrap gap-1.5">
            {competencies.map(competency => (
              <button
                key={competency}
                type="button"
                onClick={() => toggle(competency)}
                className={`px-2.5 py-1 rounded-full text-xs border transition-colors ${
                  selected.includes(competency)
                    ? 'bg-[var(--jf-interactive)] text-white border-[var(--jf-interactive)]'
                    : 'bg-card text-muted-foreground border-border hover:border-primary/50'
                }`}
              >
                {competency}
              </button>
            ))}
          </div>
        </div>
      ))}
    </div>
  )
}
