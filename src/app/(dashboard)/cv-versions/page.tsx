import { Header } from '@/components/layout/header'
import { CVVersionList } from '@/components/cv-versions/CVVersionList'

export default function CVVersionsPage() {
  return (
    <>
      <Header title="CV Versions" />
      <main className="flex-1 p-6 overflow-auto">
        <div>
          <CVVersionList />
        </div>
      </main>
    </>
  )
}
