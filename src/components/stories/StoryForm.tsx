'use client'

import { useState } from 'react'
import { Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { CompetencyPicker } from './competency-picker'
import { WordCount } from './WordCount'
import { useCreateStory, useUpdateStory } from '@/hooks/use-stories'
import { useStoryLibrary } from '@/hooks/useStoryLibrary'
import type { InterviewStory } from '@/types/database.types'
import { cn } from '@/lib/utils'

interface StoryFormProps {
  mode: 'create' | 'edit'
  initialValues?: Partial<InterviewStory>
}

const STAR_CONFIG = [
  {
    id: 'situation' as const,
    letter: 'S',
    label: 'Situation',
    placeholder: 'Describe the context and background...',
    colors: 'bg-blue-50 text-blue-600',
  },
  {
    id: 'task' as const,
    letter: 'T',
    label: 'Task',
    placeholder: 'What was your responsibility?',
    colors: 'bg-purple-50 text-purple-600',
  },
  {
    id: 'action' as const,
    letter: 'A',
    label: 'Action',
    placeholder: 'What specific steps did you take?',
    colors: 'bg-amber-50 text-amber-600',
  },
  {
    id: 'result' as const,
    letter: 'R',
    label: 'Result',
    placeholder: 'What was the outcome? Use metrics where possible.',
    colors: 'bg-green-50 text-green-600',
  },
]

export function StoryForm({ mode, initialValues }: StoryFormProps) {
  const { closeExpanded } = useStoryLibrary()
  const createStory = useCreateStory()
  const updateStory = useUpdateStory()

  const [formMode, setFormMode] = useState<'star' | 'freeform'>(
    initialValues?.full_content ? 'freeform' : 'star'
  )
  const [title, setTitle] = useState(initialValues?.title ?? '')
  const [situation, setSituation] = useState(initialValues?.situation ?? '')
  const [task, setTask] = useState(initialValues?.task ?? '')
  const [action, setAction] = useState(initialValues?.action ?? '')
  const [result, setResult] = useState(initialValues?.result ?? '')
  const [fullContent, setFullContent] = useState(initialValues?.full_content ?? '')
  const [competencies, setCompetencies] = useState<string[]>(initialValues?.competencies ?? [])

  const isPending = createStory.isPending || updateStory.isPending

  const fieldValues: Record<string, string> = { situation, task, action, result }
  const fieldSetters: Record<string, (v: string) => void> = {
    situation: setSituation,
    task: setTask,
    action: setAction,
    result: setResult,
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!title.trim()) return

    const input = {
      title,
      situation: formMode === 'star' ? situation || undefined : undefined,
      task: formMode === 'star' ? task || undefined : undefined,
      action: formMode === 'star' ? action || undefined : undefined,
      result: formMode === 'star' ? result || undefined : undefined,
      full_content: formMode === 'freeform' ? fullContent || undefined : undefined,
      competencies,
      is_favorite: initialValues?.is_favorite ?? false,
    }

    if (mode === 'create') {
      await createStory.mutateAsync(input)
      closeExpanded()
    } else if (mode === 'edit' && initialValues?.id) {
      await updateStory.mutateAsync({ id: initialValues.id, input })
      closeExpanded()
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      {/* Title */}
      <div>
        <Label htmlFor="story-title-inline" className="text-xs font-medium text-gray-500 uppercase tracking-wide">
          Title
        </Label>
        <Input
          id="story-title-inline"
          value={title}
          onChange={e => setTitle(e.target.value)}
          placeholder="e.g. Led cross-team migration to microservices"
          className="mt-1"
          required
        />
      </div>

      {/* Mode toggle */}
      <div className="flex gap-2 border border-gray-200 rounded-lg overflow-hidden w-fit">
        {(['star', 'freeform'] as const).map(m => (
          <button
            key={m}
            type="button"
            onClick={() => setFormMode(m)}
            className={cn(
              'px-4 py-1.5 text-sm font-medium transition-colors',
              formMode === m
                ? 'bg-gray-900 text-white'
                : 'bg-white text-gray-600 hover:bg-gray-50'
            )}
          >
            {m === 'star' ? 'STAR Format' : 'Free Form'}
          </button>
        ))}
      </div>

      {/* Fields */}
      {formMode === 'star' ? (
        <div className="space-y-4">
          {STAR_CONFIG.map(field => (
            <div key={field.id}>
              {/* Section header with letter badge */}
              <div className="flex items-center justify-between mb-1.5">
                <div className="flex items-center gap-2">
                  <div className={cn('w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0 font-bold text-xs', field.colors)}>
                    {field.letter}
                  </div>
                  <span className="text-xs font-semibold text-gray-500 uppercase tracking-widest">{field.label}</span>
                </div>
                <WordCount value={fieldValues[field.id]} />
              </div>
              <Textarea
                id={`inline-${field.id}`}
                value={fieldValues[field.id]}
                onChange={e => fieldSetters[field.id](e.target.value)}
                placeholder={field.placeholder}
                rows={3}
                className="text-sm"
              />
            </div>
          ))}
        </div>
      ) : (
        <div>
          <div className="flex justify-between items-center mb-1.5">
            <Label htmlFor="inline-full-content" className="text-xs font-medium text-gray-500 uppercase tracking-wide">
              Story
            </Label>
            <WordCount value={fullContent} />
          </div>
          <Textarea
            id="inline-full-content"
            value={fullContent}
            onChange={e => setFullContent(e.target.value)}
            placeholder="Write your full story..."
            rows={8}
            className="text-sm"
          />
        </div>
      )}

      {/* Competencies */}
      <div>
        <Label className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-2 block">
          Competencies
        </Label>
        <CompetencyPicker selected={competencies} onChange={setCompetencies} />
      </div>

      {/* Submit */}
      <div className="flex gap-2 pt-1">
        <Button type="submit" disabled={isPending} className="flex-1 gap-1.5">
          {isPending ? <><Loader2 className="w-3.5 h-3.5 animate-spin" />Saving…</> : 'Save Story'}
        </Button>
        <Button type="button" variant="outline" onClick={closeExpanded}>
          Cancel
        </Button>
      </div>
    </form>
  )
}
