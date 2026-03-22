'use client'

import { useUserStore } from '@/store/userStore'
import { UpgradeCTA } from '@/components/common/UpgradeCTA'

interface ProGateProps {
  children: React.ReactNode
  // Optional: override the blurred content shown behind the CTA.
  // Defaults to rendering children at reduced opacity.
  preview?: React.ReactNode
  feature?: string
  description?: string
}

export function ProGate({ children, preview, feature, description }: ProGateProps) {
  const profile = useUserStore((state) => state.profile)

  // While profile is not yet loaded, show blurred preview to prevent
  // a flash of unlocked content for free-tier users.
  const tier = profile?.subscription_tier ?? 'free'

  if (tier === 'pro') {
    return <>{children}</>
  }

  return (
    <div className="relative">
      {/* Blurred preview — pointer-events disabled so it is not interactive */}
      <div
        className="pointer-events-none select-none blur-sm opacity-60 overflow-hidden"
        aria-hidden="true"
      >
        {preview ?? children}
      </div>

      {/* Upgrade overlay */}
      <div className="absolute inset-0 backdrop-blur-sm bg-white/50 z-10 flex items-center justify-center px-4">
        <UpgradeCTA feature={feature} description={description} />
      </div>
    </div>
  )
}
