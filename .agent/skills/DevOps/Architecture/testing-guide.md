---
name: testing-guide
description: >
  Testing strategies for JobFunnel OS — Vitest unit tests for service functions, React Testing Library
  for components, and Playwright for E2E. Use when writing tests, setting up test infrastructure, or
  deciding what to test. Trigger on: "write tests", "unit test", "integration test", "e2e test",
  "playwright", "vitest", "react testing library", "mock supabase", "test service function".
---

# Testing Guide — Vitest + React Testing Library + Playwright

Complete guide to testing in JobFunnel OS. **Do not use Jest.** The test stack is:

| Layer | Tool | Target |
|---|---|---|
| Unit | Vitest | Service functions, pure utilities |
| Component | Vitest + React Testing Library | React components |
| E2E | Playwright | Critical user paths |

---

## Setup

### vitest.config.ts

```typescript
// vitest.config.ts
import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';
import path from 'path';

export default defineConfig({
  plugins: [react()],
  test: {
    environment: 'jsdom',
    globals: true,
    setupFiles: ['./tests/setup.ts'],
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './'),
    },
  },
});
```

### tests/setup.ts

```typescript
// tests/setup.ts
import '@testing-library/jest-dom';
import { vi } from 'vitest';

// Mock Next.js navigation
vi.mock('next/navigation', () => ({
  useRouter: () => ({ push: vi.fn(), replace: vi.fn() }),
  usePathname: () => '/',
  redirect: vi.fn(),
}));

// Mock Next.js cookies
vi.mock('next/headers', () => ({
  cookies: () => ({
    getAll: () => [],
    set: vi.fn(),
  }),
}));
```

---

## Mocking Supabase

### Mock Pattern for Service Function Tests

```typescript
// tests/mocks/supabase.ts
import { vi } from 'vitest';

export function createMockSupabase(overrides: Record<string, any> = {}) {
  return {
    from: vi.fn().mockReturnThis(),
    select: vi.fn().mockReturnThis(),
    insert: vi.fn().mockReturnThis(),
    update: vi.fn().mockReturnThis(),
    delete: vi.fn().mockReturnThis(),
    eq: vi.fn().mockReturnThis(),
    neq: vi.fn().mockReturnThis(),
    not: vi.fn().mockReturnThis(),
    in: vi.fn().mockReturnThis(),
    order: vi.fn().mockReturnThis(),
    limit: vi.fn().mockReturnThis(),
    single: vi.fn().mockResolvedValue({ data: null, error: null }),
    range: vi.fn().mockReturnThis(),
    auth: {
      getUser: vi.fn().mockResolvedValue({ data: { user: null }, error: null }),
      signOut: vi.fn().mockResolvedValue({ error: null }),
    },
    ...overrides,
  } as any;
}
```

---

## Unit Tests — Service Functions

### Test Structure

```typescript
// tests/services/jobService.test.ts
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { createJobApplication, getJobById, transitionJobStage } from '@/lib/services/jobService';
import { FreeTierLimitError, NotFoundError, ProRequiredError } from '@/lib/utils/errors';
import { createMockSupabase } from '../mocks/supabase';

describe('jobService', () => {
  let mockSupabase: ReturnType<typeof createMockSupabase>;

  beforeEach(() => {
    mockSupabase = createMockSupabase();
    vi.clearAllMocks();
  });

  describe('createJobApplication', () => {
    it('should create application for pro user without limit check', async () => {
      // Arrange
      const userId = 'user-123';
      const data = {
        company_name: 'Spotify',
        job_title: 'Senior PM',
        stage: 'applied' as const,
        priority: 'high' as const,
      };

      // Mock: profile returns pro tier
      mockSupabase.single
        .mockResolvedValueOnce({ data: { subscription_tier: 'pro' }, error: null })
        // Mock: insert returns created job
        .mockResolvedValueOnce({ data: { id: 'job-1', ...data, user_id: userId }, error: null });

      // Act
      const job = await createJobApplication(mockSupabase, userId, data);

      // Assert
      expect(job).toBeDefined();
      expect(job.company_name).toBe('Spotify');
    });

    it('should throw FreeTierLimitError when free user hits 5 active applications', async () => {
      // Arrange
      const userId = 'free-user';

      // Mock: profile returns free tier
      mockSupabase.single
        .mockResolvedValueOnce({ data: { subscription_tier: 'free' }, error: null });

      // Mock: count returns 5 active applications
      mockSupabase.select = vi.fn().mockReturnThis();
      // Mock count query result
      vi.spyOn(mockSupabase, 'from').mockReturnValue({
        ...mockSupabase,
        count: 5,
        error: null,
      } as any);

      // Act & Assert
      await expect(
        createJobApplication(mockSupabase, userId, {
          company_name: 'Meta',
          job_title: 'PM',
          stage: 'applied',
          priority: 'medium',
        })
      ).rejects.toThrow(FreeTierLimitError);
    });
  });

  describe('getJobById', () => {
    it('should return job when found', async () => {
      const mockJob = { id: 'job-1', company_name: 'Stripe', stage: 'applied' };
      mockSupabase.single.mockResolvedValue({ data: mockJob, error: null });

      const job = await getJobById(mockSupabase, 'job-1');

      expect(job).toEqual(mockJob);
    });

    it('should throw NotFoundError when PGRST116', async () => {
      mockSupabase.single.mockResolvedValue({
        data: null,
        error: { code: 'PGRST116', message: 'Not found' },
      });

      await expect(getJobById(mockSupabase, 'nonexistent')).rejects.toThrow(NotFoundError);
    });
  });
});
```

### Analytics Service Tests

```typescript
// tests/services/analyticsService.test.ts
import { describe, it, expect, vi } from 'vitest';
import { getFunnelMetrics } from '@/lib/services/analyticsService';
import { ProRequiredError } from '@/lib/utils/errors';

describe('analyticsService', () => {
  describe('getFunnelMetrics', () => {
    it('should throw ProRequiredError for free users', async () => {
      const supabase = createMockSupabase();
      supabase.single.mockResolvedValueOnce({
        data: { subscription_tier: 'free' },
        error: null,
      });

      await expect(getFunnelMetrics(supabase, 'free-user')).rejects.toThrow(ProRequiredError);
    });

    it('should calculate conversion rates correctly', async () => {
      const supabase = createMockSupabase();

      // Mock pro user
      supabase.single.mockResolvedValueOnce({
        data: { subscription_tier: 'pro' },
        error: null,
      });

      // Mock job stages data
      supabase.from = vi.fn().mockReturnValue({
        ...supabase,
        data: [
          { stage: 'applied' },
          { stage: 'applied' },
          { stage: 'applied' },
          { stage: 'applied' },
          { stage: 'applied' },  // 5 applied
          { stage: 'screening' },
          { stage: 'screening' },  // 2 screening
          { stage: 'interviewing' },  // 1 interviewing
          { stage: 'rejected' },
          { stage: 'rejected' },
        ],
        error: null,
      } as any);

      const metrics = await getFunnelMetrics(supabase, 'pro-user');

      expect(metrics.applied).toBe(5);
      expect(metrics.screening).toBe(2);
      expect(metrics.appliedToScreeningRate).toBe(40); // 2/5 = 40%
    });
  });
});
```

---

## Component Tests — React Testing Library

```typescript
// tests/components/AddJobForm.test.tsx
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, it, expect, vi } from 'vitest';
import { AddJobForm } from '@/components/features/pipeline/AddJobForm';

// Wrap with required providers
const Wrapper = ({ children }: { children: React.ReactNode }) => (
  <QueryClientProvider client={new QueryClient()}>
    {children}
  </QueryClientProvider>
);

describe('AddJobForm', () => {
  it('should render required fields', () => {
    render(<AddJobForm onSuccess={vi.fn()} />, { wrapper: Wrapper });

    expect(screen.getByLabelText(/company/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/job title/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /add application/i })).toBeInTheDocument();
  });

  it('should show validation errors on empty submit', async () => {
    const user = userEvent.setup();
    render(<AddJobForm onSuccess={vi.fn()} />, { wrapper: Wrapper });

    await user.click(screen.getByRole('button', { name: /add application/i }));

    await waitFor(() => {
      expect(screen.getByText(/company name is required/i)).toBeInTheDocument();
    });
  });

  it('should call onSuccess with valid data', async () => {
    const onSuccess = vi.fn();
    const user = userEvent.setup();

    render(<AddJobForm onSuccess={onSuccess} />, { wrapper: Wrapper });

    await user.type(screen.getByLabelText(/company/i), 'Spotify');
    await user.type(screen.getByLabelText(/job title/i), 'Senior PM');
    await user.click(screen.getByRole('button', { name: /add application/i }));

    await waitFor(() => {
      expect(onSuccess).toHaveBeenCalledWith(
        expect.objectContaining({ company_name: 'Spotify', job_title: 'Senior PM' })
      );
    });
  });
});
```

### Testing ProGate Component

```typescript
// tests/components/ProGate.test.tsx
import { render, screen } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { ProGate } from '@/components/common/ProGate';
import { useUserStore } from '@/store/userStore';

vi.mock('@/store/userStore');

describe('ProGate', () => {
  it('should render children for pro users', () => {
    vi.mocked(useUserStore).mockReturnValue({ subscriptionTier: 'pro' } as any);

    render(<ProGate><div>Pro Content</div></ProGate>);

    expect(screen.getByText('Pro Content')).toBeInTheDocument();
  });

  it('should render upgrade CTA for free users', () => {
    vi.mocked(useUserStore).mockReturnValue({ subscriptionTier: 'free' } as any);

    render(<ProGate><div>Pro Content</div></ProGate>);

    expect(screen.queryByText('Pro Content')).not.toBeInTheDocument();
    expect(screen.getByText(/upgrade to pro/i)).toBeInTheDocument();
  });
});
```

---

## E2E Tests — Playwright

```typescript
// tests/e2e/pipeline.spec.ts
import { test, expect } from '@playwright/test';

test.describe('Pipeline', () => {
  test.beforeEach(async ({ page }) => {
    // Authenticate before each test
    await page.goto('/login');
    await page.getByLabel('Email').fill('test@example.com');
    await page.getByRole('button', { name: 'Send magic link' }).click();
    // In E2E tests, use a test account with seeded session
  });

  test('should add a job application', async ({ page }) => {
    await page.goto('/app/pipeline');

    // Open add job dialog
    await page.getByRole('button', { name: /add application/i }).click();

    // Fill form
    await page.getByLabel(/company/i).fill('Spotify');
    await page.getByLabel(/job title/i).fill('Senior PM');

    // Submit
    await page.getByRole('button', { name: /save/i }).click();

    // Verify it appears on the board
    await expect(page.getByText('Spotify')).toBeVisible();
    await expect(page.getByText('Senior PM')).toBeVisible();
  });

  test('should drag application to new stage', async ({ page }) => {
    await page.goto('/app/pipeline');

    const card = page.locator('[data-testid="application-card"]').first();
    const targetColumn = page.locator('[data-stage="screening"]');

    await card.dragTo(targetColumn);

    await expect(targetColumn.locator('[data-testid="application-card"]')).toBeVisible();
  });
});
```

### playwright.config.ts

```typescript
// playwright.config.ts
import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  testDir: './tests/e2e',
  fullyParallel: true,
  reporter: 'html',
  use: {
    baseURL: 'http://localhost:3000',
    trace: 'on-first-retry',
  },
  projects: [
    { name: 'chromium', use: { ...devices['Desktop Chrome'] } },
    { name: 'Mobile Safari', use: { ...devices['iPhone 14'] } },  // Mobile is mandatory
  ],
  webServer: {
    command: 'npm run dev',
    url: 'http://localhost:3000',
    reuseExistingServer: !process.env.CI,
  },
});
```

---

## Coverage Targets

| Layer | Target |
|---|---|
| Service functions | 80%+ line coverage |
| Utility functions | 90%+ |
| Component tests | Critical paths (forms, pro gating) |
| E2E | All happy paths + free tier limits |

### Run Tests

```bash
# Unit + component tests
npx vitest

# With coverage
npx vitest --coverage

# E2E
npx playwright test

# E2E UI mode
npx playwright test --ui
```

---

## What to Test

### Must Test (Unit)
- Service functions with business rules
- Free tier limit enforcement
- Stage transition logic
- Analytics rate calculations
- Pro gate service checks

### Must Test (E2E)
- Add / edit / delete job application
- Stage drag-and-drop
- Free tier upgrade prompt triggered
- Story create / edit
- Magic link auth flow
- Mobile viewport for all key flows (390px)

### Skip (Low Value)
- Thin Route Handlers (covered by E2E)
- Trivial CRUD with no business rules
- Auto-generated Supabase type code

---

## Related Files

- [backend-dev-guidelines.md](backend-dev-guidelines.md) — Testing discipline requirements
- [services-and-repositories.md](services-and-repositories.md) — Service functions to test
- [complete-examples.md](complete-examples.md) — Full examples with test patterns
