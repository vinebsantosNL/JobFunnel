# StatTile — Component Spec

**Version:** 1.0.0 · **Created:** 2026-03-23
**File:** `src/components/dashboard/DashboardStatsBlock.tsx` (internal — not exported separately)
**Context:** App — Dashboard page stats grid
**Status:** ✅ Sprint 1 + Sprint 2 complete

---

## Overview

Clickable metric card used in the 2×2 (mobile) / 4×1 (desktop) stats grid at the top of the Dashboard. Each tile shows a label, an animated count-up number, and a descriptor. The left border accent color maps to the metric's semantic meaning (stage colours from the design system).

---

## Anatomy

```
<Link> bg-card, rounded-xl, border, border-l-4 [accent color]
  ├── Loading state:
  │     ├── Skeleton h-8 w-16 bg-muted animate-pulse
  │     └── Skeleton h-4 w-24 bg-muted animate-pulse
  └── Loaded state:
        ├── Label — text-xs uppercase tracking-wide text-muted-foreground
        ├── Value — text-3xl font-bold, aria-live="polite" aria-atomic="true"
        └── Descriptor — text-xs text-muted-foreground (or custom class)
```

---

## Props

| Prop | Type | Required | Description |
|---|---|---|---|
| `label` | `string` | ✅ | Metric name, rendered uppercase |
| `value` | `number` | ✅ | Numeric value; animates from 0 on load |
| `loading` | `boolean` | ✅ | Shows skeleton when true |
| `borderColor` | `string` | ✅ | Tailwind left-border class, e.g. `border-l-blue-500` |
| `descriptor` | `string` | ✅ | Subtitle below the number |
| `descriptorClass` | `string` | ✅ | Tailwind text class for descriptor, e.g. `text-muted-foreground` |
| `href` | `string` | ✅ | Navigation target when tile is clicked |
| `tooltip` | `ReactNode` | ❌ | Optional Tooltip content (wraps tile in shadcn/ui Tooltip) |

---

## Accent Colours (current usage)

| Metric | `borderColor` | Semantic meaning |
|---|---|---|
| Total Applications | `border-l-blue-500` | Pipeline — primary blue |
| Active Pipeline | `border-l-blue-400` | Pipeline — lighter blue |
| Interviews | `border-l-purple-500` | Interviewing stage (`#8B5CF6`) |
| STAR Stories | `border-l-amber-500` | Stories / interview content |

These are intentional semantic colors tied to the stage palette in `DESIGN_SYSTEM.md` — do not replace with token classes.

---

## States

| State | Visual |
|---|---|
| Default | `bg-card border-border` with accent left border |
| Hover | `hover:shadow-sm hover:-translate-y-0.5` — subtle lift |
| Active (press) | `active:scale-[0.98]` |
| Loading | Two `bg-muted animate-pulse` skeletons |
| Number animating | Count-up from 0 to `value` over 600ms cubic-ease-out |

---

## Accessibility

| Requirement | Status |
|---|---|
| Tile is a `<Link>` — keyboard navigable, receives focus ring | ✅ |
| `aria-live="polite" aria-atomic="true"` on the number element | ✅ — announces final value only, not every frame |
| Loading skeleton is presentational — no AT announcement | ✅ (no `aria-label` needed on static div) |

---

## Token Mapping

| Element | Token |
|---|---|
| Card background | `bg-card` |
| Card border | `border-border` |
| Label | `text-muted-foreground` |
| Number | `text-foreground` |
| Number hover | `group-hover:text-primary` |
| Descriptor | `text-muted-foreground` |
| Skeleton | `bg-muted` |

---

## Changelog

| Version | Date | Changes |
|---|---|---|
| 1.0.0 | 2026-03-23 | Initial spec. Added `aria-live` on number, full token migration. |
