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

  // getUser() validates the JWT with the Supabase auth server (server-safe).
  // getSession() alone is insecure on the server — it reads the cookie without validation.
  const { data: { user }, error: userError } = await supabase.auth.getUser()
  if (!user || userError) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { data: { session } } = await supabase.auth.getSession()
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  return NextResponse.json({
    token: session.access_token,
    expiresAt: new Date(session.expires_at! * 1000).toISOString(),
    email: user.email,
  })
}
