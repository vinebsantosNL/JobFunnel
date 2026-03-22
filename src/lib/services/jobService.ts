import type { SupabaseClient } from '@supabase/supabase-js'
import type { JobApplication } from '@/types/database.types'
import type { CreateJobInput, UpdateJobInput } from '@/lib/validations/job'
import { AppError, NotFoundError, FreeTierLimitError, CVLockedError } from '@/lib/utils/errors'
import { getProfileTier } from '@/lib/services/profileService'

const SEQUENTIAL_STAGES = [
  'saved', 'applied', 'screening', 'interviewing', 'offer', 'hired',
] as const
type SequentialStage = typeof SEQUENTIAL_STAGES[number]

const STAGE_ORDER: Record<string, number> = {
  saved: 0, applied: 1, screening: 2, interviewing: 3, offer: 4, hired: 5,
}

const LOCKED_STAGES = new Set(['screening', 'interviewing', 'offer', 'hired', 'rejected', 'withdrawn'])

export interface GetJobsFilters {
  priority?: string | null
  search?: string | null
}

export async function getJobApplications(
  supabase: SupabaseClient,
  userId: string,
  filters: GetJobsFilters = {}
): Promise<JobApplication[]> {
  let query = supabase
    .from('job_applications')
    .select('*, cv_versions(name)')
    .eq('user_id', userId)
    .order('stage_updated_at', { ascending: false })

  if (filters.priority && filters.priority !== 'all') {
    query = query.eq('priority', filters.priority)
  }
  if (filters.search) {
    query = query.or(
      `company_name.ilike.%${filters.search}%,job_title.ilike.%${filters.search}%`
    )
  }

  const { data, error } = await query
  if (error) throw new AppError(error.message)
  return (data ?? []) as JobApplication[]
}

export async function getJobApplication(
  supabase: SupabaseClient,
  jobId: string,
  userId: string
): Promise<JobApplication> {
  const { data, error } = await supabase
    .from('job_applications')
    .select('*')
    .eq('id', jobId)
    .eq('user_id', userId)
    .single()

  if (error || !data) throw new NotFoundError('Job application not found')
  return data as JobApplication
}

export async function createJobApplication(
  supabase: SupabaseClient,
  userId: string,
  data: CreateJobInput
): Promise<JobApplication> {
  // Business rule: enforce free tier limit of 5 active applications
  const profile = await getProfileTier(supabase, userId)
  if (profile.subscription_tier === 'free') {
    const { count, error: countError } = await supabase
      .from('job_applications')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', userId)
      .not('stage', 'in', '("rejected","withdrawn")')

    if (countError) throw new AppError(countError.message)
    if ((count ?? 0) >= 5) throw new FreeTierLimitError('active applications')
  }

  // Business rule: verify CV version ownership or fall back to user's default
  let resolvedCVVersionId: string | null = data.cv_version_id ?? null
  if (resolvedCVVersionId) {
    const { data: versionCheck } = await supabase
      .from('cv_versions')
      .select('id')
      .eq('id', resolvedCVVersionId)
      .eq('user_id', userId)
      .single()

    if (!versionCheck) throw new AppError('CV version not found', 400)
  } else {
    const { data: defaultVersion } = await supabase
      .from('cv_versions')
      .select('id')
      .eq('user_id', userId)
      .eq('is_default', true)
      .eq('is_archived', false)
      .single()

    resolvedCVVersionId = defaultVersion?.id ?? null
  }

  const { data: job, error } = await supabase
    .from('job_applications')
    .insert({
      ...data,
      user_id: userId,
      job_url: data.job_url || null,
      stage_updated_at: new Date().toISOString(),
      cv_version_id: resolvedCVVersionId,
    })
    .select()
    .single()

  if (error || !job) throw new AppError(error?.message ?? 'Failed to create job application')

  // Log initial stage to history
  await supabase.from('stage_history').insert({
    job_id: job.id,
    from_stage: null,
    to_stage: job.stage,
  })

  return job as JobApplication
}

export async function updateJobApplication(
  supabase: SupabaseClient,
  jobId: string,
  userId: string,
  data: UpdateJobInput
): Promise<JobApplication> {
  const updatePayload: Record<string, unknown> = { ...data }

  // Fetch current state for business rule evaluation
  const { data: current, error: fetchError } = await supabase
    .from('job_applications')
    .select('stage, cv_version_id')
    .eq('id', jobId)
    .eq('user_id', userId)
    .single()

  if (fetchError || !current) throw new NotFoundError('Job application not found')

  // Business rule: CV version is locked once at screening or beyond
  if (
    'cv_version_id' in data &&
    data.cv_version_id !== current.cv_version_id &&
    LOCKED_STAGES.has(current.stage)
  ) {
    throw new CVLockedError()
  }

  // Verify CV version ownership if a new one is provided
  if (data.cv_version_id) {
    const { data: versionCheck } = await supabase
      .from('cv_versions')
      .select('id')
      .eq('id', data.cv_version_id)
      .eq('user_id', userId)
      .single()

    if (!versionCheck) throw new AppError('CV version not found', 400)
  }

  // Business rule: log stage history including skipped intermediate stages
  if (data.stage && current.stage !== data.stage) {
    const fromIdx = STAGE_ORDER[current.stage] ?? -1
    const toIdx = STAGE_ORDER[data.stage] ?? -1

    // Insert intermediate entries for skipped sequential stages
    if (fromIdx >= 0 && toIdx > fromIdx + 1) {
      for (let i = fromIdx; i < toIdx - 1; i++) {
        await supabase.from('stage_history').insert({
          job_id: jobId,
          from_stage: SEQUENTIAL_STAGES[i] as SequentialStage,
          to_stage: SEQUENTIAL_STAGES[i + 1] as SequentialStage,
        })
      }
    }

    await supabase.from('stage_history').insert({
      job_id: jobId,
      from_stage: current.stage,
      to_stage: data.stage,
    })
    updatePayload['stage_updated_at'] = new Date().toISOString()
  }

  const { data: updated, error } = await supabase
    .from('job_applications')
    .update(updatePayload)
    .eq('id', jobId)
    .eq('user_id', userId)
    .select()
    .single()

  if (error || !updated) throw new AppError(error?.message ?? 'Update failed')
  return updated as JobApplication
}

export async function deleteJobApplication(
  supabase: SupabaseClient,
  jobId: string,
  userId: string
): Promise<void> {
  const { error } = await supabase
    .from('job_applications')
    .delete()
    .eq('id', jobId)
    .eq('user_id', userId)

  if (error) throw new AppError(error.message)
}
