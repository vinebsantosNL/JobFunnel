# /audit-system

Evaluate a design system or component library for consistency, completeness, and accessibility.

## Usage

```
/audit-system [scope]
```

**Examples:**
- `/audit-system` — audit the full JobFunnel design system
- `/audit-system pipeline` — audit only the Pipeline Kanban components
- `/audit-system tokens` — audit only the token layer
- `/audit-system accessibility` — run an accessibility-only audit

## What This Command Does

Conducts a structured audit across seven dimensions:

1. **Component inventory** — catalog all components, tokens, and patterns currently in the system
2. **Naming consistency** — check that naming conventions are applied uniformly (reference the `naming-convention` skill)
3. **Documentation completeness** — identify missing specs, undocumented states, or incomplete component entries
4. **Accessibility compliance** — evaluate against WCAG 2.2 AA using the `accessibility-audit` skill
5. **Token utilization** — verify that components consume tokens correctly (no raw hex/rem values, correct tier usage)
6. **Theming coverage** — check that all semantic tokens are defined for each theme (light, dark)
7. **Pattern alignment** — identify UI patterns in use that lack formal pattern library entries

## Deliverables

The audit produces a structured report:

```
## Executive Summary
- Overall compliance level
- Issue counts by severity: Critical (N) | Major (N) | Minor (N) | Enhancement (N)
- Top 3 priority actions

## Critical Issues
[Blocking items with immediate remediation steps]

## Full Audit Findings
[Issue log: description, location, severity, WCAG criterion where applicable, fix]

## Remediation Roadmap
Sprint 1: [Critical fixes]
Sprint 2: [Major fixes]
Sprint 3+: [Minor + Enhancements]
```

## Skills Used

This command coordinates:
- `accessibility-audit` — WCAG 2.2 evaluation
- `naming-convention` — naming consistency check
- `design-token` — token layer validation
- `theming-system` — theme coverage check
- `documentation-template` — documentation completeness check

## Next Steps After Audit

- Run `/create-component` for any components that need spec work
- Run `/tokenize` to address token layer issues
- Open GitHub issues for each Critical and Major finding
