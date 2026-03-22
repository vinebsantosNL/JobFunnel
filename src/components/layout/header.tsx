import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'

interface HeaderProps {
  title: string
  backHref?: string
}

export async function Header({ title, backHref }: HeaderProps) {
  return (
    <header className="flex items-center h-16 px-6 bg-white border-b border-gray-200 gap-3">
      {backHref && (
        <Link
          href={backHref}
          className="p-2.5 rounded-lg text-gray-400 hover:text-gray-700 hover:bg-gray-100 transition-colors flex-shrink-0"
          aria-label="Back"
        >
          <ArrowLeft className="w-4 h-4" />
        </Link>
      )}
      <div>
        <p className="text-xs font-medium text-gray-400 uppercase tracking-wide">Workspace</p>
        <h1 className="text-xl font-bold text-gray-900 leading-tight">{title}</h1>
      </div>
    </header>
  )
}
