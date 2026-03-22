import type { Stage } from '@/types/database.types'

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
  hired: {
    label: 'Hired',
    color: 'text-emerald-700',
    bgColor: 'bg-emerald-50',
    borderColor: 'border-emerald-300',
    dotColor: 'bg-emerald-500',
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

export const STAGES: Stage[] = ['saved', 'applied', 'screening', 'interviewing', 'offer', 'hired', 'rejected', 'withdrawn']

// Sequential funnel stages (skippable steps used for skip detection)
export const SEQUENTIAL_STAGES: Stage[] = ['saved', 'applied', 'screening', 'interviewing', 'offer', 'hired']

// Stage order index for skip detection
export const STAGE_ORDER: Partial<Record<Stage, number>> = {
  saved: 0,
  applied: 1,
  screening: 2,
  interviewing: 3,
  offer: 4,
  hired: 5,
}

// Active stages for pipeline counter (in-progress applications)
export const ACTIVE_STAGES: Stage[] = ['applied', 'screening', 'interviewing', 'offer']

// Hex values for each stage — used in Recharts/react-pdf where Tailwind classes don't apply
export const STAGE_HEX: Partial<Record<Stage, string>> = {
  saved:        '#94A3B8',
  applied:      '#2563EB',
  screening:    '#7C3AED',
  interviewing: '#F59E0B',
  offer:        '#10B981',
  hired:        '#059669',
  rejected:     '#EF4444',
  withdrawn:    '#94A3B8',
}

// Generic chart palette for CV comparison / multi-series charts
export const CHART_PALETTE = ['#2563EB', '#7C3AED', '#10B981', '#94A3B8', '#F59E0B', '#06B6D4', '#EC4899']

// Row accent palette for comparison tables (same blue/slate/… sequence)
export const TABLE_ROW_COLORS = ['#2563EB', '#64748B', '#93C5FD', '#7C3AED', '#059669']

export const PRIORITY_CONFIG = {
  low: { label: 'Low', color: 'bg-gray-300' },
  medium: { label: 'Medium', color: 'bg-amber-400' },
  high: { label: 'High', color: 'bg-red-500' },
}
