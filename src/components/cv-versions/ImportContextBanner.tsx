'use client'

import { useSearchParams } from 'next/navigation'
import { FileCheck } from 'lucide-react'

export function ImportContextBanner() {
  const searchParams = useSearchParams()
  const filename = searchParams.get('filename')
  const versionId = searchParams.get('version_id')

  if (!versionId || !filename) return null

  return (
    <div
      className="flex items-center gap-3 rounded-xl border px-4 py-3"
      style={{
        borderColor: 'rgba(16,185,129,0.25)',
        background: 'rgba(16,185,129,0.05)',
      }}
    >
      <div
        className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-lg border"
        style={{ borderColor: 'rgba(16,185,129,0.3)', background: 'rgba(16,185,129,0.08)' }}
      >
        <FileCheck className="h-4 w-4" style={{ color: 'var(--jf-success)' }} />
      </div>
      <div className="flex flex-col gap-0.5 min-w-0">
        <span className="text-[12.5px] font-semibold" style={{ color: 'var(--jf-text-primary)' }}>
          CV imported
        </span>
        <span className="truncate text-[11.5px]" style={{ color: 'var(--jf-text-muted)' }}>
          {decodeURIComponent(filename)} — choose a template to apply
        </span>
      </div>
    </div>
  )
}
