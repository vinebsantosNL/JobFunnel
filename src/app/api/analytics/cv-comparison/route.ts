import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'
import type { CVVersion, JobApplication, Stage } from '@/types/database'

const APPLIED_STAGES: Stage[] = ['applied', 'screening', 'interviewing', 'offer', 'hired', 'rejected', 'withdrawn']
const SCREENING_STAGES: Stage[] = ['screening', 'interviewing', 'offer', 'hired']
const INTERVIEWING_STAGES: Stage[] = ['interviewing', 'offer', 'hired']

export interface CVComparisonRow {
  version_id: string | null
  version_name: string
  total_applied: number
  reached_screening: number
  reached_interviewing: number
  reached_offer: number
  avg_days_in_applied: number | null
  screening_rate: number | null
  interview_rate: number | null
  overall_conversion: number | null
}

export async function GET(request: Request) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { searchParams } = new URL(request.url)
  const from = searchParams.get('from')
  const to = searchParams.get('to')

  // Fetch job applications (exclude 'saved' stage)
  let appsQuery = supabase
    .from('job_applications')
    .select('*')
    .eq('user_id', user.id)
    .not('stage', 'eq', 'saved')

  if (from) appsQuery = appsQuery.gte('applied_at', from)
  if (to) appsQuery = appsQuery.lte('applied_at', to)

  const { data: applications, error: appsError } = await appsQuery
  if (appsError) return NextResponse.json({ error: appsError.message }, { status: 500 })

  // Fetch all cv_versions for the user
  const { data: cvVersions, error: cvError } = await supabase
    .from('cv_versions')
    .select('*')
    .eq('user_id', user.id)

  if (cvError) return NextResponse.json({ error: cvError.message }, { status: 500 })

  const apps = (applications ?? []) as JobApplication[]
  const versions = (cvVersions ?? []) as CVVersion[]

  // Group applications by cv_version_id
  const grouped = new Map<string | null, JobApplication[]>()

  for (const app of apps) {
    if (!APPLIED_STAGES.includes(app.stage)) continue
    const key = app.cv_version_id ?? null
    if (!grouped.has(key)) grouped.set(key, [])
    grouped.get(key)!.push(app)
  }

  const rows: CVComparisonRow[] = []

  for (const [versionId, groupApps] of grouped.entries()) {
    const version = versions.find((v) => v.id === versionId)
    const versionName = version?.name ?? 'Untagged'

    const totalApplied = groupApps.length
    const reachedScreening = groupApps.filter((a) => SCREENING_STAGES.includes(a.stage)).length
    const reachedInterviewing = groupApps.filter((a) => INTERVIEWING_STAGES.includes(a.stage)).length
    const reachedOffer = groupApps.filter((a) => a.stage === 'offer' || a.stage === 'hired').length

    // avg days from applied_at to stage_updated_at (for non-applied stages)
    const daysValues = groupApps
      .filter((a) => a.applied_at !== null && a.stage !== 'applied')
      .map((a) => {
        const appliedMs = new Date(a.applied_at!).getTime()
        const updatedMs = new Date(a.stage_updated_at).getTime()
        return (updatedMs - appliedMs) / 86400000
      })
      .filter((d) => !isNaN(d) && d >= 0)

    const avgDaysInApplied =
      daysValues.length > 0
        ? Math.round((daysValues.reduce((s, d) => s + d, 0) / daysValues.length) * 10) / 10
        : null

    const screeningRate =
      totalApplied > 0 ? Math.round((reachedScreening / totalApplied) * 1000) / 10 : null
    const interviewRate =
      reachedScreening > 0
        ? Math.round((reachedInterviewing / reachedScreening) * 1000) / 10
        : null
    const overallConversion =
      totalApplied > 0 ? Math.round((reachedOffer / totalApplied) * 1000) / 10 : null

    rows.push({
      version_id: versionId,
      version_name: versionName,
      total_applied: totalApplied,
      reached_screening: reachedScreening,
      reached_interviewing: reachedInterviewing,
      reached_offer: reachedOffer,
      avg_days_in_applied: avgDaysInApplied,
      screening_rate: screeningRate,
      interview_rate: interviewRate,
      overall_conversion: overallConversion,
    })
  }

  rows.sort((a, b) => b.total_applied - a.total_applied)

  return NextResponse.json(rows)
}
