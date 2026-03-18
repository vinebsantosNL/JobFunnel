'use client'

import Link from 'next/link'
import { useCVVersions } from '@/hooks/useCVVersions'

interface CVVersionPickerProps {
  value: string | null
  onChange: (id: string | null) => void
  disabled?: boolean
}

export function CVVersionPicker({ value, onChange, disabled = false }: CVVersionPickerProps) {
  const { data: versions = [], isLoading } = useCVVersions(false)

  const activeVersions = versions.filter((v) => !v.is_archived)

  if (disabled) {
    const current = activeVersions.find((v) => v.id === value)
    const label = current ? current.name : 'Untagged'
    return (
      <span
        title="CV version cannot be changed after the application reaches screening stage"
        className="flex h-9 items-center text-sm text-gray-500 bg-gray-100 border border-gray-200 rounded-lg px-3 w-full cursor-not-allowed"
      >
        {label}
      </span>
    )
  }

  if (isLoading) {
    return (
      <select disabled className="flex h-9 w-full rounded-lg border border-input bg-transparent px-3 text-sm outline-none opacity-50">
        <option>Loading versions…</option>
      </select>
    )
  }

  if (activeVersions.length === 0) {
    return (
      <p className="text-sm text-gray-500">
        No CV versions yet.{' '}
        <Link href="/cv-versions" className="text-blue-600 hover:underline">
          Create a CV version →
        </Link>
      </p>
    )
  }

  return (
    <select
      value={value ?? '__untagged__'}
      onChange={(e) => onChange(e.target.value === '__untagged__' ? null : e.target.value)}
      className="flex h-9 w-full rounded-lg border border-input bg-transparent px-3 text-sm outline-none focus-visible:border-ring focus-visible:ring-2 focus-visible:ring-ring/30"
    >
      <option value="__untagged__">Untagged</option>
      {activeVersions.map((version) => (
        <option key={version.id} value={version.id}>
          {version.name}{version.is_default ? ' (Default)' : ''}
        </option>
      ))}
    </select>
  )
}
