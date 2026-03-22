/**
 * ATS Score Engine — deterministic rule-based checker.
 *
 * Score starts at 100. Each failed rule deducts a weighted penalty.
 * Rules are based on documented behavior of Taleo, Workday, SAP SuccessFactors,
 * Greenhouse, and Lever ATS systems.
 *
 * No external API — fully client-side.
 */

import type { ResumeData } from '@/types/resume'
import type { TemplateId } from '@/types/database.types'

export type RuleSeverity = 'error' | 'warning' | 'pass'

export interface AtsRuleResult {
  id: string
  category: AtsCategory
  severity: RuleSeverity
  title: string
  detail: string
  penalty: number // points deducted (0 for pass)
}

export type AtsCategory =
  | 'layout'
  | 'contact'
  | 'content'
  | 'dates'
  | 'export'

export interface AtsScoreResult {
  score: number          // 0–100
  findings: AtsRuleResult[]
  errors: AtsRuleResult[]
  warnings: AtsRuleResult[]
  passes: AtsRuleResult[]
}

// ─── Rule weights ─────────────────────────────────────────────────────────────

const PENALTY_ERROR   = 15
const PENALTY_WARNING =  5

// ─── Individual rules ─────────────────────────────────────────────────────────

function ruleMultiColumn(templateId: TemplateId): AtsRuleResult {
  const isMulti = templateId === 'modern_tech'
  return {
    id: 'layout-single-column',
    category: 'layout',
    severity: isMulti ? 'error' : 'pass',
    title: 'Single-column layout',
    detail: isMulti
      ? 'Two-column layouts (Modern Tech) cannot be reliably parsed by Taleo, Workday, and SAP. Switch to a single-column template for maximum compatibility.'
      : 'Single-column layout is fully compatible with all major ATS systems.',
    penalty: isMulti ? PENALTY_ERROR : 0,
  }
}

function ruleEmail(data: ResumeData): AtsRuleResult {
  const has = !!data.contact.email?.trim()
  return {
    id: 'contact-email',
    category: 'contact',
    severity: has ? 'pass' : 'error',
    title: 'Email address present',
    detail: has
      ? 'Email address detected — required by all ATS systems for candidate matching.'
      : 'Missing email address. Every ATS requires an email to create a candidate profile.',
    penalty: has ? 0 : PENALTY_ERROR,
  }
}

function ruleFullName(data: ResumeData): AtsRuleResult {
  const hasFirst = !!data.contact.firstName?.trim()
  const hasLast  = !!data.contact.lastName?.trim()
  const has = hasFirst && hasLast
  return {
    id: 'contact-full-name',
    category: 'contact',
    severity: has ? 'pass' : 'error',
    title: 'Full name present',
    detail: has
      ? 'Full name detected — correctly parsed by all major ATS systems.'
      : 'Missing first or last name. ATS systems require a full name to create a candidate record.',
    penalty: has ? 0 : PENALTY_ERROR,
  }
}

function rulePhone(data: ResumeData): AtsRuleResult {
  const has = !!data.contact.phone?.trim()
  return {
    id: 'contact-phone',
    category: 'contact',
    severity: has ? 'pass' : 'warning',
    title: 'Phone number present',
    detail: has
      ? 'Phone number detected.'
      : 'No phone number. Some recruiters filter by phone availability in ATS. Recommended to add.',
    penalty: has ? 0 : PENALTY_WARNING,
  }
}

function ruleLocation(data: ResumeData): AtsRuleResult {
  const has = !!data.contact.location?.trim()
  return {
    id: 'contact-location',
    category: 'contact',
    severity: has ? 'pass' : 'warning',
    title: 'Location present',
    detail: has
      ? 'Location detected — used by ATS for geo-filtering of candidates.'
      : 'No location. ATS geo-filters may exclude your CV from location-based searches.',
    penalty: has ? 0 : PENALTY_WARNING,
  }
}

function ruleHasExperience(data: ResumeData): AtsRuleResult {
  const has = data.experience.length > 0
  return {
    id: 'content-has-experience',
    category: 'content',
    severity: has ? 'pass' : 'error',
    title: 'Work experience section present',
    detail: has
      ? 'Work experience section detected.'
      : 'No work experience entries. ATS systems score CVs lower without this section.',
    penalty: has ? 0 : PENALTY_ERROR,
  }
}

function ruleExperienceBullets(data: ResumeData): AtsRuleResult {
  const withBullets = data.experience.filter(
    (e) => e.bullets.some((b) => b.text.trim().length > 0)
  )
  const allHaveBullets = data.experience.length > 0 && withBullets.length === data.experience.length
  const someMissing = data.experience.length > 0 && withBullets.length < data.experience.length

  return {
    id: 'content-experience-bullets',
    category: 'content',
    severity: allHaveBullets ? 'pass' : someMissing ? 'warning' : 'pass',
    title: 'Experience entries have bullet points',
    detail: allHaveBullets
      ? 'All experience entries have bullet points — keyword-rich bullets improve ATS scoring.'
      : someMissing
      ? `${data.experience.length - withBullets.length} experience entry(s) have no bullets. ATS systems rank keyword density, and blank entries reduce your score.`
      : 'Add bullet points to experience entries to improve keyword density.',
    penalty: allHaveBullets ? 0 : someMissing ? PENALTY_WARNING : 0,
  }
}

function ruleActionVerbs(data: ResumeData): AtsRuleResult {
  const ACTION_VERBS = [
    'led', 'built', 'launched', 'managed', 'delivered', 'increased', 'reduced',
    'designed', 'developed', 'implemented', 'drove', 'created', 'established',
    'improved', 'optimised', 'optimized', 'streamlined', 'scaled', 'owned',
    'partnered', 'collaborated', 'executed', 'defined', 'architected', 'shipped',
  ]
  const allBullets = data.experience.flatMap((e) => e.bullets.map((b) => b.text.toLowerCase()))
  if (allBullets.length === 0) {
    return {
      id: 'content-action-verbs',
      category: 'content',
      severity: 'pass',
      title: 'Bullet points start with action verbs',
      detail: 'No bullets to check yet.',
      penalty: 0,
    }
  }
  const withVerb = allBullets.filter((b) => ACTION_VERBS.some((v) => b.startsWith(v)))
  const ratio = withVerb.length / allBullets.length
  const severity: RuleSeverity = ratio >= 0.6 ? 'pass' : 'warning'
  return {
    id: 'content-action-verbs',
    category: 'content',
    severity,
    title: 'Bullet points start with action verbs',
    detail: severity === 'pass'
      ? `${Math.round(ratio * 100)}% of bullets start with strong action verbs — improves keyword parsing.`
      : `Only ${Math.round(ratio * 100)}% of bullets start with action verbs. ATS systems parse impact verbs (Led, Built, Increased…) as signals of contribution.`,
    penalty: severity === 'pass' ? 0 : PENALTY_WARNING,
  }
}

function ruleHasSkills(data: ResumeData): AtsRuleResult {
  const has = data.skills.filter(Boolean).length >= 3
  return {
    id: 'content-skills',
    category: 'content',
    severity: has ? 'pass' : 'warning',
    title: 'Skills section has entries',
    detail: has
      ? 'Skills section detected — ATS systems use this for keyword matching against job requirements.'
      : 'Fewer than 3 skills listed. ATS systems match your skills against job requirements — a sparse skills section reduces match scores.',
    penalty: has ? 0 : PENALTY_WARNING,
  }
}

function ruleSummary(data: ResumeData): AtsRuleResult {
  const words = (data.summary ?? '').trim().split(/\s+/).filter(Boolean).length
  const hasSummary = words >= 20
  return {
    id: 'content-summary',
    category: 'content',
    severity: hasSummary ? 'pass' : 'warning',
    title: 'Professional summary present',
    detail: hasSummary
      ? `Summary detected (${words} words) — gives ATS systems a rich keyword source for initial scoring.`
      : words === 0
      ? 'No professional summary. A 2–3 sentence summary packed with role-relevant keywords significantly improves ATS ranking.'
      : `Summary is too short (${words} words). Aim for at least 40 words to provide meaningful keyword density.`,
    penalty: hasSummary ? 0 : PENALTY_WARNING,
  }
}

function ruleDateFormat(data: ResumeData): AtsRuleResult {
  // Warn if dates don't follow MM/YYYY or Mon YYYY patterns
  const DATE_PATTERN = /^(\d{2}\/\d{4}|[A-Za-z]{3}\s\d{4}|Present|present|Current|current)$/
  const allDates = data.experience.flatMap((e) => [e.startDate, e.endDate].filter(Boolean))

  if (allDates.length === 0) {
    return {
      id: 'dates-format',
      category: 'dates',
      severity: 'pass',
      title: 'Date format consistent',
      detail: 'No dates to check yet.',
      penalty: 0,
    }
  }

  const badDates = allDates.filter((d) => d && !DATE_PATTERN.test(d))
  const hasBad = badDates.length > 0

  return {
    id: 'dates-format',
    category: 'dates',
    severity: hasBad ? 'warning' : 'pass',
    title: 'Date format consistent',
    detail: hasBad
      ? `${badDates.length} date(s) may not be parsed correctly by ATS. Use MM/YYYY (03/2025) or Mon YYYY (Mar 2025) format.`
      : 'All dates follow a consistent format — correctly parsed by major ATS systems.',
    penalty: hasBad ? PENALTY_WARNING : 0,
  }
}

function ruleNoKeywords(data: ResumeData): AtsRuleResult {
  // Check that the CV has some content for keyword extraction
  const totalWords = [
    data.summary ?? '',
    ...data.experience.flatMap((e) => e.bullets.map((b) => b.text)),
    ...data.skills,
  ].join(' ').trim().split(/\s+/).filter(Boolean).length

  const hasEnough = totalWords >= 100
  return {
    id: 'content-keyword-density',
    category: 'content',
    severity: hasEnough ? 'pass' : 'warning',
    title: 'Sufficient keyword density',
    detail: hasEnough
      ? `CV contains ${totalWords} words — sufficient for ATS keyword extraction.`
      : `CV contains only ${totalWords} words. ATS systems need at least 100 words of content to build a reliable keyword profile.`,
    penalty: hasEnough ? 0 : PENALTY_WARNING,
  }
}

// ─── Score runner ─────────────────────────────────────────────────────────────

export function scoreResume(data: ResumeData, templateId: TemplateId): AtsScoreResult {
  const findings: AtsRuleResult[] = [
    ruleMultiColumn(templateId),
    ruleEmail(data),
    ruleFullName(data),
    rulePhone(data),
    ruleLocation(data),
    ruleHasExperience(data),
    ruleExperienceBullets(data),
    ruleActionVerbs(data),
    ruleHasSkills(data),
    ruleSummary(data),
    ruleDateFormat(data),
    ruleNoKeywords(data),
  ]

  const totalPenalty = findings.reduce((acc, f) => acc + f.penalty, 0)
  const score = Math.max(0, 100 - totalPenalty)

  return {
    score,
    findings,
    errors:   findings.filter((f) => f.severity === 'error'),
    warnings: findings.filter((f) => f.severity === 'warning'),
    passes:   findings.filter((f) => f.severity === 'pass'),
  }
}
