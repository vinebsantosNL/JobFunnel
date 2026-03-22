import type { SupabaseClient } from '@supabase/supabase-js'
import type { CVVersion } from '@/types/database.types'
import type { CreateCVVersionInput, UpdateCVVersionInput } from '@/lib/validations/cv-version'
import { AppError, NotFoundError, FreeTierLimitError, ConflictError } from '@/lib/utils/errors'
import { getProfileTier } from '@/lib/services/profileService'

export async function getCVVersions(
  supabase: SupabaseClient,
  userId: string,
  includeArchived = false
): Promise<CVVersion[]> {
  let query = supabase
    .from('cv_versions')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false })

  if (!includeArchived) {
    query = query.eq('is_archived', false)
  }

  const { data, error } = await query
  if (error) throw new AppError(error.message)
  return (data ?? []) as CVVersion[]
}

export async function getCVVersion(
  supabase: SupabaseClient,
  id: string,
  userId: string
): Promise<CVVersion> {
  const { data, error } = await supabase
    .from('cv_versions')
    .select('*')
    .eq('id', id)
    .eq('user_id', userId)
    .single()

  if (error || !data) throw new NotFoundError('CV version not found')
  return data as CVVersion
}

export async function createCVVersion(
  supabase: SupabaseClient,
  userId: string,
  data: CreateCVVersionInput
): Promise<CVVersion> {
  // Business rule: free tier capped at 2 CV versions
  const profile = await getProfileTier(supabase, userId)
  if (profile.subscription_tier === 'free') {
    const { count, error: countError } = await supabase
      .from('cv_versions')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', userId)

    if (countError) throw new AppError(countError.message)
    if ((count ?? 0) >= 2) throw new FreeTierLimitError('CV versions')
  }

  // Business rule: auto-set default for the first version ever created
  const { count: existingCount } = await supabase
    .from('cv_versions')
    .select('*', { count: 'exact', head: true })
    .eq('user_id', userId)

  const shouldBeDefault = data.is_default || (existingCount ?? 0) === 0

  if (shouldBeDefault) {
    await supabase
      .from('cv_versions')
      .update({ is_default: false })
      .eq('user_id', userId)
      .eq('is_default', true)
  }

  const { data: version, error } = await supabase
    .from('cv_versions')
    .insert({
      user_id: userId,
      name: data.name,
      description: data.description ?? null,
      tags: data.tags ?? [],
      is_default: shouldBeDefault,
    })
    .select()
    .single()

  if (error || !version) throw new AppError(error?.message ?? 'Failed to create CV version')
  return version as CVVersion
}

export async function updateCVVersion(
  supabase: SupabaseClient,
  id: string,
  userId: string,
  data: UpdateCVVersionInput
): Promise<CVVersion> {
  // Business rule: clear existing default before setting a new one
  if (data.is_default === true) {
    await supabase
      .from('cv_versions')
      .update({ is_default: false })
      .eq('user_id', userId)
      .eq('is_default', true)
  }

  const { data: version, error } = await supabase
    .from('cv_versions')
    .update(data)
    .eq('id', id)
    .eq('user_id', userId)
    .select()
    .single()

  if (error || !version) throw new NotFoundError('CV version not found')
  return version as CVVersion
}

export async function deleteCVVersion(
  supabase: SupabaseClient,
  id: string,
  userId: string
): Promise<void> {
  // Business rule: cannot delete a version that is linked to job applications
  const { count, error: countError } = await supabase
    .from('job_applications')
    .select('*', { count: 'exact', head: true })
    .eq('cv_version_id', id)
    .eq('user_id', userId)

  if (countError) throw new AppError(countError.message)
  if ((count ?? 0) > 0) {
    throw new ConflictError(
      'Cannot delete a version linked to applications. Archive it instead.'
    )
  }

  const { error } = await supabase
    .from('cv_versions')
    .delete()
    .eq('id', id)
    .eq('user_id', userId)

  if (error) throw new AppError(error.message)
}
