import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'
import { createCVVersionSchema } from '@/lib/validations/cv-version'
import { getCVVersions, createCVVersion } from '@/lib/services/cvVersionService'
import { handleApiError } from '@/lib/utils/errors'

export async function GET(request: Request) {
  try {
    const supabase = await createClient()
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (!user || authError) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const { searchParams } = new URL(request.url)
    const includeArchived = searchParams.get('include_archived') === 'true'

    const versions = await getCVVersions(supabase, user.id, includeArchived)
    return NextResponse.json(versions)
  } catch (error) {
    return handleApiError(error)
  }
}

export async function POST(request: Request) {
  try {
    const supabase = await createClient()
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (!user || authError) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const parsed = createCVVersionSchema.safeParse(await request.json())
    if (!parsed.success) return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 })

    const version = await createCVVersion(supabase, user.id, parsed.data)
    return NextResponse.json(version, { status: 201 })
  } catch (error) {
    return handleApiError(error)
  }
}
