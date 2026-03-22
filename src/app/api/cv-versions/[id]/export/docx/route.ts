import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'
import {
  Document,
  Packer,
  Paragraph,
  TextRun,
  HeadingLevel,
  BorderStyle,
  AlignmentType,
  convertInchesToTwip,
} from 'docx'
import { getCVVersion } from '@/lib/services/cvVersionService'
import { handleApiError } from '@/lib/utils/errors'
import type { ResumeData, ResumeExperience, ResumeEducation } from '@/types/resume'
import { EMPTY_RESUME_DATA } from '@/types/resume'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

// ─── DOCX helpers ─────────────────────────────────────────────────────────────

function sectionHeading(text: string): Paragraph {
  return new Paragraph({
    text: text.toUpperCase(),
    heading: HeadingLevel.HEADING_2,
    spacing: { before: 240, after: 80 },
    border: {
      bottom: { style: BorderStyle.SINGLE, size: 6, color: 'AAAAAA', space: 4 },
    },
  })
}

function experienceBlock(exp: ResumeExperience): Paragraph[] {
  const paras: Paragraph[] = []

  paras.push(
    new Paragraph({
      spacing: { before: 100, after: 20 },
      children: [
        new TextRun({ text: exp.title || 'Role', bold: true, size: 20 }),
        new TextRun({ text: ' · ', color: '888888', size: 20 }),
        new TextRun({ text: exp.company || '', size: 20 }),
        new TextRun({
          text: `  ${exp.startDate}${exp.endDate ? ` – ${exp.endDate}` : ''}`,
          color: '888888',
          size: 18,
        }),
      ],
    })
  )

  if (exp.location) {
    paras.push(
      new Paragraph({
        spacing: { before: 0, after: 20 },
        children: [new TextRun({ text: exp.location, color: '666666', size: 18 })],
      })
    )
  }

  for (const bullet of exp.bullets.filter((b) => b.text.trim())) {
    paras.push(
      new Paragraph({
        bullet: { level: 0 },
        spacing: { before: 20, after: 0 },
        children: [new TextRun({ text: bullet.text, size: 18 })],
      })
    )
  }

  return paras
}

function educationBlock(edu: ResumeEducation): Paragraph[] {
  const paras: Paragraph[] = []
  paras.push(
    new Paragraph({
      spacing: { before: 100, after: 20 },
      children: [
        new TextRun({ text: edu.degree || 'Degree', bold: true, size: 20 }),
        new TextRun({ text: ' · ', color: '888888', size: 20 }),
        new TextRun({ text: edu.institution || '', size: 20 }),
        new TextRun({
          text: `  ${edu.startDate ?? ''}${edu.endDate ? ` – ${edu.endDate}` : ''}`,
          color: '888888',
          size: 18,
        }),
      ],
    })
  )
  if (edu.field) {
    paras.push(
      new Paragraph({
        spacing: { before: 0, after: 0 },
        children: [new TextRun({ text: edu.field, color: '666666', size: 18 })],
      })
    )
  }
  return paras
}

// ─── Route handler ────────────────────────────────────────────────────────────

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
    const data: ResumeData = {
      ...EMPTY_RESUME_DATA,
      ...parsed,
      contact: { ...EMPTY_RESUME_DATA.contact, ...(parsed.contact ?? {}) },
    }

    const { contact } = data
    const fullName = [contact.firstName, contact.lastName].filter(Boolean).join(' ') || 'Your Name'
    const contactLine = [contact.email, contact.phone, contact.location, contact.linkedin]
      .filter(Boolean)
      .join('  |  ')

    const children: Paragraph[] = [
      // Name
      new Paragraph({
        spacing: { before: 0, after: 60 },
        alignment: AlignmentType.LEFT,
        children: [new TextRun({ text: fullName, bold: true, size: 36 })],
      }),
    ]

    // Target title
    if (contact.targetTitle) {
      children.push(
        new Paragraph({
          spacing: { before: 0, after: 40 },
          children: [new TextRun({ text: contact.targetTitle, color: '555555', size: 22 })],
        })
      )
    }

    // Contact line
    if (contactLine) {
      children.push(
        new Paragraph({
          spacing: { before: 0, after: 120 },
          children: [new TextRun({ text: contactLine, color: '666666', size: 18 })],
        })
      )
    }

    // Summary
    if (data.summary?.trim()) {
      children.push(sectionHeading('Professional Summary'))
      children.push(
        new Paragraph({
          spacing: { before: 60, after: 0 },
          children: [new TextRun({ text: data.summary, size: 18 })],
        })
      )
    }

    // Experience
    if (data.experience.length > 0) {
      children.push(sectionHeading('Work Experience'))
      for (const exp of data.experience) {
        children.push(...experienceBlock(exp))
      }
    }

    // Skills
    const skills = data.skills.filter(Boolean)
    if (skills.length > 0) {
      children.push(sectionHeading('Skills'))
      children.push(
        new Paragraph({
          spacing: { before: 60, after: 0 },
          children: [new TextRun({ text: skills.join('  ·  '), size: 18 })],
        })
      )
    }

    // Education
    if (data.education.length > 0) {
      children.push(sectionHeading('Education'))
      for (const edu of data.education) {
        children.push(...educationBlock(edu))
      }
    }

    // Languages
    if (data.languages.length > 0) {
      children.push(sectionHeading('Languages'))
      for (const lang of data.languages) {
        children.push(
          new Paragraph({
            spacing: { before: 40, after: 0 },
            children: [
              new TextRun({ text: lang.language, bold: true, size: 18 }),
              new TextRun({ text: `  ${lang.level}`, color: '888888', size: 18 }),
            ],
          })
        )
      }
    }

    const doc = new Document({
      sections: [
        {
          properties: {
            page: {
              margin: {
                top: convertInchesToTwip(0.75),
                bottom: convertInchesToTwip(0.75),
                left: convertInchesToTwip(0.9),
                right: convertInchesToTwip(0.9),
              },
            },
          },
          children,
        },
      ],
    })

    const buffer = await Packer.toBuffer(doc)
    const filename = `${version.name.replace(/[^a-z0-9\-_]/gi, '_')}.docx`

    return new NextResponse(new Uint8Array(buffer), {
      status: 200,
      headers: {
        'Content-Type': 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        'Content-Disposition': `attachment; filename="${filename}"`,
        'Content-Length': buffer.length.toString(),
      },
    })
  } catch (error) {
    return handleApiError(error)
  }
}
