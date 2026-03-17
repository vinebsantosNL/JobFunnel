import type { Stage } from './database'

export interface FunnelData {
  stage_counts: Record<Stage, number>
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
