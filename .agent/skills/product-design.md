---
name: product-design
description: >
  Elite product design for JobFunnel OS — design system, UX flows, UI critique, accessibility,
  design tokens, component patterns, mobile-first constraints, and Pro/Free tier visual design.
  Grounded in the JobFunnel design system: shadcn/ui + Tailwind 3.x + Framer Motion,
  Inter typeface, and the official color palette.
  Trigger on: "design this feature", "review this UI", "design critique", "what should this look like",
  "design the onboarding", "empty state", "how should this component work", "design tokens",
  "design the Pro gate", "how do I show the free tier limit", "design the pipeline card",
  "design the analytics dashboard", "UX flow for", "mobile layout", "accessibility review",
  "how should this interaction feel", "visual hierarchy", or any task where the deliverable
  is a UI/UX decision, component design, or design system guidance.
---

# Product Design — JobFunnel OS

> "Design is not just what it looks like and feels like. Design is how it works."
> — Steve Jobs

Elite product design for JobFunnel OS. Every decision serves clarity, conversion, and the user's job search outcome — not visual decoration.

---

## Core Design Principles

### The 10 Principles (Applied to JobFunnel)

1. **Radical simplicity** — if it doesn't help the user understand their funnel or take action, remove it
2. **Material honesty** — every element earns its place; no decorative chrome
3. **Less is more** — restraint is a design decision; the pipeline Kanban should breathe
4. **Systemic coherence** — stage colors, typography, spacing, and motion must feel like one system
5. **Details matter** — the user feels micro-interactions and loading states even without noticing
6. **Function defines form** — the analytics chart's job is insight, not visual showmanship
7. **Durability** — design that ages well; avoid trendy UI that requires a redesign in 18 months
8. **Accessibility as default** — WCAG AA is the floor, not a bonus
9. **Continuity across screens** — mobile pipeline and desktop pipeline must feel like the same product
10. **Delightful surprise** — the moment the user sees "Your screening rate jumped to 18% 🎉" for the first time

### Cognitive Design Principles

- **Zero cognitive load** — the user should never have to think about the interface; only about their job search
- **Clear affordances** — what is draggable looks draggable; what is clickable looks clickable
- **Immediate feedback** — every action (drag, add, stage transition) has an instant visual response
- **Error prevention** — design that makes wrong actions hard (e.g., CV lock after screening is a UI constraint, not just an API error)

---

## JobFunnel Design System

### Design Tokens

```json
{
  "color": {
    "brand": {
      "primary":    "#2563EB",
      "primary-hover": "#1D4ED8",
      "purple":     "#8B5CF6",
      "background": "#FAFAFA",
      "card":       "#FFFFFF"
    },
    "semantic": {
      "success":    "#10B981",
      "warning":    "#F59E0B",
      "error":      "#EF4444",
      "neutral":    "#64748B"
    },
    "stage": {
      "saved":        "#64748B",
      "applied":      "#2563EB",
      "screening":    "#8B5CF6",
      "interviewing": "#F59E0B",
      "offer":        "#10B981",
      "rejected":     "#EF4444",
      "withdrawn":    "#64748B"
    },
    "neutral": {
      "900": "#0F172A",
      "800": "#1E293B",
      "600": "#475569",
      "400": "#94A3B8",
      "200": "#E2E8F0",
      "100": "#F1F5F9",
      "50":  "#F8FAFC"
    }
  },
  "typography": {
    "font":    "Inter (Google Fonts)",
    "h1":      { "size": "36px", "weight": "700", "line": "40px" },
    "h2":      { "size": "24px", "weight": "600", "line": "32px" },
    "h3":      { "size": "18px", "weight": "600", "line": "28px" },
    "body":    { "size": "14px", "weight": "400", "line": "20px" },
    "small":   { "size": "12px", "weight": "400", "line": "16px" }
  },
  "spacing": {
    "base": "4px",
    "xs":   "4px",
    "sm":   "8px",
    "md":   "16px",
    "lg":   "24px",
    "xl":   "32px",
    "2xl":  "48px",
    "3xl":  "64px"
  },
  "radius": {
    "sm":   "4px",
    "md":   "8px",
    "lg":   "12px",
    "xl":   "16px",
    "full": "9999px"
  },
  "shadow": {
    "sm": "0 1px 3px rgba(0,0,0,0.08)",
    "md": "0 4px 12px rgba(0,0,0,0.10)",
    "lg": "0 8px 24px rgba(0,0,0,0.12)"
  },
  "motion": {
    "fast":   "150ms ease-out",
    "normal": "250ms ease-in-out",
    "slow":   "400ms cubic-bezier(0.34, 1.56, 0.64, 1)"
  },
  "breakpoints": {
    "mobile":  "<640px",
    "tablet":  "640px–1024px",
    "desktop": ">1024px"
  }
}
```

### Stage Color System

Stage colors are the primary visual language of JobFunnel. They must be applied consistently across every surface: Kanban column headers, application card badges, analytics charts, stage history logs.

| Stage | Color | Hex | Tailwind class |
|---|---|---|---|
| saved | Gray | `#64748B` | `text-slate-500 bg-slate-100` |
| applied | Blue | `#2563EB` | `text-blue-600 bg-blue-50` |
| screening | Purple | `#8B5CF6` | `text-violet-600 bg-violet-50` |
| interviewing | Amber | `#F59E0B` | `text-amber-600 bg-amber-50` |
| offer | Green | `#10B981` | `text-emerald-600 bg-emerald-50` |
| rejected | Red muted | `#EF4444` | `text-red-500 bg-red-50` |
| withdrawn | Gray | `#64748B` | `text-slate-500 bg-slate-100` |

---

## Component Design Patterns

### Application Card (Pipeline Kanban)

```
┌─────────────────────────────────────┐
│ [Company Logo / Initials Avatar]    │  ← 32px avatar, company initials fallback
│ Company Name                 [●high]│  ← Priority dot: red=high, amber=med, gray=low
│ Job Title                           │
│ 📍 Location  💰 €80–95k            │  ← Optional, only if filled
│ ─────────────────────────────────── │
│ [CV v2] (Phase 2 badge)  3d ago    │  ← Phase 2: cv version badge (max 15 chars)
└─────────────────────────────────────┘
```

**Rules:**
- Card width: fills Kanban column; column min-width 280px on desktop
- Card must never overflow horizontally on mobile
- Drag handle: entire card is the drag target (not an icon)
- Tap anywhere on card → opens application detail (Sheet on desktop, full-screen on mobile)
- Priority badge: colored dot (`●`), not a full label (saves space)
- "3d ago" = time since last stage update, not creation date

### Kanban Column Header

```
┌─────────────────────────────────────┐
│ ● Screening                    (4)  │  ← Stage dot color + name + count badge
└─────────────────────────────────────┘
```

- Column dot color matches stage color system exactly
- Count badge: neutral background, updates live via Supabase real-time
- Add button (`+`) lives in the header — visible on hover/always on mobile

### Analytics Funnel Chart

```
Applied     ██████████████████████ 32
Screening   ████████████ 18        → 56% ↑
Interviewing ███████ 9             → 50% ↔
Offer        ██ 2                  → 22% ↓ (below avg 35%)
```

**Rules:**
- Bar length proportional to absolute count, not percentage
- Conversion rate shown to the right of each transition arrow
- Color of rate: green if above industry avg, red if below, neutral if no benchmark
- Industry benchmark shown as a ghost bar overlay (Pro feature)
- Chart must be readable on 375px mobile — horizontal scroll NOT acceptable, use stacked layout instead

---

## UX Flow Structure

Every feature design starts with this frame:

```
1. Entry Point    — how the user arrives (search result? empty state CTA? email?)
2. Context        — what the user knows and wants at this moment
3. Action         — what the user does (tap, type, drag, select)
4. Feedback       — immediate system response (optimistic UI, toast, animation)
5. Outcome        — what the user achieved (application added, stage updated, insight surfaced)
6. Next Step      — what naturally comes next (add another? view analytics? share?)
```

### Key JobFunnel Flows

**Add Application Flow**
```
Entry: "Add application" button on Pipeline
Context: User has a job tab open, wants to capture it fast
Action: Fills company + title (required), optionally URL, salary, stage
Feedback: Optimistic card appears in Kanban column immediately
Outcome: Application visible in pipeline with correct stage color
Next Step: "Add interview story?" prompt if stage is Interviewing+
```

**Stage Transition Flow**
```
Entry: User drags card to new column (or uses "Move to" in detail view)
Context: Interview happened, rejection received, offer arrived
Action: Drag-and-drop (desktop) / tap "Move stage" picker (mobile)
Feedback: Card animates to new column, stage badge updates instantly
Outcome: Stage history logged, stage_updated_at refreshed
Next Step: If → Offer: show salary comparison. If → Rejected: show "What went wrong?" prompt.
```

**Free Tier Limit Hit Flow**
```
Entry: User tries to add 6th active application
Context: User is in active search mode, hitting the wall
Action: Clicks "Add application"
Feedback: Dialog opens — NOT an error state, a conversion moment
Outcome: User sees upgrade prompt with their current pipeline stats as proof of value
Next Step: "Upgrade to Pro — €15/month" CTA. "Not now" dismisses without frustration.
```

---

## Onboarding Design (First 5 Minutes)

```
Screen 1: Promise
  Headline: "Run your job search like a product funnel"
  Sub: "Track every application, understand your conversion rates, land faster."
  CTA: "Get started free" (not "Sign up")
  No: feature list bullets. Show a product screenshot instead.

Screen 2: Immediate Value (before asking for much)
  Ask only: email
  Show: "Your pipeline is ready" preview with 3 placeholder cards
  Progress: step 1 of 3 indicator

Screen 3: Personalization
  Questions (max 3, visual chips):
    - "What's your role?" → SWE / PM / DS / Designer / Other
    - "Which countries are you targeting?" → DE / NL / FR / ES / Other EU
    - "How active is your search?" → Just starting / Active (20+ apps) / Exploring
  Skip always available.

Screen 4: Aha Moment
  "Add your first application"
  Pre-filled example: "Spotify — Senior PM — Amsterdam"
  User edits and saves → card appears in their pipeline
  Toast: "Your funnel has started. Add 3+ applications to see conversion insights."
```

**Key constraints:**
- Magic link auth — no password field ever
- Never ask for more than needed — no phone, no LinkedIn at signup
- Onboarding completion gates nothing — user can skip straight to pipeline

---

## Empty States That Convert

Every empty state is a conversion moment, not an absence of content.

| Surface | Empty State Message | CTA |
|---|---|---|
| Pipeline (no apps) | "Your funnel starts here. Add your first application to begin tracking." | "Add application" |
| Analytics (not enough data) | "Add at least 5 applications to see your conversion rates." | "Go to pipeline" |
| Story Library (no stories) | "Your interview story bank is empty. Start with a win you're proud of." | "Add first story" |
| CV Versions (Phase 2) | "Upload your CV to start A/B testing which version gets more screenings." | "Upload CV" |
| Rejected applications | "No rejections here yet. Keep applying — the data will come." | — |

**Rules:**
- Never show: "No data found" or "Nothing here yet" alone
- Always include: a one-sentence explanation of why it's empty
- Always include: a primary CTA that resolves the emptiness
- Optional: a secondary tip (e.g., "Most users see insights after 10 applications")
- Illustration: optional, keep it subtle — not a full-page illustration

---

## Pro / Free Tier Visual Design

### Free Tier Counter (In-Context)

Show the user their limit progress — not as a nag, but as a data point.

```
Applications: ████████░░  4/5 active  [Upgrade for unlimited →]
```

- Progress bar fills as applications approach the limit
- Color: neutral → amber at 4/5 → red at 5/5
- Link "Upgrade for unlimited" appears from 3/5 onwards
- Shows in pipeline header, never as a blocking modal

### ProGate Component Design

For locked analytics features, charts, and CV testing:

```
┌─────────────────────────────────────────────┐
│  [blurred chart / feature preview]          │
│                                             │
│          🔒 Pro Feature                    │  ← Not a full lock icon — subtle
│    See your Applied-to-Screening rate       │  ← Specific benefit, not generic
│    and compare to industry benchmarks.      │
│                                             │
│    [Upgrade to Pro — €15/month]             │  ← Primary button, brand blue
│    [See what's included]                    │  ← Text link, secondary
└─────────────────────────────────────────────┘
```

**Rules:**
- The blur preview must show real structure — the user must understand what they're missing
- Never say "Premium feature" — say the specific feature name
- Benefit copy must be concrete: "See your screening rate" not "Unlock insights"
- Free trial offer (if any) goes inside the ProGate, not in a separate banner

### Upgrade Moment Design (After Free Tier Limit)

```
┌─────────────────────────────────────────────┐
│ 🚀 You're tracking 5 applications           │  ← Celebration framing
│                                             │
│ Your Applied → Screening rate: 12%          │  ← Show their own data as proof of value
│ Most Pro users see 2x more interviews       │  ← Social proof
│                                             │
│ Unlock unlimited applications + full        │
│ funnel analytics for €15/month.             │
│                                             │
│  [Start Pro — €15/month]                    │
│  [Not now]                                  │  ← Never hide this
└─────────────────────────────────────────────┘
```

---

## Mobile Design Patterns (Non-Negotiable)

### Pattern: Modals → Bottom Sheets on Mobile

| Desktop | Mobile (<640px) |
|---|---|
| Centered `<Dialog>` | Bottom sheet slides up from bottom |
| Side panel `<Sheet>` | Full-screen push navigation |
| Hover tooltip | Tap to reveal (long press or `?` icon) |
| Multi-column form | Single-column, full-width |

### Pattern: Pipeline on Mobile

Desktop shows full Kanban (all columns visible). Mobile shows:
- Single column at a time with horizontal swipe
- Stage selector tabs at the top: `Saved | Applied | Screening | ...`
- Active stage tab highlighted with stage color
- FAB (floating action button) bottom-right for "Add application"
- Drag-and-drop disabled on mobile — replaced by "Move to stage" picker in card detail

### Pattern: Analytics on Mobile

- Funnel chart: horizontal bars become vertical stack on mobile
- Metric cards: 2-column grid on mobile (not 4-column)
- Date range picker: bottom sheet on mobile
- Chart tooltips: tap-to-reveal, not hover

### Touch Target Rules

- Minimum 44×44px for all interactive elements
- Kanban card: entire card is tappable
- Stage badge in card: NOT individually tappable (tap opens card, not stage)
- Icon buttons: always paired with a visible label on mobile (no icon-only CTAs)

---

## UI Critique Framework

When reviewing a design, always follow:

```
1. OBSERVATION  — What do I see? (no judgment)
   "The primary CTA is at the bottom of a scrollable card"

2. PRINCIPLE    — Which design principle is at stake?
   "Visual hierarchy and CTA prominence"

3. IMPACT       — What does this cause for the user?
   "Users on mobile may not scroll far enough to see the action"

4. ALTERNATIVE  — Constructive suggestion
   "Sticky CTA bar at bottom of screen, always visible"

5. TRADE-OFF    — What's gained / lost?
   "Better conversion, but less screen real estate for content"
```

### UI Critique Checklist

- [ ] Visual hierarchy clear — eye knows exactly where to go first
- [ ] Contrast adequate — WCAG AA: 4.5:1 for body text, 3:1 for large text
- [ ] Touch targets ≥ 44×44px on mobile
- [ ] Stage colors applied consistently from the design token system
- [ ] Interactive states defined: hover / active / disabled / focus / loading
- [ ] Mobile-first — reviewed at 390px wide before 1440px
- [ ] Loading states — skeleton screens, not spinners for list content
- [ ] Empty states — include explanation + CTA (not blank white space)
- [ ] Error states — actionable message + retry, not "Something went wrong"
- [ ] Accessibility — ARIA labels, keyboard nav, focus ring visible
- [ ] Optimistic UI — action feels instant (card appears before API confirms)
- [ ] Pro gate — present on all Pro features, not just hidden

---

## Design Sprint Process (Adapted for Solo Founder)

Vinicius operates alone — the full 5-day sprint is compressed:

```
Day 1 (Monday):  Understand
  - Define the problem in one sentence
  - Map the user journey (which UX flow step is broken?)
  - Review competitive screenshots (Teal, Jobscan, Eztrackr)
  - Write: "The user currently feels __ because __. We want them to feel __ instead."

Day 2 (Tuesday): Diverge
  - Sketch 3 different approaches (pen and paper or FigJam)
  - For each: note the key UX bet it makes
  - Rule: no Figma yet — ideas only

Day 3 (Wednesday): Decide
  - Pick one approach based on pillar alignment + conversion impact
  - Write the UX Flow (Entry → Context → Action → Feedback → Outcome → Next)
  - Identify the one moment that makes or breaks the feature

Day 4 (Thursday): Prototype
  - High-fidelity Figma (or code-first for simple components)
  - Cover: default state, loading state, empty state, error state, mobile state

Day 5 (Friday): Validate
  - Share with 2–3 beta users or async user research
  - Capture: "What did you expect?" vs. "What did you get?"
  - Iterate or ship
```

---

## Design Commands Reference

| Command | Action |
|---|---|
| `/design-critique` | Structured critique of a UI screen or component |
| `/ux-flow` | Map the full UX flow for a feature |
| `/design-tokens` | Generate or audit design tokens for a feature |
| `/onboarding` | Design the onboarding flow for a new feature |
| `/empty-state` | Design the empty state for a surface |
| `/pro-gate` | Design the Pro upgrade moment for a feature |
| `/mobile-review` | Review a design specifically for 390px mobile compliance |
| `/accessibility` | WCAG audit of a component or screen |
| `/component-spec` | Full component spec (states, variants, props, tokens) |

---

## Related Files

- [code-reviewer.md](code-reviewer.md) — Mobile checklist and UI compliance aligned with this skill
- [backend-dev-guidelines.md](backend-dev-guidelines.md) — Architecture context for design decisions
- [complete-examples.md](complete-examples.md) — Reference implementation of components discussed here
- [middleware-guide.md](middleware-guide.md) — ProGate component implementation
