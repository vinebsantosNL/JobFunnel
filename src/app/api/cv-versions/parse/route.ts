import { NextResponse } from 'next/server'
import Anthropic from '@anthropic-ai/sdk'
import { z } from 'zod'
import { createClient } from '@/lib/supabase/server'
import { getServerEnv } from '@/lib/env'

// ── Zod schema for Claude's structured output ─────────────────────────────────

const BulletSchema = z.object({ id: z.string(), text: z.string() })

const ExperienceSchema = z.object({
  id: z.string(),
  company: z.string(),
  title: z.string(),
  location: z.string().optional(),
  startDate: z.string(),
  endDate: z.string(),
  bullets: z.array(BulletSchema).default([]),
})

const EducationSchema = z.object({
  id: z.string(),
  institution: z.string(),
  degree: z.string(),
  field: z.string().optional(),
  startDate: z.string().optional(),
  endDate: z.string().optional(),
  grade: z.string().optional(),
})

const LanguageSchema = z.object({
  id: z.string(),
  language: z.string(),
  level: z.enum(['A1', 'A2', 'B1', 'B2', 'C1', 'C2']),
})

const CertificationSchema = z.object({
  id: z.string(),
  name: z.string(),
  issuer: z.string().optional(),
  date: z.string().optional(),
})

const ProjectSchema = z.object({
  id: z.string(),
  name: z.string(),
  description: z.string().optional(),
  url: z.string().optional(),
  technologies: z.array(z.string()).optional(),
})

const ResumeDataSchema = z.object({
  contact: z.object({
    firstName: z.string().catch(''),
    lastName: z.string().catch(''),
    targetTitle: z.string().catch(''),
    email: z.string().catch(''),
    location: z.string().catch(''),
    linkedin: z.string().optional(),
    phone: z.string().optional(),
    website: z.string().optional(),
  }).catch({ firstName: '', lastName: '', targetTitle: '', email: '', location: '' }),
  summary: z.string().optional(),
  experience: z.array(ExperienceSchema).default([]),
  education: z.array(EducationSchema).default([]),
  skills: z.array(z.string()).default([]),
  languages: z.array(LanguageSchema).default([]),
  certifications: z.array(CertificationSchema).default([]),
  projects: z.array(ProjectSchema).default([]),
  sectionOrder: z.array(z.string()).default(['contact', 'summary', 'experience', 'skills', 'education', 'languages']),
})

// ─────────────────────────────────────────────────────────────────────────────

const ACCEPTED_TYPES = [
  'application/pdf',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
]

const MAX_BYTES = 10 * 1024 * 1024

const SYSTEM_PROMPT = `You are a CV/resume parser. Your job is to extract structured information from raw CV text and return it as valid JSON — nothing else. No markdown, no explanation, no code fences.

Return a JSON object that strictly follows this shape:

{
  "contact": {
    "firstName": string,
    "lastName": string,
    "targetTitle": string,
    "email": string,
    "location": string,
    "linkedin": string | undefined,
    "phone": string | undefined,
    "website": string | undefined
  },
  "summary": string | undefined,
  "experience": [
    {
      "id": "exp-1",
      "company": string,
      "title": string,
      "location": string | undefined,
      "startDate": string,
      "endDate": string,
      "bullets": [{ "id": "b-1-1", "text": string }]
    }
  ],
  "education": [
    {
      "id": "edu-1",
      "institution": string,
      "degree": string,
      "field": string | undefined,
      "startDate": string | undefined,
      "endDate": string | undefined,
      "grade": string | undefined
    }
  ],
  "skills": string[],
  "languages": [
    {
      "id": "lang-1",
      "language": string,
      "level": "A1" | "A2" | "B1" | "B2" | "C1" | "C2"
    }
  ],
  "certifications": [
    {
      "id": "cert-1",
      "name": string,
      "issuer": string | undefined,
      "date": string | undefined
    }
  ],
  "projects": [
    {
      "id": "proj-1",
      "name": string,
      "description": string | undefined,
      "url": string | undefined,
      "technologies": string[] | undefined
    }
  ],
  "sectionOrder": ["contact", "summary", "experience", "skills", "education", "languages"]
}

Rules:
- IDs: use "exp-1", "exp-2" for experience; "b-{expIdx}-{bulletIdx}" for bullets; "edu-1" for education; "lang-1" for languages; "cert-1" for certifications; "proj-1" for projects.
- Dates: format as "Mon YYYY" (e.g. "Jan 2022"). Use "Present" for current roles.
- Languages without explicit CEFR: native/mother tongue → "C2", fluent → "C1", advanced → "C1", upper-intermediate → "B2", intermediate → "B1", basic/elementary → "A2".
- If a field cannot be determined from the text, omit it.
- Extract ALL bullet points from work experience as individual items.
- Skills should be a flat array of individual skill strings.
- sectionOrder is always ["contact", "summary", "experience", "skills", "education", "languages"].
- Return ONLY the JSON object. No markdown. No explanation.`

async function extractTextFromDocx(buffer: Buffer): Promise<string> {
  const mammoth = await import('mammoth')
  const result = await mammoth.extractRawText({ buffer })
  return result.value
}

async function extractTextFromPdf(buffer: Uint8Array): Promise<string> {
  const { getDocumentProxy, extractText } = await import('unpdf')
  const pdf = await getDocumentProxy(buffer)
  const { text } = await extractText(pdf, { mergePages: true })
  return text
}

export async function POST(request: Request) {
  // Auth
  const supabase = await createClient()
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser()
  if (!user || authError) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  // Validate request
  let formData: FormData
  try {
    formData = await request.formData()
  } catch {
    return NextResponse.json({ error: 'Invalid form data' }, { status: 400 })
  }

  const file = formData.get('file') as File | null
  if (!file) {
    return NextResponse.json({ error: 'No file provided' }, { status: 400 })
  }
  if (!ACCEPTED_TYPES.includes(file.type)) {
    return NextResponse.json({ error: 'Only PDF and DOCX files are supported' }, { status: 400 })
  }
  if (file.size > MAX_BYTES) {
    return NextResponse.json({ error: 'File exceeds 10 MB limit' }, { status: 400 })
  }

  // Extract raw text
  let rawText: string
  try {
    const arrayBuffer = await file.arrayBuffer()
    if (
      file.type === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
    ) {
      rawText = await extractTextFromDocx(Buffer.from(arrayBuffer))
    } else {
      rawText = await extractTextFromPdf(new Uint8Array(arrayBuffer))
    }
  } catch (err) {
    console.error('[cv-parse] text extraction failed:', err)
    return NextResponse.json(
      { error: 'Could not read the file. Make sure it is a valid PDF or DOCX.' },
      { status: 422 }
    )
  }

  if (!rawText.trim()) {
    return NextResponse.json(
      { error: 'The file appears to be empty or image-only.' },
      { status: 422 }
    )
  }

  // Parse with Claude
  let apiKey: string
  try {
    apiKey = getServerEnv().ANTHROPIC_API_KEY
  } catch {
    console.error('[cv-parse] ANTHROPIC_API_KEY is not set')
    return NextResponse.json({ error: 'CV parsing is not configured' }, { status: 503 })
  }

  try {
    const client = new Anthropic({ apiKey })
    const message = await client.messages.create({
      model: 'claude-sonnet-4-6',
      max_tokens: 4096,
      system: SYSTEM_PROMPT,
      messages: [
        {
          role: 'user',
          content: `Parse this CV:\n\n${rawText.slice(0, 24000)}`,
        },
      ],
    })

    const block = message.content[0]
    if (block.type !== 'text') {
      throw new Error('Unexpected response type from Claude')
    }

    // Strip any accidental markdown code fences
    const json = block.text.replace(/^```(?:json)?\s*/i, '').replace(/\s*```\s*$/i, '').trim()

    let rawJson: unknown
    try {
      rawJson = JSON.parse(json)
    } catch {
      console.error('[cv-parse] Claude returned non-JSON')
      return NextResponse.json(
        { error: 'Failed to parse CV content. Please fill in the sections manually.' },
        { status: 422 }
      )
    }

    const parsed = ResumeDataSchema.safeParse(rawJson)
    if (!parsed.success) {
      console.error('[cv-parse] Claude response failed schema validation:', parsed.error.flatten())
      return NextResponse.json(
        { error: 'Failed to parse CV content. Please fill in the sections manually.' },
        { status: 422 }
      )
    }
    const resume_data = parsed.data

    return NextResponse.json({ resume_data })
  } catch (err) {
    console.error('[cv-parse] Claude parsing failed:', err)
    return NextResponse.json(
      { error: 'Failed to parse CV content. Please fill in the sections manually.' },
      { status: 422 }
    )
  }
}
