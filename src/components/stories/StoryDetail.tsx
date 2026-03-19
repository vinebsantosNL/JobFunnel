'use client'

import { useState } from 'react'
import { useUpdateStory, useDeleteStory } from '@/hooks/use-stories'
import { useStoryLibrary } from '@/hooks/useStoryLibrary'
import type { InterviewStory } from '@/types/database'
import { cn } from '@/lib/utils'

interface StoryDetailProps {
  story: InterviewStory
}

const LETTER_COLORS: Record<string, { bg: string; text: string }> = {
  S: { bg: 'bg-blue-50', text: 'text-blue-600' },
  T: { bg: 'bg-purple-50', text: 'text-purple-600' },
  A: { bg: 'bg-amber-50', text: 'text-amber-600' },
  R: { bg: 'bg-green-50', text: 'text-green-600' },
}

function StarSection({
  letter,
  label,
  content,
}: {
  letter: string
  label: string
  content: string | null | undefined
}) {
  if (!content) return null
  const colors = LETTER_COLORS[letter] ?? { bg: 'bg-gray-100', text: 'text-gray-500' }

  return (
    <div className="space-y-3">
      {/* Section header */}
      <div className="flex items-center gap-2.5">
        <div className={cn('w-7 h-7 rounded-full flex items-center justify-center flex-shrink-0 font-bold text-sm', colors.bg, colors.text)}>
          {letter}
        </div>
        <span className="text-xs font-semibold text-gray-500 uppercase tracking-widest">{label}</span>
      </div>
      {/* Content */}
      <p className="text-sm text-gray-700 leading-relaxed whitespace-pre-wrap pl-9">{content}</p>
    </div>
  )
}

function getCategory(competencies: string[]): string | null {
  const leadership = ['Team Management', 'Decision Making', 'Mentoring', 'Conflict Resolution']
  const technical = ['Problem Solving', 'System Design', 'Technical Excellence', 'Innovation']
  const collaboration = ['Cross-functional Work', 'Stakeholder Management', 'Communication']
  const execution = ['Project Delivery', 'Prioritization', 'Working Under Pressure', 'Adaptability']
  const first = competencies[0]
  if (!first) return null
  if (leadership.includes(first)) return 'Leadership'
  if (technical.includes(first)) return 'Technical'
  if (collaboration.includes(first)) return 'Collaboration'
  if (execution.includes(first)) return 'Execution'
  return 'Growth'
}

export function StoryDetail({ story }: StoryDetailProps) {
  const { editStory, closeExpanded } = useStoryLibrary()
  const updateStory = useUpdateStory()
  const deleteStory = useDeleteStory()
  const [deleting, setDeleting] = useState(false)
  const [confirmDelete, setConfirmDelete] = useState(false)

  async function handleDelete() {
    if (!confirmDelete) { setConfirmDelete(true); return }
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

  const category = getCategory(story.competencies)

  return (
    <div className="space-y-6">
      {/* Top: breadcrumb + actions */}
      <div className="flex items-start justify-between gap-4">
        <div className="min-w-0">
          {/* Breadcrumb */}
          {category && (
            <div className="flex items-center gap-1.5 mb-2">
              <span className="text-xs font-medium text-blue-600">{category}</span>
              {story.competencies[1] && (
                <>
                  <span className="text-xs text-gray-400">/</span>
                  <span className="text-xs text-gray-500">{story.competencies[1]}</span>
                </>
              )}
            </div>
          )}
          {/* Title */}
          <h2 className="text-2xl font-bold text-gray-900 leading-snug">{story.title}</h2>
        </div>

        {/* Action buttons */}
        <div className="flex items-center gap-2 flex-shrink-0 pt-0.5">
          <button
            type="button"
            onClick={handleToggleFavorite}
            className="w-8 h-8 flex items-center justify-center text-gray-400 hover:text-amber-400 transition-colors"
            title={story.is_favorite ? 'Remove from favorites' : 'Add to favorites'}
          >
            <svg className="w-4 h-4" fill={story.is_favorite ? 'currentColor' : 'none'} viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
            </svg>
          </button>
          <button
            type="button"
            onClick={() => editStory(story.id)}
            className="px-3 py-1.5 text-sm font-medium text-gray-700 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
          >
            Edit
          </button>
          <button
            type="button"
            onClick={handleDelete}
            disabled={deleting}
            className={cn(
              'px-3 py-1.5 text-sm font-medium rounded-lg transition-colors',
              confirmDelete
                ? 'bg-red-500 text-white hover:bg-red-600'
                : 'text-red-500 border border-red-200 hover:bg-red-50'
            )}
          >
            {deleting ? '...' : confirmDelete ? 'Confirm' : 'Delete'}
          </button>
        </div>
      </div>

      {/* Competency badges */}
      {story.competencies.length > 0 && (
        <div className="flex flex-wrap gap-1.5">
          {story.competencies.map(c => (
            <span
              key={c}
              className="px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-50 text-blue-600 border border-blue-100"
            >
              {c}
            </span>
          ))}
        </div>
      )}

      {/* Divider */}
      <div className="border-t border-gray-100" />

      {/* STAR sections or freeform */}
      {story.full_content ? (
        <div className="space-y-3">
          <div className="flex items-center gap-2.5">
            <div className="w-7 h-7 rounded-full bg-gray-100 flex items-center justify-center flex-shrink-0 font-bold text-sm text-gray-500">
              S
            </div>
            <span className="text-xs font-semibold text-gray-500 uppercase tracking-widest">Story</span>
          </div>
          <p className="text-sm text-gray-700 leading-relaxed whitespace-pre-wrap pl-9">{story.full_content}</p>
        </div>
      ) : (
        <div className="space-y-6">
          <StarSection letter="S" label="Situation" content={story.situation} />
          <StarSection letter="T" label="Task" content={story.task} />
          <StarSection letter="A" label="Action" content={story.action} />
          <StarSection letter="R" label="Result" content={story.result} />
          {!story.situation && !story.task && !story.action && !story.result && (
            <div className="text-center py-8">
              <p className="text-sm text-gray-400 italic">No content yet.</p>
              <button
                onClick={() => editStory(story.id)}
                className="mt-2 text-sm text-blue-600 hover:text-blue-700 font-medium"
              >
                + Add your story
              </button>
            </div>
          )}
        </div>
      )}

      {/* Timestamps */}
      <div className="pt-4 border-t border-gray-100 text-xs text-gray-400 flex gap-4">
        <span>Created {new Date(story.created_at).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}</span>
        <span>Updated {new Date(story.updated_at).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}</span>
      </div>
    </div>
  )
}
