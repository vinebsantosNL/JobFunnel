'use client'

import { useState } from 'react'
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet'
import { Button } from '@/components/ui/button'
import { StoryForm } from './story-form'
import type { InterviewStory } from '@/types/database'
import type { UpdateStoryInput } from '@/lib/validations/story'

interface StoryDetailProps {
  story: InterviewStory | null
  open: boolean
  onClose: () => void
  onUpdate: (id: string, input: UpdateStoryInput) => void
  onDelete: (id: string) => void
}

export function StoryDetail({ story, open, onClose, onUpdate, onDelete }: StoryDetailProps) {
  const [editing, setEditing] = useState(false)
  const [deleting, setDeleting] = useState(false)

  if (!story) return null

  async function handleUpdate(input: UpdateStoryInput) {
    if (!story) return
    onUpdate(story.id, input)
    setEditing(false)
  }

  async function handleDelete() {
    if (!story) return
    setDeleting(true)
    try {
      onDelete(story.id)
      onClose()
    } finally {
      setDeleting(false)
    }
  }

  function handleOpenChange(nextOpen: boolean) {
    if (!nextOpen) {
      setEditing(false)
      onClose()
    }
  }

  return (
    <Sheet open={open} onOpenChange={handleOpenChange}>
      <SheetContent side="right" className="w-full sm:max-w-lg overflow-y-auto">
        <SheetHeader className="pr-8">
          <SheetTitle className="line-clamp-2">{story.title}</SheetTitle>
        </SheetHeader>

        {editing ? (
          <div className="px-4 pb-4">
            <StoryForm
              initialValues={story}
              onSubmit={handleUpdate}
              onCancel={() => setEditing(false)}
            />
          </div>
        ) : (
          <div className="px-4 pb-4 space-y-4">
            {/* Action buttons */}
            <div className="flex gap-2">
              <Button size="sm" variant="outline" onClick={() => setEditing(true)}>
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
                onClick={() => onUpdate(story.id, { is_favorite: !story.is_favorite })}
                className="ml-auto text-xl hover:opacity-70 transition-opacity"
                aria-label={story.is_favorite ? 'Remove from favorites' : 'Add to favorites'}
              >
                {story.is_favorite ? '★' : '☆'}
              </button>
            </div>

            {/* Competencies */}
            {story.competencies.length > 0 && (
              <div className="flex flex-wrap gap-1.5">
                {story.competencies.map(c => (
                  <span key={c} className="px-2.5 py-1 rounded-full text-xs bg-blue-50 text-blue-600 border border-blue-100">
                    {c}
                  </span>
                ))}
              </div>
            )}

            {/* STAR fields or full content */}
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
        )}
      </SheetContent>
    </Sheet>
  )
}
