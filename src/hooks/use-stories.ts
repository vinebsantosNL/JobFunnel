'use client'

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import type { InterviewStory } from '@/types/database'
import type { CreateStoryInput, UpdateStoryInput } from '@/lib/validations/story'

async function fetchStories(params?: { search?: string; competency?: string }): Promise<InterviewStory[]> {
  const url = new URL('/api/stories', window.location.origin)
  if (params?.search) url.searchParams.set('search', params.search)
  if (params?.competency) url.searchParams.set('competency', params.competency)
  const res = await fetch(url.toString())
  if (!res.ok) throw new Error('Failed to fetch stories')
  return res.json()
}

async function createStory(input: CreateStoryInput): Promise<InterviewStory> {
  const res = await fetch('/api/stories', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(input),
  })
  if (!res.ok) throw new Error('Failed to create story')
  return res.json()
}

async function updateStory(id: string, input: UpdateStoryInput): Promise<InterviewStory> {
  const res = await fetch(`/api/stories/${id}`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(input),
  })
  if (!res.ok) throw new Error('Failed to update story')
  return res.json()
}

async function deleteStory(id: string): Promise<void> {
  const res = await fetch(`/api/stories/${id}`, { method: 'DELETE' })
  if (!res.ok) throw new Error('Failed to delete story')
}

export function useStories(params?: { search?: string; competency?: string }) {
  return useQuery({
    queryKey: ['stories', params],
    queryFn: () => fetchStories(params),
  })
}

export function useCreateStory() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: createStory,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['stories'] })
      toast.success('Story saved')
    },
    onError: (err: Error) => {
      toast.error(err.message)
    },
  })
}

export function useUpdateStory() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ id, input }: { id: string; input: UpdateStoryInput }) => updateStory(id, input),
    onMutate: async ({ id, input }) => {
      await queryClient.cancelQueries({ queryKey: ['stories'] })
      const previous = queryClient.getQueryData<InterviewStory[]>(['stories'])
      if (previous) {
        queryClient.setQueryData<InterviewStory[]>(['stories'], old =>
          old?.map(s => s.id === id ? { ...s, ...input } : s) ?? []
        )
      }
      return { previous }
    },
    onError: (_err, _vars, context) => {
      if (context?.previous) queryClient.setQueryData(['stories'], context.previous)
    },
    onSettled: () => queryClient.invalidateQueries({ queryKey: ['stories'] }),
  })
}

export function useDeleteStory() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: deleteStory,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['stories'] })
      toast.success('Story deleted')
    },
    onError: (err: Error) => {
      toast.error(err.message)
    },
  })
}
