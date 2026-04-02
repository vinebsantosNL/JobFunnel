import { MAX_DESCRIPTION_LENGTH } from '../shared/config'
import type { ExtMessage, ScrapedJob } from '../shared/types'

function scrape(): ScrapedJob | null {
  try {
    const title =
      document.querySelector<HTMLElement>('[data-test="job-title"]')?.innerText?.trim() ??
      document.querySelector<HTMLElement>('h1[class*="title"]')?.innerText?.trim() ??
      document.querySelector<HTMLElement>('h1')?.innerText?.trim()

    const company =
      document.querySelector<HTMLElement>('[data-test="employer-name"]')?.innerText?.trim() ??
      document.querySelector<HTMLElement>('[class*="employerName"]')?.innerText?.trim()

    const location =
      document.querySelector<HTMLElement>('[data-test="emp-location"]')?.innerText?.trim() ??
      document.querySelector<HTMLElement>('[class*="location"]')?.innerText?.trim() ??
      null

    const salaryText =
      document.querySelector<HTMLElement>('[data-test="detailSalary"]')?.innerText?.trim() ??
      document.querySelector<HTMLElement>('[class*="salary"]')?.innerText?.trim() ??
      null

    const { salaryMin, salaryMax, currency } = parseSalary(salaryText)

    const descEl =
      document.querySelector<HTMLElement>('[class*="JobDescription"]') ??
      document.querySelector<HTMLElement>('[data-test="jobDescriptionContent"]') ??
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
      source: 'glassdoor',
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

function tryScrapWithRetry(retries = 3, delay = 1000): void {
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
