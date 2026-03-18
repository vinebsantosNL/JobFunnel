# JobFunnel OS — Claude Instructions

## Frontend Standards

Before making any frontend change (components, pages, styling, layout), follow the guidelines in `FrondDeveloper.md`. Key rules:

- **Stack versions are non-negotiable**: Next.js 14.x, React 18, TypeScript 5.x, Tailwind 3.x, TanStack Query v5
- **Do NOT use** Next.js 15 APIs, React 19 APIs (`useActionState`, `useOptimistic`), MUI, Chakra, Prisma, NextAuth
- **Component library**: shadcn/ui primitives first; extend with Tailwind `cva` — never custom CSS files
- **State**: TanStack Query v5 for server state; Zustand 4.x for global UI state
- **Auth**: Supabase only via `@supabase/ssr`; always scope queries to `auth.uid()` via RLS
- **Forms**: Zod 3.x + React Hook Form; validate on both client and API route
- **Charts**: Recharts 2.x only
- **Drag-and-drop**: @dnd-kit/core only
- **Animation**: Framer Motion for complex; Tailwind `transition` for simple hover/focus
- **Tests**: Vitest + React Testing Library (not Jest)
- **Design tokens**: primary `#2563EB`, success `#10B981`, warning `#F59E0B`, error `#EF4444`, purple `#8B5CF6`

Full guidelines: see `FrondDeveloper.md`
