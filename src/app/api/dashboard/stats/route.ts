import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

export async function GET() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const [{ data: jobs }, { count: storiesCreated }] = await Promise.all([
    supabase.from('job_applications').select('stage').eq('user_id', user.id),
    supabase.from('interview_stories').select('id', { count: 'exact', head: true }).eq('user_id', user.id),
  ])

  const allJobs = jobs ?? []

  return NextResponse.json({
    totalApplications: allJobs.filter((j) => j.stage !== 'saved').length,
    activeApplications: allJobs.filter((j) =>
      ['applied', 'screening', 'interviewing'].includes(j.stage)
    ).length,
    interviews: allJobs.filter((j) => ['interviewing', 'offer'].includes(j.stage)).length,
    storiesCreated: storiesCreated ?? 0,
    hasFirstJob: allJobs.length > 0,
  })
}
