import { API_BASE, STORAGE_KEYS } from './config'
import type { SaveJobPayload, StoredAuth } from './types'

async function getStoredAuth(): Promise<StoredAuth | null> {
  const result = await chrome.storage.local.get(STORAGE_KEYS.AUTH)
  const auth = result[STORAGE_KEYS.AUTH] as StoredAuth | undefined
  if (!auth) return null

  // Check expiry — refresh if within 5 minutes of expiry
  const expiresAt = new Date(auth.expiresAt).getTime()
  const now = Date.now()
  if (expiresAt - now < 5 * 60 * 1000) {
    return await refreshToken()
  }

  return auth
}

async function refreshToken(): Promise<StoredAuth | null> {
  try {
    const res = await fetch(`${API_BASE}/api/extension/token`, {
      method: 'GET',
      credentials: 'include',
    })
    if (!res.ok) {
      // Session expired — clear stored auth
      await chrome.storage.local.remove(STORAGE_KEYS.AUTH)
      return null
    }
    const data = await res.json() as { token: string; expiresAt: string; email: string }
    const auth: StoredAuth = { token: data.token, expiresAt: data.expiresAt, email: data.email }
    await chrome.storage.local.set({ [STORAGE_KEYS.AUTH]: auth })
    return auth
  } catch {
    return null
  }
}

export async function saveJob(payload: SaveJobPayload): Promise<{ jobId: string }> {
  const auth = await getStoredAuth()
  if (!auth) throw new Error('NOT_CONNECTED')

  const res = await fetch(`${API_BASE}/api/jobs`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${auth.token}`,
    },
    body: JSON.stringify({
      company_name: payload.company_name,
      job_title: payload.job_title,
      location: payload.location,
      job_url: payload.job_url,
      salary_min: payload.salary_min,
      salary_max: payload.salary_max,
      salary_currency: payload.salary_currency,
      job_description: payload.job_description,
      stage: payload.stage,
      priority: payload.priority,
      source: 'extension',
    }),
  })

  if (res.status === 402 || res.status === 403) throw new Error('FREE_TIER_LIMIT')
  if (!res.ok) {
    const body = await res.json().catch(() => ({})) as { error?: string }
    throw new Error(body.error ?? 'SAVE_FAILED')
  }

  const data = await res.json() as { id: string }
  return { jobId: data.id }
}

export async function checkAuthState(): Promise<{ isConnected: boolean; email: string | null }> {
  const auth = await getStoredAuth()
  return { isConnected: !!auth, email: auth?.email ?? null }
}

export async function getSavedJobId(url: string): Promise<string | null> {
  const result = await chrome.storage.local.get(STORAGE_KEYS.SAVED_JOBS)
  const saved = (result[STORAGE_KEYS.SAVED_JOBS] ?? {}) as Record<string, string>
  return saved[url] ?? null
}

export async function markJobSaved(url: string, jobId: string): Promise<void> {
  const result = await chrome.storage.local.get(STORAGE_KEYS.SAVED_JOBS)
  const saved = (result[STORAGE_KEYS.SAVED_JOBS] ?? {}) as Record<string, string>
  saved[url] = jobId
  await chrome.storage.local.set({ [STORAGE_KEYS.SAVED_JOBS]: saved })
}
