'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { cn } from '@/lib/utils'
import { MOBILE_NAV_ITEMS } from '@/lib/nav-items'

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
      <div className="flex">
        {MOBILE_NAV_ITEMS.map(({ href, label, icon: Icon }) => {
          const active = pathname === href || pathname.startsWith(href + '/')
          return (
            <Link
              key={href}
              href={href}
              aria-current={active ? 'page' : undefined}
              className={cn(
                'flex flex-col items-center justify-center flex-1 py-3 gap-1 transition-colors min-h-[56px]',
                'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-sidebar-ring',
                active
                  ? 'text-sidebar-primary'
                  : 'text-sidebar-foreground/60'
              )}
            >
              <Icon className="w-5 h-5 flex-shrink-0" aria-hidden="true" />
              <span className="text-[10px] font-medium leading-none">{label}</span>
            </Link>
          )
        })}
      </div>
    </nav>
  )
}
