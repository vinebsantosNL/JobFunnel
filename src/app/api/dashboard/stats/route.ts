import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'
import { getDashboardStats } from '@/lib/services/dashboardService'
import { handleApiError } from '@/lib/utils/errors'

export async function GET() {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const stats = await getDashboardStats(supabase, user.id)
    return NextResponse.json(stats)
  } catch (error) {
    return handleApiError(error)
  }
}
