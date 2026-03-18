import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'
import { createCVVersionSchema } from '@/lib/validations/cv-version'

export async function GET(request: Request) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { searchParams } = new URL(request.url)
  const includeArchived = searchParams.get('include_archived') === 'true'

  let query = supabase
    .from('cv_versions')
    .select('*')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false })

  if (!includeArchived) {
    query = query.eq('is_archived', false)
  }

  const { data, error } = await query
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json(data)
}

export async function POST(request: Request) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { data: profile } = await supabase
    .from('profiles')
    .select('subscription_tier')
    .eq('id', user.id)
    .single()

  // Free tier limit: max 2 versions
  if (profile?.subscription_tier === 'free') {
    const { count } = await supabase
      .from('cv_versions')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', user.id)

    if ((count ?? 0) >= 2) {
      return NextResponse.json(
        { error: 'Free tier limit reached. Upgrade to Pro for unlimited CV versions.' },
        { status: 403 }
      )
    }
  }

  const body = await request.json()
  const parsed = createCVVersionSchema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 })
  }

  // Check if user has any existing versions (to auto-set default for first one)
  const { count: existingCount } = await supabase
    .from('cv_versions')
    .select('*', { count: 'exact', head: true })
    .eq('user_id', user.id)

  const isFirstVersion = (existingCount ?? 0) === 0
  const shouldBeDefault = parsed.data.is_default || isFirstVersion

  // If setting as default, clear existing default first
  if (shouldBeDefault) {
    await supabase
      .from('cv_versions')
      .update({ is_default: false })
      .eq('user_id', user.id)
      .eq('is_default', true)
  }

  const { data, error } = await supabase
    .from('cv_versions')
    .insert({
      user_id: user.id,
      name: parsed.data.name,
      description: parsed.data.description ?? null,
      tags: parsed.data.tags ?? [],
      is_default: shouldBeDefault,
    })
    .select()
    .single()

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json(data, { status: 201 })
}
