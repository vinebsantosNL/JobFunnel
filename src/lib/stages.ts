import type { Stage } from '@/types/database'

export interface StageConfig {
  label: string
  color: string
  bgColor: string
  borderColor: string
  dotColor: string
}

export const STAGE_CONFIG: Record<Stage, StageConfig> = {
  saved: {
    label: 'Saved',
    color: 'text-gray-600',
    bgColor: 'bg-gray-50',
    borderColor: 'border-gray-200',
    dotColor: 'bg-gray-400',
  },
  applied: {
    label: 'Applied',
    color: 'text-blue-600',
    bgColor: 'bg-blue-50',
    borderColor: 'border-blue-200',
    dotColor: 'bg-blue-500',
  },
  screening: {
    label: 'Screening',
    color: 'text-purple-600',
    bgColor: 'bg-purple-50',
    borderColor: 'border-purple-200',
    dotColor: 'bg-purple-500',
  },
  interviewing: {
    label: 'Interviewing',
    color: 'text-amber-600',
    bgColor: 'bg-amber-50',
    borderColor: 'border-amber-200',
    dotColor: 'bg-amber-500',
  },
  offer: {
    label: 'Offer',
    color: 'text-green-600',
    bgColor: 'bg-green-50',
    borderColor: 'border-green-200',
    dotColor: 'bg-green-500',
  },
  rejected: {
    label: 'Rejected',
    color: 'text-red-500',
    bgColor: 'bg-red-50',
    borderColor: 'border-red-200',
    dotColor: 'bg-red-400',
  },
  withdrawn: {
    label: 'Withdrawn',
    color: 'text-gray-500',
    bgColor: 'bg-gray-50',
    borderColor: 'border-gray-200',
    dotColor: 'bg-gray-400',
  },
}

export const STAGES: Stage[] = ['saved', 'applied', 'screening', 'interviewing', 'offer', 'rejected', 'withdrawn']

export const PRIORITY_CONFIG = {
  low: { label: 'Low', color: 'bg-gray-300' },
  medium: { label: 'Medium', color: 'bg-amber-400' },
  high: { label: 'High', color: 'bg-red-500' },
}
