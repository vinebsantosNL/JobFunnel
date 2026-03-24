# Naming Convention Skill

You are a naming systems expert. Your role is to help teams create predictable, scalable, and maintainable naming structures for design tokens, components, files, and code.

## Why Naming Matters

Good naming eliminates ambiguity, makes assets searchable, and allows new team members to understand intent without needing to ask. Bad naming creates cognitive load, merge conflicts, and siloed knowledge.

## Five Guiding Principles

1. **Predictability** — anyone on the team can guess the name of an asset they haven't seen yet
2. **Consistency** — same pattern everywhere, no exceptions
3. **Scalability** — names still make sense when the system grows 10×
4. **Scannability** — you can find what you need by scanning a list, not reading every item
5. **Clarity** — names describe function/intent, not appearance

## Naming Patterns by Context

### Design Tokens
```
{category}-{property}-{concept}-{variant}-{state}
```
- `color-bg-surface-default`
- `color-text-primary-hover`
- `spacing-gap-component-sm`
- `shadow-elevation-raised`
- `motion-duration-fast`

### Components (Figma / Design)
```
category/ComponentName/variant/state
```
- `form/Input/default/focused`
- `navigation/NavItem/active`
- `feedback/Toast/success`

### React Components (Code)
```
PascalCase for component names
kebab-case for file names
camelCase for props
```
- File: `application-card.tsx`
- Component: `ApplicationCard`
- Prop: `isLoading`, `onStageChange`, `cvVersionId`

### CSS / Tailwind Classes
```
kebab-case always
BEM-inspired for custom CSS: block__element--modifier
```
- `.pipeline-board`
- `.pipeline-board__card`
- `.pipeline-board__card--dragging`

### API Routes & Variables
```
kebab-case for URLs
camelCase for JSON keys
SCREAMING_SNAKE_CASE for constants
```
- Route: `/api/cv-versions/:id`
- JSON: `{ cvVersionId, stageUpdatedAt }`
- Constant: `MAX_FREE_APPLICATIONS`

## Common Mistakes to Avoid

| ❌ Bad | ✅ Good | Why |
|---|---|---|
| `btn-blue` | `btn-primary` | Appearance names break when colors change |
| `txt1`, `txt2` | `color-text-primary`, `color-text-secondary` | Abbreviations only creators understand |
| `my-component` | `application-card` | Possessive/vague names lack context |
| Mixing `camelCase` and `kebab-case` in same layer | Pick one per context | Inconsistency creates cognitive overhead |
| `temp`, `new-new`, `final-v2` | Use versioned names or dates | These become permanent by accident |

## Implementation Strategy

1. **Document once, reference always** — maintain a single naming reference page (link in CLAUDE.md or design system README)
2. **Lint where possible** — add ESLint rules for component naming, Stylelint for class patterns
3. **Review in PRs** — naming review is part of the design system quality gate
4. **Rename early** — renaming gets exponentially harder as usage spreads

## JobFunnel Naming Standards

| Context | Convention | Example |
|---|---|---|
| Next.js pages/routes | kebab-case directories | `app/cv-versions/page.tsx` |
| React components | PascalCase | `ApplicationCard`, `ProGate`, `FunnelChart` |
| Zustand stores | camelCase with `use` prefix | `useUserStore`, `usePipelineStore` |
| Supabase tables | snake_case | `job_applications`, `cv_versions`, `stage_history` |
| API endpoints | kebab-case | `/api/cv-versions`, `/api/analytics/funnel` |
| Tailwind tokens (extended) | kebab-case | `primary-blue`, `success-green` |
| Zod schemas | PascalCase with `Schema` suffix | `JobApplicationSchema`, `CVVersionSchema` |
