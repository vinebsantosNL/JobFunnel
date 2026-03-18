import { describe, it, expect } from 'vitest'

// Test the free tier limit logic inline (mirrors what the API enforces)
describe('Free tier limit', () => {
  const FREE_LIMIT = 5

  function isAtLimit(activeCount: number, tier: 'free' | 'pro'): boolean {
    return tier === 'free' && activeCount >= FREE_LIMIT
  }

  it('blocks free user at 5 active apps', () => {
    expect(isAtLimit(5, 'free')).toBe(true)
  })

  it('allows free user with 4 active apps', () => {
    expect(isAtLimit(4, 'free')).toBe(false)
  })

  it('never blocks pro user', () => {
    expect(isAtLimit(100, 'pro')).toBe(false)
  })
})

// Test stage transition logic
describe('Stage transitions', () => {
  const ACTIVE_STAGES = ['applied', 'screening', 'interviewing']
  const TERMINAL_STAGES = ['rejected', 'withdrawn', 'offer']

  function isActive(stage: string): boolean {
    return ACTIVE_STAGES.includes(stage)
  }

  it('marks active stages correctly', () => {
    expect(isActive('applied')).toBe(true)
    expect(isActive('screening')).toBe(true)
    expect(isActive('interviewing')).toBe(true)
  })

  it('marks terminal stages as inactive', () => {
    for (const stage of TERMINAL_STAGES) {
      expect(isActive(stage)).toBe(false)
    }
  })
})
