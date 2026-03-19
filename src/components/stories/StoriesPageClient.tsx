'use client'

import { useState, useEffect } from 'react'
import { AnimatePresence } from 'framer-motion'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { StoryInlinePanel } from './StoryInlinePanel'
import { useStories } from '@/hooks/use-stories'
import { useStoryLibrary } from '@/hooks/useStoryLibrary'
import { ALL_COMPETENCIES } from '@/lib/competencies'
import { cn } from '@/lib/utils'
import type { InterviewStory } from '@/types/database'

const FILTER_COMPETENCIES = ALL_COMPETENCIES.slice(0, 8)

const COMPETENCY_COLORS: Record<string, string> = {
  'Team Management': 'bg-blue-500',
  'Decision Making': 'bg-blue-500',
  'Mentoring': 'bg-blue-500',
  'Conflict Resolution': 'bg-blue-500',
  'Problem Solving': 'bg-purple-500',
  'System Design': 'bg-purple-500',
  'Technical Excellence': 'bg-purple-500',
  'Innovation': 'bg-purple-500',
  'Cross-functional Work': 'bg-green-500',
  'Stakeholder Management': 'bg-green-500',
  'Communication': 'bg-green-500',
  'Project Delivery': 'bg-amber-500',
  'Prioritization': 'bg-amber-500',
  'Working Under Pressure': 'bg-amber-500',
  'Adaptability': 'bg-amber-500',
  'Learning Agility': 'bg-teal-500',
  'Feedback Reception': 'bg-teal-500',
  'Self-improvement': 'bg-teal-500',
}

function getCompetencyCategory(competency: string): string {
  const leadership = ['Team Management', 'Decision Making', 'Mentoring', 'Conflict Resolution']
  const technical = ['Problem Solving', 'System Design', 'Technical Excellence', 'Innovation']
  const collaboration = ['Cross-functional Work', 'Stakeholder Management', 'Communication']
  const execution = ['Project Delivery', 'Prioritization', 'Working Under Pressure', 'Adaptability']
  if (leadership.includes(competency)) return 'Leadership'
  if (technical.includes(competency)) return 'Technical'
  if (collaboration.includes(competency)) return 'Collaboration'
  if (execution.includes(competency)) return 'Execution'
  return 'Growth'
}

function StoryListItem({
  story,
  isActive,
  onClick,
}: {
  story: InterviewStory
  isActive: boolean
  onClick: () => void
}) {
  const excerpt = (story.situation ?? story.full_content ?? '').slice(0, 80)
  const primaryCompetency = story.competencies[0] ?? null
  const category = primaryCompetency ? getCompetencyCategory(primaryCompetency) : null
  const dotColor = primaryCompetency ? (COMPETENCY_COLORS[primaryCompetency] ?? 'bg-gray-400') : 'bg-gray-400'
  const dateStr = new Date(story.created_at).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })

  return (
    <div
      onClick={onClick}
      className={cn(
        'px-4 py-3 border-b border-gray-100 cursor-pointer hover:bg-gray-50 transition-colors',
        isActive && 'bg-blue-50 border-l-4 border-l-blue-500'
      )}
    >
      {category && (
        <div className="flex items-center gap-1.5 mb-1">
          <span className={cn('w-2 h-2 rounded-full flex-shrink-0', dotColor)} />
          <span className="text-xs font-medium text-gray-400 uppercase tracking-wide">{category}</span>
        </div>
      )}
      <h4 className="text-sm font-bold text-gray-900 line-clamp-1">{story.title}</h4>
      {excerpt && (
        <p className="text-xs text-gray-500 mt-0.5 line-clamp-1">{excerpt}</p>
      )}
      <div className="flex items-center justify-between mt-1.5">
        <span className="text-xs text-gray-400">{dateStr}</span>
        {story.is_favorite && <span className="text-yellow-400 text-xs">★</span>}
      </div>
    </div>
  )
}

export function StoriesPageClient() {
  const [search, setSearch] = useState('')
  const [competencyFilter, setCompetencyFilter] = useState<string | undefined>(undefined)

  const { data: stories, isLoading } = useStories({
    search: search || undefined,
    competency: competencyFilter,
  })

  const { openNewStory, openStory, closeExpanded, expandedView } = useStoryLibrary()

  const activeStoryId =
    expandedView.type === 'view' || expandedView.type === 'edit'
      ? expandedView.storyId
      : null

  // Keyboard shortcuts: Escape closes panel, 'n' opens new story when no input focused
  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      const target = e.target as HTMLElement
      const isInputFocused =
        target.tagName === 'INPUT' ||
        target.tagName === 'TEXTAREA' ||
        target.isContentEditable

      if (e.key === 'Escape') {
        closeExpanded()
        return
      }

      if (e.key === 'n' && !isInputFocused && !e.metaKey && !e.ctrlKey && !e.altKey) {
        e.preventDefault()
        openNewStory()
      }
    }

    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [openNewStory, closeExpanded])

  return (
    <main className="flex-1 flex h-full overflow-hidden">
      {/* Left panel — story list */}
      <div className="w-80 border-r border-gray-200 flex flex-col bg-white overflow-y-auto flex-shrink-0">
        {/* Header */}
        <div className="px-4 pt-4 pb-3 border-b border-gray-100">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-semibold text-gray-400 tracking-wider uppercase">Your Catalog</span>
            <Button size="sm" onClick={openNewStory} className="text-xs h-7 px-2">
              + New
            </Button>
          </div>

          {/* Search */}
          <Input
            placeholder="Search stories..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="mb-3 text-sm h-8"
          />

          {/* Filter tabs */}
          <div className="flex gap-1.5 flex-wrap">
            <button
              onClick={() => setCompetencyFilter(undefined)}
              className={cn(
                'px-2.5 py-1 rounded-full text-xs border transition-colors',
                !competencyFilter
                  ? 'bg-blue-600 text-white border-blue-600'
                  : 'bg-white text-gray-600 border-gray-200 hover:border-gray-300'
              )}
            >
              All
            </button>
            {FILTER_COMPETENCIES.map((c) => (
              <button
                key={c}
                onClick={() => setCompetencyFilter(competencyFilter === c ? undefined : c)}
                className={cn(
                  'px-2.5 py-1 rounded-full text-xs border transition-colors',
                  competencyFilter === c
                    ? 'bg-blue-600 text-white border-blue-600'
                    : 'bg-white text-gray-600 border-gray-200 hover:border-gray-300'
                )}
              >
                {c}
              </button>
            ))}
          </div>
        </div>

        {/* Story list */}
        <div className="flex-1 overflow-y-auto">
          {isLoading ? (
            <div className="p-4 text-sm text-gray-400">Loading stories...</div>
          ) : stories && stories.length > 0 ? (
            stories.map((story) => (
              <StoryListItem
                key={story.id}
                story={story}
                isActive={story.id === activeStoryId}
                onClick={() => openStory(story.id)}
              />
            ))
          ) : (
            <div className="p-6 text-center">
              <p className="text-sm font-medium text-gray-900 mb-1">No stories yet</p>
              <p className="text-xs text-gray-500 mb-4">
                {search || competencyFilter
                  ? 'Try adjusting your search or filters.'
                  : 'Build your library of interview stories using the STAR method.'}
              </p>
              {!search && !competencyFilter && (
                <Button size="sm" onClick={openNewStory}>
                  Add your first story
                </Button>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Right panel — story detail */}
      <div className="flex-1 overflow-y-auto bg-gray-50">
        <AnimatePresence>
          {expandedView.type !== 'none' ? (
            <div className="p-6">
              <StoryInlinePanel key="inline-panel" />
            </div>
          ) : (
            <div className="flex items-center justify-center h-full text-center">
              <div>
                <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <svg className="w-8 h-8 text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                </div>
                <p className="text-sm font-medium text-gray-500">Select a story to view details</p>
                <p className="text-xs text-gray-400 mt-1">Or press N to create a new one</p>
              </div>
            </div>
          )}
        </AnimatePresence>
      </div>
    </main>
  )
}
