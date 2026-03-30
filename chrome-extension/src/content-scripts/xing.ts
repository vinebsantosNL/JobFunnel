import { MAX_DESCRIPTION_LENGTH } from '../shared/config'
import type { ExtMessage, ScrapedJob } from '../shared/types'

function scrape(): ScrapedJob | null {
  try {
    const title =
      document.querySelector<HTMLElement>('[data-testid="job-title"]')?.innerText?.trim() ??
      document.querySelector<HTMLElement>('h1[class*="JobHeader"]')?.innerText?.trim() ??
      document.querySelector<HTMLElement>('h1')?.innerText?.trim()

    const company =
      document.querySelector<HTMLElement>('[data-testid="company-name"]')?.innerText?.trim() ??
      document.querySelector<HTMLElement>('[class*="CompanyName"]')?.innerText?.trim() ??
      document.querySelector<HTMLElement>('[class*="company"]')?.innerText?.trim()

    const location =
      document.querySelector<HTMLElement>('[data-testid="job-location"]')?.innerText?.trim() ??
      document.querySelector<HTMLElement>('[class*="Location"]')?.innerText?.trim() ??
      null

    const salaryText =
      document.querySelector<HTMLElement>('[data-testid="salary-range"]')?.innerText?.trim() ??
      document.querySelector<HTMLElement>('[class*="Salary"]')?.innerText?.trim() ??
      null

    const { salaryMin, salaryMax, currency } = parseSalary(salaryText)

    const descEl =
      document.querySelector<HTMLElement>('[data-testid="job-description"]') ??
      document.querySelector<HTMLElement>('[class*="JobDescription"]') ??
      document.querySelector<HTMLElement>('[class*="description"]')

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
      job_url: window.location.href.split('?')[0],
      job_description: description,
      source: 'xing',
    }
  } catch {
    return null
  }
}

function parseSalary(text: string | null): {
  salaryMin: number | null
  salaryMax: number | null
  currency: string | null
} {
  if (!text) return { salaryMin: null, salaryMax: null, currency: null }

  const euroMatch = text.match(/€\s*([\d,.]+)k?\s*[–\-]\s*€?\s*([\d,.]+)k?/i)
  if (!euroMatch) return { salaryMin: null, salaryMax: null, currency: null }

  const multiplier = text.toLowerCase().includes('k') ? 1000 : 1
  const parse = (s: string) => parseFloat(s.replace(/[,\.]/g, '')) * multiplier
  return { salaryMin: parse(euroMatch[1]), salaryMax: parse(euroMatch[2]), currency: 'EUR' }
}

let cachedJob: ScrapedJob | null = null

// Xing is a React SPA — wait for content to load
const observer = new MutationObserver(() => {
  const job = scrape()
  if (job) { cachedJob = job; observer.disconnect() }
})
observer.observe(document.body, { childList: true, subtree: true })

const immediate = scrape()
if (immediate) cachedJob = immediate

chrome.runtime.onMessage.addListener((message: ExtMessage, _sender, sendResponse) => {
  if (message.type === 'GET_SCRAPED_JOB') {
    sendResponse({ type: 'SCRAPED_JOB', payload: scrape() ?? cachedJob })
    return true
  }
})

export {}
