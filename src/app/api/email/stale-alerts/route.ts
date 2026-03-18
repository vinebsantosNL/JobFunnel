import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { resend } from '@/lib/email/resend'
import { staleApplicationEmail } from '@/lib/email/templates'
import type { Profile, JobApplication } from '@/types/database'

type ProfileRow = Pick<Profile, 'id' | 'email' | 'full_name' | 'notification_prefs'>
type JobRow = Pick<JobApplication, 'id' | 'company_name' | 'job_title' | 'stage' | 'stage_updated_at'>

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
    (p) => p.notification_prefs?.stale_applications === true
  )

  const staleThreshold = new Date(Date.now() - 14 * 24 * 60 * 60 * 1000)
  const isoThreshold = staleThreshold.toISOString()
  const now = Date.now()

  let sent = 0

  for (const profile of enabledProfiles) {
    try {
      const { data: staleJobsRaw } = await supabase
        .from('job_applications')
        .select('id, company_name, job_title, stage, stage_updated_at')
        .eq('user_id', profile.id)
        .in('stage', ['applied', 'screening', 'interviewing'])
        .lt('stage_updated_at', isoThreshold) as { data: JobRow[] | null }

      const staleJobs = staleJobsRaw ?? []

      if (staleJobs.length === 0) continue

      const jobsForEmail = staleJobs.map((job) => ({
        company_name: job.company_name,
        job_title: job.job_title,
        stage: job.stage,
        days: Math.floor((now - new Date(job.stage_updated_at).getTime()) / 86400000),
      }))

      const { subject, html } = staleApplicationEmail(profile.full_name ?? '', jobsForEmail)

      await resend.emails.send({
        from: 'JobFunnel OS <noreply@jobfunnel.app>',
        to: profile.email as string,
        subject,
        html,
      })

      sent++
    } catch (err) {
      console.error(`Failed to send stale alert to ${profile.id}:`, err)
    }
  }

  return NextResponse.json({ sent })
}
