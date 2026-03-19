'use client'

import { cn } from '@/lib/utils'
import { useStoryLibrary } from '@/hooks/useStoryLibrary'
import type { InterviewStory } from '@/types/database'

interface StoryCardProps {
  story: InterviewStory
  isActive?: boolean
}

export function StoryCard({ story, isActive }: StoryCardProps) {
  const { openStory } = useStoryLibrary()
  const excerpt = (story.situation ?? story.full_content ?? '').slice(0, 120)
  const displayCompetencies = story.competencies.slice(0, 3)
  const moreCount = story.competencies.length - 3

  return (
    <div
      className={cn(
        'bg-white rounded-xl border p-4 hover:shadow-sm transition-all cursor-pointer',
        isActive
          ? 'ring-2 ring-blue-500 border-blue-300 shadow-sm'
          : 'border-gray-200 hover:border-gray-300'
      )}
      onClick={() => openStory(story.id)}
    >
      <div className="flex items-start justify-between gap-2">
        <h3 className="font-medium text-sm text-gray-900 line-clamp-2">{story.title}</h3>
        {story.is_favorite && (
          <span className="text-lg flex-shrink-0 text-yellow-400">★</span>
        )}
      </div>

      {excerpt && (
        <p className="text-xs text-gray-500 mt-2 line-clamp-2">{excerpt}</p>
      )}

      {story.competencies.length > 0 && (
        <div className="flex flex-wrap gap-1 mt-3">
          {displayCompetencies.map(c => (
            <span
              key={c}
              className="px-2 py-0.5 rounded-full text-xs bg-blue-50 text-blue-600 border border-blue-100"
            >
              {c}
            </span>
          ))}
          {moreCount > 0 && (
            <span className="px-2 py-0.5 rounded-full text-xs bg-gray-100 text-gray-500">
              +{moreCount}
            </span>
          )}
        </div>
      )}
    </div>
  )
}
