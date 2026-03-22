export function StatsBar() {
  const stats = [
    {
      number: '10M+',
      label: 'ICT specialists in Europe change jobs every year',
    },
    {
      number: '6 in 10',
      label: 'applications never reach a human reviewer',
    },
    {
      number: '57%',
      label: 'of candidates abandon applications mid-process',
    },
  ]

  return (
    <section className="bg-[#112219] border-y border-white/5">
      <div className="max-w-6xl mx-auto px-5 sm:px-8 py-14">
        <p
          className="text-xs font-medium text-white/30 uppercase tracking-widest mb-10 text-center"
          style={{ fontFamily: 'var(--font-dm-mono)', letterSpacing: '0.12em' }}
        >
          The problem is real. The data confirms it.
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-8 sm:gap-12">
          {stats.map((stat) => (
            <div key={stat.number} className="text-center sm:text-left">
              <div
                className="text-4xl font-black text-[#10B981] leading-none mb-2"
                style={{ fontFamily: 'var(--font-dm-mono)' }}
              >
                {stat.number}
              </div>
              <p className="text-sm text-white/50 leading-snug">{stat.label}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
