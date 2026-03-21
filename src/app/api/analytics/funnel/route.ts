import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'
import type { Stage } from '@/types/database'

// Ordered funnel stages (index matters for "at or beyond" logic)
const FUNNEL_STAGES = ['applied', 'screening', 'interviewing', 'offer', 'hired'] as const
type FunnelStage = typeof FUNNEL_STAGES[number]

const FUNNEL_INDEX: Partial<Record<string, number>> = {
  applied: 0, screening: 1, interviewing: 2, offer: 3, hired: 4,
}

const EMPTY_RESPONSE = {
  stage_counts: { saved: 0, applied: 0, screening: 0, interviewing: 0, offer: 0, hired: 0, rejected: 0, withdrawn: 0 },
  funnel_counts: { applied: 0, screening: 0, interviewing: 0, offer: 0 },
  applied_to_screening: 0,
  screening_to_interview: 0,
  interview_to_offer: 0,
  overall_conversion: 0,
}

const rate = (num: number, den: number) =>
  den === 0 ? 0 : Math.round((num / den) * 100)

export async function GET(request: Request) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { searchParams } = new URL(request.url)
  const from = searchParams.get('from')
  const to = searchParams.get('to')

  // Fetch all non-saved applications within the date window
  let jobQuery = supabase
    .from('job_applications')
    .select('id, stage')
    .eq('user_id', user.id)
    .neq('stage', 'saved')

  if (from) jobQuery = jobQuery.gte('created_at', from)
  if (to) jobQuery = jobQuery.lte('created_at', to)

  const { data: jobs, error: jobError } = await jobQuery
  if (jobError) return NextResponse.json({ error: jobError.message }, { status: 500 })

  const jobList = jobs ?? []
  if (jobList.length === 0) return NextResponse.json(EMPTY_RESPONSE)

  const jobIds = jobList.map(j => j.id)

  // Fetch stage_history so we can find the highest stage each job ever reached
  const { data: history } = await supabase
    .from('stage_history')
    .select('job_id, to_stage')
    .in('job_id', jobIds)

  // For each job, track the highest funnel stage index ever reached
  const jobHighest = new Map<string, number>()
  for (const job of jobList) {
    const idx = FUNNEL_INDEX[job.stage] ?? -1
    jobHighest.set(job.id, idx)
  }
  for (const h of history ?? []) {
    const idx = FUNNEL_INDEX[h.to_stage] ?? -1
    const current = jobHighest.get(h.job_id) ?? -1
    if (idx > current) jobHighest.set(h.job_id, idx)
  }

  // Cumulative funnel counts: a job counts for stage S if it ever reached S or beyond
  const funnelCounts = { applied: 0, screening: 0, interviewing: 0, offer: 0 }
  for (const highestIdx of jobHighest.values()) {
    // Index 0=applied, 1=screening, 2=interviewing, 3=offer, 4=hired
    // Cap at 3 (offer) since hired is "beyond offer" and should count toward offer too
    const cap = Math.min(highestIdx, 3)
    for (let i = 0; i <= cap; i++) {
      const stage = FUNNEL_STAGES[i] as keyof typeof funnelCounts
      if (stage in funnelCounts) funnelCounts[stage]++
    }
  }

  // Current stage distribution (for Active/Offers metric cards)
  const stageCounts: Record<Stage, number> = {
    saved: 0, applied: 0, screening: 0, interviewing: 0,
    offer: 0, hired: 0, rejected: 0, withdrawn: 0,
  }
  for (const job of jobList) {
    stageCounts[job.stage as Stage] = (stageCounts[job.stage as Stage] ?? 0) + 1
  }

  return NextResponse.json({
    stage_counts: stageCounts,
    funnel_counts: funnelCounts,
    applied_to_screening: rate(funnelCounts.screening, funnelCounts.applied),
    screening_to_interview: rate(funnelCounts.interviewing, funnelCounts.screening),
    interview_to_offer: rate(funnelCounts.offer, funnelCounts.interviewing),
    overall_conversion: rate(funnelCounts.offer, funnelCounts.applied),
  })
}
