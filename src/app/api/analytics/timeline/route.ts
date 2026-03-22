import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'
import { getTimeline } from '@/lib/services/analyticsService'
import { handleApiError } from '@/lib/utils/errors'

export async function GET() {
  try {
    const supabase = await createClient()
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (!user || authError) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const timeline = await getTimeline(supabase, user.id)
    return NextResponse.json(timeline)
  } catch (error) {
    return handleApiError(error)
  }
}
