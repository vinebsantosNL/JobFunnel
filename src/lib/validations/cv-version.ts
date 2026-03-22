import { z } from 'zod'

const TEMPLATE_IDS = ['precision', 'modern_tech', 'compact_eu', 'europass', 'senior_ic'] as const

export const createCVVersionSchema = z.object({
  name: z.string().min(1, 'Name is required').max(100, 'Name must be 100 characters or less'),
  description: z.string().max(1000).optional(),
  tags: z.array(z.string().max(50)).max(20).optional(),
  is_default: z.boolean().optional(),
  template_id: z.enum(TEMPLATE_IDS).optional(),
  target_country: z.string().max(2).optional(),
})

export const updateCVVersionSchema = z.object({
  name: z.string().min(1, 'Name is required').max(100, 'Name must be 100 characters or less').optional(),
  description: z.string().max(1000).optional().nullable(),
  tags: z.array(z.string().max(50)).max(20).optional(),
  is_default: z.boolean().optional(),
  is_archived: z.boolean().optional(),
  template_id: z.enum(TEMPLATE_IDS).optional(),
  target_country: z.string().max(2).optional().nullable(),
  resume_data: z.record(z.string(), z.unknown()).optional(),
})

export type CreateCVVersionInput = z.infer<typeof createCVVersionSchema>
export type UpdateCVVersionInput = z.infer<typeof updateCVVersionSchema>
