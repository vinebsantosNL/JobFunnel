# /create-component

Generate a complete component specification from a name or description.

## Usage

```
/create-component [component name or description]
```

**Examples:**
- `/create-component Button` — scaffold a Button component spec
- `/create-component ApplicationCard` — spec the job application Kanban card
- `/create-component notification banner with dismiss action` — spec from a description

## What This Command Does

Produces a complete, implementation-ready component spec through a structured workflow:

1. **Research** — identify the component's purpose, user need, and how it fits the JobFunnel product
2. **Anatomy** — break down structural elements using the `component-spec` skill
3. **Variants** — define size, style, and layout options with token mappings
4. **States** — map all interactive and visual states (hover, focus, loading, error, disabled, empty)
5. **Token mapping** — identify which design tokens the component consumes, using the `design-token` skill
6. **Accessibility** — specify ARIA roles, keyboard navigation, and contrast requirements via the `accessibility-audit` skill
7. **Naming** — apply consistent naming conventions for the component, its props, and its CSS classes via `naming-convention`
8. **Documentation** — structure the output using the `documentation-template` skill

## Deliverables

A complete spec document covering:

- Overview and use cases
- Anatomy with required / optional elements
- Variants table with token mappings
- Props / API table with types, defaults, and descriptions
- States documented with visual diff from default
- Behavior (interactions, animations, responsive rules, edge cases)
- Accessibility (ARIA, keyboard navigation, contrast)
- Code example (TypeScript + Tailwind + shadcn/ui)
- Changelog (v1.0.0 entry)

## Output Format

Uses `documentation-template` Template 1 (Component Documentation) as the structure.

## JobFunnel Defaults

All specs generated for JobFunnel apply these defaults automatically:

- Base component: **shadcn/ui** primitive extended via `cva`
- Tokens: JobFunnel semantic token set (see `design-token` SKILL.md)
- Minimum touch target: **44×44px**
- Mobile-first: single column at `<640px`
- Error states: always include a **Retry** or recovery CTA
- Empty states: include a one-line explanation + next-step CTA
- Theme: spec must cover both light and dark mode

## Skills Used

- `component-spec` — structural framework
- `design-token` — token identification and mapping
- `accessibility-audit` — ARIA and contrast requirements
- `naming-convention` — prop and class naming
- `documentation-template` — output structure

## Next Steps After Creating a Component

- Run `/audit-system [component name]` to validate the implemented component against the spec
- Add the component to the pattern library if it introduces a new UX pattern
