'use client'

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import type { Profile } from '@/types/database'

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
    <main className="flex-1 p-6">
      <div className="max-w-xl mx-auto">
        <h1 className="text-lg font-semibold text-gray-900 mb-6">Notification Settings</h1>
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Email Notifications</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {isLoading ? (
              <div className="space-y-4 animate-pulse">
                <div className="h-12 bg-gray-100 rounded-lg" />
                <div className="h-12 bg-gray-100 rounded-lg" />
              </div>
            ) : (
              <>
                <div className="flex items-center justify-between gap-4">
                  <div>
                    <p className="text-sm font-medium text-gray-900">Weekly Summary</p>
                    <p className="text-xs text-gray-500 mt-0.5">
                      Receive a weekly digest of your job search activity.
                    </p>
                  </div>
                  <button
                    role="switch"
                    aria-checked={prefs.weekly_summary}
                    onClick={() => handleToggle('weekly_summary')}
                    disabled={mutation.isPending}
                    className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 ${
                      prefs.weekly_summary ? 'bg-blue-600' : 'bg-gray-200'
                    }`}
                  >
                    <span
                      className={`pointer-events-none inline-block h-5 w-5 rounded-full bg-white shadow-lg ring-0 transition-transform ${
                        prefs.weekly_summary ? 'translate-x-5' : 'translate-x-0'
                      }`}
                    />
                  </button>
                </div>

                <div className="flex items-center justify-between gap-4">
                  <div>
                    <p className="text-sm font-medium text-gray-900">Stale Application Alerts</p>
                    <p className="text-xs text-gray-500 mt-0.5">
                      Get notified when applications haven&apos;t had activity in 14+ days.
                    </p>
                  </div>
                  <button
                    role="switch"
                    aria-checked={prefs.stale_applications}
                    onClick={() => handleToggle('stale_applications')}
                    disabled={mutation.isPending}
                    className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 ${
                      prefs.stale_applications ? 'bg-blue-600' : 'bg-gray-200'
                    }`}
                  >
                    <span
                      className={`pointer-events-none inline-block h-5 w-5 rounded-full bg-white shadow-lg ring-0 transition-transform ${
                        prefs.stale_applications ? 'translate-x-5' : 'translate-x-0'
                      }`}
                    />
                  </button>
                </div>
              </>
            )}
          </CardContent>
        </Card>
      </div>
    </main>
  )
}
