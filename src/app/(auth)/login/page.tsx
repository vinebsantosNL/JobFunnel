import { AuthShell } from '@/components/auth/AuthShell'
import { MagicLinkForm } from '@/components/auth/MagicLinkForm'

const funnelRows = [
  { label: 'Applied',      pct: 100, color: '#2563EB', rate: '42',  rateColor: 'rgba(255,255,255,0.25)' },
  { label: 'Screening',    pct: 19,  color: '#8B5CF6', rate: '19%', rateColor: '#10B981' },
  { label: 'Interviewing', pct: 10,  color: '#F59E0B', rate: '50%', rateColor: '#F59E0B' },
  { label: 'Offer',        pct: 2,   color: '#10B981', rate: '25%', rateColor: '#10B981' },
]

function LoginLeftContent() {
  return (
    <>
      {/* Headline */}
      <h2 className="jf-display-lg text-white mb-4">
        Your funnel waits.<br />
        <span style={{ color: 'rgba(255,255,255,0.38)', fontWeight: 300 }}>
          Right where you left it.
        </span>
      </h2>

      <p className="text-sm mb-10" style={{ color: 'rgba(255,255,255,0.45)', lineHeight: 1.7, maxWidth: '300px' }}>
        Every application, every rate, every story — exactly as you left them.
      </p>

      {/* Mini funnel card */}
      <div
        className="rounded-xl p-5 mb-8"
        style={{
          background: 'rgba(255,255,255,0.04)',
          border: '1px solid rgba(255,255,255,0.08)',
        }}
      >
        <p
          className="text-xs mb-4 uppercase"
          style={{
            fontFamily: 'var(--font-dm-mono)',
            letterSpacing: '0.1em',
            color: 'rgba(255,255,255,0.2)',
          }}
        >
          Your pipeline · last session
        </p>

        <div className="space-y-3">
          {funnelRows.map((row) => (
            <div key={row.label}>
              <div className="flex items-center justify-between mb-1.5">
                <span
                  className="text-xs uppercase"
                  style={{
                    fontFamily: 'var(--font-dm-mono)',
                    letterSpacing: '0.06em',
                    color: 'rgba(255,255,255,0.3)',
                  }}
                >
                  {row.label}
                </span>
                <span
                  className="text-xs"
                  style={{ fontFamily: 'var(--font-dm-mono)', color: row.rateColor }}
                >
                  {row.rate}
                </span>
              </div>
              <div
                className="w-full h-1.5 rounded-full overflow-hidden"
                style={{ background: 'rgba(255,255,255,0.06)' }}
              >
                <div
                  className="h-full rounded-full"
                  style={{
                    width: `${row.pct}%`,
                    background: row.color,
                    minWidth: row.pct < 5 ? '8px' : undefined,
                  }}
                />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Trust badges */}
      <div className="flex flex-wrap gap-2">
        {['GDPR-compliant', 'Built in Europe', 'No password, ever'].map((badge) => (
          <span
            key={badge}
            className="inline-flex items-center gap-1.5 rounded-md px-2.5 py-1 text-xs"
            style={{
              fontFamily: 'var(--font-dm-mono)',
              color: 'rgba(255,255,255,0.35)',
              background: 'rgba(255,255,255,0.05)',
              border: '1px solid rgba(255,255,255,0.08)',
              letterSpacing: '0.02em',
            }}
          >
            <span
              className="w-1.5 h-1.5 rounded-full flex-shrink-0"
              style={{ background: 'var(--jf-success)', opacity: 0.7 }}
            />
            {badge}
          </span>
        ))}
      </div>
    </>
  )
}

interface LoginPageProps {
  searchParams: Promise<{ error?: string }>
}

export default async function LoginPage({ searchParams }: LoginPageProps) {
  const params = await searchParams
  const authError = params.error === 'auth_error'
    ? 'The magic link has expired or is invalid. Please request a new one.'
    : null

  return (
    <AuthShell leftContent={<LoginLeftContent />}>
      <MagicLinkForm
        mode="login"
        headline="Welcome back."
        sub="Enter your email — we'll send you a secure link. No password needed."
        ctaText="Send magic link"
        bottomText="New to Job Funnel?"
        bottomLinkText="Create a free account →"
        bottomHref="/signup"
        initialError={authError}
      />
    </AuthShell>
  )
}
