'use client'

import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { cn } from '@/lib/utils'
import { createClient } from '@/lib/supabase/client'
import {
  LayoutDashboard,
  Kanban,
  BarChart3,
  BookOpen,
  FileText,
  Settings,
  HelpCircle,
  LogOut,
  User,
} from 'lucide-react'

const navItems = [
  { href: '/dashboard', label: 'Home', icon: LayoutDashboard },
  { href: '/pipeline', label: 'Pipeline', icon: Kanban },
  { href: '/analytics', label: 'Analytics', icon: BarChart3 },
  { href: '/stories', label: 'STAR Stories', icon: BookOpen },
  { href: '/cv-versions', label: 'Resume Builder', icon: FileText },
]

const bottomItems = [
  { href: '/settings', label: 'Settings', icon: Settings },
]

export function Sidebar() {
  const pathname = usePathname()
  const router = useRouter()
  const [profile, setProfile] = useState<{ full_name?: string | null; subscription_tier?: string | null } | null>(null)

  useEffect(() => {
    const supabase = createClient()
    supabase.auth.getUser().then(({ data: { user } }) => {
      if (!user) return
      supabase
        .from('profiles')
        .select('full_name, subscription_tier')
        .eq('id', user.id)
        .single()
        .then(({ data }) => setProfile(data))
    })
  }, [])

  async function handleSignOut() {
    const supabase = createClient()
    await supabase.auth.signOut()
    router.push('/login')
  }

  const isActive = (href: string) =>
    pathname === href || pathname.startsWith(href + '/')

  return (
    <aside className="flex flex-col w-60 h-full bg-[#f0f2f8] border-r border-gray-200">
      {/* Logo */}
      <Link
        href="/dashboard"
        className="flex items-center h-16 px-5 cursor-pointer hover:opacity-80 transition-opacity"
      >
        <span className="text-lg font-bold text-blue-600">Job</span>
        <span className="text-lg font-bold text-gray-900">&nbsp;Funnel</span>
      </Link>

      {/* Navigation */}
      <nav className="flex-1 px-3 py-2 space-y-0.5">
        {navItems.map(({ href, label, icon: Icon }) => (
          <Link
            key={href}
            href={href}
            className={cn(
              'relative flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors',
              isActive(href)
                ? 'text-blue-700'
                : 'text-gray-500 hover:bg-white/60 hover:text-gray-800'
            )}
          >
            {isActive(href) && (
              <motion.div
                layoutId="nav-indicator"
                className="absolute inset-0 bg-white rounded-lg shadow-sm"
                transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] }}
              />
            )}
            <Icon
              className={cn(
                'relative z-10 w-4 h-4 flex-shrink-0',
                isActive(href) ? 'text-blue-600' : 'text-gray-400'
              )}
            />
            <span className="relative z-10">{label}</span>
          </Link>
        ))}
      </nav>

      {/* Bottom section */}
      <div className="px-3 pb-4 space-y-1">
        {/* User profile card */}
        {profile && (
          <div className="flex items-center gap-3 px-3 py-3 mb-2 rounded-lg bg-white/60">
            <div className="w-8 h-8 rounded-full bg-orange-100 flex items-center justify-center flex-shrink-0">
              <User className="w-4 h-4 text-orange-400" />
            </div>
            <div className="min-w-0">
              <p className="text-sm font-semibold text-gray-800 truncate">
                {profile.full_name ?? 'User'}
              </p>
              <p className="text-[10px] font-medium text-gray-400 uppercase tracking-wide">
                {profile.subscription_tier === 'pro' ? 'Premium Tier' : 'Free Tier'}
              </p>
            </div>
          </div>
        )}

        {/* Settings */}
        {bottomItems.map(({ href, label, icon: Icon }) => (
          <Link
            key={href}
            href={href}
            className={cn(
              'relative flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors',
              isActive(href)
                ? 'text-blue-700'
                : 'text-gray-500 hover:bg-white/60 hover:text-gray-800'
            )}
          >
            {isActive(href) && (
              <motion.div
                layoutId="nav-indicator"
                className="absolute inset-0 bg-white rounded-lg shadow-sm"
                transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] }}
              />
            )}
            <Icon
              className={cn(
                'relative z-10 w-4 h-4 flex-shrink-0',
                isActive(href) ? 'text-blue-600' : 'text-gray-400'
              )}
            />
            <span className="relative z-10">{label}</span>
          </Link>
        ))}

        {/* Support */}
        <button
          className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-gray-500 hover:bg-white/60 hover:text-gray-800 transition-colors"
        >
          <HelpCircle className="w-4 h-4 text-gray-400 flex-shrink-0" />
          Support
        </button>

        {/* Sign out */}
        <button
          onClick={handleSignOut}
          className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-gray-500 hover:bg-white/60 hover:text-gray-800 transition-colors"
        >
          <LogOut className="w-4 h-4 text-gray-400 flex-shrink-0" />
          Sign out
        </button>
      </div>
    </aside>
  )
}
