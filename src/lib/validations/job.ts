import { z } from 'zod'

export const createJobSchema = z.object({
  company_name: z.string().min(1, 'Company name is required').max(100),
  job_title: z.string().min(1, 'Job title is required').max(100),
  job_url: z.string().url('Invalid URL').optional().or(z.literal('')),
  location: z.string().max(100).optional(),
  salary_min: z.number().int().positive().optional().nullable(),
  salary_max: z.number().int().positive().optional().nullable(),
  salary_currency: z.string().length(3).optional().nullable(),
  stage: z.enum(['saved', 'applied', 'screening', 'interviewing', 'offer', 'hired', 'rejected', 'withdrawn']).default('saved'),
  priority: z.enum(['low', 'medium', 'high']).default('medium'),
  notes: z.string().max(5000).optional(),
  applied_at: z.string().optional().nullable(),
  cv_version_id: z.string().uuid().optional().nullable(),
})

export const updateJobSchema = createJobSchema.partial()

export const updateStageSchema = z.object({
  stage: z.enum(['saved', 'applied', 'screening', 'interviewing', 'offer', 'hired', 'rejected', 'withdrawn']),
})

export type CreateJobInput = z.infer<typeof createJobSchema>
export type UpdateJobInput = z.infer<typeof updateJobSchema>
