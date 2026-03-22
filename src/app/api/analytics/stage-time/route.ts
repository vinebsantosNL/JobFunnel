import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'
import { getStageTime } from '@/lib/services/analyticsService'
import { handleApiError } from '@/lib/utils/errors'

export async function GET(request: Request) {
  try {
    const supabase = await createClient()
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (!user || authError) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const { searchParams } = new URL(request.url)
    const stageTime = await getStageTime(supabase, user.id, {
      from: searchParams.get('from'),
      to: searchParams.get('to'),
    })

    return NextResponse.json(stageTime)
  } catch (error) {
    return handleApiError(error)
  }
}
