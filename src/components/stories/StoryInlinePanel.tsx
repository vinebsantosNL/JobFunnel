'use client'

import { motion, AnimatePresence } from 'framer-motion'
import { X } from 'lucide-react'
import { useStoryLibrary } from '@/hooks/useStoryLibrary'
import { useStories } from '@/hooks/use-stories'
import { StoryForm } from './StoryForm'
import { StoryDetail } from './StoryDetail'

export function StoryInlinePanel() {
  const { expandedView, closeExpanded } = useStoryLibrary()
  const { data: stories } = useStories()

  const isOpen = expandedView.type !== 'none'

  const activeStory =
    (expandedView.type === 'view' || expandedView.type === 'edit') && stories
      ? stories.find(s => s.id === expandedView.storyId) ?? null
      : null

  // Only show header title for form modes — view mode shows its own title
  const isFormMode = expandedView.type === 'new' || expandedView.type === 'edit'
  const panelTitle = expandedView.type === 'new' ? 'New Story' : 'Edit Story'

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 8 }}
          transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] }}
        >
          <div className="bg-white rounded-2xl border border-gray-200 shadow-sm mb-6">
            {/* Panel header — only shown for form modes */}
            {isFormMode && (
              <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
                <h2 className="font-semibold text-sm text-gray-900">{panelTitle}</h2>
                <button
                  type="button"
                  onClick={closeExpanded}
                  className="text-gray-400 hover:text-gray-600 transition-colors rounded-md p-0.5 hover:bg-gray-100"
                  aria-label="Close panel"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
            )}

            {/* Panel body */}
            <div className="p-6">
              {/* View mode — close button floated */}
              {expandedView.type === 'view' && (
                <div className="relative">
                  <button
                    type="button"
                    onClick={closeExpanded}
                    className="absolute top-0 right-0 text-gray-400 hover:text-gray-600 transition-colors rounded-md p-0.5 hover:bg-gray-100"
                    aria-label="Close panel"
                  >
                    <X className="h-4 w-4" />
                  </button>
                  {activeStory
                    ? <StoryDetail story={activeStory} />
                    : (
                      <div className="space-y-4 animate-pulse">
                        <div className="h-6 bg-gray-100 rounded w-3/4" />
                        <div className="space-y-2">
                          <div className="h-3 bg-gray-100 rounded w-full" />
                          <div className="h-3 bg-gray-100 rounded w-5/6" />
                          <div className="h-3 bg-gray-100 rounded w-4/6" />
                        </div>
                      </div>
                    )
                  }
                </div>
              )}

              {expandedView.type === 'new' && <StoryForm mode="create" />}

              {expandedView.type === 'edit' && activeStory && (
                <StoryForm mode="edit" initialValues={activeStory} />
              )}
              {expandedView.type === 'edit' && !activeStory && (
                <div className="space-y-4 animate-pulse">
                  <div className="h-6 bg-gray-100 rounded w-3/4" />
                  <div className="space-y-2">
                    <div className="h-3 bg-gray-100 rounded w-full" />
                    <div className="h-3 bg-gray-100 rounded w-5/6" />
                  </div>
                </div>
              )}
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
