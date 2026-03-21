---
name: design-spells
description: >
  Curated micro-interactions and design details that add "magic" and personality to JobFunnel OS.
  Use to elevate a finished UI from functional to memorable — adding polished hover states, smooth transitions,
  loading surprises, and personality-driven details that feel premium and data-native.
  Trigger on phrases like "add magic", "polish this", "make it feel premium", "add micro-interactions",
  "wow factor", "delight", "design details", "animate this", "easter egg", or "make this feel alive".
  Do NOT auto-trigger during bug fixes or data-logic work — only when the feature is functionally complete.
risk: safe
source: community
date_added: "2026-03-21"
---

# Design Spells — JobFunnel OS

Micro-interactions and design details that transform JobFunnel OS from "solid SaaS" into something tech professionals remember. The audience (PMs, engineers, data scientists) has high visual taste — they use Figma, Linear, and Vercel daily. Generic UI gets ignored. Crafted UI earns trust.

## Stack constraints (non-negotiable)

- **Animations**: Framer Motion for anything complex; Tailwind `transition` + `duration-*` for simple hover/focus states
- **No** Anime.js, GSAP, or CSS-in-JS (emotion, styled-components) — not in the stack
- **Styling**: Tailwind utility classes only — no custom CSS files
- **Components**: shadcn/ui primitives as the base — extend, never replace
- **Performance**: GPU-accelerated transforms only (`translate`, `scale`, `opacity`) — never animate `width`, `height`, `top`, `left` directly (causes layout reflow)
- **Dark mode**: Every spell must work with Tailwind `dark:` variants — test both

## Design tokens to use

```
Primary blue:   #2563EB
Success green:  #10B981
Warning amber:  #F59E0B
Error red:      #EF4444
Purple:         #8B5CF6
Neutral gray:   #64748B
Background:     #FAFAFA
Card:           #FFFFFF
```

## When to use this skill

- A feature is functionally complete and needs polish
- A component feels generic or flat and deserves a personality moment
- Adding a loading state, empty state, or success confirmation
- A transition between states (drag-drop, stage change, form submit) needs to feel intentional
- The user says "make this feel premium" or "add some magic"

## Do NOT use this skill when

- A bug needs fixing or data logic is broken — fix substance before style
- Animations would obscure feedback (e.g., error states must always be instant and clear)
- The component is already animated and adding more would create noise

---

## Execution Workflow

### 1. Identify the opportunity

Target the flat or mechanical parts:
- Kanban card drag-and-drop: does dropping a card feel satisfying?
- Stage badge on ApplicationCard: does changing stage have a transition?
- Funnel bars: do they animate in on load or just appear?
- Empty states: do they have personality or just "No data"?
- Button on form submit: does it pulse, spin, or confirm success visually?
- Sidebar nav: does the active item transition smoothly?
- Stats block on dashboard: do numbers count up or just render static?

### 2. Match the product tone

JobFunnel OS is for **serious tech professionals** who are data-driven and results-oriented. Spells should feel:
- **Precise and intentional** — like a well-crafted dashboard, not a consumer app
- **Subtle and additive** — enhance the signal, never compete with it
- **Data-native** — transitions that reinforce the funnel metaphor (flow, progression, measurement)

Avoid: bouncy cartoonish springs, confetti explosions, playful mascots. These users expect Linear/Figma-level polish, not Duolingo-level whimsy.

### 3. Implement with Framer Motion (complex) or Tailwind (simple)

**Tailwind patterns (simple hover/focus):**
```tsx
// Button hover lift
className="transition-all duration-150 hover:-translate-y-0.5 hover:shadow-md active:translate-y-0"

// Card hover
className="transition-shadow duration-200 hover:shadow-lg"

// Badge pulse for new/stale
className="animate-pulse"
```

**Framer Motion patterns (complex):**
```tsx
import { motion, AnimatePresence } from 'framer-motion'

// Funnel bar animate-in on mount
<motion.div
  initial={{ width: 0 }}
  animate={{ width: `${rate}%` }}
  transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
/>

// Kanban card drop confirmation
<motion.div
  animate={{ scale: [1, 1.03, 1] }}
  transition={{ duration: 0.25, ease: 'easeOut' }}
/>

// Stage badge change
<AnimatePresence mode="wait">
  <motion.span
    key={stage}
    initial={{ opacity: 0, y: -4 }}
    animate={{ opacity: 1, y: 0 }}
    exit={{ opacity: 0, y: 4 }}
    transition={{ duration: 0.15 }}
  />
</AnimatePresence>

// Number count-up (dashboard stats)
// Use a simple useEffect with requestAnimationFrame — no extra library needed
```

### 4. Test before shipping

- [ ] 60fps in Chrome DevTools Performance tab (no red frames)
- [ ] No layout shift (CLS) — only `transform` and `opacity` animated
- [ ] Works in dark mode
- [ ] Works on mobile (375px viewport) — no over-engineered hover states on touch
- [ ] `prefers-reduced-motion` respected:
```tsx
const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches
// or in Framer Motion:
transition={{ duration: prefersReduced ? 0 : 0.4 }}
```

---

## Spell catalogue — JobFunnel OS specific

| Component | Spell | Implementation |
|---|---|---|
| Funnel bars | Animate width from 0 on mount | Framer Motion `initial={{ width: 0 }}` |
| Dashboard stats | Number count-up on load | `useEffect` + `requestAnimationFrame` |
| Kanban card drop | Subtle scale bounce on drop | Framer Motion `animate={{ scale: [1, 1.03, 1] }}` |
| Stage badge | Crossfade on stage change | `AnimatePresence mode="wait"` |
| Sidebar nav item | Slide indicator on active | Framer Motion `layoutId="nav-indicator"` |
| Button (submit) | Spinner → checkmark on success | Tailwind `animate-spin` → swap icon |
| Empty state | Fade in with slight upward drift | Framer Motion `initial={{ opacity: 0, y: 8 }}` |
| Modal open/close | Scale + fade | Framer Motion `initial={{ scale: 0.97, opacity: 0 }}` |
| Stale card indicator | Amber ring pulse | Tailwind `animate-pulse ring-amber-300` |
| Toast notification | Slide in from right | Framer Motion `initial={{ x: 40, opacity: 0 }}` |

---

## Strict rules

- **Delight, don't distract** — the spell must be additive, not compete with the data
- **GPU transforms only** — `transform` and `opacity`; never animate layout properties
- **Reduced motion first** — always check `prefers-reduced-motion` and skip animation if set
- **No animation libraries beyond Framer Motion** — Anime.js, GSAP, and similar are not in the stack
- **No custom CSS files** — Tailwind classes or Framer Motion inline only
- **Dark mode always** — test every spell with `dark:` variants active
