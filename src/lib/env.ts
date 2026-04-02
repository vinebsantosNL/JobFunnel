import { z } from 'zod'

const envSchema = z.object({
  NEXT_PUBLIC_SUPABASE_URL: z.string().min(1),
  NEXT_PUBLIC_SUPABASE_ANON_KEY: z.string().min(1),
  NEXT_PUBLIC_APP_URL: z.string().min(1),
})

// Server-only env vars — validated at runtime, never imported in client components
const serverEnvSchema = z.object({
  ANTHROPIC_API_KEY: z.string().min(1),
})

// Lazy — avoids throwing at module instantiation time during Next.js build
// (page-data collection runs before env vars are fully bound).
let _env: z.infer<typeof envSchema> | null = null

export function getEnv(): z.infer<typeof envSchema> {
  if (!_env) {
    _env = envSchema.parse({
      NEXT_PUBLIC_SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL,
      NEXT_PUBLIC_SUPABASE_ANON_KEY: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
      NEXT_PUBLIC_APP_URL: process.env.NEXT_PUBLIC_APP_URL,
    })
  }
  return _env
}

export function getServerEnv() {
  return serverEnvSchema.parse({
    ANTHROPIC_API_KEY: process.env.ANTHROPIC_API_KEY,
  })
}
