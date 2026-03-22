---
name: middleware-guide
description: >
  Next.js middleware and Supabase auth session patterns for JobFunnel OS — middleware.ts session refresh,
  protected route patterns, and cross-cutting concerns. Use when working with auth session management,
  protecting routes, or understanding how Supabase cookies work in Next.js. Trigger on: "middleware",
  "session refresh", "protect route", "supabase ssr", "auth session", "cookie handling",
  "next.js middleware", "createServerClient", "createBrowserClient".
---

# Middleware Guide — Next.js + Supabase Auth in JobFunnel OS

Complete guide to Next.js middleware and Supabase `@supabase/ssr` session handling. There is no Express middleware. Cross-cutting concerns are handled via Next.js `middleware.ts` and route-level auth checks in Route Handlers.

---

## middleware.ts — Session Refresh

The most important piece of middleware in JobFunnel OS is Supabase session refresh. Without it, the JWT token expires and users get kicked out mid-session.

```typescript
// middleware.ts (root of project, beside app/)
import { createServerClient } from '@supabase/ssr';
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export async function middleware(request: NextRequest) {
  let supabaseResponse = NextResponse.next({
    request,
  });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value)
          );
          supabaseResponse = NextResponse.next({ request });
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          );
        },
      },
    }
  );

  // ⚠️ IMPORTANT: Do not add any logic between createServerClient and getUser()
  // This pattern is from the official Supabase @supabase/ssr docs
  const { data: { user } } = await supabase.auth.getUser();

  // Redirect unauthenticated users from protected routes
  if (
    !user &&
    !request.nextUrl.pathname.startsWith('/login') &&
    !request.nextUrl.pathname.startsWith('/signup') &&
    !request.nextUrl.pathname.startsWith('/api/auth') &&
    request.nextUrl.pathname.startsWith('/app')
  ) {
    const url = request.nextUrl.clone();
    url.pathname = '/login';
    return NextResponse.redirect(url);
  }

  return supabaseResponse;
}

export const config = {
  matcher: [
    /*
     * Match all request paths EXCEPT:
     * - _next/static (static files)
     * - _next/image (image optimization)
     * - favicon.ico
     * - public files (images, fonts, etc.)
     */
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
};
```

**Why this pattern:**
- `createServerClient` + `getUser()` refreshes the Supabase session token on every request
- Sets updated cookies on the response so the next request has a fresh token
- The `middleware.ts` redirect is a UX optimization — Route Handlers ALSO check auth (defense in depth)

---

## Auth in Route Handlers (Defense in Depth)

The middleware redirect handles UX. Route Handlers verify auth independently for security.

```typescript
// app/api/jobs/route.ts
import { getServerClient } from '@/lib/supabase/server';
import { NextResponse } from 'next/server';

export async function GET() {
  // ✅ Always verify in Route Handler — don't rely on middleware alone
  const supabase = await getServerClient();
  const { data: { user }, error } = await supabase.auth.getUser();

  if (!user || error) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  // From here: user is guaranteed, RLS scopes all queries to their data
}
```

---

## Auth in Server Components (Protected Pages)

```typescript
// app/(dashboard)/layout.tsx
import { redirect } from 'next/navigation';
import { getServerClient } from '@/lib/supabase/server';

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const supabase = await getServerClient();
  const { data: { user } } = await supabase.auth.getUser();

  // Middleware handles this redirect, but belt + suspenders
  if (!user) {
    redirect('/login');
  }

  return (
    <div className="flex h-screen">
      <Sidebar />
      <main className="flex-1">{children}</main>
    </div>
  );
}
```

---

## Supabase Client Setup

### Server Client (Route Handlers and Server Components)

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
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options)
            );
          } catch {
            // setAll called from a Server Component — can be ignored
            // middleware handles token refresh
          }
        },
      },
    }
  );
}
```

### Browser Client (Client Components)

```typescript
// lib/supabase/client.ts
import { createBrowserClient } from '@supabase/ssr';
import type { Database } from '@/types/database.types';

// Singleton pattern — one client per browser session
let client: ReturnType<typeof createBrowserClient<Database>> | null = null;

export function getBrowserClient() {
  if (!client) {
    client = createBrowserClient<Database>(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    );
  }
  return client;
}
```

**Rule:** Use `getServerClient()` in Server Components and Route Handlers. Use `getBrowserClient()` in `'use client'` components.

---

## Auth Magic Link Flow

JobFunnel OS uses Supabase magic link (passwordless) as primary auth, Google/GitHub OAuth as secondary.

### Login Page

```typescript
// app/(auth)/login/page.tsx
'use client';
import { getBrowserClient } from '@/lib/supabase/client';

export default function LoginPage() {
  const supabase = getBrowserClient();

  const handleMagicLink = async (email: string) => {
    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: {
        emailRedirectTo: `${window.location.origin}/api/auth/callback`,
      },
    });
    if (error) {
      toast({ title: 'Error', description: error.message, variant: 'destructive' });
    } else {
      toast({ title: 'Check your email', description: 'Magic link sent!' });
    }
  };

  // ... form
}
```

### Auth Callback Route Handler

```typescript
// app/api/auth/callback/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { getServerClient } from '@/lib/supabase/server';

export async function GET(request: NextRequest) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get('code');

  if (code) {
    const supabase = await getServerClient();
    const { error } = await supabase.auth.exchangeCodeForSession(code);
    if (!error) {
      return NextResponse.redirect(`${origin}/app/dashboard`);
    }
  }

  return NextResponse.redirect(`${origin}/login?error=auth_failed`);
}
```

---

## Zustand Store — Subscription Tier

The user's subscription tier is read from Zustand (`useUserStore`) on the frontend, populated at app boot from the Supabase session.

```typescript
// store/userStore.ts
import { create } from 'zustand';

interface UserState {
  userId: string | null;
  email: string | null;
  subscriptionTier: 'free' | 'pro' | null;
  setUser: (user: { id: string; email: string }) => void;
  setTier: (tier: 'free' | 'pro') => void;
  reset: () => void;
}

export const useUserStore = create<UserState>((set) => ({
  userId: null,
  email: null,
  subscriptionTier: null,
  setUser: (user) => set({ userId: user.id, email: user.email }),
  setTier: (tier) => set({ subscriptionTier: tier }),
  reset: () => set({ userId: null, email: null, subscriptionTier: null }),
}));
```

### Hydrate on App Load

```typescript
// app/(dashboard)/layout.tsx
export default async function DashboardLayout({ children }) {
  const supabase = await getServerClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect('/login');

  const { data: profile } = await supabase
    .from('profiles')
    .select('subscription_tier')
    .eq('id', user.id)
    .single();

  return (
    <UserStoreHydrator userId={user.id} email={user.email ?? ''} tier={profile?.subscription_tier ?? 'free'}>
      {children}
    </UserStoreHydrator>
  );
}
```

---

## ProGate Component

The Pro Gate enforces tier-based access at the UI level. API routes enforce independently.

```typescript
// components/common/ProGate.tsx
'use client';
import { useUserStore } from '@/store/userStore';

interface ProGateProps {
  children: React.ReactNode;
  fallback?: React.ReactNode;
}

export function ProGate({ children, fallback }: ProGateProps) {
  const subscriptionTier = useUserStore((s) => s.subscriptionTier);

  if (subscriptionTier === 'pro') return <>{children}</>;

  return fallback ?? (
    <div className="p-6 text-center border rounded-lg border-dashed">
      <p className="text-sm text-muted-foreground mb-3">
        This feature requires a Pro subscription
      </p>
      <Button asChild>
        <Link href="/app/settings#billing">Upgrade to Pro</Link>
      </Button>
    </div>
  );
}

// Usage
<ProGate>
  <FunnelAnalyticsDashboard />
</ProGate>

<ProGate fallback={<BlurredPreview />}>
  <CVTestingPage />
</ProGate>
```

---

## Logout

```typescript
// Route Handler
// app/api/auth/logout/route.ts
import { getServerClient } from '@/lib/supabase/server';
import { NextResponse } from 'next/server';

export async function POST() {
  const supabase = await getServerClient();
  await supabase.auth.signOut();
  return NextResponse.redirect(new URL('/login', process.env.NEXT_PUBLIC_APP_URL));
}
```

---

## Related Files

- [backend-dev-guidelines.md](backend-dev-guidelines.md) — Core standards
- [routing-and-controllers.md](routing-and-controllers.md) — Route Handler auth patterns
- [architecture-overview.md](architecture-overview.md) — Where middleware fits in the request lifecycle
