import { Sidebar } from '@/components/layout/sidebar'
import { MobileNav } from '@/components/layout/mobile-nav'
import { UserStoreHydrator } from '@/components/providers/UserStoreHydrator'

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex h-screen overflow-hidden bg-gray-50">
      {/* Skip-to-content link — visually hidden until focused by keyboard */}
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:fixed focus:top-4 focus:left-4 focus:z-[100] focus:px-4 focus:py-2 focus:bg-white focus:text-blue-700 focus:font-medium focus:rounded-lg focus:shadow-md focus:outline-none focus:ring-2 focus:ring-blue-500"
      >
        Skip to main content
      </a>

      {/* Hydrates the global Zustand user store on mount — no UI output */}
      <UserStoreHydrator />

      {/* Desktop sidebar — fixed height, never scrolls */}
      <div className="hidden sm:flex flex-shrink-0">
        <Sidebar />
      </div>

      {/* Main content — fills remaining height, children control their own scroll */}
      <main
        id="main-content"
        className="flex-1 flex flex-col min-w-0 overflow-hidden pb-16 sm:pb-0"
        tabIndex={-1}
      >
        {children}
      </main>

      {/* Mobile bottom nav */}
      <MobileNav />
    </div>
  )
}
