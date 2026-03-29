'use client'

import Link from 'next/link'
import { Card, CardContent } from '@/components/ui/card'

interface UpgradeCTAProps {
  feature?: string
  description?: string
  href?: string
}

export function UpgradeCTA({
  feature = 'this feature',
  description = 'Upgrade to Pro to unlock the full experience.',
  href = '/settings/billing',
}: UpgradeCTAProps) {
  return (
    <Card className="max-w-sm w-full mx-4 shadow-xl border-[var(--jf-interactive-border)]">
      <CardContent className="pt-8 pb-8 text-center space-y-4">
        <div className="text-3xl" aria-hidden="true">🔒</div>
        <div>
          <h3 className="text-base font-semibold text-[var(--jf-text-primary)]">
            Upgrade to Pro to unlock {feature}
          </h3>
          <p className="text-sm text-[var(--jf-text-secondary)] mt-1">{description}</p>
        </div>
        <Link
          href={href}
          className="inline-flex items-center justify-center w-full sm:w-auto px-6 py-3 min-h-[44px] rounded-md bg-[var(--jf-interactive)] text-white text-sm font-medium hover:bg-[var(--jf-interactive-hover)] transition-colors"
        >
          Upgrade to Pro
        </Link>
      </CardContent>
    </Card>
  )
}
