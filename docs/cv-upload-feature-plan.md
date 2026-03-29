# CV Version — Upload Feature Plan
**Scope:** Upload flow only · Template gallery + editor unchanged · No Kanban, no analytics, no application modal
**Phase:** 2 · **Effort:** ~1 week solo · **Pillar:** Outcome-Linked CV Experimentation

---

## Scope Boundary

| In scope | Out of scope |
|---|---|
| `/cv-versions` page (title, filter tabs, New button) | Kanban CV badge |
| "Create a CV version" two-path modal | CVVersionPicker in application modal |
| Upload modal (dropzone, name, default toggle) | Analytics CV Testing tab |
| `POST /api/cv-versions/upload` (Supabase Storage) | Getting Started checklist step |
| Redirect to `/cv-versions/new` with import context | Template gallery internals |
| Import context banner on template gallery | Editor internals |
| Free tier gate (2 versions, upgrade prompt) | Stage-lock enforcement |

The template gallery (`/cv-versions/new`) and editor (`/cv-versions/[id]/edit`) **already exist and are not modified**, except for one addition: reading an optional `?import=true` query param to show the import context banner. This is a 5-line change, not a rebuild.

---

## 1. What Gets Built (Surfaces Only)

### Surface A — `/cv-versions` page (existing, minor updates)
Three changes only:
1. Header title: `"Resume Builder"` → `"My CVs"`
2. Filter tabs rendered: `Active | All | Archived` with live counts
3. "New CV version" button → opens `<CreateCVVersionModal />`

### Surface B — `<CreateCVVersionModal />` (new)
Two-path modal. User chooses:
- **Build from template** → closes modal, navigates to `/cv-versions/new`
- **Upload existing CV** → closes modal, opens `<UploadCVModal />`

### Surface C — `<UploadCVModal />` (new)
Fields:
- Dropzone (PDF/DOCX, max 10MB)
- Name field (required, max 100 chars)
- "Set as default" toggle
- NO tags (explicitly excluded)

On "Save & choose template":
1. `POST /api/cv-versions/upload` with file + name + is_default
2. On success → navigate to `/cv-versions/new?import=true&version_id={id}`

### Surface D — Template gallery import banner (existing page, 1 addition)
If `?import=true` is in the URL:
- Show a dismissible blue banner: `"[filename] imported · your content will be applied to the chosen template."`
- No other change to the page

---

## 2. Implementation Plan (6 Days)

### Day 1 — Types, Zod, API scaffolding

**Files:**
- `src/types/cv-versions.ts` — add/confirm types
- `src/validations/cv-versions.ts` — Zod schemas
- `src/app/api/cv-versions/route.ts` — GET list, POST create (metadata only)
- `src/app/api/cv-versions/[id]/route.ts` — PATCH, DELETE

**Tasks:**
1. Confirm `cv_versions` table has RLS: `user_id = auth.uid()` on SELECT/INSERT/UPDATE/DELETE
2. Define TypeScript types:
```ts
// src/types/cv-versions.ts
export type CVVersion = {
  id: string
  user_id: string
  name: string
  description: string | null
  tags: string[]
  is_default: boolean
  is_archived: boolean
  file_url: string | null
  file_type: 'pdf' | 'docx' | null
  created_at: string
  updated_at: string
}

export type CVVersionListItem = CVVersion & {
  application_count: number
}

export type CreateCVVersionPayload = {
  name: string
  is_default: boolean
  file_url?: string
  file_type?: 'pdf' | 'docx'
}
```
3. Define Zod schemas:
```ts
// src/validations/cv-versions.ts
export const createCVVersionSchema = z.object({
  name: z.string().min(1, 'Name is required').max(100),
  is_default: z.boolean().default(false),
  file_url: z.string().url().optional(),
  file_type: z.enum(['pdf', 'docx']).optional(),
})

export const uploadCVVersionSchema = z.object({
  name: z.string().min(1).max(100),
  is_default: z.boolean().default(false),
})
```
4. Implement GET `/api/cv-versions`:
```ts
// Returns list with application_count via LEFT JOIN
const { data } = await supabase
  .from('cv_versions')
  .select(`*, job_applications(count)`)
  .eq('user_id', user.id)
  .order('created_at', { ascending: false })
```
5. Implement POST `/api/cv-versions` (metadata only; file handled separately):
   - Check free tier: if `subscription_tier === 'free'` and active count ≥ 2, return `403 { error: 'free_limit_reached' }`
   - Insert row, return created record

**Acceptance signal:** `tsc --noEmit` clean; GET returns user's CV versions; POST enforces free tier.

---

### Day 2 — File Upload API + Supabase Storage

**Files:**
- `src/app/api/cv-versions/upload/route.ts` — multipart POST
- `src/lib/storage/cv-uploads.ts` — upload/delete helpers

**Tasks:**
1. Create Supabase Storage bucket `cv-files` (private):
```sql
-- Storage policy
CREATE POLICY "Users can upload their own CVs"
ON storage.objects FOR INSERT
WITH CHECK (bucket_id = 'cv-files' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Users can read their own CVs"
ON storage.objects FOR SELECT
USING (bucket_id = 'cv-files' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Users can delete their own CVs"
ON storage.objects FOR DELETE
USING (bucket_id = 'cv-files' AND auth.uid()::text = (storage.foldername(name))[1]);
```

2. Implement upload helper:
```ts
// src/lib/storage/cv-uploads.ts
export async function uploadCVFile(
  supabase: SupabaseClient,
  userId: string,
  versionId: string,
  file: File
): Promise<{ path: string; publicUrl: string }> {
  const ext = file.type === 'application/pdf' ? 'pdf' : 'docx'
  const path = `${userId}/${versionId}.${ext}`
  const { error } = await supabase.storage
    .from('cv-files')
    .upload(path, file, { upsert: false, contentType: file.type })
  if (error) throw error
  const { data } = supabase.storage.from('cv-files').getPublicUrl(path)
  return { path, publicUrl: data.publicUrl }
}

export async function deleteCVFile(
  supabase: SupabaseClient,
  path: string
): Promise<void> {
  await supabase.storage.from('cv-files').remove([path])
}
```

3. Implement `POST /api/cv-versions/upload`:
```ts
// src/app/api/cv-versions/upload/route.ts
export async function POST(req: Request) {
  const supabase = createServerClient(...)
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  // Free tier check
  const { count } = await supabase
    .from('cv_versions')
    .select('id', { count: 'exact', head: true })
    .eq('user_id', user.id)
    .eq('is_archived', false)
  const { data: profile } = await supabase
    .from('profiles').select('subscription_tier').eq('id', user.id).single()
  if (profile?.subscription_tier === 'free' && (count ?? 0) >= 2) {
    return NextResponse.json({ error: 'free_limit_reached' }, { status: 403 })
  }

  const formData = await req.formData()
  const file = formData.get('file') as File | null
  const name = formData.get('name') as string
  const isDefault = formData.get('is_default') === 'true'

  // Validate
  if (!file) return NextResponse.json({ error: 'No file' }, { status: 400 })
  const ALLOWED = ['application/pdf', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document']
  if (!ALLOWED.includes(file.type)) return NextResponse.json({ error: 'invalid_file_type' }, { status: 415 })
  if (file.size > 10 * 1024 * 1024) return NextResponse.json({ error: 'file_too_large' }, { status: 413 })

  const parsed = uploadCVVersionSchema.safeParse({ name, is_default: isDefault })
  if (!parsed.success) return NextResponse.json({ error: parsed.error.flatten() }, { status: 422 })

  // Create cv_versions row first (to get ID for storage path)
  const fileType = file.type === 'application/pdf' ? 'pdf' : 'docx'
  const { data: version, error: insertError } = await supabase
    .from('cv_versions')
    .insert({ user_id: user.id, name: parsed.data.name, is_default: parsed.data.is_default, file_type: fileType })
    .select().single()
  if (insertError) return NextResponse.json({ error: insertError.message }, { status: 500 })

  // Upload file
  try {
    const { publicUrl } = await uploadCVFile(supabase, user.id, version.id, file)
    await supabase.from('cv_versions').update({ file_url: publicUrl }).eq('id', version.id)

    // If set as default, unset all others
    if (parsed.data.is_default) {
      await supabase.from('cv_versions')
        .update({ is_default: false })
        .eq('user_id', user.id)
        .neq('id', version.id)
    }

    return NextResponse.json({ ...version, file_url: publicUrl }, { status: 201 })
  } catch (storageError) {
    // Rollback: delete the orphaned row
    await supabase.from('cv_versions').delete().eq('id', version.id)
    return NextResponse.json({ error: 'upload_failed' }, { status: 500 })
  }
}
```

**Acceptance signal:** PDF ≤10MB returns 201 with `file_url`; >10MB returns 413; `.exe` returns 415; cross-user access returns 403.

---

### Day 3 — TanStack Query Hooks

**Files:**
- `src/hooks/cv-versions/useCVVersions.ts`
- `src/hooks/cv-versions/useCreateCVVersion.ts`
- `src/hooks/cv-versions/useUploadCVVersion.ts`
- `src/hooks/cv-versions/useArchiveCVVersion.ts`

**Tasks:**
1. `useCVVersions` — fetches list, exposes `active`, `archived`, `all` filtered arrays:
```ts
// src/hooks/cv-versions/useCVVersions.ts
export function useCVVersions() {
  return useQuery({
    queryKey: ['cv-versions'],
    queryFn: async () => {
      const res = await fetch('/api/cv-versions')
      if (!res.ok) throw new Error('Failed to fetch')
      return res.json() as Promise<CVVersionListItem[]>
    },
  })
}
```

2. `useUploadCVVersion` — multipart mutation with optimistic list invalidation:
```ts
export function useUploadCVVersion() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (payload: { file: File; name: string; is_default: boolean }) => {
      const form = new FormData()
      form.append('file', payload.file)
      form.append('name', payload.name)
      form.append('is_default', String(payload.is_default))
      const res = await fetch('/api/cv-versions/upload', { method: 'POST', body: form })
      if (res.status === 403) {
        const body = await res.json()
        throw new Error(body.error) // 'free_limit_reached'
      }
      if (!res.ok) throw new Error('Upload failed')
      return res.json() as Promise<CVVersion>
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['cv-versions'] }),
  })
}
```

3. `useArchiveCVVersion` with optimistic update + rollback:
```ts
export function useArchiveCVVersion() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (id: string) =>
      fetch(`/api/cv-versions/${id}`, {
        method: 'PATCH',
        body: JSON.stringify({ is_archived: true }),
        headers: { 'Content-Type': 'application/json' },
      }).then(r => r.json()),
    onMutate: async (id) => {
      await queryClient.cancelQueries({ queryKey: ['cv-versions'] })
      const previous = queryClient.getQueryData<CVVersionListItem[]>(['cv-versions'])
      queryClient.setQueryData<CVVersionListItem[]>(['cv-versions'], old =>
        old?.map(v => v.id === id ? { ...v, is_archived: true } : v) ?? []
      )
      return { previous }
    },
    onError: (_err, _id, ctx) => {
      if (ctx?.previous) queryClient.setQueryData(['cv-versions'], ctx.previous)
    },
    onSettled: () => queryClient.invalidateQueries({ queryKey: ['cv-versions'] }),
  })
}
```

**Acceptance signal:** Optimistic archive removes card immediately; simulated 500 rolls back.

---

### Day 4 — `/cv-versions` Page + Cards

**Files:**
- `src/app/(dashboard)/cv-versions/page.tsx`
- `src/components/cv-versions/CVVersionList.tsx`
- `src/components/cv-versions/CVVersionCard.tsx`
- `src/components/cv-versions/CVVersionFilterTabs.tsx`
- `src/components/cv-versions/CVVersionEmptyState.tsx`

**Tasks:**
1. Fix page title: change `"Resume Builder"` → `"My CVs"` in `page.tsx`
2. Add "New CV version" button to header `actions` prop — opens `<CreateCVVersionModal />`
3. Implement `<CVVersionFilterTabs />`:
```tsx
// src/components/cv-versions/CVVersionFilterTabs.tsx
type FilterTab = 'active' | 'all' | 'archived'
const TABS: { key: FilterTab; label: string }[] = [
  { key: 'active', label: 'Active' },
  { key: 'all', label: 'All' },
  { key: 'archived', label: 'Archived' },
]

export function CVVersionFilterTabs({ tab, onChange, counts }: {
  tab: FilterTab
  onChange: (t: FilterTab) => void
  counts: Record<FilterTab, number>
}) { /* pill tabs using role="tablist" + role="tab" + aria-selected */ }
```
4. Free tier gate: if `count >= 2 && tier === 'free'`, "New CV version" button disabled + tooltip "Upgrade to Pro for unlimited CV versions"
5. `CVVersionCard` footer: date left + `[PDF] [Duplicate]` buttons right; `···` dropdown has `Set as default`, `Archive`, `Delete`

**Acceptance signal:** Filter tabs switch views; card count badges update live; free tier disables button at 2 active versions.

---

### Day 5 — Two-Path Modal + Upload Modal

**Files:**
- `src/components/cv-versions/CreateCVVersionModal.tsx`
- `src/components/cv-versions/UploadCVModal.tsx`
- `src/components/cv-versions/UploadDropzone.tsx`

**`<CreateCVVersionModal />`:**
```tsx
// src/components/cv-versions/CreateCVVersionModal.tsx
'use client'
import { useRouter } from 'next/navigation'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'

export function CreateCVVersionModal({
  open,
  onOpenChange,
}: {
  open: boolean
  onOpenChange: (v: boolean) => void
}) {
  const router = useRouter()
  const [showUpload, setShowUpload] = useState(false)

  return (
    <>
      <Dialog open={open && !showUpload} onOpenChange={onOpenChange}>
        <DialogContent className="max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Create a CV version</DialogTitle>
          </DialogHeader>
          <div className="grid grid-cols-2 gap-3">
            {/* Build from template */}
            <button
              className="path-card"
              onClick={() => { onOpenChange(false); router.push('/cv-versions/new') }}
            >
              {/* blue icon, title, desc, CTA */}
            </button>
            {/* Upload existing */}
            <button
              className="path-card purple"
              onClick={() => setShowUpload(true)}
            >
              {/* purple icon, title, desc, CTA */}
            </button>
          </div>
          <div className="pt-4 border-t text-xs text-muted-foreground">
            <span className="font-mono uppercase text-[10px] tracking-wider text-muted-foreground">What's a CV version?</span>
            <p>Each version gets its own screening rate. You'll see which one gets you more interviews.</p>
          </div>
        </DialogContent>
      </Dialog>

      <UploadCVModal
        open={showUpload}
        onBack={() => setShowUpload(false)}
        onClose={() => { setShowUpload(false); onOpenChange(false) }}
      />
    </>
  )
}
```

**`<UploadDropzone />`:**
```tsx
// src/components/cv-versions/UploadDropzone.tsx
'use client'
export function UploadDropzone({
  file,
  onFileChange,
  error,
}: {
  file: File | null
  onFileChange: (f: File | null) => void
  error?: string
}) {
  const inputRef = useRef<HTMLInputElement>(null)
  const [dragging, setDragging] = useState(false)

  function handleDrop(e: React.DragEvent) {
    e.preventDefault()
    setDragging(false)
    const f = e.dataTransfer.files[0]
    if (f) validate(f)
  }

  function validate(f: File) {
    const ALLOWED = ['application/pdf', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document']
    if (!ALLOWED.includes(f.type)) { onFileChange(null); return }
    if (f.size > 10 * 1024 * 1024) { onFileChange(null); return }
    onFileChange(f)
  }

  // Keyboard: Enter/Space opens file picker
  // Drag: border turns blue on dragover, green on filled
  // Mobile: <input type="file" accept=".pdf,.docx"> hidden, tap target ≥ 44px
}
```

**`<UploadCVModal />`:**
```tsx
// src/components/cv-versions/UploadCVModal.tsx
'use client'
export function UploadCVModal({ open, onBack, onClose }: {
  open: boolean
  onBack: () => void
  onClose: () => void
}) {
  const router = useRouter()
  const { register, handleSubmit, formState: { errors } } = useForm<z.infer<typeof uploadCVVersionSchema>>({
    resolver: zodResolver(uploadCVVersionSchema),
    defaultValues: { is_default: false },
  })
  const [file, setFile] = useState<File | null>(null)
  const [fileError, setFileError] = useState<string>('')
  const upload = useUploadCVVersion()

  async function onSubmit(values: z.infer<typeof uploadCVVersionSchema>) {
    if (!file) { setFileError('Please select a file'); return }
    try {
      const version = await upload.mutateAsync({ file, name: values.name, is_default: values.is_default })
      onClose()
      router.push(`/cv-versions/new?import=true&version_id=${version.id}&filename=${encodeURIComponent(file.name)}`)
    } catch (err: unknown) {
      if (err instanceof Error && err.message === 'free_limit_reached') {
        // Show upgrade modal — NOT a generic toast
        // TODO: trigger useUserStore.openUpgradeModal()
      }
    }
  }

  return (
    <Dialog open={open} onOpenChange={(v) => !v && onBack()}>
      <DialogContent className="max-w-[460px]">
        <DialogHeader>
          <div className="flex items-center gap-2.5">
            <button onClick={onBack}>{/* back arrow */}</button>
            <DialogTitle>Upload your CV</DialogTitle>
          </div>
        </DialogHeader>
        <form onSubmit={handleSubmit(onSubmit)}>
          <div className="flex flex-col gap-4 p-5">
            <UploadDropzone file={file} onFileChange={setFile} error={fileError} />
            <div className="flex flex-col gap-1.5">
              <label className="text-[12.5px] font-semibold text-secondary">
                Name this version<span className="text-destructive ml-0.5">*</span>
              </label>
              <Input
                {...register('name')}
                placeholder="e.g. Backend — NL Market"
                className={errors.name ? 'border-destructive' : ''}
              />
              {errors.name && <span className="text-[11.5px] text-destructive">{errors.name.message}</span>}
              <span className="text-[11.5px] text-muted-foreground">Appears on Kanban cards (max ~15 chars shown)</span>
            </div>
            <div className="flex items-center justify-between">
              <div>
                <div className="text-[13px] font-semibold">Set as default</div>
                <div className="text-[11.5px] text-muted-foreground mt-0.5">Used in new applications unless changed</div>
              </div>
              <Switch {...register('is_default')} />
            </div>
          </div>
          <div className="flex justify-end gap-2 px-5 py-4 border-t">
            <Button type="button" variant="outline" onClick={onBack}>Cancel</Button>
            <Button type="submit" disabled={upload.isPending}>
              {upload.isPending ? 'Saving…' : 'Save & choose template →'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
```

**Acceptance signal:** Both path cards work; Upload modal validates file on drop + on submit; "Save & choose template" navigates to `/cv-versions/new?import=true&...` on success.

---

### Day 6 — Template Gallery Import Banner + Mobile Audit

**Files:**
- `src/app/(dashboard)/cv-versions/new/page.tsx` — read `?import` param
- `src/components/cv-versions/ImportContextBanner.tsx` — new, simple

**Task (template gallery — minimal change only):**
```tsx
// In /cv-versions/new/page.tsx
// Server component reads searchParams
export default function NewCVVersionPage({
  searchParams,
}: {
  searchParams: { import?: string; filename?: string; version_id?: string }
}) {
  const isImport = searchParams.import === 'true'
  return (
    <>
      {isImport && (
        <ImportContextBanner
          filename={searchParams.filename ?? 'your CV'}
          versionId={searchParams.version_id}
        />
      )}
      <TemplateGallery /> {/* unchanged */}
    </>
  )
}
```

```tsx
// src/components/cv-versions/ImportContextBanner.tsx
'use client'
export function ImportContextBanner({ filename, versionId }: { filename: string; versionId?: string }) {
  const [dismissed, setDismissed] = useState(false)
  if (dismissed) return null
  return (
    <div role="status" className="flex items-center gap-2.5 rounded-[10px] border border-blue-200 bg-blue-50/60 px-4 py-3 mb-6">
      <CheckCircleIcon className="w-4 h-4 text-blue-600 flex-shrink-0" />
      <span className="text-[13px] text-secondary flex-1">
        <strong className="text-blue-600">{decodeURIComponent(filename)}</strong> imported · your content will be applied to the chosen template.
      </span>
      <button onClick={() => setDismissed(true)} aria-label="Dismiss">
        <XIcon className="w-3.5 h-3.5 text-muted-foreground" />
      </button>
    </div>
  )
}
```

**Mobile audit (390px):**
- Upload modal → bottom sheet on `<640px` (use `Sheet` from shadcn, `side="bottom"`, `className="h-auto max-h-[90dvh] rounded-t-2xl"`)
- Dropzone → min-height `120px`, tap opens file picker
- All tap targets ≥ 44×44px
- Name input → `inputMode="text"`, `autoCapitalize="words"`
- No horizontal overflow on any screen

**Acceptance signal:** 390px viewport shows bottom sheet; dropzone tap opens native file picker on iOS/Android.

---

## 3. User Stories

```
US-01: Page title and header
As a user navigating to /cv-versions,
I want to see "My CVs" as the page title (not "Resume Builder")
so that the naming matches EU conventions.
Acceptance criteria:
- [ ] Header title reads "My CVs"
- [ ] Sidebar nav label reads "My CVs"
Priority: High | Effort: XS | Pillar: CV Experimentation (UX quality)
```

```
US-02: Filter tabs
As a user with multiple CV versions,
I want to switch between Active, All, and Archived tabs with live counts
so that I can manage my CV library without clutter.
Acceptance criteria:
- [ ] Three tabs render: Active (non-archived), All, Archived
- [ ] Each tab shows a count badge
- [ ] Active tab is selected by default
- [ ] Tab switching does NOT refetch — filters client-side from cached data
Priority: High | Effort: S | Pillar: CV Experimentation
```

```
US-03: New CV version entry point
As a user on /cv-versions,
I want to click "New CV version" and see two clear paths
so that I understand my options before committing.
Acceptance criteria:
- [ ] Button opens <CreateCVVersionModal />
- [ ] Modal shows two path cards: "Build from template" and "Upload existing CV"
- [ ] Free tier at 2 active versions: button disabled, tooltip says "Upgrade for unlimited"
- [ ] Clicking outside the modal closes it
Priority: High | Effort: S | Pillar: CV Experimentation
```

```
US-04: Build from template path
As a user who wants to create a new CV from scratch,
I want to click "Build from template" and land on the template gallery
so that I can choose a starting point for my CV.
Acceptance criteria:
- [ ] Clicking "Build from template" closes the modal
- [ ] User is navigated to /cv-versions/new
- [ ] Template gallery shows no import banner (clean state)
- [ ] Back button in template gallery returns to /cv-versions
Priority: High | Effort: XS | Pillar: CV Experimentation
```

```
US-05: Upload existing CV — file selection
As a user who already has a CV file,
I want to drag-and-drop or browse to upload my PDF or DOCX
so that I can use my existing CV as the basis for a new version.
Acceptance criteria:
- [ ] Accepts PDF and DOCX only; shows error for other types
- [ ] Rejects files over 10MB with a clear message
- [ ] Drag-over changes dropzone border color to blue
- [ ] Filled state shows filename + file size + "Change" link
- [ ] Keyboard: Enter/Space on focused dropzone opens file picker
- [ ] Mobile: tapping dropzone opens native file picker
Priority: High | Effort: M | Pillar: CV Experimentation
```

```
US-06: Upload existing CV — name and save
As a user who has selected a file,
I want to name my CV version and optionally set it as default
before being redirected to choose a template.
Acceptance criteria:
- [ ] Name field required (cannot submit empty)
- [ ] Name max 100 chars; inline error if exceeded
- [ ] "Set as default" toggle, off by default
- [ ] NO tags field in this modal
- [ ] "Save & choose template" submits the form
- [ ] While uploading: button shows "Saving…", form is disabled
Priority: High | Effort: S | Pillar: CV Experimentation
```

```
US-07: Upload → Template Gallery redirect
As a user who has saved an uploaded CV,
I want to be redirected to /cv-versions/new with my import context preserved
so that I can choose which template to apply to my content.
Acceptance criteria:
- [ ] On save success: navigate to /cv-versions/new?import=true&version_id={id}&filename={name}
- [ ] Template gallery shows import context banner with filename
- [ ] Banner is dismissible
- [ ] Template gallery internals are unchanged
Priority: High | Effort: S | Pillar: CV Experimentation
```

```
US-08: Free tier upload gate
As a free-tier user who already has 2 active CV versions,
I want to see a clear upgrade prompt (not a generic error)
when I try to upload a third version.
Acceptance criteria:
- [ ] "New CV version" button disabled at 2 active versions
- [ ] Clicking the disabled button shows an upgrade modal (NOT a toast)
- [ ] API returns 403 { error: 'free_limit_reached' }
- [ ] UI reads this error code and triggers the upgrade modal
Priority: High | Effort: S | Pillar: CV Experimentation (conversion trigger)
```

```
US-09: Upload error recovery
As a user whose upload fails mid-way,
I want to see a clear error state with a retry option
so that I don't lose my progress.
Acceptance criteria:
- [ ] Network error: shows "Upload failed. Try again." with a Retry button
- [ ] 413: shows "File too large (max 10MB)"
- [ ] 415: shows "Only PDF and DOCX files are supported"
- [ ] On any error: form remains filled (no data loss), user can retry or change file
- [ ] Orphaned cv_versions row cleaned up on storage failure (server-side rollback)
Priority: High | Effort: S | Pillar: CV Experimentation
```

---

## 4. Corner Cases

### File Upload
| Case | Expected behavior |
|---|---|
| File exactly 10MB | Accepted |
| File 10MB + 1 byte | 413 — "File is too large. Maximum size is 10MB." |
| File is `.pdf` with MIME `application/octet-stream` | Rejected — validate by MIME type, not extension |
| File is a renamed `.exe` with `.pdf` extension | Rejected by MIME validation |
| File name contains special chars (`CV José Müller.pdf`) | Accepted — store by UUID path, not filename |
| User uploads same filename twice | Accepted — storage path is `{user_id}/{version_id}.ext`, unique each time |
| User drops a folder instead of a file | No-op — `e.dataTransfer.files[0]` will be undefined, show error |
| DOCX from Google Docs export (MIME `application/zip`) | Rejected — only accept exact DOCX MIME type |
| Upload succeeds but `cv_versions` INSERT fails | Storage file deleted (cleanup in route handler) |
| Upload succeeds, INSERT succeeds, `file_url` PATCH fails | Record created without `file_url` — show error, record is orphaned but row exists; log for manual cleanup |

### Free Tier Limit
| Case | Expected behavior |
|---|---|
| User has 1 active, 1 archived | Count = 1 active; "New CV version" enabled |
| User has 2 active, 0 archived | Count = 2 active; button disabled |
| User has 2 active, upgrades to Pro mid-session | Button re-enables on next render via `useUserStore` rehydration |
| User archives one of 2 → clicks "New CV version" | Count = 1 active; creation allowed |
| API and UI show different counts (race condition) | API is authoritative; 403 triggers upgrade modal even if UI showed button as enabled |

### Default CV Logic
| Case | Expected behavior |
|---|---|
| User creates first CV with `is_default: true` | Only this CV has `is_default = true` |
| User creates second CV with `is_default: true` | First CV's `is_default` set to `false` atomically in server route |
| User archives the default CV | `is_default` remains `true` on the archived record; no auto-reassignment |
| User deletes the only CV | No default CV; `CVVersionPicker` shows "(None)" |

### Upload Modal Fields
| Case | Expected behavior |
|---|---|
| Name field is empty on submit | Inline error: "Name is required" — form does not submit |
| Name is 100 chars exactly | Accepted |
| Name is 101 chars | Inline error: "Maximum 100 characters" |
| Name contains emoji | Accepted — Unicode-safe |
| User presses Enter in name field | Submits form (default button behavior) |
| User closes modal mid-upload | Upload continues in background; on success, query invalidated silently |

### Mobile
| Case | Expected behavior |
|---|---|
| Upload modal on 390px | Renders as bottom sheet (shadcn `<Sheet side="bottom">`) |
| Dropzone tap on iOS | `<input type="file" accept=".pdf,.docx">` triggered, opens native picker |
| Dropzone on Android Chrome | Same — native file picker, supports DOCX |
| Name input on mobile | `inputMode="text"` set; keyboard does not push content off screen |
| "Save & choose template" button while uploading | Disabled + shows "Saving…" text; prevents double-submit |

---

## 5. BDD Scenarios (Gherkin)

```gherkin
Feature: Create CV Version — Build from Template

  Background:
    Given I am logged in as a Pro user
    And I am on the /cv-versions page

  Scenario: User navigates to template gallery via modal
    When I click "New CV version"
    Then I see the "Create a CV version" modal
    When I click "Build from template"
    Then the modal closes
    And I am on /cv-versions/new
    And no import banner is visible

  Scenario: Free tier user at limit cannot open the modal
    Given I am a free-tier user with 2 active CV versions
    When I hover over the "New CV version" button
    Then the button is disabled
    And a tooltip reads "Upgrade to Pro for unlimited CV versions"
    When I click the disabled button
    Then the upgrade modal opens
    And the create modal does NOT open

  Scenario: Back navigation from template gallery
    When I click "New CV version"
    And I click "Build from template"
    And I am on /cv-versions/new
    When I click the back button
    Then I am on /cv-versions
```

```gherkin
Feature: Create CV Version — Upload Existing

  Background:
    Given I am logged in as a Pro user
    And I am on the /cv-versions page

  Scenario: Happy path — upload PDF and reach template gallery
    When I click "New CV version"
    And I click "Upload existing CV"
    Then the upload modal opens
    When I drop "Backend_NL.pdf" (4MB) onto the dropzone
    Then the dropzone shows "Backend_NL.pdf · 4 MB · File ready"
    When I type "Backend — NL Market" in the name field
    And I click "Save & choose template"
    Then I see "Saving…" on the button
    And the form is disabled
    When the upload completes
    Then I am on /cv-versions/new?import=true
    And the import banner reads "Backend_NL.pdf imported · your content will be applied to the chosen template."

  Scenario: Upload modal has no tags field
    When I click "New CV version"
    And I click "Upload existing CV"
    Then the upload modal is visible
    And I do NOT see a "Tags" field

  Scenario: Invalid file type rejected
    When I click "New CV version"
    And I click "Upload existing CV"
    And I drop "resume.docm" onto the dropzone
    Then I see "Only PDF and DOCX files are supported"
    And the "Save & choose template" button remains disabled

  Scenario: File too large
    When I drop a 15MB PDF onto the dropzone
    Then I see "File is too large. Maximum size is 10MB."
    And the dropzone is not in filled state

  Scenario: Name field is required
    When I upload a valid PDF
    And I leave the name field empty
    And I click "Save & choose template"
    Then I see "Name is required" under the name field
    And no API call is made

  Scenario: Back button returns to two-path modal
    When I click "New CV version"
    And I click "Upload existing CV"
    And I see the upload modal
    When I click the back arrow
    Then the upload modal closes
    And the two-path modal is visible again

  Scenario: Upload failure shows retry option
    When I upload a valid PDF with a valid name
    And the server returns a 500 error
    Then I see "Upload failed. Try again."
    And a "Retry" button is visible
    And the form fields remain filled
    When I click "Retry"
    Then the upload is attempted again
```

```gherkin
Feature: Import Context Banner on Template Gallery

  Scenario: Banner visible when coming from upload flow
    Given I have just completed the upload modal
    When I land on /cv-versions/new?import=true&filename=Backend_NL.pdf
    Then I see the import banner
    And the banner reads "Backend_NL.pdf imported · your content will be applied to the chosen template."

  Scenario: Banner not visible on direct navigation
    When I navigate to /cv-versions/new directly (no query params)
    Then no import banner is visible

  Scenario: Banner can be dismissed
    Given the import banner is visible
    When I click the X on the banner
    Then the banner disappears
    And the template gallery remains unchanged

  Scenario: Template gallery is otherwise unchanged
    Given I am on /cv-versions/new with or without import params
    Then the template cards, layout, and navigation are identical in both cases
```

```gherkin
Feature: Filter Tabs on /cv-versions

  Background:
    Given I am logged in and have 3 active + 1 archived CV version

  Scenario: Default tab shows active versions
    When I am on /cv-versions
    Then the "Active" tab is selected
    And I see 3 CV version cards

  Scenario: Switching to All shows all versions
    When I click the "All" tab
    Then I see 4 CV version cards

  Scenario: Switching to Archived shows archived versions
    When I click the "Archived" tab
    Then I see 1 CV version card

  Scenario: Tab counts update after archiving
    Given I am on the "Active" tab showing 3 versions
    When I archive one CV version
    Then the "Active" tab count updates to 2
    And the "Archived" tab count updates to 2
    And the current view reflects the change immediately (optimistic)
```

---

## 6. API Contract (Upload Feature Only)

### GET /api/cv-versions
```
Response 200:
[
  {
    "id": "uuid",
    "name": "Backend — NL Market",
    "description": null,
    "tags": [],
    "is_default": true,
    "is_archived": false,
    "file_url": "https://...supabase.co/storage/v1/object/public/cv-files/user-id/version-id.pdf",
    "file_type": "pdf",
    "application_count": 5,
    "created_at": "2026-03-20T10:00:00Z",
    "updated_at": "2026-03-20T10:00:00Z"
  }
]

Error 401: { "error": "Unauthorized" }
```

### POST /api/cv-versions/upload
```
Request: multipart/form-data
  file:       File (PDF or DOCX, max 10MB)
  name:       string (required, max 100)
  is_default: "true" | "false"

Response 201: CVVersion (full record with file_url set)

Error 400: { "error": "No file" }
Error 401: { "error": "Unauthorized" }
Error 403: { "error": "free_limit_reached" }
Error 413: { "error": "file_too_large", "message": "File is too large. Maximum size is 10MB." }
Error 415: { "error": "invalid_file_type", "message": "Only PDF and DOCX files are supported." }
Error 422: { "error": { "fieldErrors": { "name": ["Name is required"] } } }
Error 500: { "error": "upload_failed" }
```

### PATCH /api/cv-versions/:id
```
Request: application/json
  { "name"?: string, "is_archived"?: boolean, "is_default"?: boolean }

Response 200: Updated CVVersion
Error 401: Unauthorized
Error 403: Not owner
Error 404: Not found
Error 422: Validation error
```

### DELETE /api/cv-versions/:id
```
Response 200: { "deleted": true }
  Note: if version is referenced by any job_application, soft-archive instead of hard-delete.
        Return { "archived": true, "reason": "version_in_use" } with 200.

Error 401: Unauthorized
Error 403: Not owner
Error 404: Not found
```

---

## 7. Component Inventory (Upload Feature Only)

| Component | Path | New / Modified | Mobile |
|---|---|---|---|
| `CVVersionFilterTabs` | `src/components/cv-versions/CVVersionFilterTabs.tsx` | New | Single row, scrollable on mobile |
| `CreateCVVersionModal` | `src/components/cv-versions/CreateCVVersionModal.tsx` | New | Bottom sheet `<640px` |
| `UploadDropzone` | `src/components/cv-versions/UploadDropzone.tsx` | New | Full-width tap target, opens file picker |
| `UploadCVModal` | `src/components/cv-versions/UploadCVModal.tsx` | New | Bottom sheet `<640px` |
| `ImportContextBanner` | `src/components/cv-versions/ImportContextBanner.tsx` | New | Full-width, dismissible |
| `CVVersionCard` | `src/components/cv-versions/CVVersionCard.tsx` | Modified | Already mobile-first |
| `CVVersionList` | `src/components/cv-versions/CVVersionList.tsx` | Modified | Add filter tab state |
| `/cv-versions/page.tsx` | `src/app/(dashboard)/cv-versions/page.tsx` | Modified | Title + actions prop |
| `/cv-versions/new/page.tsx` | `src/app/(dashboard)/cv-versions/new/page.tsx` | Modified | Read `?import` param only |

### `UploadDropzone` Props
```ts
interface UploadDropzoneProps {
  file: File | null
  onFileChange: (f: File | null) => void
  error?: string         // shown below dropzone
  disabled?: boolean
}
```

### `CreateCVVersionModal` Props
```ts
interface CreateCVVersionModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}
```

### `UploadCVModal` Props
```ts
interface UploadCVModalProps {
  open: boolean
  onBack: () => void    // returns to two-path modal
  onClose: () => void   // closes the entire flow
}
```

### `ImportContextBanner` Props
```ts
interface ImportContextBannerProps {
  filename: string
  versionId?: string
}
```

---

## 8. Acceptance Checklist

- [ ] Header title on `/cv-versions` reads "My CVs"
- [ ] Filter tabs (Active / All / Archived) render with live counts
- [ ] "New CV version" button opens two-path modal
- [ ] "Build from template" → navigates to `/cv-versions/new` (no import context)
- [ ] "Upload existing CV" → opens upload modal
- [ ] Upload modal has NO tags field
- [ ] Dropzone: accepts PDF + DOCX only; rejects >10MB; keyboard accessible
- [ ] Name field: required, max 100 chars, Zod validated on client + server
- [ ] "Set as default" toggle: off by default, works correctly
- [ ] Save success → navigate to `/cv-versions/new?import=true&...`
- [ ] Import banner visible on template gallery when `?import=true`
- [ ] Banner dismissible; template gallery otherwise unchanged
- [ ] Free tier at 2 active versions: button disabled, upgrade modal on click
- [ ] API returns 403 `free_limit_reached` (not 422, not 500)
- [ ] Upload failure: error message + Retry button; no data loss; orphaned files cleaned up
- [ ] Mobile: upload modal is a bottom sheet at `<640px`
- [ ] Mobile: dropzone tap opens native file picker
- [ ] All tap targets ≥ 44×44px
- [ ] RLS: all queries scoped to `auth.uid()`
- [ ] TanStack Query: optimistic archive + rollback on error
- [ ] E2E Playwright: upload flow from modal → success → template gallery with import banner
- [ ] TypeScript: `tsc --noEmit` clean, zero `any`
