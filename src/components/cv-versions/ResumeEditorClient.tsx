'use client'

import { ResumeEditor } from './ResumeEditor'
import type { CVVersion } from '@/types/database.types'

interface Props {
  version: CVVersion
}

// Thin client wrapper so the Server Component page can pass the fetched
// CVVersion down to the interactive editor without marking the page 'use client'.
export function ResumeEditorClient({ version }: Props) {
  return (
    // Full viewport height minus the dashboard top nav (64px) and mobile bottom nav (64px)
    <div className="flex flex-col h-[calc(100vh-64px)] md:h-[calc(100vh-64px)]">
      <ResumeEditor version={version} />
    </div>
  )
}
