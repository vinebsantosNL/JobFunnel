# Dashboard Audit — 2026-03-23
## Route: `/app/dashboard`

## Compliance Level
Partial (2/7 dimensions passing)

| Severity | Count |
|---|---|
| Critical | 1 |
| Major | 6 |
| Minor | 3 |
| Token violations | 25+ across 5 components |

## Files Audited
`(dashboard)/dashboard/page.tsx` · `dashboard/DashboardStatsBlock.tsx` · `dashboard/GettingStartedBlock.tsx` · `dashboard/NextCareerGoal.tsx` · `dashboard/CareerGoalModal.tsx` · `dashboard/UpgradeBanner.tsx` · `layout/header.tsx`

---

## Critical

### [C1] Double `<main>` landmark
- **Location:** `layout.tsx` has `<main id="main-content">`, `dashboard/page.tsx` also renders `<main className="flex-1 p-6 overflow-auto">`
- **WCAG:** 1.3.1 Info and Relationships (Level A) — only one `<main>` per page
- **Fix:** Change inner `<main>` in page.tsx to `<div role="region">`
- **Status:** ✅ Fixed Sprint 1

---

## Major

### [M1] GettingStartedBlock — checklist checkboxes have no ARIA role
- **Location:** `GettingStartedBlock.tsx` — `CheckItem` component, `<div>` used as visual checkbox
- **WCAG:** 4.1.2 Name, Role, Value (Level AA)
- **Fix:** Add `role="checkbox"` + `aria-checked={item.done}` + `aria-label={item.label}` to the checkbox div
- **Status:** ✅ Fixed Sprint 1

### [M2] GettingStartedBlock — checklist link items swallow all text with no descriptive label
- **Location:** `GettingStartedBlock.tsx:72` — `<Link href={item.href}>{content}</Link>` wraps label + subtitle + chevron
- **WCAG:** 2.4.6 Headings and Labels (Level AA)
- **Fix:** Add `aria-label={item.label}` to the Link to give a clean label without subtitle noise
- **Status:** ✅ Fixed Sprint 1

### [M3] GettingStartedBlock — progress bar has no ARIA semantics
- **Location:** `GettingStartedBlock.tsx:132` — `<div>` progress track + fill
- **WCAG:** 1.3.1 (Level A)
- **Fix:** Add `role="progressbar" aria-valuenow={pct} aria-valuemin={0} aria-valuemax={100} aria-label="Getting started progress"`
- **Status:** ✅ Fixed Sprint 1

### [M4] NextCareerGoal — "Edit Goals" button below minimum touch target
- **Location:** `NextCareerGoal.tsx:64` — text-only button, no padding guaranteeing 44×44px
- **WCAG:** 2.5.5 Target Size (Level AA)
- **Fix:** Add `min-h-[44px] px-3 rounded-lg` to ensure adequate touch target
- **Status:** ✅ Fixed Sprint 1

### [M5] DashboardStatsBlock — animated count-up announces intermediate values to screen readers
- **Location:** `DashboardStatsBlock.tsx` — `useCountUp` hook animates 0→n
- **WCAG:** 4.1.3 Status Messages (Level AA)
- **Fix:** Wrap animated number in `<span aria-live="polite" aria-atomic="true">` and only announce final value
- **Status:** ✅ Fixed Sprint 1

### [M6] Decorative SVG chevrons and checkmarks not hidden from AT
- **Location:** `GettingStartedBlock.tsx` — chevron SVG line 64, checkmark SVG line 30
- **WCAG:** 1.1.1 Non-text Content (Level A)
- **Fix:** Add `aria-hidden="true"` to both SVGs
- **Status:** ✅ Fixed Sprint 1

---

## Minor

### [m1] Header — no `role="banner"` on `<header>` element
- **Location:** `header.tsx:11`
- `<header>` implicitly has `role="banner"` when it's a direct child of `<body>` — but here it's nested inside the layout shell. The implicit role does NOT apply in nested contexts.
- **Fix:** Add explicit `role="banner"` to `<header>`
- **Status:** ✅ Fixed Sprint 1

### [m2] UpgradeBanner — arrow character in link text read aloud
- **Location:** `UpgradeBanner.tsx:24` — "Upgrade to Pro →"
- **Fix:** Wrap arrow in `<span aria-hidden="true">` or add `aria-label="Upgrade to Pro"` on the link
- **Status:** ✅ Fixed Sprint 1

### [m3] CareerGoalModal — native `<input type="month">` inconsistent across browsers/AT
- **Location:** `CareerGoalModal.tsx:186`
- **Impact:** Low — acceptable for MVP
- **Status:** 🔵 Deferred (Phase 2 — replace with custom DatePicker)

---

## Token Violations

All five dashboard components use raw Tailwind instead of CSS custom properties. Applies equally to dark mode readiness.

| Raw value | Token replacement | Affected components |
|---|---|---|
| `bg-white` | `bg-card` | Header, StatTile, NextCareerGoal, GettingStartedBlock |
| `border-gray-200` | `border-border` | All five |
| `border-gray-100` | `border-border` | GettingStartedBlock, NextCareerGoal |
| `text-gray-900` | `text-foreground` | All five |
| `text-gray-500` | `text-muted-foreground` | All five |
| `text-gray-400` | `text-muted-foreground` | Header, StatTile |
| `text-gray-700` | `text-foreground/80` | Header hover |
| `hover:bg-gray-100` | `hover:bg-accent` | Header back link |
| `bg-blue-600` / `text-blue-600` | `bg-primary` / `text-primary` | GettingStartedBlock checkbox, StatTile hover, NextCareerGoal |
| `hover:text-blue-700` | `hover:text-primary/90` | NextCareerGoal |
| `bg-gray-100` (skeletons) | `bg-muted` | StatTile, GettingStartedBlock |
| `bg-gray-100 border-gray-200` (priority badge) | `bg-muted border-border` | GettingStartedBlock |

---

## Missing Component Specs

| Component | File | Spec |
|---|---|---|
| `Header` | `layout/header.tsx` | ❌ None → to create |
| `StatTile` | `dashboard/DashboardStatsBlock.tsx` | ❌ None → to create |
| `GettingStartedBlock` | `dashboard/GettingStartedBlock.tsx` | ❌ None → to create |
| `NextCareerGoal` | `dashboard/NextCareerGoal.tsx` | ❌ None → to create |
| `UpgradeBanner` | `dashboard/UpgradeBanner.tsx` | ❌ None → to create |

---

## Passing ✅

| Check | Status |
|---|---|
| `CareerGoalModal` uses shadcn/ui Dialog — token-aligned base | ✅ |
| `CareerGoalModal` uses `react-hook-form` + Zod | ✅ |
| `DashboardStatsBlock` skeleton loading states present | ✅ |
| `GettingStartedBlock` skeleton loading state present | ✅ |
| `GettingStartedBlock` Framer Motion stagger animation | ✅ |
| `DashboardStatsBlock` grid `grid-cols-2 sm:grid-cols-4` mobile-first | ✅ |
| `Header` back link has `aria-label="Back"` | ✅ |

---

## Remediation Roadmap

### Sprint 1 — Accessibility (applied immediately)
- [x] Fix double `<main>` landmark (C1)
- [x] Add ARIA roles to checklist checkboxes (M1)
- [x] Add `aria-label` to checklist links (M2)
- [x] Add `role="progressbar"` to progress bar (M3)
- [x] Fix "Edit Goals" touch target (M4)
- [x] Add `aria-hidden` to decorative SVGs (M6)
- [x] Add `role="banner"` to Header (m1)
- [x] Fix arrow char in UpgradeBanner CTA (m2)

### Sprint 2 — Token migration (applied immediately)
- [x] Migrate all 5 components from raw Tailwind → CSS custom properties

### Sprint 3 — Enhancement
- [ ] Replace `<input type="month">` with shadcn/ui DatePicker in CareerGoalModal (m3)
- [ ] Add `prefers-reduced-motion` support to GettingStartedBlock stagger animation
