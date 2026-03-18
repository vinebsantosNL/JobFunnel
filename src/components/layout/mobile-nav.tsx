'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { cn } from '@/lib/utils'

const navItems = [
  { href: '/dashboard', label: 'Home', icon: '◈' },
  { href: '/pipeline', label: 'Pipeline', icon: '⬡' },
  { href: '/analytics', label: 'Analytics', icon: '▲' },
  { href: '/stories', label: 'Stories', icon: '✦' },
  { href: '/cv-versions', label: 'CV Versions', icon: '📄' },
  { href: '/settings', label: 'Settings', icon: '⚙' },
]

export function MobileNav() {
  const pathname = usePathname()

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 bg-white border-t border-gray-100 md:hidden">
      <div className="flex">
        {navItems.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className={cn(
              'flex flex-col items-center justify-center flex-1 py-2 text-xs gap-1 transition-colors',
              pathname === item.href || pathname.startsWith(item.href + '/')
                ? 'text-blue-600'
                : 'text-gray-500'
            )}
          >
            <span className="text-lg">{item.icon}</span>
            {item.label}
          </Link>
        ))}
      </div>
    </nav>
  )
}
