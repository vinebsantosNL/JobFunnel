import Link from 'next/link'

export function MarketingFooter() {
  return (
    <footer className="bg-[#112219] border-t border-white/5">
      <div className="max-w-6xl mx-auto px-5 sm:px-8 py-12">
        <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-8">
          {/* Brand */}
          <div className="max-w-xs">
            <span className="text-base font-bold text-white">JobFunnel</span>
            <p className="mt-2 text-sm text-white/40 leading-snug">
              The job search platform for tech professionals who think in funnels.
            </p>
          </div>

          {/* Links */}
          <nav className="flex flex-wrap gap-x-6 gap-y-2">
            {[
              { label: 'Features', href: '#features' },
              { label: 'Pricing',  href: '#pricing' },
              { label: 'FAQ',      href: '#faq' },
              { label: 'Privacy',  href: '/privacy' },
              { label: 'Contact',  href: 'mailto:hello@jobfunnel.app' },
            ].map((link) => (
              <Link
                key={link.label}
                href={link.href}
                className="text-sm text-white/40 hover:text-white/70 transition-colors"
              >
                {link.label}
              </Link>
            ))}
          </nav>
        </div>

        <div className="mt-10 pt-6 border-t border-white/5 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <p
            className="text-xs text-white/25"
            style={{ fontFamily: 'var(--font-dm-mono)' }}
          >
            © 2025 JobFunnel. Built for Europe.
          </p>
          <span
            className="self-start sm:self-auto inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs"
            style={{
              background: 'rgba(16,185,129,0.1)',
              color: 'rgba(16,185,129,0.6)',
              border: '1px solid rgba(16,185,129,0.15)',
              fontFamily: 'var(--font-dm-mono)',
            }}
          >
            <svg width="10" height="10" viewBox="0 0 10 10" fill="none">
              <circle cx="5" cy="5" r="4" stroke="currentColor" strokeWidth="1.2"/>
              <path d="M3 5l1.5 1.5L7 3.5" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
            GDPR Compliant
          </span>
        </div>
      </div>
    </footer>
  )
}
