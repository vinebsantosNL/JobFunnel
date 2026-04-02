export type Stage = 'saved' | 'applied' | 'screening' | 'interviewing' | 'offer'
export type Priority = 'low' | 'medium' | 'high'
export type BoardSource = 'linkedin' | 'indeed' | 'stepstone' | 'glassdoor' | 'xing'

export interface ScrapedJob {
  company_name: string
  job_title: string
  location: string | null
  salary_min: number | null
  salary_max: number | null
  salary_currency: string | null
  job_url: string
  job_description: string | null
  source: BoardSource
}

export interface SaveJobPayload extends ScrapedJob {
  stage: Stage
  priority: Priority
}

// Messages between content script and service worker
export type ExtMessage =
  | { type: 'GET_SCRAPED_JOB' }
  | { type: 'SCRAPED_JOB'; payload: ScrapedJob | null }
  | { type: 'SAVE_JOB'; payload: SaveJobPayload }
  | { type: 'SAVE_JOB_SUCCESS'; jobId: string }
  | { type: 'SAVE_JOB_ERROR'; error: string }
  | { type: 'GET_AUTH_STATE' }
  | { type: 'AUTH_STATE'; isConnected: boolean; email: string | null }
  | { type: 'PAGE_JOB_DATA'; payload: ScrapedJob | null }

export interface StoredAuth {
  token: string
  expiresAt: string // ISO string
  email: string
}

export interface StoredJobCheck {
  url: string
  jobId: string
  savedAt: string
}
