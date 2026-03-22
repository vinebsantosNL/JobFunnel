import Link from 'next/link'

export function HeroSection() {
  return (
    <section className="relative min-h-screen flex items-center bg-[#0C1A17] marketing-grid-bg overflow-hidden">
      {/* Radial glow behind funnel */}
      <div
        className="absolute right-0 top-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full pointer-events-none"
        style={{
          background:
            'radial-gradient(ellipse at center, rgba(16,185,129,0.08) 0%, transparent 70%)',
        }}
      />

      <div className="relative max-w-6xl mx-auto px-5 sm:px-8 pt-28 pb-20 w-full">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">

          {/* Left — text */}
          <div>
            <div className="fade-in-up-1">
              <span
                className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-medium mb-8"
                style={{
                  background: 'rgba(16,185,129,0.12)',
                  color: '#10B981',
                  border: '1px solid rgba(16,185,129,0.25)',
                  fontFamily: 'var(--font-dm-mono)',
                  letterSpacing: '0.04em',
                }}
              >
                <span
                  className="w-1.5 h-1.5 rounded-full bg-[#10B981] animate-pulse"
                />
                Beta · DACH + Benelux
              </span>
            </div>

            <h1
              className="text-5xl sm:text-6xl lg:text-7xl font-black leading-[0.95] tracking-tight text-white fade-in-up-2"
              style={{ fontFamily: 'var(--font-sans)' }}
            >
              47 applications.
              <br />
              <span className="text-[#EF4444]">3 screening</span>
              <br />
              calls.
              <br />
              <span
                className="text-white/40 text-4xl sm:text-5xl font-bold"
                style={{ letterSpacing: '-0.01em' }}
              >
                You still don&apos;t know why.
              </span>
            </h1>

            <p className="mt-8 text-lg text-white/60 leading-relaxed max-w-md fade-in-up-3">
              Job Funnel shows you exactly where your job search breaks down —
              and what to do about it.
            </p>

            <div className="mt-10 flex flex-col sm:flex-row gap-3 fade-in-up-4">
              <Link
                href="/signup"
                className="inline-flex items-center justify-center px-6 py-3.5 rounded-lg bg-[#2563EB] text-white text-sm font-semibold hover:bg-[#1D4ED8] transition-colors min-h-[48px]"
              >
                Start free — no credit card
              </Link>
              <a
                href="#features"
                className="inline-flex items-center justify-center px-6 py-3.5 rounded-lg text-white/60 text-sm font-medium hover:text-white transition-colors min-h-[48px] gap-2"
              >
                See how it works
                <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                  <path d="M8 3v10M3 8l5 5 5-5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </a>
            </div>

            <p
              className="mt-6 text-xs text-white/30 fade-in-up-4"
              style={{ fontFamily: 'var(--font-dm-mono)', letterSpacing: '0.02em' }}
            >
              Built for DACH + Benelux · Works across the EU · GDPR-compliant
            </p>
          </div>

          {/* Right — funnel visualisation */}
          <div className="flex justify-center lg:justify-end fade-in-up-3">
            <FunnelChart />
          </div>
        </div>
      </div>

      {/* Scroll chevron */}
      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-1 text-white/20 animate-bounce">
        <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
          <path d="M5 7.5l5 5 5-5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
      </div>
    </section>
  )
}

function FunnelChart() {
  const stages = [
    { label: 'Applied',      count: 47, color: '#2563EB', pct: 100 },
    { label: 'Screening',    count: 8,  color: '#EF4444', pct: 17,  gap: true },
    { label: 'Interviewing', count: 3,  color: '#F59E0B', pct: 6 },
    { label: 'Offer',        count: 1,  color: '#10B981', pct: 2 },
  ]

  return (
    <div
      className="w-full max-w-sm rounded-2xl p-6"
      style={{
        background: 'rgba(255,255,255,0.04)',
        border: '1px solid rgba(255,255,255,0.08)',
      }}
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <span
          className="text-xs font-medium text-white/40 uppercase tracking-widest"
          style={{ fontFamily: 'var(--font-dm-mono)' }}
        >
          Your Funnel
        </span>
        <span
          className="text-xs px-2 py-1 rounded-full"
          style={{
            background: 'rgba(239,68,68,0.12)',
            color: '#EF4444',
            fontFamily: 'var(--font-dm-mono)',
          }}
        >
          6% screening rate
        </span>
      </div>

      {/* Bars */}
      <div className="space-y-3">
        {stages.map((stage, i) => (
          <div key={stage.label}>
            {/* Gap indicator */}
            {stage.gap && (
              <div className="flex items-center gap-2 my-4">
                <div className="flex-1 border-t border-dashed border-[#EF4444]/40" />
                <span
                  className="text-xs text-[#EF4444]/70 whitespace-nowrap"
                  style={{ fontFamily: 'var(--font-dm-mono)' }}
                >
                  ↓ 83% drop-off
                </span>
                <div className="flex-1 border-t border-dashed border-[#EF4444]/40" />
              </div>
            )}

            <div className="flex items-center gap-3">
              {/* Label + count */}
              <div className="w-28 flex-shrink-0">
                <div className="text-xs text-white/50">{stage.label}</div>
                <div
                  className="text-xl font-bold text-white leading-tight"
                  style={{ fontFamily: 'var(--font-dm-mono)' }}
                >
                  {stage.count}
                </div>
              </div>

              {/* Bar */}
              <div className="flex-1 h-2.5 rounded-full bg-white/5 overflow-hidden">
                <div
                  className="h-full rounded-full"
                  style={{
                    width: `${stage.pct}%`,
                    background: stage.color,
                    opacity: i === 1 ? 0.85 : 1,
                    animation: `drawBar 0.8s ease ${0.2 + i * 0.15}s both`,
                    ['--bar-width' as string]: `${stage.pct}%`,
                  }}
                />
              </div>

              {/* Pct */}
              <div
                className="w-10 text-right text-xs text-white/30 flex-shrink-0"
                style={{ fontFamily: 'var(--font-dm-mono)' }}
              >
                {stage.pct}%
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Footer insight */}
      <div
        className="mt-6 pt-5 border-t text-xs text-white/40 leading-relaxed"
        style={{ borderColor: 'rgba(255,255,255,0.06)' }}
      >
        EU benchmark for Senior PMs:{' '}
        <span className="text-[#10B981]">18% screening rate</span>.
        <br />
        Your gap is likely at the CV or targeting layer.
      </div>
    </div>
  )
}
