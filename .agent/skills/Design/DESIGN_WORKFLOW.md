# JobFunnel OS — Design System Workflow
## How to Review, Redesign, and Extend the Logged-In Area

**Version:** 1.0.0 · **Last updated:** 2026-03-23
**For:** Product designer + Claude agent collaboration

> This document is the step-by-step playbook for applying the JobFunnel Design System to any page in the logged-in area (app shell). Follow it in order. Every new screen must go through this loop before code is written.

---

## The Three-Phase Loop

```
Phase 1 — Audit        Phase 2 — Design        Phase 3 — Build
─────────────────      ─────────────────────    ─────────────────────
Review existing page → Spec components needed → Ship & register in DS
```

You always start at Phase 1, even for new pages. Understanding what already exists prevents inventing tokens or components that are already in the system.

---

## Phase 1 — Audit the Page

### Step 1.1 — Read the design system first

Before opening Figma or writing a single line of code, read:

```
.agent/skills/Design/DESIGN_SYSTEM.md
```

Pay particular attention to:
- **Two Visual Contexts** — the logged-in area is always App context (light, `#FAFAFA` background), not Marketing context
- **Color Tokens → App UI** section — these are your palette
- **Component Inventory** → App UI section — check if the component you need already exists in `src/components/ui/`
- **Step 3 — Theming** — understand the CSS custom property map before touching a color
- **Step 4 — Accessibility** — know which open issues already exist so you don't regress them

---

### Step 1.2 — Run an audit on the target page

Ask Claude to audit the specific page you're about to redesign:

```
/audit-system dashboard
/audit-system pipeline
/audit-system analytics
/audit-system stories
/audit-system settings
```

The audit will return:
- **Token violations** — raw Tailwind colors used instead of CSS custom properties
- **Component gaps** — UI elements that exist in code but have no spec in the design system
- **Accessibility issues** — anything failing WCAG 2.2 AA on that specific page
- **Dark mode gaps** — tokens not defined for dark mode

> **Important for the logged-in area:** The Sidebar (`src/components/layout/sidebar.tsx`) is a known offender — it uses raw `bg-slate-100`, `text-blue-600`, `border-gray-200` instead of CSS custom properties. Any redesign of the sidebar must migrate these to tokens first.

---

### Step 1.3 — Document what you found

Create a page-specific audit note in:

```
.agent/skills/Design/audits/[page-name]-audit.md
```

Use this template:

```markdown
# [Page Name] Audit — [date]

## Token violations
- [ ] [component]: uses [raw value] → should use [token]

## Missing component specs
- [ ] [Component name] — exists in code but not in DESIGN_SYSTEM.md

## Accessibility gaps
- [ ] [Issue] — severity: [Critical / Major / Minor]

## Dark mode gaps
- [ ] [Token] missing dark value

## Decision
Proceed to Phase 2 with these components needing spec work: [list]
```

---

## Phase 2 — Design the High-Fidelity Experience

### Step 2.1 — Identify what components you need

Look at your target page and list every distinct UI element. For each one, answer:

| Component | Exists in `src/components/ui/`? | Spec in DESIGN_SYSTEM.md? | Action |
|---|---|---|---|
| Button | ✅ shadcn/ui Button | ✅ Section: Buttons | Use as-is |
| ApplicationCard | ✅ in pipeline | ❌ no spec | Run `/create-component ApplicationCard` |
| FunnelChart | ❌ not built | ❌ no spec | Run `/create-component FunnelChart` |
| EmptyState | ❌ no standard component | ❌ no spec | Run `/create-component EmptyState` |

This table tells you exactly what to spec before designing.

---

### Step 2.2 — Create specs for missing components

For every component marked "Run `/create-component`" in your table, ask Claude:

```
/create-component [ComponentName]
```

**Examples for the logged-in area you'll likely need:**

```
/create-component ApplicationCard
/create-component KanbanColumn
/create-component FunnelMetricCard
/create-component StoryCard
/create-component EmptyState
/create-component UpgradePrompt
/create-component CVVersionBadge
/create-component StageTransitionToast
/create-component OnboardingChecklist
```

Claude will produce a complete spec with:
- Anatomy diagram
- All variants (size, style, state)
- Props / API table
- Interaction and animation behaviour
- Accessibility requirements
- Token mapping
- Code example in TypeScript + Tailwind + shadcn/ui

**Save each spec in:**

```
.agent/skills/Design/components/[ComponentName].md
```

---

### Step 2.3 — Apply the design in Figma (or equivalent)

Give your product designer this brief for every screen:

---

**Designer Brief Template**

> **Screen:** `[page name]` — `/app/[route]`
> **Context:** App (light mode default, dark mode supported)
> **Background:** `#FAFAFA` — `var(--background)`
>
> **Constraints to follow:**
> - All colors must come from the App UI palette in `DESIGN_SYSTEM.md` (CSS custom properties)
> - Headings: Inter only. Data, metrics, tags: DM Mono only
> - Minimum touch target 44×44px on all interactive elements
> - Mobile-first: design the 390px viewport first, then 768px, then 1280px
> - Do not invent new radius values — use the radius tokens from the design system
> - Do not invent new shadow values — use the elevation tokens from the design system
>
> **Component specs available:**
> - `[Link to each .md spec file relevant to this screen]`
>
> **Open accessibility issues to avoid regressing:**
> - `[List from Step 1.3 audit]`
>
> **New components to design (no prior spec, coordinate with Claude for spec first):**
> - `[List of any net-new components]`

---

### Step 2.4 — Designer ↔ Claude handshake for new components

When the designer produces a new component in Figma that doesn't exist yet:

1. **Designer** exports component anatomy as a text description or screenshot and shares it
2. **Claude** runs `/create-component [name]` using the designer's description as input
3. **Claude** produces the spec and saves it to `.agent/skills/Design/components/[name].md`
4. **Designer** reviews the spec for accuracy and signs off
5. **Engineer** implements the component against the spec

This keeps the spec as the source of truth — Figma is a visualisation tool, the spec is the contract.

---

## Phase 3 — Build and Register

### Step 3.1 — Implement against the spec

Every new component must:

1. Use **shadcn/ui** as the base primitive (check `src/components/ui/` first)
2. Extend via `cva` (class-variance-authority) — never custom CSS files
3. Consume **only** the tokens defined in the spec's token mapping table
4. Meet the **accessibility requirements** listed in the spec
5. Handle **all states** listed in the spec (default, hover, focus, disabled, loading, error, empty)

---

### Step 3.2 — Add the component to the design system

Once the component is built and reviewed, register it in two places:

**A) Add to DESIGN_SYSTEM.md Component Inventory**

Open `.agent/skills/Design/DESIGN_SYSTEM.md` and find the `## Component Inventory` section. Add a row to the App UI table:

```markdown
| `ComponentName` | `src/components/[path]` | Brief one-line description |
```

**B) Add the full spec to DESIGN_SYSTEM.md**

Append or link the spec from Step 2.2 into the Step 2 Component Specs section of `DESIGN_SYSTEM.md`. Format:

```markdown
## ComponentName

**File:** `src/components/[path]/ComponentName.tsx`
**Context:** App (light + dark mode)
**Spec:** [link or inline spec from `.agent/skills/Design/components/ComponentName.md`]
```

---

### Step 3.3 — Validate before merging

Run the audit one more time on the implemented page:

```
/audit-system [page name]
```

The audit should return zero new Critical or Major issues compared to your baseline from Step 1.3. If it surfaces new issues, fix them before merging.

Then run the full pre-push quality gate from `CLAUDE.md`:
1. `@code-reviewer` — check code quality
2. `@qa-engineer` — validate end-to-end

---

## Logged-In Area — Page-by-Page Priorities

### Pages to tackle in order (suggested)

| Priority | Route | Why first |
|---|---|---|
| 1 | `/app/dashboard` | Most users land here — sets first impression of app quality |
| 2 | `/app/pipeline` | Core daily use, most complex components (Kanban, cards, drag) |
| 3 | `/app/analytics` | Key Pro differentiator — must feel data-forward |
| 4 | `/app/stories` | High engagement for Interview Content OS pillar |
| 5 | `/app/settings` | Lower frequency but high trust — billing, profile |
| 6 | `/app/cv-versions` | Phase 2 — review after Phase 2 development starts |

### Sidebar (shared shell — do this before any page)

The Sidebar is a shared component rendered across all app pages. It is the **highest-impact item to fix first** because it currently bypasses the token system entirely.

Before redesigning any app page, run:

```
/create-component Sidebar
```

Then migrate it from raw Tailwind utilities to CSS custom properties, and update the spec in `DESIGN_SYSTEM.md`.

---

## Quick-Reference: Which Command to Run

| I want to... | Command |
|---|---|
| Review a page for design system compliance | `/audit-system [page name]` |
| Create a spec for a component that doesn't exist | `/create-component [component name]` |
| Validate the token layer only | `/audit-system tokens` |
| Run an accessibility-only check | `/audit-system accessibility` |
| Audit the full system at once | `/audit-system` |
| Extract tokens from a new page added to the codebase | `/tokenize` |

---

## The Golden Rule

> **Spec first, design second, build third.**
>
> If a component doesn't have a spec in `.agent/skills/Design/DESIGN_SYSTEM.md` or `.agent/skills/Design/components/`, it is not ready to be built. The spec is the contract between designer and engineer. Skipping it creates the same inconsistencies we are trying to fix.
