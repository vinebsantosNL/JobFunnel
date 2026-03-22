import { Document, Page, View, Text, StyleSheet } from '@react-pdf/renderer'
import type { ResumeData } from '@/types/resume'
import { base, COLORS } from '../PdfStyles'
import {
  ContactHeader,
  SummarySection,
  SkillsSection,
  LanguagesSection,
} from '../PdfSections'

interface Props { data: ResumeData }

const s = StyleSheet.create({
  accentLine: {
    height: 3,
    backgroundColor: COLORS.black,
    marginTop: 6,
    marginBottom: 12,
    width: 36,
  },
  expBlock: {
    marginBottom: 10,
    paddingLeft: 10,
    borderLeftWidth: 2,
    borderLeftColor: COLORS.border,
    borderLeftStyle: 'solid',
  },
  expBlockActive: {
    marginBottom: 10,
    paddingLeft: 10,
    borderLeftWidth: 2,
    borderLeftColor: COLORS.black,
    borderLeftStyle: 'solid',
  },
  company: {
    fontSize: 9,
    fontFamily: 'Helvetica-Bold',
    color: COLORS.black,
  },
  roleDate: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 2,
  },
  role: {
    fontSize: 8.5,
    color: COLORS.midGray,
    fontFamily: 'Helvetica-Oblique',
  },
  date: {
    fontSize: 8,
    color: COLORS.lightGray,
  },
  impact: {
    fontSize: 8.5,
    fontFamily: 'Helvetica-Bold',
    color: COLORS.darkGray,
    marginBottom: 1,
  },
})

// Senior IC — achievement-focused, left accent border on experience entries
export function SeniorIcPdf({ data }: Props) {
  // Separate current vs past roles for visual treatment
  const currentRoles = data.experience.filter(
    (e) => e.endDate?.toLowerCase() === 'present'
  )
  const pastRoles = data.experience.filter(
    (e) => e.endDate?.toLowerCase() !== 'present'
  )

  return (
    <Document>
      <Page size="A4" style={base.page}>
        <ContactHeader data={data} />
        <View style={s.accentLine} />

        <SummarySection summary={data.summary} />

        {data.experience.length > 0 && (
          <View>
            <Text style={base.sectionHeading}>Work Experience</Text>
            {data.experience.map((exp) => {
              const isCurrent = exp.endDate?.toLowerCase() === 'present'
              return (
                <View key={exp.id} style={isCurrent ? s.expBlockActive : s.expBlock}>
                  <Text style={s.company}>{exp.company || 'Company'}</Text>
                  <View style={s.roleDate}>
                    <Text style={s.role}>{exp.title || 'Role'}</Text>
                    <Text style={s.date}>
                      {exp.startDate}{exp.endDate ? ` – ${exp.endDate}` : ''}
                    </Text>
                  </View>
                  {exp.location ? (
                    <Text style={base.entrySubtitle}>{exp.location}</Text>
                  ) : null}
                  {exp.bullets.filter((b) => b.text.trim()).map((b, bi) => (
                    <View key={b.id} style={base.bullet}>
                      {bi === 0 ? (
                        <Text style={base.bulletDot}>▸</Text>
                      ) : (
                        <Text style={base.bulletDot}>•</Text>
                      )}
                      <Text style={bi === 0 ? s.impact : base.bulletText}>{b.text}</Text>
                    </View>
                  ))}
                </View>
              )
            })}
          </View>
        )}

        <SkillsSection skills={data.skills} />

        {data.education.length > 0 && (
          <View>
            <Text style={base.sectionHeading}>Education</Text>
            {data.education.map((edu) => (
              <View key={edu.id} style={base.entryBlock}>
                <View style={base.entryHeader}>
                  <Text style={base.entryTitle}>{edu.degree || 'Degree'}</Text>
                  <Text style={base.entryMeta}>
                    {edu.startDate}{edu.endDate ? ` – ${edu.endDate}` : ''}
                  </Text>
                </View>
                <Text style={base.entrySubtitle}>
                  {edu.institution}{edu.field ? ` · ${edu.field}` : ''}
                </Text>
              </View>
            ))}
          </View>
        )}

        <LanguagesSection languages={data.languages} />
      </Page>
    </Document>
  )
}
