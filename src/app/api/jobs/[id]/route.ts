import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'
import { updateJobSchema } from '@/lib/validations/job'
import { getJobApplication, updateJobApplication, deleteJobApplication } from '@/lib/services/jobService'
import { handleApiError } from '@/lib/utils/errors'

export async function GET(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params
    const supabase = await createClient()
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (!user || authError) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const job = await getJobApplication(supabase, id, user.id)
    return NextResponse.json(job)
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

    const parsed = updateJobSchema.safeParse(await request.json())
    if (!parsed.success) return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 })

    const job = await updateJobApplication(supabase, id, user.id, parsed.data)
    return NextResponse.json(job)
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

    await deleteJobApplication(supabase, id, user.id)
    return new NextResponse(null, { status: 204 })
  } catch (error) {
    return handleApiError(error)
  }
}
