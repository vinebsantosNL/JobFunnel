---
name: configuration
description: >
  Environment variable and configuration management for JobFunnel OS — .env.local rules, NEXT_PUBLIC_
  prefix, Supabase keys, Vercel secrets, and the config access pattern. Use when accessing env vars,
  setting up a new environment, or adding configuration. Trigger on: "environment variable",
  "env.local", "NEXT_PUBLIC", "supabase url", "config", "secrets", "vercel env", "api key".
---

# Configuration Management — JobFunnel OS

Complete guide to environment variables and configuration in Next.js 16 / Vercel. There is no `unifiedConfig.ts`, no `config.ini`, no `process.env` scattered through the codebase. All configuration is managed via `.env.local` and a typed config helper.

---

## The .env.local File

```bash
# .env.local — Development only. NEVER commit this file.

# Supabase (Required)
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGci...your-anon-key

# Supabase Service Role — Server-only operations (migrations, admin scripts ONLY)
# NEVER use in Route Handlers or client code
SUPABASE_SERVICE_ROLE_KEY=eyJhbGci...your-service-role-key

# Resend Email (magic links, notifications, weekly summaries)
RESEND_API_KEY=re_your_resend_api_key

# App URL
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

---

## NEXT_PUBLIC_ Prefix Rules

This is the most important config rule in Next.js.

```typescript
// ✅ Variables prefixed NEXT_PUBLIC_ are exposed to the browser
// Use for: Supabase URL, Supabase anon key, app URL
process.env.NEXT_PUBLIC_SUPABASE_URL       // Available in browser + server
process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY  // Available in browser + server
process.env.NEXT_PUBLIC_APP_URL            // Available in browser + server

// ✅ Variables WITHOUT NEXT_PUBLIC_ are server-only
// Use for: Service role key, email API keys, secrets
process.env.SUPABASE_SERVICE_ROLE_KEY      // SERVER ONLY — never in 'use client' code
process.env.RESEND_API_KEY                 // SERVER ONLY
```

**The Rule:** If a secret would cause a security breach if exposed in the browser, it must NOT have `NEXT_PUBLIC_` prefix.

```typescript
// ❌ NEVER: Service role key with NEXT_PUBLIC_ prefix
NEXT_PUBLIC_SUPABASE_SERVICE_ROLE=...    // This would expose admin access to every user!

// ❌ NEVER: Access server-only variables in Client Components
'use client';
const key = process.env.RESEND_API_KEY;  // undefined in browser + security risk
```

---

## Typed Config Helper

Instead of scattered `process.env.X` calls, use a typed config object:

```typescript
// lib/config.ts

// Server-side config (only access in Route Handlers, Server Components, middleware)
export const serverConfig = {
  supabase: {
    url: process.env.NEXT_PUBLIC_SUPABASE_URL!,
    anonKey: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    serviceRoleKey: process.env.SUPABASE_SERVICE_ROLE_KEY!,
  },
  resend: {
    apiKey: process.env.RESEND_API_KEY!,
  },
  app: {
    url: process.env.NEXT_PUBLIC_APP_URL ?? 'http://localhost:3000',
  },
} as const;

// Client-safe config (safe to import in 'use client' components)
export const clientConfig = {
  supabase: {
    url: process.env.NEXT_PUBLIC_SUPABASE_URL!,
    anonKey: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
  },
  app: {
    url: process.env.NEXT_PUBLIC_APP_URL ?? 'http://localhost:3000',
  },
} as const;
```

### Usage

```typescript
// ✅ In Route Handler (server-only)
import { serverConfig } from '@/lib/config';
const resend = new Resend(serverConfig.resend.apiKey);

// ✅ In Client Component
import { clientConfig } from '@/lib/config';
const supabase = createBrowserClient(
  clientConfig.supabase.url,
  clientConfig.supabase.anonKey
);

// ❌ NEVER: Inline process.env access
const url = process.env.NEXT_PUBLIC_SUPABASE_URL;  // No type safety, no central source
```

---

## Startup Validation

Catch misconfiguration early — validate required env vars at startup:

```typescript
// lib/config.ts (add at bottom)
const requiredEnvVars = [
  'NEXT_PUBLIC_SUPABASE_URL',
  'NEXT_PUBLIC_SUPABASE_ANON_KEY',
] as const;

// Only validate in non-test environments
if (process.env.NODE_ENV !== 'test') {
  for (const key of requiredEnvVars) {
    if (!process.env[key]) {
      throw new Error(`Missing required environment variable: ${key}`);
    }
  }
}
```

---

## All Environment Variables

### Required for Development

| Variable | Prefix | Used in | Description |
|---|---|---|---|
| `NEXT_PUBLIC_SUPABASE_URL` | `NEXT_PUBLIC_` | Client + Server | Supabase project URL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | `NEXT_PUBLIC_` | Client + Server | Supabase anon key (public) |
| `SUPABASE_SERVICE_ROLE_KEY` | — | Server only | Admin key for migrations |
| `RESEND_API_KEY` | — | Server only | Email sending |
| `NEXT_PUBLIC_APP_URL` | `NEXT_PUBLIC_` | Client + Server | App base URL |

### Optional (Future)

| Variable | Description |
|---|---|
| `STRIPE_SECRET_KEY` | Stripe billing (Phase 3) |
| `STRIPE_WEBHOOK_SECRET` | Stripe webhooks (Phase 3) |
| `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` | Stripe client-side (Phase 3) |

---

## Environment Setup Per Environment

### Local Development

```bash
# .env.local
NEXT_PUBLIC_SUPABASE_URL=https://[project-ref].supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJ...
SUPABASE_SERVICE_ROLE_KEY=eyJ...
RESEND_API_KEY=re_...
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

### Vercel (Production/Preview)

Set in Vercel Dashboard → Project → Settings → Environment Variables.

```
Environment: Production + Preview + Development

NEXT_PUBLIC_SUPABASE_URL     → [your production supabase url]
NEXT_PUBLIC_SUPABASE_ANON_KEY → [your production anon key]
SUPABASE_SERVICE_ROLE_KEY     → [your service role key] (Production only)
RESEND_API_KEY                → [your resend key]
NEXT_PUBLIC_APP_URL           → https://jobfunnel.app
```

### .gitignore (Critical)

```gitignore
# .gitignore — these must NEVER be committed
.env
.env.local
.env.*.local
.env.development.local
.env.test.local
.env.production.local
```

---

## Supabase Keys Explained

```typescript
// ANON KEY: Public key for client-side use
// - RLS enforces user data isolation
// - Safe to expose in browser (by design)
// - Use in createBrowserClient() and createServerClient()

// SERVICE ROLE KEY: Admin key that BYPASSES RLS
// - Never use in Route Handlers or client code
// - Only for: database migrations, admin scripts, Supabase Studio
// - If leaked: any user can read/write any user's data
```

---

## Secrets Management

### DO NOT Commit Secrets

```bash
# Check for accidentally staged secrets before committing
git diff --cached | grep -i "supabase\|resend\|secret\|key"
```

### Rotate Keys if Exposed

If a secret is accidentally committed or exposed:
1. Go to Supabase Dashboard → Settings → API → Regenerate key
2. Go to Resend Dashboard → API Keys → Revoke + Create new
3. Update Vercel environment variables
4. Force redeploy

---

## Related Files

- [backend-dev-guidelines.md](backend-dev-guidelines.md) — Core standards
- [middleware-guide.md](middleware-guide.md) — How Supabase client uses these keys
