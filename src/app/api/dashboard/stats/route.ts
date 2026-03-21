import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

export async function GET() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const thirtyDaysAgo = new Date()
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)

  const [{ data: jobs }, { count: storiesCreated }] = await Promise.all([
    supabase.from('job_applications').select('stage, created_at').eq('user_id', user.id),
    supabase.from('interview_stories').select('id', { count: 'exact', head: true }).eq('user_id', user.id),
  ])

  const allJobs = jobs ?? []
  const cutoff = thirtyDaysAgo.toISOString()

  const screeningCount = allJobs.filter(j => j.stage === 'screening').length
  const interviewingCount = allJobs.filter(j => j.stage === 'interviewing').length
  const offerCount = allJobs.filter(j => j.stage === 'offer').length

  return NextResponse.json({
    totalApplications: allJobs.filter(j => j.stage !== 'saved' && j.created_at >= cutoff).length,
    activeApplications: screeningCount + interviewingCount + offerCount,
    activeBreakdown: { screening: screeningCount, interviewing: interviewingCount, offer: offerCount },
    interviews: interviewingCount,
    storiesCreated: storiesCreated ?? 0,
    hasFirstJob: allJobs.length > 0,
  })
}
