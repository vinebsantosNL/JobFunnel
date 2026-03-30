'use client'

import Link from 'next/link'
import { Card, CardContent } from '@/components/ui/card'

type ProFeatureKey = 'analytics' | 'cv-testing' | 'interview-vault' | 'default'

const FEATURE_COPY: Record<ProFeatureKey, { headline: string; body: string }> = {
  analytics: {
    headline: 'See exactly where your search breaks down',
    body: 'Your Applied-to-Screening rate, time-in-stage analysis, and EU benchmarks — so you know what to fix, not just what happened.',
  },
  'cv-testing': {
    headline: 'Find out which CV actually gets responses',
    body: 'Tag applications with a CV version and track outcomes. The only job search tool that lets you run a real experiment on your own search.',
  },
  'interview-vault': {
    headline: 'Build a story bank that compounds',
    body: 'Write once in STAR format, reuse forever. Every story tagged by competency — ready before any interview.',
  },
  default: {
    headline: 'Upgrade to Pro to unlock this feature',
    body: 'Get unlimited applications, full funnel analytics, Interview Vault, and CV A/B testing — €15/month.',
  },
}

interface UpgradeCTAProps {
  featureKey?: ProFeatureKey
  /** Override headline */
  feature?: string
  /** Override body copy */
  description?: string
  href?: string
}

export function UpgradeCTA({
  featureKey = 'default',
  feature,
  description,
  href = '/settings/billing',
}: UpgradeCTAProps) {
  const copy = FEATURE_COPY[featureKey]
  const headline = feature ?? copy.headline
  const body = description ?? copy.body

  return (
    <Card className="max-w-sm w-full mx-4 shadow-xl border-[var(--jf-interactive-border)]">
      <CardContent className="pt-8 pb-8 text-center space-y-4">
        <div className="text-3xl" aria-hidden="true">🔒</div>
        <div>
          <h3 className="text-base font-semibold text-[var(--jf-text-primary)]">
            {headline}
          </h3>
          <p className="text-sm text-[var(--jf-text-secondary)] mt-1">{body}</p>
        </div>
        <Link
          href={href}
          className="inline-flex items-center justify-center w-full sm:w-auto px-6 py-3 min-h-[44px] rounded-md bg-[var(--jf-interactive)] text-white text-sm font-medium hover:bg-[var(--jf-interactive-hover)] transition-colors"
        >
          Upgrade to Pro — €15/month
        </Link>
      </CardContent>
    </Card>
  )
}
