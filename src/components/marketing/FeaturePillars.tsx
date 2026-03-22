const pillars = [
  {
    badge: 'Pro',
    badgeColor: '#8B5CF6',
    icon: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
        <path d="M22 12h-4l-3 9L9 3l-3 9H2"/>
      </svg>
    ),
    headline: 'Know your numbers. Fix the right thing.',
    body: 'Stage-by-stage conversion rates, time-in-stage analysis, and benchmarks against EU market data. You see exactly which stage is killing your search — Applied→Screening, Screening→Interviewing — not just a total count.',
    accentColor: '#8B5CF6',
  },
  {
    badge: 'Pro',
    badgeColor: '#2563EB',
    icon: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
        <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"/>
        <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"/>
        <line x1="9" y1="9" x2="15" y2="9"/>
        <line x1="9" y1="13" x2="13" y2="13"/>
      </svg>
    ),
    headline: 'Build a story bank that compounds.',
    body: 'Store your interview answers in STAR format, tagged by competency. Write once, refine after every interview, reuse forever. Walk into every call with the right story ready — not a blank.',
    accentColor: '#2563EB',
  },
  {
    badge: 'Pro · Unique',
    badgeColor: '#10B981',
    icon: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
        <rect x="3" y="3" width="7" height="7"/>
        <rect x="14" y="3" width="7" height="7"/>
        <rect x="14" y="14" width="7" height="7"/>
        <rect x="3" y="14" width="7" height="7"/>
        <line x1="10" y1="7" x2="14" y2="7"/>
        <line x1="10" y1="17" x2="14" y2="17"/>
      </svg>
    ),
    headline: 'Find out which CV actually gets responses.',
    body: 'Tag applications with a CV version and track outcomes per version. See which CV gets more screening calls. The only job search tool that lets you run a proper experiment on your own application.',
    accentColor: '#10B981',
  },
]

export function FeaturePillars() {
  return (
    <section id="features" className="bg-white py-20 sm:py-28">
      <div className="max-w-6xl mx-auto px-5 sm:px-8">
        {/* Header */}
        <div className="mb-14 max-w-xl">
          <p
            className="text-xs font-medium text-[#64748B] uppercase tracking-widest mb-4"
            style={{ fontFamily: 'var(--font-dm-mono)', letterSpacing: '0.1em' }}
          >
            Three pillars
          </p>
          <h2
            className="text-3xl sm:text-4xl font-bold text-[#0F172A] leading-tight"
            style={{ letterSpacing: '-0.02em' }}
          >
            Three tools. One system. Zero guessing.
          </h2>
        </div>

        {/* Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {pillars.map((pillar) => (
            <div
              key={pillar.headline}
              className="group rounded-2xl p-7 border border-[#E2E8F0] hover:border-transparent hover:shadow-xl transition-all duration-300"
              style={{
                ['--accent' as string]: pillar.accentColor,
              }}
            >
              {/* Icon */}
              <div
                className="w-11 h-11 rounded-xl flex items-center justify-center mb-5"
                style={{
                  background: `${pillar.accentColor}15`,
                  color: pillar.accentColor,
                }}
              >
                {pillar.icon}
              </div>

              {/* Badge */}
              <span
                className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium mb-4"
                style={{
                  fontFamily: 'var(--font-dm-mono)',
                  background: `${pillar.badgeColor}12`,
                  color: pillar.badgeColor,
                  border: `1px solid ${pillar.badgeColor}25`,
                }}
              >
                {pillar.badge}
              </span>

              <h3
                className="text-lg font-semibold text-[#0F172A] leading-snug mb-3"
                style={{ letterSpacing: '-0.01em' }}
              >
                {pillar.headline}
              </h3>

              <p className="text-sm text-[#64748B] leading-relaxed">{pillar.body}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
