import Link from 'next/link'
import { Header } from '@/components/layout/header'
import { CVVersionList } from '@/components/cv-versions/CVVersionList'

export default function CVVersionsPage() {
  return (
    <>
      <Header
        title="My CVs"
        actions={
          <Link
            href="/cv-versions/new"
            className="inline-flex items-center gap-1.5 rounded-lg px-3 py-2 text-sm font-semibold text-white transition-colors"
            style={{ background: 'var(--jf-interactive)', minHeight: '36px' }}
          >
            <svg className="w-3.5 h-3.5" viewBox="0 0 16 16" fill="currentColor">
              <path d="M8 2a1 1 0 011 1v4h4a1 1 0 010 2H9v4a1 1 0 01-2 0V9H3a1 1 0 010-2h4V3a1 1 0 011-1z" />
            </svg>
            New CV version
          </Link>
        }
      />
      <main className="flex-1 p-6 overflow-auto">
        <CVVersionList />
      </main>
    </>
  )
}
