import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'
import type { Stage } from '@/types/database'

export async function GET() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { data, error } = await supabase
    .from('stage_history')
    .select('job_id, from_stage, to_stage, transitioned_at, job_applications!inner(user_id)')
    .eq('job_applications.user_id', user.id)
    .order('transitioned_at', { ascending: true })

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

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
      const leftAt = i + 1 < transitions.length
        ? new Date(transitions[i + 1].transitioned_at).getTime()
        : now
      const days = (leftAt - enteredAt) / (1000 * 60 * 60 * 24)
      if (!stageDurations.has(stage)) stageDurations.set(stage, [])
      stageDurations.get(stage)!.push(days)
    }
  }

  const result: Array<{ stage: Stage; avg_days: number }> = []
  for (const [stage, durations] of stageDurations.entries()) {
    const avg = durations.reduce((a, b) => a + b, 0) / durations.length
    result.push({ stage, avg_days: Math.round(avg * 10) / 10 })
  }

  return NextResponse.json(result)
}
