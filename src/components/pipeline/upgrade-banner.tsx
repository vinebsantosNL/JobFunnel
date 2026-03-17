'use client'

interface UpgradeBannerProps {
  activeCount: number
  limit: number
}

export function UpgradeBanner({ activeCount, limit }: UpgradeBannerProps) {
  if (activeCount < limit - 1) return null

  const isBlocked = activeCount >= limit
  const remaining = limit - activeCount

  return (
    <div
      className={`flex items-center justify-between gap-4 px-4 py-3 rounded-lg border text-sm ${
        isBlocked
          ? 'bg-red-50 border-red-200 text-red-800'
          : 'bg-amber-50 border-amber-200 text-amber-800'
      }`}
    >
      <div className="flex items-center gap-2">
        <span className="text-base">{isBlocked ? '🔒' : '⚠️'}</span>
        <span>
          {isBlocked
            ? `You've reached the free tier limit of ${limit} active applications.`
            : `${remaining} active application slot${remaining !== 1 ? 's' : ''} remaining on the free tier.`}
        </span>
      </div>
      <a
        href="/app/settings"
        className={`shrink-0 inline-flex items-center justify-center rounded-lg px-3 py-1.5 text-xs font-semibold transition-colors ${
          isBlocked
            ? 'bg-red-600 text-white hover:bg-red-700'
            : 'bg-amber-500 text-white hover:bg-amber-600'
        }`}
      >
        Upgrade to Pro
      </a>
    </div>
  )
}
