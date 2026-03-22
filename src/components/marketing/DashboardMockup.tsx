const metricCards = [
  { label: 'Applications',     value: '42',  sub: 'Active pipeline',    color: '#2563EB' },
  { label: 'Screening Rate',   value: '18%', sub: '↑ 6% this month',    color: '#10B981', highlight: true },
  { label: 'Active Interviews',value: '4',   sub: 'In progress',         color: '#F59E0B' },
  { label: 'CV Versions',      value: '2',   sub: 'A/B test running',   color: '#8B5CF6' },
]

const funnelBars = [
  { label: 'Applied',       count: 42, pct: 100, color: '#2563EB', rate: null },
  { label: 'Screening',     count: 8,  pct: 19,  color: '#8B5CF6', rate: '19%' },
  { label: 'Interviewing',  count: 4,  pct: 10,  color: '#F59E0B', rate: '50%' },
  { label: 'Offer',         count: 1,  pct: 2,   color: '#10B981', rate: '25%' },
]

export function DashboardMockup() {
  return (
    <section className="bg-[#0C1A17] marketing-grid-bg py-20 sm:py-28">
      <div className="max-w-6xl mx-auto px-5 sm:px-8">
        {/* Header */}
        <div className="mb-12 max-w-xl">
          <p
            className="text-xs font-medium text-[#10B981]/60 uppercase tracking-widest mb-4"
            style={{ fontFamily: 'var(--font-dm-mono)', letterSpacing: '0.1em' }}
          >
            Product preview
          </p>
          <h2
            className="text-3xl sm:text-4xl font-bold text-white leading-tight"
            style={{ letterSpacing: '-0.02em' }}
          >
            Your search, finally measurable.
          </h2>
          <p className="mt-4 text-base text-white/50">
            This is what clarity looks like. Real data, real conversion rates, real signal.
          </p>
        </div>

        {/* Dashboard shell */}
        <div
          className="rounded-2xl overflow-hidden"
          style={{
            background: 'rgba(255,255,255,0.04)',
            border: '1px solid rgba(255,255,255,0.08)',
          }}
        >
          {/* Window chrome */}
          <div
            className="flex items-center gap-2 px-4 py-3 border-b"
            style={{ borderColor: 'rgba(255,255,255,0.06)', background: 'rgba(0,0,0,0.2)' }}
          >
            <span className="w-3 h-3 rounded-full bg-[#EF4444]/60" />
            <span className="w-3 h-3 rounded-full bg-[#F59E0B]/60" />
            <span className="w-3 h-3 rounded-full bg-[#10B981]/60" />
            <span
              className="ml-4 text-xs text-white/20"
              style={{ fontFamily: 'var(--font-dm-mono)' }}
            >
              jobfunnel.app/analytics
            </span>
          </div>

          <div className="p-5 sm:p-8">
            {/* Metric cards */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-8">
              {metricCards.map((card) => (
                <div
                  key={card.label}
                  className="rounded-xl p-4"
                  style={{
                    background: card.highlight
                      ? 'rgba(16,185,129,0.08)'
                      : 'rgba(255,255,255,0.04)',
                    border: card.highlight
                      ? '1px solid rgba(16,185,129,0.2)'
                      : '1px solid rgba(255,255,255,0.06)',
                  }}
                >
                  <div
                    className="text-2xl font-bold mb-1"
                    style={{
                      fontFamily: 'var(--font-dm-mono)',
                      color: card.color,
                    }}
                  >
                    {card.value}
                  </div>
                  <div className="text-xs font-medium text-white/70 mb-0.5">{card.label}</div>
                  <div
                    className="text-xs"
                    style={{
                      fontFamily: 'var(--font-dm-mono)',
                      color: card.highlight ? '#10B981' : 'rgba(255,255,255,0.3)',
                    }}
                  >
                    {card.sub}
                  </div>
                </div>
              ))}
            </div>

            {/* Funnel chart */}
            <div
              className="rounded-xl p-5 sm:p-6"
              style={{
                background: 'rgba(0,0,0,0.2)',
                border: '1px solid rgba(255,255,255,0.06)',
              }}
            >
              <div className="flex items-center justify-between mb-6">
                <span className="text-sm font-medium text-white/70">Funnel Overview</span>
                <span
                  className="text-xs px-2.5 py-1 rounded-full"
                  style={{
                    background: 'rgba(16,185,129,0.12)',
                    color: '#10B981',
                    border: '1px solid rgba(16,185,129,0.2)',
                    fontFamily: 'var(--font-dm-mono)',
                  }}
                >
                  Screening rate up 6% this month
                </span>
              </div>

              <div className="space-y-4">
                {funnelBars.map((bar, i) => (
                  <div key={bar.label} className="flex items-center gap-4">
                    {/* Label */}
                    <div
                      className="w-24 flex-shrink-0 text-xs text-white/40"
                      style={{ fontFamily: 'var(--font-dm-mono)' }}
                    >
                      {bar.label}
                    </div>

                    {/* Bar track */}
                    <div className="flex-1 h-6 rounded-lg bg-white/5 overflow-hidden relative">
                      <div
                        className="h-full rounded-lg transition-all"
                        style={{
                          width: `${bar.pct}%`,
                          background: bar.color,
                          opacity: 0.85,
                          animation: `drawBar 0.7s ease ${i * 0.12}s both`,
                          ['--bar-width' as string]: `${bar.pct}%`,
                        }}
                      />
                      {/* Count inside bar */}
                      <span
                        className="absolute left-3 top-1/2 -translate-y-1/2 text-xs font-bold text-white/80"
                        style={{ fontFamily: 'var(--font-dm-mono)' }}
                      >
                        {bar.count}
                      </span>
                    </div>

                    {/* Conversion rate */}
                    <div
                      className="w-10 text-right text-xs flex-shrink-0"
                      style={{
                        fontFamily: 'var(--font-dm-mono)',
                        color: bar.rate ? '#10B981' : 'rgba(255,255,255,0.25)',
                      }}
                    >
                      {bar.rate ?? '—'}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
