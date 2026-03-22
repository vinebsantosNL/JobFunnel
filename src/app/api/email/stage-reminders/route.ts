import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { resend } from '@/lib/email/resend'
import type { Profile, JobApplication } from '@/types/database.types'

type ProfileRow = Pick<Profile, 'id' | 'email' | 'full_name' | 'notification_prefs'>
type JobRow = Pick<JobApplication, 'id' | 'company_name' | 'job_title' | 'stage' | 'stage_updated_at'>

const STAGE_THRESHOLDS = {
  screening: { days: 5, action: 'Follow up with HR', subject: 'Time to follow up with HR' },
  interviewing: { days: 7, action: 'Follow up with the Hiring Manager', subject: 'Time to follow up with your Hiring Manager' },
  offer: { days: 5, action: 'Respond to or follow up on your offer', subject: "Don't let your offer go cold" },
} as const

type ThresholdStage = keyof typeof STAGE_THRESHOLDS

function buildStageReminderHtml(
  name: string,
  jobs: Array<{ company_name: string; job_title: string; stage: string; days: number; action: string }>
): string {
  const rows = jobs.map((j) => `
    <tr>
      <td style="padding:8px 0;border-bottom:1px solid #f1f5f9">
        <strong>${j.company_name}</strong> — ${j.job_title}
      </td>
      <td style="padding:8px 12px;border-bottom:1px solid #f1f5f9;color:#64748b;text-transform:capitalize">${j.stage}</td>
      <td style="padding:8px 12px;border-bottom:1px solid #f1f5f9;color:#f59e0b">${j.days}d</td>
      <td style="padding:8px 0;border-bottom:1px solid #f1f5f9;color:#2563eb">${j.action}</td>
    </tr>
  `).join('')

  return `
    <div style="font-family:Inter,sans-serif;max-width:600px;margin:0 auto;padding:32px 24px;color:#1e293b">
      <h1 style="font-size:20px;font-weight:700;color:#1e293b;margin-bottom:8px">Hi ${name} 👋</h1>
      <p style="color:#64748b;margin-bottom:24px">Some of your applications may need your attention. Here's where you should follow up today:</p>
      <table style="width:100%;border-collapse:collapse;font-size:14px">
        <thead>
          <tr style="color:#94a3b8;font-size:11px;text-transform:uppercase;letter-spacing:0.05em">
            <th style="text-align:left;padding-bottom:8px">Application</th>
            <th style="text-align:left;padding-bottom:8px;padding-left:12px">Stage</th>
            <th style="text-align:left;padding-bottom:8px;padding-left:12px">Days</th>
            <th style="text-align:left;padding-bottom:8px">Action</th>
          </tr>
        </thead>
        <tbody>${rows}</tbody>
      </table>
      <div style="margin-top:28px">
        <a href="${process.env.NEXT_PUBLIC_APP_URL}/pipeline" style="display:inline-block;padding:10px 20px;background:#2563eb;color:#fff;border-radius:8px;font-size:14px;font-weight:600;text-decoration:none">Open Pipeline →</a>
      </div>
      <p style="margin-top:24px;font-size:12px;color:#94a3b8">You're receiving this because you have stale application reminders enabled. <a href="${process.env.NEXT_PUBLIC_APP_URL}/settings/notifications" style="color:#2563eb">Manage preferences</a></p>
    </div>
  `
}

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

  const { data: profiles } = await supabase
    .from('profiles')
    .select('id, email, full_name, notification_prefs')

  if (!profiles) return NextResponse.json({ error: 'Failed to fetch profiles' }, { status: 500 })

  const enabledProfiles = (profiles as ProfileRow[]).filter(
    (p) => p.notification_prefs?.stale_applications === true
  )

  const now = Date.now()
  let sent = 0

  for (const profile of enabledProfiles) {
    try {
      const { data: jobsRaw } = (await supabase
        .from('job_applications')
        .select('id, company_name, job_title, stage, stage_updated_at')
        .eq('user_id', profile.id)
        .in('stage', Object.keys(STAGE_THRESHOLDS))) as { data: JobRow[] | null }

      const jobs = (jobsRaw ?? []).filter((job) => {
        const threshold = STAGE_THRESHOLDS[job.stage as ThresholdStage]
        if (!threshold) return false
        const days = Math.floor((now - new Date(job.stage_updated_at).getTime()) / 86400000)
        return days >= threshold.days
      })

      if (jobs.length === 0) continue

      const jobsForEmail = jobs.map((job) => {
        const threshold = STAGE_THRESHOLDS[job.stage as ThresholdStage]!
        return {
          company_name: job.company_name,
          job_title: job.job_title,
          stage: job.stage,
          days: Math.floor((now - new Date(job.stage_updated_at).getTime()) / 86400000),
          action: threshold.action,
        }
      })

      const subject =
        jobsForEmail.length === 1
          ? `${STAGE_THRESHOLDS[jobs[0].stage as ThresholdStage]?.subject} — ${jobs[0].company_name}`
          : `${jobsForEmail.length} applications need your attention`

      await resend.emails.send({
        from: 'Job Funnel <onboarding@resend.dev>',
        to: profile.email as string,
        subject,
        html: buildStageReminderHtml(profile.full_name ?? 'there', jobsForEmail),
      })

      sent++
    } catch (err) {
      console.error(`Failed to send stage reminder to ${profile.id}:`, err)
    }
  }

  return NextResponse.json({ sent })
}
