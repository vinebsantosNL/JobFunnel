import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'
import { createJobSchema } from '@/lib/validations/job'
import { getJobApplications, createJobApplication } from '@/lib/services/jobService'
import { handleApiError } from '@/lib/utils/errors'

export async function GET(request: Request) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

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
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const parsed = createJobSchema.safeParse(await request.json())
    if (!parsed.success) return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 })

    const job = await createJobApplication(supabase, user.id, parsed.data)
    return NextResponse.json(job, { status: 201 })
  } catch (error) {
    return handleApiError(error)
  }
}
