import Link from 'next/link'
import { RevealWrapper } from './RevealWrapper'

const tiers = [
  {
    name: 'Free',
    price: '€0',
    period: null,
    description: 'Get started. No commitment.',
    features: [
      { text: '5 active applications', included: true },
      { text: 'Kanban pipeline', included: true },
      { text: 'Basic stage tracking', included: true },
      { text: 'No funnel analytics', included: false },
      { text: 'No interview vault', included: false },
      { text: 'No CV versioning', included: false },
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
      { text: 'Unlimited applications', included: true },
      { text: 'Full funnel analytics', included: true },
      { text: 'Conversion rate benchmarks', included: true },
      { text: 'Interview Vault (story bank)', included: true },
      { text: 'CV versioning + A/B testing', included: true },
      { text: 'AI assistance', included: true },
    ],
    cta: 'Start Pro free',
    href: '/signup?plan=pro',
    highlighted: true,
    comingSoon: false,
    note: 'No lock-in.',
  },
  {
    name: 'Team',
    price: '€40',
    priceSup: '+',
    period: '/month',
    description: 'For teams and career coaches.',
    features: [
      { text: 'Everything in Pro', included: true },
      { text: 'Team pipeline benchmarking', included: true },
      { text: 'Coaching integrations', included: true },
      { text: 'Group story reviews', included: true },
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

        {/* Header with eyebrow + flanking lines */}
        <RevealWrapper className="mb-14">
          <div className="flex items-center gap-3 mb-5">
            <div className="flex-1 max-w-[60px] h-px bg-[#E2E8F0]" />
            <span
              className="text-xs font-medium text-[#94A3B8] uppercase flex-shrink-0"
              style={{ fontFamily: 'var(--font-dm-mono)', letterSpacing: '0.14em' }}
            >
              Pricing
            </span>
            <div className="flex-1 max-w-[60px] h-px bg-[#E2E8F0]" />
          </div>
          <h2
            className="text-4xl sm:text-5xl font-black text-[#0F172A] leading-tight mb-3"
            style={{ letterSpacing: '-0.03em' }}
          >
            Less than one hour<br />with a career coach.
          </h2>
          <p className="text-base text-[#64748B] mt-4">
            Most searches complete in 4–6 months. Total Pro cost: €60–90.
          </p>
        </RevealWrapper>

        {/* Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-5 items-start">
          {tiers.map((tier, i) => (
            <RevealWrapper key={tier.name} delay={i * 100}>
              <div
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

                {/* Coming soon badge */}
                {tier.comingSoon && (
                  <span
                    className="self-start mb-4 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium"
                    style={{
                      background: 'rgba(100,116,139,0.1)',
                      color: '#64748B',
                      fontFamily: 'var(--font-dm-mono)',
                      border: '1px solid rgba(100,116,139,0.2)',
                    }}
                  >
                    Coming soon
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
                      tier.highlighted ? 'text-white' : 'text-[#0F172A]',
                    ].join(' ')}
                    style={{
                      fontFamily: 'var(--font-dm-mono)',
                      letterSpacing: '-0.03em',
                      fontSize: 'clamp(42px, 4vw, 56px)',
                    }}
                  >
                    {tier.price}
                    {'priceSup' in tier && tier.priceSup && (
                      <sup
                        className="text-[#10B981]"
                        style={{ fontSize: '0.45em', verticalAlign: 'super' }}
                      >
                        {tier.priceSup}
                      </sup>
                    )}
                  </span>
                  {tier.period && (
                    <span
                      className={[
                        'text-sm mb-2',
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
                    <li key={f.text} className="flex items-start gap-2.5 text-sm">
                      {f.included ? (
                        <svg className="w-4 h-4 mt-0.5 flex-shrink-0" viewBox="0 0 16 16" fill="none">
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
                      ) : (
                        <svg className="w-4 h-4 mt-0.5 flex-shrink-0" viewBox="0 0 16 16" fill="none">
                          <circle cx="8" cy="8" r="7" fill="rgba(148,163,184,0.1)" />
                          <path d="M6 10l4-4M10 10L6 6" stroke="#CBD5E1" strokeWidth="1.5" strokeLinecap="round" />
                        </svg>
                      )}
                      <span
                        className={[
                          tier.highlighted
                            ? (f.included ? 'text-white/75' : 'text-white/30')
                            : (f.included ? 'text-[#475569]' : 'text-[#94A3B8]'),
                        ].join(' ')}
                        style={!f.included ? { textDecoration: 'line-through', textDecorationColor: 'rgba(148,163,184,0.4)' } : undefined}
                      >
                        {f.text}
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
                      ? 'bg-[#E2E8F0] text-[#94A3B8] cursor-default pointer-events-none'
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
            </RevealWrapper>
          ))}
        </div>

        {/* Anchor copy */}
        <RevealWrapper>
          <p className="mt-12 text-center text-sm text-[#94A3B8]">
            At EU tech salaries, one extra week of searching costs more than a full Pro cycle.
          </p>
        </RevealWrapper>

      </div>
    </section>
  )
}
