'use client'

import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { createCVVersionSchema, type CreateCVVersionInput } from '@/lib/validations/cv-version'
import { useCreateCVVersion, useUpdateCVVersion } from '@/hooks/useCVVersions'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import type { CVVersion } from '@/types/database.types'

interface CVVersionFormProps {
  version?: CVVersion
  onSuccess?: () => void
  onCancel?: () => void
}

export function CVVersionForm({ version, onSuccess, onCancel }: CVVersionFormProps) {
  const isEditing = Boolean(version)
  const createMutation = useCreateCVVersion()
  const updateMutation = useUpdateCVVersion()

  const [tagInput, setTagInput] = useState('')
  const [tags, setTags] = useState<string[]>(version?.tags ?? [])

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<CreateCVVersionInput>({
    resolver: zodResolver(createCVVersionSchema),
    defaultValues: {
      name: version?.name ?? '',
      description: version?.description ?? '',
      tags: version?.tags ?? [],
      is_default: version?.is_default ?? false,
    },
  })

  function handleAddTag(e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === 'Enter') {
      e.preventDefault()
      const trimmed = tagInput.trim()
      if (trimmed && !tags.includes(trimmed) && tags.length < 20) {
        setTags([...tags, trimmed])
        setTagInput('')
      }
    }
  }

  function handleRemoveTag(tag: string) {
    setTags(tags.filter((t) => t !== tag))
  }

  async function onSubmit(data: CreateCVVersionInput) {
    const payload = { ...data, tags }

    if (isEditing && version) {
      await updateMutation.mutateAsync({ id: version.id, input: payload })
    } else {
      await createMutation.mutateAsync(payload)
    }
    onSuccess?.()
  }

  const isPending = createMutation.isPending || updateMutation.isPending
  const submitError = createMutation.error?.message ?? updateMutation.error?.message

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      {/* Name */}
      <div className="space-y-1">
        <Label htmlFor="cv-name">Name *</Label>
        <Input
          id="cv-name"
          {...register('name')}
          placeholder="e.g. Senior Engineer v2"
          maxLength={100}
        />
        {errors.name && (
          <p className="text-xs text-red-500">{errors.name.message}</p>
        )}
      </div>

      {/* Description */}
      <div className="space-y-1">
        <Label htmlFor="cv-description">Description</Label>
        <Textarea
          id="cv-description"
          {...register('description')}
          placeholder="What makes this version unique?"
          rows={3}
        />
      </div>

      {/* Tags */}
      <div className="space-y-1">
        <Label htmlFor="cv-tags">Tags</Label>
        <Input
          id="cv-tags"
          value={tagInput}
          onChange={(e) => setTagInput(e.target.value)}
          onKeyDown={handleAddTag}
          placeholder="Type a tag and press Enter"
        />
        {tags.length > 0 && (
          <div className="flex flex-wrap gap-1 mt-2">
            {tags.map((tag) => (
              <Badge
                key={tag}
                variant="secondary"
                className="cursor-pointer gap-1"
                onClick={() => handleRemoveTag(tag)}
              >
                {tag}
                <span className="text-xs opacity-60 hover:opacity-100">&times;</span>
              </Badge>
            ))}
          </div>
        )}
      </div>

      {/* Set as default */}
      <div className="flex items-center gap-2">
        <input
          id="cv-default"
          type="checkbox"
          className="h-4 w-4 rounded border-gray-300"
          {...register('is_default')}
        />
        <Label htmlFor="cv-default" className="cursor-pointer">
          Set as default CV
        </Label>
      </div>

      {submitError && (
        <p className="text-sm text-red-500">{submitError}</p>
      )}

      <div className="flex gap-2 justify-end pt-2">
        <Button type="button" variant="ghost" onClick={onCancel} disabled={isPending}>
          Cancel
        </Button>
        <Button type="submit" disabled={isPending}>
          {isPending ? 'Saving…' : isEditing ? 'Save changes' : 'Create version'}
        </Button>
      </div>
    </form>
  )
}
