import type { SupabaseClient } from '@supabase/supabase-js'
import { AppError } from '@/lib/utils/errors'

export interface DashboardStats {
  totalApplications: number
  activeApplications: number
  activeBreakdown: { screening: number; interviewing: number; offer: number }
  interviews: number
  storiesCreated: number
  hasFirstJob: boolean
  hasCVVersion: boolean
}

export async function getDashboardStats(
  supabase: SupabaseClient,
  userId: string
): Promise<DashboardStats> {
  const thirtyDaysAgo = new Date()
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)
  const cutoff = thirtyDaysAgo.toISOString()

  const [{ data: jobs, error: jobsError }, { count: storiesCreated }, { count: cvVersionsCount }] =
    await Promise.all([
      supabase.from('job_applications').select('stage, created_at').eq('user_id', userId),
      supabase
        .from('interview_stories')
        .select('id', { count: 'exact', head: true })
        .eq('user_id', userId),
      supabase
        .from('cv_versions')
        .select('id', { count: 'exact', head: true })
        .eq('user_id', userId),
    ])

  if (jobsError) throw new AppError(jobsError.message)

  const allJobs = jobs ?? []
  const screeningCount = allJobs.filter((j) => j.stage === 'screening').length
  const interviewingCount = allJobs.filter((j) => j.stage === 'interviewing').length
  const offerCount = allJobs.filter((j) => j.stage === 'offer').length

  return {
    totalApplications: allJobs.filter((j) => j.stage !== 'saved' && j.created_at >= cutoff).length,
    activeApplications: screeningCount + interviewingCount + offerCount,
    activeBreakdown: { screening: screeningCount, interviewing: interviewingCount, offer: offerCount },
    interviews: interviewingCount,
    storiesCreated: storiesCreated ?? 0,
    hasFirstJob: allJobs.length > 0,
    hasCVVersion: (cvVersionsCount ?? 0) > 0,
  }
}
