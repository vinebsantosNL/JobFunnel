const acts = [
  {
    number: '01',
    bg: '#F8FAFC',
    textColor: '#0F172A',
    mutedColor: '#64748B',
    headline: "You're running a €100,000 search on a €0 system.",
    body: [
      'You have 40 browser tabs open. A spreadsheet with 60 rows that made sense three weeks ago. A notes file that is technically organised but practically useless.',
      'You know you applied to that company in Amsterdam. You think it was for a Senior PM role. You\'re not sure what stage you\'re at or whether they even opened your CV.',
      'Meanwhile, you\'re writing the same cover letter for the fourth time this week. From scratch. Again.',
      'This is how most tech professionals run their job search. Not because they\'re not smart — they run data pipelines at work, track OKRs, instrument everything they ship.',
      'It\'s because nobody handed them a system built for how the job search actually works.',
    ],
  },
  {
    number: '02',
    bg: '#F1F5F9',
    textColor: '#0F172A',
    mutedColor: '#64748B',
    headline: "You've tried to fix it. It didn't stick.",
    body: [
      'You built a spreadsheet. It worked for two weeks. Then you had 40 rows, six colour codes, and no idea what any of the statuses meant anymore.',
      'You tried keeping track in your notes app. You added columns. You added tabs. You spent more time maintaining the system than actually running your search.',
      'You told yourself you\'d get organised once you had more applications. That was three months and thirty applications ago.',
      'The problem isn\'t discipline. The problem is none of these approaches treat your job search as what it actually is:',
    ],
    emphasis: 'a funnel — with measurable stages, conversion rates, and diagnosable leaks.',
  },
  {
    number: '03',
    bg: '#1A3329',
    textColor: '#FFFFFF',
    mutedColor: 'rgba(255,255,255,0.55)',
    headline: 'What if you could actually see where your funnel breaks?',
    intro: 'What if you could open a dashboard and see:',
    quote: '"Your Applied-to-Screening rate is 9%. The benchmark for Senior PMs in the Netherlands is 18%. The gap is most likely at the CV or targeting layer — not your interview performance."',
    body: [
      'And then do something about it: run two CV versions against the same role type and watch which one gets callbacks.',
      "That's not a career coach. That's not motivation. That's a measurement system — built for how tech professionals already think.",
    ],
    coda: "That's Job Funnel.",
  },
]

export function ProblemBlock() {
  return (
    <div>
      {acts.map((act) => (
        <section
          key={act.number}
          style={{ background: act.bg }}
          className="relative overflow-hidden"
        >
          {/* Large decorative act number */}
          <div
            className="absolute top-8 right-8 hidden sm:block select-none pointer-events-none"
            style={{
              fontFamily: 'var(--font-dm-mono)',
              fontSize: 'clamp(80px, 12vw, 160px)',
              fontWeight: 900,
              lineHeight: 1,
              color: act.number === '03' ? 'rgba(255,255,255,0.04)' : 'rgba(0,0,0,0.04)',
              letterSpacing: '-0.04em',
            }}
          >
            {act.number}
          </div>

          <div className="relative max-w-6xl mx-auto px-5 sm:px-8 py-20 sm:py-28">
            <div className="max-w-2xl">
              {/* Act label */}
              <div
                className="text-xs font-medium mb-6"
                style={{
                  fontFamily: 'var(--font-dm-mono)',
                  letterSpacing: '0.1em',
                  color: act.number === '03' ? 'rgba(16,185,129,0.8)' : '#64748B',
                }}
              >
                ACT {act.number}
              </div>

              {/* Headline */}
              <h2
                className="text-3xl sm:text-4xl font-bold leading-tight mb-8"
                style={{ color: act.textColor, letterSpacing: '-0.02em' }}
              >
                {act.headline}
              </h2>

              {/* Intro line */}
              {act.intro && (
                <p className="text-base leading-relaxed mb-4" style={{ color: act.mutedColor }}>
                  {act.intro}
                </p>
              )}

              {/* Block quote */}
              {act.quote && (
                <blockquote
                  className="border-l-2 border-[#10B981] pl-5 my-6 text-base italic leading-relaxed"
                  style={{ color: act.number === '03' ? 'rgba(255,255,255,0.75)' : '#0F172A' }}
                >
                  {act.quote}
                </blockquote>
              )}

              {/* Body paragraphs */}
              <div className="space-y-4">
                {act.body.map((para, i) => (
                  <p key={i} className="text-base leading-relaxed" style={{ color: act.mutedColor }}>
                    {para}
                  </p>
                ))}
              </div>

              {/* Emphasis line */}
              {act.emphasis && (
                <p
                  className="mt-4 text-base font-semibold leading-relaxed"
                  style={{ color: act.textColor }}
                >
                  {act.emphasis}
                </p>
              )}

              {/* Coda */}
              {act.coda && (
                <p
                  className="mt-6 text-xl font-bold"
                  style={{ color: '#10B981' }}
                >
                  {act.coda}
                </p>
              )}
            </div>
          </div>
        </section>
      ))}
    </div>
  )
}
