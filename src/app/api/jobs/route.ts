import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'
import { createJobSchema } from '@/lib/validations/job'
import { getJobApplications, createJobApplication } from '@/lib/services/jobService'
import { handleApiError } from '@/lib/utils/errors'
import type { SupabaseClient } from '@supabase/supabase-js'

export async function GET(request: Request) {
  try {
    const supabase = await createClient()
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (!user || authError) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const { searchParams } = new URL(request.url)
    const jobs = await getJobApplications(supabase, user.id, {
      priority: searchParams.get('priority'),
      search: searchParams.get('search'),
    })

    return NextResponse.json(jobs)
  } catch (error) {
    return handleApiError(error)
  }
}

export async function POST(request: Request) {
  try {
    const supabase = await createClient()

    // Support both cookie-based sessions (web app) and Bearer tokens (Chrome extension)
    const authHeader = request.headers.get('authorization')
    if (authHeader?.startsWith('Bearer ')) {
      const token = authHeader.slice(7)
      const { data: { user }, error: authError } = await supabase.auth.getUser(token)
      if (!user || authError) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
      return await handlePost(supabase, user.id, request)
    }

    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (!user || authError) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    return await handlePost(supabase, user.id, request)
  } catch (error) {
    return handleApiError(error)
  }
}

async function handlePost(supabase: SupabaseClient, userId: string, request: Request) {
  const parsed = createJobSchema.safeParse(await request.json())
  if (!parsed.success) return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 })

  const job = await createJobApplication(supabase, userId, parsed.data)
  return NextResponse.json(job, { status: 201 })
}
