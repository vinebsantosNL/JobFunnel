import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'

interface HeaderProps {
  title: string
  backHref?: string
}

export async function Header({ title, backHref }: HeaderProps) {
  return (
    <header
      role="banner"
      className="flex items-center h-16 px-6 bg-card border-b border-border gap-3 flex-shrink-0"
    >
      {backHref && (
        <Link
          href={backHref}
          className="p-2.5 rounded-lg text-muted-foreground hover:text-foreground hover:bg-accent transition-colors flex-shrink-0"
          aria-label="Back"
        >
          <ArrowLeft className="w-4 h-4" aria-hidden="true" />
        </Link>
      )}
      <div>
        <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Workspace</p>
        <h1 className="text-xl font-bold text-foreground leading-tight">{title}</h1>
      </div>
    </header>
  )
}
