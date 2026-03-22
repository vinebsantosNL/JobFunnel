import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'
import { updateStorySchema } from '@/lib/validations/story'
import { getStory, updateStory, deleteStory } from '@/lib/services/storyService'
import { handleApiError } from '@/lib/utils/errors'

export async function GET(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params
    const supabase = await createClient()
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (!user || authError) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const story = await getStory(supabase, id, user.id)
    return NextResponse.json(story)
  } catch (error) {
    return handleApiError(error)
  }
}

export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params
    const supabase = await createClient()
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (!user || authError) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const parsed = updateStorySchema.safeParse(await request.json())
    if (!parsed.success) return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 })

    const story = await updateStory(supabase, id, user.id, parsed.data)
    return NextResponse.json(story)
  } catch (error) {
    return handleApiError(error)
  }
}

export async function DELETE(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params
    const supabase = await createClient()
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (!user || authError) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    await deleteStory(supabase, id, user.id)
    return new NextResponse(null, { status: 204 })
  } catch (error) {
    return handleApiError(error)
  }
}
