import { Document, Page, View, Text, StyleSheet } from '@react-pdf/renderer'
import type { ResumeData } from '@/types/resume'
import { base, COLORS } from '../PdfStyles'
import {
  SummarySection,
  ExperienceSection,
  EducationSection,
  SkillsSection,
  LanguagesSection,
} from '../PdfSections'

interface Props { data: ResumeData }

const s = StyleSheet.create({
  headerBand: {
    backgroundColor: COLORS.blue,
    marginLeft: -44,
    marginRight: -44,
    marginTop: -36,
    paddingTop: 24,
    paddingBottom: 20,
    paddingLeft: 44,
    paddingRight: 44,
    marginBottom: 14,
  },
  name: {
    fontSize: 20,
    fontFamily: 'Helvetica-Bold',
    color: COLORS.white,
    letterSpacing: 0.5,
  },
  targetTitle: {
    fontSize: 10,
    color: '#BFDBFE',
    marginTop: 3,
  },
  contactRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 14,
    marginTop: 6,
  },
  contactItem: {
    fontSize: 8,
    color: '#DBEAFE',
  },
  sectionHeading: {
    fontSize: 9,
    fontFamily: 'Helvetica-Bold',
    color: COLORS.blue,
    textTransform: 'uppercase',
    letterSpacing: 0.8,
    marginTop: 12,
    marginBottom: 4,
    paddingBottom: 2,
    borderBottomWidth: 0.75,
    borderBottomColor: COLORS.blueMid,
    borderBottomStyle: 'solid',
  },
})

// Europass — blue header band, blue section accents, EU institutional format
export function EuropassPdf({ data }: Props) {
  const { contact } = data
  const name = [contact.firstName, contact.lastName].filter(Boolean).join(' ') || 'Your Name'
  const contactItems = [
    contact.email,
    contact.phone,
    contact.location,
    contact.linkedin,
    contact.website,
  ].filter(Boolean)

  // Override section heading to blue
  const BlueSectionHeading = ({ label }: { label: string }) => (
    <Text style={s.sectionHeading}>{label}</Text>
  )

  return (
    <Document>
      <Page size="A4" style={base.page}>
        {/* Blue header band */}
        <View style={s.headerBand}>
          <Text style={s.name}>{name}</Text>
          {contact.targetTitle ? <Text style={s.targetTitle}>{contact.targetTitle}</Text> : null}
          {contactItems.length > 0 && (
            <View style={s.contactRow}>
              {contactItems.map((item, i) => (
                <Text key={i} style={s.contactItem}>{item}</Text>
              ))}
            </View>
          )}
        </View>

        {data.summary?.trim() && (
          <View>
            <BlueSectionHeading label="Professional Summary" />
            <Text style={base.summary}>{data.summary}</Text>
          </View>
        )}

        {data.experience.length > 0 && (
          <View>
            <BlueSectionHeading label="Work Experience" />
            {data.experience.map((exp) => (
              <View key={exp.id} style={base.entryBlock}>
                <View style={base.entryHeader}>
                  <Text style={base.entryTitle}>{exp.title || 'Role'}</Text>
                  <Text style={base.entryMeta}>
                    {exp.startDate}{exp.endDate ? ` – ${exp.endDate}` : ''}
                  </Text>
                </View>
                <Text style={base.entrySubtitle}>
                  {exp.company}{exp.location ? ` · ${exp.location}` : ''}
                </Text>
                {exp.bullets.filter((b) => b.text.trim()).map((b) => (
                  <View key={b.id} style={base.bullet}>
                    <Text style={base.bulletDot}>•</Text>
                    <Text style={base.bulletText}>{b.text}</Text>
                  </View>
                ))}
              </View>
            ))}
          </View>
        )}

        {data.skills.filter(Boolean).length > 0 && (
          <View>
            <BlueSectionHeading label="Skills" />
            <View style={base.skillsWrap}>
              {data.skills.filter(Boolean).map((s, i) => (
                <Text key={i} style={base.skillChip}>{s}</Text>
              ))}
            </View>
          </View>
        )}

        {data.education.length > 0 && (
          <View>
            <BlueSectionHeading label="Education" />
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

        {data.languages.length > 0 && (
          <View>
            <BlueSectionHeading label="Languages" />
            {data.languages.map((lang) => (
              <View key={lang.id} style={base.languageRow}>
                <Text style={base.languageName}>{lang.language}</Text>
                <Text style={base.languageLevel}>{lang.level}</Text>
              </View>
            ))}
          </View>
        )}
      </Page>
    </Document>
  )
}
