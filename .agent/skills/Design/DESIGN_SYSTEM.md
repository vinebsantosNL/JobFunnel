# JobFunnel OS — Design System

**Version**: 1.1.0 · **Last updated**: 2026-03-23
**Baseline**: [job-funnel-lime.vercel.app](https://job-funnel-lime.vercel.app) + [/login](https://job-funnel-lime.vercel.app/login)

> **Rule #1 — Read this before building anything.**
> Every new page, component, or UX experience must use the tokens, patterns, and conventions defined here. Never introduce a new raw color, font size, or radius value without first checking if an existing token covers the need.

---

## Two Visual Contexts

JobFunnel has two distinct but connected visual worlds. Every screen belongs to one of them.

| Context | Where used | Background | Personality |
|---|---|---|---|
| **Marketing** | Homepage, login left panel, landing pages | `#0C1A17` (Ink-900) dark | Bold, data-forward, premium dark tech |
| **App** | Dashboard, pipeline, analytics, stories, settings | `#FAFAFA` light | Clean, focused, functional |

They share the same token infrastructure but use different semantic values per context. When building a new screen, decide which context it belongs to first — then apply the appropriate tokens.

---

## Fonts

Two typefaces. Used in combination on every screen.

| Font | Variable | Usage | Import |
|---|---|---|---|
| **Inter** | `var(--font-sans)` | All headings, body copy, UI labels, buttons | `Inter` from `next/font/google` |
| **DM Mono** | `var(--font-dm-mono)` | Data, metrics, eyebrow labels, pipeline tags, prices, captions | `DM_Mono` weight 400/500 |

**Rule:** DM Mono is the data voice. Use it wherever you're showing numbers, labels, or anything that reads as "from the system". Inter is the human voice — copywriting, narrative, instruction.

### Font weights in use
- `font-light` (300) — italic subtitles, de-emphasis
- `font-normal` (400) — body copy
- `font-medium` (500) — UI labels, captions
- `font-semibold` (600) — button labels, card labels
- `font-bold` (700) — card headings (H3 level)
- `font-black` (900) — display headings, hero H1/H2, price display

---

## Color Tokens

### Marketing Palette (Dark Context)

| Token | Value | Usage |
|---|---|---|
| `ink-900` | `#0C1A17` | Hero bg, pricing Pro card bg, mobile overlay bg |
| `ink-800` | `#112219` | Deeper dark surface |
| `ink-700` | `#1A3329` | Subtle dark variant |
| `marketing-emerald` | `#10B981` | Eyebrow labels, accent bars, success icons, badges on dark |
| `white/100` | `rgba(255,255,255,1.0)` | Headlines on dark |
| `white/75` | `rgba(255,255,255,0.75)` | Primary body text on dark, nav links active |
| `white/65` | `rgba(255,255,255,0.65)` | Sub-copy on dark (hero paragraph) |
| `white/45` | `rgba(255,255,255,0.45)` | Secondary text on dark (login left panel copy) |
| `white/40` | `rgba(255,255,255,0.40)` | Muted labels in dark (SVG labels) |
| `white/35` | `rgba(255,255,255,0.35)` | Metadata on dark (trust line) |
| `white/30` | `rgba(255,255,255,0.30)` | Very muted on dark (scroll hint, footnote) |
| `white/20` | `rgba(255,255,255,0.20)` | Ghost dividers, borders on dark |
| `white/10` | `rgba(255,255,255,0.10)` | Ghost hover states, mobile menu divider |
| `emerald-glow` | `rgba(16,185,129,0.18)` | Radial glow background effect |

### App Palette (Light Context)

| Token | Value | Usage |
|---|---|---|
| `slate-900` | `#0F172A` | Primary text on light, dark button bg |
| `slate-800` | `#1E293B` | Dark button hover |
| `slate-600` | `#475569` | Nav text on light, secondary text on light |
| `slate-500` | `#64748B` | Body copy on light, muted foreground |
| `slate-400` | `#94A3B8` | Captions, metadata, muted badges |
| `slate-300` | `#CBD5E1` | Disabled icons, decorative strokes |
| `border-default` | `#E2E8F0` | Card borders, section dividers, input borders, flanking lines |
| `surface-subtle` | `#F8FAFC` | Pricing free/team card bg, subtle surfaces |
| `surface-app` | `#FAFAFA` | App background (from `--background` CSS var) |
| `surface-card` | `#FFFFFF` | Card backgrounds on light |
| `nav-scrolled-bg` | `rgba(255,255,255,0.95)` | Nav frosted glass (scrolled state) |

### Semantic / Interactive Colors (Both Contexts)

| Token | Value | Usage |
|---|---|---|
| `color-interactive-primary` | `#2563EB` | Primary buttons, links, Applied stage, feature pillar 1 |
| `color-interactive-primary-hover` | `#1D4ED8` | Primary button hover |
| `color-interactive-primary-glow` | `rgba(37,99,235,0.35)` | CTA button box-shadow |
| `color-interactive-primary-subtle` | `rgba(37,99,235,0.10)` | Feature check icons on light |
| `color-accent-purple` | `#8B5CF6` | Screening stage, feature pillar 2 |
| `color-accent-amber` | `#F59E0B` | Interviewing stage, conversion warnings |
| `color-feedback-success` | `#10B981` | Offer stage, success icons, emerald accents |
| `color-feedback-error` | `#EF4444` | Rejected stage, loss indicators in funnel |
| `color-feedback-error-hero` | `#FC4D4D` | Hero emphasis number (slightly warmer red) |
| `color-disabled-bg` | `#E2E8F0` | Disabled button background |
| `color-disabled-text` | `#94A3B8` | Disabled button text |

### Pipeline Stage Colors

These are semantically fixed. Never change a stage color without updating all references.

| Stage | Color | Hex |
|---|---|---|
| Saved | Slate | `#64748B` |
| Applied | Blue | `#2563EB` |
| Screening | Purple | `#8B5CF6` |
| Interviewing | Amber | `#F59E0B` |
| Offer | Green | `#10B981` |
| Rejected | Red | `#EF4444` |
| Withdrawn | Gray | `#94A3B8` |

---

## Typography Scale

### Display / Hero (Marketing Context)

| Element | Size | Weight | Tracking | Font |
|---|---|---|---|---|
| H1 hero | `clamp(48px, 6vw, 80px)` | black (900) | `-0.03em` | Inter |
| H1 hero sub-line | `0.78em` of H1 | light (300) italic | `-0.03em` | Inter |
| H2 section | `text-4xl sm:text-5xl` (36–48px) | black (900) | `-0.03em` | Inter |
| H2 feature | `text-5xl sm:text-6xl` (48–60px) | black (900) | `-0.03em` | Inter |
| Price display | `clamp(42px, 4vw, 56px)` | black (900) | `-0.03em` | DM Mono |

### Content (Both Contexts)

| Element | Class | Size | Weight |
|---|---|---|---|
| H3 card heading | `text-xl` | 20px | bold (700), `-0.02em` |
| Body large | `text-lg leading-relaxed` | 18px | normal (400) |
| Body base | `text-base` | 16px | normal (400) |
| Body small | `text-sm leading-relaxed` | 14px | normal (400) |
| Caption / meta | `text-xs` | 12px | medium (500) |

### Eyebrow Labels (DM Mono)

Used above section headings to introduce context. Consistent pattern across all sections:

```tsx
<span style={{
  fontFamily: 'var(--font-dm-mono)',
  fontSize: '11px',          // or '12px' for slightly larger
  letterSpacing: '0.12em',   // or '0.14em' for section labels
  textTransform: 'uppercase',
  color: '#10B981',          // on dark — emerald
  // color: '#94A3B8',       // on light — slate-400
}}>
  Label text
</span>
```

### Flanking Line Pattern

Used to frame section eyebrow labels on light backgrounds:

```tsx
<div className="flex items-center gap-3 justify-center mb-5">
  <div className="flex-1 max-w-[60px] h-px bg-[#E2E8F0]" />
  <span style={{ fontFamily: 'var(--font-dm-mono)', fontSize: '12px', letterSpacing: '0.14em' }}
        className="text-[#94A3B8] uppercase flex-shrink-0">
    Section Label
  </span>
  <div className="flex-1 max-w-[60px] h-px bg-[#E2E8F0]" />
</div>
```

On dark backgrounds: replace with `<span className="block w-6 h-px bg-[#10B981]" />` + emerald text.

---

## Spacing & Layout

### Container

```tsx
<div className="max-w-6xl mx-auto px-5 sm:px-8">
```

- Max width: `max-w-6xl` (1152px)
- Horizontal padding: `px-5` mobile → `px-8` sm+

### Section Padding

```tsx
<section className="py-20 sm:py-28">
```

- Standard: `py-20` (80px) → `sm:py-28` (112px)
- Hero: `pt-28 pb-20` (accounts for fixed nav height 64px)

### Grid Systems

| Layout | Classes | Used in |
|---|---|---|
| 2-col hero | `grid grid-cols-1 lg:grid-cols-2 gap-16` | HeroSection |
| 3-col features | `grid grid-cols-1 md:grid-cols-3 gap-6` | FeaturePillars, PricingSection |
| Auto responsive | `grid grid-cols-1 sm:grid-cols-3 gap-5` | PricingSection (tighter) |

**Rule:** Always default `grid-cols-1` on mobile. Never start a grid at mobile breakpoint.

### Common Gap Values

| Gap | Value | Usage |
|---|---|---|
| `gap-1` | 4px | Icon + text inline |
| `gap-1.5` | 6px | Button icon gap |
| `gap-2` | 8px | Badge clusters, list items |
| `gap-2.5` | 10px | Feature list items |
| `gap-3` | 12px | Mobile menu CTAs |
| `gap-4` | 16px | Hero CTA row |
| `gap-5` | 20px | Pricing card grid |
| `gap-6` | 24px | Feature pillar grid |
| `gap-16` | 64px | Hero 2-col |

---

## Border Radius

| Token | Value | Usage |
|---|---|---|
| `rounded-full` | 9999px | Badges, tags, dot separators |
| `rounded-2xl` | 16px | Cards (feature pillars, pricing) |
| `rounded-xl` | 12px | Primary CTA buttons, icon containers, form containers |
| `rounded-lg` | 8px | Nav links, secondary buttons, mobile menu items |
| CSS var `--radius` | `0.625rem` (10px) | shadcn/ui base |

---

## Elevation & Shadow

| Name | Value | Usage |
|---|---|---|
| `shadow-sm` | `0 1px 2px rgba(0,0,0,0.05)` | Feature cards, default card elevation |
| `shadow-2xl` | large system shadow | Pro pricing card (featured) |
| CTA glow | `0 4px 16px rgba(37,99,235,0.35)` | Primary CTA button on dark bg |

---

## Buttons

### Marketing Primary (dark background)

```tsx
<Link
  href="/signup"
  className="inline-flex items-center justify-center gap-2 px-7 py-3.5 rounded-xl bg-[#2563EB] text-white text-sm font-semibold hover:bg-[#1D4ED8] transition-all min-h-[48px]"
  style={{ boxShadow: '0 4px 16px rgba(37,99,235,0.35)' }}
>
  Start free — no credit card
</Link>
```

### Marketing Ghost (dark background)

```tsx
<a
  className="inline-flex items-center justify-center gap-1.5 px-6 py-3.5 text-sm font-medium transition-colors min-h-[48px]"
  style={{ color: 'rgba(255,255,255,0.7)' }}
>
  See how it works
</a>
```

### Nav Outlined (dark background, transparent)

```tsx
<Link
  className="px-4 py-2 text-sm font-medium rounded-lg border border-white/20 text-white/75 hover:text-white hover:border-white/40 transition-colors min-h-[44px] flex items-center"
>
  Log in
</Link>
```

### App Dark (light background)

```tsx
<Link
  className="min-h-[44px] flex items-center justify-center rounded-xl bg-[#0F172A] text-white text-sm font-semibold hover:bg-[#1E293B] transition-colors"
>
  Get started free
</Link>
```

### Disabled State

```tsx
className="bg-[#E2E8F0] text-[#94A3B8] cursor-default pointer-events-none"
```

### shadcn/ui Button (App context)

Use `<Button variant="default|outline|secondary|ghost|destructive|link" size="default|xs|sm|lg|icon">` from `@/components/ui/button`. Extended via `cva`. Always prefer shadcn Button inside the app. Use custom classes only in marketing components.

**Touch targets:** All interactive elements must be `min-h-[44px]` minimum. Hero CTAs use `min-h-[48px]`.

---

## Badges & Tags

### On Dark (Marketing context)

```tsx
// Emerald — featured / success
<span style={{
  background: 'rgba(16,185,129,0.15)',
  color: '#10B981',
  border: '1px solid rgba(16,185,129,0.3)',
  fontFamily: 'var(--font-dm-mono)',
}} className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium">
  Most popular
</span>

// Muted — coming soon
<span style={{
  background: 'rgba(100,116,139,0.1)',
  color: '#64748B',
  border: '1px solid rgba(100,116,139,0.2)',
}} className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium">
  Coming soon
</span>
```

### Dynamic (Feature Pillars — any accent color)

```tsx
<span style={{
  color: badge.color,
  borderColor: `${badge.color}35`,
  background: `${badge.color}0a`,
  fontFamily: 'var(--font-dm-mono)',
}} className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border">
  Pro
</span>
```

**Badge formula:** For any accent color `C`:
- Background: `${C}0a` (4% opacity)
- Border: `${C}35` (21% opacity)
- Text: `C` at full opacity

---

## Cards

### Feature Pillar Card (light background)

```tsx
<div className="relative rounded-2xl bg-white border border-[#E2E8F0] shadow-sm overflow-hidden flex flex-col h-full">
  {/* Colored top accent bar — 4px */}
  <div className="h-1 w-full" style={{ background: accentColor }} />

  <div className="p-7 flex flex-col flex-1">
    {/* Icon container */}
    <div className="w-12 h-12 rounded-xl flex items-center justify-center mb-6"
         style={{ background: `${accentColor}14`, color: accentColor }}>
      {icon}
    </div>
    {/* Badge row, heading, body copy */}
  </div>
</div>
```

**Card top accent bar:** 4px (`h-1`) colored stripe = the card's accent color. Used to signal category/stage at a glance.

**Icon container formula:** Background = `${accentColor}14` (8% opacity). This creates a colored tint that always pairs with the full-opacity icon.

### Pricing Card — Standard

```tsx
<div className="rounded-2xl bg-[#F8FAFC] border border-[#E2E8F0] p-7 flex flex-col">
```

### Pricing Card — Featured (Pro)

```tsx
<div className="rounded-2xl bg-[#0C1A17] ring-2 ring-[#10B981]/40 shadow-2xl p-7 flex flex-col">
```

The featured card uses `ring-2 ring-[#10B981]/40` instead of a border — giving the emerald accent glow ring.

---

## Special Effects & Utilities

### Marketing Grid Background

```css
.marketing-grid-bg {
  background-image:
    repeating-linear-gradient(rgba(16,185,129,0.07) 0px, rgba(16,185,129,0.07) 1px, transparent 1px, transparent 40px),
    repeating-linear-gradient(90deg, rgba(16,185,129,0.07) 0px, rgba(16,185,129,0.07) 1px, transparent 1px, transparent 40px);
}
```

Used on: hero section bg, login left panel. The 40px emerald grid is a core brand texture — always on dark Ink backgrounds.

### Radial Glow

```tsx
<div
  className="absolute top-[-200px] right-[-100px] w-[700px] h-[700px] rounded-full pointer-events-none"
  style={{ background: 'radial-gradient(circle, rgba(16,185,129,0.18) 0%, transparent 70%)' }}
/>
```

Positioned absolute, `pointer-events-none`, always in the corner of a dark section. Creates the atmospheric depth behind content.

### Frosted Glass Nav (scrolled state)

```tsx
className={scrolled
  ? 'bg-white/95 backdrop-blur-sm border-b border-[#E2E8F0] shadow-sm'
  : 'bg-transparent'}
```

### Dot Separator (trust line, inline lists)

```tsx
<span className="inline-block w-[3px] h-[3px] rounded-full mx-2"
      style={{ background: 'rgba(255,255,255,0.3)' }} />
```

---

## Animations

### Staggered Fade-in-up (page load)

```css
.fade-in-up-1 { opacity: 0; animation: fadeInUp 0.55s ease 0.1s forwards; }
.fade-in-up-2 { opacity: 0; animation: fadeInUp 0.55s ease 0.2s forwards; }
.fade-in-up-3 { opacity: 0; animation: fadeInUp 0.55s ease 0.3s forwards; }
.fade-in-up-4 { opacity: 0; animation: fadeInUp 0.55s ease 0.4s forwards; }
```

Use on hero content (eyebrow = -1, H1 = -2, sub-copy = -3, CTAs = -4). Max 4 elements per stagger group.

### Scroll Reveal

Use the `<RevealWrapper>` component (`delay={i * 100}` for staggered grids):

```tsx
import { RevealWrapper } from '@/components/marketing/RevealWrapper'

<RevealWrapper delay={200}>
  <YourComponent />
</RevealWrapper>
```

Applies `reveal-init` / `reveal-show` classes (opacity 0 → 1, translateY 28px → 0, 0.65s ease).

### Button Hover Rules

- Scale: `active:scale-95` on all buttons (shadcn/ui handles this)
- Color: `transition-colors duration-200` on all interactive elements
- Complex motion: Framer Motion only (e.g., animated icons)
- **Never** animate `width`, `height`, `top`, `left` directly — GPU only (`translate`, `scale`, `opacity`)

---

## Component Inventory

### Marketing (12 components in `/src/components/marketing/`)

| Component | Context | Notes |
|---|---|---|
| `MarketingNav` | Dark + light (scroll-aware) | Sticky, two states: transparent-dark / frosted-white |
| `HeroSection` | Dark | Grid bg + radial glow + stagger animations + SVG funnel |
| `StatsBar` | Light | Social proof numbers row |
| `ProblemBlock` | Light or dark | Narrative copy block |
| `FeaturePillars` | Light | 3-col cards with accent bars + scroll reveal |
| `HowItWorks` | Light or dark | Step-by-step flow |
| `DashboardMockup` | Dark | Product screenshot / SVG mockup |
| `PricingSection` | Light | 3-col pricing cards (free/pro/team) |
| `FAQSection` | Light | Accordion |
| `FinalCTA` | Dark | Bottom CTA section |
| `MarketingFooter` | Dark | Links + legal |
| `RevealWrapper` | Any | Scroll-triggered reveal HOC |

### App Shell (`/src/components/layout/`)

| Component | File(s) | Description | Spec |
|---|---|---|---|
| `Sidebar` | `sidebar.tsx` · `mobile-nav.tsx` | Desktop left sidebar + mobile bottom bar. Shared nav items via `/lib/nav-items.ts`. Sprint 2: token migration + dark mode pending. | [Sidebar.md](./components/Sidebar.md) |

### App UI (`/src/components/ui/` — shadcn/ui)

`Button`, `Badge`, `Avatar`, `Card`, `Checkbox`, `Dialog`, `Input`, `Label`, `Select`, `Separator`, `Sheet`, `Textarea`, `Tooltip`, `Switch`, `Sonner`

---

## Theming (Light/Dark Mode)

The app uses Tailwind `dark:` + `next-themes`. CSS custom properties in `globals.css` define both states.

**Key mapping:**

| CSS var | Light | Dark |
|---|---|---|
| `--primary` | `oklch(0.546 0.243 262.881)` ≈ `#2563EB` | `oklch(0.623 0.214 259.815)` lighter blue |
| `--background` | white | near-black |
| `--card` | white | dark surface |
| `--muted` | `oklch(0.97 0 0)` light gray | `oklch(0.269 0 0)` dark gray |
| `--border` | `oklch(0.922 0 0)` | `oklch(1 0 0 / 10%)` semi-transparent |

**Marketing sections are always dark** — they don't respond to `prefers-color-scheme`. Only the app shell toggles dark mode.

---

## Do / Don't

| ❌ Don't | ✅ Do |
|---|---|
| Use a raw hex color not in this doc | Pick the nearest token; if none fits, add it here first |
| Use Inter for data/metrics | Use DM Mono for all numbers, labels, pipeline tags |
| Use DM Mono for body copy | Use Inter for prose and instructions |
| Create a new font size with `text-[17px]` | Use the closest Tailwind step: `text-sm` / `text-base` / `text-lg` |
| Put `grid-cols-2` as the default | Always start `grid-cols-1`, add breakpoint variants |
| Build a custom CSS file for a new component | Extend with Tailwind utility classes + shadcn/ui `cva` |
| Set `min-h-[40px]` on a button | All interactive elements must be `min-h-[44px]` minimum |
| Use `@dnd-kit` alternatives or D3 directly | @dnd-kit/core for drag; Recharts for all charts |
| Set a hover state without a transition | Always pair with `transition-colors` or `transition-all` |
| Use `outline: none` on a focus state | Always provide a visible focus ring |

---

## How to Use This System When Building a New Page

1. **Decide the context** — Marketing (dark Ink) or App (light)?
2. **Pick your palette** — use tokens from the matching column above
3. **Set up typography** — H1/H2 if hero, eyebrow pattern if section opener
4. **Use `RevealWrapper`** for any below-the-fold content
5. **Use `<Button>` from shadcn/ui** in the app; custom classes only in marketing
6. **Run `/audit-system [page name]`** before marking the PR ready

---

## Extending This System

When you add a new visual value:

1. Check this doc first — if a token covers it, use that
2. If genuinely new, add it to the appropriate token table above
3. Update `globals.css` if it needs a CSS custom property
4. Reference both light and dark values

When you add a new component:

1. Run `/create-component [name]` to generate a spec
2. Reference the spec in code comments on the component file
3. Add it to the Component Inventory table above

---

---

# Step 2 — Component Specs

Full anatomy, states, props, and edge cases for every component in the system. Read the relevant spec before touching or cloning a component.

---

## MarketingNav

**File:** `src/components/marketing/MarketingNav.tsx`
**Context:** Marketing (always renders on dark, transitions to light on scroll)

### Anatomy

```
<header> fixed, z-50
  ├── Logo (text "Job Funnel")
  ├── Desktop nav links (hidden md:flex) — Features, Pricing, FAQ
  ├── Desktop CTAs — Log in (outlined), Start free (primary)
  └── Mobile hamburger button (md:hidden)

<div> Mobile overlay (full-screen, z-40)
  ├── Backdrop (click to close)
  └── Slide-down panel
        ├── Nav links (stacked, min-h-[44px])
        └── CTA row — Log in (outlined) + Start free (primary, full-width)
```

### States

| State | Visual behaviour |
|---|---|
| **Transparent** (scroll Y < 80px) | `bg-transparent`, white text/links, white/20 border on login CTA |
| **Scrolled** (scroll Y ≥ 80px) | `bg-white/95 backdrop-blur-sm border-b border-[#E2E8F0] shadow-sm`, `#0F172A` text |
| **Mobile closed** | Hamburger icon visible, three horizontal bars |
| **Mobile open** | Bars animate to × (top+bottom bars rotate ±45°, middle fades). Body scroll locked. Panel slides from top. |

### Props / Behaviour

- No external props — self-contained with internal `scrolled` and `mobileOpen` state
- Scroll listener uses `{ passive: true }` — do not remove this
- Body scroll lock on mobile open: `document.body.style.overflow = 'hidden'`
- Height: always `h-16` (64px)

### Edge Cases

- On mobile, the "Start free" CTA in the overlay is full-width and shows "Start free — no credit card" (longer label than desktop)
- Logo colour changes from white → `#0F172A` on scroll — never hardcode white for the logo
- Do not add new nav items without also adding them to the mobile panel

---

## HeroSection

**File:** `src/components/marketing/HeroSection.tsx`
**Context:** Marketing dark. Always the first section — no top padding needed from outside.

### Anatomy

```
<section> min-h-screen, bg-[#0C1A17], marketing-grid-bg
  ├── Radial glow (absolute, top-right, pointer-events-none)
  ├── <div> max-w-6xl container
  │     └── grid: 1-col mobile / 2-col lg
  │           ├── Left: text column
  │           │     ├── Eyebrow (DM Mono, emerald, line + text)
  │           │     ├── H1 (black 900, clamp 48–80px, -0.03em)
  │           │     │     ├── Stat number (white, neutral)
  │           │     │     ├── Stat number 2 (color-feedback-error-hero #FC4D4D)
  │           │     │     └── Sub-line (slate italic, 0.78em, light 300)
  │           │     ├── Sub-copy (white/65, text-lg)
  │           │     ├── CTA row: Primary button + Ghost link
  │           │     └── Trust line (DM Mono, dot separators, white/50)
  │           └── Right: FunnelSVG (hidden on mobile — lg:justify-end)
  └── Scroll hint (absolute bottom, bouncing chevron)
```

### FunnelSVG Internals

The SVG is inline, `viewBox="0 0 360 440"`. Bars animate via SMIL `<animate>` tags:
- Applied bar: `dur="0.8s" begin="0.8s"` with spring easing
- Lost bars animate slightly after their corresponding stage bar
- Stagger: `0.8s → 1.0s → 1.1s → 1.3s → 1.4s → 1.6s`
- Offer bar: `dur="0.6s" begin="1.6s"`

Stage colors in SVG match pipeline tokens exactly: Applied `#2563EB`, Screening `#8B5CF6`, Interviewing `#F59E0B`, Offer `#10B981`, Lost `rgba(239,68,68,*)`.

### Edge Cases

- Eyebrow line (`w-6 h-px bg-[#10B981]`) must be a separate `<span>` — not a CSS pseudo-element, or it will not be read correctly in some browsers
- FunnelSVG is hidden on mobile (`lg:justify-end` parent) — the section must still work without it
- Scroll hint is `absolute bottom-9` — ensure no other content overlaps at bottom of viewport
- The sub-line italic is `fontStyle: 'italic', fontWeight: 300` — requires Inter's light variant to be loaded

---

## StatsBar

**File:** `src/components/marketing/StatsBar.tsx`
**Context:** Marketing dark (`#112219` = Ink-800, slightly lighter than hero)

### Anatomy

```
<section> bg-[#112219], border-y border-white/5
  └── max-w-6xl container, py-16
        ├── Intro label (DM Mono, white/30, uppercase, centered)
        └── grid: 1-col mobile / 3-col sm
              └── [3× stat cells]
                    ├── Large number (DM Mono, clamp 42–60px, font-black, white)
                    │     └── <sup> superscript (emerald #10B981, 0.5em)
                    └── Label (text-sm, white/40, max-w-[200px] centred)
```

### Stat Cell Borders

Each cell except the last gets `sm:border-r sm:border-white/[0.07]` on desktop and `border-b sm:border-b-0 border-white/[0.07]` on mobile. These are conditional on `i < stats.length - 1`.

### Edge Cases

- Superscript (`+`, `%`) is in emerald — if a stat has no sup, the space collapses cleanly (no `null` render)
- On mobile the cells stack vertically with bottom border dividers; on sm+ they sit side by side with right border dividers

---

## ProblemBlock

**File:** `src/components/marketing/ProblemBlock.tsx`
**Context:** Three sequential acts — two light, one dark

### Structure

```
<div> (no outer wrapper — just 3 sections in sequence)
  ├── Act 01: bg-[#F8FAFC], 2-col (text left / ChaosVisual right, lg-only)
  ├── Act 02: bg-[#F1F5F9], 2-col (SpreadsheetVisual left / text right, lg-only)
  └── Act 03: bg-[#0C1A17] + marketing-grid-bg, 2-col (text + mini card left / funnel bars right, lg-only)
```

### ActLabel Component

```tsx
// Dark variant (Act 03):
<ActLabel number="03" dark />
// → emerald line + emerald text

// Light variant (Acts 01, 02):
<ActLabel number="01" />
// → #CBD5E1 line + #94A3B8 text
```

### Decorative Numbers

Acts 02 and 03 have large ghost numbers (DM Mono, `clamp(80px, 12vw, 160px)`, font-weight 900):
- Light: `color: 'rgba(0,0,0,0.04)'` — positioned `top-8 left-8`
- Dark: `color: 'rgba(255,255,255,0.04)'` — positioned `top-6 right-6`
- Always `hidden sm:block select-none pointer-events-none`

### ChaosVisual

Cards have `inline-flex`, varied `marginLeft` (4–42%), and small `rotate()` transforms (-1.5° to +1.5°). This is purely decorative and hidden on mobile.

### Blockquote Pattern

```tsx
<blockquote className="border-l-2 border-[#10B981] pl-5 text-base italic leading-relaxed text-[#1A3329]">
  ...emphasis text...
</blockquote>
```

Left border accent `border-l-2 border-[#10B981]` is the blockquote indicator. Always emerald, always 2px.

### Mini Funnel Card (Act 03)

```tsx
// Glassmorphism card on dark bg
<div className="rounded-xl p-5" style={{
  background: 'rgba(255,255,255,0.05)',
  border: '1px solid rgba(255,255,255,0.08)',
}}>
```

Row pattern: label left (`text-white/60`) + rate right (colored by `#EF4444` / `#10B981` / `#F59E0B`) + benchmark (`text-white/25`).

---

## FeaturePillars

**File:** `src/components/marketing/FeaturePillars.tsx`
**Context:** Light (`bg-white`)

### Card Anatomy

```
<div> rounded-2xl, white, border-[#E2E8F0], shadow-sm, overflow-hidden, flex col
  ├── Accent bar: h-1 (4px), full-width, accent color
  └── <div> p-7 flex col flex-1
        ├── Icon container: w-12 h-12, rounded-xl, bg=[accentColor]14, color=accentColor
        │     └── SVG icon (22×22, strokeWidth 1.75)
        ├── Badge row: flex gap-2 mb-5
        │     └── [1–2 badges] DM Mono, xs, dynamic color formula
        ├── H3: text-xl font-bold #0F172A, -0.02em tracking
        └── Body: text-sm #64748B, leading-relaxed
```

### Pillar → Color mapping

| Pillar | Accent | Icon badge |
|---|---|---|
| Funnel Analytics | `#2563EB` Blue | Pro (blue) |
| Interview Content OS | `#8B5CF6` Purple | Pro (purple) |
| CV Experimentation | `#10B981` Emerald | Pro (gray) + Unique (emerald) |

### Edge Cases

- Cards use `flex flex-col h-full` — all 3 cards in the grid stretch to the same height
- `overflow-hidden` is on the outer div so the accent bar sits flush at the top edge with no gap
- Icon SVG uses `stroke="currentColor"` so it inherits `color: accentColor` from the container

---

## HowItWorks

**File:** `src/components/marketing/HowItWorks.tsx`
**Context:** Light (`bg-[#F8FAFC]`)

### Step Anatomy

```
<div> (per step)
  ├── Step bubble: w-16 h-16, rounded-full, bg-white, border-[#E2E8F0]
  │     boxShadow: '0 0 0 6px rgba(16,185,129,0.06), 0 2px 10px rgba(0,0,0,0.06)'
  │     └── Step number (DM Mono, sm, font-bold, #10B981, tracking 0.02em)
  ├── H3: text-xl font-semibold #0F172A, -0.01em tracking
  └── Body: text-sm #64748B leading-relaxed
```

### Connector Line (desktop only)

```tsx
<div className="hidden md:block absolute top-8 left-[calc(16.67%+2rem)] right-[calc(16.67%+2rem)] h-px"
     style={{ background: 'linear-gradient(to right, #E2E8F0 0%, #10B981 50%, #E2E8F0 100%)' }}
     aria-hidden="true" />
```

`aria-hidden="true"` is required — always preserve it. The line is decorative. It passes through the centre of the step bubbles (`top-8` = 32px = half the 64px bubble height).

### Edge Cases

- Grid gap is `gap-12 md:gap-8` — larger on mobile (stacked), tighter on desktop (side by side with connector)
- Connector line uses `left-[calc(16.67%+2rem)]` to clear the first bubble, `right-[calc(16.67%+2rem)]` to clear the last

---

## DashboardMockup

**File:** `src/components/marketing/DashboardMockup.tsx`
**Context:** Marketing dark (`bg-[#0C1A17]`)

### Shell Anatomy

```
<section> bg-[#0C1A17] + marketing-grid-bg
  └── Container
        ├── Eyebrow (dark variant: emerald/50 text, emerald/20 lines)
        ├── H2 (white, font-black)
        ├── Sub-copy (white/45)
        └── Dashboard shell: rounded-2xl, bg-white/4%, border-white/8%
              ├── Window chrome: traffic-light dots + URL label (DM Mono, white/20)
              └── Content: p-5 sm:p-8
                    ├── Metric cards grid: 2-col / 4-col lg
                    │     └── [4 cards] value (DM Mono, colored) + label + delta
                    └── Funnel chart panel: bg-black/20, border-white/6%
                          ├── Header row: label + live badge (emerald)
                          └── [4 funnel rows] label + AnimatedBar + rate
```

### AnimatedBar Component

Uses `IntersectionObserver` (threshold 0.4) to trigger animation when in viewport. Sets `width` via React state, animated with `transition: 'width 0.75s cubic-bezier(0.34,1.56,0.64,1)'` (spring-like overshoot). Delay: `i * 120ms`.

### Highlighted Metric Card

The "Screening Rate" card uses a green-tinted highlight variant:
```tsx
style={{
  background: 'rgba(16,185,129,0.08)',
  border: '1px solid rgba(16,185,129,0.2)',
}}
```

### Edge Cases

- Traffic-light dots use 60% opacity (`bg-[#EF4444]/60` etc.) — do not use full opacity as they are decorative chrome
- URL label (`jobfunnel.app/analytics`) is purely decorative — `pointer-events-none` via parent
- `AnimatedBar` triggers once and then `unobserve`s — animation fires only on first scroll-into-view

---

## PricingSection

**File:** `src/components/marketing/PricingSection.tsx`
**Context:** Light (`bg-white`)

### Card Variants

| Tier | Card style | CTA |
|---|---|---|
| Free | `bg-[#F8FAFC] border border-[#E2E8F0]` | `bg-[#0F172A] text-white hover:bg-[#1E293B]` |
| Pro (featured) | `bg-[#0C1A17] ring-2 ring-[#10B981]/40 shadow-2xl` | `bg-[#2563EB] text-white hover:bg-[#1D4ED8]` |
| Team (coming soon) | `bg-[#F8FAFC] border border-[#E2E8F0] opacity-70` | `bg-[#E2E8F0] text-[#94A3B8] pointer-events-none` |

### Feature List Item Pattern

```tsx
// Included ✓
<circle fill={highlighted ? 'rgba(16,185,129,0.15)' : 'rgba(37,99,235,0.1)'} />
<path stroke={highlighted ? '#10B981' : '#2563EB'} />  // check icon

// Excluded ✗
<circle fill="rgba(148,163,184,0.1)" />
<path stroke="#CBD5E1" />  // × icon
<span style={{ textDecoration: 'line-through', textDecorationColor: 'rgba(148,163,184,0.4)' }}>
```

### Price Display

```tsx
<span style={{
  fontFamily: 'var(--font-dm-mono)',
  letterSpacing: '-0.03em',
  fontSize: 'clamp(42px, 4vw, 56px)',
}} className="font-black">
  €15
  <sup className="text-[#10B981]" style={{ fontSize: '0.45em', verticalAlign: 'super' }}>
    {priceSup}
  </sup>
</span>
```

### Edge Cases

- All cards use `items-start` on the grid so they don't stretch to equal height (pricing cards have different content lengths — visual top-alignment is intentional)
- "No lock-in." footer note on Pro is DM Mono, `text-white/30`, centred — always present when `tier.note` exists
- Coming Soon card: `pointer-events-none` on CTA but the full card is still focusable — do not remove the semantic card markup

---

## FAQSection

**File:** `src/components/marketing/FAQSection.tsx`
**Context:** Light (`bg-white`)

### Accordion Anatomy

```
<div> max-w-3xl, rounded-2xl, border-[#E2E8F0]
  └── [N× accordion items]
        ├── <button> aria-expanded, flex justify-between, min-h-[44px], px-6 py-5
        │     ├── Question text (text-base semibold #0F172A, group-hover:text-[#2563EB])
        │     └── Toggle icon circle (w-6 h-6, rounded-full)
        │           → closed: bg-[#F1F5F9], + icon (slate-500)
        │           → open: bg-[#0F172A], × icon (white, rotated 45°)
        └── Answer panel (grid row animation: 0fr → 1fr)
              └── <div> overflow-hidden
                    └── Content: px-6 pb-5
                          ├── <p> text-sm #64748B leading-relaxed
                          ├── <pre> code block (optional, DM Mono, bg-[#F8FAFC])
                          └── <p> after-code text (optional)
```

### Height Animation

Uses the CSS grid row trick — **not** `max-height`. This gives a smooth, content-aware expansion:

```tsx
<div className="grid transition-all duration-300 ease-in-out"
     style={{ gridTemplateRows: isOpen ? '1fr' : '0fr' }}>
  <div className="overflow-hidden">
    {content}
  </div>
</div>
```

Do not replace this with `max-height` animation — it causes layout shift on varying content.

### Code Block Pattern (inside FAQ answers)

```tsx
<pre style={{
  fontFamily: 'var(--font-dm-mono)',
  background: '#F8FAFC',
  border: '1px solid #E2E8F0',
  color: '#475569',
  lineHeight: 1.8,
}} className="text-xs rounded-lg px-4 py-3 mb-3 overflow-x-auto">
```

### Edge Cases

- Only one item can be open at a time (`open === i`)
- Item dividers: `border-b border-[#E2E8F0]` on all items except the last
- The question text transitions to `text-[#2563EB]` on button hover — this is a `group-hover` on the button, not focus

---

## FinalCTA

**File:** `src/components/marketing/FinalCTA.tsx`
**Context:** Marketing dark (`bg-[#0C1A17]`, always with `marketing-grid-bg`)

### Anatomy

```
<section> bg-[#0C1A17] + marketing-grid-bg, py-24 sm:py-32
  └── max-w-6xl, text-center
        ├── H2 (white, font-black, clamp 36–48px, -0.03em)
        ├── Sub-copy (white/50, text-lg, max-w-md mx-auto)
        ├── Primary CTA: rounded-xl bg-[#2563EB], px-8 py-4, min-h-[52px]
        └── Trust footer: DM Mono, white/25, "GDPR-compliant · Built in Europe · Cancel anytime"
```

Note: the hero CTA is `min-h-[48px]` while the FinalCTA button is `min-h-[52px]` — slightly taller for visual emphasis at the bottom of the page.

---

## MarketingFooter

**File:** `src/components/marketing/MarketingFooter.tsx`
**Context:** Marketing dark (`bg-[#112219]` = Ink-800)

### Anatomy

```
<footer> bg-[#112219], border-t border-white/5
  └── max-w-6xl, py-12
        ├── Top row: flex col sm:flex-row justify-between gap-8
        │     ├── Brand: "Job Funnel" (white bold) + tagline (white/40)
        │     └── Nav links: flex wrap gap-x-6 gap-y-2
        │           └── [5 links] text-sm white/40 hover:white/70
        └── Bottom row: border-t border-white/5, flex col sm:flex-row justify-between
              ├── Copyright (DM Mono, white/25)
              └── GDPR badge (emerald/60 text, emerald/10 bg, emerald/15 border)
```

### GDPR Badge Pattern

```tsx
<span style={{
  background: 'rgba(16,185,129,0.1)',
  color: 'rgba(16,185,129,0.6)',
  border: '1px solid rgba(16,185,129,0.15)',
  fontFamily: 'var(--font-dm-mono)',
}} className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs">
  <svg>...check circle...</svg>
  GDPR Compliant
</span>
```

The SVG check icon inside this badge is `10×10`, `stroke="currentColor"`, `strokeWidth="1.2"`.

---

## AuthShell (Login / Signup)

**File:** `src/components/auth/AuthShell.tsx`
**Context:** Split-screen — dark left (lg+) / light right

### Anatomy

```
<div> min-h-screen flex
  ├── Left panel (hidden lg:flex, width 42%, bg-[#0C1A17], padding 40px 48px)
  │     ├── Grid texture (same as marketing-grid-bg but at 0.06 opacity)
  │     ├── Radial glow (top-right, rgba(16,185,129,0.12))
  │     └── Content (z-10)
  │           ├── Logo: emerald square (w-8 h-8, rounded-lg, bg-[#10B981]) + wordmark
  │           ├── {leftContent} slot (page-specific, e.g. LoginLeftContent)
  │           └── Footer: copyright DM Mono white/20
  └── Right panel (flex-1, bg-white, flex items-center justify-center)
        ├── Mobile logo (lg:hidden, same logo but dark text #0F172A)
        └── {children} slot (max-w-[380px], e.g. MagicLinkForm)
```

### Logo Component (consistent across auth)

```tsx
// Emerald square icon
<div className="w-8 h-8 rounded-lg flex items-center justify-center"
     style={{ background: '#10B981' }}>
  <svg width="16" height="16" viewBox="0 0 18 18" fill="none">
    <path d="M3 4h12M5 8h8M7 12h4" stroke="white" strokeWidth="2" strokeLinecap="round" />
  </svg>
</div>
// Wordmark
<span className="font-bold" style={{ fontSize: '15px', letterSpacing: '-0.02em' }}>
  Job Funnel
</span>
```

This logo is the canonical mark. The marketing nav uses a text-only "Job Funnel" — the icon mark only appears in the auth shell.

### Trust Badges (LoginLeftContent)

```tsx
<span style={{
  fontFamily: 'var(--font-dm-mono)',
  color: 'rgba(255,255,255,0.35)',
  background: 'rgba(255,255,255,0.05)',
  border: '1px solid rgba(255,255,255,0.08)',
  borderRadius: '6px',  // rounded-md, not rounded-full
}} className="inline-flex items-center gap-1.5 px-2.5 py-1 text-xs">
  <span className="w-1.5 h-1.5 rounded-full" style={{ background: '#10B981', opacity: 0.7 }} />
  {badge}
</span>
```

Note: these trust badges use `rounded-md` (rectangular pill), while footer/pricing badges use `rounded-full`. This is intentional — auth badges feel more "technical".

### Edge Cases

- Left panel is fully hidden below `lg` breakpoint — the right panel must be fully functional standalone at mobile
- Mobile logo uses `#0F172A` wordmark, not white — because it renders on the white right panel background
- The mini funnel preview in `LoginLeftContent` uses `h-1.5` bars (very thin) vs the `h-9` bars in `DashboardMockup` — different density for different contexts

---

## RevealWrapper

**File:** `src/components/marketing/RevealWrapper.tsx`
**Context:** Any — wraps any content that should animate in on scroll

### Props

| Prop | Type | Default | Description |
|---|---|---|---|
| `children` | `ReactNode` | required | Content to reveal |
| `className` | `string` | `''` | Additional classes on wrapper |
| `delay` | `number` | `0` | ms delay before reveal triggers |
| `as` | `'div' \| 'section' \| 'li'` | `'div'` | HTML element to render |

### Behaviour

- Uses `IntersectionObserver` with `threshold: 0.1` and `rootMargin: '0px 0px -48px 0px'`
- Adds `reveal-show` class when 10% of element enters viewport (with 48px bottom offset)
- `unobserve` after first trigger — animates once only, never resets
- CSS: `reveal-init` sets `opacity: 0; transform: translateY(28px)`. `reveal-show` removes both with `transition: opacity 0.65s ease, transform 0.65s ease`

### Staggered Grid Pattern

```tsx
{items.map((item, i) => (
  <RevealWrapper key={item.id} delay={i * 100}>
    <Card />
  </RevealWrapper>
))}
```

Use `delay={i * 100}` for 3-item grids (0, 100, 200ms). Use `delay={i * 120}` for steps (as in `HowItWorks`).

---

## Sidebar (App)

**File:** `src/components/layout/sidebar.tsx`
**Context:** App — always light (`bg-slate-100`)

### ⚠ Inconsistency Flag

The Sidebar currently uses raw Tailwind `gray-*` and `slate-*` utility classes (`bg-slate-100`, `text-blue-600`, `text-gray-900`) instead of the CSS custom property token system defined in `globals.css`. This is the one place in the codebase that diverges from the token architecture. When refactoring, align to:

| Current | Should be |
|---|---|
| `bg-slate-100` | `bg-muted` or `bg-[#F1F5F9]` |
| `text-blue-600` | `text-primary` |
| `text-gray-900` | `text-foreground` |
| `border-gray-200` | `border-border` |
| `text-gray-500` | `text-muted-foreground` |

### Active State (Framer Motion)

```tsx
{isActive(href) && (
  <motion.div
    layoutId="nav-indicator"
    className="absolute inset-0 bg-white rounded-lg shadow-sm"
    transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] }}
  />
)}
```

`layoutId="nav-indicator"` — the shared layout animation smoothly slides the white pill between active items. This is the only place in the codebase that uses `layoutId`. Do not add a second element with the same `layoutId`.

---

---

# Step 3 — Theming: Deep Documentation

---

## The Two Palette System

JobFunnel has two parallel colour systems that must never bleed into each other.

```
Marketing context (always dark)          App context (light/dark toggle)
─────────────────────────────────        ───────────────────────────────
Source: inline style props               Source: CSS custom properties (globals.css)
Bg: #0C1A17 / #112219 / #F8FAFC         Bg: var(--background) OKLCH
Text: rgba(255,255,255,N)                Text: var(--foreground) OKLCH
Primary accent: #10B981 emerald          Primary: var(--primary) ≈ #2563EB blue
Tokens: hardcoded hex/rgba               Tokens: CSS vars + Tailwind config
Dark mode: ALWAYS dark (not toggled)     Dark mode: responds to next-themes class
```

Marketing components are **static** — they do not respond to the user's colour mode preference. The app shell is **dynamic** — it responds to the `dark` class on `<html>`.

---

## CSS Custom Property Map (App Context)

From `globals.css` — full light/dark mapping:

| Variable | Light (OKLCH) | Approx hex | Dark (OKLCH) | Approx hex |
|---|---|---|---|---|
| `--primary` | `oklch(0.546 0.243 262.881)` | `#2563EB` | `oklch(0.623 0.214 259.815)` | `#3B82F6` |
| `--primary-foreground` | `oklch(0.985 0 0)` | `#FAFAFA` | `oklch(0.985 0 0)` | `#FAFAFA` |
| `--background` | `oklch(1 0 0)` | `#FFFFFF` | `oklch(0.145 0 0)` | `#1C1C1E` |
| `--foreground` | `oklch(0.145 0 0)` | `#0F172A` | `oklch(0.985 0 0)` | `#F8FAFC` |
| `--card` | `oklch(1 0 0)` | `#FFFFFF` | `oklch(0.205 0 0)` | `#232327` |
| `--card-foreground` | `oklch(0.145 0 0)` | `#0F172A` | `oklch(0.985 0 0)` | `#F8FAFC` |
| `--muted` | `oklch(0.97 0 0)` | `#F5F5F5` | `oklch(0.269 0 0)` | `#2E2E32` |
| `--muted-foreground` | `oklch(0.556 0 0)` | `#64748B` | `oklch(0.708 0 0)` | `#94A3B8` |
| `--border` | `oklch(0.922 0 0)` | `#E2E8F0` | `oklch(1 0 0 / 10%)` | `rgba(255,255,255,0.10)` |
| `--input` | `oklch(0.922 0 0)` | `#E2E8F0` | `oklch(1 0 0 / 15%)` | `rgba(255,255,255,0.15)` |
| `--destructive` | `oklch(0.577 0.245 27.325)` | `#EF4444` | `oklch(0.704 0.191 22.216)` | `#F87171` |
| `--ring` | `oklch(0.623 0.214 259.815)` | `#3B82F6` | `oklch(0.556 0 0)` | `#64748B` |

### Sidebar-specific tokens (CSS vars)

```css
--sidebar: oklch(0.985 0 0)      /* light: near-white */
--sidebar-foreground: oklch(0.145 0 0)
--sidebar-primary: oklch(0.546 0.243 262.881)   /* = primary */
--sidebar-accent: oklch(0.97 0 0)
--sidebar-border: oklch(0.922 0 0)
```

---

## Marketing Palette — Exact Values

These are NOT CSS custom properties. They are hardcoded in component files. Use these exact values in any new marketing section.

### Backgrounds (dark)

| Name | Hex | Used in |
|---|---|---|
| Ink-900 | `#0C1A17` | Hero, Act 03, DashboardMockup, FinalCTA, AuthShell left panel |
| Ink-800 | `#112219` | StatsBar, MarketingFooter |
| Ink-700 | `#1A3329` | (available, not currently used as bg) |
| Dark surface | `rgba(255,255,255,0.04)` | Glassmorphism cards on Ink-900 |
| Darker surface | `rgba(0,0,0,0.20)` | Funnel chart panel in DashboardMockup |

### Backgrounds (light, marketing)

| Name | Hex | Used in |
|---|---|---|
| Warm white | `#F8FAFC` | Act 01, HowItWorks, pricing non-featured, FAQ |
| Soft grey | `#F1F5F9` | Act 02 |
| Pure white | `#FFFFFF` | FeaturePillars, PricingSection top-level, FAQ accordion interior |

### Borders

| Surface | Border value |
|---|---|
| Light sections | `#E2E8F0` |
| Dark sections | `rgba(255,255,255,0.05)` to `rgba(255,255,255,0.08)` |
| Glassmorphism cards (dark) | `rgba(255,255,255,0.08)` |
| Section separators (dark) | `border-white/5` |

---

## Dark Mode Gaps — Known Issues

These are places where the app dark mode is not fully implemented or has inconsistencies:

| Location | Issue | Fix |
|---|---|---|
| `Sidebar` | Uses raw `bg-slate-100`, `text-gray-*` — not CSS vars | Migrate to `bg-sidebar`, `text-sidebar-foreground`, etc. |
| Marketing components | Hardcoded hex colours — won't change in dark mode | Intentional — marketing is always dark. Do not add `dark:` variants to marketing components. |
| `AuthShell` left panel | Grid texture at 6% opacity vs marketing at 7% | Minor — can align to 7% for consistency |
| Chart colours | DashboardMockup uses hardcoded pipeline stage colours | Fine for demo; production Recharts charts should use CSS vars for theme adaptability |

---

## prefers-reduced-motion Gap

None of the current animations respect `prefers-reduced-motion`. This is a **Major** accessibility and UX debt. When building new animated components, always wrap:

```css
@media (prefers-reduced-motion: reduce) {
  .reveal-init { transition: none; opacity: 1; transform: none; }
  .fade-in-up-1, .fade-in-up-2, .fade-in-up-3, .fade-in-up-4 {
    animation: none; opacity: 1;
  }
}
```

---

---

# Step 4 — Accessibility Audit (WCAG 2.2 AA)

**Scope:** Homepage (`/`) + Login (`/login`) — all marketing components + AuthShell
**Standard:** WCAG 2.2 Level AA
**Method:** Static code analysis of all component files

---

## Summary

| Severity | Count |
|---|---|
| 🔴 Critical | 3 |
| 🟠 Major | 5 |
| 🟡 Minor | 4 |
| 🔵 Enhancement | 3 |

---

## 🔴 Critical Issues

### C1 — SVG FunnelSVG has no accessible label
**Location:** `HeroSection.tsx` → `<FunnelSVG />`
**WCAG:** 1.1.1 Non-text Content (Level A)
**Impact:** Screen readers will attempt to read every text node inside the SVG in DOM order — stage labels, percentages, "−40 lost", benchmark text — producing an incomprehensible stream of numbers.

**Fix:**
```tsx
<svg
  viewBox="0 0 360 440"
  role="img"
  aria-label="Funnel chart showing 47 applications narrowing to 1 offer: 17% screening rate, 37% interview rate, 33% offer rate"
  // ... existing props
>
  <title>Job search funnel: 47 applications → 8 screening → 3 interview → 1 offer</title>
  {/* Add aria-hidden to all child text/decorative elements */}
```

---

### C2 — FAQ accordion missing aria-controls
**Location:** `FAQSection.tsx` — each `<button>` in the accordion
**WCAG:** 4.1.2 Name, Role, Value (Level A)
**Impact:** `aria-expanded` is present (good), but without `aria-controls` pointing to the answer panel, screen readers cannot programmatically navigate from question to answer.

**Fix:**
```tsx
// Button
<button
  type="button"
  onClick={() => setOpen(isOpen ? null : i)}
  aria-expanded={isOpen}
  aria-controls={`faq-answer-${i}`}   // ← add this
  className="..."
>

// Answer panel wrapper
<div
  id={`faq-answer-${i}`}              // ← add this
  role="region"                        // ← add this
  aria-labelledby={`faq-btn-${i}`}    // ← add this
  className="grid transition-all duration-300 ease-in-out"
  style={{ gridTemplateRows: isOpen ? '1fr' : '0fr' }}
>
```

---

### C3 — AnimatedBar has no accessible value
**Location:** `DashboardMockup.tsx` → `AnimatedBar`
**WCAG:** 1.3.1 Info and Relationships (Level A)
**Impact:** Progress bars convey quantity (e.g. "19% screening rate") but have no machine-readable value. Screen readers see an empty div.

**Fix:**
```tsx
<div
  ref={ref}
  className="flex-1 h-6 rounded-lg overflow-hidden relative"
  role="progressbar"
  aria-valuenow={pct}
  aria-valuemin={0}
  aria-valuemax={100}
  aria-label={`${label} stage: ${pct}% of applications`}
  style={{ background: 'rgba(255,255,255,0.05)' }}
>
```

---

## 🟠 Major Issues

### M1 — Contrast failures on muted text (dark backgrounds)
**Location:** Multiple marketing components
**WCAG:** 1.4.3 Contrast Minimum (Level AA) — requires 4.5:1 for normal text, 3:1 for large text (18pt+ or 14pt+ bold)

| Text | Background | Approximate ratio | Verdict |
|---|---|---|---|
| `rgba(255,255,255,0.30)` | `#0C1A17` | ~2.3:1 | ❌ Fails (hero scroll hint, footer copyright) |
| `rgba(255,255,255,0.25)` | `#0C1A17` | ~1.9:1 | ❌ Fails (benchmark labels, DashboardMockup) |
| `rgba(255,255,255,0.20)` | `#0C1A17` | ~1.5:1 | ❌ Fails (AuthShell footer) |
| `#94A3B8` | `#FFFFFF` | ~2.3:1 | ❌ Fails for body text (captions at 12px normal) |
| `rgba(255,255,255,0.40)` | `#0C1A17` | ~3.1:1 | ⚠️ Passes large text only |

**Decision framework:** All of the failing values are used for **decorative** or **supplementary** text (scroll hints, copyright, benchmark references, captions). None are primary content. Apply one of these approaches:
- Accept for purely decorative elements (scroll hint chevron label, decorative numbers) — document the exception
- Increase opacity to pass 3:1 for large/bold text (e.g. white/40 → white/50 for bench labels)
- Do not use `white/30` or below for any text that conveys information

---

### M2 — Missing skip-to-main-content link
**Location:** `layout.tsx`
**WCAG:** 2.4.1 Bypass Blocks (Level A)
**Impact:** Keyboard-only users must Tab through the entire fixed nav (logo, 3 links, 2 buttons, hamburger = 7 stops) before reaching any page content on every page load.

**Fix:** Add to `layout.tsx` before `{children}`:
```tsx
<a
  href="#main-content"
  className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 focus:z-[100] focus:px-4 focus:py-2 focus:bg-white focus:text-[#0F172A] focus:rounded-lg focus:shadow-lg focus:text-sm focus:font-medium"
>
  Skip to main content
</a>
```

And add `id="main-content"` to the `<main>` element.

---

### M3 — HowItWorks connector line not fully hidden from AT
**Location:** `HowItWorks.tsx`
**WCAG:** 1.3.3 Sensory Characteristics (Level A)
**Impact:** The gradient connector line between step bubbles has `aria-hidden="true"` ✅ but the `<div>` wrapping the 3-step grid has no landmark role. Users navigating by region/landmark will land in the section but have no label.

**Fix:** Add `aria-label` to the steps container:
```tsx
<div
  className="grid grid-cols-1 md:grid-cols-3 gap-12 md:gap-8 relative"
  role="list"
  aria-label="How Job Funnel works — 3 steps"
>
  {steps.map((step, i) => (
    <RevealWrapper key={step.number} delay={i * 120} as="li">
```

---

### M4 — MarketingNav active state not communicated
**Location:** `MarketingNav.tsx`
**WCAG:** 4.1.2 Name, Role, Value (Level A)
**Impact:** The nav has no `aria-current` on the current page link. Screen reader users hear all links equally — no indication of current location.

**Fix:** The nav currently uses `href="#features"` anchor links (not Next.js `Link` to a route), so this is only relevant after the marketing site gains real sub-pages. For now:
```tsx
// Future pattern for route-based nav items:
<Link href={link.href} aria-current={pathname === link.href ? 'page' : undefined}>
```

---

### M5 — Decorative SVG icons missing aria-hidden
**Location:** `HeroSection.tsx` (arrow icons), `PricingSection.tsx` (check/× icons), `MarketingFooter.tsx` (GDPR icon), `FAQSection.tsx` (toggle + icon)
**WCAG:** 1.1.1 Non-text Content (Level A)
**Impact:** Screen readers attempt to announce inline SVGs that have no content value. Most will announce as "image" or by path data.

**Fix:** Add `aria-hidden="true"` to all decorative SVGs:
```tsx
// Hero arrow
<svg aria-hidden="true" width="16" height="16" ...>

// Pricing check/× icons
<svg aria-hidden="true" className="w-4 h-4 mt-0.5 flex-shrink-0" ...>

// FAQ toggle icon
<svg aria-hidden="true" width="12" height="12" ...>
```

Exception: The GDPR check icon in `MarketingFooter` — it's inside a labelled `<span>` ("GDPR Compliant"), so `aria-hidden="true"` is correct here too since the text already provides the meaning.

---

## 🟡 Minor Issues

### m1 — FAQ question text hover colour not a focus indicator
**Location:** `FAQSection.tsx`
**WCAG:** 2.4.11 Focus Appearance (Level AA, WCAG 2.2)
**Impact:** The `<button>` has no visible custom focus style. It relies on the browser default `outline`. The `group-hover:text-[#2563EB]` style only fires on mouse hover — keyboard focus does not trigger it.

**Fix:** Add an explicit focus-visible style:
```tsx
className="... focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#2563EB] focus-visible:ring-offset-2"
```

---

### m2 — Mobile overlay has no focus trap
**Location:** `MarketingNav.tsx` — mobile menu panel
**WCAG:** 2.1.2 No Keyboard Trap (Level A) — inverse scenario
**Impact:** When the mobile menu is open, keyboard users can Tab past the overlay and reach content underneath. Focus should be trapped inside the panel while it's open.

**Fix:** Use a focus trap library or implement manually:
```tsx
// Simple approach: auto-focus the first nav item on open
useEffect(() => {
  if (mobileOpen) {
    const firstLink = panelRef.current?.querySelector('a, button')
    ;(firstLink as HTMLElement)?.focus()
  }
}, [mobileOpen])
```

---

### m3 — StatsBar numbers not marked up as data
**Location:** `StatsBar.tsx`
**WCAG:** 1.3.1 Info and Relationships (Level A)
**Impact:** The stat number + label pairs are in `<div>` / `<p>` elements. Screen readers read them as two separate pieces of text, potentially without semantic connection.

**Recommended fix:** Use `<dl>` / `<dt>` / `<dd>` for stat pairs:
```tsx
<dl className="text-center py-8 px-6">
  <dt className="sr-only">{stat.label}</dt>
  <dd className="leading-none mb-4 text-white font-black" style={...}>
    {stat.number}<sup>{stat.sup}</sup>
  </dd>
  <dt className="text-sm text-white/40">{stat.label}</dt>
</dl>
```

---

### m4 — Login page error state not announced
**Location:** `MagicLinkForm.tsx` (referenced from LoginPage)
**WCAG:** 4.1.3 Status Messages (Level AA)
**Impact:** The `initialError` prop shows an inline error message, but if it appears after page load (e.g. redirect with `?error=auth_error`), screen readers won't announce it unless it's in a live region.

**Fix:** Wrap error messages in:
```tsx
<div role="alert" aria-live="assertive">
  {error && <p className="...">{error}</p>}
</div>
```

---

## 🔵 Enhancements

### e1 — Add prefers-reduced-motion support to all animations
All `fadeInUp-*` classes, `RevealWrapper`, and `AnimatedBar` should respect `prefers-reduced-motion: reduce`. See the gap noted in the Theming section.

### e2 — Add lang attribute to page
**Location:** `layout.tsx` — `<html>` element
`<html lang="en">` is already present ✅. If the product expands to multi-language (German, Dutch, French), each page should override with the correct `lang` value for its content.

### e3 — Landmark regions for marketing page sections
The marketing homepage is a long single page. Adding `aria-label` to each `<section>` would allow screen reader users to navigate by region (e.g. "Features", "Pricing", "FAQ" — which already has `id="faq"`):
```tsx
<section id="features" aria-label="Features">
<section id="pricing" aria-label="Pricing">
<section id="faq" aria-label="Frequently asked questions">
```

---

## Passing ✅

| Check | Status |
|---|---|
| `HowItWorks` connector line `aria-hidden="true"` | ✅ |
| `MarketingNav` hamburger has `aria-label` + `aria-expanded` | ✅ |
| `FAQSection` buttons have `aria-expanded` | ✅ |
| `RevealWrapper` hides content off-screen before reveal (opacity 0, not `display:none`) — content remains accessible to AT | ✅ |
| All CTA buttons have `min-h-[44px]` touch targets | ✅ |
| `AuthShell` mobile logo shown at `lg:hidden` — no auth content is hidden from mobile | ✅ |
| `html[lang="en"]` present | ✅ |
| `blockquote` used for pullquote in Act 02 | ✅ |
| `<nav>` element used for all navigation lists | ✅ |

---

## Remediation Roadmap

### Sprint 1 (Critical — before next public launch)
- [ ] Add `role="img"` + `<title>` to `FunnelSVG` (C1)
- [ ] Add `aria-controls` + panel `id` to FAQ accordion (C2)
- [ ] Add `role="progressbar"` + `aria-valuenow` to `AnimatedBar` (C3)

### Sprint 2 (Major — within 2 sprints)
- [ ] Add skip-to-main link to `layout.tsx` (M2)
- [ ] Add `aria-hidden="true"` to all decorative SVGs (M5)
- [ ] Add focus-visible ring to FAQ button (m1)
- [ ] Add focus trap to mobile menu (m2)

### Sprint 3 (Minor + Enhancement)
- [ ] Add `prefers-reduced-motion` CSS to `globals.css` (e1)
- [ ] Add `role="alert"` to login error state (m4)
- [ ] Add `aria-label` to `<section>` landmarks (e3)
- [ ] Consider `<dl>` markup for StatsBar (m3)
