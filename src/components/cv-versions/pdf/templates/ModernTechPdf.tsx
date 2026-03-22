import { Document, Page, View, Text, StyleSheet } from '@react-pdf/renderer'
import type { ResumeData } from '@/types/resume'
import { base, COLORS, PAGE } from '../PdfStyles'

interface Props { data: ResumeData }

const SIDEBAR_WIDTH = 155
const MAIN_WIDTH = PAGE.width - PAGE.marginLeft - PAGE.marginRight - SIDEBAR_WIDTH - 12

const CEFR_LABEL: Record<string, string> = {
  A1: 'Beginner', A2: 'Elementary', B1: 'Intermediate',
  B2: 'Upper-Intermediate', C1: 'Advanced', C2: 'Native / Mastery',
}

const s = StyleSheet.create({
  row: {
    flexDirection: 'row',
    gap: 12,
    flex: 1,
  },
  sidebar: {
    width: SIDEBAR_WIDTH,
    backgroundColor: '#1E293B',
    marginLeft: -44,
    marginTop: -36,
    marginBottom: -36,
    paddingTop: 36,
    paddingBottom: 36,
    paddingLeft: 16,
    paddingRight: 14,
  },
  sidebarName: {
    fontSize: 14,
    fontFamily: 'Helvetica-Bold',
    color: COLORS.white,
    lineHeight: 1.3,
  },
  sidebarTitle: {
    fontSize: 8,
    color: '#94A3B8',
    marginTop: 3,
    lineHeight: 1.4,
  },
  sidebarSection: {
    fontSize: 7.5,
    fontFamily: 'Helvetica-Bold',
    color: '#64748B',
    textTransform: 'uppercase',
    letterSpacing: 0.8,
    marginTop: 14,
    marginBottom: 5,
  },
  sidebarText: {
    fontSize: 7.5,
    color: '#CBD5E1',
    lineHeight: 1.5,
    marginBottom: 1,
  },
  sidebarSkill: {
    fontSize: 7.5,
    color: '#E2E8F0',
    marginBottom: 3,
    paddingVertical: 2,
    paddingHorizontal: 0,
    borderBottomWidth: 0.5,
    borderBottomColor: '#334155',
    borderBottomStyle: 'solid',
  },
  langRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 2,
  },
  langName: { fontSize: 7.5, color: '#E2E8F0' },
  langLevel: { fontSize: 7, color: '#64748B' },
  main: {
    width: MAIN_WIDTH,
    paddingTop: 6,
  },
  mainSection: {
    fontSize: 9,
    fontFamily: 'Helvetica-Bold',
    color: '#1E293B',
    textTransform: 'uppercase',
    letterSpacing: 0.8,
    marginTop: 10,
    marginBottom: 4,
    paddingBottom: 2,
    borderBottomWidth: 0.75,
    borderBottomColor: COLORS.border,
    borderBottomStyle: 'solid',
  },
  dot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: COLORS.blue,
    marginTop: 1.5,
    marginRight: 6,
  },
})

// Modern Tech — two-column sidebar layout, dark sidebar with skills/contact
export function ModernTechPdf({ data }: Props) {
  const { contact } = data
  const name = [contact.firstName, contact.lastName].filter(Boolean).join(' ') || 'Your Name'

  const contactItems = [
    contact.email && { label: contact.email },
    contact.phone && { label: contact.phone },
    contact.location && { label: contact.location },
    contact.linkedin && { label: contact.linkedin },
    contact.website && { label: contact.website },
  ].filter(Boolean) as { label: string }[]

  return (
    <Document>
      <Page size="A4" style={{ ...base.page, flexDirection: 'row', paddingLeft: 0, paddingTop: 0, paddingBottom: 0 }}>
        {/* Sidebar */}
        <View style={s.sidebar}>
          <Text style={s.sidebarName}>{name}</Text>
          {contact.targetTitle ? <Text style={s.sidebarTitle}>{contact.targetTitle}</Text> : null}

          {contactItems.length > 0 && (
            <View>
              <Text style={s.sidebarSection}>Contact</Text>
              {contactItems.map((item, i) => (
                <Text key={i} style={s.sidebarText}>{item.label}</Text>
              ))}
            </View>
          )}

          {data.skills.filter(Boolean).length > 0 && (
            <View>
              <Text style={s.sidebarSection}>Skills</Text>
              {data.skills.filter(Boolean).map((skill, i) => (
                <Text key={i} style={s.sidebarSkill}>{skill}</Text>
              ))}
            </View>
          )}

          {data.languages.length > 0 && (
            <View>
              <Text style={s.sidebarSection}>Languages</Text>
              {data.languages.map((lang) => (
                <View key={lang.id} style={s.langRow}>
                  <Text style={s.langName}>{lang.language}</Text>
                  <Text style={s.langLevel}>{CEFR_LABEL[lang.level] ?? lang.level}</Text>
                </View>
              ))}
            </View>
          )}
        </View>

        {/* Main content */}
        <View style={s.main}>
          {data.summary?.trim() && (
            <View>
              <Text style={s.mainSection}>Summary</Text>
              <Text style={base.summary}>{data.summary}</Text>
            </View>
          )}

          {data.experience.length > 0 && (
            <View>
              <Text style={s.mainSection}>Experience</Text>
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

          {data.education.length > 0 && (
            <View>
              <Text style={s.mainSection}>Education</Text>
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
        </View>
      </Page>
    </Document>
  )
}
