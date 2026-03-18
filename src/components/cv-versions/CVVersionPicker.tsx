'use client'

import Link from 'next/link'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'
import { useCVVersions } from '@/hooks/useCVVersions'

interface CVVersionPickerProps {
  value: string | null
  onChange: (id: string | null) => void
  disabled?: boolean
}

export function CVVersionPicker({ value, onChange, disabled = false }: CVVersionPickerProps) {
  const { data: versions = [], isLoading } = useCVVersions(false)

  const activeVersions = versions.filter((v) => !v.is_archived)

  const selectValue = value ?? '__untagged__'

  function handleValueChange(v: string | null) {
    if (!v) return
    onChange(v === '__untagged__' ? null : v)
  }

  if (disabled) {
    const current = activeVersions.find((v) => v.id === value)
    const label = current ? current.name : 'Untagged'
    return (
      <div
        title="CV version cannot be changed after the application reaches screening stage"
        className="flex items-center gap-2"
      >
        <span className="text-sm text-gray-500 bg-gray-100 border border-gray-200 rounded px-3 py-2 w-full cursor-not-allowed">
          {label}
        </span>
      </div>
    )
  }

  if (isLoading) {
    return (
      <Select disabled>
        <SelectTrigger className="w-full">
          <SelectValue placeholder="Loading versions..." />
        </SelectTrigger>
      </Select>
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
    <Select value={selectValue} onValueChange={handleValueChange}>
      <SelectTrigger className="w-full">
        <SelectValue placeholder="Select CV version" />
      </SelectTrigger>
      <SelectContent>
        <SelectItem value="__untagged__">Untagged</SelectItem>
        {activeVersions.map((version) => (
          <SelectItem key={version.id} value={version.id}>
            <span className="flex items-center gap-2">
              {version.name}
              {version.is_default && (
                <Badge variant="secondary" className="text-xs px-1 py-0 ml-1">
                  Default
                </Badge>
              )}
            </span>
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  )
}
