'use client'

import { useState } from 'react'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'

interface MagicLinkFormProps {
  mode: 'login' | 'signup'
  headline: string
  sub: string
  ctaText: string
  bottomText: string
  bottomLinkText: string
  bottomHref: string
  initialError?: string | null
}

export function MagicLinkForm({
  mode,
  headline,
  sub,
  ctaText,
  bottomText,
  bottomLinkText,
  bottomHref,
  initialError = null,
}: MagicLinkFormProps) {
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)
  const [sent, setSent] = useState(false)
  const [error, setError] = useState<string | null>(initialError)
  const [resendStatus, setResendStatus] = useState<'idle' | 'sending' | 'sent'>('idle')

  async function sendLink(emailAddress: string) {
    const supabase = createClient()
    // Always use the current origin so the callback URL matches the host the
    // user is on — staging, preview, or production. Using NEXT_PUBLIC_APP_URL
    // here caused magic links on staging to redirect to the wrong host.
    const appUrl = window.location.origin

    const { error } = await supabase.auth.signInWithOtp({
      email: emailAddress,
      options: {
        emailRedirectTo: `${appUrl}/api/auth/callback`,
        shouldCreateUser: mode === 'signup',
      },
    })
    return error
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    const trimmed = email.trim()
    if (!trimmed) return

    setLoading(true)
    setError(null)

    const err = await sendLink(trimmed)
    if (err) {
      const isNoAccount = err.message.toLowerCase().includes('signups not allowed')
      setError(
        isNoAccount
          ? "No account found with this email. Please sign up first."
          : err.message
      )
    } else {
      setSent(true)
    }
    setLoading(false)
  }

  async function handleResend() {
    setResendStatus('sending')
    const err = await sendLink(email.trim())
    if (err) {
      setResendStatus('idle')
      setError(err.message)
      setSent(false)
    } else {
      setResendStatus('sent')
      setTimeout(() => setResendStatus('idle'), 3000)
    }
  }

  /* ── Confirmation state ─────────────────────────────────── */
  if (sent) {
    return (
      <div className="text-center">
        {/* Envelope icon */}
        <div
          className="w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-6"
          style={{
            background: 'var(--jf-success-tint)',
            border: '1px solid var(--jf-success-border)',
          }}
        >
          <svg
            width="28" height="28" viewBox="0 0 24 24" fill="none"
            style={{ stroke: 'var(--jf-success)' }} strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round"
          >
            <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
            <polyline points="22,6 12,13 2,6" />
          </svg>
        </div>

        <h1 className="jf-display-sm text-[var(--jf-text-primary)] mb-3">
          Check your inbox.
        </h1>

        <p className="text-sm text-[var(--jf-text-muted)] mb-2 leading-relaxed">
          We sent a magic link to
        </p>
        <span
          className="inline-block text-sm text-[var(--jf-text-secondary)] bg-[var(--jf-bg-subtle)] border border-[var(--jf-border)] rounded-lg px-4 py-2 mb-6"
          style={{ fontFamily: 'var(--font-dm-mono, monospace)' }}
        >
          {email}
        </span>

        <p
          className="text-xs text-[var(--jf-border-hover)] mb-8"
          style={{ fontFamily: 'var(--font-dm-mono, monospace)', letterSpacing: '0.02em' }}
        >
          Link expires in 15 minutes · Check spam if needed
        </p>

        <button
          type="button"
          onClick={handleResend}
          disabled={resendStatus !== 'idle'}
          className="w-full h-11 rounded-xl border border-[var(--jf-border)] text-sm font-medium text-[var(--jf-text-secondary)] bg-[var(--jf-bg-card)] hover:bg-[var(--jf-bg-subtle)] hover:border-[var(--jf-border-hover)] transition-colors disabled:opacity-60 mb-4"
        >
          {resendStatus === 'sending' ? 'Sending…' : resendStatus === 'sent' ? 'Sent ✓' : 'Resend link'}
        </button>

        <button
          type="button"
          onClick={() => setSent(false)}
          className="text-sm text-[var(--jf-text-muted)] hover:text-[var(--jf-text-secondary)] transition-colors"
        >
          ← Use a different email
        </button>
      </div>
    )
  }

  /* ── Form state ─────────────────────────────────────────── */
  return (
    <div>
      <h1 className="jf-display-sm text-[var(--jf-text-primary)] mb-2">
        {headline}
      </h1>
      <p className="text-sm text-[var(--jf-text-muted)] leading-relaxed mb-8">{sub}</p>

      <form onSubmit={handleSubmit} noValidate>
        <div className="mb-4">
          <label
            htmlFor="email"
            className="block text-sm font-medium text-[var(--jf-text-secondary)] mb-1.5"
            style={{ letterSpacing: '-0.01em' }}
          >
            {mode === 'login' ? 'Your email' : 'Work or personal email'}
          </label>
          <input
            id="email"
            type="email"
            autoComplete="email"
            autoFocus
            required
            placeholder="you@company.com"
            value={email}
            onChange={(e) => {
              setEmail(e.target.value)
              if (error) setError(null)
            }}
            className="w-full h-12 px-4 rounded-xl border border-[var(--jf-border)] text-[15px] text-[var(--jf-text-primary)] placeholder-[var(--jf-border-hover)] outline-none transition-all bg-[var(--jf-bg-card)]"
            style={{
              boxShadow: error ? 'var(--jf-focus-ring)' : undefined,
              borderColor: error ? 'var(--jf-error)' : undefined,
            }}
            onFocus={(e) => {
              if (!error) e.target.style.boxShadow = 'var(--jf-focus-ring)'
              if (!error) e.target.style.borderColor = 'var(--jf-interactive)'
            }}
            onBlur={(e) => {
              if (!error) e.target.style.boxShadow = ''
              if (!error) e.target.style.borderColor = ''
            }}
          />
          {error && (
            <p className="mt-1.5 text-xs" style={{ color: 'var(--jf-error)' }}>{error}</p>
          )}
        </div>

        <button
          type="submit"
          disabled={loading || !email.trim()}
          className="w-full h-[50px] rounded-xl text-white text-[15px] font-semibold flex items-center justify-center gap-2 transition-all disabled:opacity-60 disabled:cursor-not-allowed"
          style={{
            background: 'var(--jf-interactive)',
            boxShadow: 'var(--jf-cta-shadow)',
            letterSpacing: '-0.01em',
          }}
          onMouseEnter={(e) => { if (!loading) (e.target as HTMLButtonElement).style.background = 'var(--jf-interactive-hover)' }}
          onMouseLeave={(e) => { (e.target as HTMLButtonElement).style.background = 'var(--jf-interactive)' }}
        >
          {loading ? (
            <svg
              className="animate-spin"
              width="18" height="18" viewBox="0 0 24 24" fill="none"
            >
              <circle cx="12" cy="12" r="10" stroke="rgba(255,255,255,0.3)" strokeWidth="3" />
              <path d="M12 2a10 10 0 0 1 10 10" stroke="white" strokeWidth="3" strokeLinecap="round" />
            </svg>
          ) : (
            <>
              {ctaText}
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M3 8h10M9 4l4 4-4 4" />
              </svg>
            </>
          )}
        </button>
      </form>

      {/* Divider */}
      <div className="flex items-center gap-3 my-6">
        <div className="flex-1 h-px bg-[var(--jf-bg-subtle)]" />
        <span className="text-xs text-[var(--jf-border-hover)]">or</span>
        <div className="flex-1 h-px bg-[var(--jf-bg-subtle)]" />
      </div>

      {/* Switch link */}
      <p className="text-center text-sm text-[var(--jf-text-muted)]">
        {bottomText}{' '}
        <Link href={bottomHref} className="text-[var(--jf-interactive)] font-semibold hover:underline">
          {bottomLinkText}
        </Link>
      </p>

      {/* Trust line */}
      <div
        className="flex items-center justify-center gap-2 mt-7 text-[var(--jf-border-hover)] flex-wrap"
        style={{ fontFamily: 'var(--font-dm-mono, monospace)', fontSize: '10px', letterSpacing: '0.06em' }}
      >
        <span>GDPR-compliant</span>
        <span className="w-[3px] h-[3px] rounded-full bg-[var(--jf-border)]" />
        <span>No password, ever</span>
        <span className="w-[3px] h-[3px] rounded-full bg-[var(--jf-border)]" />
        <span>Data stays in the EU</span>
      </div>
    </div>
  )
}
