'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'

export function AuthErrorRedirect() {
  const router = useRouter()

  useEffect(() => {
    const hash = window.location.hash
    const search = window.location.search

    if (hash && hash.includes('error=')) {
      router.replace('/login?error=auth_error')
      return
    }

    // Supabase sometimes lands the auth code on the homepage when
    // emailRedirectTo points to the wrong origin. Forward it to the callback.
    const params = new URLSearchParams(search)
    const code = params.get('code')
    if (code) {
      router.replace(`/api/auth/callback?code=${code}`)
    }
  }, [router])

  return null
}
