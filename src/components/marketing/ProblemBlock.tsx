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

      {/* ── Act 03 ── */}
      <section style={{ background: act03.bg }} className="relative overflow-hidden">
        <div className="relative max-w-6xl mx-auto px-5 sm:px-8 py-20 sm:py-28">
          <div className="max-w-2xl">
            <ActLabel number={act03.number} dark />
            <h2
              className="text-3xl sm:text-4xl font-bold leading-tight mb-8 text-white"
              style={{ letterSpacing: '-0.02em' }}
            >
              {act03.headline}
            </h2>
            <p className="text-base leading-relaxed mb-4" style={{ color: act03.mutedColor }}>
              {act03.intro}
            </p>
            <blockquote
              className="border-l-2 border-[#10B981] pl-5 my-6 text-base italic leading-relaxed"
              style={{ color: 'rgba(255,255,255,0.75)' }}
            >
              {act03.quote}
            </blockquote>
            <div className="space-y-4">
              {act03.body.map((para, i) => (
                <p key={i} className="text-base leading-relaxed" style={{ color: act03.mutedColor }}>{para}</p>
              ))}
            </div>
            <p className="mt-6 text-xl font-bold text-[#10B981]">{act03.coda}</p>
          </div>
        </div>
      </section>

    </div>
  )
}
