import { TemplateGallery } from '@/components/cv-versions/TemplateGallery'
import { Header } from '@/components/layout/header'

export default function NewResumePage() {
  return (
    <>
      <Header title="New Resume" backHref="/cv-versions" />
      <main className="flex-1 p-6 overflow-auto">
        <div className="max-w-5xl mx-auto">
          <TemplateGallery />
        </div>
      </main>
    </>
  )
}
