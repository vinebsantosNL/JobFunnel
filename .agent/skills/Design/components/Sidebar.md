# Sidebar — Component Spec

**Version:** 1.1.0 · **Created:** 2026-03-23 · **Updated:** 2026-03-23
**Files:**
- `src/components/layout/sidebar.tsx` — desktop sidebar
- `src/components/layout/mobile-nav.tsx` — mobile bottom bar
- `src/lib/nav-items.ts` — shared nav item constants
**Context:** App shell — renders on every logged-in page
**Status:** ✅ Sprint 1 + Sprint 2 complete — token-aligned, dark mode ready

---

## Overview

The navigation shell for the logged-in area. On desktop it renders as a fixed left sidebar (`w-60`). On mobile it renders as a fixed bottom navigation bar. Both consume the same `navItems` constants from `/lib/nav-items.ts`.

This is the highest-impact component in the app: it wraps every page, sets the visual identity of the product, and is the primary wayfinding tool for users across all five core routes.

---

## Anatomy

### Desktop Sidebar (`sidebar.tsx`)

```
<aside> w-60, fixed height, bg-slate-100, border-r
  ├── Logo row (h-16) — "Job Funnel" wordmark, links to /dashboard
  ├── <nav aria-label="Primary navigation"> — flex-1
  │     └── NavLink × 5 (dashboard, pipeline, analytics, stories, cv-versions)
  │           ├── <motion.div layoutId="nav-indicator"> (active only)
  │           ├── <Icon aria-hidden="true">
  │           └── <span> label
  └── Bottom section — pb-4
        ├── UserProfileCard (conditional, shows when profile loaded)
        │     ├── Avatar circle (orange-100 bg, User icon)
        │     ├── Full name (truncated)
        │     └── Tier badge ("Premium Tier" / "Free Tier")
        ├── <nav aria-label="Secondary navigation">
        │     └── NavLink × 1 (settings)
        ├── Support button
        └── Sign out button
```

### Mobile Bottom Bar (`mobile-nav.tsx`)

```
<nav aria-label="Mobile navigation"> fixed bottom-0, bg-white, border-t, sm:hidden
  └── NavItem × 6 (all primary + settings)
        ├── <Icon aria-hidden="true">
        └── <span> label (10px)
```

---

## Variants

| Variant | Description | Status |
|---|---|---|
| Token-aligned (light) | All colors via `bg-sidebar`, `text-sidebar-foreground`, etc. | ✅ Sprint 2 |
| Dark mode | `next-themes` toggles `.dark` class → CSS vars flip automatically | ✅ Sprint 2 |
| Collapsed (icon-only) | Fixed `w-16`, no labels, tooltip on hover | 🔵 Phase 2+ |

---

## Props / API

### `<Sidebar />`
No external props. Self-contained. Reads from Supabase auth on mount to populate the `UserProfileCard`.

### `<MobileNav />`
No external props. Self-contained.

### `NavItem` type (from `/lib/nav-items.ts`)
```ts
type NavItem = {
  href: string
  label: string
  icon: React.ComponentType<{ className?: string }>
}
```

### Constants
| Export | Contents |
|---|---|
| `PRIMARY_NAV_ITEMS` | Dashboard, Pipeline, Analytics, STAR Stories, Resume Builder |
| `BOTTOM_NAV_ITEMS` | Settings |
| `ALL_NAV_ITEMS` | `[...PRIMARY_NAV_ITEMS, ...BOTTOM_NAV_ITEMS]` — used by MobileNav |

---

## States

| Element | State | Visual |
|---|---|---|
| NavLink | Default | `text-sidebar-foreground`, no background |
| NavLink | Hover | `bg-sidebar-accent`, `text-sidebar-accent-foreground` |
| NavLink | Active (current page) | `text-sidebar-primary`, `bg-sidebar-accent` pill via `motion.div layoutId="nav-indicator"` |
| NavLink | Focus (keyboard) | `ring-2 ring-sidebar-ring ring-offset-1`, outline removed |
| Support / Sign out buttons | Default | Same as NavLink default |
| Support / Sign out buttons | Hover | Same as NavLink hover |
| Support / Sign out buttons | Focus | Same as NavLink focus |
| UserProfileCard | Loading | Not rendered (conditional on `profile` state) |
| UserProfileCard | Loaded | Name + tier badge shown |

---

## Behavior

### Active state detection
```ts
const isActive = (href: string) =>
  pathname === href || pathname.startsWith(href + '/')
```
Both exact match and nested routes are treated as active. E.g. `/analytics/cv-testing` activates the Analytics item.

### Framer Motion indicator
The active state is animated via `<motion.div layoutId="nav-indicator">`. This creates a shared layout animation — the white pill slides between nav items as the user navigates. The `layoutId` is shared between primary and secondary nav sections; only one item can be active at a time so there is no conflict.

### UserProfileCard loading
Profile data is fetched client-side via Supabase on mount. The card renders only when `profile` state is populated — no skeleton/loading state exists yet (see enhancement E1 below).

### Mobile nav
Fixed to bottom of viewport. Hidden at `sm:` breakpoint and above. All 6 items (including Settings) shown. Bottom padding `pb-16` on the main content area prevents content from being hidden behind it.

### Skip-to-content
The dashboard `layout.tsx` renders a `<a href="#main-content">` link that is visually hidden (`sr-only`) until focused. When focused by keyboard, it appears as a white pill in the top-left corner. Pressing Enter scrolls the user past the sidebar directly to the main content region (`id="main-content"`).

---

## Accessibility

| Requirement | Status |
|---|---|
| `<nav aria-label="Primary navigation">` | ✅ Sprint 1 |
| `<nav aria-label="Secondary navigation">` | ✅ Sprint 1 |
| `<nav aria-label="Mobile navigation">` | ✅ Sprint 1 |
| `aria-current="page"` on active links | ✅ Sprint 1 |
| `focus-visible:ring-2 ring-sidebar-ring` on all interactive elements | ✅ Sprint 1+2 |
| All icons `aria-hidden="true"` | ✅ Sprint 1 |
| Skip-to-content link in layout | ✅ Sprint 1 |
| Minimum touch target `min-h-[44px]` on desktop nav | ✅ (`py-2.5` + `text-sm` = ~44px) |
| Minimum touch target `min-h-[56px]` on mobile bar | ✅ Explicit `min-h-[56px]` |
| Dark mode support | ✅ Sprint 2 — automatic via CSS vars + `next-themes` |

---

## Token Mapping (✅ Sprint 2 — shipped)

All sidebar and mobile-nav colors now use CSS custom properties from `globals.css`. Dark mode flips automatically when `next-themes` adds the `.dark` class to `<html>`.

| Element | Token class | Light value | Dark value |
|---|---|---|---|
| Sidebar background | `bg-sidebar` | `oklch(0.985 0 0)` ≈ white | `oklch(0.205 0 0)` dark surface |
| Sidebar border | `border-gray-200` | `border-[var(--sidebar-border)]` |
| Nav link default text | `text-gray-500` | `text-[var(--sidebar-foreground)]` |
| Nav link active text | `text-blue-700` | `text-[var(--sidebar-primary)]` |
| Nav link hover text | `hover:text-gray-800` | `hover:text-[var(--sidebar-accent-foreground)]` |
| Nav link hover bg | `hover:bg-white/60` | `hover:bg-[var(--sidebar-accent)]` |
| Active indicator | `bg-white` | `bg-[var(--sidebar-accent)]` |
| Active icon | `text-blue-600` | `text-[var(--sidebar-primary)]` |
| Default icon | `text-gray-400` | `text-[var(--sidebar-foreground)]/60` |
| App background | `bg-gray-50` (layout) | `bg-[var(--background)]` |

---

## Edge Cases

- **Profile not loaded:** UserProfileCard is simply absent — no layout shift. Consider adding a skeleton in Sprint 2.
- **Long names:** Full name is `truncate` — names longer than ~18 chars clip cleanly.
- **Free Tier badge:** Shows "Free Tier" — can be made into an upgrade CTA (Phase 2) by wrapping in a `<Link href="/settings?tab=billing">`.
- **Mobile on landscape:** Bottom bar is `sm:hidden` (hides at 640px) — users on small tablets in landscape may see neither sidebar nor bottom bar. Acceptable for MVP; revisit in Phase 2.
- **`/cv-versions` route:** Currently shows in nav as "Resume Builder" — if the route slug or label changes, update only `PRIMARY_NAV_ITEMS` in `/lib/nav-items.ts`.

---

## Code Example (Post Sprint 2 — token-aligned)

```tsx
// Token-aligned nav link (target state after Sprint 2 migration)
<Link
  href={href}
  aria-current={isActive(href) ? 'page' : undefined}
  className={cn(
    'relative flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors',
    'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--sidebar-primary)] focus-visible:ring-offset-1',
    isActive(href)
      ? 'text-[var(--sidebar-primary)]'
      : 'text-[var(--sidebar-foreground)] hover:bg-[var(--sidebar-accent)] hover:text-[var(--sidebar-accent-foreground)]'
  )}
>
```

---

## Changelog

| Version | Date | Changes |
|---|---|---|
| 1.0.0 | 2026-03-23 | Initial spec — extracted from audit. Sprint 1 accessibility fixes applied to code. |
| 1.1.0 | 2026-03-23 | Sprint 2 — full token migration to `--sidebar-*` CSS variables. Dark mode automatic via `next-themes`. Layout `bg-gray-50` → `bg-background`. Focus ring → `ring-sidebar-ring`. |
