'use client'

import { Bell } from 'lucide-react'
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
      {/* Notification bell — Phase 1: no unread state */}
      <button
        aria-label="Notifications"
        className="w-9 h-9 flex items-center justify-center rounded-lg transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sidebar-ring"
        style={{
          border: '1px solid var(--jf-border)',
          background: 'var(--jf-bg-card)',
          color: 'var(--jf-text-muted)',
        }}
      >
        <Bell className="w-4 h-4" aria-hidden="true" />
      </button>

      {/* Avatar */}
      <div
        className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold text-white flex-shrink-0 cursor-default"
        style={{ background: 'linear-gradient(135deg, #F97316, #EC4899)' }}
        aria-label={profile?.full_name ?? 'User'}
      >
        {getInitials(profile?.full_name)}
      </div>
    </div>
  )
}
