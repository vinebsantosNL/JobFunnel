import { Sidebar } from '@/components/layout/sidebar'
import { MobileNav } from '@/components/layout/mobile-nav'
import { UserStoreHydrator } from '@/components/providers/UserStoreHydrator'

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex h-screen overflow-hidden bg-gray-50">
      {/* Hydrates the global Zustand user store on mount — no UI output */}
      <UserStoreHydrator />

      {/* Desktop sidebar — fixed height, never scrolls */}
      <div className="hidden md:flex flex-shrink-0">
        <Sidebar />
      </div>

      {/* Main content — fills remaining height, children control their own scroll */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden pb-16 md:pb-0">
        {children}
      </div>

      {/* Mobile bottom nav */}
      <MobileNav />
    </div>
  )
}
