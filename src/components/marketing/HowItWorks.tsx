import { RevealWrapper } from './RevealWrapper'

const steps = [
  {
    number: '01',
    headline: 'Build your pipeline',
    body: 'Add applications in seconds. Seven stages from Saved to Offer. Drag to move. Full visibility of every company, every stage — in one place.',
  },
  {
    number: '02',
    headline: 'Read your funnel',
    body: 'Conversion rates update automatically as you move applications. See exactly where they stall. Compare your rates against EU benchmarks for your role type.',
  },
  {
    number: '03',
    headline: 'Prepare smarter',
    body: 'Write STAR stories as you go. A/B test your CV versions. Walk into every interview with data — not hope.',
  },
]

export function HowItWorks() {
  return (
    <section className="bg-[#F8FAFC] py-20 sm:py-28 border-t border-[#E2E8F0]">
      <div className="max-w-6xl mx-auto px-5 sm:px-8">

        {/* Header with eyebrow + flanking lines */}
        <RevealWrapper className="mb-16 text-center">
          <div className="flex items-center gap-3 justify-center mb-5">
            <div className="flex-1 max-w-[80px] h-px bg-[#E2E8F0]" />
            <span
              className="text-xs font-medium text-[#94A3B8] uppercase flex-shrink-0"
              style={{ fontFamily: 'var(--font-dm-mono)', letterSpacing: '0.14em' }}
            >
              How it works
            </span>
            <div className="flex-1 max-w-[80px] h-px bg-[#E2E8F0]" />
          </div>
          <h2
            className="text-4xl sm:text-5xl font-black text-[#0F172A] leading-tight"
            style={{ letterSpacing: '-0.03em' }}
          >
            From chaos to clarity<br />in three steps.
          </h2>
        </RevealWrapper>

        {/* Steps */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-12 md:gap-8 relative">

          {/* Gradient connector line (desktop) */}
          <div
            className="hidden md:block absolute top-8 left-[calc(16.67%+2rem)] right-[calc(16.67%+2rem)] h-px pointer-events-none"
            style={{
              background: 'linear-gradient(to right, #E2E8F0 0%, #10B981 50%, #E2E8F0 100%)',
            }}
            aria-hidden="true"
          />

          {steps.map((step, i) => (
            <RevealWrapper key={step.number} delay={i * 120}>

              {/* Step bubble */}
              <div
                className="w-16 h-16 rounded-full bg-white flex items-center justify-center mb-7 relative z-10"
                style={{
                  border: '1px solid #E2E8F0',
                  boxShadow: '0 0 0 6px rgba(16,185,129,0.06), 0 2px 10px rgba(0,0,0,0.06)',
                }}
              >
                <span
                  className="text-sm font-bold"
                  style={{
                    fontFamily: 'var(--font-dm-mono)',
                    color: '#10B981',
                    letterSpacing: '0.02em',
                  }}
                >
                  {step.number}
                </span>
              </div>

              <h3
                className="text-xl font-semibold text-[#0F172A] mb-3"
                style={{ letterSpacing: '-0.01em' }}
              >
                {step.headline}
              </h3>

              <p className="text-sm text-[#64748B] leading-relaxed">{step.body}</p>

            </RevealWrapper>
          ))}
        </div>

      </div>
    </section>
  )
}
