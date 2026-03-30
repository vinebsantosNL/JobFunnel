'use client'

import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import { cn } from '@/lib/utils'
import { createClient } from '@/lib/supabase/client'
import { useUserStore } from '@/store/userStore'

type IconProps = { className?: string; style?: React.CSSProperties }

// Inline SVG icons matching the app-mockups.html exactly (20×20 viewBox, fill="currentColor")
function IconHome({ className, style }: IconProps) {
  return (
    <svg viewBox="0 0 20 20" fill="currentColor" className={className} style={style} aria-hidden="true">
      <path d="M10.707 2.293a1 1 0 00-1.414 0l-7 7a1 1 0 001.414 1.414L4 10.414V17a1 1 0 001 1h2a1 1 0 001-1v-2a1 1 0 011-1h2a1 1 0 011 1v2a1 1 0 001 1h2a1 1 0 001-1v-6.586l.293.293a1 1 0 001.414-1.414l-7-7z"/>
    </svg>
  )
}
function IconPipeline({ className, style }: IconProps) {
  return (
    <svg viewBox="0 0 20 20" fill="currentColor" className={className} style={style} aria-hidden="true">
      <path d="M3 4a1 1 0 000 2h14a1 1 0 100-2H3zM3 9a1 1 0 000 2h14a1 1 0 100-2H3zM3 14a1 1 0 000 2h10a1 1 0 100-2H3z"/>
    </svg>
  )
}
function IconAnalytics({ className, style }: IconProps) {
  return (
    <svg viewBox="0 0 20 20" fill="currentColor" className={className} style={style} aria-hidden="true">
      <path d="M2 11a1 1 0 011-1h2a1 1 0 011 1v5a1 1 0 01-1 1H3a1 1 0 01-1-1v-5zM8 7a1 1 0 011-1h2a1 1 0 011 1v9a1 1 0 01-1 1H9a1 1 0 01-1-1V7zM14 4a1 1 0 011-1h2a1 1 0 011 1v12a1 1 0 01-1 1h-2a1 1 0 01-1-1V4z"/>
    </svg>
  )
}
function IconStories({ className, style }: IconProps) {
  return (
    <svg viewBox="0 0 20 20" fill="currentColor" className={className} style={style} aria-hidden="true">
      <path fillRule="evenodd" d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4zm2 6a1 1 0 011-1h6a1 1 0 110 2H7a1 1 0 01-1-1zm1 3a1 1 0 100 2h6a1 1 0 100-2H7z" clipRule="evenodd"/>
    </svg>
  )
}
function IconResume({ className, style }: IconProps) {
  return (
    <svg viewBox="0 0 20 20" fill="currentColor" className={className} style={style} aria-hidden="true">
      <path d="M9 2a2 2 0 00-2 2v8a2 2 0 002 2h6a2 2 0 002-2V6.414A2 2 0 0016.414 5L14 2.586A2 2 0 0012.586 2H9zM3 8a2 2 0 012-2v10h8a2 2 0 01-2 2H5a2 2 0 01-2-2V8z"/>
    </svg>
  )
}
function IconSettings({ className, style }: IconProps) {
  return (
    <svg viewBox="0 0 20 20" fill="currentColor" className={className} style={style} aria-hidden="true">
      <path fillRule="evenodd" d="M11.49 3.17c-.38-1.56-2.6-1.56-2.98 0a1.532 1.532 0 01-2.286.948c-1.372-.836-2.942.734-2.106 2.106.54.886.061 2.042-.947 2.287-1.561.379-1.561 2.6 0 2.978a1.532 1.532 0 01.947 2.287c-.836 1.372.734 2.942 2.106 2.106a1.532 1.532 0 012.287.947c.379 1.561 2.6 1.561 2.978 0a1.533 1.533 0 012.287-.947c1.372.836 2.942-.734 2.106-2.106a1.533 1.533 0 01.947-2.287c1.561-.379 1.561-2.6 0-2.978a1.532 1.532 0 01-.947-2.287c.836-1.372-.734-2.942-2.106-2.106a1.532 1.532 0 01-2.287-.947zM10 13a3 3 0 100-6 3 3 0 000 6z" clipRule="evenodd"/>
    </svg>
  )
}
function IconSignOut({ className, style }: IconProps) {
  return (
    <svg viewBox="0 0 20 20" fill="currentColor" className={className} style={style} aria-hidden="true">
      <path fillRule="evenodd" d="M3 3a1 1 0 00-1 1v12a1 1 0 102 0V4a1 1 0 00-1-1zm10.293 9.293a1 1 0 001.414 1.414l3-3a1 1 0 000-1.414l-3-3a1 1 0 10-1.414 1.414L14.586 9H7a1 1 0 100 2h7.586l-1.293 1.293z" clipRule="evenodd"/>
    </svg>
  )
}

const PRIMARY_NAV_ITEMS = [
  { href: '/dashboard',   label: 'Dashboard',        Icon: IconHome },
  { href: '/pipeline',    label: 'Pipeline',          Icon: IconPipeline },
  { href: '/analytics',   label: 'Funnel Analytics',  Icon: IconAnalytics },
  { href: '/stories',     label: 'Interview Vault',   Icon: IconStories },
  { href: '/cv-versions', label: 'CV Versions',       Icon: IconResume },
]

const navBase =
  'relative flex items-center gap-[10px] px-3 rounded-[10px] text-sm font-medium transition-colors ' +
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
        <span className="text-base font-bold" style={{ color: 'var(--jf-interactive)' }}>JobFunnel</span>
      </Link>

      {/* Primary nav */}
      <nav aria-label="Primary navigation" className="flex-1 px-3 py-3 overflow-y-auto" style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
        {PRIMARY_NAV_ITEMS.map(({ href, label, Icon }) => {
          const active = isActive(href)
          return (
            <Link
              key={href}
              href={href}
              aria-current={active ? 'page' : undefined}
              className={cn(navBase)}
              style={{
                padding: '9px 12px',
                color: active ? 'var(--jf-interactive)' : 'var(--jf-text-secondary)',
              }}
            >
              {active && (
                <motion.div
                  layoutId="nav-indicator"
                  className="absolute inset-0 rounded-[10px]"
                  style={{ background: 'var(--jf-interactive-subtle)' }}
                  transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] }}
                />
              )}
              <Icon
                className={cn('relative z-10 flex-shrink-0')}
                style={{ width: 16, height: 16, color: active ? 'var(--jf-interactive)' : 'var(--jf-text-muted)' } as React.CSSProperties}
              />
              <span className="relative z-10">{label}</span>
            </Link>
          )
        })}
      </nav>

      {/* Bottom section */}
      <div className="px-3 pb-3" style={{ borderTop: '1px solid var(--jf-border)' }}>
        {/* Sign out */}
        <button
          onClick={handleSignOut}
          className={cn(
            'w-full flex items-center gap-[10px] rounded-[10px] text-[13px] font-medium transition-colors',
            'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sidebar-ring focus-visible:ring-offset-1'
          )}
          style={{ padding: '8px 12px', color: 'var(--jf-text-muted)', background: 'transparent' }}
        >
          <IconSignOut style={{ width: 15, height: 15, flexShrink: 0 } as React.CSSProperties} />
          Sign out
        </button>
      </div>
    </aside>
  )
}
