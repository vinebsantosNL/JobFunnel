import { Document, Page } from '@react-pdf/renderer'
import type { ResumeData } from '@/types/resume'
import { base, PAGE } from '../PdfStyles'
import {
  ContactHeader,
  SummarySection,
  ExperienceSection,
  EducationSection,
  SkillsSection,
  LanguagesSection,
} from '../PdfSections'

interface Props { data: ResumeData }

// Precision — clean single-column, highest ATS compatibility
export function PrecisionPdf({ data }: Props) {
  return (
    <Document>
      <Page size="A4" style={base.page}>
        <ContactHeader data={data} />
        <SummarySection summary={data.summary} />
        <ExperienceSection experience={data.experience} />
        <SkillsSection skills={data.skills} />
        <EducationSection education={data.education} />
        <LanguagesSection languages={data.languages} />
      </Page>
    </Document>
  )
}
