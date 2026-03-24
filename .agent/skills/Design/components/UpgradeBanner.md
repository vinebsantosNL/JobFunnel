# UpgradeBanner — Component Spec

**Version:** 1.0.0 · **Created:** 2026-03-23
**File:** `src/components/dashboard/UpgradeBanner.tsx`
**Context:** App — Dashboard page, immediately below the Header, above page content
**Status:** ✅ Sprint 1 + Sprint 2 complete

---

## Overview

A persistent full-width promotional strip shown to free-tier users only. Highlights the three primary Pro benefits and provides a direct CTA to the billing settings page. Renders `null` for Pro users — zero DOM cost. Intentionally uses brand-specific colors (`bg-blue-950`, `bg-blue-500`) rather than semantic design tokens to signal "upgrade" prominence distinct from the neutral app chrome.

---

## Anatomy

```
<div> bg-blue-950, h-12, flex, items-center, justify-between
  ├── Benefits row (flex gap-6, text-sm font-medium)
  │     ├── ✦ Unlimited AI        (✦ in text-blue-300, aria-hidden)
  │     ├── ✦ Unlimited A/B Testing
  │     └── ✦ Unlimited Analytics
  └── CTA Link → /settings/billing
        "Upgrade to Pro →"
        (bg-blue-500 hover:bg-blue-400, rounded-md, aria-label="Upgrade to Pro")
```

---

## Props

| Prop | Type | Required | Description |
|---|---|---|---|
| `isPro` | `boolean` | ✅ | When `true`, component returns `null` and renders nothing |

---

## Visibility Logic

```tsx
if (isPro) return null
```

`isPro` is derived server-side in `DashboardPage`:
```ts
const isPro = profile?.subscription_tier === 'pro'
```

No client-side subscription check — value is passed as a prop from the RSC layer.

---

## Color Intentionality

The banner deliberately uses **non-semantic colors** (`bg-blue-950`, `bg-blue-500`, `text-blue-300`) to create visual separation from the neutral app chrome. This is intentional — it should feel "promotional" and slightly distinct from the rest of the UI.

| Element | Class | Rationale |
|---|---|---|
| Banner background | `bg-blue-950` | High-contrast dark blue — signals premium context |
| Decorative icon | `text-blue-300` | Soft accent against dark bg |
| CTA button | `bg-blue-500 hover:bg-blue-400` | Mid-blue — accessible contrast on dark bg, feels actionable |
| All text | `text-white` | Maximum contrast on dark bg |

---

## Accessibility

| Requirement | Status |
|---|---|
| Decorative `✦` symbols: `aria-hidden="true"` on wrapping `<span>` | ✅ |
| Arrow `→` on CTA: `aria-hidden="true"` on wrapping `<span>` | ✅ |
| CTA link: `aria-label="Upgrade to Pro"` (strips decorative arrow from accessible name) | ✅ |
| Banner landmark: no explicit `role` — acceptable as a styled `<div>` (not a banner/alert region) | ✅ |
| Color contrast (white on `blue-950`): passes WCAG AA | ✅ |
| Color contrast (white on `blue-500` CTA): passes WCAG AA | ✅ |

---

## Responsive Behaviour

The banner is `h-12 flex items-center`. On narrow screens (<640px), the benefits text row may wrap or be clipped — acceptable as the CTA button is `flex-shrink-0` and always visible. The primary mobile action (tapping "Upgrade to Pro") is preserved.

**Future enhancement**: On mobile, collapse the three benefit labels into a single "Go Pro — Unlimited everything" message to prevent overflow.

---

## Placement in Layout

```
DashboardPage
  ├── <Header />          ← role="banner", bg-card
  ├── <UpgradeBanner />   ← bg-blue-950, free users only
  └── <div> p-6 content
        ├── <DashboardStatsBlock />
        ├── <NextCareerGoal />
        └── <GettingStartedBlock />
```

The banner is visually "sandwiched" between the header and the main content area, creating a deliberate visual break that draws attention without blocking the content.

---

## Changelog

| Version | Date | Changes |
|---|---|---|
| 1.0.0 | 2026-03-23 | Initial spec. Decorative aria-hidden on ✦ and →, aria-label on CTA link. Documented intentional non-semantic color usage. |
