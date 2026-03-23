import {
  LayoutDashboard,
  Kanban,
  BarChart3,
  BookOpen,
  FileText,
  Settings,
} from 'lucide-react'

export type NavItem = {
  href: string
  label: string
  icon: React.ComponentType<{ className?: string }>
}

/** Primary navigation items — rendered in sidebar main nav and mobile bottom bar */
export const PRIMARY_NAV_ITEMS: NavItem[] = [
  { href: '/dashboard',   label: 'Home',           icon: LayoutDashboard },
  { href: '/pipeline',    label: 'Pipeline',        icon: Kanban },
  { href: '/analytics',   label: 'Analytics',       icon: BarChart3 },
  { href: '/stories',     label: 'STAR Stories',    icon: BookOpen },
  { href: '/cv-versions', label: 'Resume Builder',  icon: FileText },
]

/** Bottom/secondary navigation items — rendered at the foot of the desktop sidebar and appended to mobile bottom bar */
export const BOTTOM_NAV_ITEMS: NavItem[] = [
  { href: '/settings', label: 'Settings', icon: Settings },
]

/** All nav items combined — used by MobileNav bottom bar */
export const ALL_NAV_ITEMS: NavItem[] = [...PRIMARY_NAV_ITEMS, ...BOTTOM_NAV_ITEMS]
