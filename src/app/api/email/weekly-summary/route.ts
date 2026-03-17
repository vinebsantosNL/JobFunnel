import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { resend } from '@/lib/email/resend'
import { weeklySummaryEmail } from '@/lib/email/templates'
import type { Profile, JobApplication, StageHistory } from '@/types/database'

type ProfileRow = Pick<Profile, 'id' | 'email' | 'full_name' | 'notification_prefs'>

export async function POST(request: Request) {
  const authHeader = request.headers.get('Authorization')
  const cronSecret = process.env.CRON_SECRET

  if (!cronSecret || authHeader !== `Bearer ${cronSecret}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )

  const { data: profiles, error: profilesError } = await supabase
    .from('profiles')
    .select('id, email, full_name, notification_prefs')

  if (profilesError || !profiles) {
    return NextResponse.json({ error: 'Failed to fetch profiles' }, { status: 500 })
  }

  const enabledProfiles = (profiles as ProfileRow[]).filter(
    (p) => p.notification_prefs?.weekly_summary === true
  )

  const oneWeekAgo = new Date()
  oneWeekAgo.setDate(oneWeekAgo.getDate() - 7)
  const isoWeekAgo = oneWeekAgo.toISOString()

  let sent = 0

  for (const profile of enabledProfiles) {
    try {
      const { data: allJobs } = await supabase
        .from('job_applications')
        .select('id, stage, stage_updated_at')
        .eq('user_id', profile.id) as { data: Pick<JobApplication, 'id' | 'stage' | 'stage_updated_at'>[] | null }

      const jobs = allJobs ?? []

      const { data: recentTransitions } = await supabase
        .from('stage_history')
        .select('id')
        .gte('transitioned_at', isoWeekAgo)
        .in('job_id', jobs.map((j) => j.id)) as { data: Pick<StageHistory, 'id'>[] | null }

      const snapshot: Record<string, number> = {}
      for (const job of jobs) {
        snapshot[job.stage] = (snapshot[job.stage] ?? 0) + 1
      }

      const staleThreshold = new Date()
      staleThreshold.setDate(staleThreshold.getDate() - 14)

      const staleJobs = jobs.filter((j) => {
        const activeStages = ['applied', 'screening', 'interviewing']
        return activeStages.includes(j.stage) && new Date(j.stage_updated_at) < staleThreshold
      })

      const newThisWeek = jobs.filter(
        (j) => j.stage === 'applied' && new Date(j.stage_updated_at) >= oneWeekAgo
      )

      const { subject, html } = weeklySummaryEmail(profile.full_name ?? '', {
        applied: newThisWeek.length,
        transitions: recentTransitions?.length ?? 0,
        stale: staleJobs.length,
        snapshot,
      })

      await resend.emails.send({
        from: 'JobFunnel OS <noreply@jobfunnel.app>',
        to: profile.email as string,
        subject,
        html,
      })

      sent++
    } catch (err) {
      console.error(`Failed to send weekly summary to ${profile.id}:`, err)
    }
  }

  return NextResponse.json({ sent })
}
