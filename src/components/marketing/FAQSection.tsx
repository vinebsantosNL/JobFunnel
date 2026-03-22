'use client'

import { useState } from 'react'

const faqs = [
  {
    q: 'Is this just another job tracker?',
    a: "No. Most job trackers give you a Kanban board and a count of how many applications you've sent. Job Funnel gives you stage-by-stage conversion rates, time-in-stage analysis, and benchmarks against EU market data. There's also a dedicated interview story vault (STAR format, tagged by competency) and CV A/B testing — neither of which exist in any other tool. The difference is between knowing you sent 47 applications and knowing that your Applied-to-Screening rate is 9% when the benchmark is 18%.",
  },
  {
    q: 'What kind of insights does it actually give me?',
    a: 'The core insight is your conversion rate at each stage of your search:',
    codeBlock: `Applied → Screening   9%   bench 18%  ⚠
Screening → Interview  55%  bench 50%  ✓
Interview → Offer      22%  bench 28%  ⚠`,
    aAfter: "You can also see which applications are stalling (time-in-stage), and if you're running two CV versions, which one correlates with better outcomes. These are the insights that let you diagnose what's broken — not just describe what happened.",
  },
  {
    q: 'I only have 5–8 applications right now. Is it too early?',
    a: "No — and actually the best time to start is before you have a lot of applications, not after. Setting up your pipeline early means you won't lose context as you scale. You'll also start building your story bank now, which compounds: every STAR story you write before an interview is one you don't have to write from scratch later. The free tier covers up to 5 active applications with no time limit.",
  },
  {
    q: 'How long until I actually see useful conversion data?',
    a: "You'll see your first conversion rate as soon as one application moves from Applied to Screening — or doesn't. Meaningful pattern recognition usually kicks in around 10–15 applications. By 20–30, you'll have enough signal to draw real conclusions about whether the issue is targeting, CV, or interview performance.",
  },
  {
    q: "I'm based in the EU — what about GDPR and my data?",
    a: "Job Funnel is built in Europe and GDPR-compliant by design. Your data is stored in the EU, never sold, and never used to train AI models. You can export or delete your data at any time. We treat GDPR compliance as a trust signal, not a compliance checkbox.",
  },
  {
    q: 'What happens when I find a job? Do I keep paying?',
    a: "Cancel whenever you want — no lock-in, no cancellation fees. Most users pause their subscription once their search ends and reactivate when they start looking again (typically 2–3 years later). Your data is preserved, so when you come back, your pipeline history and story bank are exactly where you left them.",
  },
]

export function FAQSection() {
  const [open, setOpen] = useState<number | null>(null)

  return (
    <section id="faq" className="bg-white py-20 sm:py-28 border-t border-[#E2E8F0]">
      <div className="max-w-6xl mx-auto px-5 sm:px-8">

        {/* Header with eyebrow + flanking lines */}
        <div className="mb-14 max-w-2xl">
          <div className="flex items-center gap-3 mb-5">
            <div className="flex-1 max-w-[60px] h-px bg-[#E2E8F0]" />
            <span
              className="text-xs font-medium text-[#94A3B8] uppercase flex-shrink-0"
              style={{ fontFamily: 'var(--font-dm-mono)', letterSpacing: '0.14em' }}
            >
              FAQ
            </span>
            <div className="flex-1 max-w-[60px] h-px bg-[#E2E8F0]" />
          </div>
          <h2
            className="text-4xl sm:text-5xl font-black text-[#0F172A] leading-tight"
            style={{ letterSpacing: '-0.03em' }}
          >
            Questions worth asking<br />before you sign up.
          </h2>
        </div>

        {/* Accordion — single bordered container */}
        <div
          className="max-w-3xl rounded-2xl overflow-hidden"
          style={{ border: '1px solid #E2E8F0' }}
        >
          {faqs.map((faq, i) => {
            const isOpen = open === i
            return (
              <div
                key={i}
                className={i < faqs.length - 1 ? 'border-b border-[#E2E8F0]' : ''}
              >
                <button
                  type="button"
                  onClick={() => setOpen(isOpen ? null : i)}
                  className="flex items-start justify-between w-full gap-6 text-left group min-h-[44px] px-6 py-5"
                  aria-expanded={isOpen}
                >
                  <span
                    className="text-base font-semibold text-[#0F172A] group-hover:text-[#2563EB] transition-colors leading-snug"
                    style={{ letterSpacing: '-0.01em' }}
                  >
                    {faq.q}
                  </span>

                  {/* Circle icon that rotates to × when open */}
                  <div
                    className={[
                      'flex-shrink-0 mt-0.5 w-6 h-6 rounded-full flex items-center justify-center transition-colors duration-200',
                      isOpen
                        ? 'bg-[#0F172A]'
                        : 'bg-[#F1F5F9]',
                    ].join(' ')}
                  >
                    <svg
                      width="12"
                      height="12"
                      viewBox="0 0 12 12"
                      fill="none"
                      className={[
                        'transition-transform duration-200',
                        isOpen ? 'rotate-45' : '',
                      ].join(' ')}
                    >
                      <path
                        d="M6 1v10M1 6h10"
                        stroke={isOpen ? 'white' : '#64748B'}
                        strokeWidth="1.5"
                        strokeLinecap="round"
                      />
                    </svg>
                  </div>
                </button>

                {/* Answer — smooth height animation via grid trick */}
                <div
                  className="grid transition-all duration-300 ease-in-out"
                  style={{ gridTemplateRows: isOpen ? '1fr' : '0fr' }}
                >
                  <div className="overflow-hidden">
                    <div className="px-6 pb-5">
                      {faq.a && (
                        <p className="text-sm text-[#64748B] leading-relaxed mb-3">{faq.a}</p>
                      )}
                      {faq.codeBlock && (
                        <pre
                          className="text-xs rounded-lg px-4 py-3 mb-3 overflow-x-auto"
                          style={{
                            fontFamily: 'var(--font-dm-mono)',
                            background: '#F8FAFC',
                            border: '1px solid #E2E8F0',
                            color: '#475569',
                            lineHeight: 1.8,
                          }}
                        >
                          {faq.codeBlock}
                        </pre>
                      )}
                      {faq.aAfter && (
                        <p className="text-sm text-[#64748B] leading-relaxed">{faq.aAfter}</p>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            )
          })}
        </div>

      </div>
    </section>
  )
}
