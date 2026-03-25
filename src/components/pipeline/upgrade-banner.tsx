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
      className="flex items-center justify-between gap-4"
      style={{
        padding: '10px 16px',
        borderRadius: 12,
        fontSize: 13,
        ...(isBlocked
          ? {
              background: 'rgba(239,68,68,0.08)',
              border: '1px solid rgba(239,68,68,0.25)',
              color: 'var(--jf-error)',
            }
          : {
              background: 'rgba(245,158,11,0.08)',
              border: '1px solid rgba(245,158,11,0.25)',
              color: 'var(--jf-warning)',
            }),
      }}
    >
      <div className="flex items-center gap-2">
        <span aria-hidden="true" className="text-base">{isBlocked ? '\uD83D\uDD12' : '\u26A0\uFE0F'}</span>
        <span>
          {isBlocked
            ? `You've reached the free tier limit of ${limit} active applications.`
            : `${remaining} active application slot${remaining !== 1 ? 's' : ''} remaining on the free tier.`}
        </span>
      </div>
      <a
        href="/settings"
        className="shrink-0 inline-flex items-center justify-center transition-colors text-white"
        style={{
          padding: '5px 14px',
          borderRadius: 8,
          fontSize: 12,
          fontWeight: 600,
          background: isBlocked ? 'var(--jf-error)' : 'var(--jf-warning)',
        }}
      >
        Upgrade to Pro
      </a>
    </div>
  )
}
