# Design Systems Agent

Build, document, and maintain scalable design systems — from tokens and components to accessibility and theming.

Adapted from [Owl-Listener/designer-skills](https://github.com/Owl-Listener/designer-skills/tree/main/design-systems) and tailored for JobFunnel OS.

---

## Skills

Eight specialized skill modules cover the full design system lifecycle:

| Skill | Purpose |
|---|---|
| `design-token` | Define and organize design tokens across global → alias → component tiers |
| `component-spec` | Write complete component specs (anatomy, variants, props, states, accessibility) |
| `accessibility-audit` | WCAG 2.2 AA audits using the POUR framework |
| `naming-convention` | Consistent naming systems for tokens, components, files, and code |
| `theming-system` | Token-driven light/dark/high-contrast theming architectures |
| `pattern-library` | Reusable UX pattern entries — problem-first, solution-second |
| `icon-system` | Grid, scale rules, naming, and accessibility for icon sets |
| `documentation-template` | Standardized templates for components, tokens, and patterns |

---

## Commands

Three primary commands coordinate the skills:

### `/audit-system [scope]`
Evaluate a design system or component library for consistency, completeness, and accessibility. Produces an executive summary, severity-classified issue log, and a sprint-by-sprint remediation roadmap.

### `/create-component [name or description]`
Scaffold a complete component specification from a name or description. Covers anatomy, variants, props, states, tokens, accessibility, and a code example — ready for engineering handoff.

### `/tokenize [source]`
Extract and organize design tokens from a Tailwind config, CSS file, or description. Produces a token inventory, hierarchy map, theme mapping, and ready-to-paste code blocks.

---

## JobFunnel Design System Reference

### Color Tokens

| Semantic Token | Value | Usage |
|---|---|---|
| `color-interactive-primary` | `#2563EB` | Buttons, links, active states |
| `color-feedback-success` | `#10B981` | Success states, offer stage |
| `color-feedback-warning` | `#F59E0B` | Warning states, interview stage |
| `color-feedback-error` | `#EF4444` | Errors, rejected stage |
| `color-accent-purple` | `#8B5CF6` | Screening stage, Pro badge |
| `color-text-secondary` | `#64748B` | Muted text, metadata |
| `color-bg-app` | `#FAFAFA` | App background |
| `color-bg-card` | `#FFFFFF` | Card/surface background |

### Tech Stack
- **Components**: shadcn/ui + cva (class-variance-authority)
- **Styling**: Tailwind CSS 3.x
- **Icons**: Lucide React
- **Charts**: Recharts 2.x
- **Dark mode**: next-themes with Tailwind `dark:` variant

### Mobile Standards
- Minimum touch target: **44×44px**
- Mobile-first: single column at `<640px`
- Error states: always include a **Retry** CTA
- Empty states: explanation + next-step CTA

---

## Folder Structure

```
design-systems/
├── README.md
├── .claude-plugin/
│   └── plugin.json
├── commands/
│   ├── audit-system.md
│   ├── create-component.md
│   └── tokenize.md
└── skills/
    ├── design-token/
    │   └── SKILL.md
    ├── component-spec/
    │   └── SKILL.md
    ├── accessibility-audit/
    │   └── SKILL.md
    ├── naming-convention/
    │   └── SKILL.md
    ├── theming-system/
    │   └── SKILL.md
    ├── pattern-library/
    │   └── SKILL.md
    ├── icon-system/
    │   └── SKILL.md
    └── documentation-template/
        └── SKILL.md
```
