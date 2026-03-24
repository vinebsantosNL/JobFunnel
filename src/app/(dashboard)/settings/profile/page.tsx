'use client'

import { useEffect } from 'react'
import { useForm, Controller } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import type { Profile, UserRole } from '@/types/database.types'

const ROLES: { value: UserRole; label: string }[] = [
  { value: 'software_engineer', label: 'Software Engineer' },
  { value: 'product_manager', label: 'Product Manager' },
  { value: 'data_scientist', label: 'Data Scientist' },
  { value: 'other', label: 'Other' },
]

// Client-side form schema — target_countries edited as comma-separated string
const profileFormSchema = z.object({
  full_name:        z.string().max(200).optional(),
  role:             z.enum(['software_engineer', 'product_manager', 'data_scientist', 'other']).optional().or(z.literal('')),
  years_experience: z.string().optional(),
  location_country: z.string().max(100).optional(),
  target_countries: z.string().optional(),
})
type ProfileFormData = z.infer<typeof profileFormSchema>

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

  const {
    register,
    handleSubmit,
    reset,
    control,
    formState: { errors, isSubmitting },
  } = useForm<ProfileFormData>({
    resolver: zodResolver(profileFormSchema),
    defaultValues: {
      full_name: '',
      role: '',
      years_experience: '',
      location_country: '',
      target_countries: '',
    },
  })

  useEffect(() => {
    if (profile) {
      reset({
        full_name: profile.full_name ?? '',
        role: profile.role ?? '',
        years_experience: profile.years_experience?.toString() ?? '',
        location_country: profile.location_country ?? '',
        target_countries: profile.target_countries?.join(', ') ?? '',
      })
    }
  }, [profile, reset])

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

  function onSubmit(data: ProfileFormData) {
    mutation.mutate(data)
  }

  return (
    <div className="flex-1 p-6 overflow-auto">
      <div className="max-w-xl mx-auto">
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Your Profile</CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="space-y-4 animate-pulse">
                {Array.from({ length: 4 }).map((_, i) => (
                  <div key={i} className="h-9 bg-muted rounded-lg" />
                ))}
              </div>
            ) : (
              <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                <div className="space-y-1.5">
                  <Label htmlFor="full_name">Full Name</Label>
                  <Input
                    id="full_name"
                    placeholder="Jane Smith"
                    aria-invalid={!!errors.full_name}
                    {...register('full_name')}
                  />
                  {errors.full_name && (
                    <p className="text-xs text-red-500">{errors.full_name.message}</p>
                  )}
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="role">Role</Label>
                  <Controller
                    name="role"
                    control={control}
                    render={({ field }) => (
                      <Select
                        value={field.value || undefined}
                        onValueChange={(v) => field.onChange(v as UserRole | '')}
                      >
                        <SelectTrigger id="role" className="w-full h-9">
                          <SelectValue placeholder="Select a role…" />
                        </SelectTrigger>
                        <SelectContent>
                          {ROLES.map((r) => (
                            <SelectItem key={r.value} value={r.value}>
                              {r.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    )}
                  />
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="years_experience">Years of Experience</Label>
                  <Input
                    id="years_experience"
                    type="number"
                    min={0}
                    max={60}
                    placeholder="5"
                    aria-invalid={!!errors.years_experience}
                    {...register('years_experience')}
                  />
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="location_country">Location (Country)</Label>
                  <Input
                    id="location_country"
                    placeholder="Germany"
                    aria-invalid={!!errors.location_country}
                    {...register('location_country')}
                  />
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="target_countries">Target Countries</Label>
                  <Input
                    id="target_countries"
                    placeholder="Germany, Netherlands, UK"
                    aria-invalid={!!errors.target_countries}
                    {...register('target_countries')}
                  />
                  <p className="text-xs text-muted-foreground">Separate multiple countries with commas</p>
                </div>

                <div className="flex justify-end pt-2">
                  <Button type="submit" disabled={isSubmitting || mutation.isPending}>
                    {isSubmitting || mutation.isPending ? 'Saving…' : 'Save Changes'}
                  </Button>
                </div>
              </form>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
