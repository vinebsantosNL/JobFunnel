import Link from 'next/link'

export function HeroSection() {
  return (
    <section className="relative min-h-screen flex items-center bg-[#0C1A17] marketing-grid-bg overflow-hidden">
      {/* Radial glow — top right */}
      <div
        className="absolute top-[-200px] right-[-100px] w-[700px] h-[700px] rounded-full pointer-events-none"
        style={{
          background: 'radial-gradient(circle, rgba(16,185,129,0.18) 0%, transparent 70%)',
        }}
      />

      <div className="relative max-w-6xl mx-auto px-5 sm:px-8 pt-28 pb-20 w-full">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">

          {/* Left — text */}
          <div>
            {/* Eyebrow label */}
            <div
              className="flex items-center gap-2 mb-6 fade-in-up-1"
              style={{
                fontFamily: 'var(--font-dm-mono)',
                fontSize: '11px',
                letterSpacing: '0.12em',
                textTransform: 'uppercase',
                color: '#10B981',
              }}
            >
              <span className="block w-6 h-px bg-[#10B981]" />
              Job search analytics · Built for Europe
            </div>

            <h1
              className="font-black leading-[1.0] tracking-tight text-white fade-in-up-2"
              style={{
                fontSize: 'clamp(48px, 6vw, 80px)',
                letterSpacing: '-0.03em',
                fontFamily: 'var(--font-sans)',
              }}
            >
              <span>47</span> applications.<br />
              <span style={{ color: '#FC4D4D' }}>3</span> screening calls.<br />
              <span
                style={{
                  color: '#94A3B8',
                  fontStyle: 'italic',
                  fontWeight: 300,
                  fontSize: '0.78em',
                }}
              >
                You still don&apos;t know why.
              </span>
            </h1>

            <p
              className="mt-7 text-lg leading-relaxed max-w-md fade-in-up-3"
              style={{ color: 'rgba(255,255,255,0.65)' }}
            >
              Job Funnel shows you exactly where your job search breaks down —
              and what to do about it.
            </p>

            <div className="mt-10 flex flex-col sm:flex-row flex-wrap gap-4 fade-in-up-4">
              <Link
                href="/signup"
                className="inline-flex items-center justify-center gap-2 px-7 py-3.5 rounded-xl bg-[#2563EB] text-white text-sm font-semibold hover:bg-[#1D4ED8] transition-all min-h-[48px]"
                style={{ boxShadow: '0 4px 16px rgba(37,99,235,0.35)' }}
              >
                Start free — no credit card
                <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M3 8h10M9 4l4 4-4 4"/>
                </svg>
              </Link>
              <a
                href="#features"
                className="inline-flex items-center justify-center gap-1.5 px-6 py-3.5 text-sm font-medium transition-colors min-h-[48px] group"
                style={{ color: 'rgba(255,255,255,0.7)' }}
              >
                See how it works
                <svg
                  width="14" height="14" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2"
                  className="transition-transform group-hover:translate-y-0.5"
                >
                  <path d="M8 3v10M4 9l4 4 4-4"/>
                </svg>
              </a>
            </div>

            {/* Trust line with dot separators */}
            <div
              className="mt-8 flex items-center flex-wrap gap-0 fade-in-up-4"
              style={{
                fontFamily: 'var(--font-dm-mono)',
                fontSize: '11px',
                letterSpacing: '0.06em',
                color: 'rgba(255,255,255,0.35)',
              }}
            >
              <span style={{ color: 'rgba(255,255,255,0.5)' }}>Built for DACH + Benelux</span>
              <span
                className="inline-block w-[3px] h-[3px] rounded-full mx-2 align-middle flex-shrink-0"
                style={{ background: 'rgba(255,255,255,0.3)', display: 'inline-block' }}
              />
              <span style={{ color: 'rgba(255,255,255,0.5)' }}>Works across the EU</span>
              <span
                className="inline-block w-[3px] h-[3px] rounded-full mx-2 align-middle flex-shrink-0"
                style={{ background: 'rgba(255,255,255,0.3)', display: 'inline-block' }}
              />
              <span style={{ color: 'rgba(255,255,255,0.5)' }}>GDPR-compliant</span>
            </div>
          </div>

          {/* Right — SVG funnel visualisation */}
          <div className="flex justify-center lg:justify-end fade-in-up-3">
            <FunnelSVG />
          </div>
        </div>
      </div>

      {/* Scroll hint */}
      <div
        className="absolute bottom-9 left-1/2 -translate-x-1/2 flex flex-col items-center gap-1.5 cursor-pointer"
        onClick={() => {
          // handled client-side — graceful no-op on SSR
        }}
      >
        <span
          style={{
            fontFamily: 'var(--font-dm-mono)',
            fontSize: '10px',
            letterSpacing: '0.1em',
            textTransform: 'uppercase',
            color: 'rgba(255,255,255,0.3)',
          }}
        >
          scroll
        </span>
        <div
          className="w-5 h-5 border-r-2 border-b-2 border-white/30 animate-bounce"
          style={{ transform: 'rotate(45deg)' }}
        />
      </div>
    </section>
  )
}

function FunnelSVG() {
  return (
    <svg
      viewBox="0 0 360 440"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className="w-full"
      style={{ maxWidth: 360 }}
    >
      {/* Stage labels */}
      <text x="0" y="52"  fontFamily="'DM Mono',monospace" fontSize="10" fill="rgba(255,255,255,0.4)" letterSpacing="0.04em">APPLIED</text>
      <text x="0" y="162" fontFamily="'DM Mono',monospace" fontSize="10" fill="rgba(255,255,255,0.4)" letterSpacing="0.04em">SCREENING</text>
      <text x="0" y="272" fontFamily="'DM Mono',monospace" fontSize="10" fill="rgba(255,255,255,0.4)" letterSpacing="0.04em">INTERVIEW</text>
      <text x="0" y="382" fontFamily="'DM Mono',monospace" fontSize="10" fill="rgba(255,255,255,0.4)" letterSpacing="0.04em">OFFER</text>

      {/* Applied bar — full width 272px */}
      <rect x="80" y="34" width="272" height="36" rx="4" fill="#2563EB" opacity="0.9">
        <animate attributeName="width" from="0" to="272" dur="0.8s" begin="0.8s" fill="freeze" calcMode="spline" keySplines="0.34 1.56 0.64 1"/>
      </rect>
      <text x="94" y="57" fontFamily="'Inter',sans-serif" fontSize="18" fontWeight="700" fill="white">47</text>

      {/* Conversion → 17% */}
      <text x="340" y="88" fontFamily="'DM Mono',monospace" fontSize="10" fill="#EF4444" textAnchor="end" opacity="0.9">→ 17%</text>
      <line x1="216" y1="70" x2="216" y2="108" stroke="rgba(255,255,255,0.08)" strokeWidth="1" strokeDasharray="3,3"/>

      {/* Lost bar — red ghost */}
      <rect x="80" y="74" width="272" height="8" rx="2" fill="rgba(239,68,68,0.15)"/>
      <rect x="80" y="74" width="227" height="8" rx="2" fill="rgba(239,68,68,0.25)">
        <animate attributeName="width" from="0" to="227" dur="0.8s" begin="1.0s" fill="freeze"/>
      </rect>
      <text x="340" y="81" fontFamily="'DM Mono',monospace" fontSize="9" fill="rgba(239,68,68,0.5)" textAnchor="end">−40 lost</text>

      {/* Screening bar — 46px */}
      <rect x="80" y="144" width="46" height="36" rx="4" fill="#8B5CF6" opacity="0.85">
        <animate attributeName="width" from="0" to="46" dur="0.8s" begin="1.1s" fill="freeze" calcMode="spline" keySplines="0.34 1.56 0.64 1"/>
      </rect>
      <text x="94" y="167" fontFamily="'Inter',sans-serif" fontSize="18" fontWeight="700" fill="white">8</text>

      {/* Conversion → 37% */}
      <text x="340" y="198" fontFamily="'DM Mono',monospace" fontSize="10" fill="#F59E0B" textAnchor="end" opacity="0.9">→ 37%</text>
      <line x1="103" y1="180" x2="103" y2="218" stroke="rgba(255,255,255,0.08)" strokeWidth="1" strokeDasharray="3,3"/>

      {/* Screening lost */}
      <rect x="80" y="184" width="46" height="8" rx="2" fill="rgba(245,158,11,0.15)"/>
      <rect x="80" y="184" width="29" height="8" rx="2" fill="rgba(245,158,11,0.25)">
        <animate attributeName="width" from="0" to="29" dur="0.7s" begin="1.3s" fill="freeze"/>
      </rect>
      <text x="340" y="191" fontFamily="'DM Mono',monospace" fontSize="9" fill="rgba(245,158,11,0.5)" textAnchor="end">−5 lost</text>

      {/* Interviewing bar — 17px */}
      <rect x="80" y="254" width="17" height="36" rx="4" fill="#F59E0B" opacity="0.85">
        <animate attributeName="width" from="0" to="17" dur="0.8s" begin="1.4s" fill="freeze" calcMode="spline" keySplines="0.34 1.56 0.64 1"/>
      </rect>
      <text x="94" y="277" fontFamily="'Inter',sans-serif" fontSize="18" fontWeight="700" fill="white">3</text>

      {/* Conversion → 33% */}
      <text x="340" y="308" fontFamily="'DM Mono',monospace" fontSize="10" fill="rgba(255,255,255,0.4)" textAnchor="end">→ 33%</text>
      <line x1="88" y1="290" x2="88" y2="328" stroke="rgba(255,255,255,0.08)" strokeWidth="1" strokeDasharray="3,3"/>

      {/* Offer bar — 9px */}
      <rect x="80" y="364" width="9" height="36" rx="3" fill="#10B981" opacity="0.9">
        <animate attributeName="width" from="0" to="9" dur="0.6s" begin="1.6s" fill="freeze"/>
      </rect>
      <text x="94" y="387" fontFamily="'Inter',sans-serif" fontSize="18" fontWeight="700" fill="white">1</text>

      {/* Benchmark line */}
      <line x1="80" y1="164" x2="160" y2="164" stroke="rgba(255,255,255,0.12)" strokeWidth="1" strokeDasharray="4,3"/>
      <text x="163" y="168" fontFamily="'DM Mono',monospace" fontSize="9" fill="rgba(255,255,255,0.25)">bench 20%</text>

      {/* Summary callout */}
      <rect x="80" y="415" width="272" height="20" rx="4" fill="rgba(239,68,68,0.1)" stroke="rgba(239,68,68,0.2)" strokeWidth="1"/>
      <text x="216" y="429" fontFamily="'DM Mono',monospace" fontSize="10" fill="rgba(239,68,68,0.7)" textAnchor="middle">screening rate 9% · benchmark 20%</text>
    </svg>
  )
}
