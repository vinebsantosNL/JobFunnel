import { MAX_DESCRIPTION_LENGTH } from '../shared/config'
import type { ExtMessage, ScrapedJob } from '../shared/types'

function scrape(): ScrapedJob | null {
  try {
    const title =
      document.querySelector<HTMLElement>('h1.job-details-jobs-unified-top-card__job-title')?.innerText?.trim() ??
      document.querySelector<HTMLElement>('h1.jobs-unified-top-card__job-title')?.innerText?.trim() ??
      document.querySelector<HTMLElement>('h1[class*="job-title"]')?.innerText?.trim()

    const company =
      document.querySelector<HTMLElement>('.job-details-jobs-unified-top-card__company-name a')?.innerText?.trim() ??
      document.querySelector<HTMLElement>('.jobs-unified-top-card__company-name a')?.innerText?.trim() ??
      document.querySelector<HTMLElement>('[class*="company-name"]')?.innerText?.trim()

    const location =
      document.querySelector<HTMLElement>('.job-details-jobs-unified-top-card__bullet')?.innerText?.trim() ??
      document.querySelector<HTMLElement>('.jobs-unified-top-card__bullet')?.innerText?.trim() ??
      null

    // Salary — LinkedIn shows it in multiple places depending on posting
    const salaryText =
      document.querySelector<HTMLElement>('.job-details-jobs-unified-top-card__job-insight--highlight')?.innerText?.trim() ??
      document.querySelector<HTMLElement>('[class*="salary"]')?.innerText?.trim() ??
      null

    const { salaryMin, salaryMax, currency } = parseSalary(salaryText)

    const descEl =
      document.querySelector<HTMLElement>('.jobs-description__content') ??
      document.querySelector<HTMLElement>('#job-details') ??
      document.querySelector<HTMLElement>('[class*="description__content"]')

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
      source: 'linkedin',
    }
  } catch {
    return null
  }
}

function canonicalUrl(): string {
  // Strip tracking params — keep only the job ID path
  const url = new URL(window.location.href)
  return `${url.origin}${url.pathname}`
}

function parseSalary(text: string | null): {
  salaryMin: number | null
  salaryMax: number | null
  currency: string | null
} {
  if (!text) return { salaryMin: null, salaryMax: null, currency: null }

  // Match patterns like: €80,000 – €100,000 / yr | $120k-$140k | £60k
  const euroMatch = text.match(/€\s*([\d,.]+)k?\s*[–\-]\s*€?\s*([\d,.]+)k?/i)
  const gbpMatch  = text.match(/£\s*([\d,.]+)k?\s*[–\-]\s*£?\s*([\d,.]+)k?/i)
  const usdMatch  = text.match(/\$\s*([\d,.]+)k?\s*[–\-]\s*\$?\s*([\d,.]+)k?/i)

  const match = euroMatch ?? gbpMatch ?? usdMatch
  const currency = euroMatch ? 'EUR' : gbpMatch ? 'GBP' : usdMatch ? 'USD' : null

  if (!match || !currency) return { salaryMin: null, salaryMax: null, currency: null }

  const multiplier = text.toLowerCase().includes('k') ? 1000 : 1
  const parse = (s: string) => parseFloat(s.replace(/[,\.]/g, '')) * multiplier

  return {
    salaryMin: parse(match[1]),
    salaryMax: parse(match[2]),
    currency,
  }
}

// Cache scraped data so popup gets it instantly
let cachedJob: ScrapedJob | null = null

function tryScrapWithRetry(retries = 3, delay = 800): void {
  const job = scrape()
  if (job) {
    cachedJob = job
    return
  }
  if (retries > 0) {
    setTimeout(() => tryScrapWithRetry(retries - 1, delay), delay)
  }
}

// Initial scrape on load
tryScrapWithRetry()

// Re-scrape on LinkedIn SPA navigation (pushState).
// Only trigger when the URL actually changes — LinkedIn mutates the DOM constantly
// and firing tryScrapWithRetry on every change would be a significant perf hit.
let lastUrl = location.href
const observer = new MutationObserver(() => {
  if (location.href !== lastUrl) {
    lastUrl = location.href
    tryScrapWithRetry()
  }
})

observer.observe(document.body, { childList: true, subtree: true })

// Respond to popup requests
chrome.runtime.onMessage.addListener((message: ExtMessage, _sender, sendResponse) => {
  if (message.type === 'GET_SCRAPED_JOB') {
    // Try a fresh scrape first; fall back to cache
    const fresh = scrape()
    sendResponse({ type: 'SCRAPED_JOB', payload: fresh ?? cachedJob })
    return true
  }
})

export {}
