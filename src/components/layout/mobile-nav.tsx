'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { cn } from '@/lib/utils'
import {
  LayoutDashboard,
  Kanban,
  BarChart3,
  BookOpen,
  FileText,
  Settings,
} from 'lucide-react'

const navItems = [
  { href: '/dashboard',   label: 'Home',           icon: LayoutDashboard },
  { href: '/pipeline',    label: 'Pipeline',        icon: Kanban },
  { href: '/analytics',   label: 'Analytics',       icon: BarChart3 },
  { href: '/stories',     label: 'STAR Stories',    icon: BookOpen },
  { href: '/cv-versions', label: 'Resume Builder',  icon: FileText },
  { href: '/settings',    label: 'Settings',        icon: Settings },
]

export function MobileNav() {
  const pathname = usePathname()

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 bg-white border-t border-gray-100 sm:hidden">
      <div className="flex">
        {navItems.map(({ href, label, icon: Icon }) => {
          const active = pathname === href || pathname.startsWith(href + '/')
          return (
            <Link
              key={href}
              href={href}
              className={cn(
                'flex flex-col items-center justify-center flex-1 py-3 gap-1 transition-colors min-h-[56px]',
                active ? 'text-blue-600' : 'text-gray-500'
              )}
            >
              <Icon className="w-5 h-5 flex-shrink-0" />
              <span className="text-[10px] font-medium leading-none">{label}</span>
            </Link>
          )
        })}
      </div>
    </nav>
  )
}
