import { useEffect, useState } from 'react'
import type { ScrapedJob, Stage, Priority, ExtMessage, BoardSource } from '../shared/types'
import { API_BASE, STORAGE_KEYS } from '../shared/config'
import type { StoredAuth } from '../shared/types'

type View = 'loading' | 'not-connected' | 'no-job' | 'form' | 'saving' | 'success' | 'already-saved' | 'free-limit'

interface FormState {
  company_name: string
  job_title: string
  location: string
  salary: string
  stage: Stage
  priority: Priority
}

const STAGE_OPTIONS: { value: Stage; label: string }[] = [
  { value: 'saved', label: 'Saved' },
  { value: 'applied', label: 'Applied' },
  { value: 'screening', label: 'Screening' },
  { value: 'interviewing', label: 'Interviewing' },
  { value: 'offer', label: 'Offer' },
]

const PRIORITY_OPTIONS: { value: Priority; label: string }[] = [
  { value: 'high', label: 'High' },
  { value: 'medium', label: 'Medium' },
  { value: 'low', label: 'Low' },
]

const BOARD_LABELS: Record<BoardSource, string> = {
  linkedin: 'LinkedIn',
  indeed: 'Indeed',
  stepstone: 'StepStone',
  glassdoor: 'Glassdoor',
  xing: 'Xing',
}

export function Popup() {
  const [view, setView] = useState<View>('loading')
  const [scraped, setScraped] = useState<ScrapedJob | null>(null)
  const [email, setEmail] = useState<string | null>(null)
  const [savedJobId, setSavedJobId] = useState<string | null>(null)
  const [saveError, setSaveError] = useState<string | null>(null)
  const [form, setForm] = useState<FormState>({
    company_name: '',
    job_title: '',
    location: '',
    salary: '',
    stage: 'applied',
    priority: 'medium',
  })

  useEffect(() => {
    init()
  }, [])

  async function init() {
    // Token is written to storage by the app-bridge content script
    // which runs on job-funnel-lime.vercel.app whenever the user is logged in.
    const auth = (await chrome.storage.local.get(STORAGE_KEYS.AUTH))[STORAGE_KEYS.AUTH] as StoredAuth | undefined

    if (!auth) {
      setView('not-connected')
      return
    }

    setEmail(auth.email)

    // 2. Get current tab
    const [tab] = await chrome.tabs.query({ active: true, currentWindow: true })
    if (!tab?.id || !tab.url) {
      setView('no-job')
      return
    }

    // 3. Check if already saved
    const savedResult = await chrome.storage.local.get(STORAGE_KEYS.SAVED_JOBS)
    const saved = (savedResult[STORAGE_KEYS.SAVED_JOBS] ?? {}) as Record<string, string>
    const canonical = tab.url.split('?')[0]
    if (saved[canonical]) {
      setSavedJobId(saved[canonical])
      setView('already-saved')
      return
    }

    // 4. Ask content script for scraped job
    try {
      const response = await chrome.tabs.sendMessage(tab.id, { type: 'GET_SCRAPED_JOB' } satisfies ExtMessage)
      const msg = response as ExtMessage

      if (msg.type === 'SCRAPED_JOB' && msg.payload) {
        const job = msg.payload
        setScraped(job)
        setForm({
          company_name: job.company_name,
          job_title: job.job_title,
          location: job.location ?? '',
          salary: formatSalary(job),
          stage: 'applied',
          priority: 'medium',
        })
        setView('form')
      } else {
        setView('no-job')
      }
    } catch {
      // Content script not available on this page
      setView('no-job')
    }
  }

  async function handleSave() {
    if (!scraped) return
    setView('saving')

    const payload = {
      ...scraped,
      stage: form.stage,
      priority: form.priority,
      company_name: form.company_name,
      job_title: form.job_title,
      location: form.location || null,
    }

    const response = await chrome.runtime.sendMessage({
      type: 'SAVE_JOB',
      payload,
    } satisfies ExtMessage) as ExtMessage

    if (response.type === 'SAVE_JOB_SUCCESS') {
      setSavedJobId(response.jobId)
      setView('success')
    } else if (response.type === 'SAVE_JOB_ERROR') {
      if (response.error === 'FREE_TIER_LIMIT') {
        setView('free-limit')
      } else {
        setSaveError('Something went wrong. Please try again.')
        setView('form')
      }
    }
  }

  function openPipeline() {
    chrome.tabs.create({ url: `${API_BASE}/pipeline` })
    window.close()
  }

  function openLogin() {
    chrome.tabs.create({ url: `${API_BASE}/login` })
    window.close()
  }

  function openUpgrade() {
    chrome.tabs.create({ url: `${API_BASE}/settings?tab=billing` })
    window.close()
  }

  return (
    <div className="popup-root">
      {/* Header — always shown */}
      <header className="popup-header">
        <div className="popup-logo">
          <span className="logo-mark">JF</span>
          <span className="logo-text">JobFunnel</span>
        </div>
        {email && (
          <div className="header-meta">
            <span className="connected-dot" />
            <span className="connected-email">{email}</span>
          </div>
        )}
      </header>

      {/* Views */}
      {view === 'loading' && (
        <div className="view-center">
          <div className="spinner" />
        </div>
      )}

      {view === 'not-connected' && (
        <div className="view-center">
          <div className="view-icon">🔗</div>
          <h2 className="view-title">Connect JobFunnel</h2>
          <p className="view-body">Open JobFunnel and sign in — the extension will connect automatically once you're logged in.</p>
          <button className="btn-primary" onClick={openLogin}>Open JobFunnel →</button>
          <p className="view-hint">After signing in, click this icon again</p>
        </div>
      )}

      {view === 'no-job' && (
        <div className="view-center">
          <div className="view-icon">📋</div>
          <h2 className="view-title">No job detected</h2>
          <p className="view-body">Navigate to a job detail page on LinkedIn, Indeed, StepStone, Glassdoor, or Xing to save it.</p>
          <button className="btn-secondary" onClick={openPipeline}>View my Pipeline →</button>
        </div>
      )}

      {view === 'already-saved' && (
        <div className="view-center">
          <div className="view-icon" style={{ background: 'rgba(37,99,235,0.08)' }}>📌</div>
          <h2 className="view-title">Already in your Pipeline</h2>
          <p className="view-body">You saved this job previously. View it in your pipeline to check the current stage.</p>
          <button className="btn-primary" onClick={openPipeline}>View in Pipeline →</button>
        </div>
      )}

      {view === 'form' && scraped && (
        <>
          {saveError && (
            <div className="form-error-bar">
              <span>{saveError}</span>
              <button className="form-error-dismiss" onClick={() => setSaveError(null)}>✕</button>
            </div>
          )}
          <div className="board-bar">
            <span className="board-chip">{BOARD_LABELS[scraped.source] ?? scraped.source}</span>
            <span className="board-url">{new URL(scraped.job_url).hostname.replace('www.', '')}</span>
          </div>

          <div className="form-body">
            <div className="form-field">
              <label className="form-label">Company *</label>
              <input
                className="form-input"
                value={form.company_name}
                onChange={e => setForm(f => ({ ...f, company_name: e.target.value }))}
                maxLength={100}
              />
            </div>

            <div className="form-field">
              <label className="form-label">Job Title *</label>
              <input
                className="form-input"
                value={form.job_title}
                onChange={e => setForm(f => ({ ...f, job_title: e.target.value }))}
                maxLength={100}
              />
            </div>

            <div className="form-row">
              <div className="form-field">
                <label className="form-label">Location</label>
                <input
                  className="form-input"
                  value={form.location}
                  onChange={e => setForm(f => ({ ...f, location: e.target.value }))}
                  placeholder="e.g. Amsterdam"
                />
              </div>
              <div className="form-field">
                <label className="form-label">Stage</label>
                <select
                  className="form-select"
                  value={form.stage}
                  onChange={e => setForm(f => ({ ...f, stage: e.target.value as Stage }))}
                >
                  {STAGE_OPTIONS.map(o => (
                    <option key={o.value} value={o.value}>{o.label}</option>
                  ))}
                </select>
              </div>
            </div>

            <div className="form-row">
              <div className="form-field">
                <label className="form-label">Salary (optional)</label>
                <input
                  className="form-input"
                  value={form.salary}
                  onChange={e => setForm(f => ({ ...f, salary: e.target.value }))}
                  placeholder="€90k – €115k"
                />
              </div>
              <div className="form-field">
                <label className="form-label">Priority</label>
                <select
                  className="form-select"
                  value={form.priority}
                  onChange={e => setForm(f => ({ ...f, priority: e.target.value as Priority }))}
                >
                  {PRIORITY_OPTIONS.map(o => (
                    <option key={o.value} value={o.value}>{o.label}</option>
                  ))}
                </select>
              </div>
            </div>

            {scraped.job_description && (
              <div className="desc-note">
                <span>📎</span>
                <span>Job description saved automatically.</span>
              </div>
            )}
          </div>

          <div className="form-footer">
            <button
              className="btn-primary"
              onClick={handleSave}
              disabled={!form.company_name.trim() || !form.job_title.trim()}
            >
              Save to Pipeline
            </button>
          </div>
        </>
      )}

      {view === 'saving' && (
        <div className="view-center">
          <div className="spinner" />
          <p className="view-body">Saving to your pipeline…</p>
        </div>
      )}

      {view === 'success' && (
        <div className="view-center">
          <div className="success-ring">✓</div>
          <h2 className="view-title">Saved to Pipeline</h2>
          <p className="view-body">{form.job_title} · {form.company_name}</p>
          <div className="stage-pill">
            <span className="stage-dot" />
            {STAGE_OPTIONS.find(o => o.value === form.stage)?.label}
          </div>
          <div className="success-actions">
            <button className="btn-ghost" onClick={() => window.close()}>Close</button>
            <button className="btn-primary" onClick={openPipeline}>View in Pipeline →</button>
          </div>
        </div>
      )}

      {view === 'free-limit' && (
        <div className="view-center">
          <div className="view-icon">🚀</div>
          <h2 className="view-title">You're tracking 5 applications</h2>
          <p className="view-body">Upgrade to Pro for unlimited pipeline tracking and full funnel analytics.</p>
          <button className="btn-primary" onClick={openUpgrade}>Start Pro — €15/month</button>
          <button className="btn-ghost" style={{ marginTop: 6 }} onClick={() => window.close()}>Not now</button>
        </div>
      )}
    </div>
  )
}

function formatSalary(job: ScrapedJob): string {
  if (!job.salary_min && !job.salary_max) return ''
  const sym = job.salary_currency === 'EUR' ? '€' : job.salary_currency === 'GBP' ? '£' : '$'
  const fmt = (n: number) => n >= 1000 ? `${sym}${Math.round(n / 1000)}k` : `${sym}${n}`
  if (job.salary_min && job.salary_max) return `${fmt(job.salary_min)} – ${fmt(job.salary_max)}`
  return fmt(job.salary_min ?? job.salary_max ?? 0)
}
