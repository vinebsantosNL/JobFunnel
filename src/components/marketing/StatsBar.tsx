import { RevealWrapper } from './RevealWrapper'

const stats = [
  {
    number: '10M',
    sup: '+',
    label: 'ICT specialists in Europe change jobs every year',
  },
  {
    number: '6 in 10',
    sup: null,
    label: 'applications never reach a human reviewer',
  },
  {
    number: '57',
    sup: '%',
    label: 'of candidates abandon applications mid-process',
  },
]

export function StatsBar() {
  return (
    <section className="bg-[#112219] border-y border-white/5">
      <div className="max-w-6xl mx-auto px-5 sm:px-8 py-16">
        <RevealWrapper>
          <p
            className="text-xs font-medium text-white/30 uppercase text-center mb-14"
            style={{ fontFamily: 'var(--font-dm-mono)', letterSpacing: '0.14em' }}
          >
            The problem is real. The data confirms it.
          </p>
        </RevealWrapper>

        <div className="grid grid-cols-1 sm:grid-cols-3">
          {stats.map((stat, i) => (
            <RevealWrapper
              key={stat.number + (stat.sup ?? '')}
              delay={i * 100}
              className={[
                'text-center py-8 px-6',
                i < stats.length - 1 ? 'sm:border-r sm:border-white/[0.07] border-b sm:border-b-0 border-white/[0.07]' : '',
              ].join(' ')}
            >
              <div
                className="leading-none mb-4 text-white font-black"
                style={{
                  fontFamily: 'var(--font-dm-mono)',
                  fontSize: 'clamp(42px, 5vw, 60px)',
                  letterSpacing: '-0.03em',
                }}
              >
                {stat.number}
                {stat.sup && (
                  <sup
                    className="text-[#10B981]"
                    style={{ fontSize: '0.5em', marginLeft: '2px', verticalAlign: 'super' }}
                  >
                    {stat.sup}
                  </sup>
                )}
              </div>
              <p
                className="text-sm text-white/40 leading-snug max-w-[200px] mx-auto"
              >
                {stat.label}
              </p>
            </RevealWrapper>
          ))}
        </div>
      </div>
    </section>
  )
}
