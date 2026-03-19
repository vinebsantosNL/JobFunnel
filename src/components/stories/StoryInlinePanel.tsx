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
          initial={{ height: 0, opacity: 0 }}
          animate={{ height: 'auto', opacity: 1 }}
          exit={{ height: 0, opacity: 0 }}
          transition={{ duration: 0.25, ease: [0.4, 0, 0.2, 1] }}
          className="overflow-hidden"
        >
          <div className="bg-white rounded-xl border border-gray-200 shadow-sm mb-6">
            {/* Panel header — only shown for form modes */}
            {isFormMode && (
              <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
                <h2 className="font-semibold text-base text-gray-900">{panelTitle}</h2>
                <button
                  type="button"
                  onClick={closeExpanded}
                  className="text-gray-400 hover:text-gray-600 transition-colors"
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
                    className="absolute top-0 right-0 text-gray-400 hover:text-gray-600 transition-colors"
                    aria-label="Close panel"
                  >
                    <X className="h-4 w-4" />
                  </button>
                  {activeStory
                    ? <StoryDetail story={activeStory} />
                    : <p className="text-sm text-gray-400">Loading story...</p>
                  }
                </div>
              )}

              {expandedView.type === 'new' && <StoryForm mode="create" />}

              {expandedView.type === 'edit' && activeStory && (
                <StoryForm mode="edit" initialValues={activeStory} />
              )}
              {expandedView.type === 'edit' && !activeStory && (
                <p className="text-sm text-gray-400">Loading story...</p>
              )}
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
