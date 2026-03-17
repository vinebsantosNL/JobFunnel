'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { CompetencyPicker } from './competency-picker'
import type { CreateStoryInput } from '@/lib/validations/story'
import type { InterviewStory } from '@/types/database'

interface StoryFormProps {
  initialValues?: Partial<InterviewStory>
  onSubmit: (input: CreateStoryInput) => Promise<void>
  onCancel: () => void
  loading?: boolean
}

function wordCount(text: string): number {
  return text.trim() ? text.trim().split(/\s+/).length : 0
}

type StarField = {
  id: 'situation' | 'task' | 'action' | 'result'
  label: string
  value: string
  setter: (v: string) => void
  placeholder: string
}

export function StoryForm({ initialValues, onSubmit, onCancel, loading }: StoryFormProps) {
  const [mode, setMode] = useState<'star' | 'freeform'>('star')
  const [title, setTitle] = useState(initialValues?.title ?? '')
  const [situation, setSituation] = useState(initialValues?.situation ?? '')
  const [task, setTask] = useState(initialValues?.task ?? '')
  const [action, setAction] = useState(initialValues?.action ?? '')
  const [result, setResult] = useState(initialValues?.result ?? '')
  const [fullContent, setFullContent] = useState(initialValues?.full_content ?? '')
  const [competencies, setCompetencies] = useState<string[]>(initialValues?.competencies ?? [])

  const starFields: StarField[] = [
    { id: 'situation', label: 'Situation', value: situation, setter: setSituation, placeholder: 'Describe the context and background...' },
    { id: 'task', label: 'Task', value: task, setter: setTask, placeholder: 'What was your responsibility?' },
    { id: 'action', label: 'Action', value: action, setter: setAction, placeholder: 'What specific steps did you take?' },
    { id: 'result', label: 'Result', value: result, setter: setResult, placeholder: 'What was the outcome? Use metrics where possible.' },
  ]

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    await onSubmit({
      title,
      situation: mode === 'star' ? situation || undefined : undefined,
      task: mode === 'star' ? task || undefined : undefined,
      action: mode === 'star' ? action || undefined : undefined,
      result: mode === 'star' ? result || undefined : undefined,
      full_content: mode === 'freeform' ? fullContent || undefined : undefined,
      competencies,
      is_favorite: initialValues?.is_favorite ?? false,
    })
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <Label htmlFor="story-title">Title</Label>
        <Input
          id="story-title"
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
          onClick={() => setMode('star')}
          className={`px-3 py-1.5 rounded text-sm border transition-colors ${mode === 'star' ? 'bg-blue-600 text-white border-blue-600' : 'bg-white text-gray-600 border-gray-200'}`}
        >
          STAR Format
        </button>
        <button
          type="button"
          onClick={() => setMode('freeform')}
          className={`px-3 py-1.5 rounded text-sm border transition-colors ${mode === 'freeform' ? 'bg-blue-600 text-white border-blue-600' : 'bg-white text-gray-600 border-gray-200'}`}
        >
          Free Form
        </button>
      </div>

      {mode === 'star' ? (
        <div className="space-y-3">
          {starFields.map(field => (
            <div key={field.id}>
              <div className="flex justify-between items-center mb-1">
                <Label htmlFor={field.id}>{field.label}</Label>
                <span className="text-xs text-gray-400">{wordCount(field.value)} words</span>
              </div>
              <Textarea
                id={field.id}
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
            <Label htmlFor="full-content">Story</Label>
            <span className="text-xs text-gray-400">{wordCount(fullContent)} words</span>
          </div>
          <Textarea
            id="full-content"
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
        <Button type="submit" disabled={loading} className="flex-1">
          {loading ? 'Saving...' : 'Save Story'}
        </Button>
        <Button type="button" variant="outline" onClick={onCancel}>
          Cancel
        </Button>
      </div>
    </form>
  )
}
