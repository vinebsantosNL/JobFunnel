import Link from 'next/link'

interface UpgradeBannerProps {
  isPro: boolean
}

export function UpgradeBanner({ isPro }: UpgradeBannerProps) {
  if (isPro) return null

  return (
    <div className="w-full bg-blue-950 text-white px-6 h-12 flex items-center justify-between gap-4 flex-shrink-0">
      <div className="flex items-center gap-6 text-sm font-medium">
        <span className="flex items-center gap-1.5">
          <span className="text-blue-300">✦</span> Unlimited AI
        </span>
        <span className="flex items-center gap-1.5">
          <span className="text-blue-300">✦</span> Unlimited A/B Testing
        </span>
        <span className="flex items-center gap-1.5">
          <span className="text-blue-300">✦</span> Unlimited Analytics
        </span>
      </div>
      <Link
        href="/settings/billing"
        className="flex-shrink-0 bg-blue-500 hover:bg-blue-400 text-white text-sm font-semibold px-4 py-1.5 rounded-md transition-colors"
      >
        Upgrade to Pro →
      </Link>
    </div>
  )
}
