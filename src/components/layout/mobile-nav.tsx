'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { cn } from '@/lib/utils'

// Inline SVG icons matching app-mockups.html (20×20 viewBox)
const MOBILE_NAV_ITEMS = [
  {
    href: '/dashboard',
    label: 'Home',
    svg: <path d="M10.707 2.293a1 1 0 00-1.414 0l-7 7a1 1 0 001.414 1.414L4 10.414V17a1 1 0 001 1h2a1 1 0 001-1v-2a1 1 0 011-1h2a1 1 0 011 1v2a1 1 0 001 1h2a1 1 0 001-1v-6.586l.293.293a1 1 0 001.414-1.414l-7-7z"/>,
  },
  {
    href: '/pipeline',
    label: 'Pipeline',
    svg: <path d="M3 4a1 1 0 000 2h14a1 1 0 100-2H3zM3 9a1 1 0 000 2h14a1 1 0 100-2H3zM3 14a1 1 0 000 2h10a1 1 0 100-2H3z"/>,
  },
  {
    href: '/analytics',
    label: 'Analytics',
    svg: <path d="M2 11a1 1 0 011-1h2a1 1 0 011 1v5a1 1 0 01-1 1H3a1 1 0 01-1-1v-5zM8 7a1 1 0 011-1h2a1 1 0 011 1v9a1 1 0 01-1 1H9a1 1 0 01-1-1V7zM14 4a1 1 0 011-1h2a1 1 0 011 1v12a1 1 0 01-1 1h-2a1 1 0 01-1-1V4z"/>,
  },
  {
    href: '/stories',
    label: 'Stories',
    svg: <path fillRule="evenodd" d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4zm2 6a1 1 0 011-1h6a1 1 0 110 2H7a1 1 0 01-1-1zm1 3a1 1 0 100 2h6a1 1 0 100-2H7z" clipRule="evenodd"/>,
  },
  {
    href: '/settings',
    label: 'Profile',
    svg: <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd"/>,
  },
]

export function MobileNav() {
  const pathname = usePathname()

  return (
    <nav
      aria-label="Mobile navigation"
      className="fixed bottom-0 left-0 right-0 z-50 sm:hidden"
      style={{
        background: 'var(--jf-bg-card)',
        borderTop: '1px solid var(--jf-border)',
      }}
    >
      <div className="flex justify-around">
        {MOBILE_NAV_ITEMS.map(({ href, label, svg }) => {
          const active = pathname === href || pathname.startsWith(href + '/')
          return (
            <Link
              key={href}
              href={href}
              aria-current={active ? 'page' : undefined}
              className={cn(
                'flex flex-col items-center justify-center flex-1 gap-1 transition-colors min-h-[56px] py-2',
                'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-sidebar-ring'
              )}
              style={{ color: active ? 'var(--jf-interactive)' : 'var(--jf-text-muted)' }}
            >
              <svg viewBox="0 0 20 20" fill="currentColor" style={{ width: 20, height: 20, flexShrink: 0 }} aria-hidden="true">
                {svg}
              </svg>
              <span className="text-[10px] font-medium leading-none">{label}</span>
            </Link>
          )
        })}
      </div>
    </nav>
  )
}
