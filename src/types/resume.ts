// Structured content model for a CV version.
// Stored as JSONB in cv_versions.resume_data.
// Template is a rendering concern only — this is pure data.

export interface ResumeContact {
  firstName: string
  lastName: string
  targetTitle: string
  email: string
  location: string
  linkedin?: string
  phone?: string
  website?: string
}

export interface ResumeBullet {
  id: string
  text: string
}

export interface ResumeExperience {
  id: string
  company: string
  title: string
  location?: string
  startDate: string   // "Jan 2022"
  endDate: string     // "Present" | "Dec 2021"
  bullets: ResumeBullet[]
}

export interface ResumeEducation {
  id: string
  institution: string
  degree: string
  field?: string
  startDate?: string
  endDate?: string
  grade?: string
}

export type CEFRLevel = 'A1' | 'A2' | 'B1' | 'B2' | 'C1' | 'C2'

export interface ResumeLanguage {
  id: string
  language: string
  level: CEFRLevel
}

export interface ResumeCertification {
  id: string
  name: string
  issuer?: string
  date?: string
}

export interface ResumeProject {
  id: string
  name: string
  description?: string
  url?: string
  technologies?: string[]
}

export interface ResumeData {
  contact: ResumeContact
  summary?: string
  experience: ResumeExperience[]
  education: ResumeEducation[]
  skills: string[]
  languages: ResumeLanguage[]
  certifications?: ResumeCertification[]
  projects?: ResumeProject[]
  sectionOrder: string[]
}

export const EMPTY_RESUME_DATA: ResumeData = {
  contact: {
    firstName: '',
    lastName: '',
    targetTitle: '',
    email: '',
    location: '',
  },
  summary: '',
  experience: [],
  education: [],
  skills: [],
  languages: [],
  sectionOrder: ['contact', 'summary', 'experience', 'skills', 'education', 'languages'],
}
