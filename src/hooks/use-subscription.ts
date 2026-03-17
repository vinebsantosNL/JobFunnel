'use client'

import { useQuery } from '@tanstack/react-query'
import type { Profile } from '@/types/database'

export function useSubscription() {
  const { data, isLoading } = useQuery({
    queryKey: ['subscription'],
    queryFn: async () => {
      const res = await fetch('/api/auth/me')
      if (!res.ok) return null
      return res.json() as Promise<Pick<Profile, 'subscription_tier' | 'full_name'>>
    },
  })
  return { tier: data?.subscription_tier ?? 'free', isLoading }
}
