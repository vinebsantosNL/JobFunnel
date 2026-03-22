'use client'

import { useEffect, useRef, useState } from 'react'

const metricCards = [
  { label: 'Applications',      value: '42',  delta: '↑ +8 this week',       color: '#2563EB' },
  { label: 'Screening Rate',    value: '18%', delta: '↑ +6% vs last month',  color: '#10B981', highlight: true },
  { label: 'Active Interviews', value: '4',   delta: '→ steady',              color: '#F59E0B' },
  { label: 'CV Versions',       value: '2',   delta: 'A/B active',            color: '#8B5CF6' },
]

const funnelBars = [
  { label: 'Applied',      count: 42, pct: 100, color: '#2563EB', rate: null,  bench: null        },
  { label: 'Screening',    count: 8,  pct: 19,  color: '#8B5CF6', rate: '19%', bench: 'bench 18%' },
  { label: 'Interviewing', count: 4,  pct: 10,  color: '#F59E0B', rate: '50%', bench: 'bench 35%' },
  { label: 'Offer',        count: 1,  pct: 2,   color: '#10B981', rate: '25%', bench: null        },
]

function AnimatedBar({ pct, color, delay }: { pct: number; color: string; delay: number }) {
  const [width, setWidth] = useState(0)
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const el = ref.current
    if (!el) return
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setTimeout(() => setWidth(pct), delay)
          observer.unobserve(el)
        }
      },
      { threshold: 0.4 }
    )
    observer.observe(el)
    return () => observer.disconnect()
  }, [pct, delay])

  return (
    <div ref={ref} className="flex-1 h-6 rounded-lg overflow-hidden relative" style={{ background: 'rgba(255,255,255,0.05)' }}>
      <div
        className="h-full rounded-lg"
        style={{
          width: `${width}%`,
          background: color,
          opacity: 0.85,
          transition: 'width 0.75s cubic-bezier(0.34,1.56,0.64,1)',
        }}
      />
    </div>
  )
}

export function DashboardMockup() {
  return (
    <section className="bg-[#0C1A17] marketing-grid-bg py-20 sm:py-28">
      <div className="max-w-6xl mx-auto px-5 sm:px-8">

        {/* Header with eyebrow + flanking lines */}
        <div className="mb-12">
          <div className="flex items-center gap-3 mb-5">
            <div className="flex-1 max-w-[60px] h-px" style={{ background: 'rgba(16,185,129,0.2)' }} />
            <span
              className="text-xs font-medium uppercase flex-shrink-0"
              style={{ fontFamily: 'var(--font-dm-mono)', letterSpacing: '0.14em', color: 'rgba(16,185,129,0.5)' }}
            >
              Product preview
            </span>
            <div className="flex-1 max-w-[60px] h-px" style={{ background: 'rgba(16,185,129,0.2)' }} />
          </div>
          <h2
            className="text-4xl sm:text-5xl font-black text-white leading-tight"
            style={{ letterSpacing: '-0.03em' }}
          >
            Your search, finally measurable.
          </h2>
          <p className="mt-4 text-base" style={{ color: 'rgba(255,255,255,0.45)' }}>
            Real data. Real conversion rates. Real signal — not just a count.
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
                    style={{ fontFamily: 'var(--font-dm-mono)', color: card.color }}
                  >
                    {card.value}
                  </div>
                  <div className="text-xs font-medium text-white/60 mb-1">{card.label}</div>
                  <div
                    className="text-xs"
                    style={{
                      fontFamily: 'var(--font-dm-mono)',
                      color: card.highlight ? '#10B981' : 'rgba(255,255,255,0.28)',
                    }}
                  >
                    {card.delta}
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
                <span className="text-sm font-medium text-white/60">Funnel Overview</span>
                <span
                  className="text-xs px-2.5 py-1 rounded-full"
                  style={{
                    background: 'rgba(16,185,129,0.12)',
                    color: '#10B981',
                    border: '1px solid rgba(16,185,129,0.2)',
                    fontFamily: 'var(--font-dm-mono)',
                  }}
                >
                  Screening rate ↑ 6% this month
                </span>
              </div>

              <div className="space-y-5">
                {funnelBars.map((bar, i) => (
                  <div key={bar.label}>
                    <div className="flex items-center gap-4">
                      {/* Label */}
                      <div
                        className="w-24 flex-shrink-0 text-xs text-white/35"
                        style={{ fontFamily: 'var(--font-dm-mono)' }}
                      >
                        {bar.label}
                      </div>

                      {/* Animated bar */}
                      <AnimatedBar pct={bar.pct} color={bar.color} delay={i * 120} />

                      {/* Count + conversion rate */}
                      <div
                        className="w-12 text-right text-xs flex-shrink-0"
                        style={{
                          fontFamily: 'var(--font-dm-mono)',
                          color: bar.rate ? '#10B981' : 'rgba(255,255,255,0.25)',
                        }}
                      >
                        {bar.rate ?? bar.count}
                      </div>
                    </div>

                    {/* Benchmark reference */}
                    {bar.bench && (
                      <div
                        className="mt-1.5 ml-28 text-xs"
                        style={{ fontFamily: 'var(--font-dm-mono)', color: 'rgba(255,255,255,0.2)' }}
                      >
                        {bar.bench}
                      </div>
                    )}
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
