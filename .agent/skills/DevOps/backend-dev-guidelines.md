---
name: backend-dev-guidelines
description: >
  You are a senior full-stack engineer on JobFunnel OS — a Next.js 14 App Router SaaS on Supabase. Apply
  when writing Route Handlers, service functions, Supabase queries, Zod validation, auth middleware, or any
  API-layer code. Trigger on: "write an API route", "add an endpoint", "query the database", "validate
  input", "auth check", "supabase query", "route handler", "service function", or any backend task.
  Non-negotiable: Next.js 14 App Router only, Supabase + @supabase/ssr, Zod 3.x, Vitest, no Express/Prisma.
---

# Backend Development Guidelines — JobFunnel OS

**(Next.js 14 App Router · Supabase · TypeScript · Vercel)**

You are a **senior full-stack engineer** building production-grade API routes for JobFunnel OS. Your backend is not a separate service — it lives inside the Next.js App Router as Route Handlers under `app/api/`.

Your goal: build **predictable, RLS-enforced, type-safe API endpoints** that respect the product's three strategic pillars — Funnel Analytics, Interview Content OS, CV Experimentation.

---

## 1. Backend Feasibility & Risk Index (BFRI)

Before implementing or modifying a backend feature, assess feasibility.

### BFRI Dimensions (1–5)

| Dimension | Question |
|---|---|
| **Architectural Fit** | Does this follow Route Handler → Service fn → Supabase client pattern? |
| **Business Logic Complexity** | How complex is the domain logic? |
| **Data Risk** | Does this touch critical data or cross user boundaries? |
| **RLS Risk** | Could this bypass or misconfigure Row Level Security? |
| **Testability** | Can this be reliably unit + integration tested with Vitest? |

### Score Formula

```
BFRI = (Architectural Fit + Testability) − (Complexity + Data Risk + RLS Risk)
```

**Range:** `-10 → +10`

| BFRI | Meaning | Action |
|---|---|---|
| **6–10** | Safe | Proceed |
| **3–5** | Moderate | Add tests + double-check RLS |
| **0–2** | Risky | Refactor or isolate |
| **< 0** | Dangerous | Redesign before coding |

**Pillar Tax:** If the feature serves none of the three pillars, apply -1 to BFRI and flag for review.

---

## 2. When to Use This Skill

Automatically applies when working on:
- Route Handlers (`app/api/**/*.ts`)
- Supabase queries (`.from()`, `.select()`, `.insert()`, `.update()`, `.delete()`)
- Auth checks (`createServerClient`, session validation)
- Zod validation schemas
- Service-layer functions
- API error handling
- Subscription tier enforcement at the API level

---

## 3. Core Architecture Doctrine (Non-Negotiable)

### Stack Is Fixed

| Layer | Tech | Rule |
|---|---|---|
| Framework | Next.js 14 App Router | Route Handlers only — NO Express |
| Database | Supabase (Postgres) | `@supabase/ssr` — NO Prisma, no raw SQL via client |
| Auth | Supabase Auth | `createServerClient` in Route Handlers |
| Validation | Zod 3.x | Every external input, every endpoint |
| Testing | Vitest + Playwright | NO Jest |
| Deploy | Vercel | Edge-compatible where possible |

### The Three-Layer Pattern (Route Handlers)

```
app/api/{feature}/route.ts        ← Layer 1: HTTP + auth + Zod validation
  ↓
lib/services/{feature}Service.ts  ← Layer 2: Business logic, tier checks
  ↓
lib/supabase/queries.ts           ← Layer 3: Supabase client calls (RLS enforced)
```

### Layer Rules

**Route Handlers:**
- ✅ Auth check (verify Supabase session)
- ✅ Zod parse of request body/params
- ✅ Call service function
- ✅ Return `NextResponse.json()`
- ❌ No raw Supabase calls
- ❌ No business logic

**Service Functions:**
- ✅ Business rules (tier gating, validation, ownership)
- ✅ Orchestration (multiple queries)
- ✅ Throw `AppError` typed errors
- ❌ No `NextRequest`/`NextResponse` imports
- ❌ No Zod parsing

**Supabase Queries:**
- ✅ All `.from()` operations
- ✅ RLS always active (never bypass with service role on client)
- ✅ User-scoped queries only
- ❌ No business logic

---

## 4. Auth Is Mandatory on Every Route

```typescript
// app/api/jobs/route.ts
import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';

export async function GET() {
  const cookieStore = cookies();
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    { cookies: { getAll: () => cookieStore.getAll() } }
  );

  // ✅ ALWAYS: verify session first
  const { data: { user }, error } = await supabase.auth.getUser();
  if (!user || error) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  // RLS handles user scoping automatically from here
  const { data, error: queryError } = await supabase
    .from('job_applications')
    .select('*')
    .order('created_at', { ascending: false });

  if (queryError) return NextResponse.json({ error: queryError.message }, { status: 500 });

  return NextResponse.json({ data });
}
```

❌ **NEVER** skip the auth check.
❌ **NEVER** use `SUPABASE_SERVICE_ROLE_KEY` in Route Handlers or client code.

---

## 5. RLS Is the Security Boundary

```sql
-- Every user table must have this policy (or equivalent)
create policy "users_own_data" on job_applications
  for all using (auth.uid() = user_id);
```

- All queries run through the anon key — RLS automatically scopes data to `auth.uid()`
- Never filter by `user_id` in application code as the only guard; RLS must also enforce it
- Never bypass RLS in Route Handlers

---

## 6. Zod Validation Is Non-Negotiable

```typescript
// ❌ NEVER: unvalidated input
const body = await req.json();
await supabase.from('job_applications').insert(body);

// ✅ ALWAYS: parse with Zod
const CreateJobSchema = z.object({
  company_name: z.string().min(1).max(200),
  job_title: z.string().min(1).max(200),
  stage: z.enum(['saved', 'applied', 'screening', 'interviewing', 'offer', 'rejected', 'withdrawn']),
});

const parsed = CreateJobSchema.safeParse(await req.json());
if (!parsed.success) {
  return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
}
```

Define schemas in `/validations/` directory. Share between client and Route Handler.

---

## 7. Subscription Tier Enforcement

Pro features must be enforced at **both** the API level AND the UI level.

```typescript
// In service function — never skip this
const { data: profile } = await supabase
  .from('profiles')
  .select('subscription_tier')
  .eq('id', user.id)
  .single();

if (profile?.subscription_tier !== 'pro') {
  throw new AppError('Pro subscription required', 403, 'PRO_REQUIRED');
}
```

| Pro-gated features | Free tier limits |
|---|---|
| Full funnel analytics | 5 active applications |
| Interview vault | Basic tracking only |
| CV versioning + A/B | — |
| Unlimited pipeline | — |

---

## 8. Directory Structure (Canonical)

```
app/
  api/
    auth/           ← Auth callbacks, magic link
    jobs/           ← Job CRUD + stage transitions
      route.ts      ← GET (list), POST (create)
      [id]/
        route.ts    ← GET, PATCH, DELETE
        stage/
          route.ts  ← POST (stage transition)
    analytics/      ← Funnel, timeline, stage-time
    stories/        ← Interview story CRUD
    cv-versions/    ← Phase 2: CV management
    dashboard/      ← Stats aggregations

lib/
  services/         ← Business logic (no HTTP)
  supabase/         ← Supabase client helpers
  utils/            ← Shared utilities

validations/        ← Zod schemas (shared client + server)
types/              ← TypeScript interfaces
```

---

## 9. Naming Conventions

| Layer | Convention | Example |
|---|---|---|
| Route Handler | kebab-case directory | `app/api/cv-versions/route.ts` |
| Service function | camelCase | `getJobApplications()` |
| Zod schema | PascalCase + Schema | `CreateJobSchema` |
| Type/interface | PascalCase | `JobApplication` |
| Supabase helper | camelCase | `getSupabaseServerClient()` |

---

## 10. Error Handling

### Custom Error Class

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
```

### Consistent Route Handler Error Response

```typescript
// Standard error handler in every Route Handler catch block
catch (error) {
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

## 11. Testing Discipline

| Test type | Tool | Scope |
|---|---|---|
| Unit tests | Vitest | Service functions, pure logic |
| Integration | Vitest | Route Handlers with Supabase mocked |
| E2E | Playwright | Critical user paths |

```typescript
// ✅ CORRECT — Vitest, not Jest
import { describe, it, expect, vi } from 'vitest';
```

No tests → no merge.

---

## 12. Anti-Patterns (Reject Immediately)

❌ Business logic in Route Handlers (beyond parse + call)
❌ Raw Supabase calls in Route Handlers (go through service)
❌ Missing auth check on any endpoint
❌ Bypassing RLS with service role key
❌ `process.env` accessed outside of env config helpers
❌ Unvalidated `req.json()` passed to Supabase
❌ Hardcoded user IDs or tier values
❌ `console.log` as the only error handling
❌ Jest in any test file
❌ Prisma, Express, NextAuth, Drizzle, or SWR introduced

---

## 13. Integration With Other Skills

- **FrondDeveloper.md** → Frontend stack standards and component patterns
- **architecture-patterns.md** → Full architecture review framework
- **qa-engineer.md** → QA pass after every deploy
- **jobfunnel-pm-toolkit** → Feature prioritization before building

---

## 14. Operator Validation Checklist

Before marking any backend task done:

- [ ] BFRI ≥ 3
- [ ] Auth check present and correct
- [ ] Zod schema validates all inputs
- [ ] RLS active — no service role bypass
- [ ] Subscription tier gating enforced (if Pro feature)
- [ ] Error responses follow standard shape
- [ ] Vitest tests written for service logic
- [ ] No anti-patterns present
- [ ] `NEXT_PUBLIC_` prefix rules respected in env access
