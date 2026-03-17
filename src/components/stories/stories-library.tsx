'use client'

import { useState } from 'react'
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { StoryCard } from './story-card'
import { StoryForm } from './story-form'
import { StoryDetail } from './story-detail'
import { useStories, useCreateStory, useUpdateStory, useDeleteStory } from '@/hooks/use-stories'
import { ALL_COMPETENCIES } from '@/lib/competencies'
import type { InterviewStory } from '@/types/database'
import type { CreateStoryInput, UpdateStoryInput } from '@/lib/validations/story'

export function StoriesLibrary() {
  const [search, setSearch] = useState('')
  const [competencyFilter, setCompetencyFilter] = useState<string | undefined>(undefined)
  const [newSheetOpen, setNewSheetOpen] = useState(false)
  const [selectedStory, setSelectedStory] = useState<InterviewStory | null>(null)
  const [detailOpen, setDetailOpen] = useState(false)

  const { data: stories, isLoading } = useStories({ search: search || undefined, competency: competencyFilter })
  const createStory = useCreateStory()
  const updateStory = useUpdateStory()
  const deleteStory = useDeleteStory()

  async function handleCreate(input: CreateStoryInput) {
    await createStory.mutateAsync(input)
    setNewSheetOpen(false)
  }

  function handleCardClick(story: InterviewStory) {
    setSelectedStory(story)
    setDetailOpen(true)
  }

  function handleToggleFavorite(story: InterviewStory) {
    updateStory.mutate({ id: story.id, input: { is_favorite: !story.is_favorite } })
  }

  function handleUpdate(id: string, input: UpdateStoryInput) {
    updateStory.mutate({ id, input })
  }

  function handleDelete(id: string) {
    deleteStory.mutate(id)
  }

  // Common competency filter options (show a subset for the filter bar)
  const filterCompetencies = ALL_COMPETENCIES.slice(0, 8)

  return (
    <main className="flex-1 p-6 overflow-auto">
      <div className="max-w-6xl mx-auto space-y-6">
        {/* Toolbar */}
        <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center justify-between">
          <Input
            placeholder="Search stories..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="max-w-xs"
          />
          <Button onClick={() => setNewSheetOpen(true)}>
            + New Story
          </Button>
        </div>

        {/* Competency filter */}
        <div className="flex gap-2 flex-wrap">
          <button
            onClick={() => setCompetencyFilter(undefined)}
            className={`px-3 py-1 rounded-full text-xs border transition-colors ${
              !competencyFilter
                ? 'bg-blue-600 text-white border-blue-600'
                : 'bg-white text-gray-600 border-gray-200 hover:border-gray-300'
            }`}
          >
            All
          </button>
          {filterCompetencies.map(c => (
            <button
              key={c}
              onClick={() => setCompetencyFilter(competencyFilter === c ? undefined : c)}
              className={`px-3 py-1 rounded-full text-xs border transition-colors ${
                competencyFilter === c
                  ? 'bg-blue-600 text-white border-blue-600'
                  : 'bg-white text-gray-600 border-gray-200 hover:border-gray-300'
              }`}
            >
              {c}
            </button>
          ))}
        </div>

        {/* Stories grid */}
        {isLoading ? (
          <div className="text-sm text-gray-400">Loading stories...</div>
        ) : stories && stories.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {stories.map(story => (
              <StoryCard
                key={story.id}
                story={story}
                onClick={handleCardClick}
                onToggleFavorite={handleToggleFavorite}
              />
            ))}
          </div>
        ) : (
          <div className="rounded-xl border border-dashed border-gray-200 bg-white p-12 text-center">
            <p className="text-sm font-medium text-gray-900 mb-1">No stories yet</p>
            <p className="text-xs text-gray-500 mb-4">
              {search || competencyFilter
                ? 'Try adjusting your search or filters.'
                : 'Build your library of interview stories using the STAR method.'}
            </p>
            {!search && !competencyFilter && (
              <Button size="sm" onClick={() => setNewSheetOpen(true)}>
                Add your first story
              </Button>
            )}
          </div>
        )}
      </div>

      {/* New Story Sheet */}
      <Sheet open={newSheetOpen} onOpenChange={(open) => { if (!open) setNewSheetOpen(false) }}>
        <SheetContent side="right" className="w-full sm:max-w-lg overflow-y-auto">
          <SheetHeader className="pr-8">
            <SheetTitle>New Story</SheetTitle>
          </SheetHeader>
          <div className="px-4 pb-4">
            <StoryForm
              onSubmit={handleCreate}
              onCancel={() => setNewSheetOpen(false)}
              loading={createStory.isPending}
            />
          </div>
        </SheetContent>
      </Sheet>

      {/* Story Detail Sheet */}
      <StoryDetail
        story={selectedStory}
        open={detailOpen}
        onClose={() => { setDetailOpen(false); setSelectedStory(null) }}
        onUpdate={handleUpdate}
        onDelete={handleDelete}
      />
    </main>
  )
}
