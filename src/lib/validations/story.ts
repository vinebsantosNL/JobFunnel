import { z } from 'zod'

export const createStorySchema = z.object({
  title: z.string().min(1, 'Title is required').max(200),
  situation: z.string().max(5000).optional(),
  task: z.string().max(5000).optional(),
  action: z.string().max(5000).optional(),
  result: z.string().max(5000).optional(),
  full_content: z.string().max(10000).optional(),
  competencies: z.array(z.string()).default([]),
  is_favorite: z.boolean().default(false),
})

export const updateStorySchema = createStorySchema.partial()

export type CreateStoryInput = z.infer<typeof createStorySchema>
export type UpdateStoryInput = z.infer<typeof updateStorySchema>
