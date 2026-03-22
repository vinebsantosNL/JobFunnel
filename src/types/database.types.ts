// Manually maintained until Supabase CLI is integrated into this project.
//
// When the CLI is available, run:
//   npm run generate:types
//
// WARNING: The CLI outputs a `Database` type with nested Tables/Row/Insert/Update keys.
// Running generate:types will overwrite this file and break all 28 import sites that
// use named exports (Profile, JobApplication, etc.). Before running, migrate all imports
// to the Database['public']['Tables'][...]['Row'] pattern first.
// See: https://supabase.com/docs/guides/api/rest/generating-types

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

export type TemplateId = 'precision' | 'modern_tech' | 'compact_eu' | 'europass' | 'senior_ic'

export interface CVVersion {
  id: string
  user_id: string
  name: string
  description: string | null
  tags: string[]
  is_default: boolean
  is_archived: boolean
  is_locked: boolean
  template_id: TemplateId
  resume_data: Json
  target_country: string | null
  /** @deprecated kept for schema stability, never written to */
  file_url: string | null
  /** @deprecated kept for schema stability, never written to */
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
