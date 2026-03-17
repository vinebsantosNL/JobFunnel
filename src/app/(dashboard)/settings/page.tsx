import Link from 'next/link'
import { Header } from '@/components/layout/header'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

export default function SettingsPage() {
  return (
    <>
      <Header title="Settings" />
      <main className="flex-1 p-6">
        <div className="max-w-2xl mx-auto space-y-4">
          <Link href="/app/settings/profile" className="block">
            <Card className="hover:border-blue-200 hover:bg-blue-50/30 transition-colors cursor-pointer">
              <CardHeader className="pb-2">
                <CardTitle className="text-base flex items-center gap-2">
                  <span>👤</span> Profile
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-gray-500">
                  Update your name, role, experience, and target countries.
                </p>
              </CardContent>
            </Card>
          </Link>

          <Link href="/app/settings/notifications" className="block">
            <Card className="hover:border-blue-200 hover:bg-blue-50/30 transition-colors cursor-pointer">
              <CardHeader className="pb-2">
                <CardTitle className="text-base flex items-center gap-2">
                  <span>🔔</span> Notifications
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-gray-500">
                  Manage your weekly summary and stale application alert preferences.
                </p>
              </CardContent>
            </Card>
          </Link>
        </div>
      </main>
    </>
  )
}
