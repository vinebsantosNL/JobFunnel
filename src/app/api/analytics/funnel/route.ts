import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'
import type { Stage } from '@/types/database'

export async function GET(request: Request) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { searchParams } = new URL(request.url)
  const from = searchParams.get('from')
  const to = searchParams.get('to')

  let query = supabase
    .from('job_applications')
    .select('stage')
    .eq('user_id', user.id)

  if (from) query = query.gte('applied_at', from)
  if (to) query = query.lte('applied_at', to)

  const { data, error } = await query
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  const stageCounts: Record<Stage, number> = {
    saved: 0, applied: 0, screening: 0, interviewing: 0, offer: 0, rejected: 0, withdrawn: 0,
  }
  for (const row of data ?? []) {
    stageCounts[row.stage as Stage] = (stageCounts[row.stage as Stage] ?? 0) + 1
  }

  const rate = (num: number, den: number) => den === 0 ? 0 : Math.round((num / den) * 100)

  return NextResponse.json({
    stage_counts: stageCounts,
    applied_to_screening: rate(stageCounts.screening, stageCounts.applied),
    screening_to_interview: rate(stageCounts.interviewing, stageCounts.screening),
    interview_to_offer: rate(stageCounts.offer, stageCounts.interviewing),
    overall_conversion: rate(stageCounts.offer, stageCounts.applied),
  })
}
