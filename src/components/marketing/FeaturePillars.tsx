const pillars = [
  {
    badges: [{ label: 'Pro', color: '#2563EB' }],
    accentColor: '#2563EB',
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
        <path d="M22 12h-4l-3 9L9 3l-3 9H2"/>
      </svg>
    ),
    headline: 'Know your numbers. Fix the right thing.',
    body: 'Stage-by-stage conversion rates, time-in-stage analysis, and benchmarks against EU market data. You see exactly which stage is killing your search — not just a total count.',
  },
  {
    badges: [{ label: 'Pro', color: '#8B5CF6' }],
    accentColor: '#8B5CF6',
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
        <rect x="5" y="2" width="14" height="20" rx="2"/>
        <line x1="9" y1="7" x2="15" y2="7"/>
        <line x1="9" y1="11" x2="13" y2="11"/>
      </svg>
    ),
    headline: 'Build a story bank that compounds.',
    body: 'Store your interview answers in STAR format, tagged by competency. Write once, refine after every interview, reuse forever. Walk into every call with the right story ready — not a blank.',
  },
  {
    badges: [{ label: 'Pro', color: '#6B7280' }, { label: 'Unique', color: '#10B981' }],
    accentColor: '#10B981',
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
        <line x1="18" y1="20" x2="18" y2="10"/>
        <line x1="12" y1="20" x2="12" y2="4"/>
        <line x1="6"  y1="20" x2="6"  y2="14"/>
        <line x1="3"  y1="20" x2="21" y2="20"/>
      </svg>
    ),
    headline: 'Find out which CV actually gets responses.',
    body: 'Tag applications with a CV version and track outcomes per version. See which CV gets more screening calls. The only job search tool that lets you run a proper experiment on your own application.',
  },
]

export function FeaturePillars() {
  return (
    <section id="features" className="bg-white py-20 sm:py-28">
      <div className="max-w-6xl mx-auto px-5 sm:px-8">

        {/* Header — centered, large display size */}
        <div className="mb-16 text-center">
          <h2
            className="text-5xl sm:text-6xl font-black text-[#0F172A] leading-tight"
            style={{ letterSpacing: '-0.03em' }}
          >
            Three tools. One system.
            <br />
            Zero guessing.
          </h2>
        </div>

        {/* Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {pillars.map((pillar) => (
            <div
              key={pillar.headline}
              className="relative rounded-2xl bg-white border border-[#E2E8F0] shadow-sm overflow-hidden flex flex-col"
            >
              {/* Colored top accent bar */}
              <div
                className="h-1 w-full"
                style={{ background: pillar.accentColor }}
              />

              <div className="p-7 flex flex-col flex-1">
                {/* Icon */}
                <div
                  className="w-12 h-12 rounded-xl flex items-center justify-center mb-6"
                  style={{
                    background: `${pillar.accentColor}14`,
                    color: pillar.accentColor,
                  }}
                >
                  {pillar.icon}
                </div>

                {/* Badges */}
                <div className="flex items-center gap-2 mb-5">
                  {pillar.badges.map((badge) => (
                    <span
                      key={badge.label}
                      className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border"
                      style={{
                        fontFamily: 'var(--font-dm-mono)',
                        color: badge.color,
                        borderColor: `${badge.color}35`,
                        background: `${badge.color}0a`,
                      }}
                    >
                      {badge.label}
                    </span>
                  ))}
                </div>

                <h3
                  className="text-xl font-bold text-[#0F172A] leading-snug mb-3"
                  style={{ letterSpacing: '-0.02em' }}
                >
                  {pillar.headline}
                </h3>

                <p className="text-sm text-[#64748B] leading-relaxed">{pillar.body}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
