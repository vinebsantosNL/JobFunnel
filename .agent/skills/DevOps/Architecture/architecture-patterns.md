---
name: architecture-patterns
description: Review frontend and backend architecture of the JobFunnel OS SaaS project and suggest improvements for scalability, maintainability, and market readiness. Trigger this skill when the user says "review my architecture", "review my frontend", "review my backend", "architecture review", "is this scalable", "review my design", or asks for structural feedback on Next.js, Supabase, or component organisation. Do not auto-trigger — wait to be explicitly invoked.
---

# Architecture Patterns — JobFunnel OS

A senior-level architecture review for the JobFunnel OS project. Examines frontend (Next.js 16 App Router + shadcn/ui) and backend (Supabase + API routes) against patterns that make B2C SaaS products scalable, maintainable, and ready to ship to real users.

## Use this skill when

- User asks for an architecture or design review
- User shares a folder structure, schema, or component tree and wants feedback
- User is about to build a major new feature and wants to validate the approach
- User says "is this the right way to structure this?"

## Do not use this skill when

- The request is a small, localised bug fix with no structural implications
- The user only wants implementation details (e.g. "how do I write this query") with no architectural question
- The review would be premature (e.g. only 2 files exist)

---

## Tech stack context

- **Frontend**: Next.js 16, App Router, TypeScript, Tailwind CSS, shadcn/ui
- **Backend**: Supabase (Postgres + Auth + Storage + Realtime), API routes
- **Deployment**: Vercel
- **Product**: B2C SaaS — tech professionals managing job search as a product funnel

---

## Review framework

### Step 1 — Gather context

Before reviewing, ask the user to share at minimum:

1. Top-level folder structure (`src/app/`, `src/components/`, `src/lib/`, etc.)
2. The Supabase schema for the core tables (or an ERD)
3. A description of the 2–3 most complex user flows

If they share code files or screenshots, read them carefully before forming opinions.

---

### Step 2 — Frontend review

Evaluate each area against the criteria below. For each, give a verdict and a specific recommendation.

#### App Router structure
- Are routes colocated with their UI and data-fetching logic?
- Are Server Components used for data fetching and Client Components reserved for interactivity?
- Are layouts used correctly to avoid re-fetching on navigation?
- Are loading.tsx and error.tsx defined for all major routes?

**Red flags**: Everything in `'use client'`, fetching in client components, no route groups, single global layout.

**Good patterns**:
```
app/
  (auth)/           ← route group — no layout shared with dashboard
    login/page.tsx
    signup/page.tsx
  (dashboard)/      ← authenticated area
    layout.tsx      ← session check here, once
    pipeline/page.tsx
    funnel/page.tsx
  api/              ← API routes for mutations only
```

#### Component architecture
- Are components decomposed at the right level of abstraction?
- Is there a clear separation between UI primitives (shadcn/ui), feature components, and page-level compositions?
- Are data-fetching concerns (SWR, React Query, or server actions) isolated from presentation?
- Are there "god components" doing too much?

**Suggested layering**:
```
components/
  ui/           ← shadcn/ui base (never edit these)
  common/       ← shared across features (Avatar, EmptyState, PageHeader)
  features/
    pipeline/   ← Pipeline-specific components
    funnel/     ← Funnel-specific components
```

#### State management
- Is global state minimal? (Most state should be URL-driven or server-authoritative)
- Are server actions or API routes used for mutations instead of client-side fetch?
- Is optimistic UI implemented for high-frequency actions (status changes)?

#### TypeScript & type safety
- Are Supabase types generated and used (`supabase gen types typescript`)?
- Are API response shapes typed end-to-end?
- Are there `any` types hiding structural problems?

---

### Step 3 — Backend review

#### Supabase schema
- Are tables normalised to at least 3NF for core entities?
- Are foreign keys defined with appropriate cascade rules?
- Are indexes present on high-cardinality filter columns (user_id, status, created_at)?
- Are UUIDs used as PKs? (preferred for multi-region, avoids enumeration)

**Core tables to expect in a job-search funnel product**:
```sql
users (extends auth.users via id FK)
jobs (id, user_id, company, title, status, applied_at, ...)
activities (id, job_id, type, notes, scheduled_at, ...)
funnel_stages (id, label, order, color) -- configurable per user
```

#### Row Level Security (RLS)
- Is RLS enabled on every table that stores user data?
- Are policies using `auth.uid()` correctly?
- Are service-role bypasses documented and scoped to admin-only operations?
- Is there a policy for each operation (SELECT, INSERT, UPDATE, DELETE)?

**Minimum RLS pattern**:
```sql
-- Users can only see their own jobs
create policy "users_own_jobs" on jobs
  for all using (auth.uid() = user_id);
```

#### API routes
- Are API routes used only for operations that can't be done with Supabase client + RLS?
- Are mutations validated server-side (zod or similar)?
- Are errors returned in a consistent shape?
- Are rate limits considered for write endpoints?

#### Scalability ceiling check
Estimate the point at which the current design would need revisiting:

| Concern | Current risk | Threshold |
|---|---|---|
| RLS performance | Low if indexed | >100k rows/user |
| Real-time subscriptions | Medium | >500 concurrent users |
| Vercel serverless cold starts | Low | Spikes >200 req/s |
| Supabase free tier | High | >500 MAU |

---

### Step 4 — Market readiness check

For a B2C SaaS targeting tech professionals, also evaluate:

- **Onboarding**: Can a new user reach their first "aha moment" in under 2 minutes?
- **Empty states**: Are all empty states designed, not just blank pages?
- **Error recovery**: Are errors surfaced with actionable copy, not raw stack traces?
- **Mobile**: Is the product usable on a phone? (Job seekers check on mobile)
- **Auth UX**: Is magic link or Google OAuth available? (Reduces sign-up friction)
- **Pricing readiness**: Is there a clear data model to track usage for future paywalls?

---

## Output format

Produce a structured review report:

```
## Architecture Review — JobFunnel OS — [date]

### Overall verdict
[One paragraph: what's the strategic state of the architecture]

### Frontend
**Strengths**: ...
**Issues**:
1. [Issue] — Impact: High/Med/Low — Recommendation: ...

### Backend
**Strengths**: ...
**Issues**:
1. [Issue] — Impact: High/Med/Low — Recommendation: ...

### Market readiness
**Ready**: ...
**Gaps**: ...

### Priority actions (ordered)
1. [Action] — Why it matters for scale/ship readiness
2. ...
```

---

## Principles this review applies

1. **Server-authoritative first** — UI should reflect server state, not manage its own truth
2. **RLS as the security boundary** — never rely on client-side filtering for data isolation
3. **Route groups over middleware** for auth gating in Next.js App Router
4. **Shallow component trees** — feature components call one data source; no prop drilling beyond 2 levels
5. **Supabase types as the source of truth** — generate types from the schema, don't hand-write them
6. **Design for deletion** — every feature should be removable without cascading breakage
