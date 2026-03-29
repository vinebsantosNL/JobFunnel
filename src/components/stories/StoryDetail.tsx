'use client'

import { useState } from 'react'
import { Star, AlignLeft } from 'lucide-react'
import { useUpdateStory, useDeleteStory } from '@/hooks/use-stories'
import { useStoryLibrary } from '@/hooks/useStoryLibrary'
import { Button } from '@/components/ui/button'
import type { InterviewStory } from '@/types/database.types'
import { cn } from '@/lib/utils'

interface StoryDetailProps {
  story: InterviewStory
}

const LETTER_COLORS: Record<string, { bg: string; text: string }> = {
  S: { bg: 'bg-[var(--jf-interactive-subtle)]', text: 'text-[var(--jf-interactive)]' },
  T: { bg: 'bg-[var(--jf-purple-tint)]',        text: 'text-[var(--jf-purple)]' },
  A: { bg: 'bg-[var(--jf-warning-tint)]',        text: 'text-[var(--jf-warning)]' },
  R: { bg: 'bg-[var(--jf-success-tint)]',        text: 'text-[var(--jf-success)]' },
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
  const colors = LETTER_COLORS[letter] ?? { bg: 'bg-muted', text: 'text-muted-foreground' }

  return (
    <div className="rounded-xl border border-border bg-muted/30 p-4 space-y-2.5">
      {/* Section header */}
      <div className="flex items-center gap-2">
        <div className={cn('w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0 font-bold text-xs', colors.bg, colors.text)}>
          {letter}
        </div>
        <span className="text-xs font-semibold text-muted-foreground uppercase tracking-widest">{label}</span>
      </div>
      {/* Content */}
      <p className="text-sm text-foreground leading-relaxed whitespace-pre-wrap">{content}</p>
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
          {/* Category label */}
          {category && (
            <p className="text-xs font-semibold text-primary uppercase tracking-wide mb-1.5">{category}</p>
          )}
          {/* Title */}
          <h2 className="text-xl font-bold text-foreground leading-snug">{story.title}</h2>
        </div>

        {/* Action buttons */}
        <div className="flex items-center gap-2 flex-shrink-0 pt-0.5">
          <Button
            type="button"
            variant="ghost"
            size="icon-sm"
            onClick={handleToggleFavorite}
            title={story.is_favorite ? 'Remove from favorites' : 'Add to favorites'}
            className={story.is_favorite ? 'text-amber-400 hover:text-amber-500' : 'text-muted-foreground hover:text-amber-400'}
          >
            <Star className="w-4 h-4" fill={story.is_favorite ? 'currentColor' : 'none'} />
          </Button>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => editStory(story.id)}
          >
            Edit
          </Button>
          <Button
            type="button"
            variant={confirmDelete ? 'destructive' : 'outline'}
            size="sm"
            onClick={handleDelete}
            disabled={deleting}
            className={cn(!confirmDelete && 'text-destructive border-destructive/30 hover:bg-destructive/5')}
          >
            {deleting ? '…' : confirmDelete ? 'Confirm delete' : 'Delete'}
          </Button>
        </div>
      </div>

      {/* Competency badges */}
      {story.competencies.length > 0 && (
        <div className="flex flex-wrap gap-1.5">
          {story.competencies.map((c, i) => (
            <span
              key={c}
              className={cn(
                'px-2.5 py-0.5 rounded-full text-xs font-medium border',
                i === 0
                  ? 'bg-[var(--jf-interactive-subtle)] text-[var(--jf-interactive)] border-[var(--jf-interactive-border)]'
                  : 'bg-muted text-muted-foreground border-border'
              )}
            >
              {c}
            </span>
          ))}
        </div>
      )}

      {/* Divider */}
      <div className="border-t border-border" />

      {/* STAR sections or freeform */}
      {story.full_content ? (
        <div className="rounded-xl border border-border bg-muted/30 p-4 space-y-2.5">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-full bg-muted flex items-center justify-center flex-shrink-0">
              <AlignLeft className="w-3 h-3 text-muted-foreground" />
            </div>
            <span className="text-xs font-semibold text-muted-foreground uppercase tracking-widest">Story</span>
          </div>
          <p className="text-sm text-foreground leading-relaxed whitespace-pre-wrap">{story.full_content}</p>
        </div>
      ) : (
        <div className="space-y-6">
          <StarSection letter="S" label="Situation" content={story.situation} />
          <StarSection letter="T" label="Task" content={story.task} />
          <StarSection letter="A" label="Action" content={story.action} />
          <StarSection letter="R" label="Result" content={story.result} />
          {!story.situation && !story.task && !story.action && !story.result && (
            <div className="text-center py-8 space-y-3">
              <p className="text-sm text-muted-foreground">No content yet.</p>
              <Button variant="outline" size="sm" onClick={() => editStory(story.id)}>
                Add your story
              </Button>
            </div>
          )}
        </div>
      )}

      {/* Timestamps */}
      <div className="pt-4 border-t border-border text-xs text-muted-foreground flex gap-4 flex-wrap">
        <span>Created {new Date(story.created_at).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}</span>
        <span>·</span>
        <span>Updated {new Date(story.updated_at).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}</span>
      </div>
    </div>
  )
}
