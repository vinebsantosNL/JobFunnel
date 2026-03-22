'use client'

import { useEffect } from 'react'
import { useQuery } from '@tanstack/react-query'
import { useUserStore } from '@/store/userStore'
import type { Profile } from '@/types/database.types'

async function fetchProfile(): Promise<Profile | null> {
  const res = await fetch('/api/auth/me')
  if (!res.ok) return null
  return res.json()
}

// Fetches the user profile once on mount and hydrates the global Zustand store.
// Uses the shared ['profile'] query key so any component already fetching the
// same endpoint benefits from TanStack Query's cache deduplication.
export function UserStoreHydrator() {
  const setProfile = useUserStore((state) => state.setProfile)

  const { data: profile } = useQuery({
    queryKey: ['profile'],
    queryFn: fetchProfile,
    staleTime: 5 * 60 * 1000, // 5 minutes — profile doesn't change mid-session
  })

  useEffect(() => {
    if (profile) setProfile(profile)
  }, [profile, setProfile])

  return null
}
