'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { ChevronLeft, AlertTriangle } from 'lucide-react'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Switch } from '@/components/ui/switch'
import { Label } from '@/components/ui/label'
import { UploadDropzone } from './UploadDropzone'
import { useCreateCVVersion } from '@/hooks/useCVVersions'

const ACCEPTED_MIME = [
  'application/pdf',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
]
const MAX_BYTES = 10 * 1024 * 1024

const schema = z.object({
  name: z
    .string()
    .min(1, 'Name is required')
    .max(100, 'Maximum 100 characters'),
  is_default: z.boolean(),
})

type FormValues = z.infer<typeof schema>

interface UploadCVModalProps {
  open: boolean
  onBack: () => void
  onClose: () => void
}

export function UploadCVModal({ open, onBack, onClose }: UploadCVModalProps) {
  const router = useRouter()
  const [file, setFile] = useState<File | null>(null)
  const [fileError, setFileError] = useState('')
  const [isParsing, setIsParsing] = useState(false)
  const [parseWarning, setParseWarning] = useState('')
  const createVersion = useCreateCVVersion()

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    reset,
    formState: { errors },
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: { name: '', is_default: false },
  })

  const isDefault = watch('is_default')

  function handleFileChange(f: File | null) {
    setFile(f)
    if (f) {
      setFileError('')
      return
    }
  }

  function handleDrop(f: File | null) {
    if (!f) return
    if (!ACCEPTED_MIME.includes(f.type)) {
      setFileError('Only PDF and DOCX files are supported.')
      setFile(null)
      return
    }
    if (f.size > MAX_BYTES) {
      setFileError('File is too large. Maximum size is 10 MB.')
      setFile(null)
      return
    }
    setFile(f)
    setFileError('')
  }

  function handleClose() {
    reset()
    setFile(null)
    setFileError('')
    setParseWarning('')
    onClose()
  }

  function handleBack() {
    reset()
    setFile(null)
    setFileError('')
    setParseWarning('')
    onBack()
  }

  async function parseFile(f: File): Promise<Record<string, unknown> | null> {
    const formData = new FormData()
    formData.append('file', f)
    try {
      const res = await fetch('/api/cv-versions/parse', { method: 'POST', body: formData })
      if (!res.ok) return null
      const json = await res.json()
      return json.resume_data ?? null
    } catch {
      return null
    }
  }

  async function onSubmit(values: FormValues) {
    if (!file) {
      setFileError('Please select a file to upload.')
      return
    }

    setIsParsing(true)
    setParseWarning('')
    let resume_data: Record<string, unknown> | undefined

    const parsed = await parseFile(file)
    setIsParsing(false)

    if (parsed) {
      resume_data = parsed
    } else {
      setParseWarning("Couldn't auto-fill from your CV — you can complete the sections in the editor.")
    }

    try {
      const version = await createVersion.mutateAsync({
        name: values.name.trim(),
        is_default: values.is_default,
        ...(resume_data ? { resume_data } : {}),
      })
      handleClose()
      router.push(
        `/cv-versions/new?version_id=${version.id}&filename=${encodeURIComponent(file.name)}`
      )
    } catch (err: unknown) {
      // free_limit_reached is handled by the error message from the hook
      // Other errors surface via createVersion.error
      console.error(err)
    }
  }

  return (
    <Dialog open={open} onOpenChange={(v) => !v && handleBack()}>
      <DialogContent className="max-w-[460px] p-0 gap-0 overflow-hidden">
        <DialogHeader className="px-5 pt-5 pb-0">
          <div className="flex items-center gap-2.5">
            <button
              type="button"
              onClick={handleBack}
              className="flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-lg border transition-colors"
              style={{
                borderColor: 'var(--jf-border)',
                background: 'var(--jf-bg-card)',
                color: 'var(--jf-text-muted)',
              }}
              aria-label="Back"
            >
              <ChevronLeft className="h-3.5 w-3.5" />
            </button>
            <DialogTitle className="text-[17px]">Upload your CV</DialogTitle>
          </div>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)}>
          <div className="flex flex-col gap-4 px-5 py-5">
            {/* Dropzone */}
            <UploadDropzone
              file={file}
              onFileChange={handleDrop}
              error={fileError}
              disabled={isParsing || createVersion.isPending}
            />

            {/* Name field */}
            <div className="flex flex-col gap-1.5">
              <Label
                htmlFor="cv-name"
                className="text-[12.5px] font-semibold"
                style={{ color: 'var(--jf-text-secondary)' }}
              >
                Name this version
                <span className="ml-0.5" style={{ color: 'var(--jf-error)' }}>
                  *
                </span>
              </Label>
              <Input
                id="cv-name"
                placeholder="e.g. Backend — NL Market"
                disabled={isParsing || createVersion.isPending}
                {...register('name')}
                className={errors.name ? 'border-[var(--jf-error)]' : ''}
              />
              {errors.name ? (
                <p className="text-[11.5px]" style={{ color: 'var(--jf-error)' }}>
                  {errors.name.message}
                </p>
              ) : (
                <p className="text-[11.5px]" style={{ color: 'var(--jf-text-muted)' }}>
                  Appears on Kanban cards (max ~15 chars shown)
                </p>
              )}
            </div>

            {/* Default toggle */}
            <div className="flex items-center justify-between">
              <div>
                <p className="text-[13px] font-semibold" style={{ color: 'var(--jf-text-primary)' }}>
                  Set as default
                </p>
                <p className="mt-0.5 text-[11.5px]" style={{ color: 'var(--jf-text-muted)' }}>
                  Used in new applications unless changed
                </p>
              </div>
              <Switch
                id="cv-default"
                checked={isDefault}
                onCheckedChange={(v) => setValue('is_default', v)}
                disabled={isParsing || createVersion.isPending}
              />
            </div>

            {/* Parse warning */}
            {parseWarning && (
              <p
                className="flex items-start gap-2 rounded-lg border px-3 py-2 text-[12.5px]"
                style={{
                  borderColor: 'var(--jf-warning-border)',
                  background: 'var(--jf-warning-bg)',
                  color: 'var(--jf-warning)',
                }}
              >
                <AlertTriangle className="h-3.5 w-3.5 flex-shrink-0 mt-px" />
                {parseWarning}
              </p>
            )}

            {/* API error */}
            {createVersion.error && (
              <p
                className="rounded-lg border px-3 py-2 text-[12.5px]"
                style={{
                  borderColor: 'var(--jf-error-border)',
                  background: 'var(--jf-error-bg)',
                  color: 'var(--jf-error)',
                }}
              >
                {createVersion.error.message === 'free_limit_reached'
                  ? 'You have reached the free tier limit (2 CV versions). Upgrade to Pro for unlimited versions.'
                  : createVersion.error.message}
              </p>
            )}
          </div>

          {/* Footer */}
          <div
            className="flex items-center justify-end gap-2 px-5 py-4"
            style={{ borderTop: '1px solid var(--jf-border)' }}
          >
            <Button
              type="button"
              variant="outline"
              onClick={handleBack}
              disabled={isParsing || createVersion.isPending}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={isParsing || createVersion.isPending}>
              {isParsing
                ? 'Reading CV…'
                : createVersion.isPending
                ? 'Saving…'
                : 'Save & choose template →'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
