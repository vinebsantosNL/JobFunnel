import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'
import { updateJobSchema } from '@/lib/validations/job'

export async function GET(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { data, error } = await supabase
    .from('job_applications')
    .select('*')
    .eq('id', id)
    .eq('user_id', user.id)
    .single()

  if (error || !data) return NextResponse.json({ error: 'Not found' }, { status: 404 })
  return NextResponse.json(data)
}

export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const body = await request.json()
  const parsed = updateJobSchema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 })
  }

  const updatePayload: Record<string, unknown> = { ...parsed.data }

  const LOCKED_STAGES = ['screening', 'interviewing', 'offer', 'rejected', 'withdrawn'] as const

  // Fetch current job for stage history and version locking
  const { data: current } = await supabase
    .from('job_applications')
    .select('stage, cv_version_id')
    .eq('id', id)
    .eq('user_id', user.id)
    .single()

  if (!current) {
    return NextResponse.json({ error: 'Not found' }, { status: 404 })
  }

  // Version locking: block cv_version_id changes in locked stages
  if (
    'cv_version_id' in parsed.data &&
    parsed.data.cv_version_id !== current.cv_version_id &&
    LOCKED_STAGES.includes(current.stage as typeof LOCKED_STAGES[number])
  ) {
    return NextResponse.json(
      { error: 'CV version cannot be changed after the application reaches screening stage' },
      { status: 422 }
    )
  }

  // Verify cv_version_id belongs to the user if provided
  if (parsed.data.cv_version_id) {
    const { data: versionCheck } = await supabase
      .from('cv_versions')
      .select('id')
      .eq('id', parsed.data.cv_version_id)
      .eq('user_id', user.id)
      .single()
    if (!versionCheck) {
      return NextResponse.json({ error: 'CV version not found' }, { status: 400 })
    }
  }

  if (parsed.data.stage && current.stage !== parsed.data.stage) {
    await supabase.from('stage_history').insert({
      job_id: id,
      from_stage: current.stage,
      to_stage: parsed.data.stage,
    })
    updatePayload['stage_updated_at'] = new Date().toISOString()
  }

  const { data, error } = await supabase
    .from('job_applications')
    .update(updatePayload)
    .eq('id', id)
    .eq('user_id', user.id)
    .select()
    .single()

  if (error || !data) return NextResponse.json({ error: 'Not found or update failed' }, { status: 404 })
  return NextResponse.json(data)
}

export async function DELETE(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { error } = await supabase
    .from('job_applications')
    .delete()
    .eq('id', id)
    .eq('user_id', user.id)

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return new NextResponse(null, { status: 204 })
}
