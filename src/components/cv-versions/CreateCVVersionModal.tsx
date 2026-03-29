'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { FileText, Upload } from 'lucide-react'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { UploadCVModal } from './UploadCVModal'

interface CreateCVVersionModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function CreateCVVersionModal({ open, onOpenChange }: CreateCVVersionModalProps) {
  const router = useRouter()
  const [showUpload, setShowUpload] = useState(false)

  function handleBuildFromTemplate() {
    onOpenChange(false)
    router.push('/cv-versions/new')
  }

  function handleUploadBack() {
    setShowUpload(false)
  }

  function handleUploadClose() {
    setShowUpload(false)
    onOpenChange(false)
  }

  if (showUpload) {
    return (
      <UploadCVModal
        open={open}
        onBack={handleUploadBack}
        onClose={handleUploadClose}
      />
    )
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-[460px] p-0 gap-0 overflow-hidden">
        <DialogHeader className="px-5 pt-5 pb-0">
          <DialogTitle className="text-[17px]">New CV version</DialogTitle>
          <p
            className="mt-1 text-[12.5px]"
            style={{ color: 'var(--jf-text-muted)' }}
          >
            How would you like to start?
          </p>
        </DialogHeader>

        <div className="flex flex-col gap-3 px-5 py-5">
          {/* Build from template */}
          <button
            type="button"
            onClick={handleBuildFromTemplate}
            className="flex items-start gap-4 rounded-xl border p-4 text-left transition-all hover:shadow-sm"
            style={{
              borderColor: 'var(--jf-border)',
              background: 'var(--jf-bg-card)',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.borderColor = 'var(--jf-interactive)'
              e.currentTarget.style.background = 'var(--jf-interactive-subtle)'
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.borderColor = 'var(--jf-border)'
              e.currentTarget.style.background = 'var(--jf-bg-card)'
            }}
          >
            <div
              className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-lg border"
              style={{ borderColor: 'var(--jf-border)', background: 'var(--jf-bg-subtle)' }}
            >
              <FileText className="h-5 w-5" style={{ color: 'var(--jf-interactive)' }} />
            </div>
            <div className="flex flex-col gap-0.5">
              <span className="text-[13.5px] font-semibold" style={{ color: 'var(--jf-text-primary)' }}>
                Build from template
              </span>
              <span className="text-[12px]" style={{ color: 'var(--jf-text-muted)' }}>
                Start with a professional layout and fill it in
              </span>
            </div>
          </button>

          {/* Upload existing CV */}
          <button
            type="button"
            onClick={() => setShowUpload(true)}
            className="flex items-start gap-4 rounded-xl border p-4 text-left transition-all hover:shadow-sm"
            style={{
              borderColor: 'var(--jf-border)',
              background: 'var(--jf-bg-card)',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.borderColor = 'var(--jf-interactive)'
              e.currentTarget.style.background = 'var(--jf-interactive-subtle)'
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.borderColor = 'var(--jf-border)'
              e.currentTarget.style.background = 'var(--jf-bg-card)'
            }}
          >
            <div
              className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-lg border"
              style={{ borderColor: 'var(--jf-border)', background: 'var(--jf-bg-subtle)' }}
            >
              <Upload className="h-5 w-5" style={{ color: 'var(--jf-interactive)' }} />
            </div>
            <div className="flex flex-col gap-0.5">
              <span className="text-[13.5px] font-semibold" style={{ color: 'var(--jf-text-primary)' }}>
                Upload existing CV
              </span>
              <span className="text-[12px]" style={{ color: 'var(--jf-text-muted)' }}>
                Import a PDF or DOCX and pick a template to apply
              </span>
            </div>
          </button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
