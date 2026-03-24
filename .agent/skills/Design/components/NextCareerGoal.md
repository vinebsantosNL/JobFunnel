# NextCareerGoal — Component Spec

**Version:** 1.0.0 · **Created:** 2026-03-23
**Files:** `src/components/dashboard/NextCareerGoal.tsx` · `src/components/dashboard/CareerGoalModal.tsx`
**Context:** App — Dashboard page, between the stats grid and the Getting Started block
**Status:** ✅ Sprint 1 + Sprint 2 complete

---

## Overview

Personalised greeting card + career goal summary displayed on the Dashboard. Shows the user's first name, a motivational subtitle, and three goal metrics (Target Title, Target Date, Target Salary). An "Edit Goals" button opens `CareerGoalModal` as a Dialog for in-place editing. Data is fetched via TanStack Query with server-side `initialData` for zero-layout-shift on first render.

---

## Anatomy

```
<div> bg-card, rounded-xl, border-border
  ├── Header row (items-start justify-between)
  │     ├── Left: greeting h3 + subtitle p
  │     └── Right: "Edit Goals" button (min-h-[44px] touch-safe)
  └── Goal grid (grid-cols-1 sm:grid-cols-3 gap-4, pt-5 mt-5 border-t border-border)
        ├── Target Title  — label + value (text-primary)
        ├── Target Date   — label + value (text-foreground)
        └── Target Salary — label + value (text-foreground)
```

CareerGoalModal (rendered outside the card via React fragment):
```
<Dialog>
  <DialogContent size="md">
    ├── DialogHeader: "Edit Career Goal"
    └── <form> space-y-5
          ├── Target Role (shadcn Select, grouped by discipline)
          ├── Target Date (<input type="month"> — deferred: replace with DatePicker)
          ├── Target Salary Range (shadcn Select, €50k buckets)
          └── DialogFooter: Cancel (ghost) + Save Goal (primary, loading/saved states)
```

---

## Props

### NextCareerGoal

| Prop | Type | Required | Description |
|---|---|---|---|
| `initialProfile` | `{ full_name?, target_role?, target_date?, target_salary_min?, target_salary_max?, target_salary_currency? }` | ✅ | Server-side snapshot passed from RSC. Used as `initialData` for TanStack Query to avoid flash. |

### CareerGoalModal

| Prop | Type | Required | Description |
|---|---|---|---|
| `open` | `boolean` | ✅ | Controls dialog visibility |
| `onOpenChange` | `(open: boolean) => void` | ✅ | Called on close / backdrop click |
| `initialValues` | `{ target_role?, target_date?, target_salary_min?, target_salary_max? }` | ✗ | Pre-fills form selects |

---

## Greeting Logic

```ts
const firstName = profile?.full_name?.split(' ')[0] ?? null
const greeting  = firstName ? `Hi, ${firstName}` : 'Welcome back'
```

Degrades gracefully when `full_name` is null — shows "Welcome back" instead.

---

## Goal Display States

| Field | Populated | Empty |
|---|---|---|
| Target Title | Role string (`text-primary`) | `—` |
| Target Date | `"Month Year"` (en-GB locale) | `—` |
| Target Salary | `€75k – €100k` or `€200k+` | `—` |

---

## Salary Format Helper

```ts
function formatSalary(min, max, currency): string {
  // Returns "€75k – €100k" (range) or "€200k+" (open-ended) or "—" (unset)
  const sym = currency === 'EUR' ? '€' : currency ?? '€'
  const fmtK = (n) => `${sym}${(n / 1000).toFixed(0)}k`
  if (min === null || min === undefined) return '—'
  if (!max) return `${fmtK(min)}+`
  return `${fmtK(min)} – ${fmtK(max)}`
}
```

---

## Data Flow

```
DashboardPage (RSC)
  └── fetches profile from Supabase
  └── passes initialProfile prop
        ↓
NextCareerGoal ('use client')
  └── useQuery({ queryKey: ['career-goal'], initialData: initialProfile, staleTime: 60_000 })
  └── renders greeting + goal grid
  └── "Edit Goals" → setModalOpen(true)
        ↓
CareerGoalModal
  └── react-hook-form + zod + shadcn Select
  └── PATCH /api/profile
  └── onSuccess: invalidate ['profile'] + ['career-goal']
  └── 1s success state → auto-close
```

---

## CareerGoalModal — Form Schema

```ts
const careerGoalSchema = z.object({
  target_role: z.string().optional(),
  target_date: z.string().optional(),   // "YYYY-MM" — appended "-01" on submit
  salary_key:  z.string().optional(),   // composite key "min-max" decoded on submit
})
```

Salary is stored as `target_salary_min` + `target_salary_max` (two numeric columns). The modal encodes/decodes via `salaryKey(min, max) → "50000-75000"` to work with a single `<Select>`.

---

## Save Button States

| State | Visual |
|---|---|
| Idle | "Save Goal" |
| Saving | `<Loader2 animate-spin>` + "Saving…" |
| Saved (1s) | `<Check>` + "Saved!" |
| Auto-close | Dialog closes after 1000ms |

---

## Deferred Enhancements

- `<input type="month">` → replace with shadcn/ui DatePicker for consistent cross-browser styling
- `text-gray-500` on date helper text → migrate to `text-muted-foreground` (Sprint 3 token gap in CareerGoalModal)

---

## Accessibility

| Requirement | Status |
|---|---|
| Touch target on "Edit Goals": `min-h-[44px]` | ✅ |
| Dialog from shadcn/ui: focus-trapped, `role="dialog"`, `aria-labelledby` | ✅ (shadcn handles) |
| Form labels associated via `htmlFor` / `Label` | ✅ |
| Error toasts via sonner: announced to AT via `role="status"` | ✅ (sonner handles) |
| `aria-live` on greeting (updates after query refetch) | ⚠️ Not implemented — low priority (name rarely changes) |

---

## Token Mapping

| Element | Token |
|---|---|
| Card bg | `bg-card` |
| Card border | `border-border` |
| Goal grid divider | `border-border` |
| Greeting title | `text-foreground` |
| Subtitle | `text-muted-foreground` |
| Goal labels | `text-muted-foreground` |
| Edit Goals button | `text-primary` |
| Edit Goals hover | `hover:text-primary/90` |
| Target Title value | `text-primary` (highlights goal role as actionable) |
| Target Date value | `text-foreground` |
| Target Salary value | `text-foreground` |

---

## Changelog

| Version | Date | Changes |
|---|---|---|
| 1.0.0 | 2026-03-23 | Initial spec. Touch target fix on Edit Goals (min-h-[44px]), full token migration, data flow diagram. |
