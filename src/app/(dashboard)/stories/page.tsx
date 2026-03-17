import { Header } from '@/components/layout/header'
import { StoriesLibrary } from '@/components/stories/stories-library'

export default function StoriesPage() {
  return (
    <>
      <Header title="Story Library" />
      <StoriesLibrary />
    </>
  )
}
