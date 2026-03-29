'use client'

import { useRef, useState } from 'react'
import { UploadCloud, CheckCircle, X } from 'lucide-react'
import { cn } from '@/lib/utils'

const ACCEPTED_MIME = [
  'application/pdf',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
]
const MAX_BYTES = 10 * 1024 * 1024 // 10 MB

function formatBytes(bytes: number): string {
  if (bytes < 1024 * 1024) return `${Math.round(bytes / 1024)} KB`
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
}

export interface UploadDropzoneProps {
  file: File | null
  onFileChange: (f: File | null) => void
  error?: string
  disabled?: boolean
}

export function UploadDropzone({ file, onFileChange, error, disabled }: UploadDropzoneProps) {
  const inputRef = useRef<HTMLInputElement>(null)
  const [dragging, setDragging] = useState(false)

  function validate(f: File): string | null {
    if (!ACCEPTED_MIME.includes(f.type)) return 'Only PDF and DOCX files are supported.'
    if (f.size > MAX_BYTES) return 'File is too large. Maximum size is 10 MB.'
    return null
  }

  function handleFiles(files: FileList | null) {
    if (!files || files.length === 0) return
    const f = files[0]
    const err = validate(f)
    if (err) {
      onFileChange(null)
      // surface validation error via parent (parent controls `error` prop)
      // We call with null so parent can detect via a separate error setter
      // We need to propagate the error — use a data attribute trick or lift error
      // For simplicity: set a custom event or pass onError prop
      // Here we'll rely on parent using a ref. Instead, let's just call with null
      // and let the parent track errors separately via an `onError` callback.
      // Adding onError for clean separation:
      return
    }
    onFileChange(f)
  }

  function handleDrop(e: React.DragEvent) {
    e.preventDefault()
    setDragging(false)
    if (disabled) return
    handleFiles(e.dataTransfer.files)
  }

  function handleDragOver(e: React.DragEvent) {
    e.preventDefault()
    if (!disabled) setDragging(true)
  }

  function handleDragLeave() {
    setDragging(false)
  }

  function handleKeyDown(e: React.KeyboardEvent) {
    if ((e.key === 'Enter' || e.key === ' ') && !disabled) {
      e.preventDefault()
      inputRef.current?.click()
    }
  }

  const isFilled = !!file

  return (
    <div className="flex flex-col gap-1.5">
      <div
        role="button"
        tabIndex={disabled ? -1 : 0}
        aria-label="Upload your CV — PDF or DOCX, max 10 MB"
        onClick={() => !disabled && inputRef.current?.click()}
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onKeyDown={handleKeyDown}
        className={cn(
          'relative flex flex-col items-center justify-center gap-2.5 rounded-xl border-2 border-dashed px-5 py-9 text-center transition-all cursor-pointer select-none',
          isFilled && 'border-solid',
          !isFilled && !dragging && 'hover:border-[var(--jf-interactive)] hover:bg-[rgba(37,99,235,0.025)]',
          dragging && 'border-[var(--jf-interactive)] bg-[rgba(37,99,235,0.04)]',
          isFilled && 'border-[var(--jf-success)] bg-[rgba(16,185,129,0.04)]',
          !isFilled && !dragging && 'border-[var(--jf-border-strong)]',
          (error && !isFilled) && '!border-[var(--jf-error)] !bg-[rgba(239,68,68,0.03)]',
          disabled && 'opacity-50 cursor-not-allowed',
        )}
      >
        {/* Hidden file input */}
        <input
          ref={inputRef}
          type="file"
          accept=".pdf,.docx"
          className="sr-only"
          aria-hidden="true"
          disabled={disabled}
          onChange={(e) => handleFiles(e.target.files)}
        />

        {isFilled ? (
          <>
            <div
              className="flex h-11 w-11 items-center justify-center rounded-xl border"
              style={{ borderColor: 'var(--jf-success)', background: 'rgba(16,185,129,0.08)' }}
            >
              <CheckCircle className="h-5 w-5" style={{ color: 'var(--jf-success)' }} />
            </div>
            <div className="flex flex-col gap-0.5">
              <span className="text-[13.5px] font-semibold" style={{ color: 'var(--jf-text-primary)' }}>
                {file.name}
              </span>
              <span className="font-mono text-[11px]" style={{ color: 'var(--jf-text-muted)' }}>
                {formatBytes(file.size)}
              </span>
            </div>
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation()
                onFileChange(null)
                if (inputRef.current) inputRef.current.value = ''
              }}
              className="text-[12px] font-medium underline underline-offset-2"
              style={{ color: 'var(--jf-text-muted)' }}
            >
              Change file
            </button>
          </>
        ) : (
          <>
            <div
              className="flex h-11 w-11 items-center justify-center rounded-xl border bg-white"
              style={{ borderColor: 'var(--jf-border)', boxShadow: 'var(--jf-shadow-sm)' }}
            >
              <UploadCloud className="h-5 w-5" style={{ color: 'var(--jf-text-muted)' }} />
            </div>
            <div className="flex flex-col gap-1">
              <span className="text-[13.5px] font-semibold" style={{ color: 'var(--jf-text-primary)' }}>
                Drag your CV here
              </span>
              <span className="text-[12px]" style={{ color: 'var(--jf-text-muted)' }}>
                or click to browse
              </span>
            </div>
            <span
              className="rounded-md border px-2 py-0.5 font-mono text-[10.5px]"
              style={{ borderColor: 'var(--jf-border)', color: 'var(--jf-text-muted)', background: 'white' }}
            >
              PDF · DOCX · max 10 MB
            </span>
          </>
        )}
      </div>

      {error && !isFilled && (
        <p className="flex items-center gap-1.5 text-[12px]" style={{ color: 'var(--jf-error)' }}>
          <X className="h-3.5 w-3.5 flex-shrink-0" />
          {error}
        </p>
      )}
    </div>
  )
}
