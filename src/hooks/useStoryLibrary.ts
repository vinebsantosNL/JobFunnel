import { create } from 'zustand'

type ExpandedView =
  | { type: 'none' }
  | { type: 'new' }
  | { type: 'view'; storyId: string }
  | { type: 'edit'; storyId: string }

interface StoryLibraryState {
  expandedView: ExpandedView
  openNewStory: () => void
  openStory: (storyId: string) => void
  editStory: (storyId: string) => void
  closeExpanded: () => void
}

export const useStoryLibrary = create<StoryLibraryState>((set) => ({
  expandedView: { type: 'none' },
  openNewStory: () => set({ expandedView: { type: 'new' } }),
  openStory: (storyId) => set({ expandedView: { type: 'view', storyId } }),
  editStory: (storyId) => set({ expandedView: { type: 'edit', storyId } }),
  closeExpanded: () => set({ expandedView: { type: 'none' } }),
}))
