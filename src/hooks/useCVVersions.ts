'use client'

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import type { CVVersion } from '@/types/database.types'
import type { CreateCVVersionInput, UpdateCVVersionInput } from '@/lib/validations/cv-version'

async function fetchCVVersions(includeArchived = false): Promise<CVVersion[]> {
  const url = new URL('/api/cv-versions', window.location.origin)
  if (includeArchived) url.searchParams.set('include_archived', 'true')
  const res = await fetch(url.toString())
  if (!res.ok) throw new Error('Failed to fetch CV versions')
  return res.json()
}

async function createCVVersion(input: CreateCVVersionInput): Promise<CVVersion> {
  const res = await fetch('/api/cv-versions', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(input),
  })
  if (!res.ok) {
    const error = await res.json()
    throw new Error(error.error ?? 'Failed to create CV version')
  }
  return res.json()
}

async function updateCVVersion(id: string, input: UpdateCVVersionInput): Promise<CVVersion> {
  const res = await fetch(`/api/cv-versions/${id}`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(input),
  })
  if (!res.ok) {
    const error = await res.json()
    throw new Error(error.error ?? 'Failed to update CV version')
  }
  return res.json()
}

async function deleteCVVersion(id: string): Promise<void> {
  const res = await fetch(`/api/cv-versions/${id}`, { method: 'DELETE' })
  if (!res.ok) {
    const error = await res.json()
    throw new Error(error.error ?? 'Failed to delete CV version')
  }
}

async function duplicateCVVersion(id: string, name: string): Promise<CVVersion> {
  const res = await fetch(`/api/cv-versions/${id}/duplicate`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ name }),
  })
  if (!res.ok) {
    const error = await res.json()
    throw new Error(error.error ?? 'Failed to duplicate CV version')
  }
  return res.json()
}

export function useCVVersions(includeArchived = false) {
  return useQuery({
    queryKey: ['cv-versions', { includeArchived }],
    queryFn: () => fetchCVVersions(includeArchived),
  })
}

export function useCreateCVVersion() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: createCVVersion,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['cv-versions'] }),
  })
}

export function useUpdateCVVersion() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ id, input }: { id: string; input: UpdateCVVersionInput }) =>
      updateCVVersion(id, input),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['cv-versions'] }),
  })
}

export function useDeleteCVVersion() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: deleteCVVersion,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['cv-versions'] }),
  })
}

export function useDuplicateCVVersion() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ id, name }: { id: string; name: string }) => duplicateCVVersion(id, name),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['cv-versions'] }),
  })
}
