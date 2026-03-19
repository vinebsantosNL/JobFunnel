'use client'

import { useState, useEffect } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'
import type { Profile, UserRole } from '@/types/database'

const ROLES: { value: UserRole; label: string }[] = [
  { value: 'software_engineer', label: 'Software Engineer' },
  { value: 'product_manager', label: 'Product Manager' },
  { value: 'data_scientist', label: 'Data Scientist' },
  { value: 'other', label: 'Other' },
]

interface ProfileFormData {
  full_name: string
  role: UserRole | ''
  years_experience: string
  location_country: string
  target_countries: string
}

export default function ProfileSettingsPage() {
  const queryClient = useQueryClient()

  const { data: profile, isLoading } = useQuery<Profile>({
    queryKey: ['profile'],
    queryFn: async () => {
      const res = await fetch('/api/profile')
      if (!res.ok) throw new Error('Failed to fetch profile')
      return res.json()
    },
  })

  const [form, setForm] = useState<ProfileFormData>({
    full_name: '',
    role: '',
    years_experience: '',
    location_country: '',
    target_countries: '',
  })

  useEffect(() => {
    if (profile) {
      setForm({
        full_name: profile.full_name ?? '',
        role: profile.role ?? '',
        years_experience: profile.years_experience?.toString() ?? '',
        location_country: profile.location_country ?? '',
        target_countries: profile.target_countries?.join(', ') ?? '',
      })
    }
  }, [profile])

  const mutation = useMutation({
    mutationFn: async (data: ProfileFormData) => {
      const payload: Record<string, unknown> = {
        full_name: data.full_name || undefined,
        role: data.role || undefined,
        years_experience: data.years_experience ? parseInt(data.years_experience, 10) : null,
        location_country: data.location_country || null,
        target_countries: data.target_countries
          ? data.target_countries.split(',').map((s) => s.trim()).filter(Boolean)
          : [],
      }
      const res = await fetch('/api/profile', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })
      if (!res.ok) {
        const err = await res.json() as { error?: string }
        throw new Error(err.error ?? 'Failed to update profile')
      }
      return res.json()
    },
    onSuccess: () => {
      toast.success('Profile updated')
      queryClient.invalidateQueries({ queryKey: ['profile'] })
      queryClient.invalidateQueries({ queryKey: ['subscription'] })
    },
    onError: (err: Error) => {
      toast.error(err.message)
    },
  })

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    mutation.mutate(form)
  }

  return (
    <main className="flex-1 p-6 overflow-auto">
      <div className="max-w-xl mx-auto">
        <h1 className="text-lg font-semibold text-gray-900 mb-6">Profile Settings</h1>
        <Card>
            <CardHeader>
              <CardTitle className="text-base">Your Profile</CardTitle>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="space-y-4 animate-pulse">
                  {Array.from({ length: 4 }).map((_, i) => (
                    <div key={i} className="h-9 bg-gray-100 rounded-lg" />
                  ))}
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="space-y-1.5">
                    <Label htmlFor="full_name">Full Name</Label>
                    <Input
                      id="full_name"
                      value={form.full_name}
                      onChange={(e) => setForm((f) => ({ ...f, full_name: e.target.value }))}
                      placeholder="Jane Smith"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <Label htmlFor="role">Role</Label>
                    <select
                      id="role"
                      value={form.role}
                      onChange={(e) => setForm((f) => ({ ...f, role: e.target.value as UserRole | '' }))}
                      className="flex h-8 w-full rounded-lg border border-input bg-transparent px-2.5 text-sm outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50"
                    >
                      <option value="">Select a role…</option>
                      {ROLES.map((r) => (
                        <option key={r.value} value={r.value}>
                          {r.label}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="space-y-1.5">
                    <Label htmlFor="years_experience">Years of Experience</Label>
                    <Input
                      id="years_experience"
                      type="number"
                      min={0}
                      max={60}
                      value={form.years_experience}
                      onChange={(e) => setForm((f) => ({ ...f, years_experience: e.target.value }))}
                      placeholder="5"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <Label htmlFor="location_country">Location (Country)</Label>
                    <Input
                      id="location_country"
                      value={form.location_country}
                      onChange={(e) =>
                        setForm((f) => ({ ...f, location_country: e.target.value }))
                      }
                      placeholder="Germany"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <Label htmlFor="target_countries">Target Countries</Label>
                    <Input
                      id="target_countries"
                      value={form.target_countries}
                      onChange={(e) =>
                        setForm((f) => ({ ...f, target_countries: e.target.value }))
                      }
                      placeholder="Germany, Netherlands, UK"
                    />
                    <p className="text-xs text-gray-500">Separate multiple countries with commas</p>
                  </div>

                  <div className="flex justify-end pt-2">
                    <Button type="submit" disabled={mutation.isPending}>
                      {mutation.isPending ? 'Saving…' : 'Save Changes'}
                    </Button>
                  </div>
                </form>
              )}
            </CardContent>
        </Card>
      </div>
    </main>
  )
}
