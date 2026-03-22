import { notFound } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { getCVVersion } from '@/lib/services/cvVersionService'
import { ResumeEditorClient } from '@/components/cv-versions/ResumeEditorClient'

interface Props {
  params: Promise<{ id: string }>
}

export default async function EditResumePage({ params }: Props) {
  const { id } = await params
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) notFound()

  let version
  try {
    version = await getCVVersion(supabase, id, user.id)
  } catch {
    notFound()
  }

  return <ResumeEditorClient version={version} />
}
