# Sidebar Audit — 2026-03-23

## Compliance Level
Partial (3/7 dimensions fully passing)

| Severity | Count |
|---|---|
| Critical | 1 |
| Major | 3 |
| Minor | 2 |
| Enhancement | 2 |

## Files Inventoried
`sidebar.tsx` · `mobile-nav.tsx` · `header.tsx` · `(dashboard)/layout.tsx`

---

## Critical Issues

### [C1] Missing `aria-current="page"` on active navigation items
- **Location:** `sidebar.tsx:74–98`, `mobile-nav.tsx`
- **WCAG:** 1.3.1 Info and Relationships (Level A)
- **Impact:** Screen readers cannot identify the current page in the navigation
- **Status:** ✅ Fixed in Sprint 1

---

## Major Issues

### [M1] No `focus-visible:` styling on nav items
- **Location:** `sidebar.tsx`, `mobile-nav.tsx`
- **WCAG:** 2.4.7 Focus Visible (Level AA)
- **Status:** ✅ Fixed in Sprint 1

### [M2] Sidebar color usage inconsistency — raw Tailwind colors vs CSS variables
- **Location:** All sidebar/nav files
- **Issue:** Uses `bg-slate-100`, `text-blue-600`, `text-gray-500` directly. `globals.css` defines `--sidebar`, `--sidebar-primary`, `--sidebar-foreground` tokens that go unused.
- **Fix:** Migrate to CSS variable tokens — blocked on designer spec approval
- **Status:** 🟡 Pending — Phase 2 design work (token migration)

### [M3] No `aria-label` on `<nav>` regions — duplicate landmark confusion
- **Location:** `sidebar.tsx:72`, `mobile-nav.tsx:10`
- **WCAG:** 2.4.1 Bypass Blocks (Level A)
- **Status:** ✅ Fixed in Sprint 1

---

## Minor Issues

### [m1] Skip-to-content link missing at layout level
- **Location:** `src/app/(dashboard)/layout.tsx`
- **WCAG:** 2.4.1 (Level A)
- **Status:** ✅ Fixed in Sprint 1

### [m2] `MobileNav` and `Sidebar` nav items are duplicate arrays
- **Location:** `sidebar.tsx:25–38`, `mobile-nav.tsx:14–22`
- **Fix:** Extract to shared constant `/lib/nav-items.ts`
- **Status:** ✅ Fixed in Sprint 1

---

## Enhancements

### [E1] No dark mode support
- **Status:** 🟡 Blocked by M2 token migration

### [E2] No collapsed/icon-only mode
- **Status:** 🔵 Phase 2+ enhancement

---

## Remediation Roadmap

### Sprint 1 — ✅ Complete
- [x] `aria-current="page"` on active nav items (C1)
- [x] `focus-visible:` ring styles on all nav links (M1)
- [x] `aria-label` on both `<nav>` regions (M3)
- [x] Skip-to-content link in dashboard layout (m1)
- [x] Extract shared `navItems` to `/lib/nav-items.ts` (m2)

### Sprint 2 — ✅ Complete
- [x] Migrate sidebar colors → CSS variable tokens (M2) — `bg-sidebar`, `text-sidebar-foreground`, etc.
- [x] Dark mode variants (E1) — automatic via `next-themes` + `globals.css` `.dark` overrides
- [x] Layout `bg-gray-50` → `bg-background` (dashboard layout.tsx)
- [x] Focus ring → `ring-sidebar-ring` (design token, not hardcoded blue)

### Sprint 3+ — Enhancements
- [ ] Collapsible sidebar (E2, post-MVP)
