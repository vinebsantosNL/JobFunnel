'use client'

import { useQuery } from '@tanstack/react-query'
import type { FunnelData, TimelinePoint, StageTimePoint } from '@/types/analytics'

async function fetchFunnel(params?: { from?: string; to?: string }): Promise<FunnelData> {
  const url = new URL('/api/analytics/funnel', window.location.origin)
  if (params?.from) url.searchParams.set('from', params.from)
  if (params?.to) url.searchParams.set('to', params.to)
  const res = await fetch(url.toString())
  if (!res.ok) throw new Error('Failed to fetch funnel data')
  return res.json()
}

async function fetchTimeline(): Promise<TimelinePoint[]> {
  const res = await fetch('/api/analytics/timeline')
  if (!res.ok) throw new Error('Failed to fetch timeline data')
  return res.json()
}

async function fetchStageTime(params?: { from?: string; to?: string }): Promise<StageTimePoint[]> {
  const url = new URL('/api/analytics/stage-time', window.location.origin)
  if (params?.from) url.searchParams.set('from', params.from)
  if (params?.to) url.searchParams.set('to', params.to)
  const res = await fetch(url.toString())
  if (!res.ok) throw new Error('Failed to fetch stage time data')
  return res.json()
}

export function useFunnelData(params?: { from?: string; to?: string }) {
  return useQuery({
    queryKey: ['analytics', 'funnel', params],
    queryFn: () => fetchFunnel(params),
  })
}

export function useTimelineData() {
  return useQuery({
    queryKey: ['analytics', 'timeline'],
    queryFn: fetchTimeline,
  })
}

export function useStageTimeData(params?: { from?: string; to?: string }) {
  return useQuery({
    queryKey: ['analytics', 'stage-time', params],
    queryFn: () => fetchStageTime(params),
  })
}
