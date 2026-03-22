import Link from 'next/link'

const tiers = [
  {
    name: 'Free',
    price: '€0',
    period: null,
    description: 'Get started. No commitment.',
    features: [
      '5 active applications',
      'Kanban pipeline',
      'Basic stage tracking',
      'No analytics',
    ],
    cta: 'Get started free',
    href: '/signup',
    highlighted: false,
    comingSoon: false,
  },
  {
    name: 'Pro',
    price: '€15',
    period: '/month',
    description: '14-day free trial. Cancel anytime.',
    badge: 'Most popular',
    features: [
      'Unlimited applications',
      'Full funnel analytics',
      'Conversion rate benchmarks',
      'Interview Vault (story bank)',
      'CV versioning + A/B testing',
      'AI assistance',
    ],
    cta: 'Start Pro free',
    href: '/signup?plan=pro',
    highlighted: true,
    comingSoon: false,
    note: 'No lock-in.',
  },
  {
    name: 'Team',
    price: 'Coming soon',
    period: null,
    description: 'For teams and career coaches.',
    features: [
      'Everything in Pro',
      'Team pipeline benchmarking',
      'Coaching integrations',
      'Group story reviews',
    ],
    cta: 'Join waitlist',
    href: '/signup?waitlist=team',
    highlighted: false,
    comingSoon: true,
  },
]

export function PricingSection() {
  return (
    <section id="pricing" className="bg-white py-20 sm:py-28 border-t border-[#E2E8F0]">
      <div className="max-w-6xl mx-auto px-5 sm:px-8">
        {/* Header */}
        <div className="mb-14 max-w-xl">
          <p
            className="text-xs font-medium text-[#64748B] uppercase tracking-widest mb-4"
            style={{ fontFamily: 'var(--font-dm-mono)', letterSpacing: '0.1em' }}
          >
            Pricing
          </p>
          <h2
            className="text-3xl sm:text-4xl font-bold text-[#0F172A] leading-tight mb-3"
            style={{ letterSpacing: '-0.02em' }}
          >
            Less than one hour with a career coach.
          </h2>
          <p className="text-base text-[#64748B]">
            Most searches complete in 4–6 months. Total Pro cost: €60–90.
          </p>
        </div>

        {/* Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-5 items-start">
          {tiers.map((tier) => (
            <div
              key={tier.name}
              className={[
                'rounded-2xl p-7 flex flex-col',
                tier.highlighted
                  ? 'bg-[#0C1A17] ring-2 ring-[#10B981]/40 shadow-2xl'
                  : 'bg-[#F8FAFC] border border-[#E2E8F0]',
                tier.comingSoon ? 'opacity-70' : '',
              ].join(' ')}
            >
              {/* Badge */}
              {tier.badge && (
                <span
                  className="self-start mb-4 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium"
                  style={{
                    background: 'rgba(16,185,129,0.15)',
                    color: '#10B981',
                    fontFamily: 'var(--font-dm-mono)',
                    border: '1px solid rgba(16,185,129,0.3)',
                  }}
                >
                  {tier.badge}
                </span>
              )}

              <div className="mb-1">
                <span
                  className={[
                    'text-sm font-semibold',
                    tier.highlighted ? 'text-white/60' : 'text-[#64748B]',
                  ].join(' ')}
                >
                  {tier.name}
                </span>
              </div>

              {/* Price */}
              <div className="flex items-end gap-1 mb-1">
                <span
                  className={[
                    'font-black leading-none',
                    tier.comingSoon ? 'text-2xl' : 'text-4xl',
                    tier.highlighted ? 'text-white' : 'text-[#0F172A]',
                  ].join(' ')}
                  style={{ fontFamily: 'var(--font-dm-mono)', letterSpacing: '-0.03em' }}
                >
                  {tier.price}
                </span>
                {tier.period && (
                  <span
                    className={[
                      'text-sm mb-1',
                      tier.highlighted ? 'text-white/40' : 'text-[#94A3B8]',
                    ].join(' ')}
                  >
                    {tier.period}
                  </span>
                )}
              </div>

              <p
                className={[
                  'text-xs mb-6',
                  tier.highlighted ? 'text-white/40' : 'text-[#94A3B8]',
                ].join(' ')}
              >
                {tier.description}
              </p>

              {/* Features */}
              <ul className="space-y-2.5 mb-8 flex-1">
                {tier.features.map((f) => (
                  <li key={f} className="flex items-start gap-2.5 text-sm">
                    <svg
                      className="w-4 h-4 mt-0.5 flex-shrink-0"
                      viewBox="0 0 16 16"
                      fill="none"
                    >
                      <circle
                        cx="8" cy="8" r="7"
                        fill={tier.highlighted ? 'rgba(16,185,129,0.15)' : 'rgba(37,99,235,0.1)'}
                      />
                      <path
                        d="M5 8l2 2 4-4"
                        stroke={tier.highlighted ? '#10B981' : '#2563EB'}
                        strokeWidth="1.5"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                    <span className={tier.highlighted ? 'text-white/75' : 'text-[#475569]'}>
                      {f}
                    </span>
                  </li>
                ))}
              </ul>

              {/* CTA */}
              <Link
                href={tier.href}
                className={[
                  'w-full min-h-[44px] flex items-center justify-center rounded-xl text-sm font-semibold transition-colors',
                  tier.highlighted
                    ? 'bg-[#2563EB] text-white hover:bg-[#1D4ED8]'
                    : tier.comingSoon
                    ? 'bg-[#E2E8F0] text-[#94A3B8] cursor-default'
                    : 'bg-[#0F172A] text-white hover:bg-[#1E293B]',
                ].join(' ')}
              >
                {tier.cta}
              </Link>

              {tier.note && (
                <p
                  className="mt-3 text-center text-xs text-white/30"
                  style={{ fontFamily: 'var(--font-dm-mono)' }}
                >
                  {tier.note}
                </p>
              )}
            </div>
          ))}
        </div>

        {/* Anchor copy */}
        <p className="mt-10 text-center text-sm text-[#94A3B8]">
          At EU tech salaries, one extra week of searching costs more than a full Pro cycle.
        </p>
      </div>
    </section>
  )
}
