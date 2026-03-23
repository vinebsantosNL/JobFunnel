'use client'

import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { cn } from '@/lib/utils'
import { createClient } from '@/lib/supabase/client'
import { PRIMARY_NAV_ITEMS, BOTTOM_NAV_ITEMS } from '@/lib/nav-items'
import { HelpCircle, LogOut, User } from 'lucide-react'

/** Shared class for all nav link items — desktop sidebar */
const navLinkBase =
  'relative flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ' +
  'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-1'

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
    <aside className="flex flex-col w-60 h-full bg-slate-100 border-r border-gray-200">
      {/* Logo */}
      <Link
        href="/dashboard"
        className="flex items-center h-16 px-5 cursor-pointer hover:opacity-80 transition-opacity focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-1"
      >
        <span className="text-lg font-bold text-blue-600">Job</span>
        <span className="text-lg font-bold text-gray-900">&nbsp;Funnel</span>
      </Link>

      {/* Primary Navigation */}
      <nav aria-label="Primary navigation" className="flex-1 px-3 py-2 space-y-0.5">
        {PRIMARY_NAV_ITEMS.map(({ href, label, icon: Icon }) => (
          <Link
            key={href}
            href={href}
            aria-current={isActive(href) ? 'page' : undefined}
            className={cn(
              navLinkBase,
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
              aria-hidden="true"
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
            <div className="w-8 h-8 rounded-full bg-orange-100 flex items-center justify-center flex-shrink-0" aria-hidden="true">
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

        {/* Secondary nav (Settings) */}
        <nav aria-label="Secondary navigation">
          {BOTTOM_NAV_ITEMS.map(({ href, label, icon: Icon }) => (
            <Link
              key={href}
              href={href}
              aria-current={isActive(href) ? 'page' : undefined}
              className={cn(
                navLinkBase,
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
                aria-hidden="true"
              />
              <span className="relative z-10">{label}</span>
            </Link>
          ))}
        </nav>

        {/* Support */}
        <button
          className={cn(
            'w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-gray-500',
            'hover:bg-white/60 hover:text-gray-800 transition-colors',
            'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-1'
          )}
        >
          <HelpCircle className="w-4 h-4 text-gray-400 flex-shrink-0" aria-hidden="true" />
          Support
        </button>

        {/* Sign out */}
        <button
          onClick={handleSignOut}
          className={cn(
            'w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-gray-500',
            'hover:bg-white/60 hover:text-gray-800 transition-colors',
            'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-1'
          )}
        >
          <LogOut className="w-4 h-4 text-gray-400 flex-shrink-0" aria-hidden="true" />
          Sign out
        </button>
      </div>
    </aside>
  )
}
