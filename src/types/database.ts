export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[]

export type Stage = 'saved' | 'applied' | 'screening' | 'interviewing' | 'offer' | 'hired' | 'rejected' | 'withdrawn'
export type Priority = 'low' | 'medium' | 'high'
export type UserRole = 'software_engineer' | 'product_manager' | 'data_scientist' | 'other'
export type SubscriptionTier = 'free' | 'pro'

export interface Profile {
  id: string
  email: string
  full_name: string | null
  role: UserRole | null
  years_experience: number | null
  location_country: string | null
  target_countries: string[]
  subscription_tier: SubscriptionTier
  notification_prefs: {
    weekly_summary: boolean
    stale_applications: boolean
  }
  target_role: string | null
  target_date: string | null
  target_salary_min: number | null
  target_salary_max: number | null
  target_salary_currency: string | null
  created_at: string
  updated_at: string
}

export interface JobApplication {
  id: string
  user_id: string
  company_name: string
  job_title: string
  job_url: string | null
  location: string | null
  salary_min: number | null
  salary_max: number | null
  salary_currency: string | null
  stage: Stage
  priority: Priority
  notes: string | null
  applied_at: string | null
  stage_updated_at: string
  cv_version_id: string | null
  cv_versions: { name: string } | null
  created_at: string
  updated_at: string
}

export interface StageHistory {
  id: string
  job_id: string
  from_stage: Stage | null
  to_stage: Stage
  transitioned_at: string
}

export type FileType = 'pdf' | 'docx' | 'external_link'

export interface CVVersion {
  id: string
  user_id: string
  name: string
  description: string | null
  tags: string[]
  is_default: boolean
  is_archived: boolean
  file_url: string | null
  file_type: FileType | null
  created_at: string
  updated_at: string
}

export interface InterviewStory {
  id: string
  user_id: string
  title: string
  situation: string | null
  task: string | null
  action: string | null
  result: string | null
  full_content: string | null
  competencies: string[]
  is_favorite: boolean
  created_at: string
  updated_at: string
}
