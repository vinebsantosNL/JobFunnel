import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'
import { z } from 'zod'
import { duplicateCVVersion } from '@/lib/services/cvVersionService'
import { handleApiError } from '@/lib/utils/errors'

const duplicateSchema = z.object({
  name: z.string().min(1, 'Name is required').max(100, 'Name must be 100 characters or less'),
})

export async function POST(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params
    const supabase = await createClient()
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (!user || authError) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const parsed = duplicateSchema.safeParse(await request.json())
    if (!parsed.success) return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 })

    const version = await duplicateCVVersion(supabase, id, user.id, parsed.data.name)
    return NextResponse.json(version, { status: 201 })
  } catch (error) {
    return handleApiError(error)
  }
}
