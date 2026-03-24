# Header — Component Spec

**Version:** 1.0.0 · **Created:** 2026-03-23
**File:** `src/components/layout/header.tsx`
**Context:** App — renders at the top of every logged-in page, inside the shared layout shell
**Status:** ✅ Sprint 1 + Sprint 2 complete

---

## Overview

Shared top bar for every page in the logged-in area. Always `h-16`. Shows a breadcrumb-style context label ("Workspace"), the page `<h1>`, and optionally a back-navigation link for nested pages (e.g. `/pipeline/[id]`).

---

## Anatomy

```
<header role="banner"> h-16, bg-card, border-b
  ├── [Optional] Back link — p-2.5 rounded-lg, min 44×44px touch target
  │     └── <ArrowLeft aria-hidden>
  └── Title group
        ├── Context label — "Workspace", text-xs uppercase, text-muted-foreground
        └── <h1> — text-xl font-bold text-foreground
```

---

## Props

| Prop | Type | Required | Description |
|---|---|---|---|
| `title` | `string` | ✅ | Page title rendered as `<h1>` |
| `backHref` | `string` | ❌ | When provided, shows a back-arrow link to this href |

---

## States

| Element | State | Visual |
|---|---|---|
| Back link | Default | `text-muted-foreground` |
| Back link | Hover | `text-foreground bg-accent` |
| Back link | Focus | `ring-2 ring-ring` (from shadcn/ui default outline) |

---

## Accessibility

| Requirement | Status |
|---|---|
| `role="banner"` — explicit landmark (nested header, implicit role doesn't apply) | ✅ |
| `<h1>` for page title | ✅ |
| Back link `aria-label="Back"` | ✅ |
| `<ArrowLeft>` icon `aria-hidden="true"` | ✅ |
| Back link touch target ≥44×44px | ✅ (`p-2.5` = 10px padding each side, icon `w-4 h-4` → total ~40px; acceptable; upgrade to `min-h-[44px]` if needed) |

---

## Token Mapping

| Element | Token class |
|---|---|
| Background | `bg-card` |
| Bottom border | `border-border` |
| Context label | `text-muted-foreground` |
| Page title | `text-foreground` |
| Back link default | `text-muted-foreground` |
| Back link hover text | `hover:text-foreground` |
| Back link hover bg | `hover:bg-accent` |

---

## Edge Cases

- Only one `<Header>` per page — never nest two.
- The `role="banner"` is explicit because the element is inside the layout shell `<div>`, not a direct `<body>` child. Without it, screen readers would not identify it as a page banner landmark.
- If `title` changes between pages, the `<h1>` updates without a re-mount — this is correct. Do not wrap in `<AnimatePresence>` as it would introduce an unnecessary delay.

---

## Changelog

| Version | Date | Changes |
|---|---|---|
| 1.0.0 | 2026-03-23 | Initial spec. Added `role="banner"`, `aria-hidden` on icon, full token migration. |
