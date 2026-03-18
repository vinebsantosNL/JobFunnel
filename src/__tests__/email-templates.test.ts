import { describe, it, expect } from 'vitest'
import { welcomeEmail, weeklySummaryEmail, staleApplicationEmail } from '@/lib/email/templates'

describe('welcomeEmail', () => {
  it('includes the user name in the output', () => {
    const { subject, html } = welcomeEmail('Alice')
    expect(subject).toBe('Welcome to JobFunnel OS')
    expect(html).toContain('Alice')
  })

  it('handles missing name gracefully', () => {
    const { html } = welcomeEmail('')
    expect(html).toContain('there')
  })
})

describe('weeklySummaryEmail', () => {
  it('returns correct subject', () => {
    const { subject } = weeklySummaryEmail('Bob', {
      applied: 3,
      transitions: 2,
      stale: 1,
      snapshot: { applied: 3, screening: 1 },
    })
    expect(subject).toBe('Your Weekly Job Search Summary')
  })

  it('includes stats in html', () => {
    const { html } = weeklySummaryEmail('Bob', {
      applied: 5,
      transitions: 3,
      stale: 2,
      snapshot: { applied: 5 },
    })
    expect(html).toContain('5')
    expect(html).toContain('Bob')
  })
})

describe('staleApplicationEmail', () => {
  it('handles singular application', () => {
    const { subject } = staleApplicationEmail('Eve', [
      { company_name: 'Stripe', job_title: 'Engineer', stage: 'applied', days: 20 },
    ])
    expect(subject).toContain('needs')
  })

  it('handles plural applications', () => {
    const { subject } = staleApplicationEmail('Eve', [
      { company_name: 'Stripe', job_title: 'Engineer', stage: 'applied', days: 20 },
      { company_name: 'Vercel', job_title: 'PM', stage: 'screening', days: 15 },
    ])
    expect(subject).toContain('need')
  })

  it('includes company names in html', () => {
    const { html } = staleApplicationEmail('Eve', [
      { company_name: 'Stripe', job_title: 'Engineer', stage: 'applied', days: 20 },
    ])
    expect(html).toContain('Stripe')
    expect(html).toContain('20')
  })
})
