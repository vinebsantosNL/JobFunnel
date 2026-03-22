---
name: database-patterns
description: >
  Supabase query patterns for JobFunnel OS — selects, inserts, updates, deletes, transactions, RLS,
  N+1 prevention, and error handling. Use when writing any Supabase client query, designing new tables,
  or optimizing existing queries. Trigger on: "supabase query", "database query", "insert record",
  "fetch from supabase", "N+1", "RLS policy", "transaction", "query optimization".
---

# Database Patterns — Supabase in JobFunnel OS

Complete guide to Supabase query patterns. The database is Postgres hosted on Supabase. All queries run through `@supabase/ssr` — never raw SQL on the client.

---

## Core Tables (Schema Reference)

```sql
profiles          -- id (FK to auth.users), email, full_name, role, subscription_tier, ...
job_applications  -- id, user_id, company_name, job_title, stage, priority, cv_version_id, ...
stage_history     -- id, job_id, from_stage, to_stage, transitioned_at
interview_stories -- id, user_id, title, situation, task, action, result, competencies[], ...
cv_versions       -- id, user_id, name, description, tags[], is_default, is_archived, ...  (Phase 2)
```

All tables: UUID PKs, `user_id` foreign key, RLS enabled with `user_id = auth.uid()`.

---

## Client Setup

### Server-Side (Route Handlers, Server Components)

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
```

### Client-Side (React Client Components)

```typescript
// lib/supabase/client.ts
import { createBrowserClient } from '@supabase/ssr';
import type { Database } from '@/types/database.types';

export function getBrowserClient() {
  return createBrowserClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );
}
```

---

## Basic Query Patterns

### Select (List)

```typescript
// ✅ List all job applications for current user
// RLS ensures only the authenticated user's rows are returned
const { data, error } = await supabase
  .from('job_applications')
  .select('id, company_name, job_title, stage, priority, created_at')
  .order('created_at', { ascending: false });

if (error) throw new AppError(error.message, 500);
```

### Select (Single)

```typescript
// ✅ Fetch single application
const { data, error } = await supabase
  .from('job_applications')
  .select('*, stage_history(*)')
  .eq('id', jobId)
  .single();

if (error?.code === 'PGRST116') throw new NotFoundError('Application not found');
if (error) throw new AppError(error.message, 500);
```

### Select with Joins

```typescript
// ✅ Fetch application with CV version (Phase 2)
const { data, error } = await supabase
  .from('job_applications')
  .select(`
    id,
    company_name,
    job_title,
    stage,
    cv_version_id,
    cv_versions (
      id,
      name,
      is_default
    )
  `)
  .eq('id', jobId)
  .single();
```

### Select with Filters

```typescript
// ✅ Filter by stage (Pipeline Kanban)
const { data } = await supabase
  .from('job_applications')
  .select('*')
  .in('stage', ['applied', 'screening', 'interviewing'])
  .order('stage_updated_at', { ascending: false });

// ✅ Filter by multiple conditions
const { data } = await supabase
  .from('job_applications')
  .select('*')
  .eq('stage', 'interviewing')
  .eq('priority', 'high')
  .gte('applied_at', thirtyDaysAgo);
```

---

## Mutation Patterns

### Insert

```typescript
// ✅ Insert new job application
const { data, error } = await supabase
  .from('job_applications')
  .insert({
    user_id: user.id,         // Always include user_id explicitly for clarity
    company_name: data.company_name,
    job_title: data.job_title,
    stage: data.stage ?? 'saved',
    priority: data.priority ?? 'medium',
    applied_at: data.stage === 'applied' ? new Date().toISOString() : null,
  })
  .select()
  .single();

if (error) throw new AppError(error.message, 500);
return data;
```

### Update

```typescript
// ✅ Update job application
const { data, error } = await supabase
  .from('job_applications')
  .update({
    company_name: updates.company_name,
    job_title: updates.job_title,
    notes: updates.notes,
    updated_at: new Date().toISOString(),
  })
  .eq('id', jobId)
  .select()
  .single();

if (error?.code === 'PGRST116') throw new NotFoundError('Application not found');
if (error) throw new AppError(error.message, 500);
```

### Delete

```typescript
// ✅ Delete job application
const { error } = await supabase
  .from('job_applications')
  .delete()
  .eq('id', jobId);

if (error) throw new AppError(error.message, 500);
```

---

## Multi-Step Operations (Pseudo-Transactions)

Supabase JS client doesn't expose `BEGIN/COMMIT` directly. Use `Promise.all` for parallel inserts, or RPC for atomic operations.

### Parallel Writes

```typescript
// ✅ Stage transition: update application + insert history simultaneously
const [updateResult, historyResult] = await Promise.all([
  supabase
    .from('job_applications')
    .update({ stage: newStage, stage_updated_at: new Date().toISOString() })
    .eq('id', jobId)
    .select()
    .single(),
  supabase
    .from('stage_history')
    .insert({
      job_id: jobId,
      from_stage: currentStage,
      to_stage: newStage,
      transitioned_at: new Date().toISOString(),
    }),
]);

if (updateResult.error) throw new AppError(updateResult.error.message, 500);
if (historyResult.error) throw new AppError(historyResult.error.message, 500);
```

### Supabase RPC (True Atomic Operations)

```typescript
// For operations that MUST be atomic, use a Postgres function
const { data, error } = await supabase.rpc('transition_job_stage', {
  p_job_id: jobId,
  p_new_stage: newStage,
  p_transitioned_at: new Date().toISOString(),
});
```

---

## Query Optimization

### Select Only Needed Columns

```typescript
// ❌ Fetches all columns — wasteful for list views
const { data } = await supabase.from('job_applications').select('*');

// ✅ Select only what the Kanban card needs
const { data } = await supabase
  .from('job_applications')
  .select('id, company_name, job_title, stage, priority, stage_updated_at');
```

### Avoid N+1 Queries

```typescript
// ❌ N+1 Problem: 1 query for applications + 1 per application for history
const { data: jobs } = await supabase.from('job_applications').select('id, stage');
for (const job of jobs ?? []) {
  const { data: history } = await supabase  // N queries!
    .from('stage_history')
    .select('*')
    .eq('job_id', job.id);
}

// ✅ Single query with join
const { data: jobs } = await supabase
  .from('job_applications')
  .select('id, stage, stage_history(*)');
```

### Pagination

```typescript
// ✅ Paginated list (important for analytics and large pipelines)
const pageSize = 20;
const offset = page * pageSize;

const { data, count, error } = await supabase
  .from('job_applications')
  .select('*', { count: 'exact' })
  .range(offset, offset + pageSize - 1)
  .order('created_at', { ascending: false });
```

---

## Analytics Queries

### Funnel Conversion Rates

```typescript
// ✅ Count per stage for funnel analytics
const { data, error } = await supabase
  .from('job_applications')
  .select('stage')
  .neq('stage', 'withdrawn');

// Group client-side or use a view/function
const stageCounts = data?.reduce((acc, { stage }) => {
  acc[stage] = (acc[stage] ?? 0) + 1;
  return acc;
}, {} as Record<string, number>);
```

### Time in Stage

```typescript
// ✅ Average time in stage using stage_history
const { data } = await supabase
  .from('stage_history')
  .select('from_stage, to_stage, transitioned_at, job_applications!inner(user_id)')
  .order('transitioned_at', { ascending: true });
```

### CV A/B Comparison (Phase 2)

```typescript
// ✅ Always LEFT JOIN from job_applications to cv_versions
// So rows with NULL cv_version_id appear as "Untagged"
const { data } = await supabase
  .from('job_applications')
  .select(`
    stage,
    cv_version_id,
    cv_versions (name)
  `);
// NULL cv_version_id rows → "Untagged" bucket in analytics
```

---

## RLS Patterns

### Check Current Policies

```sql
-- Run in Supabase SQL editor to verify
select schemaname, tablename, policyname, cmd, qual
from pg_policies
where schemaname = 'public';
```

### Standard Policy Pattern

```sql
-- All CRUD for own rows
create policy "users_own_job_applications"
  on job_applications
  for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);
```

### Free Tier Enforcement in SQL

```sql
-- Trigger to enforce free tier application limit
create or replace function check_application_limit()
returns trigger as $$
declare
  app_count int;
  user_tier text;
begin
  select subscription_tier into user_tier from profiles where id = new.user_id;
  if user_tier = 'free' then
    select count(*) into app_count from job_applications
    where user_id = new.user_id and stage not in ('rejected', 'withdrawn');
    if app_count >= 5 then
      raise exception 'Free tier limit: 5 active applications';
    end if;
  end if;
  return new;
end;
$$ language plpgsql security definer;
```

---

## Error Handling

### Supabase Error Codes

```typescript
import { AppError, NotFoundError, ConflictError } from '@/lib/utils/errors';

try {
  const { data, error } = await supabase.from('profiles').insert(newProfile).select().single();

  if (error) {
    // Unique constraint violation (e.g. email already exists)
    if (error.code === '23505') throw new ConflictError('Email already in use');

    // Foreign key violation
    if (error.code === '23503') throw new AppError('Invalid reference', 400, 'FK_VIOLATION');

    // Row not found (PostgREST)
    if (error.code === 'PGRST116') throw new NotFoundError('Record not found');

    // Check constraint violation
    if (error.code === '23514') throw new AppError(error.message, 422, 'CONSTRAINT_VIOLATION');

    throw new AppError(error.message, 500);
  }

  return data;
} catch (err) {
  if (err instanceof AppError) throw err;
  throw new AppError('Database operation failed', 500);
}
```

### Common Supabase Error Codes

| Code | Meaning | Throw |
|---|---|---|
| `PGRST116` | 0 rows returned on `.single()` | `NotFoundError` |
| `23505` | Unique constraint violation | `ConflictError` |
| `23503` | Foreign key violation | `AppError(400)` |
| `23514` | Check constraint violation | `AppError(422)` |
| `42501` | RLS policy violation | `ForbiddenError` |

---

## Typed Queries

### Generate Types from Schema

```bash
# Run after any schema migration
npx supabase gen types typescript --project-id YOUR_PROJECT_ID > types/database.types.ts
```

### Use Generated Types

```typescript
import type { Database } from '@/types/database.types';
import type { Tables, TablesInsert, TablesUpdate } from '@/types/database.types';

type JobApplication = Tables<'job_applications'>;
type NewJobApplication = TablesInsert<'job_applications'>;
type JobApplicationUpdate = TablesUpdate<'job_applications'>;
```

---

## Related Files

- [backend-dev-guidelines.md](backend-dev-guidelines.md) — Core standards
- [services-and-repositories.md](services-and-repositories.md) — Where queries live
- [async-and-errors.md](async-and-errors.md) — Error handling patterns
