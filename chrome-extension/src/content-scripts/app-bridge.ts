// Runs on the JobFunnel app (prod, staging, localhost).
// Fetches a token from /api/extension/token using the existing cookie session
// (same-origin request — cookies are sent automatically).
// Stores the token in chrome.storage.local so the popup can use it.

import { STORAGE_KEYS } from '../shared/config'
import type { StoredAuth } from '../shared/types'

async function bridge() {
  try {
    const res = await fetch('/api/extension/token', {
      method: 'GET',
      credentials: 'same-origin',
    })

    if (!res.ok) return // user not logged in — silent fail

    const data = await res.json() as { token: string; expiresAt: string; email: string }
    const auth: StoredAuth = {
      token: data.token,
      expiresAt: data.expiresAt,
      email: data.email,
    }

    await chrome.storage.local.set({ [STORAGE_KEYS.AUTH]: auth })
  } catch {
    // Network error or extension context unavailable — silent fail
  }
}

bridge()
