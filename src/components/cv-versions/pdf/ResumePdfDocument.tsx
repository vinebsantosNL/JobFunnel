import type { ResumeData } from '@/types/resume'
import type { TemplateId } from '@/types/database.types'
import { PrecisionPdf } from './templates/PrecisionPdf'
import { CompactEuPdf } from './templates/CompactEuPdf'
import { EuropassPdf } from './templates/EuropassPdf'
import { SeniorIcPdf } from './templates/SeniorIcPdf'
import { ModernTechPdf } from './templates/ModernTechPdf'

interface Props {
  data: ResumeData
  templateId: TemplateId
}

export function ResumePdfDocument({ data, templateId }: Props) {
  switch (templateId) {
    case 'compact_eu':   return <CompactEuPdf data={data} />
    case 'europass':     return <EuropassPdf data={data} />
    case 'senior_ic':    return <SeniorIcPdf data={data} />
    case 'modern_tech':  return <ModernTechPdf data={data} />
    case 'precision':
    default:             return <PrecisionPdf data={data} />
  }
}
