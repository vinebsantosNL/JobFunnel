---
name: architecture-overview
description: >
  Reference guide for JobFunnel OS layered architecture pattern — Next.js 16 App Router, Supabase, Vercel.
  Use when understanding the directory structure, request lifecycle, separation of concerns, or deciding
  where new code belongs. Trigger on: "where does this code go", "how is the app structured",
  "request lifecycle", "directory layout", "App Router structure", "separation of concerns".
---

# Architecture Overview — JobFunnel OS

Complete reference for the layered architecture used in JobFunnel OS.

---

## Layered Architecture Pattern

### The Three Layers

```
┌─────────────────────────────────────────────┐
│            HTTP Request                     │
└───────────────┬─────────────────────────────┘
                ↓
┌─────────────────────────────────────────────┐
│  Layer 1: ROUTE HANDLERS                    │
│  app/api/**/*.ts                            │
│  - Auth verification (Supabase session)     │
│  - Zod input validation                     │
│  - Call service functions                   │
│  - Return NextResponse.json()               │
│  - NO business logic                        │
└───────────────┬─────────────────────────────┘
                ↓
┌─────────────────────────────────────────────┐
│  Layer 2: SERVICE FUNCTIONS                 │
│  lib/services/*.ts                          │
│  - Business logic and rules                 │
│  - Subscription tier enforcement            │
│  - Orchestrate multiple queries             │
│  - Throw typed AppErrors                    │
│  - NO HTTP knowledge (no NextRequest)       │
└───────────────┬─────────────────────────────┘
                ↓
┌─────────────────────────────────────────────┐
│  Layer 3: SUPABASE CLIENT                   │
│  lib/supabase/*.ts + direct in services     │
│  - .from() queries                          │
│  - RLS enforced automatically               │
│  - User-scoped by auth.uid()                │
│  - NO business logic                        │
└───────────────┬─────────────────────────────┘
                ↓
┌─────────────────────────────────────────────┐
│      Supabase (Postgres + Auth + Storage)   │
└─────────────────────────────────────────────┘
```

### Why This Architecture?

**Testability:** Service functions have no HTTP dependencies — test them with Vitest without mocking `NextRequest`. Route Handlers are thin and rarely need unit tests (cover with Playwright E2E instead).

**Maintainability:** Business logic never bleeds into Route Handlers. When Supabase client API changes, you update service functions only.

**RLS as the boundary:** All Supabase queries run through the anon key with RLS active. The architecture makes it structurally impossible to accidentally bypass user isolation.

**Vercel-native:** No server process to manage, no Express app, no port binding. Route Handlers deploy as Vercel serverless functions automatically.

---

## Request Lifecycle

### Complete Flow — POST /api/jobs

```
1. Browser sends POST /api/jobs
   ↓
2. Next.js App Router matches app/api/jobs/route.ts → export async function POST
   ↓
3. Route Handler: createServerClient → supabase.auth.getUser()
   → 401 if no valid session
   ↓
4. Route Handler: CreateJobSchema.safeParse(await req.json())
   → 400 if validation fails
   ↓
5. Route Handler: calls createJobApplication(supabase, user.id, data)
   ↓
6. Service function: checks business rules
   (e.g. free tier limit: count active applications)
   → throws AppError(403) if limit exceeded
   ↓
7. Service function: supabase.from('job_applications').insert({...})
   RLS policy auto-enforces user_id = auth.uid()
   ↓
8. Service function returns created record
   ↓
9. Route Handler: NextResponse.json({ data: job }, { status: 201 })
   ↓
10. Client receives response
```

### Middleware Layer (Next.js Middleware)

```
middleware.ts (root)
  - Runs on every request matching the matcher pattern
  - Calls createServerClient + refreshSession (keeps Supabase JWT fresh)
  - Does NOT redirect — Route Handlers handle auth themselves
  - Pattern: matcher: ['/((?!_next/static|_next/image|favicon.ico).*)']
```

---

## Directory Structure

### Full Structure

```
jobfunnel/
├── app/
│   ├── (auth)/                  ← Unauthenticated routes
│   │   ├── login/page.tsx
│   │   └── signup/page.tsx
│   ├── (dashboard)/             ← Authenticated app
│   │   ├── layout.tsx           ← Session check + sidebar
│   │   ├── dashboard/page.tsx
│   │   ├── pipeline/page.tsx
│   │   ├── analytics/
│   │   │   ├── page.tsx
│   │   │   └── cv-testing/page.tsx   ← Phase 2, Pro only
│   │   ├── stories/page.tsx
│   │   ├── cv-versions/page.tsx      ← Phase 2
│   │   └── settings/page.tsx
│   ├── api/
│   │   ├── auth/
│   │   │   ├── callback/route.ts     ← OAuth callback
│   │   │   ├── login/route.ts
│   │   │   ├── logout/route.ts
│   │   │   └── me/route.ts
│   │   ├── jobs/
│   │   │   ├── route.ts              ← GET list, POST create
│   │   │   └── [id]/
│   │   │       ├── route.ts          ← GET, PATCH, DELETE
│   │   │       └── stage/route.ts    ← POST stage transition
│   │   ├── analytics/
│   │   │   ├── funnel/route.ts
│   │   │   ├── timeline/route.ts
│   │   │   └── stage-time/route.ts
│   │   ├── stories/
│   │   │   ├── route.ts
│   │   │   └── [id]/route.ts
│   │   ├── cv-versions/              ← Phase 2
│   │   │   ├── route.ts
│   │   │   └── [id]/route.ts
│   │   └── dashboard/
│   │       └── stats/route.ts
│   ├── layout.tsx
│   └── page.tsx                      ← Public landing
│
├── components/
│   ├── ui/                      ← shadcn/ui primitives (never modify directly)
│   ├── common/                  ← Shared across features
│   └── features/
│       ├── pipeline/
│       ├── analytics/
│       ├── stories/
│       └── cv-versions/
│
├── lib/
│   ├── services/                ← Business logic functions
│   │   ├── jobService.ts
│   │   ├── analyticsService.ts
│   │   ├── storyService.ts
│   │   └── cvVersionService.ts  ← Phase 2
│   ├── supabase/
│   │   ├── server.ts            ← createServerClient helper
│   │   └── client.ts            ← createBrowserClient helper
│   └── utils/
│       ├── errors.ts            ← AppError, NotFoundError etc.
│       └── subscription.ts      ← Tier checking helpers
│
├── validations/                 ← Zod schemas (shared client + server)
│   ├── job.schemas.ts
│   ├── story.schemas.ts
│   └── cvVersion.schemas.ts
│
├── types/
│   ├── database.types.ts        ← Generated from supabase gen types
│   └── app.types.ts             ← App-specific interfaces
│
├── store/
│   └── userStore.ts             ← Zustand: profile, tier, UI state
│
├── middleware.ts                ← Session refresh
└── .env.local                   ← Secrets (never commit)
```

---

## Separation of Concerns

### What Goes Where

**Route Handler (`app/api/**/route.ts`):**
- ✅ `createServerClient` and `supabase.auth.getUser()`
- ✅ `ZodSchema.safeParse(await req.json())`
- ✅ One call to a service function
- ✅ `NextResponse.json(result, { status: N })`
- ❌ Business logic (if/else beyond auth + validation)
- ❌ Direct `.from()` Supabase calls
- ❌ Tier checking

**Service Function (`lib/services/*.ts`):**
- ✅ Business rules (free tier limits, ownership checks)
- ✅ Tier enforcement (`profile.subscription_tier`)
- ✅ Multi-step operations (stage transition + history insert)
- ✅ `throw new AppError(...)` on failure
- ❌ `NextRequest`, `NextResponse`, `cookies()`
- ❌ Zod parsing

**Supabase Queries (inside service functions):**
- ✅ `.from('table').select()/.insert()/.update()/.delete()`
- ✅ Trust RLS for user scoping
- ❌ Business decisions based on query results (that's service logic)
- ❌ Service role key

### Example: Stage Transition

```typescript
// ✅ Route Handler — thin
// app/api/jobs/[id]/stage/route.ts
export async function POST(req: NextRequest, { params }: { params: { id: string } }) {
  const supabase = await getServerClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const parsed = StageTransitionSchema.safeParse(await req.json());
  if (!parsed.success) return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });

  const result = await transitionJobStage(supabase, params.id, user.id, parsed.data);
  return NextResponse.json({ data: result });
}

// ✅ Service Function — business logic
// lib/services/jobService.ts
export async function transitionJobStage(
  supabase: SupabaseClient,
  jobId: string,
  userId: string,
  { to_stage }: { to_stage: Stage }
) {
  // Business rule: verify ownership (belt + suspenders, RLS is primary)
  const { data: job } = await supabase
    .from('job_applications')
    .select('id, stage')
    .eq('id', jobId)
    .single();
  if (!job) throw new NotFoundError('Application not found');

  // Business rule: CV locking (Phase 2)
  if (['screening', 'interviewing', 'offer'].includes(to_stage)) {
    // cv_version becomes immutable once past applied
  }

  // Update stage + log history atomically
  const [updated] = await Promise.all([
    supabase.from('job_applications').update({ stage: to_stage, stage_updated_at: new Date() }).eq('id', jobId),
    supabase.from('stage_history').insert({ job_id: jobId, from_stage: job.stage, to_stage, transitioned_at: new Date() }),
  ]);

  return updated.data;
}
```

---

## Component Architecture

### Server vs Client Components

```typescript
// ✅ Default: Server Component — fetches data, no interactivity
// app/(dashboard)/pipeline/page.tsx
export default async function PipelinePage() {
  const supabase = await getServerClient();
  const { data } = await supabase.from('job_applications').select('*');
  return <KanbanBoard initialData={data} />;
}

// ✅ Client Component — only when interactivity needed
// components/features/pipeline/KanbanBoard.tsx
'use client';
export function KanbanBoard({ initialData }: { initialData: JobApplication[] }) {
  const { data } = useQuery({ queryKey: ['jobs'], queryFn: fetchJobs, initialData });
  // DnD interactions with @dnd-kit/core
}
```

**Rule:** Add `'use client'` only when you need: event handlers, state, browser APIs, or TanStack Query hooks.

---

## Module Organization

### Feature-Based Grouping

For features with 5+ files, use subdirectories:

```
components/features/pipeline/
├── KanbanBoard.tsx        ← Board container
├── KanbanColumn.tsx       ← Stage column
├── ApplicationCard.tsx    ← Individual card
├── StageDropZone.tsx      ← DnD drop target
└── AddJobModal.tsx        ← Create dialog
```

### Pro Gate Pattern

```typescript
// components/common/ProGate.tsx
export function ProGate({ children, fallback }: ProGateProps) {
  const { tier } = useUserStore();
  if (tier === 'pro') return <>{children}</>;
  return fallback ?? <UpgradeCTA />;
}

// Usage
<ProGate>
  <AnalyticsDashboard />
</ProGate>
```

---

## Related Files

- [backend-dev-guidelines.md](backend-dev-guidelines.md) — Main coding standards
- [routing-and-controllers.md](routing-and-controllers.md) — Route Handler patterns
- [services-and-repositories.md](services-and-repositories.md) — Service function patterns
- [database-patterns.md](database-patterns.md) — Supabase query patterns
