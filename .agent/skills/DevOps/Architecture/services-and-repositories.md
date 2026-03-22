---
name: services-and-repositories
description: >
  Service function patterns for JobFunnel OS — business logic, subscription tier enforcement, Supabase
  query orchestration, and caching strategies. Use when writing service-layer code, orchestrating
  multi-step operations, or enforcing business rules. Trigger on: "service function", "business logic",
  "tier check", "free tier limit", "orchestrate queries", "dependency injection", "pro gate service".
---

# Services and Repositories — Business Logic Layer

Complete guide to service functions in JobFunnel OS. The service layer lives in `lib/services/` and contains all business logic — separate from Route Handlers and separate from raw Supabase calls.

---

## Service Layer Overview

### Purpose

```
Route Handler asks: "Should I do this?"
Service answers:    "Yes/No — here are the business rules — here's the result"
Supabase executes:  "Here's the data from the database"
```

**Service functions are responsible for:**
- ✅ Business rules (free tier limits, ownership checks)
- ✅ Subscription tier enforcement (`subscription_tier === 'pro'`)
- ✅ Orchestrating multiple Supabase queries
- ✅ Complex calculations (funnel rates, time-in-stage)
- ✅ Throwing typed `AppError` on failures

**Service functions should NOT:**
- ❌ Import `NextRequest`, `NextResponse`, or `cookies()`
- ❌ Run Zod validation (Route Handler's job)
- ❌ Format HTTP responses
- ❌ Know about HTTP status codes

---

## Service File Organization

```
lib/services/
├── jobService.ts          ← Job CRUD, stage transitions, free tier limits
├── analyticsService.ts    ← Funnel rates, time-in-stage, CV comparison
├── storyService.ts        ← Interview story CRUD
├── profileService.ts      ← Profile reads, subscription tier checks
├── dashboardService.ts    ← Stats aggregation for dashboard
└── cvVersionService.ts    ← Phase 2: CV management, locking
```

---

## Service Function Patterns

### Basic CRUD Service Functions

```typescript
// lib/services/jobService.ts
import type { SupabaseClient } from '@supabase/supabase-js';
import type { Database } from '@/types/database.types';
import type { CreateJobDTO, UpdateJobDTO, StageTransitionDTO } from '@/validations/job.schemas';
import {
  AppError, NotFoundError, ForbiddenError, ConflictError,
  FreeTierLimitError, ProRequiredError, CVLockedError
} from '@/lib/utils/errors';

type Supabase = SupabaseClient<Database>;
type JobApplication = Database['public']['Tables']['job_applications']['Row'];

export async function getJobApplications(supabase: Supabase, userId: string): Promise<JobApplication[]> {
  const { data, error } = await supabase
    .from('job_applications')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) throw new AppError(error.message, 500);
  return data ?? [];
}

export async function getJobById(supabase: Supabase, jobId: string): Promise<JobApplication> {
  const { data, error } = await supabase
    .from('job_applications')
    .select('*')
    .eq('id', jobId)
    .single();

  if (error?.code === 'PGRST116' || !data) throw new NotFoundError('Job application not found');
  if (error) throw new AppError(error.message, 500);
  return data;
}
```

### Create with Business Rules

```typescript
export async function createJobApplication(
  supabase: Supabase,
  userId: string,
  data: CreateJobDTO
): Promise<JobApplication> {
  // Business rule: enforce free tier application limit
  const profile = await getProfileTier(supabase, userId);
  if (profile.subscription_tier === 'free') {
    await enforceFreeApplicationLimit(supabase, userId);
  }

  const { data: job, error } = await supabase
    .from('job_applications')
    .insert({
      ...data,
      user_id: userId,
      applied_at: data.stage === 'applied' ? new Date().toISOString() : null,
    })
    .select()
    .single();

  if (error) throw new AppError(error.message, 500);
  return job;
}

async function enforceFreeApplicationLimit(supabase: Supabase, userId: string) {
  const { count, error } = await supabase
    .from('job_applications')
    .select('id', { count: 'exact', head: true })
    .eq('user_id', userId)
    .not('stage', 'in', '("rejected","withdrawn")');

  if (error) throw new AppError(error.message, 500);
  if ((count ?? 0) >= 5) {
    throw new FreeTierLimitError('active applications');
  }
}
```

### Stage Transition with History

```typescript
export async function transitionJobStage(
  supabase: Supabase,
  jobId: string,
  userId: string,
  { to_stage }: StageTransitionDTO
): Promise<JobApplication> {
  // Verify the application exists and belongs to this user (belt + suspenders — RLS is primary)
  const existing = await getJobById(supabase, jobId);

  // Business rule: Phase 2 — CV version locked at screening+
  if (
    existing.cv_version_id &&
    ['screening', 'interviewing', 'offer'].includes(to_stage) &&
    ['saved', 'applied'].includes(existing.stage)
  ) {
    // Lock is already applied; just a note — service won't reject the transition itself
  }

  // Execute stage update + history insert in parallel
  const [updateResult, historyResult] = await Promise.all([
    supabase
      .from('job_applications')
      .update({
        stage: to_stage,
        stage_updated_at: new Date().toISOString(),
        applied_at: to_stage === 'applied' && !existing.applied_at
          ? new Date().toISOString()
          : existing.applied_at,
      })
      .eq('id', jobId)
      .select()
      .single(),
    supabase
      .from('stage_history')
      .insert({
        job_id: jobId,
        from_stage: existing.stage,
        to_stage,
        transitioned_at: new Date().toISOString(),
      }),
  ]);

  if (updateResult.error) throw new AppError(updateResult.error.message, 500);
  if (historyResult.error) throw new AppError(historyResult.error.message, 500);
  return updateResult.data!;
}
```

---

## Subscription Tier Enforcement

### Always Check at Service Layer

```typescript
// lib/services/profileService.ts
export async function getProfileTier(supabase: Supabase, userId: string) {
  const { data, error } = await supabase
    .from('profiles')
    .select('subscription_tier')
    .eq('id', userId)
    .single();

  if (error || !data) throw new AppError('Profile not found', 404);
  return data;
}

// Pattern: require pro at the start of any Pro-gated service function
export async function getAnalyticsFunnel(supabase: Supabase, userId: string) {
  const profile = await getProfileTier(supabase, userId);
  if (profile.subscription_tier !== 'pro') {
    throw new ProRequiredError('funnel analytics');
  }
  // ... rest of function
}
```

### Free Tier Limits Reference

| Feature | Free tier limit | Service function guard |
|---|---|---|
| Active applications | 5 max | `enforceFreeApplicationLimit()` |
| CV versions (Phase 2) | 2 max | `enforceCVVersionLimit()` |
| Analytics | No access | `requirePro()` at service start |
| Interview vault (full) | No access | `requirePro()` at service start |
| A/B testing (Phase 2) | No access | `requirePro()` at service start |

---

## Analytics Service

### Funnel Rates

```typescript
// lib/services/analyticsService.ts
export interface FunnelMetrics {
  applied: number;
  screening: number;
  interviewing: number;
  offer: number;
  rejected: number;
  appliedToScreeningRate: number;
  screeningToInterviewRate: number;
  interviewToOfferRate: number;
}

export async function getFunnelMetrics(supabase: Supabase, userId: string): Promise<FunnelMetrics> {
  const profile = await getProfileTier(supabase, userId);
  if (profile.subscription_tier !== 'pro') throw new ProRequiredError('funnel analytics');

  const { data, error } = await supabase
    .from('job_applications')
    .select('stage')
    .not('stage', 'in', '("withdrawn")');

  if (error) throw new AppError(error.message, 500);

  const counts = (data ?? []).reduce((acc, { stage }) => {
    acc[stage] = (acc[stage] ?? 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const applied = counts.applied ?? 0;
  const screening = counts.screening ?? 0;
  const interviewing = counts.interviewing ?? 0;
  const offer = counts.offer ?? 0;

  return {
    applied,
    screening,
    interviewing,
    offer,
    rejected: counts.rejected ?? 0,
    appliedToScreeningRate: applied > 0 ? Math.round((screening / applied) * 100) : 0,
    screeningToInterviewRate: screening > 0 ? Math.round((interviewing / screening) * 100) : 0,
    interviewToOfferRate: interviewing > 0 ? Math.round((offer / interviewing) * 100) : 0,
  };
}
```

---

## Caching Strategies

### In-Memory Cache (For Expensive Queries)

```typescript
// In-memory cache is useful for permission checks or profile lookups
// that happen on every request. Reset on mutation.

// lib/services/profileService.ts
const profileCache = new Map<string, { data: any; ts: number }>();
const CACHE_TTL = 5 * 60 * 1000; // 5 minutes

export async function getCachedProfile(supabase: Supabase, userId: string) {
  const cached = profileCache.get(userId);
  if (cached && Date.now() - cached.ts < CACHE_TTL) {
    return cached.data;
  }

  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', userId)
    .single();

  if (error || !data) throw new NotFoundError('Profile not found');

  profileCache.set(userId, { data, ts: Date.now() });
  return data;
}

export function invalidateProfileCache(userId: string) {
  profileCache.delete(userId);
}
```

### TanStack Query (Client-Side Cache)

```typescript
// Client-side: TanStack Query handles caching automatically
// All mutations should call queryClient.invalidateQueries after success

const queryClient = useQueryClient();

const updateJob = useMutation({
  mutationFn: (data: UpdateJobDTO) => patchJob(jobId, data),
  onSuccess: () => {
    // Invalidate the job list and the specific job
    queryClient.invalidateQueries({ queryKey: ['jobs'] });
    queryClient.invalidateQueries({ queryKey: ['jobs', jobId] });
  },
});
```

---

## Service Design Principles

### Single Responsibility

```typescript
// ✅ GOOD — focused services
export async function createJobApplication(supabase, userId, data) { ... }
export async function updateJobApplication(supabase, jobId, userId, data) { ... }
export async function deleteJobApplication(supabase, jobId, userId) { ... }
export async function transitionJobStage(supabase, jobId, userId, data) { ... }

// ❌ BAD — god service doing too much
export async function processJobUpdate(supabase, jobId, userId, action, data) {
  if (action === 'update') { ... }
  else if (action === 'delete') { ... }
  else if (action === 'stage') { ... }
  // 200 lines of if/else
}
```

### Clear Parameter Naming

```typescript
// ✅ Always accept supabase as first param — enables dependency injection for tests
export async function createJobApplication(
  supabase: SupabaseClient<Database>,  // First — injectable for testing
  userId: string,                       // Second — authenticated user
  data: CreateJobDTO                    // Third — validated input from Route Handler
): Promise<JobApplication> { ... }
```

### Throw Meaningful Errors

```typescript
// ✅ GOOD — meaningful, typed errors
if (!job) throw new NotFoundError('Job application not found');
if (job.stage === 'offer') throw new ForbiddenError('Cannot delete an offer-stage application');
if (count >= 5) throw new FreeTierLimitError('active applications');

// ❌ BAD — generic errors
if (!job) throw new Error('Error');
if (job.stage === 'offer') return null;
```

---

## Story Service Example

```typescript
// lib/services/storyService.ts
export async function createStory(
  supabase: Supabase,
  userId: string,
  data: CreateStoryDTO
): Promise<InterviewStory> {
  const profile = await getProfileTier(supabase, userId);

  // Pro gate: full story bank access
  // Free users can create stories but limited to basic view (no vault analytics)
  // No insert limit at Phase 1 — revisit for Phase 2 if needed

  const { data: story, error } = await supabase
    .from('interview_stories')
    .insert({
      ...data,
      user_id: userId,
    })
    .select()
    .single();

  if (error) throw new AppError(error.message, 500);
  return story;
}

export async function updateStory(
  supabase: Supabase,
  storyId: string,
  userId: string,
  data: UpdateStoryDTO
): Promise<InterviewStory> {
  // Verify ownership — belt + suspenders
  const existing = await supabase
    .from('interview_stories')
    .select('id')
    .eq('id', storyId)
    .single();

  if (!existing.data) throw new NotFoundError('Story not found');

  const { data: story, error } = await supabase
    .from('interview_stories')
    .update(data)
    .eq('id', storyId)
    .select()
    .single();

  if (error) throw new AppError(error.message, 500);
  return story;
}
```

---

## Related Files

- [backend-dev-guidelines.md](backend-dev-guidelines.md) — Core standards
- [database-patterns.md](database-patterns.md) — Supabase query patterns used inside services
- [routing-and-controllers.md](routing-and-controllers.md) — Route Handlers that call services
- [complete-examples.md](complete-examples.md) — Full end-to-end examples
