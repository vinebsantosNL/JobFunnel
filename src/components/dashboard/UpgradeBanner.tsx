'use client'

import { useState } from 'react'
import Link from 'next/link'

interface UpgradeBannerProps {
  isPro: boolean
}

export function UpgradeBanner({ isPro }: UpgradeBannerProps) {
  const [dismissed, setDismissed] = useState(false)

  if (isPro || dismissed) return null

  return (
    <div
      className="w-full flex-shrink-0 flex items-center justify-between gap-4 px-6 h-11"
      style={{
        background: 'var(--jf-interactive-subtle)',
        borderBottom: '1px solid var(--jf-interactive-border)',
      }}
    >
      {/* Left content */}
      <div className="flex items-center gap-1.5 min-w-0">
        <span
          className="flex-shrink-0"
          style={{ color: 'var(--jf-interactive)', fontSize: 13 }}
          aria-hidden="true"
        >
          &#10022;
        </span>
        <span
          className="truncate"
          style={{ fontSize: 13, color: 'var(--jf-text-secondary)' }}
        >
          Unlock full analytics and CV testing
        </span>
        <Link
          href="/settings?tab=billing"
          className="flex-shrink-0 hover:underline"
          style={{ fontSize: 13, fontWeight: 600, color: 'var(--jf-interactive)' }}
        >
          &rarr; Upgrade to Pro
        </Link>
      </div>

      {/* Right actions */}
      <div className="flex items-center gap-2 flex-shrink-0">
        <Link
          href="/settings?tab=billing"
          className="transition-colors hover:opacity-90"
          style={{
            background: 'var(--jf-interactive)',
            color: '#FFFFFF',
            fontSize: 12,
            fontWeight: 600,
            borderRadius: 8,
            padding: '5px 14px',
          }}
        >
          Upgrade
        </Link>
        <button
          type="button"
          onClick={() => setDismissed(true)}
          className="transition-colors hover:opacity-70"
          style={{ fontSize: 13, color: 'var(--jf-text-muted)', background: 'none', border: 'none', cursor: 'pointer' }}
          aria-label="Dismiss upgrade banner"
        >
          &times;
        </button>
      </div>
    </div>
  )
}
