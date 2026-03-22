import { Document, Page, View, Text, StyleSheet } from '@react-pdf/renderer'
import type { ResumeData } from '@/types/resume'
import { base, COLORS, PAGE } from '../PdfStyles'
import {
  SectionHeading,
  SummarySection,
  ExperienceSection,
  EducationSection,
  LanguagesSection,
} from '../PdfSections'

interface Props { data: ResumeData }

const s = StyleSheet.create({
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
    marginBottom: 6,
    paddingBottom: 6,
    borderBottomWidth: 1.5,
    borderBottomColor: COLORS.black,
    borderBottomStyle: 'solid',
  },
  nameBlock: { flex: 1 },
  contactBlock: {
    alignItems: 'flex-end',
    gap: 2,
  },
  contactItem: {
    fontSize: 7.5,
    color: COLORS.midGray,
  },
  skillsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 3,
    marginTop: 2,
  },
  skillPill: {
    fontSize: 7.5,
    color: COLORS.darkGray,
    borderWidth: 0.5,
    borderColor: COLORS.border,
    borderStyle: 'solid',
    paddingVertical: 1.5,
    paddingHorizontal: 5,
    borderRadius: 2,
  },
})

// Compact EU — dense single-column, contact flush right, skills as bordered pills
export function CompactEuPdf({ data }: Props) {
  const { contact } = data
  const name = [contact.firstName, contact.lastName].filter(Boolean).join(' ') || 'Your Name'
  const contactItems = [
    contact.email,
    contact.phone,
    contact.location,
    contact.linkedin,
  ].filter(Boolean)

  const filteredSkills = data.skills.filter(Boolean)

  return (
    <Document>
      <Page size="A4" style={base.page}>
        {/* Header: name left, contact right */}
        <View style={s.header}>
          <View style={s.nameBlock}>
            <Text style={base.name}>{name}</Text>
            {contact.targetTitle ? <Text style={base.targetTitle}>{contact.targetTitle}</Text> : null}
          </View>
          <View style={s.contactBlock}>
            {contactItems.map((item, i) => (
              <Text key={i} style={s.contactItem}>{item}</Text>
            ))}
          </View>
        </View>

        <SummarySection summary={data.summary} />
        <ExperienceSection experience={data.experience} />

        {filteredSkills.length > 0 && (
          <View>
            <SectionHeading label="Skills" />
            <View style={s.skillsRow}>
              {filteredSkills.map((skill, i) => (
                <Text key={i} style={s.skillPill}>{skill}</Text>
              ))}
            </View>
          </View>
        )}

        <EducationSection education={data.education} />
        <LanguagesSection languages={data.languages} />
      </Page>
    </Document>
  )
}
