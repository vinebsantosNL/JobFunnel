import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'
import { createJobSchema } from '@/lib/validations/job'

export async function GET(request: Request) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { searchParams } = new URL(request.url)
  const priority = searchParams.get('priority')
  const search = searchParams.get('search')

  let query = supabase
    .from('job_applications')
    .select('*')
    .eq('user_id', user.id)
    .order('stage_updated_at', { ascending: false })

  if (priority && priority !== 'all') {
    query = query.eq('priority', priority)
  }
  if (search) {
    query = query.or(`company_name.ilike.%${search}%,job_title.ilike.%${search}%`)
  }

  const { data, error } = await query
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json(data)
}

export async function POST(request: Request) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  // Free tier limit check: max 5 active applications
  const { count } = await supabase
    .from('job_applications')
    .select('*', { count: 'exact', head: true })
    .eq('user_id', user.id)
    .not('stage', 'in', '("rejected","withdrawn")')

  const { data: profile } = await supabase
    .from('profiles')
    .select('subscription_tier')
    .eq('id', user.id)
    .single()

  if (profile?.subscription_tier === 'free' && (count ?? 0) >= 5) {
    return NextResponse.json(
      { error: 'Free tier limit reached. Upgrade to Pro for unlimited applications.' },
      { status: 403 }
    )
  }

  const body = await request.json()
  const parsed = createJobSchema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 })
  }

  const jobData = {
    ...parsed.data,
    user_id: user.id,
    job_url: parsed.data.job_url || null,
    stage_updated_at: new Date().toISOString(),
  }

  const { data, error } = await supabase
    .from('job_applications')
    .insert(jobData)
    .select()
    .single()

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  // Log initial stage to history
  await supabase.from('stage_history').insert({
    job_id: data.id,
    from_stage: null,
    to_stage: data.stage,
  })

  return NextResponse.json(data, { status: 201 })
}
