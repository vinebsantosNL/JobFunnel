'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { useUpdateStory, useDeleteStory } from '@/hooks/use-stories'
import { useStoryLibrary } from '@/hooks/useStoryLibrary'
import type { InterviewStory } from '@/types/database'

interface StoryDetailProps {
  story: InterviewStory
}

export function StoryDetail({ story }: StoryDetailProps) {
  const { editStory, closeExpanded } = useStoryLibrary()
  const updateStory = useUpdateStory()
  const deleteStory = useDeleteStory()
  const [deleting, setDeleting] = useState(false)

  async function handleDelete() {
    setDeleting(true)
    try {
      await deleteStory.mutateAsync(story.id)
      closeExpanded()
    } finally {
      setDeleting(false)
    }
  }

  function handleToggleFavorite() {
    updateStory.mutate({ id: story.id, input: { is_favorite: !story.is_favorite } })
  }

  return (
    <div className="space-y-4">
      {/* Action buttons */}
      <div className="flex gap-2 items-center">
        <Button size="sm" variant="outline" onClick={() => editStory(story.id)}>
          Edit
        </Button>
        <Button
          size="sm"
          variant="destructive"
          disabled={deleting}
          onClick={handleDelete}
        >
          {deleting ? 'Deleting...' : 'Delete'}
        </Button>
        <button
          type="button"
          onClick={handleToggleFavorite}
          className="ml-auto text-xl hover:opacity-70 transition-opacity"
          aria-label={story.is_favorite ? 'Remove from favorites' : 'Add to favorites'}
        >
          {story.is_favorite ? '★' : '☆'}
        </button>
      </div>

      {/* Competency badges */}
      {story.competencies.length > 0 && (
        <div className="flex flex-wrap gap-1.5">
          {story.competencies.map(c => (
            <span
              key={c}
              className="px-2.5 py-1 rounded-full text-xs bg-blue-50 text-blue-600 border border-blue-100"
            >
              {c}
            </span>
          ))}
        </div>
      )}

      {/* STAR sections or freeform */}
      {story.full_content ? (
        <div>
          <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">Story</h3>
          <p className="text-sm text-gray-700 whitespace-pre-wrap">{story.full_content}</p>
        </div>
      ) : (
        <div className="space-y-4">
          {story.situation && (
            <div>
              <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">Situation</h3>
              <p className="text-sm text-gray-700 whitespace-pre-wrap">{story.situation}</p>
            </div>
          )}
          {story.task && (
            <div>
              <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">Task</h3>
              <p className="text-sm text-gray-700 whitespace-pre-wrap">{story.task}</p>
            </div>
          )}
          {story.action && (
            <div>
              <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">Action</h3>
              <p className="text-sm text-gray-700 whitespace-pre-wrap">{story.action}</p>
            </div>
          )}
          {story.result && (
            <div>
              <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">Result</h3>
              <p className="text-sm text-gray-700 whitespace-pre-wrap">{story.result}</p>
            </div>
          )}
          {!story.situation && !story.task && !story.action && !story.result && (
            <p className="text-sm text-gray-400 italic">No content yet. Click Edit to add your story.</p>
          )}
        </div>
      )}

      {/* Timestamps */}
      <div className="text-xs text-gray-400 pt-2 border-t border-gray-100">
        <p>Created {new Date(story.created_at).toLocaleDateString()}</p>
        <p>Updated {new Date(story.updated_at).toLocaleDateString()}</p>
      </div>
    </div>
  )
}
