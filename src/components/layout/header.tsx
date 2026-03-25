import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'
import { HeaderUserActions } from './header-user-actions'

interface HeaderProps {
  title: string
  /** If provided, renders a back button linking to this href */
  backHref?: string
  /**
   * Short uppercase label shown above the title when backHref is present.
   * Defaults to "WORKSPACE". Pass an empty string to hide the label.
   * Example: "WORKSPACE" or "PRECISION TEMPLATE"
   */
  breadcrumbLabel?: string
  /**
   * Optional slot for additional action elements rendered to the right of the
   * bell + avatar, e.g. Save / PDF / DOCX buttons in the CV builder.
   */
  actions?: React.ReactNode
}

export function Header({
  title,
  backHref,
  breadcrumbLabel = 'WORKSPACE',
  actions,
}: HeaderProps) {
  return (
    <header
      role="banner"
      className="flex items-center gap-3 flex-shrink-0 px-6"
      style={{
        height: 'var(--jf-header-h)',
        background: 'var(--jf-bg-card)',
        borderBottom: '1px solid var(--jf-border)',
      }}
    >
      {/* Back button */}
      {backHref && (
        <Link
          href={backHref}
          className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-sm font-medium transition-colors flex-shrink-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sidebar-ring"
          style={{
            border: '1px solid var(--jf-border)',
            background: 'var(--jf-bg-card)',
            color: 'var(--jf-text-secondary)',
          }}
          aria-label="Back"
        >
          <ArrowLeft className="w-3.5 h-3.5" aria-hidden="true" />
          <span>Back</span>
        </Link>
      )}

      {/* Title area */}
      <div className="flex-1 min-w-0">
        {backHref && breadcrumbLabel && (
          <p
            className="text-[10px] font-medium uppercase tracking-widest leading-none mb-0.5"
            style={{ fontFamily: 'var(--font-dm-mono, monospace)', color: 'var(--jf-text-muted)' }}
          >
            {breadcrumbLabel}
          </p>
        )}
        <h1
          className="text-[17px] font-semibold leading-tight truncate"
          style={{ color: 'var(--jf-text-primary)' }}
        >
          {title}
        </h1>
      </div>

      {/* Right: optional page-specific actions + bell + avatar */}
      <div className="flex items-center gap-2 flex-shrink-0">
        {actions}
        <HeaderUserActions />
      </div>
    </header>
  )
}
