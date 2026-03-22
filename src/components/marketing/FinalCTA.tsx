import Link from 'next/link'

export function FinalCTA() {
  return (
    <section className="bg-[#0C1A17] marketing-grid-bg py-24 sm:py-32">
      <div className="max-w-6xl mx-auto px-5 sm:px-8 text-center">
        <h2
          className="text-4xl sm:text-5xl font-black text-white leading-tight mb-5"
          style={{ letterSpacing: '-0.03em' }}
        >
          Your search deserves a system.
        </h2>
        <p className="text-lg text-white/50 mb-10 max-w-md mx-auto">
          Start free. Add your first application in 60 seconds.
        </p>

        <Link
          href="/signup"
          className="inline-flex items-center justify-center px-8 py-4 rounded-xl bg-[#2563EB] text-white text-base font-semibold hover:bg-[#1D4ED8] transition-colors min-h-[52px]"
        >
          Start free — no credit card
        </Link>

        <p
          className="mt-6 text-xs text-white/25"
          style={{ fontFamily: 'var(--font-dm-mono)', letterSpacing: '0.04em' }}
        >
          GDPR-compliant · Built in Europe · Cancel anytime
        </p>
      </div>
    </section>
  )
}
