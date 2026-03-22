import type { SupabaseClient } from '@supabase/supabase-js'
import type { Profile } from '@/types/database.types'
import type { UpdateProfileInput } from '@/lib/validations/profile'
import { AppError, NotFoundError } from '@/lib/utils/errors'

export async function getProfile(supabase: SupabaseClient, userId: string): Promise<Profile> {
  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', userId)
    .single()

  if (error || !data) throw new NotFoundError('Profile not found')
  return data as Profile
}

// Lightweight tier check — used by other services before gated operations.
export async function getProfileTier(
  supabase: SupabaseClient,
  userId: string
): Promise<{ subscription_tier: 'free' | 'pro' }> {
  const { data, error } = await supabase
    .from('profiles')
    .select('subscription_tier')
    .eq('id', userId)
    .single()

  if (error || !data) throw new AppError('Profile not found', 404)
  return data as { subscription_tier: 'free' | 'pro' }
}

export async function updateProfile(
  supabase: SupabaseClient,
  userId: string,
  data: UpdateProfileInput
): Promise<Profile> {
  const { data: profile, error } = await supabase
    .from('profiles')
    .update({ ...data, updated_at: new Date().toISOString() })
    .eq('id', userId)
    .select()
    .single()

  if (error || !profile) throw new AppError('Failed to update profile', 500)
  return profile as Profile
}
