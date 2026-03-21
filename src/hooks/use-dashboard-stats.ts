'use client'

import { useQuery } from '@tanstack/react-query'

export interface DashboardStats {
  totalApplications: number
  activeApplications: number
  activeBreakdown: { screening: number; interviewing: number; offer: number }
  interviews: number
  storiesCreated: number
  hasFirstJob: boolean
}

export function useDashboardStats() {
  return useQuery<DashboardStats>({
    queryKey: ['dashboard', 'stats'],
    queryFn: async () => {
      const res = await fetch('/api/dashboard/stats')
      if (!res.ok) throw new Error('Failed to fetch stats')
      return res.json()
    },
    staleTime: 60_000,
  })
}
