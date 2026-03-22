'use client'

import { useState, useEffect } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { BookOpen, ChevronLeft, Plus } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { StoryInlinePanel } from './StoryInlinePanel'
import { useStories } from '@/hooks/use-stories'
import { useStoryLibrary } from '@/hooks/useStoryLibrary'
import { ALL_COMPETENCIES } from '@/lib/competencies'
import { cn } from '@/lib/utils'
import type { InterviewStory } from '@/types/database.types'

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
  const excerpt = (story.situation ?? story.full_content ?? '').slice(0, 72)
  const primaryCompetency = story.competencies[0] ?? null
  const dotColor = primaryCompetency ? (COMPETENCY_COLORS[primaryCompetency] ?? 'bg-gray-400') : 'bg-gray-400'
  const dateStr = new Date(story.created_at).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })

  return (
    <div
      onClick={onClick}
      className={cn(
        'px-4 py-3.5 border-b border-gray-100 cursor-pointer transition-all duration-150 border-l-2',
        isActive
          ? 'bg-blue-50 border-l-blue-500'
          : 'hover:bg-gray-50 border-l-transparent'
      )}
    >
      <div className="flex items-start justify-between gap-2 mb-1.5">
        <h4 className="text-sm font-semibold text-gray-900 line-clamp-2 leading-snug">{story.title}</h4>
        {story.is_favorite && <span className="text-amber-400 text-sm flex-shrink-0 leading-none mt-0.5">★</span>}
      </div>
      {excerpt && (
        <p className="text-xs text-gray-500 line-clamp-1 mb-2">{excerpt}</p>
      )}
      <div className="flex items-center justify-between gap-2">
        {primaryCompetency ? (
          <div className="flex items-center gap-1.5 min-w-0">
            <span className={cn('w-1.5 h-1.5 rounded-full flex-shrink-0', dotColor)} />
            <span className="text-xs text-gray-500 truncate">{primaryCompetency}</span>
          </div>
        ) : (
          <span />
        )}
        <span className="text-xs text-gray-400 flex-shrink-0">{dateStr}</span>
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

  const isDetailOpen = expandedView.type !== 'none'

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
      <div className={cn(
        'border-r border-gray-200 flex-col bg-white overflow-y-auto flex-shrink-0',
        'w-full md:w-80',
        isDetailOpen ? 'hidden md:flex' : 'flex'
      )}>
        {/* Header */}
        <div className="px-4 pt-4 pb-3 border-b border-gray-100">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <h2 className="text-sm font-semibold text-gray-900">Story Library</h2>
              {!isLoading && stories && stories.length > 0 && (
                <span className="text-xs text-gray-400 tabular-nums">{stories.length}</span>
              )}
            </div>
            <Button size="sm" onClick={openNewStory} className="h-7 px-2.5 gap-1 text-xs">
              <Plus className="w-3 h-3" />
              New
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
          <div className="flex gap-1.5 overflow-x-auto pb-0.5 scrollbar-none">
            <button
              onClick={() => setCompetencyFilter(undefined)}
              className={cn(
                'px-2.5 py-1 rounded-full text-xs font-medium border transition-colors flex-shrink-0',
                !competencyFilter
                  ? 'bg-gray-900 text-white border-gray-900'
                  : 'bg-white text-gray-500 border-gray-200 hover:border-gray-300 hover:text-gray-700'
              )}
            >
              All
            </button>
            {FILTER_COMPETENCIES.map((c) => (
              <button
                key={c}
                onClick={() => setCompetencyFilter(competencyFilter === c ? undefined : c)}
                className={cn(
                  'px-2.5 py-1 rounded-full text-xs font-medium border transition-colors flex-shrink-0',
                  competencyFilter === c
                    ? 'bg-gray-900 text-white border-gray-900'
                    : 'bg-white text-gray-500 border-gray-200 hover:border-gray-300 hover:text-gray-700'
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
            <div className="divide-y divide-gray-100">
              {[1, 2, 3, 4].map((n) => (
                <div key={n} className="px-4 py-3.5 animate-pulse">
                  <div className="h-3.5 bg-gray-100 rounded w-3/4 mb-2.5" />
                  <div className="h-2.5 bg-gray-100 rounded w-full mb-2.5" />
                  <div className="h-2 bg-gray-100 rounded w-1/3" />
                </div>
              ))}
            </div>
          ) : stories && stories.length > 0 ? (
            <motion.div
              initial="hidden"
              animate="visible"
              variants={{ hidden: {}, visible: { transition: { staggerChildren: 0.05 } } }}
            >
              {stories.map((story) => (
                <motion.div
                  key={story.id}
                  variants={{
                    hidden: { opacity: 0, y: 4 },
                    visible: { opacity: 1, y: 0, transition: { duration: 0.2, ease: 'easeOut' } },
                  }}
                >
                  <StoryListItem
                    story={story}
                    isActive={story.id === activeStoryId}
                    onClick={() => openStory(story.id)}
                  />
                </motion.div>
              ))}
            </motion.div>
          ) : (
            <motion.div
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.25, ease: 'easeOut' }}
              className="p-6 text-center"
            >
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
            </motion.div>
          )}
        </div>
      </div>

      {/* Right panel — story detail */}
      <div className={cn(
        'flex-1 overflow-y-auto bg-gray-50',
        isDetailOpen ? 'flex flex-col' : 'hidden md:block'
      )}>
        {/* Mobile back button */}
        {isDetailOpen && (
          <div className="md:hidden flex items-center px-4 py-2 border-b border-gray-100 bg-white sticky top-0 z-10">
            <button
              onClick={closeExpanded}
              className="flex items-center gap-1.5 text-sm text-gray-600 hover:text-gray-900 transition-colors min-h-[44px] pr-4"
            >
              <ChevronLeft className="w-4 h-4" />
              Back to Stories
            </button>
          </div>
        )}
        <AnimatePresence>
          {expandedView.type !== 'none' ? (
            <div className="p-6">
              <StoryInlinePanel key="inline-panel" />
            </div>
          ) : (
            <div className="flex items-center justify-center h-full text-center p-8">
              <div>
                <div className="w-14 h-14 bg-gray-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
                  <BookOpen className="w-7 h-7 text-gray-300" strokeWidth={1.5} />
                </div>
                <p className="text-sm font-semibold text-gray-700 mb-1">Select a story</p>
                <p className="text-xs text-gray-400 leading-relaxed">
                  Choose from the list, or press{' '}
                  <kbd className="inline-flex items-center px-1.5 py-0.5 rounded border border-gray-200 text-xs font-mono text-gray-500 bg-white">N</kbd>
                  {' '}to create a new one
                </p>
              </div>
            </div>
          )}
        </AnimatePresence>
      </div>
    </main>
  )
}
