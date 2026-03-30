import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

// Short-lived token issued to the Chrome extension.
// The extension stores this in chrome.storage.local and sends it as
// Authorization: Bearer <token> on POST /api/jobs calls.
//
// Implementation: we re-use the Supabase access token from the current session.
// The extension cannot access browser cookies, so this endpoint bridges the gap.
// The token expires when the Supabase session expires (~1 hour for access tokens).

export async function GET() {
  const supabase = await createClient()

  const { data: { session }, error } = await supabase.auth.getSession()

  if (!session || error) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  return NextResponse.json({
    token: session.access_token,
    expiresAt: new Date(session.expires_at! * 1000).toISOString(),
    email: session.user.email,
  })
}
