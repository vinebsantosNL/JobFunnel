'use client'

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

  function handleCVVersionSelect(e: React.ChangeEvent<HTMLSelectElement>) {
    const v = e.target.value
    if (!v || v === '__all__') {
      onCVVersionChange([])
    } else {
      onCVVersionChange([v])
    }
  }

  return (
    <div
      style={{
        padding: '14px 24px',
        borderBottom: '1px solid var(--jf-border)',
        background: 'var(--jf-bg-card)',
        display: 'flex',
        alignItems: 'center',
        gap: 10,
        flexShrink: 0,
      }}
    >
      {/* Search input */}
      <div className="relative" style={{ minWidth: 180 }}>
        <svg
          aria-hidden="true"
          viewBox="0 0 20 20"
          fill="currentColor"
          className="absolute"
          style={{
            left: 10,
            top: '50%',
            transform: 'translateY(-50%)',
            width: 16,
            height: 16,
            color: 'var(--jf-text-muted)',
          }}
        >
          <path
            fillRule="evenodd"
            d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z"
            clipRule="evenodd"
          />
        </svg>
        <input
          type="text"
          placeholder="Search applications..."
          value={search}
          onChange={(e) => onSearchChange(e.target.value)}
          style={{
            border: '1px solid var(--jf-border)',
            borderRadius: 8,
            padding: '7px 10px 7px 32px',
            fontSize: 13,
            minWidth: 180,
            color: 'var(--jf-text-primary)',
            background: 'var(--jf-bg-card)',
            outline: 'none',
            width: '100%',
          }}
          onFocus={(e) => {
            e.currentTarget.style.borderColor = 'var(--jf-interactive)'
            e.currentTarget.style.boxShadow = '0 0 0 3px rgba(37,99,235,0.1)'
          }}
          onBlur={(e) => {
            e.currentTarget.style.borderColor = 'var(--jf-border)'
            e.currentTarget.style.boxShadow = 'none'
          }}
        />
      </div>

      {/* Priority filter — dropdown */}
      <div className="relative">
        <div
          style={{
            border: '1px solid var(--jf-border)',
            borderRadius: 8,
            padding: '7px 12px',
            fontSize: 12,
            fontWeight: 500,
            color: priority !== 'all' ? 'var(--jf-interactive)' : 'var(--jf-text-secondary)',
            background: 'transparent',
            display: 'flex',
            alignItems: 'center',
            gap: 6,
            cursor: 'pointer',
            position: 'relative',
          }}
        >
          <svg
            aria-hidden="true"
            viewBox="0 0 20 20"
            fill="currentColor"
            style={{ width: 14, height: 14, flexShrink: 0 }}
          >
            <path
              fillRule="evenodd"
              d="M3 3a1 1 0 011-1h12a1 1 0 011 1v3a1 1 0 01-.293.707L12 11.414V15a1 1 0 01-.293.707l-2 2A1 1 0 018 17v-5.586L3.293 6.707A1 1 0 013 6V3z"
              clipRule="evenodd"
            />
          </svg>
          <select
            value={priority}
            onChange={(e) => onPriorityChange(e.target.value)}
            style={{
              position: 'absolute',
              inset: 0,
              opacity: 0,
              cursor: 'pointer',
              width: '100%',
            }}
            aria-label="Priority filter"
          >
            <option value="all">All priorities</option>
            <option value="high">High</option>
            <option value="medium">Medium</option>
            <option value="low">Low</option>
          </select>
          {priority === 'all' ? 'Priority' : `Priority: ${priority.charAt(0).toUpperCase() + priority.slice(1)}`}
        </div>
      </div>

      {/* CV Version button */}
      {activeVersions.length > 0 && (
        <div className="relative">
          <div
            style={{
              border: '1px solid var(--jf-border)',
              borderRadius: 8,
              padding: '7px 12px',
              fontSize: 12,
              fontWeight: 500,
              color: cvSelectValue !== '__all__' ? 'var(--jf-interactive)' : 'var(--jf-text-secondary)',
              background: 'transparent',
              display: 'flex',
              alignItems: 'center',
              gap: 6,
              cursor: 'pointer',
              position: 'relative',
            }}
          >
            <svg
              aria-hidden="true"
              viewBox="0 0 20 20"
              fill="currentColor"
              style={{ width: 14, height: 14, flexShrink: 0 }}
            >
              <path d="M9 2a2 2 0 00-2 2v8a2 2 0 002 2h6a2 2 0 002-2V6.414A2 2 0 0016.414 5L14 2.586A2 2 0 0012.586 2H9z" />
            </svg>
            <select
              value={cvSelectValue}
              onChange={handleCVVersionSelect}
              style={{
                position: 'absolute',
                inset: 0,
                opacity: 0,
                cursor: 'pointer',
                width: '100%',
              }}
              aria-label="CV Version filter"
            >
              <option value="__all__">All resumes</option>
              <option value="__untagged__">Untagged</option>
              {activeVersions.map((v) => (
                <option key={v.id} value={v.id}>
                  {v.name}
                </option>
              ))}
            </select>
            CV Version
          </div>
        </div>
      )}

      {/* Active count */}
      <span
        style={{
          fontSize: 12,
          color: 'var(--jf-text-muted)',
          marginLeft: 'auto',
        }}
      >
        {activeCount} active
      </span>

      {/* Add Application button */}
      <button
        type="button"
        onClick={() => onOpenAddModal?.()}
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: 6,
          padding: '8px 16px',
          minHeight: 44,
          borderRadius: 12,
          background: 'var(--jf-interactive)',
          fontSize: 13,
          fontWeight: 600,
          color: '#fff',
          border: 'none',
          cursor: 'pointer',
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.background = 'var(--jf-interactive-hover)'
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.background = 'var(--jf-interactive)'
        }}
      >
        <svg
          aria-hidden="true"
          viewBox="0 0 20 20"
          fill="currentColor"
          style={{ width: 14, height: 14 }}
        >
          <path
            fillRule="evenodd"
            d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z"
            clipRule="evenodd"
          />
        </svg>
        Add Application
      </button>
    </div>
  )
}
