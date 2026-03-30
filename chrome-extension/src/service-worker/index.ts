import { saveJob, checkAuthState, markJobSaved } from '../shared/api'
import type { ExtMessage } from '../shared/types'

// Handle messages from popup and content scripts
chrome.runtime.onMessage.addListener(
  (message: ExtMessage, _sender, sendResponse) => {
    if (message.type === 'SAVE_JOB') {
      saveJob(message.payload)
        .then(({ jobId }) => {
          // Cache saved URL so popup can show "already saved" next visit
          markJobSaved(message.payload.job_url, jobId)
          sendResponse({ type: 'SAVE_JOB_SUCCESS', jobId })
        })
        .catch((err: Error) => {
          sendResponse({ type: 'SAVE_JOB_ERROR', error: err.message })
        })
      return true // keep channel open for async response
    }

    if (message.type === 'GET_AUTH_STATE') {
      checkAuthState()
        .then(({ isConnected, email }) => {
          sendResponse({ type: 'AUTH_STATE', isConnected, email })
        })
        .catch(() => {
          sendResponse({ type: 'AUTH_STATE', isConnected: false, email: null })
        })
      return true
    }
  }
)

// When user navigates to a supported job page, scrape silently via content script
// and cache the result so the popup opens instantly
chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
  if (changeInfo.status !== 'complete') return
  if (!tab.url) return

  const supported = isSupportedJobPage(tab.url)
  if (!supported) return

  chrome.tabs.sendMessage(tabId, { type: 'GET_SCRAPED_JOB' }, (response) => {
    // Ignore errors — content script may not be ready yet
    void response
  })
})

function isSupportedJobPage(url: string): boolean {
  const patterns = [
    /linkedin\.com\/jobs\/view\//,
    /indeed\.com\/viewjob/,
    /stepstone\.de\/stellenangebote\//,
    /glassdoor\.(com|co\.uk|de)\/(job-listing|Stellenangebote)\//,
    /xing\.com\/jobs\/(detail\/|view\/)/,
  ]
  return patterns.some((p) => p.test(url))
}

export {}
