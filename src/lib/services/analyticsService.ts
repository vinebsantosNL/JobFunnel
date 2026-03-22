import type { SupabaseClient } from '@supabase/supabase-js'
import type { Stage } from '@/types/database.types'
import type { FunnelData, TimelinePoint, StageTimePoint } from '@/types/analytics'
import { AppError } from '@/lib/utils/errors'

// ─── Shared helpers ────────────────────────────────────────────────────────────

const FUNNEL_STAGES = ['applied', 'screening', 'interviewing', 'offer', 'hired'] as const

const FUNNEL_INDEX: Partial<Record<string, number>> = {
  applied: 0, screening: 1, interviewing: 2, offer: 3, hired: 4,
}

const rate = (num: number, den: number) =>
  den === 0 ? 0 : Math.round((num / den) * 100)

export interface DateRangeFilters {
  from?: string | null
  to?: string | null
}

// ─── Funnel metrics ────────────────────────────────────────────────────────────

const EMPTY_FUNNEL: FunnelData = {
  stage_counts: {
    saved: 0, applied: 0, screening: 0, interviewing: 0,
    offer: 0, hired: 0, rejected: 0, withdrawn: 0,
  },
  funnel_counts: { applied: 0, screening: 0, interviewing: 0, offer: 0 },
  applied_to_screening: 0,
  screening_to_interview: 0,
  interview_to_offer: 0,
  overall_conversion: 0,
}

export async function getFunnelMetrics(
  supabase: SupabaseClient,
  userId: string,
  filters: DateRangeFilters = {}
): Promise<FunnelData> {
  let jobQuery = supabase
    .from('job_applications')
    .select('id, stage')
    .eq('user_id', userId)
    .neq('stage', 'saved')

  if (filters.from) jobQuery = jobQuery.gte('created_at', filters.from)
  if (filters.to) jobQuery = jobQuery.lte('created_at', filters.to)

  const { data: jobs, error: jobError } = await jobQuery
  if (jobError) throw new AppError(jobError.message)

  const jobList = jobs ?? []
  if (jobList.length === 0) return EMPTY_FUNNEL

  const jobIds = jobList.map((j) => j.id)

  const { data: history } = await supabase
    .from('stage_history')
    .select('job_id, to_stage')
    .in('job_id', jobIds)

  // Track the highest funnel stage each job ever reached
  const jobHighest = new Map<string, number>()
  for (const job of jobList) {
    jobHighest.set(job.id, FUNNEL_INDEX[job.stage] ?? -1)
  }
  for (const h of history ?? []) {
    const idx = FUNNEL_INDEX[h.to_stage] ?? -1
    const current = jobHighest.get(h.job_id) ?? -1
    if (idx > current) jobHighest.set(h.job_id, idx)
  }

  // Cumulative funnel: a job counts for stage S if it ever reached S or beyond
  const funnelCounts = { applied: 0, screening: 0, interviewing: 0, offer: 0 }
  for (const highestIdx of jobHighest.values()) {
    const cap = Math.min(highestIdx, 3) // cap at offer (index 3)
    for (let i = 0; i <= cap; i++) {
      const stage = FUNNEL_STAGES[i] as keyof typeof funnelCounts
      if (stage in funnelCounts) funnelCounts[stage]++
    }
  }

  const stageCounts: Record<Stage, number> = {
    saved: 0, applied: 0, screening: 0, interviewing: 0,
    offer: 0, hired: 0, rejected: 0, withdrawn: 0,
  }
  for (const job of jobList) {
    stageCounts[job.stage as Stage] = (stageCounts[job.stage as Stage] ?? 0) + 1
  }

  return {
    stage_counts: stageCounts,
    funnel_counts: funnelCounts,
    applied_to_screening: rate(funnelCounts.screening, funnelCounts.applied),
    screening_to_interview: rate(funnelCounts.interviewing, funnelCounts.screening),
    interview_to_offer: rate(funnelCounts.offer, funnelCounts.interviewing),
    overall_conversion: rate(funnelCounts.offer, funnelCounts.applied),
  }
}

// ─── Timeline ──────────────────────────────────────────────────────────────────

function getWeekStart(date: Date): string {
  const d = new Date(date)
  const day = d.getDay()
  const diff = d.getDate() - day + (day === 0 ? -6 : 1)
  d.setDate(diff)
  return d.toISOString().split('T')[0]
}

export async function getTimeline(
  supabase: SupabaseClient,
  userId: string
): Promise<TimelinePoint[]> {
  const ninetyDaysAgo = new Date()
  ninetyDaysAgo.setDate(ninetyDaysAgo.getDate() - 90)

  const { data, error } = await supabase
    .from('job_applications')
    .select('applied_at')
    .eq('user_id', userId)
    .not('applied_at', 'is', null)
    .gte('applied_at', ninetyDaysAgo.toISOString())
    .order('applied_at', { ascending: true })

  if (error) throw new AppError(error.message)

  const weekMap = new Map<string, number>()
  for (const row of data ?? []) {
    if (row.applied_at) {
      const week = getWeekStart(new Date(row.applied_at))
      weekMap.set(week, (weekMap.get(week) ?? 0) + 1)
    }
  }

  return Array.from(weekMap.entries())
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([week, count]) => ({ week, count }))
}

// ─── Stage time ────────────────────────────────────────────────────────────────

export async function getStageTime(
  supabase: SupabaseClient,
  userId: string,
  filters: DateRangeFilters = {}
): Promise<StageTimePoint[]> {
  let jobQuery = supabase
    .from('job_applications')
    .select('id')
    .eq('user_id', userId)

  if (filters.from) jobQuery = jobQuery.gte('created_at', filters.from)
  if (filters.to) jobQuery = jobQuery.lte('created_at', filters.to)

  const { data: filteredJobs } = await jobQuery
  const jobIds = (filteredJobs ?? []).map((j) => j.id)

  if (jobIds.length === 0) return []

  const { data, error } = await supabase
    .from('stage_history')
    .select('job_id, from_stage, to_stage, transitioned_at')
    .in('job_id', jobIds)
    .order('transitioned_at', { ascending: true })

  if (error) throw new AppError(error.message)

  const jobTransitions = new Map<string, Array<{ to_stage: Stage; transitioned_at: string }>>()
  for (const row of data ?? []) {
    if (!jobTransitions.has(row.job_id)) jobTransitions.set(row.job_id, [])
    jobTransitions.get(row.job_id)!.push({
      to_stage: row.to_stage as Stage,
      transitioned_at: row.transitioned_at,
    })
  }

  const stageDurations = new Map<Stage, number[]>()
  const now = Date.now()

  for (const transitions of jobTransitions.values()) {
    for (let i = 0; i < transitions.length; i++) {
      const stage = transitions[i].to_stage
      const enteredAt = new Date(transitions[i].transitioned_at).getTime()
      const leftAt =
        i + 1 < transitions.length
          ? new Date(transitions[i + 1].transitioned_at).getTime()
          : now
      const days = (leftAt - enteredAt) / (1000 * 60 * 60 * 24)
      if (!stageDurations.has(stage)) stageDurations.set(stage, [])
      stageDurations.get(stage)!.push(days)
    }
  }

  const result: StageTimePoint[] = []
  for (const [stage, durations] of stageDurations.entries()) {
    const avg = durations.reduce((a, b) => a + b, 0) / durations.length
    result.push({ stage, avg_days: Math.round(avg * 10) / 10 })
  }

  return result
}

// ─── CV comparison (Phase 2) ───────────────────────────────────────────────────

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

export async function getCVComparison(
  supabase: SupabaseClient,
  userId: string,
  filters: DateRangeFilters = {}
): Promise<CVComparisonRow[]> {
  let appsQuery = supabase
    .from('job_applications')
    .select('id, cv_version_id, stage, applied_at, stage_updated_at')
    .eq('user_id', userId)
    .not('stage', 'eq', 'saved')

  if (filters.from) appsQuery = appsQuery.gte('created_at', filters.from)
  if (filters.to) appsQuery = appsQuery.lte('created_at', filters.to)

  const { data: applications, error: appsError } = await appsQuery
  if (appsError) throw new AppError(appsError.message)

  const apps = applications ?? []
  if (apps.length === 0) return []

  const jobIds = apps.map((a) => a.id)

  const { data: history } = await supabase
    .from('stage_history')
    .select('job_id, to_stage')
    .in('job_id', jobIds)

  // Build map: job_id → highest funnel index ever reached
  const jobHighest = new Map<string, number>()
  for (const app of apps) {
    jobHighest.set(app.id, FUNNEL_INDEX[app.stage] ?? -1)
  }
  for (const h of history ?? []) {
    const idx = FUNNEL_INDEX[h.to_stage] ?? -1
    const current = jobHighest.get(h.job_id) ?? -1
    if (idx > current) jobHighest.set(h.job_id, idx)
  }

  const { data: cvVersions, error: cvError } = await supabase
    .from('cv_versions')
    .select('*')
    .eq('user_id', userId)

  if (cvError) throw new AppError(cvError.message)

  // Group applications by cv_version_id
  const grouped = new Map<string | null, typeof apps>()
  for (const app of apps) {
    const key = app.cv_version_id ?? null
    if (!grouped.has(key)) grouped.set(key, [])
    grouped.get(key)!.push(app)
  }

  const rows: CVComparisonRow[] = []

  for (const [versionId, groupApps] of grouped.entries()) {
    const version = (cvVersions ?? []).find((v) => v.id === versionId)
    const versionName = version?.name ?? 'Untagged'
    const totalApplied = groupApps.length

    let reachedScreening = 0
    let reachedInterviewing = 0
    let reachedOffer = 0

    for (const app of groupApps) {
      const highest = jobHighest.get(app.id) ?? 0
      if (highest >= (FUNNEL_INDEX.screening ?? 1)) reachedScreening++
      if (highest >= (FUNNEL_INDEX.interviewing ?? 2)) reachedInterviewing++
      if (highest >= (FUNNEL_INDEX.offer ?? 3)) reachedOffer++
    }

    const daysValues = groupApps
      .filter((a) => a.applied_at !== null && (jobHighest.get(a.id) ?? 0) > (FUNNEL_INDEX.applied ?? 0))
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

    rows.push({
      version_id: versionId,
      version_name: versionName,
      total_applied: totalApplied,
      reached_screening: reachedScreening,
      reached_interviewing: reachedInterviewing,
      reached_offer: reachedOffer,
      avg_days_in_applied: avgDaysInApplied,
      screening_rate: totalApplied > 0 ? Math.round((reachedScreening / totalApplied) * 1000) / 10 : null,
      interview_rate: reachedScreening > 0 ? Math.round((reachedInterviewing / reachedScreening) * 1000) / 10 : null,
      overall_conversion: totalApplied > 0 ? Math.round((reachedOffer / totalApplied) * 1000) / 10 : null,
    })
  }

  return rows.sort((a, b) => b.total_applied - a.total_applied)
}
