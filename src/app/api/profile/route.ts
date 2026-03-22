import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'
import { updateProfileSchema } from '@/lib/validations/profile'
import { getProfile, updateProfile } from '@/lib/services/profileService'
import { handleApiError } from '@/lib/utils/errors'

export async function GET() {
  try {
    const supabase = await createClient()
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (!user || authError) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const profile = await getProfile(supabase, user.id)
    return NextResponse.json(profile)
  } catch (error) {
    return handleApiError(error)
  }
}

export async function PATCH(request: Request) {
  try {
    const supabase = await createClient()
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (!user || authError) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const parsed = updateProfileSchema.safeParse(await request.json())
    if (!parsed.success) return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 })

    const profile = await updateProfile(supabase, user.id, parsed.data)
    return NextResponse.json(profile)
  } catch (error) {
    return handleApiError(error)
  }
}
