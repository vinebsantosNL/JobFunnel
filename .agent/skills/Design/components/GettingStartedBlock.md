# GettingStartedBlock — Component Spec

**Version:** 1.0.0 · **Created:** 2026-03-23
**File:** `src/components/dashboard/GettingStartedBlock.tsx`
**Context:** App — Dashboard page, below the stats grid
**Status:** ✅ Sprint 1 + Sprint 2 complete

---

## Overview

Onboarding checklist shown on the Dashboard. Tracks three completable actions (first job, first story, first CV version) and one future item. Shows a progress percentage + bar. Disappears or collapses once all items are done (future enhancement).

---

## Anatomy

```
<div> bg-card, rounded-xl, border-border
  ├── Header row
  │     ├── Title "Getting Started" + subtitle
  │     └── Progress section
  │           ├── "X% Complete" label
  │           └── Progress bar (role="progressbar")
  └── Checklist (motion.div stagger) or Skeleton
        └── CheckItem × 4
              ├── Checkbox div (role="checkbox" aria-checked)
              ├── Text: label + subtitle
              └── Right: priority badge OR chevron icon
```

---

## CheckItem states

| State | Checkbox visual | Label visual |
|---|---|---|
| Pending | `border-muted-foreground` empty | `text-foreground` |
| Pending high-priority | `border-muted-foreground` empty | `text-foreground` + blue subtitle + "High Priority" badge |
| Done | `bg-primary border-primary` + checkmark | `text-muted-foreground line-through` |
| Soon | `border-border` empty (lighter) | `text-muted-foreground opacity-60` |

---

## Progress bar

```tsx
<div
  role="progressbar"
  aria-valuenow={pct}
  aria-valuemin={0}
  aria-valuemax={100}
  aria-label="Getting started progress"
  className="w-32 h-1.5 bg-muted rounded-full overflow-hidden"
>
  <div className="h-full bg-primary rounded-full transition-all duration-500" style={{ width: `${pct}%` }} />
</div>
```

---

## Animation

Framer Motion stagger: `delayChildren: 0.05s`, `staggerChildren: 0.07s`. Each item: `opacity 0→1, y 6→0, duration 0.25s easeOut`. Respects `prefers-reduced-motion` via `globals.css` global rule (transitions set to 0.01ms). For full compliance, also add `useReducedMotion()` hook from Framer Motion in a future pass.

---

## Accessibility

| Requirement | Status |
|---|---|
| Checkbox div: `role="checkbox"` + `aria-checked` | ✅ |
| Checkmark SVG: `aria-hidden="true"` | ✅ |
| Chevron SVG: `aria-hidden="true"` | ✅ |
| Link items: `aria-label={item.label}` | ✅ |
| Progress bar: `role="progressbar"` + `aria-valuenow/min/max/label` | ✅ |

---

## Token Mapping

| Element | Token |
|---|---|
| Card bg | `bg-card` |
| Card border | `border-border` |
| Item dividers | `border-border` |
| Title | `text-foreground` |
| Subtitle / metadata | `text-muted-foreground` |
| Active checkbox | `bg-primary border-primary` |
| Checkmark icon | `text-primary-foreground` |
| Priority subtitle | `text-primary` |
| Priority badge | `bg-muted border-border text-muted-foreground` |
| Progress track | `bg-muted` |
| Progress fill | `bg-primary` |
| Skeleton | `bg-muted` |

---

## Changelog

| Version | Date | Changes |
|---|---|---|
| 1.0.0 | 2026-03-23 | Initial spec. ARIA roles on checkboxes and progress bar, aria-hidden on SVGs, full token migration. |
