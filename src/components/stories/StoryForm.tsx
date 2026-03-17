'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { CompetencyPicker } from './competency-picker'
import { WordCount } from './WordCount'
import { useCreateStory, useUpdateStory } from '@/hooks/use-stories'
import { useStoryLibrary } from '@/hooks/useStoryLibrary'
import type { InterviewStory } from '@/types/database'

interface StoryFormProps {
  mode: 'create' | 'edit'
  initialValues?: Partial<InterviewStory>
}

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

  const starFields = [
    { id: 'situation' as const, label: 'Situation', value: situation, setter: setSituation, placeholder: 'Describe the context and background...' },
    { id: 'task' as const, label: 'Task', value: task, setter: setTask, placeholder: 'What was your responsibility?' },
    { id: 'action' as const, label: 'Action', value: action, setter: setAction, placeholder: 'What specific steps did you take?' },
    { id: 'result' as const, label: 'Result', value: result, setter: setResult, placeholder: 'What was the outcome? Use metrics where possible.' },
  ]

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
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <Label htmlFor="story-title-inline">Title</Label>
        <Input
          id="story-title-inline"
          value={title}
          onChange={e => setTitle(e.target.value)}
          placeholder="e.g. Led cross-team migration to microservices"
          required
        />
      </div>

      {/* Mode toggle */}
      <div className="flex gap-2">
        <button
          type="button"
          onClick={() => setFormMode('star')}
          className={`px-3 py-1.5 rounded text-sm border transition-colors ${
            formMode === 'star'
              ? 'bg-blue-600 text-white border-blue-600'
              : 'bg-white text-gray-600 border-gray-200 hover:border-blue-300'
          }`}
        >
          STAR Format
        </button>
        <button
          type="button"
          onClick={() => setFormMode('freeform')}
          className={`px-3 py-1.5 rounded text-sm border transition-colors ${
            formMode === 'freeform'
              ? 'bg-blue-600 text-white border-blue-600'
              : 'bg-white text-gray-600 border-gray-200 hover:border-blue-300'
          }`}
        >
          Free Form
        </button>
      </div>

      {formMode === 'star' ? (
        <div className="space-y-3">
          {starFields.map(field => (
            <div key={field.id}>
              <div className="flex justify-between items-center mb-1">
                <Label htmlFor={`inline-${field.id}`}>{field.label}</Label>
                <WordCount value={field.value} />
              </div>
              <Textarea
                id={`inline-${field.id}`}
                value={field.value}
                onChange={e => field.setter(e.target.value)}
                placeholder={field.placeholder}
                rows={3}
              />
            </div>
          ))}
        </div>
      ) : (
        <div>
          <div className="flex justify-between items-center mb-1">
            <Label htmlFor="inline-full-content">Story</Label>
            <WordCount value={fullContent} />
          </div>
          <Textarea
            id="inline-full-content"
            value={fullContent}
            onChange={e => setFullContent(e.target.value)}
            placeholder="Write your full story..."
            rows={8}
          />
        </div>
      )}

      <div>
        <Label className="mb-2 block">Competencies</Label>
        <CompetencyPicker selected={competencies} onChange={setCompetencies} />
      </div>

      <div className="flex gap-2 pt-2">
        <Button type="submit" disabled={isPending} className="flex-1">
          {isPending ? 'Saving...' : 'Save Story'}
        </Button>
        <Button type="button" variant="outline" onClick={closeExpanded}>
          Cancel
        </Button>
      </div>
    </form>
  )
}
