'use client'

import { PDFViewer } from '@react-pdf/renderer'
import type { ResumeData } from '@/types/resume'
import type { TemplateId } from '@/types/database.types'
import { ResumePdfDocument } from './ResumePdfDocument'

interface Props {
  data: ResumeData
  templateId: TemplateId
}

// PDFViewer must only render client-side — parent must dynamic import with ssr:false
export function ResumePreview({ data, templateId }: Props) {
  return (
    <PDFViewer
      width="100%"
      height="100%"
      showToolbar={false}
      style={{ border: 'none' }}
    >
      <ResumePdfDocument data={data} templateId={templateId} />
    </PDFViewer>
  )
}
