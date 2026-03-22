'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'

export function MarketingNav() {
  const [scrolled, setScrolled] = useState(false)
  const [mobileOpen, setMobileOpen] = useState(false)

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 80)
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  // Lock body scroll when mobile menu is open
  useEffect(() => {
    document.body.style.overflow = mobileOpen ? 'hidden' : ''
    return () => { document.body.style.overflow = '' }
  }, [mobileOpen])

  const navLinks = [
    { label: 'Features', href: '#features' },
    { label: 'Pricing', href: '#pricing' },
    { label: 'FAQ', href: '#faq' },
  ]

  return (
    <>
      <header
        className={[
          'fixed top-0 left-0 right-0 z-50 transition-all duration-200',
          scrolled
            ? 'bg-white/95 backdrop-blur-sm border-b border-[#E2E8F0] shadow-sm'
            : 'bg-transparent',
        ].join(' ')}
      >
        <div className="max-w-6xl mx-auto px-5 sm:px-8 h-16 flex items-center justify-between">

          {/* Logo */}
          <Link
            href="/"
            className={[
              'text-lg font-bold tracking-tight transition-colors',
              scrolled ? 'text-[#0F172A]' : 'text-white',
            ].join(' ')}
          >
            Job Funnel
          </Link>

          {/* Desktop nav */}
          <nav className="hidden md:flex items-center gap-1">
            {navLinks.map((link) => (
              <a
                key={link.label}
                href={link.href}
                className={[
                  'px-4 py-2 text-sm font-medium rounded-lg transition-colors',
                  scrolled
                    ? 'text-[#475569] hover:text-[#0F172A] hover:bg-[#F1F5F9]'
                    : 'text-white/70 hover:text-white hover:bg-white/10',
                ].join(' ')}
              >
                {link.label}
              </a>
            ))}
          </nav>

          {/* Desktop CTAs */}
          <div className="hidden md:flex items-center gap-2">
            <Link
              href="/login"
              className={[
                'px-4 py-2 text-sm font-medium rounded-lg border transition-colors min-h-[44px] flex items-center',
                scrolled
                  ? 'text-[#475569] border-[#E2E8F0] hover:text-[#0F172A] hover:bg-[#F8FAFC]'
                  : 'text-white/75 border-white/20 hover:text-white hover:border-white/40',
              ].join(' ')}
            >
              Log in
            </Link>
            <Link
              href="/signup"
              className="px-4 py-2 text-sm font-medium rounded-lg bg-[#2563EB] text-white hover:bg-[#1D4ED8] transition-colors min-h-[44px] flex items-center"
            >
              Start free
            </Link>
          </div>

          {/* Mobile hamburger */}
          <button
            type="button"
            onClick={() => setMobileOpen((v) => !v)}
            aria-label={mobileOpen ? 'Close menu' : 'Open menu'}
            aria-expanded={mobileOpen}
            className={[
              'md:hidden flex flex-col justify-center items-center w-11 h-11 gap-1.5 rounded-lg transition-colors',
              scrolled ? 'hover:bg-[#F1F5F9]' : 'hover:bg-white/10',
            ].join(' ')}
          >
            <span
              className={[
                'block w-5 h-0.5 transition-all duration-200',
                scrolled ? 'bg-[#0F172A]' : 'bg-white',
                mobileOpen ? 'translate-y-2 rotate-45' : '',
              ].join(' ')}
            />
            <span
              className={[
                'block w-5 h-0.5 transition-all duration-200',
                scrolled ? 'bg-[#0F172A]' : 'bg-white',
                mobileOpen ? 'opacity-0' : '',
              ].join(' ')}
            />
            <span
              className={[
                'block w-5 h-0.5 transition-all duration-200',
                scrolled ? 'bg-[#0F172A]' : 'bg-white',
                mobileOpen ? '-translate-y-2 -rotate-45' : '',
              ].join(' ')}
            />
          </button>
        </div>
      </header>

      {/* Mobile overlay menu */}
      <div
        className={[
          'fixed inset-0 z-40 md:hidden transition-all duration-200',
          mobileOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none',
        ].join(' ')}
      >
        {/* Backdrop */}
        <div
          className="absolute inset-0 bg-[#0C1A17]/80 backdrop-blur-sm"
          onClick={() => setMobileOpen(false)}
        />

        {/* Slide-down panel */}
        <div
          className={[
            'absolute top-0 left-0 right-0 bg-[#0C1A17] pt-16 pb-8 px-5 transition-transform duration-200',
            mobileOpen ? 'translate-y-0' : '-translate-y-full',
          ].join(' ')}
        >
          <nav className="flex flex-col gap-1 mt-4">
            {navLinks.map((link) => (
              <a
                key={link.label}
                href={link.href}
                onClick={() => setMobileOpen(false)}
                className="px-4 py-3.5 text-base font-medium text-white/80 hover:text-white hover:bg-white/10 rounded-lg transition-colors min-h-[44px] flex items-center"
              >
                {link.label}
              </a>
            ))}
          </nav>

          <div className="flex flex-col gap-3 mt-6 pt-6 border-t border-white/10">
            <Link
              href="/login"
              onClick={() => setMobileOpen(false)}
              className="w-full min-h-[44px] flex items-center justify-center rounded-lg border border-white/20 text-sm font-medium text-white/75 hover:text-white hover:border-white/40 transition-colors"
            >
              Log in
            </Link>
            <Link
              href="/signup"
              onClick={() => setMobileOpen(false)}
              className="w-full min-h-[44px] flex items-center justify-center rounded-lg bg-[#2563EB] text-sm font-medium text-white hover:bg-[#1D4ED8] transition-colors"
            >
              Start free — no credit card
            </Link>
          </div>
        </div>
      </div>
    </>
  )
}
