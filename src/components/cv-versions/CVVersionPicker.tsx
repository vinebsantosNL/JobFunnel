'use client'

import Link from 'next/link'
import { useCVVersions } from '@/hooks/useCVVersions'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'

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
    return <div className="h-9 w-full bg-gray-100 rounded-lg animate-pulse" />
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
    <Select
      value={value ?? '__untagged__'}
      onValueChange={(v) => onChange(v === '__untagged__' ? null : v)}
    >
      <SelectTrigger className="w-full h-9">
        <SelectValue />
      </SelectTrigger>
      <SelectContent>
        <SelectItem value="__untagged__">Untagged</SelectItem>
        {activeVersions.map((version) => (
          <SelectItem key={version.id} value={version.id}>
            {version.name}{version.is_default ? ' (Default)' : ''}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  )
}
