'use client'

import { Badge } from '@/components/ui/badge'

interface LowConfidenceBadgeProps {
  count: number
}

export function LowConfidenceBadge({ count }: LowConfidenceBadgeProps) {
  if (count >= 10) return null

  return (
    <Badge
      variant="outline"
      className="text-xs text-amber-600 border-amber-300 bg-amber-50"
    >
      ⚠ Low data
    </Badge>
  )
}
