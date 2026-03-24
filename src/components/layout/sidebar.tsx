'use client'

import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import { LogOut, Settings } from 'lucide-react'
import { cn } from '@/lib/utils'
import { createClient } from '@/lib/supabase/client'
import { useUserStore } from '@/store/userStore'
import { PRIMARY_NAV_ITEMS } from '@/lib/nav-items'

const navBase =
  'relative flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ' +
  'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sidebar-ring focus-visible:ring-offset-1'

function getInitials(name: string | null | undefined): string {
  if (!name) return '?'
  return name
    .split(' ')
    .map((n) => n[0])
    .slice(0, 2)
    .join('')
    .toUpperCase()
}

export function Sidebar() {
  const pathname = usePathname()
  const router = useRouter()
  const profile = useUserStore((s) => s.profile)

  async function handleSignOut() {
    const supabase = createClient()
    await supabase.auth.signOut()
    router.push('/login')
  }

  const isActive = (href: string) =>
    pathname === href || pathname.startsWith(href + '/')

  return (
    <aside
      className="flex flex-col w-60 h-full bg-sidebar border-r border-sidebar-border"
      style={{ width: 'var(--jf-sidebar-w)' }}
    >
      {/* Logo */}
      <Link
        href="/dashboard"
        className="flex items-center h-16 px-5 hover:opacity-80 transition-opacity focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sidebar-ring focus-visible:ring-offset-1"
        style={{ height: 'var(--jf-header-h)', borderBottom: '1px solid var(--jf-border)' }}
      >
        <span className="text-base font-bold" style={{ color: 'var(--jf-interactive)' }}>Job</span>
        <span className="text-base font-bold" style={{ color: 'var(--jf-text-primary)' }}>&nbsp;Funnel</span>
      </Link>

      {/* Primary nav */}
      <nav aria-label="Primary navigation" className="flex-1 px-3 py-3 space-y-0.5 overflow-y-auto">
        {PRIMARY_NAV_ITEMS.map(({ href, label, icon: Icon }) => {
          const active = isActive(href)
          return (
            <Link
              key={href}
              href={href}
              aria-current={active ? 'page' : undefined}
              className={cn(
                navBase,
                active
                  ? 'text-sidebar-primary'
                  : 'text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground'
              )}
            >
              {active && (
                <motion.div
                  layoutId="nav-indicator"
                  className="absolute inset-0 rounded-lg"
                  style={{ background: 'var(--jf-interactive-subtle)' }}
                  transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] }}
                />
              )}
              <Icon
                className={cn(
                  'relative z-10 w-4 h-4 flex-shrink-0',
                  active ? 'text-sidebar-primary' : 'text-sidebar-foreground/60'
                )}
                aria-hidden="true"
              />
              <span className="relative z-10">{label}</span>
            </Link>
          )
        })}
      </nav>

      {/* Bottom section */}
      <div className="px-3 pb-4 space-y-1" style={{ borderTop: '1px solid var(--jf-border)' }}>
        {/* User card → navigates to Settings */}
        <Link
          href="/settings"
          title="Account settings"
          className={cn(
            'group flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors mt-3',
            'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sidebar-ring focus-visible:ring-offset-1',
            isActive('/settings')
              ? 'text-sidebar-primary'
              : 'text-sidebar-foreground hover:bg-sidebar-accent'
          )}
          style={isActive('/settings') ? { background: 'var(--jf-interactive-subtle)' } : {}}
        >
          {/* Avatar circle */}
          <div
            className="w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 text-xs font-bold text-white"
            style={{ background: 'linear-gradient(135deg, #F97316, #EC4899)' }}
            aria-hidden="true"
          >
            {getInitials(profile?.full_name)}
          </div>

          {/* Name + tier */}
          <div className="flex-1 min-w-0">
            <p className="text-sm font-semibold truncate" style={{ color: 'var(--jf-text-primary)' }}>
              {profile?.full_name ?? 'User'}
            </p>
            <p
              className="text-[10px] font-medium uppercase tracking-wide"
              style={{ fontFamily: 'var(--font-dm-mono, monospace)', color: 'var(--jf-text-muted)' }}
            >
              {profile?.subscription_tier === 'pro' ? 'Pro' : 'Free Tier'}
            </p>
          </div>

          {/* Gear icon — visible on hover or when settings is active */}
          <Settings
            className={cn(
              'w-3.5 h-3.5 flex-shrink-0 transition-opacity',
              isActive('/settings')
                ? 'opacity-100 text-sidebar-primary'
                : 'opacity-0 group-hover:opacity-60'
            )}
            aria-hidden="true"
          />
        </Link>

        {/* Sign out */}
        <button
          onClick={handleSignOut}
          className={cn(
            'w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors',
            'text-sidebar-foreground/60 hover:bg-red-50 hover:text-red-500',
            'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sidebar-ring focus-visible:ring-offset-1'
          )}
        >
          <LogOut className="w-4 h-4 flex-shrink-0" aria-hidden="true" />
          Sign out
        </button>
      </div>
    </aside>
  )
}
