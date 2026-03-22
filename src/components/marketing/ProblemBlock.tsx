// ─── Chaos visual for Act 01 ─────────────────────────────────────────────────

const chaosCards = [
  { dot: '#2563EB', text: 'Spotify – Senior PM – Amste…',        ml: '18%',  rotate: '-1deg' },
  { dot: '#10B981', text: 'N26 – Product Lead – Berlin',          ml: '30%',  rotate: '0.5deg' },
  { dot: '#F59E0B', text: 'Booking.com – PM II – Amst…',         ml: '4%',   rotate: '1deg' },
  { dot: '#8B5CF6', text: 'Zalando – Group PM – Berlin',          ml: '36%',  rotate: '-0.5deg' },
  { dot: '#94A3B8', text: 'cover_letter_final_v3_REAL.d…',       ml: '10%',  rotate: '1.5deg' },
  { dot: '#EF4444', text: 'job_search.xlsx — 60 rows',            ml: '42%',  rotate: '-1.5deg' },
  { dot: '#CBD5E1', text: 'Did I follow up on this one?',         ml: '20%',  rotate: '0deg', italic: true, muted: true },
]

function ChaosVisual() {
  return (
    <div className="relative w-full flex flex-col gap-3 py-4 select-none">
      {chaosCards.map((card, i) => (
        <div
          key={i}
          className="inline-flex items-center gap-2.5 px-4 py-2.5 rounded-xl bg-white shadow-sm border border-[#E2E8F0] w-fit max-w-[260px]"
          style={{
            marginLeft: card.ml,
            transform: `rotate(${card.rotate})`,
            boxShadow: '0 1px 3px rgba(0,0,0,0.07), 0 1px 2px rgba(0,0,0,0.04)',
          }}
        >
          <span
            className="w-2 h-2 rounded-full flex-shrink-0"
            style={{ background: card.dot, opacity: card.muted ? 0.4 : 1 }}
          />
          <span
            className="text-sm truncate"
            style={{
              color: card.muted ? '#94A3B8' : '#374151',
              fontStyle: card.italic ? 'italic' : 'normal',
              fontFamily: card.text.includes('.xlsx') || card.text.includes('.d') ? 'var(--font-dm-mono)' : undefined,
              fontSize: card.text.includes('.xlsx') || card.text.includes('.d') ? '12px' : undefined,
            }}
          >
            {card.text}
          </span>
        </div>
      ))}
    </div>
  )
}

// ─── Spreadsheet visual for Act 02 ──────────────────────────────────────────

const spreadsheetRows = [
  { company: 'Spotify',  role: 'Sr PM',   status: '???',     statusColor: '#EF4444', statusBg: '#FEF2F2', notes: 'applied?',    faded: false },
  { company: 'N26',      role: 'PL',      status: 'yellow',  statusColor: '#D97706', statusBg: '#FFFBEB', notes: 'follow up',   faded: false },
  { company: 'Booking',  role: 'PM-II',   status: 'green?',  statusColor: '#059669', statusBg: '#ECFDF5', notes: 'dunno',       faded: true, strikeRole: true },
  { company: 'Zalando',  role: 'GPM',     status: 'purple',  statusColor: '#7C3AED', statusBg: '#F5F3FF', notes: 'check email', faded: false },
  { company: 'Adyen',    role: '??',      status: 'blue2',   statusColor: '#94A3B8', statusBg: '#F8FAFC', notes: 'idk …',       faded: true },
]

function SpreadsheetVisual() {
  return (
    <div
      className="w-full rounded-xl overflow-hidden shadow-lg border border-[#E2E8F0] select-none"
      style={{ background: '#fff' }}
    >
      {/* Window chrome */}
      <div className="flex items-center gap-1.5 px-4 py-3 border-b border-[#E2E8F0]" style={{ background: '#F8FAFC' }}>
        <span className="w-3 h-3 rounded-full bg-[#EF4444]/70" />
        <span className="w-3 h-3 rounded-full bg-[#F59E0B]/70" />
        <span className="w-3 h-3 rounded-full bg-[#10B981]/70" />
        <span
          className="ml-3 text-xs text-[#94A3B8]"
          style={{ fontFamily: 'var(--font-dm-mono)' }}
        >
          job_search_v4_FINAL.xlsx
        </span>
      </div>

      {/* Table */}
      <table className="w-full text-sm border-collapse">
        <thead>
          <tr style={{ background: '#F8FAFC' }}>
            {['Company', 'Role', 'Status', 'Notes'].map((h) => (
              <th
                key={h}
                className="text-left px-4 py-2.5 text-xs font-medium text-[#94A3B8] border-b border-[#E2E8F0]"
                style={{ fontFamily: 'var(--font-dm-mono)', letterSpacing: '0.02em' }}
              >
                {h}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {spreadsheetRows.map((row, i) => (
            <tr
              key={i}
              className="border-b border-[#F1F5F9]"
              style={{ opacity: row.faded ? 0.55 : 1 }}
            >
              <td className="px-4 py-2.5 text-[#374151] font-medium">{row.company}</td>
              <td
                className="px-4 py-2.5 text-[#64748B]"
                style={{
                  textDecoration: row.strikeRole ? 'line-through' : 'none',
                  fontFamily: 'var(--font-dm-mono)',
                  fontSize: '12px',
                }}
              >
                {row.role}
              </td>
              <td className="px-4 py-2.5">
                <span
                  className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium"
                  style={{
                    color: row.statusColor,
                    background: row.statusBg,
                    fontFamily: 'var(--font-dm-mono)',
                  }}
                >
                  {row.status}
                </span>
              </td>
              <td
                className="px-4 py-2.5 text-[#94A3B8]"
                style={{ fontFamily: 'var(--font-dm-mono)', fontSize: '12px' }}
              >
                {row.notes}
              </td>
            </tr>
          ))}
          {/* Footer row */}
          <tr style={{ background: '#F8FAFC' }}>
            {['—', '—', '—', '55 more rows'].map((cell, i) => (
              <td
                key={i}
                className="px-4 py-2.5 text-xs text-[#CBD5E1]"
                style={{ fontFamily: 'var(--font-dm-mono)' }}
              >
                {cell}
              </td>
            ))}
          </tr>
        </tbody>
      </table>
    </div>
  )
}

// ─── Acts 02 + 03 data ────────────────────────────────────────────────────────

const act02 = {
  number: '02',
  bg: '#F1F5F9',
  textColor: '#0F172A',
  mutedColor: '#64748B',
  headline: "You've tried to fix it. It didn't stick.",
  body: [
    'You built a spreadsheet. It worked for two weeks. Then you had 40 rows, six colour codes, and no idea what any of the statuses meant anymore.',
    "You tried keeping track in your notes app. You added columns. You added tabs. You spent more time maintaining the system than actually running your search.",
    "You told yourself you'd get organised once you had more applications. That was three months and thirty applications ago.",
    "The problem isn't discipline. The problem is none of these approaches treat your job search as what it actually is:",
  ],
  emphasis: 'a funnel — with measurable stages, conversion rates, and diagnosable leaks.',
}

const act03 = {
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
}

// ─── Component ────────────────────────────────────────────────────────────────

function ActLabel({ number, dark }: { number: string; dark?: boolean }) {
  return (
    <div className="flex items-center gap-3 mb-6">
      <div
        className="w-6 h-px"
        style={{ background: dark ? 'rgba(16,185,129,0.6)' : '#CBD5E1' }}
      />
      <span
        className="text-xs font-medium uppercase tracking-widest"
        style={{
          fontFamily: 'var(--font-dm-mono)',
          letterSpacing: '0.12em',
          color: dark ? 'rgba(16,185,129,0.8)' : '#94A3B8',
        }}
      >
        Act {number}
      </span>
    </div>
  )
}

export function ProblemBlock() {
  return (
    <div>

      {/* ── Act 01 — two-column with chaos visual ── */}
      <section style={{ background: '#F8FAFC' }} className="relative overflow-hidden">
        <div className="relative max-w-6xl mx-auto px-5 sm:px-8 py-20 sm:py-28">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-20 items-center">

            {/* Left — text */}
            <div>
              <ActLabel number="01" />
              <h2
                className="text-3xl sm:text-4xl font-bold leading-tight mb-8 text-[#0F172A]"
                style={{ letterSpacing: '-0.02em' }}
              >
                You&apos;re running a €100,000 search on a €0 system.
              </h2>
              <div className="space-y-4">
                {[
                  'You have 40 browser tabs open. A spreadsheet with 60 rows that made sense three weeks ago. A notes file that is technically organised but practically useless.',
                  "You know you applied to that company in Amsterdam. You think it was for a Senior PM role. You're not sure what stage you're at or whether they even opened your CV.",
                  "Meanwhile, you're writing the same cover letter for the fourth time this week. From scratch. Again.",
                  "This is how most tech professionals run their job search. Not because they're not smart — they run data pipelines at work, track OKRs, instrument everything they ship.",
                  "It's because nobody handed them a system built for how the job search actually works.",
                ].map((para, i) => (
                  <p key={i} className="text-base leading-relaxed text-[#64748B]">{para}</p>
                ))}
              </div>
            </div>

            {/* Right — chaos visual */}
            <div className="hidden lg:block">
              <ChaosVisual />
            </div>

          </div>
        </div>
      </section>

      {/* ── Act 02 — two-column with spreadsheet visual ── */}
      <section style={{ background: act02.bg }} className="relative overflow-hidden">
        {/* Large decorative number */}
        <div
          className="absolute top-8 left-8 hidden sm:block select-none pointer-events-none"
          style={{
            fontFamily: 'var(--font-dm-mono)',
            fontSize: 'clamp(80px, 12vw, 160px)',
            fontWeight: 900,
            lineHeight: 1,
            color: 'rgba(0,0,0,0.04)',
            letterSpacing: '-0.04em',
          }}
        >
          {act02.number}
        </div>
        <div className="relative max-w-6xl mx-auto px-5 sm:px-8 py-20 sm:py-28">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-20 items-center">

            {/* Left — text */}
            <div>
              <ActLabel number={act02.number} />
              <h2
                className="text-3xl sm:text-4xl font-bold leading-tight mb-8"
                style={{ color: act02.textColor, letterSpacing: '-0.02em' }}
              >
                {act02.headline}
              </h2>
              <div className="space-y-4 mb-6">
                {act02.body.map((para, i) => (
                  <p key={i} className="text-base leading-relaxed" style={{ color: act02.mutedColor }}>{para}</p>
                ))}
              </div>
              <blockquote className="border-l-2 border-[#10B981] pl-5 text-base italic leading-relaxed text-[#1A3329]">
                {act02.emphasis}
              </blockquote>
            </div>

            {/* Right — spreadsheet visual */}
            <div className="hidden lg:block">
              <SpreadsheetVisual />
            </div>

          </div>
        </div>
      </section>

      {/* ── Act 03 — two-column with funnel visual ── */}
      <section style={{ background: '#0C1A17' }} className="relative overflow-hidden marketing-grid-bg">
        {/* Large decorative number — top right */}
        <div
          className="absolute top-6 right-6 hidden sm:block select-none pointer-events-none"
          style={{
            fontFamily: 'var(--font-dm-mono)',
            fontSize: 'clamp(80px, 12vw, 160px)',
            fontWeight: 900,
            lineHeight: 1,
            color: 'rgba(255,255,255,0.04)',
            letterSpacing: '-0.04em',
          }}
        >
          03
        </div>

        <div className="relative max-w-6xl mx-auto px-5 sm:px-8 py-20 sm:py-28">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-20 items-start">

            {/* Left — text + mini analytics card */}
            <div>
              <ActLabel number="03" dark />
              <h2
                className="text-3xl sm:text-4xl font-bold leading-tight mb-6 text-white"
                style={{ letterSpacing: '-0.02em' }}
              >
                {act03.headline}
              </h2>
              <p className="text-base leading-relaxed mb-5" style={{ color: 'rgba(255,255,255,0.55)' }}>
                {act03.intro}
              </p>

              {/* Mini funnel card */}
              <div
                className="rounded-xl p-5 mb-6"
                style={{
                  background: 'rgba(255,255,255,0.05)',
                  border: '1px solid rgba(255,255,255,0.08)',
                }}
              >
                <p
                  className="text-xs mb-4 text-white/30 uppercase tracking-widest"
                  style={{ fontFamily: 'var(--font-dm-mono)', letterSpacing: '0.1em' }}
                >
                  Your Funnel — This Week
                </p>
                {[
                  { label: 'Applied → Screening',    rate: '9%',  bench: '18%', color: '#EF4444' },
                  { label: 'Screening → Interviewing',rate: '55%', bench: '50%', color: '#10B981' },
                  { label: 'Interviewing → Offer',   rate: '22%', bench: '28%', color: '#F59E0B' },
                ].map((row) => (
                  <div
                    key={row.label}
                    className="flex items-center justify-between py-3 border-t"
                    style={{ borderColor: 'rgba(255,255,255,0.06)' }}
                  >
                    <span className="text-sm text-white/60">{row.label}</span>
                    <span className="text-sm" style={{ fontFamily: 'var(--font-dm-mono)', color: row.color }}>
                      {row.rate}{' '}
                      <span className="text-white/25 text-xs">bench {row.bench}</span>
                    </span>
                  </div>
                ))}
              </div>

              <div className="space-y-4">
                <p className="text-base leading-relaxed" style={{ color: 'rgba(255,255,255,0.55)' }}>
                  The gap is most likely at the CV or targeting layer — not your interview performance.
                </p>
                {act03.body.map((para, i) => (
                  <p key={i} className="text-base leading-relaxed" style={{ color: 'rgba(255,255,255,0.55)' }}>{para}</p>
                ))}
              </div>
              <p className="mt-8 text-xl font-bold italic text-white">{act03.coda}</p>
            </div>

            {/* Right — funnel bars + CV comparison */}
            <div className="hidden lg:flex flex-col gap-5 pt-4">
              {/* Funnel bars */}
              {[
                { label: 'Applied',      count: 42, pct: 100, color: '#2563EB', rate: '100%' },
                { label: 'Screening',    count: 8,  pct: 19,  color: '#8B5CF6', rate: '19%' },
                { label: 'Interviewing', count: 4,  pct: 10,  color: '#F59E0B', rate: '50%' },
                { label: 'Offer',        count: 1,  pct: 3,   color: '#10B981', rate: '25%' },
              ].map((bar) => (
                <div key={bar.label}>
                  <p
                    className="text-xs text-white/30 mb-1.5 uppercase tracking-widest"
                    style={{ fontFamily: 'var(--font-dm-mono)', letterSpacing: '0.1em' }}
                  >
                    {bar.label}
                  </p>
                  <div className="flex items-center gap-3">
                    {/* Bar */}
                    <div className="flex-1 h-9 rounded-lg overflow-hidden" style={{ background: 'rgba(255,255,255,0.05)' }}>
                      <div
                        className="h-full rounded-lg flex items-center px-3"
                        style={{ width: `${bar.pct}%`, background: bar.color, minWidth: '2.5rem' }}
                      >
                        <span
                          className="text-sm font-bold text-white"
                          style={{ fontFamily: 'var(--font-dm-mono)' }}
                        >
                          {bar.count}
                        </span>
                      </div>
                    </div>
                    {/* Rate */}
                    {bar.label !== 'Applied' && (
                      <span
                        className="text-xs text-white/40 w-14 flex-shrink-0"
                        style={{ fontFamily: 'var(--font-dm-mono)' }}
                      >
                        → {bar.rate}
                      </span>
                    )}
                    {bar.label === 'Applied' && (
                      <span
                        className="text-xs text-white/25 w-14 flex-shrink-0"
                        style={{ fontFamily: 'var(--font-dm-mono)' }}
                      >
                        {bar.rate}
                      </span>
                    )}
                  </div>
                </div>
              ))}

              {/* CV comparison mini card */}
              <div
                className="rounded-lg p-4 mt-2"
                style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.07)' }}
              >
                {[
                  { label: 'CV v2 Skills-first', pct: 11, color: '#EF4444' },
                  { label: 'CV v3 Impact-first', pct: 19, color: '#10B981' },
                ].map((cv) => (
                  <div key={cv.label} className="flex items-center gap-3 py-1.5">
                    <span
                      className="text-xs text-white/40 w-36 flex-shrink-0"
                      style={{ fontFamily: 'var(--font-dm-mono)' }}
                    >
                      {cv.label}
                    </span>
                    <div className="flex-1 h-3 rounded-full overflow-hidden" style={{ background: 'rgba(255,255,255,0.06)' }}>
                      <div
                        className="h-full rounded-full"
                        style={{ width: `${cv.pct * 5}%`, background: cv.color }}
                      />
                    </div>
                    <span
                      className="text-xs w-8 text-right flex-shrink-0"
                      style={{ fontFamily: 'var(--font-dm-mono)', color: cv.color }}
                    >
                      {cv.pct}%
                    </span>
                  </div>
                ))}
              </div>
            </div>

          </div>
        </div>
      </section>

    </div>
  )
}
