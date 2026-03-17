import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

function getWeekStart(date: Date): string {
  const d = new Date(date)
  const day = d.getDay()
  const diff = d.getDate() - day + (day === 0 ? -6 : 1)
  d.setDate(diff)
  return d.toISOString().split('T')[0]
}

export async function GET() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const ninetyDaysAgo = new Date()
  ninetyDaysAgo.setDate(ninetyDaysAgo.getDate() - 90)

  const { data, error } = await supabase
    .from('job_applications')
    .select('applied_at')
    .eq('user_id', user.id)
    .not('applied_at', 'is', null)
    .gte('applied_at', ninetyDaysAgo.toISOString())
    .order('applied_at', { ascending: true })

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  const weekMap = new Map<string, number>()
  for (const row of data ?? []) {
    if (row.applied_at) {
      const week = getWeekStart(new Date(row.applied_at))
      weekMap.set(week, (weekMap.get(week) ?? 0) + 1)
    }
  }

  const result = Array.from(weekMap.entries())
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([week, count]) => ({ week, count }))

  return NextResponse.json(result)
}
