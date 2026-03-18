import { z } from 'zod'

export const createCVVersionSchema = z.object({
  name: z.string().min(1, 'Name is required').max(100, 'Name must be 100 characters or less'),
  description: z.string().max(1000).optional(),
  tags: z.array(z.string().max(50)).max(20).optional(),
  is_default: z.boolean().optional(),
})

export const updateCVVersionSchema = z.object({
  name: z.string().min(1, 'Name is required').max(100, 'Name must be 100 characters or less').optional(),
  description: z.string().max(1000).optional().nullable(),
  tags: z.array(z.string().max(50)).max(20).optional(),
  is_default: z.boolean().optional(),
  is_archived: z.boolean().optional(),
})

export type CreateCVVersionInput = z.infer<typeof createCVVersionSchema>
export type UpdateCVVersionInput = z.infer<typeof updateCVVersionSchema>
