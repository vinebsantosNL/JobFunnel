---
name: async-and-errors
description: >
  Async/await patterns and error handling for JobFunnel OS — Route Handlers, service functions,
  custom error types, and Supabase error codes. Use when writing async code, handling errors,
  or deciding how to propagate failures up the stack. Trigger on: "error handling", "async pattern",
  "try catch", "throw error", "error types", "promise.all", "supabase error codes".
---

# Async Patterns and Error Handling — JobFunnel OS

Complete guide to async/await patterns and typed error handling in Next.js 14 App Router.

---

## Custom Error Types

### Error Hierarchy

```typescript
// lib/utils/errors.ts
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
  constructor(feature: string = 'this feature') {
    super(`Pro subscription required to access ${feature}`, 403, 'PRO_REQUIRED');
  }
}

export class FreeTierLimitError extends AppError {
  constructor(resource: string = 'resource') {
    super(`Free tier limit reached for ${resource}. Upgrade to Pro for unlimited access.`, 403, 'FREE_TIER_LIMIT');
  }
}

export class CVLockedError extends AppError {
  constructor() {
    super('CV version cannot be changed once the application reaches screening stage', 422, 'CV_LOCKED');
  }
}
```

---

## Route Handler Error Pattern

### Standard Try-Catch in Route Handlers

```typescript
// app/api/jobs/route.ts
export async function POST(req: NextRequest) {
  try {
    const supabase = await getServerClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (!user || authError) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const parsed = CreateJobSchema.safeParse(await req.json());
    if (!parsed.success) {
      return NextResponse.json(
        { error: { message: 'Validation failed', details: parsed.error.flatten() } },
        { status: 400 }
      );
    }

    const job = await createJobApplication(supabase, user.id, parsed.data);
    return NextResponse.json({ data: job }, { status: 201 });

  } catch (error) {
    // ✅ AppError: use its statusCode and code
    if (error instanceof AppError) {
      return NextResponse.json(
        { error: { message: error.message, code: error.code } },
        { status: error.statusCode }
      );
    }
    // Unknown error: log + generic 500
    console.error('[POST /api/jobs]', error);
    return NextResponse.json(
      { error: { message: 'Internal server error', code: 'INTERNAL_ERROR' } },
      { status: 500 }
    );
  }
}
```

### Reusable Error Handler

```typescript
// lib/utils/apiHandler.ts
import { NextResponse } from 'next/server';

export function handleApiError(error: unknown, context: string): NextResponse {
  if (error instanceof AppError) {
    return NextResponse.json(
      { error: { message: error.message, code: error.code } },
      { status: error.statusCode }
    );
  }
  console.error(`[API Error: ${context}]`, error);
  return NextResponse.json(
    { error: { message: 'Internal server error', code: 'INTERNAL_ERROR' } },
    { status: 500 }
  );
}

// Usage
catch (error) {
  return handleApiError(error, 'POST /api/jobs');
}
```

---

## Service Function Error Pattern

### Always Throw, Never Return Null for Errors

```typescript
// lib/services/jobService.ts

// ✅ Throw typed errors — Route Handler catches them
export async function getJobById(supabase: SupabaseClient, jobId: string): Promise<JobApplication> {
  const { data, error } = await supabase
    .from('job_applications')
    .select('*')
    .eq('id', jobId)
    .single();

  if (error?.code === 'PGRST116' || !data) {
    throw new NotFoundError('Job application not found');
  }
  if (error) throw new AppError(error.message, 500);

  return data;
}

// ✅ Business rule errors are also thrown
export async function deleteJobApplication(
  supabase: SupabaseClient,
  jobId: string,
  userId: string
): Promise<void> {
  const job = await getJobById(supabase, jobId);

  // Business rule: can't delete applications in active interview rounds
  if (job.stage === 'interviewing' || job.stage === 'offer') {
    throw new ForbiddenError('Cannot delete an application in interviewing or offer stage');
  }

  const { error } = await supabase.from('job_applications').delete().eq('id', jobId);
  if (error) throw new AppError(error.message, 500);
}
```

---

## Async/Await Best Practices

### Always Use Try-Catch in Service Functions

```typescript
// ❌ NEVER: Unhandled async errors
async function fetchJob(supabase: SupabaseClient, jobId: string) {
  const { data } = await supabase.from('job_applications').select('*').eq('id', jobId).single();
  return data; // If Supabase throws, unhandled!
}

// ✅ ALWAYS: Handle errors explicitly
async function fetchJob(supabase: SupabaseClient, jobId: string): Promise<JobApplication> {
  const { data, error } = await supabase
    .from('job_applications')
    .select('*')
    .eq('id', jobId)
    .single();

  if (error?.code === 'PGRST116') throw new NotFoundError('Job not found');
  if (error) throw new AppError(error.message, 500);
  if (!data) throw new NotFoundError('Job not found');

  return data;
}
```

### Avoid .then() Chains

```typescript
// ❌ AVOID: Promise chains in service functions
function getAnalytics(supabase) {
  return supabase.from('job_applications').select('stage')
    .then(result => processStages(result.data))
    .then(stages => calculateRates(stages))
    .catch(error => { console.error(error); });
}

// ✅ PREFER: Async/await
async function getAnalytics(supabase: SupabaseClient) {
  const { data, error } = await supabase.from('job_applications').select('stage');
  if (error) throw new AppError(error.message, 500);

  const stages = processStages(data);
  return calculateRates(stages);
}
```

---

## Parallel Operations

### Promise.all for Independent Queries

```typescript
// ✅ Run independent queries in parallel
async function getDashboardStats(
  supabase: SupabaseClient,
  userId: string
): Promise<DashboardStats> {
  try {
    const [jobsResult, storiesResult] = await Promise.all([
      supabase
        .from('job_applications')
        .select('stage', { count: 'exact' })
        .neq('stage', 'withdrawn'),
      supabase
        .from('interview_stories')
        .select('id', { count: 'exact' }),
    ]);

    if (jobsResult.error) throw new AppError(jobsResult.error.message, 500);
    if (storiesResult.error) throw new AppError(storiesResult.error.message, 500);

    return {
      totalApplications: jobsResult.count ?? 0,
      storiesCreated: storiesResult.count ?? 0,
      // ... more stats
    };
  } catch (error) {
    if (error instanceof AppError) throw error;
    throw new AppError('Failed to load dashboard stats', 500);
  }
}
```

### Promise.allSettled for Non-Critical Parallel Operations

```typescript
// ✅ Use allSettled when partial failure is acceptable
const results = await Promise.allSettled([
  sendWelcomeEmail(user.email),
  createDefaultStory(supabase, user.id),
  initializeAnalytics(supabase, user.id),
]);

results.forEach((result, index) => {
  if (result.status === 'rejected') {
    // Log but don't fail the whole operation
    console.error(`Onboarding step ${index} failed:`, result.reason);
  }
});
```

---

## Client-Side Error Handling

### TanStack Query Error States

```typescript
// components/features/pipeline/KanbanBoard.tsx
'use client';
const { data, error, isLoading, refetch } = useQuery({
  queryKey: ['jobs'],
  queryFn: async () => {
    const res = await fetch('/api/jobs');
    if (!res.ok) {
      const body = await res.json();
      throw new Error(body.error?.message ?? 'Failed to load jobs');
    }
    return res.json();
  },
});

if (isLoading) return <KanbanSkeleton />;

// ✅ Always show error with retry — never blank screen on mobile
if (error) {
  return (
    <EmptyState
      title="Couldn't load your pipeline"
      description={error.message}
      action={<Button onClick={() => refetch()}>Try again</Button>}
    />
  );
}
```

### Toast Notifications for Mutations

```typescript
const { toast } = useToast();

const createJob = useMutation({
  mutationFn: (data: CreateJobDTO) =>
    fetch('/api/jobs', { method: 'POST', body: JSON.stringify(data) }).then(r => {
      if (!r.ok) return r.json().then(b => Promise.reject(new Error(b.error?.message)));
      return r.json();
    }),
  onSuccess: () => {
    toast({ title: 'Application added', variant: 'default' });
  },
  onError: (error: Error) => {
    toast({
      title: 'Could not add application',
      description: error.message,
      variant: 'destructive',
    });
  },
});
```

---

## Error Propagation

### Service Function → Route Handler Chain

```typescript
// The error bubbles up cleanly

// lib/services/jobService.ts
async function checkFreeTierLimit(supabase: SupabaseClient, userId: string) {
  const { count } = await supabase
    .from('job_applications')
    .select('id', { count: 'exact', head: true })
    .eq('user_id', userId)
    .not('stage', 'in', '("rejected","withdrawn")');

  if ((count ?? 0) >= 5) {
    throw new FreeTierLimitError('active applications');  // ← thrown here
  }
}

// lib/services/jobService.ts
export async function createJobApplication(supabase, userId, data) {
  const profile = await getProfile(supabase, userId);
  if (profile.subscription_tier === 'free') {
    await checkFreeTierLimit(supabase, userId);  // ← propagates FreeTierLimitError
  }
  // ... rest of creation
}

// app/api/jobs/route.ts
export async function POST(req: NextRequest) {
  try {
    const job = await createJobApplication(supabase, user.id, parsed.data);
    return NextResponse.json({ data: job }, { status: 201 });
  } catch (error) {
    // FreeTierLimitError is caught here as AppError (statusCode: 403)
    if (error instanceof AppError) {
      return NextResponse.json(
        { error: { message: error.message, code: error.code } },
        { status: error.statusCode }
      );
    }
    // ...
  }
}
```

---

## Common Async Pitfalls

### Fire and Forget (Careful)

```typescript
// ❌ NEVER: Fire and forget without error handling
async function createJob(supabase, data) {
  await supabase.from('job_applications').insert(data);
  sendOnboardingHint(userId);  // Fires async, errors silently lost!
}

// ✅ If background task is intentional, handle its errors:
async function createJob(supabase, data) {
  await supabase.from('job_applications').insert(data);
  // Intentional background, won't affect response
  sendOnboardingHint(userId).catch(err => {
    console.error('[Background: onboarding hint]', err);
  });
}
```

### Forgetting to Await in Route Handlers

```typescript
// ❌ NEVER: Forget to await Supabase calls
export async function DELETE(req: NextRequest, { params }) {
  const supabase = await getServerClient();
  supabase.from('job_applications').delete().eq('id', params.id); // NOT awaited!
  return NextResponse.json({ success: true }); // Responds before delete completes
}

// ✅ ALWAYS: Await mutations
export async function DELETE(req: NextRequest, { params }) {
  const supabase = await getServerClient();
  const { error } = await supabase.from('job_applications').delete().eq('id', params.id);
  if (error) throw new AppError(error.message, 500);
  return new NextResponse(null, { status: 204 });
}
```

---

## Related Files

- [backend-dev-guidelines.md](backend-dev-guidelines.md) — Core standards
- [routing-and-controllers.md](routing-and-controllers.md) — Route Handler structure
- [database-patterns.md](database-patterns.md) — Supabase error codes
