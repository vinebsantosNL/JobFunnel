import {
  LayoutDashboard,
  Kanban,
  BarChart3,
  BookOpen,
  FileText,
  User,
} from 'lucide-react'

export type NavItem = {
  href: string
  label: string
  icon: React.ComponentType<{ className?: string; 'aria-hidden'?: boolean | 'true' | 'false' }>
}

/** Primary navigation — desktop sidebar main nav */
export const PRIMARY_NAV_ITEMS: NavItem[] = [
  { href: '/dashboard',   label: 'Home',           icon: LayoutDashboard },
  { href: '/pipeline',    label: 'Pipeline',        icon: Kanban },
  { href: '/analytics',   label: 'Analytics',       icon: BarChart3 },
  { href: '/stories',     label: 'STAR Stories',    icon: BookOpen },
  { href: '/cv-versions', label: 'Resume Builder',  icon: FileText },
]

/**
 * Mobile bottom nav — 5 items only.
 * Resume Builder is dropped; Settings surfaces as "Profile" (5th slot).
 */
export const MOBILE_NAV_ITEMS: NavItem[] = [
  { href: '/dashboard',  label: 'Home',      icon: LayoutDashboard },
  { href: '/pipeline',   label: 'Pipeline',  icon: Kanban },
  { href: '/analytics',  label: 'Analytics', icon: BarChart3 },
  { href: '/stories',    label: 'Stories',   icon: BookOpen },
  { href: '/settings',   label: 'Profile',   icon: User },
]

/** @deprecated Use PRIMARY_NAV_ITEMS + MOBILE_NAV_ITEMS separately */
export const ALL_NAV_ITEMS = PRIMARY_NAV_ITEMS
