import { MAX_DESCRIPTION_LENGTH } from '../shared/config'
import type { ExtMessage, ScrapedJob } from '../shared/types'

function scrape(): ScrapedJob | null {
  try {
    const title =
      document.querySelector<HTMLElement>('h1.jobsearch-JobInfoHeader-title')?.innerText?.trim() ??
      document.querySelector<HTMLElement>('[data-testid="jobsearch-JobInfoHeader-title"]')?.innerText?.trim() ??
      document.querySelector<HTMLElement>('h1[class*="title"]')?.innerText?.trim()

    const company =
      document.querySelector<HTMLElement>('[data-testid="inlineHeader-companyName"] a')?.innerText?.trim() ??
      document.querySelector<HTMLElement>('.jobsearch-InlineCompanyRating-companyHeader')?.innerText?.trim() ??
      document.querySelector<HTMLElement>('[class*="companyName"]')?.innerText?.trim()

    const location =
      document.querySelector<HTMLElement>('[data-testid="job-location"]')?.innerText?.trim() ??
      document.querySelector<HTMLElement>('[class*="companyLocation"]')?.innerText?.trim() ??
      null

    const salaryText =
      document.querySelector<HTMLElement>('[id*="salaryInfoAndJobType"]')?.innerText?.trim() ??
      document.querySelector<HTMLElement>('[class*="salary"]')?.innerText?.trim() ??
      null

    const { salaryMin, salaryMax, currency } = parseSalary(salaryText)

    const descEl =
      document.querySelector<HTMLElement>('#jobDescriptionText') ??
      document.querySelector<HTMLElement>('[class*="jobDescription"]')

    const description = descEl
      ? descEl.innerText.trim().slice(0, MAX_DESCRIPTION_LENGTH)
      : null

    if (!title || !company) return null

    return {
      company_name: company,
      job_title: title,
      location: location ?? null,
      salary_min: salaryMin,
      salary_max: salaryMax,
      salary_currency: currency,
      job_url: canonicalUrl(),
      job_description: description,
      source: 'indeed',
    }
  } catch {
    return null
  }
}

function canonicalUrl(): string {
  const url = new URL(window.location.href)
  const jk = url.searchParams.get('jk')
  return jk ? `${url.origin}/viewjob?jk=${jk}` : `${url.origin}${url.pathname}`
}

function parseSalary(text: string | null): {
  salaryMin: number | null
  salaryMax: number | null
  currency: string | null
} {
  if (!text) return { salaryMin: null, salaryMax: null, currency: null }

  const euroMatch = text.match(/€\s*([\d,.]+)k?\s*[–\-]\s*€?\s*([\d,.]+)k?/i)
  const gbpMatch  = text.match(/£\s*([\d,.]+)k?\s*[–\-]\s*£?\s*([\d,.]+)k?/i)
  const usdMatch  = text.match(/\$\s*([\d,.]+)k?\s*[–\-]\s*\$?\s*([\d,.]+)k?/i)

  const match = euroMatch ?? gbpMatch ?? usdMatch
  const currency = euroMatch ? 'EUR' : gbpMatch ? 'GBP' : usdMatch ? 'USD' : null

  if (!match || !currency) return { salaryMin: null, salaryMax: null, currency: null }

  const multiplier = text.toLowerCase().includes('k') ? 1000 : 1
  const parse = (s: string) => parseFloat(s.replace(/[,\.]/g, '')) * multiplier

  return { salaryMin: parse(match[1]), salaryMax: parse(match[2]), currency }
}

let cachedJob: ScrapedJob | null = null

function tryScrapWithRetry(retries = 3, delay = 800): void {
  const job = scrape()
  if (job) { cachedJob = job; return }
  if (retries > 0) setTimeout(() => tryScrapWithRetry(retries - 1, delay), delay)
}

tryScrapWithRetry()

chrome.runtime.onMessage.addListener((message: ExtMessage, _sender, sendResponse) => {
  if (message.type === 'GET_SCRAPED_JOB') {
    sendResponse({ type: 'SCRAPED_JOB', payload: scrape() ?? cachedJob })
    return true
  }
})

export {}
