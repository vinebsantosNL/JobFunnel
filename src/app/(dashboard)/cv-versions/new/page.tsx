import { Suspense } from 'react'
import { TemplateGallery } from '@/components/cv-versions/TemplateGallery'
import { ImportContextBanner } from '@/components/cv-versions/ImportContextBanner'
import { Header } from '@/components/layout/header'

export default function NewResumePage() {
  return (
    <>
      <Header title="New Resume" backHref="/cv-versions" />
      <main className="flex-1 p-6 overflow-auto">
        <div className="max-w-5xl mx-auto flex flex-col gap-4">
          <Suspense>
            <ImportContextBanner />
          </Suspense>
          <Suspense>
            <TemplateGallery />
          </Suspense>
        </div>
      </main>
    </>
  )
}
