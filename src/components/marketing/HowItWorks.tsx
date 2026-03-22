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
        {/* Header */}
        <div className="mb-16 max-w-xl">
          <p
            className="text-xs font-medium text-[#64748B] uppercase tracking-widest mb-4"
            style={{ fontFamily: 'var(--font-dm-mono)', letterSpacing: '0.1em' }}
          >
            How it works
          </p>
          <h2
            className="text-3xl sm:text-4xl font-bold text-[#0F172A] leading-tight"
            style={{ letterSpacing: '-0.02em' }}
          >
            From chaos to clarity in three steps.
          </h2>
        </div>

        {/* Steps */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-10 md:gap-8">
          {steps.map((step, i) => (
            <div key={step.number} className="relative">
              {/* Connector line (desktop only) */}
              {i < steps.length - 1 && (
                <div
                  className="hidden md:block absolute top-5 left-[calc(100%_-_16px)] w-[calc(100%_-_48px)] h-px bg-[#E2E8F0]"
                  aria-hidden="true"
                />
              )}

              {/* Step number bubble */}
              <div
                className="w-10 h-10 rounded-full bg-[#0C1A17] flex items-center justify-center mb-6"
              >
                <span
                  className="text-xs font-bold text-[#10B981]"
                  style={{ fontFamily: 'var(--font-dm-mono)' }}
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
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
