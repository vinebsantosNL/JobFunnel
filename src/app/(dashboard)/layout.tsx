'use client'

import { usePathname } from 'next/navigation'
import { AnimatePresence, motion } from 'framer-motion'
import { Sidebar } from '@/components/layout/sidebar'
import { MobileNav } from '@/components/layout/mobile-nav'
import { UserStoreHydrator } from '@/components/providers/UserStoreHydrator'

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()

  return (
    <div
      className="flex h-screen overflow-hidden"
      style={{ background: 'var(--jf-bg-page)' }}
    >
      {/* Skip-to-content */}
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:fixed focus:top-4 focus:left-4 focus:z-[100] focus:px-4 focus:py-2 focus:bg-card focus:text-primary focus:font-medium focus:rounded-lg focus:shadow-md focus:outline-none focus:ring-2 focus:ring-ring"
      >
        Skip to main content
      </a>

      <UserStoreHydrator />

      {/* Desktop sidebar */}
      <div className="hidden sm:flex flex-shrink-0">
        <Sidebar />
      </div>

      {/* Main content with page transition */}
      <main
        id="main-content"
        className="flex-1 flex flex-col min-w-0 overflow-hidden pb-16 sm:pb-0"
        tabIndex={-1}
      >
        <AnimatePresence mode="wait" initial={false}>
          <motion.div
            key={pathname}
            className="flex-1 flex flex-col min-w-0 overflow-hidden"
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -4 }}
            transition={{ duration: 0.15, ease: 'easeOut' }}
          >
            {children}
          </motion.div>
        </AnimatePresence>
      </main>

      <MobileNav />
    </div>
  )
}
