---
name: routing-and-controllers
description: >
  Next.js 16 App Router Route Handler patterns for JobFunnel OS — file structure, HTTP method exports,
  auth checks, response formatting, and HTTP status codes. Use when writing or reviewing Route Handlers.
  Trigger on: "route handler", "api route", "GET endpoint", "POST endpoint", "PATCH endpoint",
  "DELETE endpoint", "NextResponse", "app router api", "next.js api".
---

# Routing and Controllers — Next.js 16 App Router Route Handlers

Complete guide to Route Handler patterns in JobFunnel OS. There is no Express. There is no BaseController. Every backend endpoint is a Next.js Route Handler in `app/api/`.

---

## Route Handler Structure

### The Golden Rule

**Route Handlers should ONLY:**
- ✅ Verify the Supabase session (auth)
- ✅ Parse and validate input with Zod `safeParse`
- ✅ Call one service function
- ✅ Return `NextResponse.json()`

**Route Handlers should NEVER:**
- ❌ Contain business logic (tier checks, ownership rules)
- ❌ Call Supabase directly (beyond auth — that goes in service functions)
- ❌ Have more than one try-catch block
- ❌ Be longer than ~50 lines

### File Layout

```
app/api/jobs/
├── route.ts          ← GET (list), POST (create)
└── [id]/
    ├── route.ts      ← GET (single), PATCH (update), DELETE
    └── stage/
        └── route.ts  ← POST (stage transition)
```

---

## Complete Route Handler Examples

### GET (List)

```typescript
// app/api/jobs/route.ts
import { NextResponse } from 'next/server';
import { getServerClient } from '@/lib/supabase/server';
import { getJobApplications } from '@/lib/services/jobService';
import { handleApiError } from '@/lib/utils/apiHandler';

export async function GET() {
  try {
    const supabase = await getServerClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (!user || authError) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const jobs = await getJobApplications(supabase, user.id);
    return NextResponse.json({ data: jobs });

  } catch (error) {
    return handleApiError(error, 'GET /api/jobs');
  }
}
```

### POST (Create)

```typescript
// app/api/jobs/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { CreateJobSchema } from '@/validations/job.schemas';

export async function POST(req: NextRequest) {
  try {
    const supabase = await getServerClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (!user || authError) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const parsed = CreateJobSchema.safeParse(await req.json());
    if (!parsed.success) {
      return NextResponse.json(
        { error: { message: 'Validation failed', details: parsed.error.flatten() } },
        { status: 400 }
      );
    }

    const job = await createJobApplication(supabase, user.id, parsed.data);
    return NextResponse.json({ data: job }, { status: 201 });

  } catch (error) {
    return handleApiError(error, 'POST /api/jobs');
  }
}
```

### GET Single / PATCH / DELETE

```typescript
// app/api/jobs/[id]/route.ts
import { NextRequest, NextResponse } from 'next/server';

type Params = { params: { id: string } };

export async function GET(_req: NextRequest, { params }: Params) {
  try {
    const supabase = await getServerClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (!user || authError) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const job = await getJobById(supabase, params.id);
    return NextResponse.json({ data: job });

  } catch (error) {
    return handleApiError(error, `GET /api/jobs/${params.id}`);
  }
}

export async function PATCH(req: NextRequest, { params }: Params) {
  try {
    const supabase = await getServerClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (!user || authError) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const parsed = UpdateJobSchema.safeParse(await req.json());
    if (!parsed.success) {
      return NextResponse.json(
        { error: { message: 'Validation failed', details: parsed.error.flatten() } },
        { status: 400 }
      );
    }

    const job = await updateJobApplication(supabase, params.id, user.id, parsed.data);
    return NextResponse.json({ data: job });

  } catch (error) {
    return handleApiError(error, `PATCH /api/jobs/${params.id}`);
  }
}

export async function DELETE(_req: NextRequest, { params }: Params) {
  try {
    const supabase = await getServerClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (!user || authError) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    await deleteJobApplication(supabase, params.id, user.id);
    return new NextResponse(null, { status: 204 });

  } catch (error) {
    return handleApiError(error, `DELETE /api/jobs/${params.id}`);
  }
}
```

### POST Stage Transition

```typescript
// app/api/jobs/[id]/stage/route.ts
import { StageTransitionSchema } from '@/validations/job.schemas';

export async function POST(req: NextRequest, { params }: Params) {
  try {
    const supabase = await getServerClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (!user || authError) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const parsed = StageTransitionSchema.safeParse(await req.json());
    if (!parsed.success) {
      return NextResponse.json(
        { error: { message: 'Validation failed', details: parsed.error.flatten() } },
        { status: 400 }
      );
    }

    const job = await transitionJobStage(supabase, params.id, user.id, parsed.data);
    return NextResponse.json({ data: job });

  } catch (error) {
    return handleApiError(error, `POST /api/jobs/${params.id}/stage`);
  }
}
```

---

## Response Formatting

### Standard Response Shape

```typescript
// Success
return NextResponse.json({ data: result });                         // 200
return NextResponse.json({ data: result }, { status: 201 });        // 201 Created
return new NextResponse(null, { status: 204 });                     // 204 No Content

// Error (from handleApiError)
return NextResponse.json(
  { error: { message: 'Human-readable message', code: 'MACHINE_CODE' } },
  { status: 4xx | 5xx }
);

// Validation error
return NextResponse.json(
  { error: { message: 'Validation failed', details: parsed.error.flatten() } },
  { status: 400 }
);
```

### HTTP Status Codes

| Code | When to use |
|---|---|
| `200` | GET success, PATCH success |
| `201` | POST success — resource created |
| `204` | DELETE success — no body |
| `400` | Zod validation failed |
| `401` | No valid Supabase session |
| `403` | Authenticated but forbidden (wrong tier, wrong owner) |
| `404` | Resource not found |
| `409` | Conflict (duplicate email, etc.) |
| `422` | Business rule violation (CV locked, etc.) |
| `500` | Unexpected server error |

---

## Auth Helper Pattern

### Reusable Auth Check

```typescript
// lib/supabase/server.ts
import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';
import type { Database } from '@/types/database.types';

export async function getServerClient() {
  const cookieStore = cookies();
  return createServerClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll: () => cookieStore.getAll(),
        setAll: (cookiesToSet) => {
          cookiesToSet.forEach(({ name, value, options }) =>
            cookieStore.set(name, value, options)
          );
        },
      },
    }
  );
}

// lib/utils/auth.ts
import { NextResponse } from 'next/server';
import type { SupabaseClient } from '@supabase/supabase-js';

export async function requireAuth(supabase: SupabaseClient) {
  const { data: { user }, error } = await supabase.auth.getUser();
  if (!user || error) {
    return { user: null, response: NextResponse.json({ error: 'Unauthorized' }, { status: 401 }) };
  }
  return { user, response: null };
}

// Usage
const { user, response } = await requireAuth(supabase);
if (response) return response;
// user is guaranteed non-null from here
```

---

## Anti-Patterns (Reject Immediately)

### Business Logic in Route Handler ❌

```typescript
// ❌ BAD: Business logic directly in route handler
export async function POST(req: NextRequest) {
  const supabase = await getServerClient();
  const { data: { user } } = await supabase.auth.getUser();

  // ❌ Tier check in route handler
  const { data: profile } = await supabase.from('profiles').select('subscription_tier').single();
  if (profile?.subscription_tier !== 'pro') {
    return NextResponse.json({ error: 'Pro required' }, { status: 403 });
  }

  // ❌ Free tier count in route handler
  const { count } = await supabase.from('job_applications').select('*', { count: 'exact', head: true });
  if (count >= 5) {
    return NextResponse.json({ error: 'Limit reached' }, { status: 403 });
  }

  // ... more logic
}

// ✅ GOOD: Business logic in service function
export async function POST(req: NextRequest) {
  try {
    const supabase = await getServerClient();
    const { data: { user }, error } = await supabase.auth.getUser();
    if (!user || error) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const parsed = CreateJobSchema.safeParse(await req.json());
    if (!parsed.success) return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });

    // Service function handles tier check + limit check + creation
    const job = await createJobApplication(supabase, user.id, parsed.data);
    return NextResponse.json({ data: job }, { status: 201 });
  } catch (error) {
    return handleApiError(error, 'POST /api/jobs');
  }
}
```

### Raw SQL or Dangerous Queries ❌

```typescript
// ❌ NEVER: Bypass RLS with service role key in Route Handlers
const supabase = createClient(url, process.env.SUPABASE_SERVICE_ROLE_KEY!);

// ❌ NEVER: Use user-supplied values in raw SQL
const { data } = await supabase.rpc('raw_query', { sql: req.body.query });
```

---

## Route Map — JobFunnel OS

| Method | Route | Handler file |
|---|---|---|
| `POST` | `/api/auth/signup` | `app/api/auth/signup/route.ts` |
| `POST` | `/api/auth/login` | `app/api/auth/login/route.ts` |
| `POST` | `/api/auth/logout` | `app/api/auth/logout/route.ts` |
| `GET` | `/api/auth/callback` | `app/api/auth/callback/route.ts` |
| `GET` | `/api/auth/me` | `app/api/auth/me/route.ts` |
| `GET` | `/api/jobs` | `app/api/jobs/route.ts` |
| `POST` | `/api/jobs` | `app/api/jobs/route.ts` |
| `GET` | `/api/jobs/:id` | `app/api/jobs/[id]/route.ts` |
| `PATCH` | `/api/jobs/:id` | `app/api/jobs/[id]/route.ts` |
| `DELETE` | `/api/jobs/:id` | `app/api/jobs/[id]/route.ts` |
| `POST` | `/api/jobs/:id/stage` | `app/api/jobs/[id]/stage/route.ts` |
| `GET` | `/api/analytics/funnel` | `app/api/analytics/funnel/route.ts` |
| `GET` | `/api/analytics/timeline` | `app/api/analytics/timeline/route.ts` |
| `GET` | `/api/analytics/stage-time` | `app/api/analytics/stage-time/route.ts` |
| `GET` | `/api/stories` | `app/api/stories/route.ts` |
| `POST` | `/api/stories` | `app/api/stories/route.ts` |
| `GET` | `/api/stories/:id` | `app/api/stories/[id]/route.ts` |
| `PATCH` | `/api/stories/:id` | `app/api/stories/[id]/route.ts` |
| `DELETE` | `/api/stories/:id` | `app/api/stories/[id]/route.ts` |
| `GET` | `/api/dashboard/stats` | `app/api/dashboard/stats/route.ts` |
| `GET` | `/api/cv-versions` | `app/api/cv-versions/route.ts` *(Phase 2)* |
| `POST` | `/api/cv-versions` | `app/api/cv-versions/route.ts` *(Phase 2)* |
| `PATCH` | `/api/cv-versions/:id` | `app/api/cv-versions/[id]/route.ts` *(Phase 2)* |
| `DELETE` | `/api/cv-versions/:id` | `app/api/cv-versions/[id]/route.ts` *(Phase 2)* |

---

## Related Files

- [backend-dev-guidelines.md](backend-dev-guidelines.md) — Core standards
- [services-and-repositories.md](services-and-repositories.md) — Service functions called by routes
- [middleware-guide.md](middleware-guide.md) — Next.js middleware and session refresh
- [complete-examples.md](complete-examples.md) — Full end-to-end examples
