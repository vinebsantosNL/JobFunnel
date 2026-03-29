import Link from 'next/link'

interface AuthShellProps {
  children: React.ReactNode
  leftContent: React.ReactNode
}

export function AuthShell({ children, leftContent }: AuthShellProps) {
  return (
    <div className="min-h-screen flex">

      {/* ── Dark left panel ─────────────────────────────────── */}
      <div
        className="hidden lg:flex flex-col justify-between flex-shrink-0 relative overflow-hidden"
        style={{
          width: '42%',
          background: '#0C1A17',
          padding: '40px 48px',
        }}
      >
        {/* Grid texture */}
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            backgroundImage: `
              repeating-linear-gradient(rgba(16,185,129,0.06) 0px, rgba(16,185,129,0.06) 1px, transparent 1px, transparent 40px),
              repeating-linear-gradient(90deg, rgba(16,185,129,0.06) 0px, rgba(16,185,129,0.06) 1px, transparent 1px, transparent 40px)
            `,
          }}
        />
        {/* Radial glow */}
        <div
          className="absolute pointer-events-none"
          style={{
            top: '-120px',
            right: '-80px',
            width: '480px',
            height: '480px',
            background: 'radial-gradient(circle, rgba(16,185,129,0.12) 0%, transparent 70%)',
          }}
        />

        {/* Logo */}
        <div className="relative z-10">
          <Link href="/" className="inline-flex items-center gap-2.5 no-underline mb-16">
            <div
              className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0"
              style={{ background: 'var(--jf-success)' }}
            >
              <svg width="16" height="16" viewBox="0 0 18 18" fill="none">
                <path d="M3 4h12M5 8h8M7 12h4" stroke="white" strokeWidth="2" strokeLinecap="round" />
              </svg>
            </div>
            <span
              className="text-white font-bold"
              style={{ fontSize: '15px', letterSpacing: '-0.02em' }}
            >
              Job Funnel
            </span>
          </Link>

          {leftContent}
        </div>

        {/* Footer */}
        <p
          className="relative z-10 text-xs"
          style={{
            fontFamily: 'var(--font-dm-mono)',
            color: 'rgba(255,255,255,0.2)',
            letterSpacing: '0.06em',
          }}
        >
          © 2025 Job Funnel · Built for Europe
        </p>
      </div>

      {/* ── White right panel ────────────────────────────────── */}
      <div className="flex-1 flex items-center justify-center px-6 sm:px-12 py-12">
        <div className="w-full max-w-[380px]">

          {/* Mobile logo */}
          <Link href="/" className="lg:hidden inline-flex items-center gap-2.5 no-underline mb-10">
            <div
              className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0"
              style={{ background: 'var(--jf-success)' }}
            >
              <svg width="16" height="16" viewBox="0 0 18 18" fill="none">
                <path d="M3 4h12M5 8h8M7 12h4" stroke="white" strokeWidth="2" strokeLinecap="round" />
              </svg>
            </div>
            <span
              className="text-[#0F172A] font-bold"
              style={{ fontSize: '15px', letterSpacing: '-0.02em' }}
            >
              Job Funnel
            </span>
          </Link>

          {children}
        </div>
      </div>

    </div>
  )
}
