// Switch between local dev and production
export const API_BASE =
  process.env.NODE_ENV === 'development'
    ? 'http://localhost:3000'
    : 'https://job-funnel-lime.vercel.app'

// All known app origins — used by the bridge to determine which host it's on
export const APP_ORIGINS = [
  'https://job-funnel-lime.vercel.app',
  'https://job-funnel-git-staging-vinebsantosnls-projects.vercel.app',
  'http://localhost:3000',
]

export const STORAGE_KEYS = {
  AUTH: 'jf_auth',
  SAVED_JOBS: 'jf_saved_jobs', // Record<url, jobId> for "already saved" detection
} as const

export const MAX_DESCRIPTION_LENGTH = 8000
