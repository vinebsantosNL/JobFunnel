'use client'

import { useState, useEffect } from 'react'
import { AnimatePresence } from 'framer-motion'
import { Button } from '@/components/ui/button'
import { StorySearchBar } from './StorySearchBar'
import { StoryInlinePanel } from './StoryInlinePanel'
import { StoryGrid } from './StoryGrid'
import { useStories } from '@/hooks/use-stories'
import { useStoryLibrary } from '@/hooks/useStoryLibrary'

export function StoriesPageClient() {
  const [search, setSearch] = useState('')
  const [competencyFilter, setCompetencyFilter] = useState<string | undefined>(undefined)

  const { data: stories, isLoading } = useStories({
    search: search || undefined,
    competency: competencyFilter,
  })

  const { openNewStory, closeExpanded, expandedView } = useStoryLibrary()

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

  function handleSearchChange(newSearch: string, newCompetency: string | undefined) {
    setSearch(newSearch)
    setCompetencyFilter(newCompetency)
  }

  return (
    <main className="flex-1 p-6 overflow-auto">
      <div className="max-w-6xl mx-auto space-y-6">
        {/* Header toolbar */}
        <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center justify-between">
          <StorySearchBar
            search={search}
            competencyFilter={competencyFilter}
            onChange={handleSearchChange}
          />
          <Button onClick={openNewStory}>
            + New Story
          </Button>
        </div>

        {/* Inline expand panel */}
        <AnimatePresence>
          {expandedView.type !== 'none' && (
            <StoryInlinePanel key="inline-panel" />
          )}
        </AnimatePresence>

        {/* Stories grid */}
        {isLoading ? (
          <div className="text-sm text-gray-400">Loading stories...</div>
        ) : stories && stories.length > 0 ? (
          <StoryGrid stories={stories} />
        ) : (
          <div className="rounded-xl border border-dashed border-gray-200 bg-white p-12 text-center">
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
    </main>
  )
}
