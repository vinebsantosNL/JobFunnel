import { z } from 'zod'

export const updateProfileSchema = z.object({
  full_name: z.string().min(1).max(200).optional(),
  role: z.enum(['software_engineer', 'product_manager', 'data_scientist', 'other']).optional(),
  years_experience: z.number().int().min(0).max(60).optional().nullable(),
  location_country: z.string().max(100).optional().nullable(),
  target_countries: z.array(z.string().max(100)).optional(),
  notification_prefs: z
    .object({
      weekly_summary: z.boolean(),
      stale_applications: z.boolean(),
    })
    .optional(),
  target_role: z.string().max(100).optional().nullable(),
  target_date: z.string().optional().nullable(),
  target_salary_min: z.number().int().min(0).optional().nullable(),
  target_salary_max: z.number().int().min(0).optional().nullable(),
  target_salary_currency: z.string().max(10).optional().nullable(),
})

export type UpdateProfileInput = z.infer<typeof updateProfileSchema>
