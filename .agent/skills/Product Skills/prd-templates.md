# JobFunnel OS — PRD Templates

> Four templates for different levels of scope and certainty. Choose the right one before writing a single line. If unsure, start with the Feature Brief and escalate.

| Template | When to use | Effort range |
|---|---|---|
| **Feature Brief** | Pre-decision. "Should we build this?" | < 1 week |
| **One-Page PRD** | Clear scope, simple feature | 1–2 weeks |
| **Agile Epic** | Multi-story feature, sprint-based delivery | 2–4 weeks |
| **Full PRD** | Complex / Phase 2 / Pro-tier features | 3+ weeks |

---

## Shared Header (use on every template)

```
Feature: [Name]
Date: [date]
Status: Draft | In Review | Approved | Building | Done
Phase: 1 — MVP | 2 — CV Versioning | 3 — Integrations
Pillar: Funnel Analytics | Interview Content OS | CV Experimentation | Supporting
Tier: Free | Pro | Both
Effort: XS (0.5w) | S (1w) | M (2w) | L (4w) | XL (6w+)
```

---

## Template 1 — Feature Brief (Lightweight, Pre-Decision)

Use before committing to build. Answers "should we do this?" in one page.

```markdown
# Feature Brief: [Name]

<!-- HEADER -->
Date: [date] | Phase: 1 / 2 / 3 | Pillar: [which one] | Effort: [XS/S/M/L/XL]

---

## Pillar & Phase Check
<!-- Run this before anything else. If it fails, reconsider. -->
- [ ] Reinforces at least one pillar (Funnel Analytics / Interview Content OS / CV Experimentation)
- [ ] Consistent with current phase goals (Phase 1: activation + NPS; Phase 2: CV experimentation)
- [ ] Feasible in stack — no new libraries beyond CLAUDE.md
- [ ] At least one beta user signal or strong ICP inference

## The Hypothesis
We believe that [building this feature]
for [specific user — e.g., "active job seekers with 20+ applications in pipeline"]
will [outcome — activation / conversion / NPS / retention].
We'll know we're right when [measurable signal — e.g., "70%+ of users use it within first session"].

## The Problem
<!-- 2–3 sentences in ICP language. No jargon. -->

## Proposed Approach
<!-- 1 paragraph. How does this fit the existing stack? Any risk? -->

## Out of Scope
<!-- What are we explicitly NOT building here? Name it. -->

## Open Questions
<!-- What needs answering before writing a full PRD? -->
1.
2.

## Go / No-Go
- [ ] Pillar alignment confirmed
- [ ] Beta user validation signal exists (or confidence is High)
- [ ] Stack feasible — no new dependencies
- [ ] Phase-appropriate (not jumping ahead)
```

---

## Template 2 — One-Page PRD

Use for simple features with clear scope. Keeps you moving fast without over-documenting.

```markdown
# One-Page PRD: [Feature Name]

<!-- HEADER -->
Date: [date] | Status: Draft | Phase: 1 / 2 | Pillar: [which one]
Tier: Free / Pro / Both | Effort: [XS/S/M/L/XL] (~X weeks solo)

---

## Problem
<!-- What's broken or missing? 2–3 sentences in ICP language. Verbatim user quote if available. -->
> "[optional customer quote]"

## Users Affected
<!-- Who specifically — not "users". E.g.: "Active job seekers with 20+ applications who use mobile" -->

## Solution
<!-- What we're building. Reference existing components where applicable
     (shadcn/ui Dialog / Sheet / Tabs / Badge, dnd-kit, Recharts, etc.) -->

## Out of Scope
- [Explicitly cut thing 1]
- [Defer to Phase 2: thing 2]

## Why Now
<!-- Why this feature, this sprint? Beta validation signal / conversion blocker / activation gap? -->

## User Flow
```
[Entry point] → [Key action] → [Result / feedback]
```

## Pro Gate
<!-- Is this Free or Pro? -->
<!-- Free tier: what does the user see? (blurred preview, hard limit at X, upgrade CTA) -->
<!-- Pro tier: full feature. Enforce via <ProGate /> at UI AND API route level. -->

## Mobile Spec
<!-- How does this behave at 390px? -->
<!-- Which pattern: bottom sheet / full-screen push / single-column / modal → bottom sheet on mobile -->

## Success Metrics
| Metric | Baseline | Target | How to measure |
|---|---|---|---|
| [Adoption / conversion / usage rate] | — | — | Supabase / TanStack Query |

## Risks
| Risk | Probability | Mitigation |
|---|---|---|
| | | |

## Acceptance Criteria
- [ ] Mobile: 390px viewport passes — no horizontal scroll, min 44×44px tap targets
- [ ] Auth: all Supabase queries scoped to `auth.uid()` via RLS
- [ ] Validation: Zod schema on both client and API route
- [ ] State: TanStack Query mutation with optimistic update + rollback on error
- [ ] Pro gate: enforced at API route AND UI level via `<ProGate />`
- [ ] Error states: include retry CTA, readable at 375px
- [ ] Empty states: include explanation + next-step CTA
- [ ] E2E: Playwright test for critical path
- [ ] [Feature-specific criterion 1]
- [ ] [Feature-specific criterion 2]
```

---

## Template 3 — Agile Epic

Use when a feature spans multiple user stories and needs sprint-by-sprint delivery tracking. Good for Phase 2 work (CV versioning, A/B testing).

```markdown
# Epic: [Epic Name]

<!-- HEADER -->
Epic ID: EPIC-[XXX]
Date: [date] | Status: Discovery | In Progress | Complete
Phase: 1 / 2 | Pillar: [which one] | Tier: Free / Pro / Both
Total Effort: ~[X] solo weeks

---

## Problem Statement
<!-- 2–3 sentences. Why does this epic exist? What user pain does it resolve? -->

## Goals
1. [Outcome 1 with metric]
2. [Outcome 2 with metric]
3. [Outcome 3 with metric]

## Non-Goals (explicitly cut)
- [Thing we are NOT doing in this epic]
- [Thing deferred to a future phase]

## Pillar Alignment
<!-- How does this epic reinforce the three-pillar strategy? -->
- Funnel Analytics: [how / not applicable]
- Interview Content OS: [how / not applicable]
- CV Experimentation: [how / not applicable]

## User Stories

| Story ID | Title | Tier | Priority | Effort | Status |
|---|---|---|---|---|---|
| US-001 | As an active job seeker... | Pro | P0 | S | To Do |
| US-002 | As a Pro user... | Pro | P0 | M | To Do |
| US-003 | As any user... | Free | P1 | S | To Do |

### Story Detail Format
```
Story ID: US-[XXX]
As a [mid-to-senior tech professional actively job hunting in Europe],
I want [capability],
so that [concrete benefit].

Acceptance Criteria:
- [ ] [Specific, testable criterion]
- [ ] Mobile: 390px viewport passes
- [ ] RLS: scoped to auth.uid()
- [ ] Zod: client + API validation
```

## Supabase Schema Changes
<!-- List new tables, columns, or RLS policy changes. Follow patterns:
     UUID PKs, timestamps (created_at / updated_at auto-managed),
     user_id FK enforced via RLS: user_id = auth.uid() -->

| Change | Type | Notes |
|---|---|---|
| [table / column] | Add / Modify / RLS | |

## API Changes
<!-- Follow existing patterns at /api/[resource].
     GET / POST / PATCH / DELETE. Auth required via Supabase session. -->

| Endpoint | Method | Description |
|---|---|---|
| /api/[resource] | GET | |
| /api/[resource]/:id | PATCH | |

## Pro Gate
<!-- Free tier experience (blurred? hard limit? upgrade CTA?). -->
<!-- Pro tier: full feature. Implement via <ProGate />. -->
<!-- Enforce at both API route (check subscription_tier from profiles table) and UI level. -->

## Mobile Spec
<!-- Explicit behavior for each key interaction at 390px. -->
<!-- Checklist: bottom sheet (not modal), single-column grid, 44×44px tap targets,
     no horizontal scroll, bottom nav (not sidebar) on mobile. -->

## Success Metrics
| Metric | Baseline | Target | Measurement |
|---|---|---|---|
| Adoption (% of target users using feature in 30 days) | — | — | |
| Frequency (usage/user/week) | — | — | |
| Conversion lift (free → Pro delta) | — | — | |
| Phase 1 NPS impact | — | >40 | |

## Phase Dependencies
<!-- Does this epic require Phase 1 features to be stable first?
     List specific features, not vague "MVP must be done". -->
- Requires: [specific Phase 1 feature]
- Blocks: [feature that can't start until this ships]

## Sprint Breakdown
| Sprint | Stories | Deliverable |
|---|---|---|
| Sprint 1 | US-001, US-002 | [What ships] |
| Sprint 2 | US-003, US-004 | [What ships] |

## Risks
| Risk | Probability | Impact | Mitigation |
|---|---|---|---|
| New Supabase schema breaks existing RLS | Low | High | Test migration on staging first |
| Mobile layout complexity underestimated | Medium | Medium | Wireframe mobile-first before dev |
| Solo capacity (no buffer) | High | Medium | Cut P2 stories if behind on P0s |

## Epic Acceptance Criteria
- [ ] All P0 stories complete and E2E tested with Playwright
- [ ] Mobile: all key flows pass 390px viewport check
- [ ] RLS: no query accesses data outside auth.uid() scope
- [ ] Lighthouse: >90 on all categories
- [ ] Pro gate: enforced at API + UI level
- [ ] No new libraries introduced without explicit decision
- [ ] [Feature-specific criterion]
```

---

## Template 4 — Full PRD

Use for Phase 2 features, Pro-tier features, or anything taking 3+ solo weeks. This is the source of truth for building.

```markdown
# PRD: [Feature Name]

<!-- HEADER -->
Date: [date] | Status: Draft | Phase: 1 / 2
Pillar: [which one — and specifically how] | Tier: Free / Pro / Both
Effort: ~[X] solo weeks

---

## 1. Executive Summary

**One-liner:** [What this feature does in a single sentence]

**Problem:** [The user frustration this resolves, in ICP language]

**Solution:** [What we're building at a high level]

**Pillar impact:** [How this reinforces Funnel Analytics / Interview Content OS / CV Experimentation]

**Phase 1 impact:** [How this moves activation rate / NPS / free-to-Pro conversion]

**Effort:** [X solo weeks]

---

## 2. Problem Definition

### 2.1 User Problem
- **Who:** [Specific segment — e.g., "Mid-senior PMs in DACH actively applying to 30+ roles"]
- **What:** [The specific gap or frustration]
- **When:** [At what point in the job search does this hurt]
- **Why it matters:** [Cost of not solving — time lost, conversion missed, NPS dragged down]
- **User quote:** "[Verbatim if available]"

### 2.2 Competitive Gap
<!-- How do Teal / Jobscan / Eztrackr / Careerflow handle this?
     Why does their approach fall short for our ICP? -->
| Competitor | Current approach | Why it falls short |
|---|---|---|
| Teal | | |
| Jobscan | | |
| Eztrackr | | |

### 2.3 Business Case
- **Activation impact:** Does this help users reach "pipeline setup + 2 stories" within 7 days?
- **Conversion impact:** Does this drive free → Pro upgrades? Is it a Pro gate feature?
- **NPS impact:** Does this resolve a frustration that hurts NPS?
- **Phase alignment:** Phase 1 (activation + NPS) or Phase 2 (CV experimentation + conversion)?

---

## 3. Solution

### 3.1 Overview
[What we're building. 2–3 sentences. Reference existing components and patterns where applicable.]

### 3.2 In Scope
| Feature | Priority | Notes |
|---|---|---|
| [Feature 1] | P0 | Required for MVP of this PRD |
| [Feature 2] | P1 | Important but not blocking |
| [Feature 3] | P2 | Nice to have, cut if behind |

### 3.3 Out of Scope
<!-- Be explicit. Unarticulated scope creep is the biggest risk for a solo founder. -->
- [Cut thing 1 — why]
- [Defer to Phase 2: thing 2 — why]
- [Won't do: thing 3 — why]

### 3.4 User Flow
```
[Entry point / trigger]
  → [Step 1]
  → [Step 2]
  → [Step 3 — success state]
  → [Error / edge case handling]
```

---

## 4. User Stories & Requirements

### 4.1 User Stories
```
As a [mid-to-senior tech professional actively job hunting in Europe],
I want [capability or action],
so that [concrete benefit].

Acceptance Criteria:
- [ ] [Specific, testable criterion]
- [ ] [Specific, testable criterion]
- [ ] Mobile: behaves correctly at 390px
```

### 4.2 Functional Requirements
| ID | Requirement | Priority | Notes |
|---|---|---|---|
| FR-01 | User can... | P0 | Critical |
| FR-02 | System must... | P0 | Critical |
| FR-03 | Feature should... | P1 | Important |
| FR-04 | Feature could... | P2 | Cut if behind |

### 4.3 Non-Functional Requirements

**Performance**
- API responses: <200ms P95 (Vercel edge + Supabase)
- Page load: Lighthouse >90, Core Web Vitals pass
- No client-side waterfalls — use TanStack Query prefetching where needed

**Security & Auth**
- All routes protected via Supabase session (`createServerClient` / `createBrowserClient`)
- All DB queries scoped to `auth.uid()` via RLS — never bypass with service role on client
- Session persists 14 days; protected routes redirect to `/login`

**Data & Privacy**
- GDPR-compliant: user data scoped, deletable on request
- No PII in URL parameters or query strings
- EU data residency via Supabase project region

**Validation**
- Zod schemas in `/validations/` — shared between client and API route
- Validate on client (UX) AND API route (security) — never only one

**Mobile**
- Minimum: 390px viewport (iPhone 14), no horizontal scroll
- Touch targets: ≥ 44×44px
- Desktop slide-overs (`<Sheet>`) → full-screen push or bottom sheet on mobile
- Centered modals → bottom sheet on mobile (< 640px)
- Grid: `grid-cols-1` default, multi-column at `sm:` and above

**Reliability**
- Optimistic UI updates via TanStack Query `onMutate` + rollback on error
- Error states: always include Retry CTA + readable at 375px
- Empty states: always include explanation + next-step CTA

---

## 5. Design & UX

### 5.1 Design Principles (JobFunnel)
- **Data-forward**: surface numbers and rates, not just status labels
- **Mobile-first**: design for 390px, scale up — not the reverse
- **Progressive disclosure**: free tier users see the value before the gate
- **Frictionless actions**: stage transitions, story creation, CV tagging should feel instant (optimistic UI)

### 5.2 Component Reference
<!-- Use shadcn/ui primitives before building anything custom.
     Extend via cva, not custom CSS files. -->
- Modals: `<Dialog>` (md+) / bottom `<Sheet>` (mobile)
- Slide-overs: `<Sheet>` (desktop only — replace with full-screen push on mobile)
- Cards: `<Card>` with `<Badge>` for stage / CV version labels
- Forms: shadcn `<Form>` + React Hook Form + Zod
- Charts: `<Recharts>` only — no Chart.js, D3 direct, or Nivo
- Drag: `@dnd-kit/core` only — no react-beautiful-dnd

### 5.3 Design Tokens
| Token | Value | Use |
|---|---|---|
| Primary Blue | `#2563EB` | CTAs, links, applied stage |
| Success Green | `#10B981` | Offer stage, success states |
| Warning Amber | `#F59E0B` | Interviewing stage, warnings |
| Error Red | `#EF4444` | Rejected stage, errors |
| Purple | `#8B5CF6` | Screening stage, Pro badge |
| Neutral | `#64748B` | Body text, secondary |

### 5.4 Wireframes / Figma
- [Link to Figma file or Design.md section]
- Key screens: [list]
- Mobile variants: [list — required for every screen]

---

## 6. Technical Specifications

### 6.1 Stack (non-negotiable)
| Layer | Tech | Constraint |
|---|---|---|
| Framework | Next.js 16 App Router | No Next.js 15 APIs |
| UI | React 19 | No React 19 APIs (useActionState, useOptimistic) |
| Language | TypeScript strict | No `any` |
| Styling | Tailwind 3.x | Utility classes only |
| Components | shadcn/ui | Extend via `cva`, not custom CSS |
| Auth / DB | Supabase + `@supabase/ssr` | `createServerClient` for RSC/Routes, `createBrowserClient` for Client |
| Server state | TanStack Query v5 | `useQuery`, `useMutation`, `useInfiniteQuery` |
| Client state | Zustand 5.x | `useUserStore` for profile, tier, prefs |
| Drag & Drop | @dnd-kit/core | Only — no react-beautiful-dnd |
| Charts | Recharts 2.x | Only — no Chart.js, D3 direct, Nivo |
| Validation | Zod 3.x + React Hook Form | Schemas in `/validations/`, shared client + server |

### 6.2 Supabase Schema Changes
<!-- Follow patterns: UUID PKs, timestamps auto-managed, RLS enabled,
     user_id = auth.uid() enforced on all tables -->

**New Tables:**
```sql
-- [table_name]
id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
-- [columns]
created_at TIMESTAMPTZ DEFAULT now(),
updated_at TIMESTAMPTZ DEFAULT now()

-- RLS
ALTER TABLE [table_name] ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can only access own data" ON [table_name]
  FOR ALL USING (auth.uid() = user_id);
```

**Modified Tables:**
| Table | Change | Migration notes |
|---|---|---|
| [table] | Add column [name] | Non-breaking, nullable |

### 6.3 API Design
<!-- Follow /api/[resource] pattern. Auth via Supabase session. RLS handles scoping. -->

| Endpoint | Method | Auth | Request | Response |
|---|---|---|---|---|
| `/api/[resource]` | GET | Required | — | `{ data: [...] }` |
| `/api/[resource]` | POST | Required | Zod-validated body | `{ data: { id, ... } }` |
| `/api/[resource]/:id` | PATCH | Required | Zod-validated partial | `{ data: { ... } }` |
| `/api/[resource]/:id` | DELETE | Required | — | `{ success: true }` |

### 6.4 Subscription Gating
```tsx
// Wrap Pro features with <ProGate />
// Read tier from useUserStore (Zustand) — populated from Supabase session at boot
// Enforce at:
//   → UI level: blurred preview + upgrade CTA for free users
//   → API level: check subscription_tier from profiles table, return 403 if not Pro

<ProGate
  feature="[feature-name]"
  fallback={<UpgradePrompt message="[Why upgrade]" />}
>
  <ProFeatureComponent />
</ProGate>
```

---

## 7. Go-to-Market (for significant features)

### 7.1 Launch Plan
- **Beta / internal**: [who tests first, what we're watching]
- **Beta rollout**: [subset of 50–100 beta users, watch activation signal]
- **Full availability**: [when and to whom]

### 7.2 Pricing Impact
<!-- Does this change what's in Free vs. Pro?
     Does this justify a price increase or new tier? -->

### 7.3 User Communication
- **In-app**: onboarding tooltip, empty state CTA, or upgrade prompt
- **Email** (via Resend): notification template, weekly summary inclusion?
- **Docs**: does this need a help article?

---

## 8. Metrics & Validation

| Metric | Baseline | Target | Measurement | When to check |
|---|---|---|---|---|
| Activation rate | — | >70% | Supabase events | 7 days post-launch |
| Feature adoption | — | >50% of target users in 30d | — | 30 days post-launch |
| Free → Pro conversion | — | 5–10% | — | 30 days post-launch |
| NPS delta | — | +5 pts | In-app survey | 60 days post-launch |
| P95 API response | — | <200ms | Vercel analytics | Week 1 |

**Definition of done for this feature:**
> [Feature] is successful when [specific measurable outcome] within [timeframe].

---

## 9. Risks & Mitigations

| Risk | Probability | Impact | Mitigation |
|---|---|---|---|
| Schema migration breaks existing data | Low | High | Test on Supabase staging branch first |
| Mobile layout breaks on edge devices | Medium | Medium | Test on 390px + 375px + tablet |
| Feature adds friction to activation flow | Medium | High | A/B against current onboarding |
| Solo capacity — feature takes longer than estimated | High | Medium | Cut P2 scope first; P0s are non-negotiable |
| New dependency introduced | Low | Medium | Only allowed with explicit CLAUDE.md update |

---

## 10. Timeline

<!-- Solo founder weeks. No team dependencies. Buffer for unexpected issues. -->

| Milestone | Week | Deliverable |
|---|---|---|
| Design locked | W1 | Wireframes approved (mobile + desktop) |
| Schema + API | W[X] | Supabase migration + route handlers |
| Core UI | W[X] | Feature functional, no polish |
| Mobile pass | W[X] | 390px viewport check passes |
| E2E tests | W[X] | Playwright critical path coverage |
| Beta release | W[X] | Deployed to beta users for signal |
| Metrics review | W[X+2] | Activation / conversion delta assessed |

---

## 11. Open Questions

<!-- Unresolved questions that must be answered before or during build. -->
1. [Question — owner — deadline]
2. [Question — owner — deadline]

---

## 12. Acceptance Criteria (Full Checklist)

### Functional
- [ ] All P0 functional requirements implemented
- [ ] User flow matches spec (happy path + error states)
- [ ] Pro gate enforced at API route AND UI level
- [ ] Empty states: explanation + next-step CTA on all views
- [ ] Error states: Retry CTA on all error cards

### Technical
- [ ] TypeScript strict — zero `any`
- [ ] All Supabase queries scoped to `auth.uid()` via RLS
- [ ] Zod validation on both client and every API route
- [ ] TanStack Query: optimistic update + rollback on error for all mutations
- [ ] No new libraries introduced (or CLAUDE.md explicitly updated)
- [ ] Server Components by default; `use client` only where required

### Mobile
- [ ] 390px viewport: no horizontal scroll
- [ ] All touch targets ≥ 44×44px
- [ ] Modals → bottom sheet on mobile (< 640px)
- [ ] Desktop Sheet panels not rendered on mobile — full-screen push instead
- [ ] Grid: `grid-cols-1` at mobile, multi-column at `sm:` and above

### Quality
- [ ] Lighthouse score >90 on all categories
- [ ] Core Web Vitals pass
- [ ] E2E: Playwright test covering critical path
- [ ] No console errors in production build

### Product
- [ ] Feature-specific success metric has a baseline and target defined
- [ ] Validated with at least 1 beta user signal (or explicitly flagged as unvalidated)
- [ ] Go-to-market communication plan confirmed (in-app, email, or none)
```

---

*Templates maintained at `.agent/skills/Product Skills/prd-templates.md`.
Reference the [jobfunnel-pm-toolkit skill](./jobfunnel-pm-toolkit.md) for RICE scoring before writing any PRD.*
