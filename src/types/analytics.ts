import type { Stage } from './database.types'

export interface FunnelData {
  stage_counts: Record<Stage, number>
  // Cumulative counts: how many jobs ever reached each stage (including those that moved beyond)
  funnel_counts: { applied: number; screening: number; interviewing: number; offer: number }
  applied_to_screening: number
  screening_to_interview: number
  interview_to_offer: number
  overall_conversion: number
}

export interface TimelinePoint {
  week: string
  count: number
}

export interface StageTimePoint {
  stage: Stage
  avg_days: number
}
