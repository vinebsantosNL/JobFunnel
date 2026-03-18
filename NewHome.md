# PRD — Dashboard Homepage Redesign
**Route:** `/app/dashboard`
**Version:** 1.0
**Date:** 2026-03-18
**Status:** Draft

---

## 1. Problem Statement

The current dashboard homepage underutilises the most valuable screen in the product. First-time users land on a page that includes a video placeholder with no actionable guidance on where to go next, while returning users get no at-a-glance sense of their search progress. Free users also receive no in-context motivation to upgrade — the value of Pro features (AI, A/B testing, analytics) is never surfaced at the moment of highest intent.

This redesign addresses three jobs simultaneously:

1. **Activation** — guide new users to the 2–3 actions that create the "aha" moment as quickly as possible.
2. **Retention** — give returning users a progress snapshot that makes them feel momentum.
3. **Upgrade conversion** — expose Pro feature value to free users without disrupting the core dashboard experience.

---

## 2. Goals

- Surface the four most relevant job-search stats (Total Applications, Active, Interviews, Stories Created) on first load with no additional navigation.
- Replace the static video placeholder with a dynamic stats block that reflects real user data.
- Add a persistent but non-intrusive upgrade prompt for free-tier users that communicates the three highest-value Pro differentiators.
- Guide new users to their first meaningful actions via a "Getting Started" checklist that self-dismisses once complete.
- Preserve the existing "Next Career Goal" section without layout or data changes.

---

## 3. Non-Goals

- This PRD does not cover changes to the Pipeline (`/app/pipeline`), Analytics (`/app/analytics`), or Stories (`/app/stories`) routes.
- This PRD does not define the upgrade/payment flow — it specifies only the entry point (the upgrade banner CTA).
- This PRD does not change the data model for `job_applications`, `interview_stories`, or `profiles`.
- Mobile-specific layout breakpoints are out of scope for this iteration (desktop-first, mobile-responsive).
- Personalisation or AI-generated dashboard insights are out of scope for this version.

---

## 4. User Stories

**As a new free-tier user** arriving on the dashboard for the first time, I want to know exactly what to do first so that I can make progress without reading documentation.

**As a returning free-tier user**, I want to see how my job search is progressing at a glance so that I feel in control and motivated to continue.

**As a free-tier user considering an upgrade**, I want to understand what Pro unlocks before I'm asked to pay so that the upgrade feels like a natural next step rather than a forced upsell.

**As a Pro user**, I want the upgrade banner to disappear so that it doesn't take up space in my primary workspace.

---

## 5. Requirements

### 5.1 Upgrade Banner (P0)

A full-width sticky banner displayed at the very top of the dashboard page, below the global navigation bar.

**Display condition:** Visible only to free-tier users (`subscription_tier = 'free'` on the user's profile). Hidden entirely for Pro users — no collapsed state, no placeholder, no empty space.

**Content:**

| Element | Spec |
|---|---|
| Left: Feature list | Three pill badges or inline icons + labels: `✦ Unlimited AI` · `✦ Unlimited A/B Testing` · `✦ Unlimited Analytics` |
| Right: CTA button | Primary button — label: `Upgrade to Pro →` — links to `/app/settings/billing` |
| Background | Subtle gradient or solid brand colour (primary blue `#2563EB` or a light `#EFF6FF` tint — consistent with design system) |
| Height | Max 48px. Must not push page content out of viewport on a 1280px screen |
| Dismissal | No dismiss button. Banner persists until upgrade. |

**Acceptance criteria:**

- AC1: Banner renders for `subscription_tier = 'free'` and does not render for `subscription_tier = 'pro'`.
- AC2: All three feature labels are visible without horizontal scroll at 1280px viewport width.
- AC3: Clicking `Upgrade to Pro →` navigates to `/app/settings/billing` without a full page reload.
- AC4: Banner height does not exceed 48px; page content is not obscured.
- AC5: Banner is server-rendered (subscription tier is read from the Supabase session/profile, not fetched client-side post-mount) to prevent layout shift.

---

### 5.2 Stats Block — replacing the video placeholder (P0)

A four-tile summary block replacing the current video/placeholder area. This block occupies the same grid position as the former video element.

**Data source:** Each stat is derived from the authenticated user's `job_applications` and `interview_stories` tables. All queries run via TanStack Query with a `staleTime` of 60 seconds; no real-time subscriptions required for this block.

**Tiles:**

| Tile | Label | Data query |
|---|---|---|
| 1 | Total Applications | `COUNT(*)` from `job_applications` WHERE `user_id = auth.uid()` AND `stage != 'saved'` |
| 2 | Active | `COUNT(*)` WHERE stage IN `('applied', 'screening', 'interviewing')` |
| 3 | Interviews | `COUNT(*)` WHERE stage IN `('interviewing', 'offer')` |
| 4 | Stories Created | `COUNT(*)` from `interview_stories` WHERE `user_id = auth.uid()` |

**Layout:** 2×2 grid or 4-column single row, consistent with existing Tailwind grid classes. Each tile: metric number (large, bold), label below (small, muted).

**Loading state:** Each tile renders a skeleton loader (`animate-pulse` Tailwind) while data is fetching.

**Empty/zero state:** Display `0` — do not hide tiles when count is zero. Zero states are motivating for new users who see what they should be tracking.

**Acceptance criteria:**

- AC1: All four tiles load within 1s on a standard broadband connection (TanStack Query with prefetch on dashboard route entry).
- AC2: Skeleton loaders are visible during the loading state on all four tiles simultaneously.
- AC3: Counts reflect real-time database values as of page load; they do not update automatically (no subscription needed).
- AC4: Stage definitions for "Active" and "Interviews" exactly match the query spec above — confirmed against the `stage` enum in `job_applications`.
- AC5: Stats block is absent from the layout for unauthenticated sessions; redirect to login occurs before render.
- AC6: Clicking any tile navigates to the `/app/pipeline` route (filtered or unfiltered — P1 enhancement to pass filter params, P0 just navigates).

---

### 5.3 Next Career Goal — preserved as-is (P0)

The existing "Next Career Goal" section is retained with no functional or layout changes. Its position in the grid layout must remain consistent relative to the stats block and the Getting Started block.

**Acceptance criteria:**

- AC1: The "Next Career Goal" component renders in the same position as in the current production dashboard.
- AC2: No existing props, data queries, or edit interactions are modified.
- AC3: The section remains visible on both free and Pro tiers.

---

### 5.4 Getting Started Block (P0)

A new right-side panel component visible to all users. The block contains a checklist of three onboarding actions. Each item has a completion state that is persisted in the user's profile.

**Position:** Right column of the dashboard grid (same row as the Stats Block + Next Career Goal). On screens narrower than 1024px, stacks below.

**Checklist items:**

| # | Label | Completion trigger | CTA link |
|---|---|---|---|
| 1 | Add a job to my Job Pipeline | `COUNT(*) >= 1` in `job_applications` for this user | `/app/pipeline` — opens Add Job modal |
| 2 | Create a Story | `COUNT(*) >= 1` in `interview_stories` for this user | `/app/stories` — opens Create Story modal |
| 3 | Get started with my Resume Builder | Never auto-completes (feature not yet released) | Disabled; tooltip: `"Coming soon"` |

**Completion state:**

- Items 1 and 2 auto-complete based on live data (TanStack Query, same query as the Stats Block — reuse cached results, do not issue new queries).
- A completed item renders with a checked circle icon (`✓`), label in muted/strikethrough style, and no active link.
- An incomplete item renders with an open circle, full-opacity label, and an active link/button.
- Item 3 is always rendered as disabled (greyed out, cursor: not-allowed, `(Soon)` tag appended to label) regardless of any data state.

**Block visibility:** The Getting Started block is visible to all users (free and Pro) permanently. It is not dismissible in this version. Hiding logic (e.g., after all completable items are done) is a P2 enhancement.

**Acceptance criteria:**

- AC1: Item 1 renders as complete when `job_applications` count ≥ 1 for the current user.
- AC2: Item 2 renders as complete when `interview_stories` count ≥ 1 for the current user.
- AC3: Item 3 is always rendered in a disabled state with a `(Soon)` label; clicking it produces no navigation and no error.
- AC4: Clicking an incomplete Item 1 navigates to `/app/pipeline`; clicking an incomplete Item 2 navigates to `/app/stories`.
- AC5: Completion state is derived entirely from existing TanStack Query cache (stats block query) — no additional API calls are made for this component.
- AC6: Completed and incomplete states are visually distinct and meet WCAG 2.1 AA contrast ratios.
- AC7: On a 1024px viewport, the Getting Started block stacks below the stats block (not hidden).

---

## 6. Component Inventory

| Component | Type | Notes |
|---|---|---|
| `<UpgradeBanner />` | Client Component | Reads `subscriptionTier` from Zustand user store (populated from Supabase session); conditionally renders. |
| `<DashboardStatsBlock />` | Client Component | 4-tile grid; uses `useDashboardStats()` custom hook wrapping TanStack Query. |
| `<GettingStartedBlock />` | Client Component | Reads completion state from same `useDashboardStats()` hook; no new queries. |
| `<NextCareerGoal />` | Existing component | No changes. |
| `useDashboardStats()` | Custom hook | Single `useQuery` call to `GET /api/dashboard/stats`; returns `{ totalApplications, activeApplications, interviews, storiesCreated }`. |

---

## 7. API

### `GET /api/dashboard/stats`

Returns all four stat counts in a single request. Called once per dashboard mount.

**Response:**

```typescript
{
  totalApplications: number;   // stage != 'saved'
  activeApplications: number;  // stage IN ('applied', 'screening', 'interviewing')
  interviews: number;          // stage IN ('interviewing', 'offer')
  storiesCreated: number;      // from interview_stories
}
```

**Auth:** Requires authenticated Supabase session. Uses `createServerClient` with user session — RLS enforces user_id scope on both tables. No service role usage.

**Error states:** Returns `401` for unauthenticated requests. Returns `500` with error body on unexpected DB failure (TanStack Query will surface error state in the UI).

---

## 8. Layout Specification

```
┌─────────────────────────────────────────────────────────────┐
│  UPGRADE BANNER (free users only, 48px, full width)         │
├──────────────────────────────────────┬──────────────────────┤
│  STATS BLOCK (4 tiles)               │  GETTING STARTED     │
│  Total Apps · Active · Interviews    │  Block (3 items)     │
│  · Stories Created                   │                      │
├──────────────────────────────────────┤                      │
│  NEXT CAREER GOAL                    │                      │
│  (existing component, unchanged)     │                      │
└──────────────────────────────────────┴──────────────────────┘
```

**Grid:** CSS Grid with `grid-cols-[1fr_320px]` on ≥1024px. On <1024px: single column, Getting Started block moves below Next Career Goal.

---

## 9. Data & State

- `subscriptionTier` — read from Zustand `useUserStore`. This store is populated at app boot from the Supabase session/profile. No additional fetch on dashboard mount.
- Dashboard stats — single TanStack Query with key `['dashboard', 'stats', userId]`. `staleTime: 60_000`. Prefetch on route entry via `queryClient.prefetchQuery` in the layout component.
- Getting Started completion — derived from stats query result, no additional state.
- No new Zustand slices required for this feature.

---

## 10. Open Questions

| # | Question | Owner | Default if unresolved |
|---|---|---|---|
| OQ-1 | Should the upgrade banner link directly to `/app/settings/billing` or to a dedicated `/upgrade` marketing-style interstitial page? | Product | Link to `/app/settings/billing` |
| OQ-2 | Should clicking a stats tile pass a filter param to Pipeline (e.g. `?stage=active`) or just navigate to `/app/pipeline` unfiltered? | Product | Unfiltered navigation for P0; filtered for P1 |
| OQ-3 | Should the Getting Started block collapse or hide once both completable items are checked? | Product | No collapse in P0; add as P1 enhancement |
| OQ-4 | Is the Resume Builder link in Getting Started intended to navigate anywhere (e.g. a waitlist page) or remain fully non-interactive? | Product | Fully non-interactive with tooltip in P0 |
| OQ-5 | Should the upgrade banner CTA text be personalised based on which Pro features the user has not yet triggered (e.g. "Try A/B Testing →")? | Product | Static text in P0; smart copy as P1 enhancement |

---

## 11. Timeline

| Milestone | Scope | Target |
|---|---|---|
| P0 complete | Banner, Stats Block, Getting Started Block, Next Career Goal preserved, API endpoint | Sprint N |
| P1 | Stats tiles link with stage filters passed to Pipeline | Sprint N+1 |
| P2 | Getting Started block auto-hides after completion; personalised banner copy | Sprint N+2 |

---

## 12. Dependencies

- Existing `useUserStore` Zustand store with `subscriptionTier` field populated from Supabase profile — confirm this field exists on the store before implementation.
- Supabase `job_applications` and `interview_stories` tables with `user_id` column and RLS policies — both confirmed in Phase 1 PRD.
- `/app/settings/billing` route — must exist before the upgrade banner CTA goes live; coordinate with settings page work.
- `<NextCareerGoal />` component — must be extracted into a standalone importable component if it is currently inlined in the dashboard page.