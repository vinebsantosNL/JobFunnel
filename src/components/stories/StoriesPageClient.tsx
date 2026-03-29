'use client'

import { useState, useEffect } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { Plus } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { StoryInlinePanel } from './StoryInlinePanel'
import { useStories, useUpdateStory, useDeleteStory } from '@/hooks/use-stories'
import { useStoryLibrary } from '@/hooks/useStoryLibrary'
import { cn } from '@/lib/utils'
import type { InterviewStory } from '@/types/database.types'

/* ── Filter categories (mockup spec) ── */
const FILTER_CATEGORIES = ['All', 'Leadership', 'Technical', 'Collaboration', 'Execution', 'Growth'] as const

/* ── Competency → category mapping ── */
const CATEGORY_MAP: Record<string, string> = {
  'Team Management': 'Leadership',
  'Decision Making': 'Leadership',
  'Mentoring': 'Leadership',
  'Conflict Resolution': 'Leadership',
  'Problem Solving': 'Technical',
  'System Design': 'Technical',
  'Technical Excellence': 'Technical',
  'Innovation': 'Technical',
  'Cross-functional Work': 'Collaboration',
  'Stakeholder Management': 'Collaboration',
  'Communication': 'Collaboration',
  'Project Delivery': 'Execution',
  'Prioritization': 'Execution',
  'Working Under Pressure': 'Execution',
  'Adaptability': 'Execution',
  'Learning Agility': 'Growth',
  'Feedback Reception': 'Growth',
  'Self-improvement': 'Growth',
}

/* ── Tag color map per category ── */
const COMPETENCY_COLORS: Record<string, { bg: string; color: string; border: string }> = {
  leadership:    { bg: 'rgba(139,92,246,0.08)', color: 'var(--jf-purple)',      border: 'rgba(139,92,246,0.2)'  },
  technical:     { bg: 'rgba(37,99,235,0.08)',  color: 'var(--jf-interactive)', border: 'rgba(37,99,235,0.2)'  },
  collaboration: { bg: 'var(--jf-success-tint)', color: 'var(--jf-success)',    border: 'var(--jf-success-border)' },
  execution:     { bg: 'rgba(37,99,235,0.08)',  color: 'var(--jf-interactive)', border: 'rgba(37,99,235,0.2)'  },
  growth:        { bg: 'rgba(245,158,11,0.08)', color: 'var(--jf-warning)',     border: 'rgba(245,158,11,0.2)' },
}

function getCompetencyCategory(competency: string): string {
  return CATEGORY_MAP[competency] ?? 'Growth'
}

function getTagStyle(competency: string) {
  const cat = getCompetencyCategory(competency).toLowerCase()
  return COMPETENCY_COLORS[cat] ?? COMPETENCY_COLORS.growth
}

/* ── STAR status helpers ── */
function getStarStatus(story: { situation?: string | null; task?: string | null; action?: string | null; result?: string | null }) {
  const filled = [story.situation, story.task, story.action, story.result].filter(Boolean).length
  if (filled === 4) return { label: 'Complete', color: 'var(--jf-success)', count: 4 }
  if (filled === 3) return { label: 'Missing Result', color: 'var(--jf-warning)', count: 3 }
  if (filled > 0) return { label: 'In progress', color: 'var(--jf-error)', count: filled }
  return { label: 'Not started', color: 'var(--jf-text-muted)', count: 0 }
}

function isStarFilled(story: InterviewStory, letter: 'S' | 'T' | 'A' | 'R'): boolean {
  const map: Record<string, string | null | undefined> = { S: story.situation, T: story.task, A: story.action, R: story.result }
  return Boolean(map[letter])
}

/* ── Relative date ── */
function relativeDate(dateStr: string): string {
  const diff = Math.floor((Date.now() - new Date(dateStr).getTime()) / 86400000)
  if (diff === 0) return 'today'
  if (diff === 1) return '1d ago'
  return `${diff}d ago`
}

/* ── Story Card ── */
function StoryCard({
  story,
  onEdit,
  onDelete,
  onToggleFavorite,
  onClick,
}: {
  story: InterviewStory
  onEdit: () => void
  onDelete: () => void
  onToggleFavorite: () => void
  onClick: () => void
}) {
  const star = getStarStatus(story)

  return (
    <div
      onClick={onClick}
      className="group flex flex-col gap-3 p-[18px] rounded-2xl border border-[var(--jf-border)] bg-[var(--jf-bg-card)] cursor-pointer transition-shadow duration-150 hover:shadow-md hover:border-[#CBD5E1]"
      style={{ boxShadow: 'var(--jf-shadow-sm)' }}
    >
      {/* 1. Title */}
      <h3 className="text-sm font-semibold leading-[1.4] text-[var(--jf-text-primary)]">
        {story.title}
      </h3>

      {/* 2. Tags row */}
      {story.competencies.length > 0 && (
        <div className="flex flex-wrap gap-[5px]">
          {story.competencies.map((c) => {
            const s = getTagStyle(c)
            return (
              <span
                key={c}
                className="text-[11px] font-medium px-2 py-[2px] rounded-full font-[var(--font-dm-mono,monospace)]"
                style={{ background: s.bg, color: s.color, border: `1px solid ${s.border}` }}
              >
                {c}
              </span>
            )
          })}
        </div>
      )}

      {/* 3. STAR progress row */}
      <div className="flex items-center gap-2">
        {(['S', 'T', 'A', 'R'] as const).map((letter) => {
          const filled = isStarFilled(story, letter)
          return (
            <span
              key={letter}
              className={cn(
                'w-[22px] h-[22px] rounded-[6px] flex items-center justify-center text-[10px] font-medium font-[var(--font-dm-mono,monospace)]',
                filled
                  ? 'bg-[var(--jf-interactive-subtle)] text-[var(--jf-interactive)] border border-[#BFDBFE]'
                  : 'bg-[var(--jf-bg-subtle,#F8FAFC)] text-[var(--jf-text-muted)] border border-[var(--jf-border)]'
              )}
            >
              {letter}
            </span>
          )
        })}
        <span
          className="text-[11px] font-medium font-[var(--font-dm-mono,monospace)]"
          style={{ color: star.color }}
        >
          {star.label}
        </span>
      </div>

      {/* 4. Actions footer */}
      <div className="flex items-center justify-between pt-[10px] border-t border-[var(--jf-border)]">
        <span className="text-[10px] text-[var(--jf-text-muted)] font-[var(--font-dm-mono,monospace)]">
          Updated {relativeDate(story.updated_at)}
        </span>
        <div className="flex gap-1" onClick={(e) => e.stopPropagation()}>
          {/* Favorite button — only for favorited stories */}
          {story.is_favorite && (
            <button
              type="button"
              onClick={onToggleFavorite}
              className="w-7 h-7 rounded-[6px] flex items-center justify-center bg-transparent hover:bg-[var(--jf-bg-subtle)] transition-[background] duration-[120ms] cursor-pointer"
              title="Remove from favorites"
            >
              <svg className="w-3.5 h-3.5" viewBox="0 0 20 20" fill="#F59E0B">
                <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
              </svg>
            </button>
          )}
          {/* Edit button */}
          <button
            type="button"
            onClick={onEdit}
            className="w-7 h-7 rounded-[6px] flex items-center justify-center bg-transparent hover:bg-[var(--jf-bg-subtle)] transition-[background] duration-[120ms] cursor-pointer text-[var(--jf-text-muted)]"
            title="Edit story"
          >
            <svg className="w-3.5 h-3.5" viewBox="0 0 20 20" fill="currentColor">
              <path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z" />
            </svg>
          </button>
          {/* Delete button */}
          <button
            type="button"
            onClick={onDelete}
            className="w-7 h-7 rounded-[6px] flex items-center justify-center bg-transparent hover:bg-[var(--jf-bg-subtle)] transition-[background] duration-[120ms] cursor-pointer text-[var(--jf-text-muted)]"
            title="Delete story"
          >
            <svg className="w-3.5 h-3.5" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" />
            </svg>
          </button>
        </div>
      </div>
    </div>
  )
}

/* ── Empty state card ── */
function EmptyStateCard({ onClick }: { onClick: () => void }) {
  return (
    <div
      onClick={onClick}
      className="flex flex-col items-center justify-center text-center gap-[10px] min-h-[160px] p-[18px] rounded-2xl bg-[var(--jf-bg-subtle,#F8FAFC)] cursor-pointer"
      style={{ border: '2px dashed var(--jf-border)' }}
    >
      <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: 'rgba(37,99,235,0.08)' }}>
        <svg width="20" height="20" viewBox="0 0 20 20" fill="#2563EB">
          <path fillRule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clipRule="evenodd" />
        </svg>
      </div>
      <p className="text-sm font-semibold text-[var(--jf-text-secondary)]">Write your next story</p>
      <p className="text-xs text-[var(--jf-text-muted)] max-w-[160px]">Capture a STAR moment before you forget it</p>
    </div>
  )
}

type StarFilter = 'all' | 'complete' | 'in-progress'

/* ── Main page client component ── */
export function StoriesPageClient() {
  const [search, setSearch] = useState('')
  const [categoryFilter, setCategoryFilter] = useState<string>('All')
  const [starFilter, setStarFilter] = useState<StarFilter>('all')
  const [favoritesOnly, setFavoritesOnly] = useState(false)

  const { data: stories, isLoading } = useStories({
    search: search || undefined,
  })

  const { openNewStory, openStory, editStory, closeExpanded, expandedView } = useStoryLibrary()
  const updateStory = useUpdateStory()
  const deleteStory = useDeleteStory()

  const isDetailOpen = expandedView.type !== 'none'

  const hasActiveFilters = categoryFilter !== 'All' || starFilter !== 'all' || favoritesOnly

  // Filter stories by all active filters
  const filteredStories = stories?.filter((story) => {
    if (categoryFilter !== 'All' && !story.competencies.some((c) => getCompetencyCategory(c) === categoryFilter)) return false
    if (favoritesOnly && !story.is_favorite) return false
    if (starFilter === 'complete') {
      const filled = [story.situation, story.task, story.action, story.result].filter(Boolean).length
      if (filled < 4) return false
    }
    if (starFilter === 'in-progress') {
      const filled = [story.situation, story.task, story.action, story.result].filter(Boolean).length
      if (filled === 0 || filled === 4) return false
    }
    return true
  })

  // Keyboard shortcuts
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

  function handleToggleFavorite(story: InterviewStory) {
    updateStory.mutate({ id: story.id, input: { is_favorite: !story.is_favorite } })
  }

  function handleDelete(storyId: string) {
    deleteStory.mutate(storyId)
  }

  return (
    <div className="flex-1 flex flex-col h-full overflow-hidden">
      {/* Top bar (sticky) */}
      <div
        className="flex items-center gap-[10px] border-b border-[var(--jf-border)] bg-[var(--jf-bg-card)] overflow-x-auto no-scrollbar"
        style={{ padding: '14px 24px' }}
      >
        {/* Search input */}
        <div className="relative max-w-[200px]">
          <svg
            className="absolute left-[10px] top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-[var(--jf-text-muted)]"
            viewBox="0 0 20 20"
            fill="currentColor"
          >
            <path fillRule="evenodd" d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z" clipRule="evenodd" />
          </svg>
          <input
            type="text"
            placeholder="Search stories…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full rounded-lg text-[13px] bg-transparent outline-none placeholder:text-[var(--jf-text-muted)]"
            style={{
              border: '1px solid var(--jf-border)',
              padding: '6px 10px 6px 32px',
              borderRadius: '8px',
            }}
          />
        </div>

          {/* Category filter chips */}
        {FILTER_CATEGORIES.map((cat) => {
          const isActive = categoryFilter === cat
          return (
            <button
              key={cat}
              type="button"
              onClick={() => setCategoryFilter(cat)}
              className={cn(
                'rounded-full text-xs font-medium cursor-pointer transition-colors shrink-0',
                isActive
                  ? 'text-[var(--jf-interactive)]'
                  : 'text-[var(--jf-text-secondary)] hover:border-[var(--jf-interactive)] hover:text-[var(--jf-interactive)]'
              )}
              style={{
                padding: '5px 12px',
                fontSize: '12px',
                fontWeight: 500,
                border: isActive ? '1px solid #BFDBFE' : '1px solid var(--jf-border)',
                background: isActive ? 'var(--jf-interactive-subtle)' : 'var(--jf-bg-card)',
                borderRadius: '100px',
              }}
            >
              {cat}
            </button>
          )
        })}

        {/* Divider */}
        <div style={{ width: 1, height: 18, background: 'var(--jf-border)', flexShrink: 0 }} />

        {/* Favorites filter */}
        <button
          type="button"
          onClick={() => setFavoritesOnly((v) => !v)}
          className="rounded-full text-xs font-medium cursor-pointer transition-colors shrink-0 flex items-center gap-1"
          style={{
            padding: '5px 12px',
            fontSize: '12px',
            fontWeight: 500,
            border: favoritesOnly ? '1px solid var(--jf-priority-medium-border)' : '1px solid var(--jf-border)',
            background: favoritesOnly ? 'var(--jf-priority-medium-bg)' : 'var(--jf-bg-card)',
            color: favoritesOnly ? 'var(--jf-warning)' : 'var(--jf-text-secondary)',
            borderRadius: '100px',
          }}
        >
          ⭐ Favorites
        </button>

        {/* STAR completion filters */}
        {(['complete', 'in-progress'] as StarFilter[]).map((sf) => {
          const label = sf === 'complete' ? 'Complete' : 'In Progress'
          const isActive = starFilter === sf
          return (
            <button
              key={sf}
              type="button"
              onClick={() => setStarFilter(isActive ? 'all' : sf)}
              className="rounded-full text-xs font-medium cursor-pointer transition-colors shrink-0"
              style={{
                padding: '5px 12px',
                fontSize: '12px',
                fontWeight: 500,
                border: isActive ? '1px solid var(--jf-success-border)' : '1px solid var(--jf-border)',
                background: isActive ? 'var(--jf-success-tint)' : 'var(--jf-bg-card)',
                color: isActive ? 'var(--jf-success)' : 'var(--jf-text-secondary)',
                borderRadius: '100px',
              }}
            >
              {label}
            </button>
          )
        })}

        {/* Clear filters */}
        {hasActiveFilters && (
          <button
            type="button"
            onClick={() => { setCategoryFilter('All'); setStarFilter('all'); setFavoritesOnly(false) }}
            className="rounded-full text-xs font-medium cursor-pointer transition-colors shrink-0"
            style={{
              padding: '5px 10px',
              fontSize: '11px',
              fontWeight: 500,
              border: '1px solid var(--jf-border)',
              background: 'transparent',
              color: 'var(--jf-text-muted)',
              borderRadius: '100px',
            }}
          >
            Clear ✕
          </button>
        )}

        {/* Spacer + New Story button */}
        <div className="ml-auto">
          <Button onClick={openNewStory} className="rounded-xl min-h-[44px] gap-1.5">
            <Plus className="w-4 h-4" />
            New Story
          </Button>
        </div>
      </div>

      {/* Content area */}
      <div className="flex-1 overflow-y-auto p-6">
        <AnimatePresence>
          {isDetailOpen && (
            <motion.div
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 8 }}
              transition={{ duration: 0.2 }}
              className="mb-6"
            >
              <StoryInlinePanel key="inline-panel" />
            </motion.div>
          )}
        </AnimatePresence>

        {isLoading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-[14px]">
            {[1, 2, 3, 4].map((n) => (
              <div
                key={n}
                className="animate-pulse rounded-2xl border border-[var(--jf-border)] bg-[var(--jf-bg-card)] p-[18px] flex flex-col gap-3"
              >
                <div className="h-4 bg-muted rounded w-3/4" />
                <div className="flex gap-1.5">
                  <div className="h-5 bg-muted rounded-full w-20" />
                  <div className="h-5 bg-muted rounded-full w-16" />
                </div>
                <div className="flex gap-2">
                  {[1, 2, 3, 4].map((i) => (
                    <div key={i} className="w-[22px] h-[22px] bg-muted rounded-[6px]" />
                  ))}
                </div>
                <div className="h-px bg-[var(--jf-border)]" />
                <div className="h-3 bg-muted rounded w-1/3" />
              </div>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-[14px]">
            {filteredStories && filteredStories.length > 0 && (
              <>
                {filteredStories.map((story) => (
                  <StoryCard
                    key={story.id}
                    story={story}
                    onClick={() => openStory(story.id)}
                    onEdit={() => editStory(story.id)}
                    onDelete={() => handleDelete(story.id)}
                    onToggleFavorite={() => handleToggleFavorite(story)}
                  />
                ))}
              </>
            )}
            <EmptyStateCard onClick={openNewStory} />
          </div>
        )}

        {/* No results message when filtering */}
        {!isLoading && filteredStories && filteredStories.length === 0 && (search || categoryFilter !== 'All') && (
          <div className="text-center py-12">
            <p className="text-sm font-medium text-[var(--jf-text-primary)] mb-1">No stories found</p>
            <p className="text-xs text-[var(--jf-text-muted)]">Try adjusting your search or filters.</p>
          </div>
        )}
      </div>
    </div>
  )
}
