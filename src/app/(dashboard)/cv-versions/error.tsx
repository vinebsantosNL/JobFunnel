'use client'

import { useEffect } from 'react'
import { Button } from '@/components/ui/button'

export default function CVVersionsError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    console.error(error)
  }, [error])

  return (
    <div className="flex-1 flex items-center justify-center p-6">
      <div className="text-center">
        <h2 className="text-xl font-semibold text-gray-900 mb-2">Failed to load CV Versions</h2>
        <p className="text-sm text-gray-500 mb-4">Something went wrong. Please try again.</p>
        <Button onClick={reset}>Try again</Button>
      </div>
    </div>
  )
}
