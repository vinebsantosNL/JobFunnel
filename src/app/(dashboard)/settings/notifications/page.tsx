'use client'

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Switch } from '@/components/ui/switch'
import type { Profile } from '@/types/database.types'

interface NotificationPrefs {
  weekly_summary: boolean
  stale_applications: boolean
}

export default function NotificationsSettingsPage() {
  const queryClient = useQueryClient()

  const { data: profile, isLoading } = useQuery<Profile>({
    queryKey: ['profile'],
    queryFn: async () => {
      const res = await fetch('/api/profile')
      if (!res.ok) throw new Error('Failed to fetch profile')
      return res.json()
    },
  })

  const mutation = useMutation({
    mutationFn: async (prefs: NotificationPrefs) => {
      const res = await fetch('/api/profile', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ notification_prefs: prefs }),
      })
      if (!res.ok) {
        const err = await res.json() as { error?: string }
        throw new Error(err.error ?? 'Failed to update preferences')
      }
      return res.json()
    },
    onSuccess: () => {
      toast.success('Notification preferences saved')
      queryClient.invalidateQueries({ queryKey: ['profile'] })
    },
    onError: (err: Error) => {
      toast.error(err.message)
    },
  })

  function handleToggle(key: keyof NotificationPrefs) {
    if (!profile) return
    const current = profile.notification_prefs ?? { weekly_summary: false, stale_applications: false }
    mutation.mutate({ ...current, [key]: !current[key] })
  }

  const prefs = profile?.notification_prefs ?? {
    weekly_summary: false,
    stale_applications: false,
  }

  return (
    <div className="flex-1 p-6 overflow-auto">
      <div className="max-w-xl mx-auto">
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Email Notifications</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {isLoading ? (
              <div className="space-y-4 animate-pulse">
                <div className="h-12 bg-muted rounded-lg" />
                <div className="h-12 bg-muted rounded-lg" />
              </div>
            ) : (
              <>
                <div className="flex items-center justify-between gap-4">
                  <div>
                    <p className="text-sm font-medium text-foreground">Weekly Summary</p>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      Receive a weekly digest of your job search activity.
                    </p>
                  </div>
                  <Switch
                    checked={prefs.weekly_summary}
                    onCheckedChange={() => handleToggle('weekly_summary')}
                    disabled={mutation.isPending}
                  />
                </div>

                <div className="flex items-center justify-between gap-4">
                  <div>
                    <p className="text-sm font-medium text-foreground">Stale Application Alerts</p>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      Get notified when applications haven&apos;t had activity in 14+ days.
                    </p>
                  </div>
                  <Switch
                    checked={prefs.stale_applications}
                    onCheckedChange={() => handleToggle('stale_applications')}
                    disabled={mutation.isPending}
                  />
                </div>
              </>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
