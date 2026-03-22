---
name: validation-patterns
description: >
  Zod validation patterns for JobFunnel OS — input schemas, DTO type inference, React Hook Form
  integration, and shared client/server validation. Use whenever writing Zod schemas, validating
  API input, or connecting forms to Route Handlers. Trigger on: "zod schema", "validate input",
  "form validation", "dto type", "react hook form", "parse request body", "validation error".
---

# Validation Patterns — Zod in JobFunnel OS

Complete guide to input validation using Zod 3.x. Schemas are defined in `/validations/` and shared between client (React Hook Form) and server (Route Handlers).

---

## Why Zod

- ✅ TypeScript-first — schemas ARE the types (`z.infer<>`)
- ✅ Single schema for both client and server validation
- ✅ First-class React Hook Form integration via `@hookform/resolvers/zod`
- ✅ Composable — extend, merge, pick, omit schemas
- ✅ Excellent error messages out of the box

---

## Schema Location

```
validations/
├── job.schemas.ts           ← Job application CRUD
├── story.schemas.ts         ← Interview stories
├── auth.schemas.ts          ← Login, signup forms
├── profile.schemas.ts       ← User profile settings
└── cvVersion.schemas.ts     ← Phase 2: CV versions
```

Schemas are imported from `@/validations/` in both Route Handlers and client forms.

---

## JobFunnel Core Schemas

### Job Application Schemas

```typescript
// validations/job.schemas.ts
import { z } from 'zod';

export const StageSchema = z.enum([
  'saved', 'applied', 'screening', 'interviewing', 'offer', 'rejected', 'withdrawn'
]);

export const PrioritySchema = z.enum(['low', 'medium', 'high']);

export const CreateJobSchema = z.object({
  company_name: z.string().min(1, 'Company name is required').max(200),
  job_title: z.string().min(1, 'Job title is required').max(200),
  job_url: z.string().url('Must be a valid URL').optional().or(z.literal('')),
  location: z.string().max(200).optional(),
  salary_min: z.number().int().positive().optional(),
  salary_max: z.number().int().positive().optional(),
  salary_currency: z.string().length(3).optional(),  // ISO 4217: EUR, GBP, USD
  stage: StageSchema.default('saved'),
  priority: PrioritySchema.default('medium'),
  notes: z.string().max(5000).optional(),
  applied_at: z.string().datetime().optional(),
  cv_version_id: z.string().uuid().optional(),   // Phase 2
});

export const UpdateJobSchema = CreateJobSchema.partial().omit({ stage: true });

export const StageTransitionSchema = z.object({
  to_stage: StageSchema,
});

// Infer TypeScript types from schemas
export type CreateJobDTO = z.infer<typeof CreateJobSchema>;
export type UpdateJobDTO = z.infer<typeof UpdateJobSchema>;
export type StageTransitionDTO = z.infer<typeof StageTransitionSchema>;
```

### Interview Story Schemas

```typescript
// validations/story.schemas.ts
import { z } from 'zod';

export const CompetencySchema = z.enum([
  // Leadership
  'Team Management', 'Decision Making', 'Mentoring', 'Conflict Resolution',
  // Technical
  'Problem Solving', 'System Design', 'Technical Excellence', 'Innovation',
  // Collaboration
  'Cross-functional Work', 'Stakeholder Management', 'Communication',
  // Execution
  'Project Delivery', 'Prioritization', 'Working Under Pressure', 'Adaptability',
  // Growth
  'Learning Agility', 'Feedback Reception', 'Self-improvement',
]);

export const CreateStorySchema = z.object({
  title: z.string().min(1, 'Title is required').max(200),
  situation: z.string().max(2000).optional(),
  task: z.string().max(2000).optional(),
  action: z.string().max(5000).optional(),
  result: z.string().max(2000).optional(),
  full_content: z.string().max(10000).optional(),
  competencies: z.array(CompetencySchema).max(5, 'Maximum 5 competency tags'),
  is_favorite: z.boolean().default(false),
});

export const UpdateStorySchema = CreateStorySchema.partial();

export type CreateStoryDTO = z.infer<typeof CreateStorySchema>;
export type UpdateStoryDTO = z.infer<typeof UpdateStorySchema>;
```

### CV Version Schemas (Phase 2)

```typescript
// validations/cvVersion.schemas.ts
import { z } from 'zod';

export const CreateCVVersionSchema = z.object({
  name: z.string().min(1).max(100),
  description: z.string().max(500).optional(),
  tags: z.array(z.string().max(50)).max(10).default([]),
  is_default: z.boolean().default(false),
});

export const UpdateCVVersionSchema = CreateCVVersionSchema.partial().extend({
  is_archived: z.boolean().optional(),
});

export type CreateCVVersionDTO = z.infer<typeof CreateCVVersionSchema>;
```

---

## Route Handler Validation

### Pattern: safeParse (Recommended)

```typescript
// app/api/jobs/route.ts
import { CreateJobSchema } from '@/validations/job.schemas';

export async function POST(req: NextRequest) {
  // ... auth check ...

  // ✅ safeParse returns { success, data, error } — never throws
  const parsed = CreateJobSchema.safeParse(await req.json());
  if (!parsed.success) {
    return NextResponse.json(
      { error: { message: 'Validation failed', details: parsed.error.flatten() } },
      { status: 400 }
    );
  }

  // parsed.data is fully typed as CreateJobDTO
  const job = await createJobApplication(supabase, user.id, parsed.data);
  return NextResponse.json({ data: job }, { status: 201 });
}
```

### Flatten Error Format

```typescript
// parsed.error.flatten() produces:
{
  formErrors: [],            // top-level errors
  fieldErrors: {
    company_name: ['Company name is required'],
    salary_min: ['Expected number, received string'],
  }
}
```

### Query Param Validation

```typescript
// ✅ Validate query params for analytics endpoints
const FilterSchema = z.object({
  stage: StageSchema.optional(),
  from: z.string().datetime().optional(),
  to: z.string().datetime().optional(),
  cv_version_id: z.string().uuid().optional(),
});

export async function GET(req: NextRequest) {
  const url = new URL(req.url);
  const parsed = FilterSchema.safeParse(Object.fromEntries(url.searchParams));
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }
  // parsed.data: { stage?: Stage, from?: string, to?: string }
}
```

---

## React Hook Form Integration

### Standard Form Setup

```typescript
// components/features/pipeline/AddJobForm.tsx
'use client';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { CreateJobSchema, type CreateJobDTO } from '@/validations/job.schemas';

export function AddJobForm() {
  const form = useForm<CreateJobDTO>({
    resolver: zodResolver(CreateJobSchema),
    defaultValues: {
      stage: 'saved',
      priority: 'medium',
    },
  });

  const onSubmit = form.handleSubmit(async (data) => {
    // data is fully typed as CreateJobDTO — already validated
    await createJobMutation.mutateAsync(data);
  });

  return (
    <form onSubmit={onSubmit}>
      <FormField
        control={form.control}
        name="company_name"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Company</FormLabel>
            <FormControl>
              <Input {...field} placeholder="e.g. Spotify" />
            </FormControl>
            <FormMessage />   {/* Shows Zod error message */}
          </FormItem>
        )}
      />
      {/* ... more fields */}
    </form>
  );
}
```

### Form + TanStack Query Mutation

```typescript
// Optimistic update pattern with React Hook Form + TanStack Query
const queryClient = useQueryClient();

const createJobMutation = useMutation({
  mutationFn: (data: CreateJobDTO) =>
    fetch('/api/jobs', { method: 'POST', body: JSON.stringify(data) }).then(r => r.json()),
  onMutate: async (newJob) => {
    // Optimistic update
    await queryClient.cancelQueries({ queryKey: ['jobs'] });
    const previous = queryClient.getQueryData<JobApplication[]>(['jobs']);
    queryClient.setQueryData<JobApplication[]>(['jobs'], old => [
      { ...newJob, id: 'temp-' + Date.now(), created_at: new Date().toISOString() } as JobApplication,
      ...(old ?? []),
    ]);
    return { previous };
  },
  onError: (err, newJob, context) => {
    // Rollback on error
    queryClient.setQueryData(['jobs'], context?.previous);
  },
  onSettled: () => queryClient.invalidateQueries({ queryKey: ['jobs'] }),
});
```

---

## DTO Pattern

### Infer Types from Schemas

```typescript
// ✅ Type comes from schema — single source of truth
const CreateJobSchema = z.object({ ... });
export type CreateJobDTO = z.infer<typeof CreateJobSchema>;

// Service function uses the inferred type
export async function createJobApplication(
  supabase: SupabaseClient,
  userId: string,
  data: CreateJobDTO      // Fully typed, no manual interface to maintain
): Promise<JobApplication> {
  const { data: job, error } = await supabase
    .from('job_applications')
    .insert({ ...data, user_id: userId })
    .select()
    .single();
  // ...
}
```

### Input vs Output Types

```typescript
// Input (what the form sends)
const CreateJobSchema = z.object({
  company_name: z.string().min(1),
  // ... other fields
});

// Output (what the API returns — from generated Supabase types)
type JobApplication = Tables<'job_applications'>;
// Includes: id, user_id, created_at, updated_at — not in the input schema
```

---

## Advanced Patterns

### Custom Validation with refine

```typescript
// Salary range validation
const SalarySchema = z.object({
  salary_min: z.number().int().positive().optional(),
  salary_max: z.number().int().positive().optional(),
  salary_currency: z.string().length(3).optional(),
}).refine(
  (data) => {
    if (data.salary_min && data.salary_max) {
      return data.salary_max > data.salary_min;
    }
    return true;
  },
  {
    message: 'Maximum salary must be greater than minimum',
    path: ['salary_max'],
  }
);
```

### Preprocess (Normalize Input)

```typescript
// Trim and lowercase email before validation
const EmailField = z.preprocess(
  (val) => typeof val === 'string' ? val.trim().toLowerCase() : val,
  z.string().email('Invalid email address')
);
```

### Schema Composition for Stages

```typescript
// Reuse base schema, extend per form context
const BaseJobSchema = z.object({
  company_name: z.string().min(1).max(200),
  job_title: z.string().min(1).max(200),
});

// Quick-add form: minimal fields
const QuickAddJobSchema = BaseJobSchema;

// Full form: all fields
const FullJobSchema = BaseJobSchema.extend({
  job_url: z.string().url().optional().or(z.literal('')),
  location: z.string().max(200).optional(),
  salary_min: z.number().int().positive().optional(),
  salary_max: z.number().int().positive().optional(),
  priority: PrioritySchema.default('medium'),
  notes: z.string().max(5000).optional(),
});
```

### Discriminated Union (Stage-dependent fields)

```typescript
// CV version locking: editing only allowed in saved/applied stages
const EditApplicationSchema = z.discriminatedUnion('stage', [
  z.object({
    stage: z.enum(['saved', 'applied']),
    cv_version_id: z.string().uuid().optional(),  // Editable
  }),
  z.object({
    stage: z.enum(['screening', 'interviewing', 'offer', 'rejected', 'withdrawn']),
    // cv_version_id not present — locked at API level
  }),
]);
```

---

## Error Message Standards

Use consistent, user-friendly messages matching JobFunnel's tone:

```typescript
const CreateJobSchema = z.object({
  company_name: z.string()
    .min(1, 'Company name is required')
    .max(200, 'Company name is too long (max 200 characters)'),

  job_title: z.string()
    .min(1, 'Job title is required')
    .max(200, 'Job title is too long (max 200 characters)'),

  job_url: z.string()
    .url('Enter a valid URL (e.g. https://jobs.spotify.com/...)')
    .optional()
    .or(z.literal('')),

  salary_min: z.number()
    .int('Enter a whole number')
    .positive('Salary must be positive')
    .optional(),
});
```

---

## Related Files

- [backend-dev-guidelines.md](backend-dev-guidelines.md) — Where validation fits in the stack
- [routing-and-controllers.md](routing-and-controllers.md) — Using validation in Route Handlers
- [services-and-repositories.md](services-and-repositories.md) — Using DTOs in service functions
- [async-and-errors.md](async-and-errors.md) — Handling validation errors
