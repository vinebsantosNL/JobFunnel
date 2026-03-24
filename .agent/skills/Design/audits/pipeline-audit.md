# Pipeline — Design Audit

**Date:** 2026-03-23 · **Auditor:** Design System Agent
**Files reviewed:**
- `src/app/(dashboard)/pipeline/page.tsx`
- `src/components/pipeline/kanban-board.tsx`
- `src/components/pipeline/kanban-column.tsx`
- `src/components/pipeline/application-card.tsx`
- `src/components/pipeline/application-modal.tsx`
- `src/components/pipeline/filter-bar.tsx`
- `src/components/pipeline/quick-add-form.tsx`
- `src/components/pipeline/upgrade-banner.tsx`

---

## Critical (C) — Violates spec / breaks behaviour

| ID | File | Finding |
|---|---|---|
| C1 | `page.tsx:8` | `<main className="flex-1 p-6 overflow-hidden">` — layout shell (`(dashboard)/layout.tsx`) already renders `<main id="main-content">`. This creates **two `<main>` landmarks**, violating WCAG 1.3.1. Fix: change to `<div>`. |

---

## Major (M) — WCAG AA violation

| ID | File | Finding |
|---|---|---|
| M1 | `application-modal.tsx:277–291` | Tab bar (`Details / Notes / Move Stage`) uses plain `<button>` elements with no `role="tab"`, no `role="tablist"` on the container, no `aria-selected`. Screen readers cannot discover or navigate this as a tab interface. |
| M2 | `kanban-column.tsx:22–51` | Column wrapper has no landmark role. AT users cannot navigate between columns. Fix: add `role="region"` + `aria-label={config.label}` on the outer `<div>`. |
| M3 | `application-modal.tsx:217–242` | Decorative icons (`<MapPin>`, `<DollarSign>`, `<ExternalLink>`) not marked `aria-hidden="true"`. Screen readers announce "map pin" before location value. |
| M4 | `application-modal.tsx:193–207` | Animated stage badge uses `<motion.span>` with `AnimatePresence`. No `aria-live` — programmatic stage changes via "Move to X" button are silent to AT. |
| M5 | `application-card.tsx:94–96` | Priority indicator dot uses only `title={...}` for tooltip. `title` is inaccessible on touch devices and to keyboard-only users. Need `aria-label` on a wrapper or `<span role="img">`. |
| M6 | `application-card.tsx:76` | Drag outer `<div>` spreads `{...attributes}` (dnd-kit adds `role="button"`) but has **no `focus-visible` ring** on the draggable element. Keyboard users cannot see which card has focus. |
| M7 | `upgrade-banner.tsx:23` | Emoji icons (`🔒`, `⚠️`) have no `aria-hidden`. Screen readers announce "lock emoji" / "warning emoji". Wrap in `<span aria-hidden="true">`. |

---

## Minor (m) — UX / polish

| ID | File | Finding |
|---|---|---|
| m1 | `kanban-column.tsx:30` | Count badge (`jobs.length`) has no accessible context. Screen reader hears just a number. Add `aria-label={`${jobs.length} jobs`}`. |
| m2 | `kanban-column.tsx:26–28` | Stage dot (`w-2 h-2 rounded-full`) not `aria-hidden`. |
| m3 | `application-modal.tsx:152–157` | "Share" button has no action (no `href`, no `onClick`). Should be `disabled` or removed until the feature exists. Currently misleads users. |
| m4 | `quick-add-form.tsx:54` | "+ Add job" button — the `+` prefix character is announced by screen readers as "plus". Change to "Add job" or use `aria-label="Add job to {stage}"`. |
| m5 | `application-modal.tsx:144` | Modal header bar uses `bg-white border-gray-100` — not token-aligned. |

---

## Enhancement (E) — Not a violation, but notable gap

| ID | File | Finding |
|---|---|---|
| E1 | `kanban-board.tsx:108–121` | Loading skeletons have no `aria-label="Loading pipeline"` or `role="status"` — AT users get no feedback that content is loading. |
| E2 | `application-card.tsx:82` | `animate-pulse` on stale ring (`ring-amber-300 animate-pulse`) — `globals.css` `prefers-reduced-motion` block will suppress this correctly. No code change needed — just noted. |
| E3 | `application-modal.tsx` | No `DialogHeader` used — `DialogTitle` is `sr-only`. Modal has no visible title bar heading. Consider making title visible. |

---

## Token Violations (40+)

### `kanban-board.tsx`
| Line | Current | Replace with |
|---|---|---|
| 113 | `bg-gray-100` (skeleton) | `bg-muted` |
| 114 | `animate-pulse` | Keep (reduced-motion handled globally) |
| 124 | `text-red-500` | `text-destructive` |
| 181 | `text-gray-600` (dialog body) | `text-muted-foreground` |
| 198 | `text-gray-400` (dialog hint) | `text-muted-foreground` |
| 204 | `bg-blue-600 hover:bg-blue-700` (confirm btn) | Replace raw `<button>` with `<Button>` (primary) |
| 213 | `bg-gray-100 hover:bg-gray-200 text-gray-700` (alt btn) | Replace with `<Button variant="secondary">` |
| 223 | `text-gray-400 hover:text-gray-600` (cancel) | Replace with `<Button variant="ghost">` |

### `kanban-column.tsx`
| Line | Current | Replace with |
|---|---|---|
| 30 | `text-gray-400` (count) | `text-muted-foreground` |
| 30 | `bg-white border` (count badge) | `bg-card border-border` |
| 38 | `bg-gray-50/80` (drop zone bg) | `bg-muted/50` |
| 38 | `border-gray-200` | `border-border` |
| Note | `config.bgColor/color/borderColor/dotColor` | **Keep** — intentional semantic stage colors from `/lib/stages` |
| Note | `bg-blue-50 border-blue-200` (isOver drop) | **Keep** — intentional drag-over interaction indicator |

### `application-card.tsx`
| Line | Current | Replace with |
|---|---|---|
| 82 | `bg-white` | `bg-card` |
| 82 | `border-gray-100` | `border-border` |
| 82 | `hover:border-gray-200` | `hover:border-border` |
| 92 | `text-gray-500` (company) | `text-muted-foreground` |
| 108 | `text-gray-900` (job title) | `text-foreground` |
| 113–118 | `bg-gray-100 text-gray-600` (tags) | `bg-muted text-muted-foreground` |
| 127 | `bg-gray-100` (progress track) | `bg-muted` |
| Note | `bg-blue-500` (progress fill) | **Keep** — intentional applied stage indicator |
| Note | `AVATAR_COLORS` | **Keep** — intentional brand color palette for company avatars |

### `filter-bar.tsx`
| Line | Current | Replace with |
|---|---|---|
| 74 | `text-blue-600 font-medium` (active filter) | `text-primary font-medium` |
| 74 | `text-gray-500` (inactive filter) | `text-muted-foreground` |
| 89 | `text-blue-600 font-medium` (active CV) | `text-primary font-medium` |
| 89 | `text-gray-500` (inactive CV) | `text-muted-foreground` |
| 109 | `text-gray-400` (active count) | `text-muted-foreground` |

### `application-modal.tsx` (25+ violations)
| Area | Current | Replace with |
|---|---|---|
| Header bar | `bg-white border-gray-100` | `bg-card border-border` |
| Breadcrumb text | `text-gray-500`, `text-gray-400`, `text-gray-300`, `text-gray-700` | `text-muted-foreground`, `text-muted-foreground`, `text-border/50`, `text-foreground` |
| Share button | `text-gray-500 hover:text-gray-700 hover:bg-gray-50` | `text-muted-foreground hover:text-foreground hover:bg-accent` |
| Move button | `bg-blue-600 hover:bg-blue-700` | `bg-primary hover:bg-primary/90` |
| Body area | `bg-white` | `bg-card` |
| Company name | `text-gray-600` | `text-muted-foreground` |
| Updated time | `text-gray-400` | `text-muted-foreground` |
| Job title h2 | `text-gray-900` | `text-foreground` |
| Metadata labels | `text-gray-400` | `text-muted-foreground` |
| Metadata values | `text-gray-700` | `text-foreground` |
| External link | `text-blue-600 hover:underline` | `text-primary hover:underline` |
| Prep materials | `border-gray-200 hover:border-blue-200 hover:bg-blue-50` | `border-border hover:border-primary/30 hover:bg-primary/5` |
| Prep icon bg | `bg-blue-100`, `bg-purple-100` | **Keep** — intentional category color coding |
| Tab bar border | `border-gray-100` | `border-border` |
| Active tab | `border-blue-600 text-blue-700` | `border-primary text-primary` |
| Inactive tab | `text-gray-500 hover:text-gray-700` | `text-muted-foreground hover:text-foreground` |
| Details labels | `text-gray-400` | `text-muted-foreground` |
| Details values | `text-gray-700` | `text-foreground` |
| Edit form labels | `text-gray-500` | `text-muted-foreground` |
| Notes text | `text-gray-700`, `text-gray-400` | `text-foreground`, `text-muted-foreground` |
| Stage picker | `border-gray-200 hover:border-gray-300 hover:bg-gray-50` | `border-border hover:border-border hover:bg-accent` |
| Stage picker text | `text-gray-700` | `text-foreground` |

### `quick-add-form.tsx`
| Line | Current | Replace with |
|---|---|---|
| 52 | `text-gray-400 hover:text-gray-600 border-gray-200 hover:border-gray-300` | `text-muted-foreground hover:text-foreground border-border hover:border-border` |
| 61 | `bg-white border-gray-200` | `bg-card border-border` |

---

## Missing Component Specs

| Component | File | Priority |
|---|---|---|
| `KanbanBoard` | `kanban-board.tsx` | High |
| `KanbanColumn` | `kanban-column.tsx` | High |
| `ApplicationCard` | `application-card.tsx` | High |
| `ApplicationModal` | `application-modal.tsx` | High |
| `FilterBar` | `filter-bar.tsx` | Medium |
| `QuickAddForm` | `quick-add-form.tsx` | Medium |
| `PipelineUpgradeBanner` | `upgrade-banner.tsx` | Low |

---

## Sprint Summary

- **Sprint 1** — Accessibility: C1, M1–M7, m1–m4 ✅
- **Sprint 2** — Token migration: ~40 violations across 5 files ✅
- **Sprint 3** — Specs: 7 new components (registered in DESIGN_SYSTEM.md) ✅
