'use client'

import { useStoryLibrary } from '@/hooks/useStoryLibrary'
import { StoryCard } from './StoryCard'
import type { InterviewStory } from '@/types/database'

interface StoryGridProps {
  stories: InterviewStory[]
}

export function StoryGrid({ stories }: StoryGridProps) {
  const { expandedView } = useStoryLibrary()
  const activeStoryId =
    expandedView.type === 'view' || expandedView.type === 'edit'
      ? expandedView.storyId
      : null

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
      {stories.map(story => (
        <StoryCard
          key={story.id}
          story={story}
          isActive={story.id === activeStoryId}
        />
      ))}
    </div>
  )
}
