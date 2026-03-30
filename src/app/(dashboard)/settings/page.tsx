import Link from 'next/link'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Header } from '@/components/layout/header'

export default function SettingsPage() {
  return (
    <>
      <Header title="Settings" />
      <div className="flex-1 p-6 overflow-auto">
        <div className="max-w-2xl mx-auto space-y-4">
          <Link href="/settings/profile" className="block">
            <Card className="hover:border-primary/30 hover:bg-primary/5 transition-colors cursor-pointer">
              <CardHeader className="pb-2">
                <CardTitle className="text-base flex items-center gap-2">
                  <span>👤</span> Profile
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">
                  Your role and target countries shape the benchmarks you see in Funnel Analytics.
                </p>
              </CardContent>
            </Card>
          </Link>

          <Link href="/settings/notifications" className="block">
            <Card className="hover:border-primary/30 hover:bg-primary/5 transition-colors cursor-pointer">
              <CardHeader className="pb-2">
                <CardTitle className="text-base flex items-center gap-2">
                  <span>🔔</span> Notifications
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">
                  Get a weekly digest of your funnel and alerts when applications go cold.
                </p>
              </CardContent>
            </Card>
          </Link>
        </div>
      </div>
    </>
  )
}
