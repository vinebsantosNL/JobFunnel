

# CLAUDE.md — JobFunnel OS

You are building JobFunnel OS, a B2C SaaS product that helps tech professionals in Europe run their job search like a product funnel. This file is your source of truth for understanding the product, the market, the user, and the engineering decisions behind every feature you build.

---

## About the Founder

Vinicius Barbosa is a Product Manager building JobFunnel as a solo founder using Claude Code. He thinks in funnels, metrics, and user outcomes — not just features. When he asks you to build something, there is always a "why" behind it tied to conversion, retention, or differentiation. Ask yourself what that "why" is before writing code.

Vinicius operates as Senior product manager, designer, and eng lead simultaneously. He will give you PRDs, wireframes, and business context — your job is to translate those into production-quality code that respects the architectural decisions already made. Do not introduce new libraries, patterns, or abstractions unless he explicitly asks for them.

---

## What JobFunnel OS Is

JobFunnel is NOT a generic job tracker. There are several of those already (Teal, Jobscan, Eztrackr, Careerflow). JobFunnel's differentiation is built on three pillars that no competitor covers together:

**1. Funnel Analytics Depth** — Competitors track stages and show basic stats, but none treat the job search as a measurable growth funnel with stage-by-stage conversion rates, time-in-stage analysis, and trend lines. JobFunnel shows users things like "Your Applied-to-Screening rate is 12% vs 20% industry avg — likely a CV or positioning issue."

**2. Interview Content OS** — Competitors handle logistics (dates, reminders) and AI-generate content (cover letters, answers). None offer a versioned story bank using STAR format, tagged by competency, where users can link outcomes to specific answers and iterate over time.

**3. Outcome-Linked CV Experimentation** — No tool lets users A/B test CV versions and track which version correlates with higher screening and interview rates. This is JobFunnel's clearest unique value and the primary driver of Pro tier conversion.

When building features, always ask: does this reinforce one of these three pillars? If it doesn't, it might not belong in the product.

---

## Who Uses It

**Primary ICP: "Serious Tech Career Builder"**

Mid-to-senior tech professionals (software engineers, product managers, data scientists, ML engineers, UX/product designers) with 1–15 years of experience, based in Europe (initially DACH + Benelux, then broader EU), actively job hunting or planning to move within 12 months.

These users already think in metrics. They use Jira, GitHub, Notion, Amplitude, and LeetCode daily. The phrase "optimize your job search funnel" resonates with them naturally — it maps to how they already think about product work.

They are willing to invest €15–30/month during an active search. They have experienced the frustration of radio silence, ghosting, and failed interviews with no data to diagnose what went wrong.

**Secondary segments**: Elite bootcamp graduates (Ironhack, Le Wagon, GA) preparing for competitive recruiting; senior ICs/managers seeking leadership roles with multi-round, complex searches; cross-border relocators moving within EU (Spain to NL, Poland to Germany) who need guidance on local norms, salaries, and visa complexity.

**Key behavioral insight**: These users run 20–60+ applications per search cycle across multiple European markets. They need a system, not a spreadsheet.

---

## Market Context

The European tech talent market has 10M+ ICT specialists, with 3–4 million changing jobs annually. Existing tools (Teal, Jobscan, Eztrackr) are US-centric — no EU board focus, no multi-language support, no cross-border awareness. This is a real gap.

Revenue wedge TAM: €4M–€30M annually in the initial European niche. Future expansion beyond tech to broader white-collar EU professionals pushes the addressable market to €100M+.

Key market drivers you should understand when building features:
- Cross-border EU hiring means candidates search across multiple countries, languages, and job boards simultaneously
- Remote/hybrid work makes multi-country applications the norm, not the exception
- 57% of job applicants abandon applications due to complexity; 6 in 10 applications go unseen by humans — this is the frustration JobFunnel channels into product value
- Data-driven culture in tech: users already think in funnels and metrics, so the product language feels native to them

---

## Competitive Positioning

When you build features, keep in mind what competitors do and where we deliberately differ:

**Teal** — Strong Chrome extension and Kanban tracker, but analytics are lightweight ("insights" not real funnel analytics), no interview content OS, no experimentation, US-centric.

**Jobscan** — Best-in-class ATS matching and resume scoring, but focused on per-job match score not end-to-end funnel conversion. No pipeline, no story bank, not Europe-first.

**Eztrackr** — Visual Kanban with AI content generation (cover letters, answers), but statistics are descriptive not analytical, AI is generative not experimental, no dedicated interview content OS, not Europe-first.

**Careerflow** — Tracker + AI CV/letter generation, but no Europe focus, limited analytics depth, no interview content management.

Our moat: the combination of deep funnel analytics + interview content versioning + outcome-linked CV experimentation. No competitor has all three.

---

## Revenue Model

| Tier | Price | What it unlocks |
|---|---|---|
| Free | €0 | 5 active applications, basic tracking, no analytics |
| Pro | €15/month | Unlimited pipeline, full funnel analytics, interview vault, CV versioning, A/B testing, AI integrated |
| Team | €40+/month | Future: group benchmarking, coaching, integrations |

Unit economics targets: ARPU €60–90 per search cycle (4–6 months), CAC <€20, LTV:CAC >3:1, payback <3 months. Churn is expected to be 10–20% monthly because users complete their search and leave — but 40–60% reactivation when they job hunt again in 2–3 years.

When building free tier limits and upgrade prompts, the goal is to let users experience enough value to understand what they're missing. Free tier should feel useful but incomplete — not crippled.

---

## Tech Stack — Non-Negotiable

| Layer | Tech | Version | Notes |
|---|---|---|---|
| Framework | Next.js (App Router) | 16.x | Do NOT use unreleased/canary Next.js APIs |
| UI | React | 19.x | Stable APIs only — avoid experimental/canary-only features |
| Language | TypeScript | 5.x | Strict mode, no `any` |
| Styling | Tailwind CSS | 3.x | Utility classes only, no CSS-in-JS |
| Components | shadcn/ui | latest | Extend via `cva`, not custom CSS files. Use before building anything custom |
| Auth/DB/Storage | Supabase | latest | `@supabase/ssr` for auth. Magic link primary, OAuth secondary. Never use NextAuth, Auth0, or Clerk |
| Server State | TanStack Query | v5 | For all async data |
| Client State | Zustand | 5.x | `useUserStore` for profile, subscription tier, prefs. Use `create` from 'zustand' |
| Drag & Drop | @dnd-kit/core | latest | Only DnD library. Do not use react-beautiful-dnd |
| Charts | Recharts | 2.x | Only chart library. Do not use Chart.js, D3 directly, or Nivo |
| Validation | Zod + React Hook Form | 3.x | Validate on both client and API route |
| Email | Resend | latest | Magic links, notifications, weekly summaries |
| Unit/Component Tests | Vitest + React Testing Library | latest | Not Jest |
| E2E Tests | Playwright | latest | All critical paths |
| Deploy | Vercel | — | Edge functions, CDN |

**Do NOT introduce**: Redux, SWR, Prisma, Drizzle, MUI, Chakra, Mantine, Storybook, CSS-in-JS (emotion, styled-components), PWA/service workers, micro-frontends, monorepo tooling (Nx, Turbo, Lerna).

---

## Architecture Decisions

### Auth
Supabase magic link (passwordless) as primary, Google/GitHub OAuth as secondary. Use `@supabase/ssr`:
- `createServerClient` for Server Components and Route Handlers
- `createBrowserClient` for Client Components
- Session persists 14 days. Protected routes redirect to `/login`
- Never use service role key on the client

### Data Access
All tables enforce Row Level Security via `user_id = auth.uid()`. Every query is user-scoped. Never fetch data across users. Never bypass RLS with service role on the client.

### State
- Server state: TanStack Query v5 (`useQuery`, `useMutation`, `useInfiniteQuery`)
- Client/UI state: Zustand 5.x (`useUserStore` for profile, subscription tier, active filters)
- Context API: only for narrow, co-located state (e.g., modal open state within a feature)
- Optimistic updates: TanStack Query `onMutate` + rollback on error
- Real-time: Supabase channels; invalidate TanStack Query cache on channel events

### Subscription Gating
Read tier from `useUserStore` (Zustand, populated from Supabase session at app boot). Gate Pro features with a `<ProGate />` wrapper component. Never hard-code tier logic inline. Enforce at both API-level (check `subscription_tier` from `profiles` table) and UI-level (blurred/locked previews with upgrade CTA).

### Forms & Validation
Zod schemas paired with React Hook Form. Validate on both client side (for UX) and API route (for security). Define schemas in `/validations/` directory and share between client and server.

---

## Frontend Standards

Before making any frontend change (components, pages, styling, layout), follow the guidelines in `FrondDeveloper.md`. Key rules:

- **Stack versions are non-negotiable**: Next.js 16.x, React 19, TypeScript 5.x, Tailwind 3.x, TanStack Query v5
- **Do NOT use** unreleased/canary APIs, MUI, Chakra, Prisma, NextAuth
- **Component library**: shadcn/ui primitives first; extend with Tailwind `cva` — never custom CSS files
- **State**: TanStack Query v5 for server state; Zustand 5.x for global UI state
- **Auth**: Supabase only via `@supabase/ssr`; always scope queries to `auth.uid()` via RLS
- **Forms**: Zod 3.x + React Hook Form; validate on both client and API route
- **Charts**: Recharts 2.x only
- **Drag-and-drop**: @dnd-kit/core only
- **Animation**: Framer Motion for complex; Tailwind `transition` for simple hover/focus
- **Tests**: Vitest + React Testing Library (not Jest)
- **Design tokens**: primary `#2563EB`, success `#10B981`, warning `#F59E0B`, error `#EF4444`, purple `#8B5CF6`

Full guidelines: see `FrondDeveloper.md`

---

## Design System

- **Font**: Inter (Google Fonts)
- **Component base**: shadcn/ui primitives, extended via `cva` (class-variance-authority)
- **Colors**: Primary Blue `#2563EB` · Success Green `#10B981` · Warning Amber `#F59E0B` · Error Red `#EF4444` · Purple `#8B5CF6` · Neutral Gray `#64748B` · Background `#FAFAFA` · Card `#FFFFFF`
- **Typography**: H1 36/40 bold · H2 24/32 semibold · H3 18/28 semibold · Body 14/20 regular · Small 12/16 regular
- **Spacing**: Tailwind default scale (4px base)
- **Breakpoints**: Mobile <640px (stacked, bottom nav) · Tablet 640–1024px (collapsible sidebar) · Desktop >1024px (full sidebar, full Kanban)
- **Dark mode**: Tailwind `dark:` variant via `next-themes`
- **Animations**: Framer Motion for page transitions and complex animations; Tailwind `transition` for simple hover/focus states

### Key shadcn/ui Components Used
Button, Input, Textarea, Select, Checkbox, RadioGroup, Dialog (modals), Sheet (slide-overs), Popover, Tooltip, Card, Badge, Avatar, Table, Tabs, Accordion, Toast, AlertDialog, Form (react-hook-form integration), Calendar, DatePicker

---

## Database Schema

All tables: UUID primary keys, timestamps auto-managed by Supabase, RLS enabled enforcing `user_id = auth.uid()`.

**profiles**: `id` (PK, linked to Supabase Auth) · `email` · `full_name` · `role` (software_engineer | product_manager | data_scientist | other) · `years_experience` · `location_country` · `target_countries[]` · `subscription_tier` (free | pro) · `notification_prefs` (JSONB) · `created_at` · `updated_at`

**job_applications**: `id` · `user_id` (FK) · `company_name` · `job_title` · `job_url?` · `location?` · `salary_min?` · `salary_max?` · `salary_currency?` · `stage` (saved | applied | screening | interviewing | offer | rejected | withdrawn) · `priority` (low | medium | high) · `notes?` · `applied_at?` · `stage_updated_at` · `cv_version_id?` (FK, Phase 2) · `created_at` · `updated_at`

**stage_history**: `id` · `job_id` (FK) · `from_stage?` · `to_stage` · `transitioned_at`

**interview_stories**: `id` · `user_id` (FK) · `title` · `situation?` · `task?` · `action?` · `result?` · `full_content?` · `competencies[]` · `is_favorite` · `created_at` · `updated_at`

**cv_versions** (Phase 2): `id` · `user_id` (FK) · `name` (max 100) · `description?` · `tags[]` · `is_default` · `is_archived` · `file_url?` (P1) · `file_type?` (P1) · `created_at` · `updated_at`

---

## Pipeline Stages

| Stage | Color | Meaning |
|---|---|---|
| saved | Gray | Bookmarked, not yet applied |
| applied | Blue `#2563EB` | Application submitted |
| screening | Purple `#8B5CF6` | Initial recruiter/HR contact |
| interviewing | Amber `#F59E0B` | Active interview process |
| offer | Green `#10B981` | Received offer |
| rejected | Red muted `#EF4444` | Application rejected |
| withdrawn | Gray `#64748B` | User withdrew |

Use this exact enum for all stage-related UI. Stage transitions are logged to `stage_history`. Drag-and-drop via `@dnd-kit/core` only.

---

## Route Map

| Route | What it does |
|---|---|
| `/` | Public landing page with value prop |
| `/login` | Magic link + OAuth authentication |
| `/signup` | Registration flow |
| `/app/dashboard` | Stats overview, Getting Started checklist, Next Career Goal |
| `/app/pipeline` | Kanban board with drag-and-drop stages |
| `/app/analytics` | Funnel metrics dashboard |
| `/app/analytics/cv-testing` | CV A/B comparison (Phase 2, Pro only) |
| `/app/stories` | Interview story library (STAR format) |
| `/app/cv-versions` | CV version management (Phase 2) |
| `/app/settings` | Profile, notifications, billing |

---

## API Endpoints

**Auth**: `POST /api/auth/signup` · `/login` · `/logout` · `GET /api/auth/callback` · `/me`

**Jobs**: `GET /api/jobs` · `POST /api/jobs` · `GET|PATCH|DELETE /api/jobs/:id` · `POST /api/jobs/:id/stage`

**Analytics**: `GET /api/analytics/funnel` · `/timeline` · `/stage-time` · `/cv-comparison` (Phase 2)

**Stories**: `GET /api/stories` · `POST /api/stories` · `GET|PATCH|DELETE /api/stories/:id`

**CV Versions** (Phase 2): `GET /api/cv-versions` · `POST /api/cv-versions` · `GET|PATCH|DELETE /api/cv-versions/:id`

**Dashboard**: `GET /api/dashboard/stats` → `{ totalApplications, activeApplications, interviews, storiesCreated }`

All endpoints require authentication via Supabase session. RLS handles user scoping.

---

## Development Phases

**Phase 1 — MVP** (6-8 weeks): Auth, Pipeline Kanban, Analytics dashboard, Story Library, Email notifications (Resend), free tier limits. Goal: validate core value with 50-100 beta users. Beta success = >70% complete pipeline setup + at least 2 stories, NPS >40, 5-10% free-to-paid conversion.

**Phase 2** (4-6 weeks post-MVP): CV Versioning & A/B Testing, Dashboard Homepage Redesign, Chrome Extension. Goal: ship the primary differentiation feature that drives Pro conversion.

**Phase 3** (Future): EU board integrations (StepStone, EURES, Totaljobs, Xing), multi-language CV support, statistical significance for A/B tests, AI-powered insights, benchmarking dashboard, team features.

---

## Phase 2 Domain Rules (CV Versioning)

- CV version is editable only in `saved`/`applied` stages; locked once application reaches `screening` (API returns 422 if violated)
- Free tier: 2 CV versions (soft limit, upgrade prompt); Pro: unlimited
- ApplicationCard on Kanban shows CV version badge (truncated ~15 chars)
- FilterBar supports CV version multi-select composing with existing filters via AND
- A/B dashboard: "Low confidence" badge for versions with <10 applications
- Analytics query always LEFT JOINs from `job_applications` to `cv_versions` (not reverse) so NULL `cv_version_id` rows appear as "Untagged"

---

## Mobile Experience — Non-Negotiable

JobFunnel is used heavily on mobile. Every feature must be reviewed for mobile before it is considered done. Treat mobile as a first-class target, not an afterthought.

**Rules to follow on every feature:**
- **Panels and drawers**: Desktop slide-over panels (`<Sheet>`) must NOT render on mobile. At `<640px`, replace with a full-screen push or bottom sheet.
- **Modals and dialogs**: Use a responsive pattern — centered modal on `md:` and above, bottom sheet sliding up from the bottom on mobile. Never render a floating centered dialog on a small screen.
- **Tap targets**: All interactive elements (buttons, links, icon actions) must have a minimum touch area of 44×44px. Small text-only links in card footers are not acceptable on mobile.
- **Error states**: Never display raw error text alone. Always include a `Retry` button or a recovery CTA. Error cards must be readable on a 375px screen.
- **Empty states**: Must include a one-line explanation and a next-step CTA. No blank white space on mobile.
- **Grid layouts**: Default to single-column (`grid-cols-1`) on mobile. Multi-column layouts only at `sm:` breakpoint and above.
- **Horizontal overflow**: No component may cause horizontal scroll on screens <640px.

Before shipping any UI change, mentally walk through the feature on a 390px wide screen (iPhone 14 viewport). If it breaks, fix it first.

---

## Coding Standards

- TypeScript strict mode, zero `any`
- Prefer Server Components by default; add `'use client'` only when needed
- Always scope Supabase queries to `auth.uid()` via RLS
- Validate all inputs with Zod on both client and API route
- Use shadcn/ui primitives before building custom components
- Lighthouse score >90 on all categories; Core Web Vitals must pass
- All critical paths need Playwright E2E tests
- File names: kebab-case for files, PascalCase for components
- Optimistic UI updates with rollback on error for all mutations

---

## Environment Variables

```
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=
RESEND_API_KEY=
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

---

## Competency Tags (Story Library)

Leadership: Team Management, Decision Making, Mentoring, Conflict Resolution
Technical: Problem Solving, System Design, Technical Excellence, Innovation
Collaboration: Cross-functional Work, Stakeholder Management, Communication
Execution: Project Delivery, Prioritization, Working Under Pressure, Adaptability
Growth: Learning Agility, Feedback Reception, Self-improvement

---

## Branch & Deployment Strategy

JobFunnel uses a two-branch pipeline to protect customers from regressions.

```
feature/your-change  →  staging  →  main (production)
```

| Branch | Purpose | Vercel URL |
|---|---|---|
| `staging` | Validate design and behaviour before release | `{project}-git-staging-{user}.vercel.app` (auto-assigned by Vercel) |
| `main` | Production — live customers | Custom domain |

**Rules:**
- All work is done on short-lived feature branches, then merged into `staging` first.
- Only after validating on staging should code be merged into `main` for production.
- Never push directly to `main` without going through `staging`.
- Cron jobs and email notifications only run on production (`main`). Staging is safe to test freely.
- **All coding standards defined in this file apply equally to `staging` and `main`.** There is no relaxed mode for staging. TypeScript strict mode, Zod validation, RLS scoping, shadcn/ui-first, no banned libraries — all rules hold on every branch.

**CI (GitHub Actions)** runs automatically on every push to `staging` and every PR to `main`:
- Type check (`tsc --noEmit`)
- Lint (`eslint`)
- Build (requires `STAGING_*` secrets set in GitHub → Settings → Secrets)

**GitHub branch protection to configure (once):**
- `main`: Require PR from `staging`, require CI to pass, no direct pushes.
- `staging`: Require CI to pass before merging feature branches.

---

## Pre-Push Quality Gate — MANDATORY

Before merging `staging` → `main` (i.e. before any code reaches production), you MUST complete both steps below in order. Do not skip either, even if the change looks small.

**Step 1 — Code Review:** Run the @code-reviewer skill against all changed files. Address any critical issues it flags before proceeding.

**Step 2 — QA Pass:** Run the @qa-engineer skill to validate the feature or fix end-to-end. Address any bugs or regressions it identifies before proceeding.

Only after both steps pass cleanly should you merge to `main`. Pushing to `staging` is encouraged freely — that is the validation step. The gate applies at the `staging → main` promotion only.

## Automated Hooks

After every successful `vercel deploy` or `vercel --prod`, always use the @qa-engineer skill to run a QA pass before marking the task done. Do not skip this even if the deploy looks clean.

To trigger a manual architecture review at any time, use the @architecture-patterns skill.


