import { Header } from '@/components/layout/header'
import { StoriesPageClient } from '@/components/stories/StoriesPageClient'

export default function StoriesPage() {
  return (
    <>
      <Header title="Interview Vault" />
      <StoriesPageClient />
    </>
  )
}
