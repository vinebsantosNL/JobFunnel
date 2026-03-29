import { Header } from '@/components/layout/header'
import { CVVersionList } from '@/components/cv-versions/CVVersionList'
import { NewCVVersionButton } from '@/components/cv-versions/NewCVVersionButton'

export default function CVVersionsPage() {
  return (
    <>
      <Header
        title="My CVs"
        actions={<NewCVVersionButton />}
      />
      <main className="flex-1 p-6 overflow-auto">
        <CVVersionList />
      </main>
    </>
  )
}
