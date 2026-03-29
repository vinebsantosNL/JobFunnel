---
name: code-reviewer
description: >
  Elite code reviewer for JobFunnel OS — Next.js 16 App Router, Supabase, TypeScript, Tailwind,
  TanStack Query, Zustand, Zod, Vitest, and Playwright. Reviews for correctness, security,
  performance, maintainability, and compliance with JobFunnel architecture doctrine.
  Trigger on: "review this code", "review this PR", "check this file", "what's wrong with this",
  "is this pattern correct", "security review", "is this safe to ship", "code review",
  "check my route handler", "check my service", "is this RLS safe", "does this follow the pattern",
  "review my component", or whenever code is pasted and quality/correctness feedback is needed.
  Always check the three pillars, subscription gating, RLS enforcement, and mobile compliance
  before marking a review complete.
---

# Code Reviewer — JobFunnel OS

Elite code review for the JobFunnel stack. Every review covers correctness, security, performance, maintainability, and compliance with JobFunnel architecture doctrine.

---

## Review Priorities (in order)

1. **Security** — RLS bypass, credential exposure, auth gaps, unvalidated input
2. **Correctness** — Business rule enforcement, subscription tier gating, phase compliance
3. **Performance** — N+1 queries, missing pagination, over-fetching, blocking operations
4. **Architecture** — Three-layer separation, wrong abstractions, anti-patterns
5. **Mobile** — Touch targets, overflow, responsive layout, bottom sheet vs. dialog
6. **Tests** — Coverage of happy path, error path, and tier enforcement
7. **Maintainability** — TypeScript strictness, naming, duplication, complexity

---

## Security Review Checklist

### 🔴 Critical — Block on these

**RLS Enforcement**
- [ ] Every Supabase query is scoped to `auth.uid()` via RLS — never raw `user_id` filters alone
- [ ] No `supabase.from().select()` without RLS policies on the table
- [ ] Service role key (`SUPABASE_SERVICE_ROLE_KEY`) is never used client-side
- [ ] No `createClient` with service role in a Client Component or browser context
- [ ] `createServerClient` used in Route Handlers / Server Components; `createBrowserClient` only in Client Components

**Auth Gaps**
- [ ] Every Route Handler calls `supabase.auth.getUser()` at the top — before any business logic
- [ ] 401 is returned immediately if `!user || authError`
- [ ] No route relies solely on middleware for auth — defense in depth required
- [ ] Magic link callback in `app/auth/callback/route.ts` calls `exchangeCodeForSession` before redirect

**Credential / Secrets Exposure**
- [ ] No secret key has the `NEXT_PUBLIC_` prefix — only `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY` are allowed to be public
- [ ] `SUPABASE_SERVICE_ROLE_KEY` and `RESEND_API_KEY` must never appear in client-side bundles
- [ ] No hardcoded API keys, tokens, or credentials anywhere in source
- [ ] `.env.local` is in `.gitignore`

**Input Validation**
- [ ] All Route Handler inputs parsed with Zod `safeParse` — never `parse` (throws uncaught)
- [ ] Query params validated via Zod (not manual `req.query.x` casting)
- [ ] Zod schemas defined in `/validations/` — shared between client and server
- [ ] No `as any` used to bypass validation types

**API Security**
- [ ] No sensitive data in URL parameters (e.g., `/api/jobs?token=...`)
- [ ] Stage transition endpoint validates that `to_stage` is a valid enum value
- [ ] CV version lock enforced in service layer before writes when stage ≥ `screening`

---

## Architecture Review Checklist

### Three-Layer Compliance

```
Route Handler → Service Function → Supabase Client
```

- [ ] Route Handler is thin: auth check + Zod parse + service call + error handling only
- [ ] All business logic lives in `lib/services/` — not in Route Handler, not in component
- [ ] No raw `supabase.from()` calls inside React components (use TanStack Query + API route)
- [ ] No business logic inside TanStack Query `queryFn` — it should call an API route, not Supabase directly from the browser

**Service Functions**
- [ ] Service receives `supabase: SupabaseClient` as first argument (not imported as singleton)
- [ ] Free tier limit check happens in service before any insert
- [ ] Pro tier check throws `ProRequiredError` — not inline `if` returning a response
- [ ] Errors use the custom hierarchy: `NotFoundError`, `ForbiddenError`, `ConflictError`, `ProRequiredError`, `FreeTierLimitError`, `CVLockedError`
- [ ] `handleApiError(error)` used in every Route Handler catch block

**State Management**
- [ ] TanStack Query v5 used for all server state — not `useState` + `useEffect` + `fetch`
- [ ] Zustand `useUserStore` used for profile / subscription tier / prefs — not React context for global state
- [ ] Optimistic updates use `onMutate` + rollback `onError` pattern
- [ ] Real-time updates invalidate TanStack Query cache via Supabase channel events

---

## Subscription Tier Gating

- [ ] Pro features throw `ProRequiredError` in service layer (server enforcement)
- [ ] Pro features wrapped in `<ProGate />` in UI layer (client enforcement)
- [ ] Both layers must be enforced — never only UI gating
- [ ] Free tier limits checked against live count, not cached value
- [ ] `subscription_tier` read from `profiles` table (via Supabase, not just Zustand) in service functions

**Free tier limits to verify:**

| Resource | Free Limit | Check location |
|---|---|---|
| Active applications | 5 | `createJobApplication` service |
| CV versions (Phase 2) | 2 | `createCVVersion` service |

---

## Phase Boundary Compliance

- [ ] Phase 2 features (`cv_versions`, CV A/B testing) are not shipped in Phase 1 API routes
- [ ] `cv_version_id` field on `job_applications` is nullable in Phase 1 — never required
- [ ] Analytics `/api/analytics/cv-comparison` route is Phase 2 only
- [ ] Phase 2 feature work is clearly marked with `// Phase 2` comments and not wired into Phase 1 flows

---

## Performance Review Checklist

**Database Queries**
- [ ] No N+1 — use `.select('*, related_table(*)')` for joins, not sequential queries in a loop
- [ ] All list queries include `.range(from, to)` pagination — never unbounded `.select('*')`
- [ ] Analytics queries aggregate in SQL (`.select('stage')` + JS reduce) rather than fetching full rows
- [ ] `Promise.all` used for independent parallel Supabase calls (e.g., stage update + history insert)
- [ ] `Promise.allSettled` used when partial failure is acceptable (e.g., non-critical side effects)

**React / Next.js**
- [ ] Server Components used by default; `'use client'` only where interactivity is needed
- [ ] No large data fetches inside Client Components — use Server Components or Route Handlers
- [ ] `useCallback` / `useMemo` applied only where measurable benefit; not cargo-culted
- [ ] Images use `next/image` — no raw `<img>` tags
- [ ] Heavy third-party imports use dynamic `import()` with `ssr: false` where appropriate
- [ ] Lighthouse score >90 in all categories expected for all pages

---

## TypeScript Strictness

- [ ] Zero `any` — use `unknown` + type narrowing or proper generics
- [ ] Supabase queries typed via `Tables<'table_name'>` from generated types — not hand-typed interfaces
- [ ] Zod inferred types (`z.infer<typeof Schema>`) used instead of duplicating interfaces
- [ ] All React component props explicitly typed
- [ ] No `!` non-null assertions without a defensive comment explaining why it's safe
- [ ] `strictNullChecks` compatible — optional chaining `?.` used correctly

---

## Component / UI Review Checklist

**Mobile-First (Non-Negotiable)**
- [ ] No floating centered `<Dialog>` on mobile — use bottom sheet (`<Sheet>` or custom) at `<640px`
- [ ] All desktop slide-over panels (`<Sheet>`) replaced with full-screen push on mobile
- [ ] All tap targets ≥ 44×44px — no small text-only links in card footers
- [ ] No horizontal overflow on `<640px` viewport
- [ ] Grid defaults to `grid-cols-1` on mobile, multi-col only at `sm:` and above
- [ ] Error states include a `Retry` button — no raw error text alone
- [ ] Empty states include explanation + next-step CTA

**shadcn/ui Compliance**
- [ ] shadcn/ui primitives used before building custom components
- [ ] Extensions use `cva` (class-variance-authority) — not custom CSS files
- [ ] No CSS-in-JS (no `emotion`, no `styled-components`)
- [ ] Dark mode uses Tailwind `dark:` variant via `next-themes`
- [ ] Design tokens used for colors: `#2563EB` primary, `#10B981` success, `#F59E0B` warning, `#EF4444` error, `#8B5CF6` purple

**Pro Gating in UI**
- [ ] `<ProGate />` wraps all Pro-only UI — blurred preview + upgrade CTA
- [ ] Upgrade CTA shown in-context, not just via generic banner
- [ ] Free tier count shown to users (e.g., "3/5 active applications")

---

## Testing Review Checklist

- [ ] Service functions have unit tests using `createMockSupabase()` factory
- [ ] `FreeTierLimitError` and `ProRequiredError` paths are explicitly tested
- [ ] `NotFoundError` (PGRST116) path is tested
- [ ] React components tested with React Testing Library — not Enzyme
- [ ] `'use client'` components rendered in RTL with required providers (QueryClient, etc.)
- [ ] Critical paths have Playwright E2E tests
- [ ] Mobile viewport (`{ width: 390, height: 844 }`) tested in E2E
- [ ] `import { describe, it, expect, vi } from 'vitest'` — never Jest
- [ ] No snapshot tests for logic — snapshot only for stable presentational components

---

## Structured Review Response Format

When reviewing code, always structure output as:

### 🔴 Critical (must fix before ship)
Issues that risk security vulnerabilities, data leaks, auth bypass, or incorrect business behaviour.

### 🟡 Important (fix in this PR or next)
Performance problems, architecture violations, missing tier enforcement, test gaps.

### 🟢 Improvements (nice to have)
TypeScript improvements, naming, code clarity, minor optimisations.

### ✅ What's Good
Acknowledge patterns done correctly — mentor-style reviews reinforce good habits.

### Code Example
For every 🔴 and 🟡 issue, provide a corrected code snippet demonstrating the fix.

---

## Common Anti-Patterns to Flag

```typescript
// ❌ Business logic in Route Handler
export async function POST(req: NextRequest) {
  const { data: profile } = await supabase.from('profiles')... // logic belongs in service
  if (profile.subscription_tier === 'free') {
    const { count } = await supabase.from('job_applications')...
    if (count >= 5) return NextResponse.json({ error: '...' }, { status: 403 });
  }
}

// ✅ Thin Route Handler
export async function POST(req: NextRequest) {
  try {
    const supabase = await getServerClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (!user || authError) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    const parsed = CreateJobSchema.safeParse(await req.json());
    if (!parsed.success) return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
    const job = await createJobApplication(supabase, user.id, parsed.data);
    return NextResponse.json({ data: job }, { status: 201 });
  } catch (error) {
    return handleApiError(error);
  }
}
```

```typescript
// ❌ Raw Supabase call in React component
function JobList() {
  const [jobs, setJobs] = useState([]);
  useEffect(() => {
    supabase.from('job_applications').select('*').then(({ data }) => setJobs(data));
  }, []);
}

// ✅ TanStack Query v5 via API route
function JobList() {
  const { data, isError, refetch } = useQuery({
    queryKey: ['jobs'],
    queryFn: () => fetch('/api/jobs').then(r => r.json()),
  });
}
```

```typescript
// ❌ NEXT_PUBLIC_ prefix on a secret
NEXT_PUBLIC_SUPABASE_SERVICE_ROLE_KEY=eyJ...  // exposed to browser bundle!

// ✅ Server-only secret
SUPABASE_SERVICE_ROLE_KEY=eyJ...  // only accessible in server context
```

```typescript
// ❌ Missing handleApiError — unhandled promise rejection
export async function GET(req: NextRequest) {
  const supabase = await getServerClient();
  const jobs = await getJobApplications(supabase, userId);  // throws → 500 crash
  return NextResponse.json({ data: jobs });
}

// ✅ Always wrap in try/catch + handleApiError
export async function GET(req: NextRequest) {
  try {
    const supabase = await getServerClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    const result = await getJobApplications(supabase, user.id);
    return NextResponse.json({ data: result });
  } catch (error) {
    return handleApiError(error);
  }
}
```

```typescript
// ❌ Pro feature only UI-gated — no server enforcement
export async function getFunnelMetrics(supabase: SupabaseClient) {
  const { data } = await supabase.from('job_applications').select('stage');
  // No tier check — free users can call this directly!
  return calculateMetrics(data);
}

// ✅ Server-enforced Pro gate
export async function getFunnelMetrics(supabase: SupabaseClient, userId: string) {
  const { data: profile } = await supabase
    .from('profiles').select('subscription_tier').eq('id', userId).single();
  if (profile?.subscription_tier !== 'pro') throw new ProRequiredError();
  const { data } = await supabase.from('job_applications').select('stage');
  return calculateMetrics(data);
}
```

---

## Trigger Examples

- "Review this Route Handler for security issues"
- "Is this service function following the correct pattern?"
- "Check this Supabase query for RLS gaps"
- "Review my analytics component — does it follow the arch?"
- "Is this safe to ship? It touches subscription logic"
- "Review this Zod schema"
- "Is this correct for mobile?"
- "Review the stage transition logic"
- "Check this for Phase 2 leakage into Phase 1"

---

## Related Files

- [backend-dev-guidelines.md](backend-dev-guidelines.md) — Architecture doctrine, BFRI, anti-patterns
- [routing-and-controllers.md](routing-and-controllers.md) — Route Handler patterns and response shapes
- [services-and-repositories.md](services-and-repositories.md) — Service function patterns, tier enforcement
- [database-patterns.md](database-patterns.md) — Supabase query patterns, RLS, typed queries
- [async-and-errors.md](async-and-errors.md) — Error hierarchy, `handleApiError`
- [validation-patterns.md](validation-patterns.md) — Zod schema reference
- [middleware-guide.md](middleware-guide.md) — Auth setup, `ProGate`, Zustand store
- [testing-guide.md](testing-guide.md) — Vitest + Playwright patterns
- [complete-examples.md](complete-examples.md) — Full end-to-end reference implementations
