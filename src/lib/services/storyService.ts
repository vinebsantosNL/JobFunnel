import type { SupabaseClient } from '@supabase/supabase-js'
import type { InterviewStory } from '@/types/database.types'
import type { CreateStoryInput, UpdateStoryInput } from '@/lib/validations/story'
import { AppError, NotFoundError } from '@/lib/utils/errors'

export interface GetStoriesFilters {
  search?: string | null
  competency?: string | null
}

export async function getStories(
  supabase: SupabaseClient,
  userId: string,
  filters: GetStoriesFilters = {}
): Promise<InterviewStory[]> {
  let query = supabase
    .from('interview_stories')
    .select('*')
    .eq('user_id', userId)
    .order('is_favorite', { ascending: false })
    .order('updated_at', { ascending: false })

  if (filters.search) {
    query = query.or(
      `title.ilike.%${filters.search}%,situation.ilike.%${filters.search}%,full_content.ilike.%${filters.search}%`
    )
  }
  if (filters.competency) {
    query = query.contains('competencies', [filters.competency])
  }

  const { data, error } = await query
  if (error) throw new AppError(error.message)
  return (data ?? []) as InterviewStory[]
}

export async function getStory(
  supabase: SupabaseClient,
  storyId: string,
  userId: string
): Promise<InterviewStory> {
  const { data, error } = await supabase
    .from('interview_stories')
    .select('*')
    .eq('id', storyId)
    .eq('user_id', userId)
    .single()

  if (error || !data) throw new NotFoundError('Story not found')
  return data as InterviewStory
}

export async function createStory(
  supabase: SupabaseClient,
  userId: string,
  data: CreateStoryInput
): Promise<InterviewStory> {
  const { data: story, error } = await supabase
    .from('interview_stories')
    .insert({ ...data, user_id: userId })
    .select()
    .single()

  if (error || !story) throw new AppError(error?.message ?? 'Failed to create story')
  return story as InterviewStory
}

export async function updateStory(
  supabase: SupabaseClient,
  storyId: string,
  userId: string,
  data: UpdateStoryInput
): Promise<InterviewStory> {
  const { data: story, error } = await supabase
    .from('interview_stories')
    .update(data)
    .eq('id', storyId)
    .eq('user_id', userId)
    .select()
    .single()

  if (error || !story) throw new NotFoundError('Story not found')
  return story as InterviewStory
}

export async function deleteStory(
  supabase: SupabaseClient,
  storyId: string,
  userId: string
): Promise<void> {
  const { error } = await supabase
    .from('interview_stories')
    .delete()
    .eq('id', storyId)
    .eq('user_id', userId)

  if (error) throw new AppError(error.message)
}
