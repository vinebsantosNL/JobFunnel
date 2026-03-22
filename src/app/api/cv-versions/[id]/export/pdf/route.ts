import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'
import { renderToBuffer } from '@react-pdf/renderer'
import { getCVVersion } from '@/lib/services/cvVersionService'
import { handleApiError } from '@/lib/utils/errors'
import { ResumePdfDocument } from '@/components/cv-versions/pdf/ResumePdfDocument'
import type { ResumeData } from '@/types/resume'
import type { TemplateId } from '@/types/database.types'
import { EMPTY_RESUME_DATA } from '@/types/resume'
import React from 'react'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

export async function POST(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const supabase = await createClient()
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (!user || authError) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const version = await getCVVersion(supabase, id, user.id)
    const parsed = version.resume_data as Partial<ResumeData>
    const resumeData: ResumeData = {
      ...EMPTY_RESUME_DATA,
      ...parsed,
      contact: { ...EMPTY_RESUME_DATA.contact, ...(parsed.contact ?? {}) },
    }

    const element = React.createElement(ResumePdfDocument, {
      data: resumeData,
      templateId: version.template_id as TemplateId,
    }) as React.ReactElement<Parameters<typeof renderToBuffer>[0] extends React.ReactElement<infer P> ? P : never>

    const buffer = await renderToBuffer(element as Parameters<typeof renderToBuffer>[0])

    const filename = `${version.name.replace(/[^a-z0-9\-_]/gi, '_')}.pdf`

    return new NextResponse(new Uint8Array(buffer), {
      status: 200,
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename="${filename}"`,
        'Content-Length': buffer.length.toString(),
      },
    })
  } catch (error) {
    return handleApiError(error)
  }
}
