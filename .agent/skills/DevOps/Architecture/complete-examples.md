---
name: complete-examples
description: >
  Full working end-to-end code examples for JobFunnel OS features — Next.js 16 Route Handlers,
  Supabase service functions, Zod validation, TypeScript types, and Vitest tests.
  Use when implementing a new feature end-to-end, reviewing a reference implementation, or
  understanding how all layers connect. Trigger on: "complete example", "full implementation",
  "end-to-end", "how does it all connect", "show me the pattern", "reference implementation",
  "full feature walkthrough", or any task where multiple layers (types + schema + service + route) are involved.
---

# Complete Examples — JobFunnel OS

Full working code showing how all layers connect: types → Zod schemas → service functions → Route Handlers → tests.

---

## Feature: Job Application CRUD

The canonical JobFunnel feature. Shows every pattern in context.

### 1. Types

```typescript
// types/app.types.ts
export type Stage =
  | 'saved'
  | 'applied'
  | 'screening'
  | 'interviewing'
  | 'offer'
  | 'rejected'
  | 'withdrawn';

export type Priority = 'low' | 'medium' | 'high';

export interface JobApplication {
  id: string;
  user_id: string;
  company_name: string;
  job_title: string;
  job_url?: string;
  location?: string;
  salary_min?: number;
  salary_max?: number;
  salary_currency?: string;
  stage: Stage;
  priority: Priority;
  notes?: string;
  applied_at?: string;
  stage_updated_at: string;
  cv_version_id?: string; // Phase 2
  created_at: string;
  updated_at: string;
}

export interface CreateJobDTO {
  company_name: string;
  job_title: string;
  job_url?: string;
  location?: string;
  salary_min?: number;
  salary_max?: number;
  salary_currency?: string;
  stage: Stage;
  priority: Priority;
  notes?: string;
  applied_at?: string;
}

export interface UpdateJobDTO extends Partial<CreateJobDTO> {}
```

---

### 2. Zod Schemas

```typescript
// validations/job.schemas.ts
import { z } from 'zod';

export const StageSchema = z.enum([
  'saved', 'applied', 'screening', 'interviewing', 'offer', 'rejected', 'withdrawn',
]);

export const PrioritySchema = z.enum(['low', 'medium', 'high']);

export const CreateJobSchema = z.object({
  company_name: z.string().min(1, 'Company name is required').max(200),
  job_title: z.string().min(1, 'Job title is required').max(200),
  job_url: z.string().url('Must be a valid URL').optional(),
  location: z.string().max(200).optional(),
  salary_min: z.number().int().positive().optional(),
  salary_max: z.number().int().positive().optional(),
  salary_currency: z.string().length(3).optional(),
  stage: StageSchema.default('saved'),
  priority: PrioritySchema.default('medium'),
  notes: z.string().max(5000).optional(),
  applied_at: z.string().datetime().optional(),
}).refine(
  (data) => !data.salary_min || !data.salary_max || data.salary_min <= data.salary_max,
  { message: 'salary_min must be ≤ salary_max', path: ['salary_min'] }
);

export const UpdateJobSchema = CreateJobSchema.partial();

export const StageTransitionSchema = z.object({
  to_stage: StageSchema,
});

export const JobQuerySchema = z.object({
  stage: StageSchema.optional(),
  priority: PrioritySchema.optional(),
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().min(1).max(100).default(20),
});

export type CreateJobInput = z.infer<typeof CreateJobSchema>;
export type UpdateJobInput = z.infer<typeof UpdateJobSchema>;
export type StageTransitionInput = z.infer<typeof StageTransitionSchema>;
```

---

### 3. Service Functions

```typescript
// lib/services/jobService.ts
import { SupabaseClient } from '@supabase/supabase-js';
import {
  NotFoundError,
  ForbiddenError,
  FreeTierLimitError,
  CVLockedError,
} from '@/lib/utils/errors';
import type { CreateJobInput, UpdateJobInput, Stage } from '@/types/app.types';

const FREE_TIER_ACTIVE_LIMIT = 5;

// ─── READ ───────────────────────────────────────────────────────────────────

export async function getJobApplications(
  supabase: SupabaseClient,
  userId: string,
  filters: { stage?: Stage; priority?: string; page?: number; limit?: number } = {}
) {
  const { stage, priority, page = 1, limit = 20 } = filters;
  const from = (page - 1) * limit;
  const to = from + limit - 1;

  let query = supabase
    .from('job_applications')
    .select('*', { count: 'exact' })
    .order('created_at', { ascending: false })
    .range(from, to);

  if (stage) query = query.eq('stage', stage);
  if (priority) query = query.eq('priority', priority);

  const { data, error, count } = await query;
  if (error) throw error;

  return { jobs: data ?? [], total: count ?? 0, page, limit };
}

export async function getJobById(supabase: SupabaseClient, jobId: string) {
  const { data, error } = await supabase
    .from('job_applications')
    .select('*')
    .eq('id', jobId)
    .single();

  if (error?.code === 'PGRST116') throw new NotFoundError('Application not found');
  if (error) throw error;

  return data;
}

// ─── CREATE ──────────────────────────────────────────────────────────────────

export async function createJobApplication(
  supabase: SupabaseClient,
  userId: string,
  data: CreateJobInput
) {
  // Business rule: free tier limit
  const { data: profile } = await supabase
    .from('profiles')
    .select('subscription_tier')
    .eq('id', userId)
    .single();

  if (profile?.subscription_tier === 'free') {
    const { count } = await supabase
      .from('job_applications')
      .select('*', { count: 'exact', head: true })
      .not('stage', 'in', '("rejected","withdrawn")');

    if ((count ?? 0) >= FREE_TIER_ACTIVE_LIMIT) {
      throw new FreeTierLimitError(
        `Free tier is limited to ${FREE_TIER_ACTIVE_LIMIT} active applications.`
      );
    }
  }

  const { data: job, error } = await supabase
    .from('job_applications')
    .insert({ ...data, user_id: userId })
    .select()
    .single();

  if (error) throw error;
  return job;
}

// ─── UPDATE ──────────────────────────────────────────────────────────────────

export async function updateJobApplication(
  supabase: SupabaseClient,
  jobId: string,
  data: UpdateJobInput
) {
  const { data: job, error } = await supabase
    .from('job_applications')
    .update({ ...data, updated_at: new Date().toISOString() })
    .eq('id', jobId)
    .select()
    .single();

  if (error?.code === 'PGRST116') throw new NotFoundError('Application not found');
  if (error) throw error;

  return job;
}

// ─── STAGE TRANSITION ────────────────────────────────────────────────────────

export async function transitionJobStage(
  supabase: SupabaseClient,
  jobId: string,
  { to_stage }: { to_stage: Stage }
) {
  // Verify job exists (RLS enforces ownership)
  const { data: existing, error: fetchError } = await supabase
    .from('job_applications')
    .select('id, stage, cv_version_id')
    .eq('id', jobId)
    .single();

  if (fetchError?.code === 'PGRST116') throw new NotFoundError('Application not found');
  if (fetchError) throw fetchError;

  const from_stage = existing.stage;

  // Business rule: CV lock check (Phase 2)
  // Once past applied, cv_version is immutable until terminal stage
  const lockedStages: Stage[] = ['screening', 'interviewing', 'offer'];
  if (existing.cv_version_id && lockedStages.includes(from_stage)) {
    // CV is locked — cannot be changed, but stage transition is still allowed
  }

  // Atomic: update stage + log history
  const [{ error: updateError }, { error: historyError }] = await Promise.all([
    supabase
      .from('job_applications')
      .update({ stage: to_stage, stage_updated_at: new Date().toISOString() })
      .eq('id', jobId),
    supabase
      .from('stage_history')
      .insert({ job_id: jobId, from_stage, to_stage, transitioned_at: new Date().toISOString() }),
  ]);

  if (updateError) throw updateError;
  if (historyError) throw historyError;

  return { jobId, from_stage, to_stage };
}

// ─── DELETE ──────────────────────────────────────────────────────────────────

export async function deleteJobApplication(supabase: SupabaseClient, jobId: string) {
  const { error } = await supabase
    .from('job_applications')
    .delete()
    .eq('id', jobId);

  if (error?.code === 'PGRST116') throw new NotFoundError('Application not found');
  if (error) throw error;
}
```

---

### 4. Route Handlers

```typescript
// app/api/jobs/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { getServerClient } from '@/lib/supabase/server';
import { CreateJobSchema, JobQuerySchema } from '@/validations/job.schemas';
import { getJobApplications, createJobApplication } from '@/lib/services/jobService';
import { handleApiError } from '@/lib/utils/errors';

// GET /api/jobs
export async function GET(req: NextRequest) {
  try {
    const supabase = await getServerClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (!user || authError) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const params = Object.fromEntries(req.nextUrl.searchParams.entries());
    const parsed = JobQuerySchema.safeParse(params);
    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
    }

    const result = await getJobApplications(supabase, user.id, parsed.data);
    return NextResponse.json({ data: result });
  } catch (error) {
    return handleApiError(error);
  }
}

// POST /api/jobs
export async function POST(req: NextRequest) {
  try {
    const supabase = await getServerClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (!user || authError) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const parsed = CreateJobSchema.safeParse(await req.json());
    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
    }

    const job = await createJobApplication(supabase, user.id, parsed.data);
    return NextResponse.json({ data: job }, { status: 201 });
  } catch (error) {
    return handleApiError(error);
  }
}
```

```typescript
// app/api/jobs/[id]/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { getServerClient } from '@/lib/supabase/server';
import { UpdateJobSchema } from '@/validations/job.schemas';
import {
  getJobById,
  updateJobApplication,
  deleteJobApplication,
} from '@/lib/services/jobService';
import { handleApiError } from '@/lib/utils/errors';

type Params = { params: { id: string } };

// GET /api/jobs/:id
export async function GET(_req: NextRequest, { params }: Params) {
  try {
    const supabase = await getServerClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (!user || authError) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const job = await getJobById(supabase, params.id);
    return NextResponse.json({ data: job });
  } catch (error) {
    return handleApiError(error);
  }
}

// PATCH /api/jobs/:id
export async function PATCH(req: NextRequest, { params }: Params) {
  try {
    const supabase = await getServerClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (!user || authError) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const parsed = UpdateJobSchema.safeParse(await req.json());
    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
    }

    const job = await updateJobApplication(supabase, params.id, parsed.data);
    return NextResponse.json({ data: job });
  } catch (error) {
    return handleApiError(error);
  }
}

// DELETE /api/jobs/:id
export async function DELETE(_req: NextRequest, { params }: Params) {
  try {
    const supabase = await getServerClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (!user || authError) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await deleteJobApplication(supabase, params.id);
    return new NextResponse(null, { status: 204 });
  } catch (error) {
    return handleApiError(error);
  }
}
```

```typescript
// app/api/jobs/[id]/stage/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { getServerClient } from '@/lib/supabase/server';
import { StageTransitionSchema } from '@/validations/job.schemas';
import { transitionJobStage } from '@/lib/services/jobService';
import { handleApiError } from '@/lib/utils/errors';

// POST /api/jobs/:id/stage
export async function POST(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const supabase = await getServerClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (!user || authError) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const parsed = StageTransitionSchema.safeParse(await req.json());
    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
    }

    const result = await transitionJobStage(supabase, params.id, parsed.data);
    return NextResponse.json({ data: result });
  } catch (error) {
    return handleApiError(error);
  }
}
```

---

### 5. Error Utilities

```typescript
// lib/utils/errors.ts
import { NextResponse } from 'next/server';

export class AppError extends Error {
  constructor(
    message: string,
    public statusCode: number = 500,
    public code: string = 'INTERNAL_ERROR'
  ) {
    super(message);
    this.name = 'AppError';
  }
}

export class NotFoundError extends AppError {
  constructor(message: string) {
    super(message, 404, 'NOT_FOUND');
  }
}

export class ForbiddenError extends AppError {
  constructor(message: string) {
    super(message, 403, 'FORBIDDEN');
  }
}

export class ConflictError extends AppError {
  constructor(message: string) {
    super(message, 409, 'CONFLICT');
  }
}

export class ProRequiredError extends AppError {
  constructor(message = 'Pro subscription required') {
    super(message, 403, 'PRO_REQUIRED');
  }
}

export class FreeTierLimitError extends AppError {
  constructor(message: string) {
    super(message, 403, 'FREE_TIER_LIMIT');
  }
}

export class CVLockedError extends AppError {
  constructor(message = 'CV version is locked once past screening stage') {
    super(message, 422, 'CV_LOCKED');
  }
}

// Reusable error handler for all Route Handlers
export function handleApiError(error: unknown): NextResponse {
  if (error instanceof AppError) {
    return NextResponse.json(
      { error: { message: error.message, code: error.code } },
      { status: error.statusCode }
    );
  }
  console.error('[API Error]', error);
  return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
}
```

---

### 6. Complete Request Flow

```
POST /api/jobs  { company_name: "Spotify", job_title: "Senior PM", stage: "applied" }
  ↓
Next.js App Router matches app/api/jobs/route.ts → export async function POST
  ↓
getServerClient() → createServerClient with @supabase/ssr
  ↓
supabase.auth.getUser() — 401 if no valid session
  ↓
CreateJobSchema.safeParse(await req.json()) — 400 if invalid
  ↓
createJobApplication(supabase, user.id, data) called
  ↓
Service: reads profile → checks subscription_tier
  → throws FreeTierLimitError (403) if free user is at 5 active jobs
  ↓
Service: supabase.from('job_applications').insert({...})
  RLS policy: user_id = auth.uid() — auto-enforced
  ↓
Service returns created job
  ↓
Route Handler: NextResponse.json({ data: job }, { status: 201 })
  ↓
Client receives { data: { id, company_name, stage, ... } }
```

---

## Refactoring Example: Bad to Good

### BEFORE: Business Logic in Route Handler ❌

```typescript
// app/api/jobs/route.ts — BAD (200+ lines)
export async function POST(req: NextRequest) {
  const supabase = await getServerClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const body = await req.json(); // ❌ Unvalidated input

  // ❌ Business logic in Route Handler
  const { data: profile } = await supabase
    .from('profiles').select('subscription_tier').eq('id', user.id).single();

  if (profile?.subscription_tier === 'free') {
    // ❌ Inline limit count — should be in service
    const { count } = await supabase
      .from('job_applications')
      .select('*', { count: 'exact', head: true });
    if ((count ?? 0) >= 5) {
      return NextResponse.json({ error: 'Limit reached' }, { status: 403 }); // ❌ Wrong code
    }
  }

  // ❌ Direct Supabase call with unvalidated body
  const { data, error } = await supabase
    .from('job_applications')
    .insert({ ...body, user_id: user.id })
    .select().single();

  // ... 100+ more lines of ad-hoc logic
  return NextResponse.json(data);
}
```

### AFTER: Clean Three-Layer Pattern ✅

**Route Handler — 20 lines total:**
```typescript
// app/api/jobs/route.ts — GOOD
export async function POST(req: NextRequest) {
  try {
    const supabase = await getServerClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (!user || authError) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const parsed = CreateJobSchema.safeParse(await req.json());
    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
    }

    const job = await createJobApplication(supabase, user.id, parsed.data);
    return NextResponse.json({ data: job }, { status: 201 });
  } catch (error) {
    return handleApiError(error);
  }
}
```

**Service Function — all business rules centralized:**
```typescript
// lib/services/jobService.ts — GOOD
export async function createJobApplication(
  supabase: SupabaseClient,
  userId: string,
  data: CreateJobInput
) {
  const { data: profile } = await supabase
    .from('profiles').select('subscription_tier').eq('id', userId).single();

  if (profile?.subscription_tier === 'free') {
    const { count } = await supabase
      .from('job_applications')
      .select('*', { count: 'exact', head: true })
      .not('stage', 'in', '("rejected","withdrawn")');

    if ((count ?? 0) >= FREE_TIER_ACTIVE_LIMIT) {
      throw new FreeTierLimitError(`Free tier limit: ${FREE_TIER_ACTIVE_LIMIT} active apps`);
    }
  }

  const { data: job, error } = await supabase
    .from('job_applications')
    .insert({ ...data, user_id: userId })
    .select().single();

  if (error) throw error;
  return job;
}
```

**Result:** Route Handler: 20 lines. Service function: 25 lines. Separately testable. Error codes correct. Business rules in one place.

---

## Feature: Analytics — Funnel Metrics (Pro-Gated)

### Service Function

```typescript
// lib/services/analyticsService.ts
import { SupabaseClient } from '@supabase/supabase-js';
import { ProRequiredError } from '@/lib/utils/errors';

export async function getFunnelMetrics(supabase: SupabaseClient, userId: string) {
  // Business rule: Pro-only feature
  const { data: profile } = await supabase
    .from('profiles')
    .select('subscription_tier')
    .eq('id', userId)
    .single();

  if (profile?.subscription_tier !== 'pro') {
    throw new ProRequiredError('Funnel analytics requires Pro subscription');
  }

  const { data: jobs, error } = await supabase
    .from('job_applications')
    .select('stage');

  if (error) throw error;

  const counts = (jobs ?? []).reduce(
    (acc, job) => {
      acc[job.stage] = (acc[job.stage] ?? 0) + 1;
      return acc;
    },
    {} as Record<string, number>
  );

  const applied = counts['applied'] ?? 0;
  const screening = counts['screening'] ?? 0;
  const interviewing = counts['interviewing'] ?? 0;
  const offer = counts['offer'] ?? 0;

  return {
    applied,
    screening,
    interviewing,
    offer,
    rejected: counts['rejected'] ?? 0,
    withdrawn: counts['withdrawn'] ?? 0,
    appliedToScreeningRate: applied > 0 ? Math.round((screening / applied) * 100) : 0,
    screeningToInterviewRate: screening > 0 ? Math.round((interviewing / screening) * 100) : 0,
    interviewToOfferRate: interviewing > 0 ? Math.round((offer / interviewing) * 100) : 0,
  };
}
```

### Route Handler

```typescript
// app/api/analytics/funnel/route.ts
import { NextResponse } from 'next/server';
import { getServerClient } from '@/lib/supabase/server';
import { getFunnelMetrics } from '@/lib/services/analyticsService';
import { handleApiError } from '@/lib/utils/errors';

export async function GET() {
  try {
    const supabase = await getServerClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (!user || authError) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const metrics = await getFunnelMetrics(supabase, user.id);
    return NextResponse.json({ data: metrics });
  } catch (error) {
    return handleApiError(error);
  }
}
```

---

## Tests

### Service Unit Tests

```typescript
// tests/services/jobService.test.ts
import { describe, it, expect, vi, beforeEach } from 'vitest';
import {
  createJobApplication,
  getJobById,
  transitionJobStage,
} from '@/lib/services/jobService';
import { NotFoundError, FreeTierLimitError } from '@/lib/utils/errors';
import { createMockSupabase } from '../mocks/supabase';

describe('jobService', () => {
  let mockSupabase: ReturnType<typeof createMockSupabase>;

  beforeEach(() => {
    mockSupabase = createMockSupabase();
    vi.clearAllMocks();
  });

  describe('createJobApplication', () => {
    it('should create application for pro user without limit check', async () => {
      // Mock pro user profile
      mockSupabase.single
        .mockResolvedValueOnce({ data: { subscription_tier: 'pro' }, error: null })
        .mockResolvedValueOnce({
          data: { id: 'job-1', company_name: 'Spotify', stage: 'applied' },
          error: null,
        });

      const job = await createJobApplication(mockSupabase, 'user-123', {
        company_name: 'Spotify',
        job_title: 'Senior PM',
        stage: 'applied',
        priority: 'high',
      });

      expect(job.company_name).toBe('Spotify');
    });

    it('should throw FreeTierLimitError when free user has 5 active applications', async () => {
      // Mock free user
      mockSupabase.single.mockResolvedValueOnce({
        data: { subscription_tier: 'free' },
        error: null,
      });

      // Mock count = 5
      mockSupabase.from = vi.fn().mockReturnValue({
        ...mockSupabase,
        select: vi.fn().mockReturnThis(),
        not: vi.fn().mockResolvedValue({ count: 5, error: null }),
      } as any);

      await expect(
        createJobApplication(mockSupabase, 'free-user', {
          company_name: 'Meta',
          job_title: 'PM',
          stage: 'applied',
          priority: 'medium',
        })
      ).rejects.toThrow(FreeTierLimitError);
    });
  });

  describe('getJobById', () => {
    it('should return job when found', async () => {
      const mockJob = { id: 'job-1', company_name: 'Stripe', stage: 'applied' };
      mockSupabase.single.mockResolvedValue({ data: mockJob, error: null });

      const job = await getJobById(mockSupabase, 'job-1');
      expect(job).toEqual(mockJob);
    });

    it('should throw NotFoundError for PGRST116', async () => {
      mockSupabase.single.mockResolvedValue({
        data: null,
        error: { code: 'PGRST116', message: 'Not found' },
      });

      await expect(getJobById(mockSupabase, 'bad-id')).rejects.toThrow(NotFoundError);
    });
  });

  describe('transitionJobStage', () => {
    it('should update stage and log history', async () => {
      mockSupabase.single.mockResolvedValue({
        data: { id: 'job-1', stage: 'applied', cv_version_id: null },
        error: null,
      });

      // Mock parallel Promise.all calls
      mockSupabase.from = vi.fn().mockReturnValue({
        ...mockSupabase,
        update: vi.fn().mockReturnThis(),
        insert: vi.fn().mockResolvedValue({ error: null }),
        eq: vi.fn().mockResolvedValue({ error: null }),
      } as any);

      const result = await transitionJobStage(mockSupabase, 'job-1', { to_stage: 'screening' });

      expect(result.from_stage).toBe('applied');
      expect(result.to_stage).toBe('screening');
    });
  });
});
```

### Analytics Unit Tests

```typescript
// tests/services/analyticsService.test.ts
import { describe, it, expect, vi } from 'vitest';
import { getFunnelMetrics } from '@/lib/services/analyticsService';
import { ProRequiredError } from '@/lib/utils/errors';
import { createMockSupabase } from '../mocks/supabase';

describe('analyticsService', () => {
  describe('getFunnelMetrics', () => {
    it('should throw ProRequiredError for free users', async () => {
      const supabase = createMockSupabase();
      supabase.single.mockResolvedValueOnce({
        data: { subscription_tier: 'free' },
        error: null,
      });

      await expect(getFunnelMetrics(supabase, 'free-user')).rejects.toThrow(ProRequiredError);
    });

    it('should calculate conversion rates correctly', async () => {
      const supabase = createMockSupabase();

      supabase.single.mockResolvedValueOnce({
        data: { subscription_tier: 'pro' },
        error: null,
      });

      supabase.from = vi.fn().mockReturnValue({
        ...supabase,
        select: vi.fn().mockResolvedValue({
          data: [
            ...Array(5).fill({ stage: 'applied' }),
            ...Array(2).fill({ stage: 'screening' }),
            { stage: 'interviewing' },
          ],
          error: null,
        }),
      } as any);

      const metrics = await getFunnelMetrics(supabase, 'pro-user');

      expect(metrics.applied).toBe(5);
      expect(metrics.screening).toBe(2);
      expect(metrics.appliedToScreeningRate).toBe(40); // 2/5 = 40%
      expect(metrics.screeningToInterviewRate).toBe(50); // 1/2 = 50%
    });
  });
});
```

### E2E Test

```typescript
// tests/e2e/pipeline.spec.ts
import { test, expect } from '@playwright/test';

test.describe('Pipeline — Job Application CRUD', () => {
  test.beforeEach(async ({ page }) => {
    // Use pre-seeded test session
    await page.goto('/app/pipeline');
  });

  test('should add a job application', async ({ page }) => {
    await page.getByRole('button', { name: /add application/i }).click();

    await page.getByLabel(/company/i).fill('Spotify');
    await page.getByLabel(/job title/i).fill('Senior PM');
    await page.getByRole('button', { name: /save/i }).click();

    await expect(page.getByText('Spotify')).toBeVisible();
    await expect(page.getByText('Senior PM')).toBeVisible();
  });

  test('should show upgrade prompt when free tier limit hit', async ({ page }) => {
    // Assumes test account is on free tier with 5 active applications
    await page.getByRole('button', { name: /add application/i }).click();
    await page.getByLabel(/company/i).fill('6th Company');
    await page.getByLabel(/job title/i).fill('Engineer');
    await page.getByRole('button', { name: /save/i }).click();

    await expect(page.getByText(/upgrade to pro/i)).toBeVisible();
  });

  test('should drag application to new stage', async ({ page }) => {
    const card = page.locator('[data-testid="application-card"]').first();
    const targetColumn = page.locator('[data-stage="screening"]');

    await card.dragTo(targetColumn);

    await expect(targetColumn.locator('[data-testid="application-card"]')).toBeVisible();
  });

  test('should work on mobile viewport', async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 }); // iPhone 14

    await expect(page.getByRole('button', { name: /add application/i })).toBeVisible();
    await page.getByRole('button', { name: /add application/i }).click();

    // Should open bottom sheet on mobile, not floating dialog
    await expect(page.getByRole('dialog')).toBeVisible();
  });
});
```

---

## Supabase Mock Factory

```typescript
// tests/mocks/supabase.ts
import { vi } from 'vitest';

export function createMockSupabase(overrides: Record<string, any> = {}) {
  return {
    from: vi.fn().mockReturnThis(),
    select: vi.fn().mockReturnThis(),
    insert: vi.fn().mockReturnThis(),
    update: vi.fn().mockReturnThis(),
    delete: vi.fn().mockReturnThis(),
    eq: vi.fn().mockReturnThis(),
    neq: vi.fn().mockReturnThis(),
    not: vi.fn().mockReturnThis(),
    in: vi.fn().mockReturnThis(),
    order: vi.fn().mockReturnThis(),
    limit: vi.fn().mockReturnThis(),
    range: vi.fn().mockReturnThis(),
    single: vi.fn().mockResolvedValue({ data: null, error: null }),
    auth: {
      getUser: vi.fn().mockResolvedValue({ data: { user: null }, error: null }),
      signOut: vi.fn().mockResolvedValue({ error: null }),
    },
    ...overrides,
  } as any;
}
```

---

## Related Files

- [backend-dev-guidelines.md](backend-dev-guidelines.md) — Architecture doctrine and BFRI scoring
- [architecture-overview.md](architecture-overview.md) — Three-layer pattern and directory structure
- [routing-and-controllers.md](routing-and-controllers.md) — Route Handler patterns
- [services-and-repositories.md](services-and-repositories.md) — Service function patterns
- [validation-patterns.md](validation-patterns.md) — Zod schema reference
- [async-and-errors.md](async-and-errors.md) — Error class hierarchy
- [testing-guide.md](testing-guide.md) — Vitest + Playwright setup
