import { View, Text } from '@react-pdf/renderer'
import type { ResumeData, ResumeExperience, ResumeEducation, ResumeLanguage } from '@/types/resume'
import { base, COLORS } from './PdfStyles'

// ─── Contact header (single-column templates) ─────────────────────────────────

export function ContactHeader({ data }: { data: ResumeData }) {
  const { contact } = data
  const name = [contact.firstName, contact.lastName].filter(Boolean).join(' ') || 'Your Name'
  const contactItems = [
    contact.email,
    contact.phone,
    contact.location,
    contact.linkedin,
    contact.website,
  ].filter(Boolean)

  return (
    <View>
      <Text style={base.name}>{name}</Text>
      {contact.targetTitle ? <Text style={base.targetTitle}>{contact.targetTitle}</Text> : null}
      {contactItems.length > 0 && (
        <Text style={base.contactLine}>{contactItems.join(' \u00B7 ')}</Text>
      )}
    </View>
  )
}

// ─── Section heading ──────────────────────────────────────────────────────────

export function SectionHeading({ label }: { label: string }) {
  return <Text style={base.sectionHeading}>{label}</Text>
}

// ─── Summary ──────────────────────────────────────────────────────────────────

export function SummarySection({ summary }: { summary?: string }) {
  if (!summary?.trim()) return null
  return (
    <View>
      <SectionHeading label="Professional Summary" />
      <Text style={base.summary}>{summary}</Text>
    </View>
  )
}

// ─── Experience ───────────────────────────────────────────────────────────────

export function ExperienceSection({ experience }: { experience: ResumeExperience[] }) {
  if (!experience.length) return null
  return (
    <View>
      <SectionHeading label="Work Experience" />
      {experience.map((exp) => (
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
  )
}

// ─── Education ────────────────────────────────────────────────────────────────

export function EducationSection({ education }: { education: ResumeEducation[] }) {
  if (!education.length) return null
  return (
    <View>
      <SectionHeading label="Education" />
      {education.map((edu) => (
        <View key={edu.id} style={base.entryBlock}>
          <View style={base.entryHeader}>
            <Text style={base.entryTitle}>{edu.degree || 'Degree'}</Text>
            <Text style={base.entryMeta}>
              {edu.startDate}{edu.endDate ? ` – ${edu.endDate}` : ''}
            </Text>
          </View>
          <Text style={base.entrySubtitle}>
            {edu.institution}{edu.field ? ` · ${edu.field}` : ''}{edu.grade ? `  ${edu.grade}` : ''}
          </Text>
        </View>
      ))}
    </View>
  )
}

// ─── Skills ───────────────────────────────────────────────────────────────────

export function SkillsSection({ skills }: { skills: string[] }) {
  const filtered = skills.filter(Boolean)
  if (!filtered.length) return null
  return (
    <View>
      <SectionHeading label="Skills" />
      <View style={base.skillsWrap}>
        {filtered.map((s, i) => (
          <Text key={i} style={base.skillChip}>{s}</Text>
        ))}
      </View>
    </View>
  )
}

// ─── Languages ────────────────────────────────────────────────────────────────

const CEFR_LABEL: Record<string, string> = {
  A1: 'A1 – Beginner',
  A2: 'A2 – Elementary',
  B1: 'B1 – Intermediate',
  B2: 'B2 – Upper Intermediate',
  C1: 'C1 – Advanced',
  C2: 'C2 – Mastery / Native',
}

export function LanguagesSection({ languages }: { languages: ResumeLanguage[] }) {
  if (!languages.length) return null
  return (
    <View>
      <SectionHeading label="Languages" />
      {languages.map((lang) => (
        <View key={lang.id} style={base.languageRow}>
          <Text style={base.languageName}>{lang.language}</Text>
          <Text style={base.languageLevel}>{CEFR_LABEL[lang.level] ?? lang.level}</Text>
        </View>
      ))}
    </View>
  )
}
