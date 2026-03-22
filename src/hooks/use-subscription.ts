'use client'

import { useUserStore } from '@/store/userStore'

// Reads subscription tier from the global Zustand store (populated by
// UserStoreHydrator on mount). Returns 'free' while the store is loading.
export function useSubscription() {
  const profile = useUserStore((state) => state.profile)
  return {
    tier: profile?.subscription_tier ?? 'free',
    isLoading: profile === null,
  }
}
