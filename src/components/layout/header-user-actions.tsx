'use client'

import Link from 'next/link'
import { useUserStore } from '@/store/userStore'

function getInitials(name: string | null | undefined): string {
  if (!name) return '?'
  return name
    .split(' ')
    .map((n) => n[0])
    .slice(0, 2)
    .join('')
    .toUpperCase()
}

export function HeaderUserActions() {
  const profile = useUserStore((s) => s.profile)

  return (
    <div className="flex items-center gap-2.5">
      {/* Avatar — links to Settings */}
      <Link
        href="/settings"
        aria-label="Account settings"
        title="Account settings"
        className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold text-white flex-shrink-0 transition-opacity hover:opacity-80 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sidebar-ring"
        style={{ background: 'var(--jf-avatar-gradient)' }}
      >
        {getInitials(profile?.full_name)}
      </Link>
    </div>
  )
}
