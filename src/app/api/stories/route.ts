import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'
import { createStorySchema } from '@/lib/validations/story'
import { getStories, createStory } from '@/lib/services/storyService'
import { handleApiError } from '@/lib/utils/errors'

export async function GET(request: Request) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const { searchParams } = new URL(request.url)
    const stories = await getStories(supabase, user.id, {
      search: searchParams.get('search'),
      competency: searchParams.get('competency'),
    })

    return NextResponse.json(stories)
  } catch (error) {
    return handleApiError(error)
  }
}

export async function POST(request: Request) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const parsed = createStorySchema.safeParse(await request.json())
    if (!parsed.success) return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 })

    const story = await createStory(supabase, user.id, parsed.data)
    return NextResponse.json(story, { status: 201 })
  } catch (error) {
    return handleApiError(error)
  }
}
