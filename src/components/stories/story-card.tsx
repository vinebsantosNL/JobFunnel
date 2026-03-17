'use client'

import type { InterviewStory } from '@/types/database'

interface StoryCardProps {
  story: InterviewStory
  onClick: (story: InterviewStory) => void
  onToggleFavorite: (story: InterviewStory) => void
}

export function StoryCard({ story, onClick, onToggleFavorite }: StoryCardProps) {
  const excerpt = (story.situation ?? story.full_content ?? '').slice(0, 120)
  const displayCompetencies = story.competencies.slice(0, 3)
  const moreCount = story.competencies.length - 3

  return (
    <div
      className="bg-white rounded-lg border border-gray-100 p-4 hover:shadow-md hover:border-gray-200 transition-all cursor-pointer"
      onClick={() => onClick(story)}
    >
      <div className="flex items-start justify-between gap-2">
        <h3 className="font-medium text-sm text-gray-900 line-clamp-2">{story.title}</h3>
        <button
          type="button"
          onClick={e => { e.stopPropagation(); onToggleFavorite(story) }}
          className="text-lg flex-shrink-0 transition-opacity hover:opacity-70"
          aria-label={story.is_favorite ? 'Remove from favorites' : 'Add to favorites'}
        >
          {story.is_favorite ? '★' : '☆'}
        </button>
      </div>

      {excerpt && (
        <p className="text-xs text-gray-500 mt-2 line-clamp-2">{excerpt}</p>
      )}

      {story.competencies.length > 0 && (
        <div className="flex flex-wrap gap-1 mt-3">
          {displayCompetencies.map(c => (
            <span key={c} className="px-2 py-0.5 rounded-full text-xs bg-blue-50 text-blue-600 border border-blue-100">
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
