'use client'

import { useState } from 'react'
import { FileText, Lock, Plus } from 'lucide-react'
import { useQuery } from '@tanstack/react-query'
import { useCVVersions } from '@/hooks/useCVVersions'
import { CVVersionCard } from './CVVersionCard'
import { Button } from '@/components/ui/button'
import { CreateCVVersionModal } from './CreateCVVersionModal'
import type { CVComparisonRow } from '@/lib/services/analyticsService'

type FilterTab = 'all' | 'active' | 'archived'

async function fetchCVComparison(): Promise<CVComparisonRow[]> {
  const res = await fetch('/api/analytics/cv-comparison')
  if (!res.ok) return []
  return res.json()
}

const TABS: { key: FilterTab; label: string }[] = [
  { key: 'active', label: 'Active' },
  { key: 'all', label: 'All' },
  { key: 'archived', label: 'Archived' },
]

export function CVVersionList() {
  const [filter, setFilter] = useState<FilterTab>('active')
  const [createOpen, setCreateOpen] = useState(false)

  const { data: allVersions, isLoading } = useCVVersions(true)

  const { data: comparisonRows } = useQuery({
    queryKey: ['cv-comparison-list'],
    queryFn: fetchCVComparison,
  })

  // Stats lookup by version_id
  const statsMap: Record<string, CVComparisonRow> = {}
  for (const row of comparisonRows ?? []) {
    if (row.version_id) statsMap[row.version_id] = row
  }

  const active = (allVersions ?? []).filter((v) => !v.is_archived)
  const archived = (allVersions ?? []).filter((v) => v.is_archived)

  const counts: Record<FilterTab, number> = {
    active: active.length,
    all: (allVersions ?? []).length,
    archived: archived.length,
  }

  const displayVersions =
    filter === 'all'
      ? (allVersions ?? [])
      : filter === 'active'
      ? active
      : archived

  if (isLoading) {
    return (
      <div className="flex flex-col gap-5">
        <div className="flex items-center justify-between gap-3">
          <div className="flex gap-1.5">
            {TABS.map((t) => (
              <div key={t.key} className="h-8 w-20 rounded-lg animate-pulse" style={{ background: 'var(--jf-bg-subtle)' }} />
            ))}
          </div>
          <div className="h-9 w-36 rounded-lg animate-pulse" style={{ background: 'var(--jf-bg-subtle)' }} />
        </div>
        <div className="grid gap-[14px] grid-cols-1 sm:grid-cols-2">
          {[1, 2].map((n) => (
            <div key={n} className="h-64 rounded-[16px] animate-pulse" style={{ background: 'var(--jf-bg-subtle)' }} />
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-5">
      {/* ─── Toolbar: filters + action ───────────────────────────────────── */}
      <div className="flex items-center justify-between gap-3">
        <div
          className="flex gap-1 w-fit rounded-lg p-1"
          role="tablist"
          aria-label="Filter CV versions"
          style={{ background: 'var(--jf-bg-subtle)' }}
        >
          {TABS.map(({ key, label }) => (
            <button
              key={key}
              role="tab"
              aria-selected={filter === key}
              onClick={() => setFilter(key)}
              className="flex items-center gap-1.5 rounded-md px-3 py-1.5 text-sm font-semibold transition-all"
              style={
                filter === key
                  ? {
                      background: 'var(--jf-bg-card)',
                      color: 'var(--jf-text-primary)',
                      border: '1px solid var(--jf-border)',
                      boxShadow: 'var(--jf-shadow-sm)',
                    }
                  : {
                      background: 'transparent',
                      color: 'var(--jf-text-secondary)',
                      border: '1px solid transparent',
                    }
              }
            >
              {label}
              <span
                className="rounded text-[10px] font-medium px-1 py-0"
                style={
                  filter === key
                    ? { background: 'var(--jf-bg-subtle)', color: 'var(--jf-text-secondary)', fontFamily: 'var(--font-dm-mono, monospace)' }
                    : { background: 'var(--jf-border)', color: 'var(--jf-text-muted)', fontFamily: 'var(--font-dm-mono, monospace)' }
                }
              >
                {counts[key]}
              </span>
            </button>
          ))}
        </div>

        <Button onClick={() => setCreateOpen(true)}>
          <Plus className="mr-1.5 h-4 w-4" />
          New CV version
        </Button>
      </div>

      {/* ─── CV Cards Grid ───────────────────────────────────────────────── */}
      {displayVersions.length === 0 ? (
        <EmptyState filter={filter} onNew={() => setCreateOpen(true)} />
      ) : (
        <div className="grid gap-[14px] grid-cols-1 sm:grid-cols-2">
          {displayVersions.map((version, idx) => (
            <CVVersionCard
              key={version.id}
              version={version}
              stats={statsMap[version.id]}
              index={idx}
            />
          ))}
        </div>
      )}
      <CreateCVVersionModal open={createOpen} onOpenChange={setCreateOpen} />
    </div>
  )
}

// ─── Empty state ───────────────────────────────────────────────────────────────

function EmptyState({ filter, onNew }: { filter: FilterTab; onNew: () => void }) {
  if (filter === 'archived') {
    return (
      <div
        className="flex flex-col items-center justify-center rounded-xl border border-dashed py-16 text-center"
        style={{ borderColor: 'var(--jf-border)' }}
      >
        <div
          className="w-12 h-12 rounded-2xl flex items-center justify-center mb-4"
          style={{ background: 'var(--jf-bg-subtle)' }}
        >
          <Lock className="w-5 h-5" style={{ color: 'var(--jf-text-muted)' }} strokeWidth={1.5} />
        </div>
        <p className="font-semibold mb-1" style={{ color: 'var(--jf-text-primary)' }}>No archived CV versions</p>
        <p className="text-sm" style={{ color: 'var(--jf-text-muted)' }}>Archived versions will appear here.</p>
      </div>
    )
  }

  return (
    <div
      className="flex flex-col items-center justify-center rounded-xl border border-dashed py-16 text-center"
      style={{ borderColor: 'var(--jf-border)' }}
    >
      <div
        className="w-12 h-12 rounded-2xl flex items-center justify-center mb-4"
        style={{ background: 'var(--jf-bg-subtle)' }}
      >
        <FileText className="w-6 h-6" style={{ color: 'var(--jf-text-muted)' }} strokeWidth={1.5} />
      </div>
      <p className="font-semibold mb-1" style={{ color: 'var(--jf-text-primary)' }}>Your CV library is empty</p>
      <p className="text-sm mb-5 max-w-xs" style={{ color: 'var(--jf-text-secondary)' }}>
        Upload your CV or build from a template. Assign versions to applications to see which one gets you more interviews.
      </p>
      <Button onClick={onNew}>Create first CV version</Button>
    </div>
  )
}
