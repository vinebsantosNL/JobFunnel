import { create } from 'zustand'
import type { Profile } from '@/types/database.types'

interface UserStore {
  profile: Profile | null
  setProfile: (profile: Profile) => void
  clearProfile: () => void
}

export const useUserStore = create<UserStore>((set) => ({
  profile: null,
  setProfile: (profile) => set({ profile }),
  clearProfile: () => set({ profile: null }),
}))
