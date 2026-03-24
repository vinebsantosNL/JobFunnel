# /tokenize

Extract, organize, and document design tokens from an existing codebase, stylesheet, or design description.

## Usage

```
/tokenize [source]
```

**Examples:**
- `/tokenize tailwind.config.ts` — extract tokens from the Tailwind config
- `/tokenize globals.css` — extract tokens from CSS custom properties
- `/tokenize "buttons use #2563EB for primary and #10B981 for success"` — tokenize from a description
- `/tokenize --audit` — audit existing tokens for hierarchy violations (raw values in components)

## What This Command Does

Transforms raw visual values into a structured, semantic token system through seven steps:

1. **Extract** — identify all visual values present in the source (colors, spacing, radii, shadows, typography, motion)
2. **Deduplicate** — group identical or near-identical values; surface candidates for consolidation
3. **Categorize** — arrange tokens by logical category (color, spacing, typography, elevation, motion, border)
4. **Establish hierarchy** — structure tokens across global → alias → component tiers using the `design-token` skill
5. **Apply naming** — apply the `{category}-{property}-{concept}-{variant}-{state}` pattern via `naming-convention`
6. **Map themes** — organize token variants for light/dark modes using the `theming-system` skill
7. **Document** — create a reference guide using `documentation-template` Template 2 (Token Documentation)

## Deliverables

A complete token specification including:

```
## Token Inventory
[Full categorized list: name, value, alias, usage description]

## Hierarchy Map
[Global → Alias → Component relationships]

## Theme Mapping
[Light and dark overrides for each semantic token]

## Tailwind Extension
[Ready-to-paste tailwind.config.ts extend block]

## CSS Custom Properties
[Ready-to-paste :root and .dark blocks for globals.css]

## Migration Guide
[List of raw values found in components that should be replaced with tokens]
```

## Audit Mode (`--audit`)

When run with `--audit`, the command scans the codebase for:
- Raw hex/rgb/hsl values in component files (should be tokens)
- Hardcoded spacing values (should be Tailwind scale or tokens)
- Font sizes not on the typography scale
- z-index values not using the elevation token set

Reports each finding with: file location, current value, and recommended token replacement.

## JobFunnel Token Baseline

When tokenizing for JobFunnel, align to the established baseline before adding new values:

| Semantic Token | Value | Tailwind Utility |
|---|---|---|
| `color-interactive-primary` | `#2563EB` | `text-primary` / `bg-primary` |
| `color-feedback-success` | `#10B981` | `text-success` / `bg-success` |
| `color-feedback-warning` | `#F59E0B` | `text-warning` / `bg-warning` |
| `color-feedback-error` | `#EF4444` | `text-error` / `bg-error` |
| `color-accent-purple` | `#8B5CF6` | `text-purple` / `bg-purple` |
| `color-text-secondary` | `#64748B` | `text-secondary` |
| `color-bg-app` | `#FAFAFA` | `bg-app` |
| `color-bg-card` | `#FFFFFF` | `bg-card` |

New tokens must extend this set, not bypass it.

## Skills Used

- `design-token` — hierarchy and naming framework
- `naming-convention` — token naming patterns
- `theming-system` — light/dark theme mapping
- `documentation-template` — output structure

## Next Steps After Tokenizing

- Run `/audit-system tokens` to validate that components are consuming new tokens correctly
- Update `tailwind.config.ts` with the generated extension block
- Update `globals.css` with the CSS custom property blocks
