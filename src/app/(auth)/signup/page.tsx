import { AuthShell } from '@/components/auth/AuthShell'
import { MagicLinkForm } from '@/components/auth/MagicLinkForm'

function SignupLeftContent() {
  return (
    <>
      {/* Eyebrow */}
      <div
        className="flex items-center gap-2 mb-6"
        style={{
          fontFamily: 'var(--font-dm-mono)',
          fontSize: '11px',
          letterSpacing: '0.12em',
          color: 'var(--jf-success)',
          textTransform: 'uppercase',
        }}
      >
        <span className="w-5 h-px" style={{ background: 'var(--jf-success)' }} />
        Job search analytics · Built for Europe
      </div>

      {/* Headline mirrors hero */}
      <h2 className="jf-display-lg text-white mb-8">
        47 applications.<br />
        <span style={{ color: 'var(--jf-error)' }}>3</span> screening calls.<br />
        <span style={{ color: 'rgba(255,255,255,0.38)', fontWeight: 300, fontSize: '0.78em' }}>
          You still don&apos;t know why.
        </span>
      </h2>

      {/* Value prop bullets */}
      <div className="space-y-3 mb-10">
        {[
          { icon: '▸', text: 'Stage-by-stage conversion rates vs EU benchmarks' },
          { icon: '▸', text: 'Interview story vault in STAR format' },
          { icon: '▸', text: 'A/B test CV versions · see what gets responses' },
        ].map((item) => (
          <div key={item.text} className="flex items-start gap-3">
            <span
              className="flex-shrink-0 mt-0.5"
              style={{ color: 'var(--jf-success)', fontFamily: 'var(--font-dm-mono)', fontSize: '11px' }}
            >
              {item.icon}
            </span>
            <span className="text-sm" style={{ color: 'rgba(255,255,255,0.5)', lineHeight: 1.6 }}>
              {item.text}
            </span>
          </div>
        ))}
      </div>

      {/* Pricing nudge */}
      <div
        className="rounded-xl p-4"
        style={{
          background: 'rgba(16,185,129,0.06)',
          border: '1px solid rgba(16,185,129,0.15)',
        }}
      >
        <p
          className="text-xs mb-1"
          style={{
            fontFamily: 'var(--font-dm-mono)',
            color: 'var(--jf-success)',
            letterSpacing: '0.06em',
          }}
        >
          Free to start
        </p>
        <p className="text-sm" style={{ color: 'rgba(255,255,255,0.5)', lineHeight: 1.6 }}>
          5 applications free. Pro unlocks unlimited pipeline, full analytics, and CV testing — €15/month.
        </p>
      </div>
    </>
  )
}

export default function SignupPage() {
  return (
    <AuthShell leftContent={<SignupLeftContent />}>
      <MagicLinkForm
        mode="signup"
        headline="Start your funnel."
        sub="Enter your email — we'll send you a secure link to create your account. No password needed."
        ctaText="Create free account"
        bottomText="Already have an account?"
        bottomLinkText="Log in →"
        bottomHref="/login"
      />
    </AuthShell>
  )
}
