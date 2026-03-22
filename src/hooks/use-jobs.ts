'use client'

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import type { JobApplication } from '@/types/database.types'
import type { CreateJobInput, UpdateJobInput } from '@/lib/validations/job'

async function fetchJobs(params?: { priority?: string; search?: string }): Promise<JobApplication[]> {
  const url = new URL('/api/jobs', window.location.origin)
  if (params?.priority && params.priority !== 'all') url.searchParams.set('priority', params.priority)
  if (params?.search) url.searchParams.set('search', params.search)
  const res = await fetch(url.toString())
  if (!res.ok) throw new Error('Failed to fetch jobs')
  return res.json()
}

async function createJob(input: CreateJobInput): Promise<JobApplication> {
  const res = await fetch('/api/jobs', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(input),
  })
  if (!res.ok) {
    const error = await res.json()
    throw new Error(error.error ?? 'Failed to create job')
  }
  return res.json()
}

async function updateJob(id: string, input: UpdateJobInput): Promise<JobApplication> {
  const res = await fetch(`/api/jobs/${id}`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(input),
  })
  if (!res.ok) throw new Error('Failed to update job')
  return res.json()
}

async function deleteJob(id: string): Promise<void> {
  const res = await fetch(`/api/jobs/${id}`, { method: 'DELETE' })
  if (!res.ok) throw new Error('Failed to delete job')
}

export function useJobs(params?: { priority?: string; search?: string }) {
  return useQuery({
    queryKey: ['jobs', params],
    queryFn: () => fetchJobs(params),
  })
}

export function useCreateJob() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: createJob,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['jobs'] }),
  })
}

export function useUpdateJob() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ id, input }: { id: string; input: UpdateJobInput }) => updateJob(id, input),
    onMutate: async ({ id, input }) => {
      // Cancel any in-flight refetches for ALL ['jobs', *] variations
      await queryClient.cancelQueries({ queryKey: ['jobs'] })

      // Snapshot every active jobs cache (params may differ per component)
      const previousEntries = queryClient.getQueriesData<JobApplication[]>({ queryKey: ['jobs'] })

      // Optimistically patch every matching cache — card moves instantly
      queryClient.setQueriesData<JobApplication[]>(
        { queryKey: ['jobs'] },
        (old) =>
          old?.map((j) =>
            j.id === id
              ? { ...j, ...input, stage_updated_at: new Date().toISOString() }
              : j
          ) ?? []
      )

      return { previousEntries }
    },
    onError: (_err, _vars, context) => {
      // Roll back all snapshots on failure
      for (const [queryKey, data] of context?.previousEntries ?? []) {
        queryClient.setQueryData(queryKey, data)
      }
    },
    onSettled: () => queryClient.invalidateQueries({ queryKey: ['jobs'] }),
  })
}

export function useDeleteJob() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: deleteJob,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['jobs'] }),
  })
}
