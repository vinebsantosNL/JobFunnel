# CV Version Management — Sprint 1 / Phase 2 Implementation Plan

---

## 1. Implementation Plan (10-Day Sprint)

### Day 1 — Foundation & Database

**Goal:** Confirm schema, seed types, scaffold route shell.

**Files touched:**
- `src/types/cv-versions.ts` — define all TypeScript types
- `src/lib/supabase/queries/cv-versions.ts` — raw Supabase query functions
- `src/app/(dashboard)/cv-versions/page.tsx` — route shell (Server Component)
- `src/app/(dashboard)/cv-versions/new/page.tsx` — route shell
- `src/app/(dashboard)/cv-versions/[id]/edit/page.tsx` — route shell
- `src/validations/cv-versions.ts` — Zod schemas

**Tasks:**
1. Audit `cv_versions` table in Supabase; confirm RLS policy `user_id = auth.uid()` is active on SELECT, INSERT, UPDATE, DELETE
2. Add `index` on `cv_versions(user_id, is_archived, created_at)` for list query performance
3. Add `index` on `job_applications(cv_version_id)` for analytics joins
4. Define `CVVersion`, `CVVersionListItem`, `CreateCVVersionPayload`, `UpdateCVVersionPayload` types
5. Define Zod schemas: `createCVVersionSchema`, `updateCVVersionSchema`, `assignCVVersionSchema`
6. Scaffold route pages with `<Suspense>` boundaries and loading skeletons

**Acceptance signal:** `tsc --noEmit` passes; routes render a placeholder without hydration errors.

---

### Day 2 — API Routes (CRUD)

**Goal:** Full REST API for CV versions.

**Files touched:**
- `src/app/api/cv-versions/route.ts` — GET list, POST create
- `src/app/api/cv-versions/[id]/route.ts` — GET single, PATCH update, DELETE
- `src/app/api/cv-versions/[id]/set-default/route.ts` — POST set default
- `src/app/api/jobs/[id]/cv-version/route.ts` — POST assign CV to job (with stage-lock)
- `src/lib/supabase/server.ts` — confirm `createServerClient` utility exists

**Tasks:**
1. Implement GET `/api/cv-versions` with free tier count check
2. Implement POST `/api/cv-versions` without file (metadata only; file upload is Day 3)
3. Implement PATCH `/api/cv-versions/:id` with ownership check
4. Implement DELETE `/api/cv-versions/:id` — soft-archive if used in any `job_applications`, hard-delete if unused
5. Implement POST `/api/cv-versions/:id/set-default` — atomically unset previous default, set new one
6. Implement POST `/api/jobs/:id/cv-version` with stage-lock: reject with 422 if `stage NOT IN ('saved', 'applied')`

**Acceptance signal:** All routes return correct status codes; Postman/curl tests confirm RLS blocks cross-user access.

---

### Day 3 — File Upload API & Storage

**Goal:** Supabase Storage integration for PDF/DOCX uploads.

**Files touched:**
- `src/app/api/cv-versions/upload/route.ts` — multipart POST
- `src/lib/storage/cv-uploads.ts` — upload, delete, getSignedUrl helpers
- Supabase Storage bucket: `cv-files` (private, user-scoped path `{user_id}/{cv_version_id}.{ext}`)

**Tasks:**
1. Create `cv-files` bucket in Supabase with policy: authenticated users can read/write/delete only `{auth.uid()}/*`
2. Implement upload route: validate MIME type (`application/pdf`, `application/vnd.openxmlformats-officedocument.wordprocessingml.document`), file size ≤10MB, stream to Supabase Storage
3. On success: create `cv_versions` row with `file_url` and `file_type`; return version record
4. Implement signed URL helper for downloads (24h expiry)
5. Add cleanup: if `cv_versions` row creation fails after successful upload, delete the orphaned file

**Acceptance signal:** PDF and DOCX upload successfully; > 10MB file returns 413; wrong type returns 415.

---

### Day 4 — TanStack Query Hooks & Zustand Store

**Goal:** Client-side data layer complete.

**Files touched:**
- `src/hooks/cv-versions/useCVVersions.ts`
- `src/hooks/cv-versions/useCVVersion.ts`
- `src/hooks/cv-versions/useCreateCVVersion.ts`
- `src/hooks/cv-versions/useUpdateCVVersion.ts`
- `src/hooks/cv-versions/useDeleteCVVersion.ts`
- `src/hooks/cv-versions/useSetDefaultCVVersion.ts`
- `src/hooks/cv-versions/useAssignCVVersion.ts`
- `src/store/useUserStore.ts` — add `cvVersionCount` derived field

**Tasks:**
1. Implement all TanStack Query v5 hooks with `queryKey` namespacing: `['cv-versions']`, `['cv-versions', id]`
2. Optimistic updates in `useDeleteCVVersion` (remove from list immediately, rollback on error)
3. Optimistic update in `useSetDefaultCVVersion` (toggle `is_default` locally)
4. Invalidate `['cv-versions']` after any mutation
5. Add `cvVersionCount` selector to `useUserStore`; populated from `useCVVersions` query result
6. Add `['cv-versions']` to Zustand subscription for free-tier gating logic

**Acceptance signal:** Stale-while-revalidate works; optimistic deletes roll back on simulated 500; TypeScript types are inferred end-to-end.

---

### Day 5 — CV Versions List Page & Cards

**Goal:** `/app/cv-versions` fully functional.

**Files touched:**
- `src/app/(dashboard)/cv-versions/page.tsx`
- `src/components/cv-versions/CVVersionList.tsx`
- `src/components/cv-versions/CVVersionCard.tsx`
- `src/components/cv-versions/CVVersionEmptyState.tsx`
- `src/components/cv-versions/CVVersionFilterTabs.tsx`
- `src/components/cv-versions/CVVersionCardMenu.tsx`

**Tasks:**
1. List page fetches via `useCVVersions`; shows active/archived tabs
2. `CVVersionCard` shows: name, description snippet, tags (up to 3, overflow count), default badge, file type icon, creation date, application count, menu
3. Card menu: Edit, Set as Default, Duplicate, Archive/Unarchive, Delete (with `AlertDialog` confirmation)
4. `CVVersionEmptyState` with CTA "Create your first CV version"
5. `CVVersionFilterTabs` — "Active" (non-archived) and "Archived" tabs with count badges
6. "New CV version" button → opens `CreateCVVersionModal`
7. Free tier: if count ≥ 2 and tier === 'free', "New CV version" button shows upgrade prompt instead

**Acceptance signal:** Cards render, delete with rollback works, archived tab filters correctly, free tier gate blocks creation.

---

### Day 6 — Create Modal & Upload Flow

**Goal:** Flow #02 (Upload existing CV) fully functional.

**Files touched:**
- `src/components/cv-versions/CreateCVVersionModal.tsx`
- `src/components/cv-versions/UploadDropzone.tsx`
- `src/components/cv-versions/UploadCVModal.tsx`
- `src/store/useCVVersionDraftStore.ts` — ephemeral Zustand store for import session

**Tasks:**
1. `CreateCVVersionModal`: two-button chooser — "Build from template" and "Upload existing CV"
2. "Build from template" closes modal, navigates to `/app/cv-versions/new`
3. "Upload existing CV" opens `UploadCVModal`
4. `UploadDropzone`: drag-and-drop + click-to-browse; shows file preview (name, size, type icon); validates client-side before upload
5. `UploadCVModal` fields: file dropzone, Name (required, max 100 chars), Set as default (toggle), no tags
6. On "Save & choose template": call POST `/api/cv-versions/upload`, store resulting `cv_version_id` + `file_url` + `file_name` in `useCVVersionDraftStore`, navigate to `/app/cv-versions/new`
7. Mobile: file picker on iOS/Android via `<input type="file" accept=".pdf,.docx">` inside dropzone

**Acceptance signal:** Upload completes; draft store persists across navigation to template gallery; iOS file picker opens correct document picker.

---

### Day 7 — Template Gallery

**Goal:** `/app/cv-versions/new` with import banner.

**Files touched:**
- `src/app/(dashboard)/cv-versions/new/page.tsx`
- `src/components/cv-versions/TemplateGallery.tsx`
- `src/components/cv-versions/TemplateCard.tsx`
- `src/components/cv-versions/ImportBanner.tsx`
- `src/data/cv-templates.ts` — static template metadata

**Tasks:**
1. `TemplateGallery` reads `useCVVersionDraftStore`; if `importedFileName` is set, shows `ImportBanner` at top
2. `ImportBanner`: "CV_filename.pdf imported · your content will be applied to the template" with dismiss button
3. Template cards: name, preview thumbnail (placeholder image), role tags (e.g., "Software Engineer", "Product Manager"), "Select" CTA
4. On template select: if import session active — navigate to `/app/cv-versions/[id]/edit?imported=true`; if fresh build — navigate to `/app/cv-versions/[id]/edit`
5. Back button returns to `/app/cv-versions` and clears draft store
6. Responsive: 1 col on mobile, 2 col on tablet, 3 col on desktop

**Acceptance signal:** Import banner shows only when draft store has a file; selecting template navigates with correct query param; back clears store.

---

### Day 8 — CV Editor

**Goal:** `/app/cv-versions/[id]/edit` basic editor (metadata + sections scaffold).

**Files touched:**
- `src/app/(dashboard)/cv-versions/[id]/edit/page.tsx`
- `src/components/cv-versions/CVEditor.tsx`
- `src/components/cv-versions/CVEditorHeader.tsx`
- `src/components/cv-versions/CVEditorSidebar.tsx`
- `src/components/cv-versions/CVEditorCanvas.tsx`
- `src/components/cv-versions/ImportSourcePanel.tsx`
- `src/components/cv-versions/CVEditorTagInput.tsx`

**Tasks:**
1. `CVEditorHeader`: CV name (inline-editable input), Save button, Back link, unsaved-changes indicator
2. `CVEditorSidebar` (right panel): CV metadata — description, tags (`CVEditorTagInput`), set-as-default toggle, application count, file info if imported
3. `ImportSourcePanel`: shown in sidebar when `?imported=true`; displays source file name + "Imported content" label in green; shows green import banner at top of canvas
4. `CVEditorCanvas`: placeholder section blocks (Personal Info, Experience, Education, Skills) — Phase 2 Sprint 2 will add full rich editing; for now, editable `<textarea>` per section with auto-save debounce (800ms)
5. Auto-save via `useUpdateCVVersion` mutation; shows "Saved" / "Saving…" / "Error — Retry" indicator
6. On Save button: flush debounce, call PATCH, navigate to `/app/cv-versions` on success
7. Clear `useCVVersionDraftStore` on successful save

**Acceptance signal:** Auto-save fires after 800ms of inactivity; "Unsaved changes" indicator appears on edit; navigating away with unsaved changes shows `AlertDialog` confirmation.

---

### Day 9 — Kanban Integration & Application Modal

**Goal:** CV badge on Kanban cards; CVVersionPicker in application modal.

**Files touched:**
- `src/components/pipeline/ApplicationCard.tsx` — add CV badge
- `src/components/pipeline/ApplicationModal.tsx` — add CVVersionPicker section
- `src/components/cv-versions/CVVersionPicker.tsx` — new combobox component
- `src/components/cv-versions/CVVersionBadge.tsx` — new badge component

**Tasks:**
1. `CVVersionBadge`: truncate CV name at 15 chars with ellipsis; tooltip on hover with full name; purple `#8B5CF6` background; hidden if no CV assigned
2. Add `CVVersionBadge` to `ApplicationCard` below job title, above stage chip
3. `CVVersionPicker`: shadcn/ui `Popover` + `Command` combobox; shows list of active (non-archived) CV versions; "Unassigned" option always at top; search/filter within picker
4. In `ApplicationModal`, add "CV Version" field using `CVVersionPicker`; disabled and shows "Locked — application past applied stage" when `stage NOT IN ('saved', 'applied')`
5. On picker change: call POST `/api/jobs/:id/cv-version`; optimistic update on `ApplicationCard`
6. Mobile: `CVVersionPicker` uses bottom sheet on `<640px`

**Acceptance signal:** Badge truncates at 15 chars; picker is disabled at `screening+`; optimistic update shows immediately; rollback on API error.

---

### Day 10 — Analytics Integration, Getting Started Checklist, QA

**Goal:** Analytics attribution, checklist step, final polish and mobile review.

**Files touched:**
- `src/app/(dashboard)/analytics/cv-testing/page.tsx` — CV A/B comparison page scaffold
- `src/lib/supabase/queries/analytics.ts` — update funnel queries to LEFT JOIN cv_versions
- `src/components/dashboard/GettingStartedChecklist.tsx` — add CV version step
- `src/components/cv-versions/CVVersionLowConfidenceBadge.tsx`
- `src/app/api/analytics/cv-comparison/route.ts` — GET endpoint

**Tasks:**
1. Update funnel analytics query to LEFT JOIN cv_versions; NULL `cv_version_id` groups as "Untagged"
2. `/api/analytics/cv-comparison`: return per-version `{ name, applicationCount, screeningRate, interviewRate, offerRate }`; include archived versions that have applications
3. `CVVersionLowConfidenceBadge`: shown on any version with `applicationCount < 10`; tooltip "Not enough data — add more applications with this CV to get reliable stats"
4. CV A/B page: Recharts `BarChart` comparing stage conversion rates per CV version; "Low confidence" badges; "Untagged" row always shown last
5. `GettingStartedChecklist`: add step "Upload or create your first CV version" — complete when `cvVersionCount >= 1`
6. Full mobile walk-through: 390px viewport; verify upload modal, template gallery, editor sidebar collapse, Kanban badge, application modal picker all work
7. Run `tsc --noEmit`, `eslint`, and full build

**Acceptance signal:** Analytics page renders with correct data; low-confidence badge appears at < 10 applications; checklist step completes on first CV version creation; zero TypeScript errors; zero ESLint warnings.

---

## 2. User Stories

```
US-01: CV Versions List Page
As a job seeker, I want to see all my CV versions in one place so that I can manage and compare them.
Acceptance criteria:
- [ ] Page loads at /app/cv-versions with a list of all non-archived CV versions
- [ ] Each card shows: name, description snippet, tags, default badge, file type icon, creation date, application count
- [ ] "Active" and "Archived" tabs with counts are shown at the top
- [ ] Empty state shows "Create your first CV version" CTA when no versions exist
- [ ] Page is accessible without horizontal scroll on 390px viewport
Priority: High | Effort: M | Pillar: CV Experimentation
```

```
US-02: Filter Tabs (Active / Archived)
As a job seeker, I want to toggle between active and archived CV versions so that I can access older versions without cluttering my main list.
Acceptance criteria:
- [ ] "Active" tab shows only versions where is_archived = false
- [ ] "Archived" tab shows only versions where is_archived = true
- [ ] Tab badge counts update immediately after archive/unarchive action
- [ ] Default tab on page load is "Active"
- [ ] URL does not change when switching tabs (client-side filter only)
Priority: Med | Effort: S | Pillar: CV Experimentation
```

```
US-03: Create CV Version Modal (Entry Point)
As a job seeker, I want to choose between building from a template or uploading my existing CV so that I can start a new version in the way that suits my workflow.
Acceptance criteria:
- [ ] "New CV version" button opens a modal with two clearly labeled options
- [ ] "Build from template" navigates to /app/cv-versions/new (template gallery)
- [ ] "Upload existing CV" opens the Upload CV modal
- [ ] Modal is dismissible via Escape key and clicking outside
- [ ] On mobile (<640px), modal renders as a bottom sheet
Priority: High | Effort: S | Pillar: CV Experimentation
```

```
US-04: Upload Existing CV Flow
As a job seeker, I want to upload my existing PDF or DOCX CV so that I can use it as a starting point for a new version.
Acceptance criteria:
- [ ] Dropzone accepts PDF and DOCX files only; other types show inline error
- [ ] Files over 10MB show inline error "File too large — maximum 10MB"
- [ ] Name field is required and max 100 characters
- [ ] "Set as default" toggle is available and defaults to off
- [ ] "Save & choose template" button is disabled until file and name are provided
- [ ] On success, user is redirected to /app/cv-versions/new with import banner visible
- [ ] On mobile, clicking the dropzone opens the native document picker
Priority: High | Effort: M | Pillar: CV Experimentation
```

```
US-05: Template Gallery
As a job seeker, I want to browse and select a CV template so that I can build a professionally formatted CV.
Acceptance criteria:
- [ ] Gallery shows all available templates with name, preview thumbnail, and role tags
- [ ] Import banner is shown at the top when arriving from the upload flow
- [ ] Import banner shows the uploaded file's name
- [ ] Selecting a template navigates to the editor
- [ ] Back button returns to /app/cv-versions and clears any import session
- [ ] Gallery is 1-column on mobile, 2-column on tablet, 3-column on desktop
Priority: High | Effort: M | Pillar: CV Experimentation
```

```
US-06: CV Editor
As a job seeker, I want to edit my CV content and metadata within the app so that I can iterate on my CV without switching tools.
Acceptance criteria:
- [ ] Editor shows an inline-editable name field in the header
- [ ] Sidebar shows description, tags, set-as-default toggle, and file info if imported
- [ ] Content auto-saves 800ms after last edit with "Saving…" / "Saved" / "Error — Retry" indicator
- [ ] "Save" button flushes debounce and navigates to /app/cv-versions on success
- [ ] Navigating away with unsaved changes shows a confirmation dialog
- [ ] When arriving from upload flow, green import banner and ImportSourcePanel are shown
Priority: High | Effort: L | Pillar: CV Experimentation
```

```
US-07: CV Badge on Kanban Card
As a job seeker, I want to see which CV version was used for each application on the Kanban board so that I can quickly identify patterns.
Acceptance criteria:
- [ ] CV version name is shown as a purple badge on each ApplicationCard
- [ ] Badge text is truncated at 15 characters with ellipsis
- [ ] Full name is shown in a tooltip on hover
- [ ] Badge is not shown when no CV version is assigned
- [ ] Badge renders correctly on mobile without causing horizontal overflow
Priority: High | Effort: S | Pillar: CV Experimentation
```

```
US-08: Stage Lock Enforcement
As a job seeker, I want the app to prevent me from changing the CV version on an application that has progressed past "Applied" so that my historical data stays accurate.
Acceptance criteria:
- [ ] CVVersionPicker is disabled when application stage is screening, interviewing, offer, rejected, or withdrawn
- [ ] Disabled state shows tooltip "CV version locked — application is past Applied stage"
- [ ] POST /api/jobs/:id/cv-version returns 422 if stage is not saved or applied
- [ ] No client-side workaround can bypass the API-level check
Priority: High | Effort: S | Pillar: CV Experimentation
```

```
US-09: CVVersionPicker in Application Modal
As a job seeker, I want to assign a CV version to a job application so that I can track which CV I used for each role.
Acceptance criteria:
- [ ] Application modal shows a "CV Version" field with a combobox picker
- [ ] Picker lists all active (non-archived) CV versions
- [ ] "Unassigned" is always available as the first option
- [ ] Picker supports search/filter by name
- [ ] Change is saved optimistically and rolled back on API error
- [ ] On mobile (<640px), picker opens as a bottom sheet
Priority: High | Effort: M | Pillar: CV Experimentation
```

```
US-10: Getting Started Checklist — CV Version Step
As a new user, I want the Getting Started checklist to guide me to create my first CV version so that I understand this feature early.
Acceptance criteria:
- [ ] Checklist on the dashboard includes a step "Upload or create your first CV version"
- [ ] Step links to /app/cv-versions
- [ ] Step is marked complete when the user has at least one CV version
- [ ] Completion state persists across sessions
Priority: Med | Effort: S | Pillar: CV Experimentation
```

```
US-11: Free Tier Limit Gate
As a free-tier user, I want to understand when I have reached my CV version limit so that I can make an informed decision about upgrading.
Acceptance criteria:
- [ ] Free tier users can create at most 2 CV versions
- [ ] On the list page, the "New CV version" button shows an upgrade prompt when limit is reached
- [ ] Upgrade prompt explains "You've reached your 2 CV version limit. Upgrade to Pro for unlimited versions."
- [ ] POST /api/cv-versions returns 403 with code FREE_TIER_LIMIT_REACHED if a free user tries to exceed 2
- [ ] Pro users see no limit and no upgrade prompt
Priority: High | Effort: S | Pillar: CV Experimentation
```

```
US-12: Analytics CV Attribution
As a pro user, I want to see which CV version performs best in my pipeline so that I can optimize my job search.
Acceptance criteria:
- [ ] /app/analytics/cv-testing shows a bar chart comparing stage conversion rates per CV version
- [ ] Versions with fewer than 10 applications show a "Low confidence" badge
- [ ] Applications without an assigned CV version appear as "Untagged" in the chart
- [ ] Archived CV versions that have associated applications are included in the analytics
- [ ] Page is Pro-gated; free users see a blurred preview with an upgrade CTA
Priority: High | Effort: L | Pillar: CV Experimentation
```

```
US-13: Default CV Version Logic
As a job seeker, I want to designate one CV version as my default so that it is pre-selected when I add new applications.
Acceptance criteria:
- [ ] Only one CV version can be marked as default at a time
- [ ] Setting a new default automatically unsets the previous one (atomic operation)
- [ ] The default badge is shown on the CVVersionCard
- [ ] CVVersionPicker pre-selects the default version when adding a new application
- [ ] Archiving the default version unsets it as default and no version becomes default automatically
Priority: Med | Effort: S | Pillar: CV Experimentation
```

```
US-14: Duplicate CV Version
As a job seeker, I want to duplicate an existing CV version so that I can iterate on a variant without losing the original.
Acceptance criteria:
- [ ] "Duplicate" option is available in the CVVersionCard menu
- [ ] Duplicate creates a new version with name "Copy of [original name]" (truncated to 100 chars)
- [ ] Duplicate copies description and tags but does NOT copy the file_url (requires fresh upload or re-edit)
- [ ] Duplicate is NOT set as default regardless of original's default status
- [ ] Duplicate counts toward the free tier limit
Priority: Med | Effort: S | Pillar: CV Experimentation
```

---

## 3. Corner Cases

### File Upload

| Case | Expected Behavior |
|---|---|
| File > 10MB | Client-side check rejects before upload; shows "File too large — maximum 10MB" inline below dropzone; no network request made |
| Wrong MIME type (e.g., `.docx` with wrong content-type header) | Server validates actual MIME by reading magic bytes; returns 415 Unsupported Media Type |
| Corrupt PDF (valid extension, unparseable content) | Upload succeeds (storage layer stores bytes); editor shows warning "Could not extract content from this file — please re-upload or enter content manually" |
| Duplicate file name for same user | Allowed — `name` field in `cv_versions` does not enforce uniqueness at DB level; warn in UI if a version with the same name exists: "A CV version named '[name]' already exists — rename it to avoid confusion" (non-blocking) |
| Network failure mid-upload | Abort controller cancels the stream; UI shows "Upload failed — try again" with retry button; no orphaned row is created (upload route creates DB row only after successful storage PUT) |
| User uploads file then closes modal | Draft store is NOT set; uploaded file is orphaned in storage. A scheduled Supabase Edge Function (Phase 2 cleanup) removes files with no matching `cv_versions` row older than 1 hour |

### Stage-Lock Enforcement

| Case | Expected Behavior |
|---|---|
| Application moves from `applied` → `screening` while picker is open | On picker submit, API returns 422; UI rolls back picker to previous value; shows toast "CV version locked — this application has moved to Screening" |
| Application created directly at `screening` stage | CVVersionPicker is disabled immediately on modal open; no assignment possible |
| Race condition: two browser tabs, one tab advances stage while other has picker open | POST `/api/jobs/:id/cv-version` re-checks `stage` from DB inside the same transaction; the tab with the stale stage receives 422 |
| Stage moves `screening` → `applied` (regression) | Not a valid transition in the domain — stage history only moves forward. If it somehow occurs (admin fix), the picker unlocks on next modal open |
| Assigning CV to `rejected` or `withdrawn` | Same 422 behavior — rejected and withdrawn are terminal stages, no CV change allowed |

### Free Tier Limit

| Case | Expected Behavior |
|---|---|
| User has exactly 2 versions (at limit) | "New CV version" button is replaced with upgrade prompt; clicking it opens `ProGate` upgrade modal |
| User has 2 versions and tries direct POST to API | API returns `403 { code: "FREE_TIER_LIMIT_REACHED", message: "Upgrade to Pro for unlimited CV versions" }` |
| User upgrades to Pro mid-session (in another tab) | `useUserStore` subscription tier is updated on next session refresh; "New CV version" button reappears without page reload only if Zustand store is refreshed (add Supabase realtime listener on `profiles` table for `subscription_tier` change) |
| Pro user downgrades to free with 5 existing versions | Existing versions are preserved (no deletion); new creation is blocked; list shows "You're on the Free plan — you have 5 versions (limit 2). Upgrade to regain full access." |
| User archives one of their 2 free versions | Archived versions still count toward the free tier limit to prevent a workaround loop |

### CV Badge Truncation

| Case | Expected Behavior |
|---|---|
| Name is exactly 15 characters | Displayed in full, no ellipsis |
| Name is 16+ characters | Truncated to 15 chars + "…"; full name shown in Tooltip |
| Name contains special characters (`<`, `>`, `&`, emoji) | Rendered as plain text via React (auto-escaped); no XSS risk |
| Name contains only whitespace (DB constraint should prevent, but just in case) | Badge shows "–" placeholder |
| No CV version assigned | Badge component is not rendered; `ApplicationCard` layout does not leave a gap |

### Default CV Logic

| Case | Expected Behavior |
|---|---|
| First CV version created | Does NOT auto-become default; user must explicitly set default (avoids surprise for users who iterate) |
| User sets a new default | `POST /api/cv-versions/:id/set-default` runs as a Supabase transaction: `UPDATE cv_versions SET is_default = false WHERE user_id = $1` then `UPDATE cv_versions SET is_default = true WHERE id = $2` — both in one `rpc` call to avoid race condition |
| User archives the current default | On archive: `is_default` is set to `false` in the same PATCH call; no other version becomes default; `CVVersionPicker` defaults to "Unassigned" for new applications |
| Two versions somehow both have `is_default = true` (data corruption) | `useCVVersions` query sorts by `is_default DESC, updated_at DESC`; UI shows first result as default; background reconciliation: PATCH route that sets default first unsets ALL others |
| User deletes the default version | Hard delete only allowed if no `job_applications` reference it; if referenced, version is archived instead; `is_default` unset in same operation |

### Template Selection with Imported Content

| Case | Expected Behavior |
|---|---|
| User navigates to template gallery without uploading a file | `useCVVersionDraftStore.importedFileName` is null; no import banner shown; normal build flow |
| User uploads a large (but valid, ≤10MB) DOCX | Upload completes; editor shows "Importing content…" while content extraction runs (async); if extraction takes > 5s, shows "Content will appear shortly — you can start editing now" |
| User uploads PDF (read-only format) | Import banner shown in editor; PDF content extraction is best-effort (Phase 2 Sprint 2 — for Sprint 1, show "PDF content extraction is not yet available — your PDF is saved as a reference file in the sidebar") |
| User uploads DOCX | DOCX parsing happens server-side; structured content is mapped to editor sections; unrecognized sections go into a "Raw import" overflow block |
| User refreshes the page mid-gallery | `useCVVersionDraftStore` is Zustand in-memory only (not persisted); import session is lost; user is redirected to gallery without import banner; `cv_versions` row created during upload remains in DB with `file_url` set but no editor content |

### Analytics LEFT JOIN

| Case | Expected Behavior |
|---|---|
| Application has `cv_version_id = null` | Appears in "Untagged" group in all analytics queries |
| CV version is archived but has associated applications | Included in analytics under its original name with "(archived)" suffix appended in the UI label |
| CV version is hard-deleted but `job_applications.cv_version_id` still references it (FK with SET NULL) | DB FK is defined as `ON DELETE SET NULL`; these applications fall into "Untagged" automatically |
| User has zero applications | Analytics page shows empty state "Add applications and assign CV versions to see comparison data" |
| One CV version has 0 applications, another has 50 | Version with 0 applications is excluded from the chart (no bar to show); it appears in the legend as "No applications yet" |

### Mobile

| Case | Expected Behavior |
|---|---|
| File dropzone on iOS Safari | Dropzone must include `<input type="file" accept=".pdf,.docx" capture="false">` hidden under the drop target; tap opens native document picker |
| File dropzone on Android Chrome | Same input approach; `accept` attribute triggers document picker not camera |
| Drag-and-drop on mobile (not supported) | Dropzone shows "Tap to select file" instead of "Drag and drop" copy on touch devices (`'ontouchstart' in window` check) |
| CVVersionPicker on mobile | Renders as shadcn/ui `Sheet` (bottom sheet) at `<640px`; full-height combobox with search at top |
| Template gallery scroll on mobile | Horizontal scroll is forbidden; gallery is single column with vertical scroll; each card is full-width |
| All touch targets | Minimum 44×44px enforced via `min-h-[44px] min-w-[44px]` on all interactive elements |

---

## 4. BDD Scenarios (Gherkin)

```gherkin
Feature: CV Version Creation — Build from Template

  Background:
    Given I am logged in as a Pro user
    And I am on the /app/cv-versions page

  Scenario: Happy path — create a new CV version from template
    When I click "New CV version"
    Then a modal appears with "Build from template" and "Upload existing CV" options
    When I click "Build from template"
    Then I am navigated to /app/cv-versions/new
    And no import banner is shown
    When I click on the "Software Engineer Classic" template card
    Then I am navigated to /app/cv-versions/[id]/edit
    And the editor header shows an empty name field
    When I type "Senior PM — Amsterdam" in the name field
    And I click "Save"
    Then I am navigated to /app/cv-versions
    And a card named "Senior PM — Amsterdam" is visible in the list

  Scenario: Edge case — user navigates back from template gallery
    When I click "New CV version"
    And I click "Build from template"
    And I am on /app/cv-versions/new
    When I click the back button
    Then I am navigated to /app/cv-versions
    And no draft state is retained

  Scenario: Error state — editor auto-save fails
    Given I am on /app/cv-versions/[id]/edit
    And the network returns a 500 error on PATCH requests
    When I type in the description field
    And 800ms passes
    Then the save indicator shows "Error — Retry"
    When I click "Retry"
    Then the save is attempted again
```

```gherkin
Feature: CV Version Creation — Upload Existing CV

  Background:
    Given I am logged in as a Pro user
    And I am on the /app/cv-versions page

  Scenario: Happy path — upload a PDF and select a template
    When I click "New CV version"
    And I click "Upload existing CV"
    Then the Upload CV modal opens
    When I drop "my-cv.pdf" (8MB) onto the dropzone
    And I type "FAANG Application 2026" in the name field
    And I click "Save & choose template"
    Then a loading spinner appears
    And I am navigated to /app/cv-versions/new
    And an import banner reads "my-cv.pdf imported · your content will be applied to the template"
    When I select the "Minimal" template
    Then I am navigated to /app/cv-versions/[id]/edit?imported=true
    And a green import banner is shown at the top of the editor
    And the right sidebar shows "Source: my-cv.pdf"

  Scenario: Edge case — user uploads a file over 10MB
    When I click "New CV version"
    And I click "Upload existing CV"
    And I drop "large-cv.pdf" (15MB) onto the dropzone
    Then an inline error appears below the dropzone: "File too large — maximum 10MB"
    And the "Save & choose template" button remains disabled

  Scenario: Error state — upload fails due to network error
    When I click "New CV version"
    And I click "Upload existing CV"
    And I drop "my-cv.pdf" (5MB) onto the dropzone
    And I type "My CV" in the name field
    And the network is offline
    When I click "Save & choose template"
    Then an error message appears: "Upload failed — check your connection and try again"
    And a "Retry" button is shown
    And I remain on the Upload CV modal
```

```gherkin
Feature: CV Version Stage Lock

  Background:
    Given I am logged in
    And I have an application "Staff Engineer at Stripe" in stage "applied"
    And I have a CV version named "Stripe Focused CV"

  Scenario: Happy path — assign CV to an applied application
    When I open the application modal for "Staff Engineer at Stripe"
    And I click the CV Version picker
    And I select "Stripe Focused CV"
    Then the picker shows "Stripe Focused CV"
    And the change is saved
    And the Kanban card shows the badge "Stripe Focused C…"

  Scenario: Edge case — application advances stage while picker is open
    Given I have the application modal open with the CV picker open
    When another session advances the application to "screening"
    And I select "Stripe Focused CV" in the picker
    Then the API returns 422
    And a toast shows "CV version locked — this application has moved to Screening"
    And the picker resets to the previous value

  Scenario: Error state — attempt to assign CV to a screening-stage application
    Given the application "Staff Engineer at Stripe" is in stage "screening"
    When I open the application modal
    Then the CV Version picker is disabled
    And a tooltip reads "CV version locked — application is past Applied stage"
    And no assignment can be made
```

```gherkin
Feature: CV Badge on Kanban Card

  Background:
    Given I am logged in
    And I am on the /app/pipeline page

  Scenario: Happy path — badge shows truncated CV name
    Given I have an application with CV version "Senior Product Manager Berlin 2026"
    Then the Kanban card shows the badge "Senior Product M…"
    And hovering the badge shows a tooltip "Senior Product Manager Berlin 2026"

  Scenario: Edge case — no CV version assigned
    Given I have an application with no CV version assigned
    Then no badge is visible on the Kanban card
    And the card layout does not show an empty gap

  Scenario: Error state — CV version was archived after assignment
    Given I have an application with a CV version that has since been archived
    Then the badge still shows the CV version name with "(archived)" appended
    And the application modal picker shows the archived version as disabled with label "(archived)"
```

```gherkin
Feature: Free Tier Limit Gate

  Background:
    Given I am logged in as a free-tier user
    And I already have 2 CV versions

  Scenario: Happy path — upgrade prompt is shown
    When I navigate to /app/cv-versions
    Then the "New CV version" button shows an upgrade prompt icon
    When I click "New CV version"
    Then a ProGate modal appears with message "You've reached your 2 CV version limit"
    And an "Upgrade to Pro" CTA is shown

  Scenario: Edge case — free user tries to bypass via API
    When I send a POST request to /api/cv-versions with valid payload
    Then the response is 403
    And the body contains "code": "FREE_TIER_LIMIT_REACHED"

  Scenario: Error state — user upgrades mid-session
    Given I have the upgrade modal open
    When I complete the Pro upgrade in another tab
    And I return to the cv-versions page and refresh
    Then the upgrade prompt is gone
    And the "New CV version" button is active
    And I can create a third CV version
```

```gherkin
Feature: CV Version Assignment in Application Modal

  Background:
    Given I am logged in
    And I have CV versions "Berlin Focused", "Amsterdam Focused", and "Remote Only"
    And I have an application "PM at N26" in stage "applied"

  Scenario: Happy path — assign a CV version to an application
    When I open the application modal for "PM at N26"
    And I click the CV Version picker
    And I search for "Berlin"
    And I select "Berlin Focused"
    Then the picker shows "Berlin Focused"
    And the Kanban card badge shows "Berlin Focused"

  Scenario: Edge case — picker shows "Unassigned" as first option
    When I open the application modal for "PM at N26"
    And I click the CV Version picker
    Then "Unassigned" is the first item in the list
    And selecting "Unassigned" removes the CV assignment from the application

  Scenario: Error state — API error on assignment
    Given the API returns 500 on POST /api/jobs/:id/cv-version
    When I select "Amsterdam Focused" in the picker
    Then the picker optimistically shows "Amsterdam Focused"
    And a toast shows "Failed to save CV version — rolling back"
    And the picker reverts to its previous value
```

```gherkin
Feature: Filter Tabs (Active / Archived)

  Background:
    Given I am logged in
    And I have 3 active CV versions and 1 archived CV version

  Scenario: Happy path — active tab is the default
    When I navigate to /app/cv-versions
    Then the "Active" tab is selected
    And 3 CV version cards are shown
    And the archived version is not shown

  Scenario: Edge case — switching to archived tab
    When I click the "Archived" tab
    Then 1 CV version card is shown
    And the active versions are not shown
    And the archived card shows an "Archived" badge

  Scenario: Error state — all versions are archived
    Given all CV versions are archived
    When I view the "Active" tab
    Then the empty state shows "No active CV versions — create a new one or restore an archived version"
    And a "Create CV version" CTA is shown
```

```gherkin
Feature: Analytics CV Attribution

  Background:
    Given I am logged in as a Pro user
    And I have applications spread across "Berlin CV" (15 apps), "Remote CV" (6 apps), and untagged (8 apps)

  Scenario: Happy path — bar chart shows conversion rates per version
    When I navigate to /app/analytics/cv-testing
    Then a bar chart is shown with 3 groups: "Berlin CV", "Remote CV", and "Untagged"
    And "Berlin CV" has no low-confidence badge
    And "Remote CV" shows a "Low confidence" badge
    And "Untagged" is shown last in the chart

  Scenario: Edge case — archived CV version with applications is included
    Given "Berlin CV" is archived
    When I view the analytics page
    Then "Berlin CV (archived)" still appears in the chart with its application data

  Scenario: Error state — free tier user tries to access CV testing analytics
    Given I am a free-tier user
    When I navigate to /app/analytics/cv-testing
    Then the chart is blurred
    And an upgrade CTA overlay reads "Unlock CV A/B testing — upgrade to Pro"
    And a preview of what the chart would look like is visible behind the blur
```

---

## 5. API Contract

### GET /api/cv-versions

**Request**
```
GET /api/cv-versions?archived=false&limit=50&offset=0
Authorization: Bearer <supabase-session-token>
```

**Query params**
| Param | Type | Default | Description |
|---|---|---|---|
| `archived` | `boolean` | `false` | Filter by `is_archived` |
| `limit` | `number` | `50` | Pagination |
| `offset` | `number` | `0` | Pagination |

**Response 200**
```typescript
{
  data: CVVersionListItem[];
  meta: {
    total: number;
    freeLimit: 2 | null;      // null for Pro users
    canCreate: boolean;       // false if free + at limit
  }
}

interface CVVersionListItem {
  id: string;
  name: string;
  description: string | null;
  tags: string[];
  is_default: boolean;
  is_archived: boolean;
  file_url: string | null;    // signed URL, 24h expiry
  file_type: 'pdf' | 'docx' | null;
  application_count: number;  // derived from LEFT JOIN
  created_at: string;         // ISO 8601
  updated_at: string;
}
```

**Response 401** — unauthenticated  
**Response 500** — server error

---

### POST /api/cv-versions (metadata only — no file)

**Request**
```
POST /api/cv-versions
Content-Type: application/json
Authorization: Bearer <supabase-session-token>

{
  "name": "Berlin Senior PM 2026",
  "description": "Optimised for DACH market",
  "tags": ["Berlin", "Senior", "Product"],
  "is_default": false
}
```

**Zod schema** (`src/validations/cv-versions.ts`)
```typescript
export const createCVVersionSchema = z.object({
  name: z.string().min(1).max(100),
  description: z.string().max(500).nullable().optional(),
  tags: z.array(z.string().max(30)).max(10).optional().default([]),
  is_default: z.boolean().optional().default(false),
});
```

**Response 201**
```typescript
{ data: CVVersion }

interface CVVersion extends CVVersionListItem {
  // All fields from CVVersionListItem, no additions
}
```

**Response 400** — validation error  
```json
{ "error": "Validation failed", "details": [{ "path": "name", "message": "Required" }] }
```
**Response 403** — free tier limit  
```json
{ "code": "FREE_TIER_LIMIT_REACHED", "message": "Upgrade to Pro for unlimited CV versions" }
```
**Response 401** — unauthenticated

---

### POST /api/cv-versions/upload (multipart — file + metadata)

**Request**
```
POST /api/cv-versions/upload
Content-Type: multipart/form-data
Authorization: Bearer <supabase-session-token>

file: <binary>
name: "Berlin Senior PM 2026"
is_default: "false"
```

**Server-side validation**
- MIME type: `application/pdf` or `application/vnd.openxmlformats-officedocument.wordprocessingml.document`
- Size: ≤10MB (10_485_760 bytes)
- Name: required, max 100 chars

**Response 201**
```typescript
{
  data: CVVersion & {
    upload_session_token: string; // short-lived token stored in Zustand draft store
  }
}
```

**Response 400** — validation error  
**Response 403** — free tier limit  
**Response 413** — file too large  
```json
{ "error": "File too large", "maxBytes": 10485760 }
```
**Response 415** — unsupported media type  
```json
{ "error": "Unsupported file type", "allowed": ["application/pdf", "application/vnd.openxmlformats-officedocument.wordprocessingml.document"] }
```

---

### PATCH /api/cv-versions/:id

**Request**
```
PATCH /api/cv-versions/550e8400-e29b-41d4-a716-446655440000
Content-Type: application/json
Authorization: Bearer <supabase-session-token>

{
  "name": "Updated CV Name",
  "description": "Updated description",
  "tags": ["Berlin", "Remote"],
  "is_archived": false
}
```

**Zod schema**
```typescript
export const updateCVVersionSchema = z.object({
  name: z.string().min(1).max(100).optional(),
  description: z.string().max(500).nullable().optional(),
  tags: z.array(z.string().max(30)).max(10).optional(),
  is_archived: z.boolean().optional(),
}).refine(data => Object.keys(data).length > 0, {
  message: "At least one field must be provided"
});
```

**Response 200**
```typescript
{ data: CVVersion }
```

**Response 400** — validation error  
**Response 403** — not owner (RLS would catch this, but explicit check for better DX)  
**Response 404** — version not found  
**Response 401** — unauthenticated

---

### DELETE /api/cv-versions/:id

**Request**
```
DELETE /api/cv-versions/550e8400-e29b-41d4-a716-446655440000
Authorization: Bearer <supabase-session-token>
```

**Server logic**
1. Check ownership (RLS)
2. Check if any `job_applications` reference this `cv_version_id`
3. If referenced: set `is_archived = true`, return 200 with `{ archived: true }`
4. If not referenced: hard delete from DB, delete file from Supabase Storage, return 200 with `{ deleted: true }`

**Response 200**
```typescript
{ deleted: boolean; archived: boolean }
```

**Response 404** — not found  
**Response 401** — unauthenticated

---

### POST /api/cv-versions/:id/set-default

**Request**
```
POST /api/cv-versions/550e8400-e29b-41d4-a716-446655440000/set-default
Authorization: Bearer <supabase-session-token>
```

**Server logic (Supabase RPC `set_cv_version_default`)**
```sql
CREATE OR REPLACE FUNCTION set_cv_version_default(target_id uuid, uid uuid)
RETURNS void AS $$
BEGIN
  UPDATE cv_versions SET is_default = false WHERE user_id = uid;
  UPDATE cv_versions SET is_default = true WHERE id = target_id AND user_id = uid;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
```

**Response 200**
```typescript
{ data: CVVersion }  // The newly defaulted version
```

**Response 400** — if `target_id` is archived  
```json
{ "error": "Cannot set an archived CV version as default" }
```
**Response 404** — not found  
**Response 401** — unauthenticated

---

### POST /api/jobs/:id/cv-version

**Request**
```
POST /api/jobs/770e8400-e29b-41d4-a716-446655440001/cv-version
Content-Type: application/json
Authorization: Bearer <supabase-session-token>

{
  "cv_version_id": "550e8400-e29b-41d4-a716-446655440000"  // null to unassign
}
```

**Zod schema**
```typescript
export const assignCVVersionSchema = z.object({
  cv_version_id: z.string().uuid().nullable(),
});
```

**Server logic**
1. Fetch `job_applications` row for `id`, confirm `user_id = auth.uid()`
2. Check `stage IN ('saved', 'applied')`; if not → return 422
3. If `cv_version_id` is not null: verify `cv_versions` row exists and belongs to same user
4. Update `job_applications.cv_version_id`

**Response 200**
```typescript
{ data: { job_id: string; cv_version_id: string | null } }
```

**Response 404** — job not found  
**Response 422** — stage lock violation  
```json
{
  "error": "CV version cannot be changed",
  "code": "STAGE_LOCKED",
  "currentStage": "screening",
  "allowedStages": ["saved", "applied"]
}
```
**Response 401** — unauthenticated

---

## 6. Component Inventory

### New Components

---

#### `CVVersionList`
**Path:** `src/components/cv-versions/CVVersionList.tsx`

```typescript
interface CVVersionListProps {
  versions: CVVersionListItem[];
  isLoading: boolean;
  onEdit: (id: string) => void;
  onDelete: (id: string) => void;
  onSetDefault: (id: string) => void;
  onArchive: (id: string) => void;
  onDuplicate: (id: string) => void;
}
```

**States:** loading (skeleton grid), empty (CVVersionEmptyState), populated (grid of cards), error (error card with Retry)  
**Mobile:** Single column (`grid-cols-1`); at `sm:` → 2 columns; at `lg:` → 3 columns

---

#### `CVVersionCard`
**Path:** `src/components/cv-versions/CVVersionCard.tsx`

```typescript
interface CVVersionCardProps {
  version: CVVersionListItem;
  onEdit: () => void;
  onDelete: () => void;
  onSetDefault: () => void;
  onArchive: () => void;
  onDuplicate: () => void;
}
```

**States:** default, default-badge visible, archived (muted opacity), menu open  
**Mobile:** Full-width card; tap target for menu icon minimum 44×44px; tags wrap onto new line

---

#### `CVVersionCardMenu`
**Path:** `src/components/cv-versions/CVVersionCardMenu.tsx`

```typescript
interface CVVersionCardMenuProps {
  versionId: string;
  isDefault: boolean;
  isArchived: boolean;
  hasApplications: boolean;
  onEdit: () => void;
  onDelete: () => void;
  onSetDefault: () => void;
  onArchive: () => void;
  onDuplicate: () => void;
}
```

**States:** closed, open (Popover), destructive actions show AlertDialog  
**Mobile:** Menu items have `min-h-[44px]` padding

---

#### `CVVersionFilterTabs`
**Path:** `src/components/cv-versions/CVVersionFilterTabs.tsx`

```typescript
interface CVVersionFilterTabsProps {
  activeCount: number;
  archivedCount: number;
  selected: 'active' | 'archived';
  onChange: (tab: 'active' | 'archived') => void;
}
```

**States:** active selected, archived selected  
**Mobile:** Tabs are full-width touch targets; no horizontal overflow

---

#### `CVVersionEmptyState`
**Path:** `src/components/cv-versions/CVVersionEmptyState.tsx`

```typescript
interface CVVersionEmptyStateProps {
  tab: 'active' | 'archived';
  onCreateClick: () => void;
}
```

**States:** active tab empty, archived tab empty  
**Mobile:** Full-width; CTA button minimum 44px height

---

#### `CreateCVVersionModal`
**Path:** `src/components/cv-versions/CreateCVVersionModal.tsx`

```typescript
interface CreateCVVersionModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onBuildFromTemplate: () => void;
  onUploadExisting: () => void;
  isAtFreeLimit: boolean;
}
```

**States:** open (two options), free limit locked (upgrade prompt shown inline)  
**Mobile:** Renders as shadcn/ui `Sheet` (bottom sheet) below `sm:`; Dialog above

---

#### `UploadDropzone`
**Path:** `src/components/cv-versions/UploadDropzone.tsx`

```typescript
interface UploadDropzoneProps {
  onFileSelect: (file: File) => void;
  accept: string[];           // ['.pdf', '.docx']
  maxSizeBytes: number;       // 10_485_760
  disabled?: boolean;
  error?: string | null;
}
```

**States:** idle (drag hint), drag-over (highlighted border), file selected (file name + size + remove), error (red border + inline message), uploading (progress indicator)  
**Mobile:** Hidden drag-and-drop UI; shows "Tap to select file" copy; `<input type="file">` is the primary interaction

---

#### `UploadCVModal`
**Path:** `src/components/cv-versions/UploadCVModal.tsx`

```typescript
interface UploadCVModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: (cvVersion: CVVersion) => void;
}
```

**States:** idle, validating, uploading (progress), success, error  
**Mobile:** Full-screen modal below `sm:`; "Save & choose template" button is sticky at bottom

---

#### `TemplateGallery`
**Path:** `src/components/cv-versions/TemplateGallery.tsx`

```typescript
interface TemplateGalleryProps {
  importedFileName?: string | null;
  cvVersionId?: string | null;
  onTemplateSelect: (templateId: string) => void;
  onBack: () => void;
}
```

**States:** with import banner, without import banner, loading templates, empty (no templates — should never occur in prod)  
**Mobile:** Single column; `ImportBanner` stacks above gallery; back button in sticky header

---

#### `TemplateCard`
**Path:** `src/components/cv-versions/TemplateCard.tsx`

```typescript
interface TemplateCardProps {
  template: CVTemplate;
  onSelect: () => void;
}

interface CVTemplate {
  id: string;
  name: string;
  thumbnailUrl: string;
  roleTags: string[];
  description: string;
}
```

**States:** default, hover (scale up + shadow), selected (blue border)  
**Mobile:** Full-width; thumbnail aspect ratio 3:4 maintained

---

#### `ImportBanner`
**Path:** `src/components/cv-versions/ImportBanner.tsx`

```typescript
interface ImportBannerProps {
  fileName: string;
  onDismiss: () => void;
  variant: 'gallery' | 'editor';  // gallery = neutral; editor = green
}
```

**States:** visible, dismissed (sets Zustand `importBannerDismissed`)  
**Mobile:** Full-width; dismiss X button minimum 44×44px touch area

---

#### `CVEditor`
**Path:** `src/components/cv-versions/CVEditor.tsx`

```typescript
interface CVEditorProps {
  cvVersionId: string;
  isImported: boolean;
}
```

**States:** loading, editing, saving, saved, error (auto-save failed), unsaved-navigation-guard  
**Mobile:** Sidebar collapses into a bottom `Sheet`; canvas is full-width; header is sticky

---

#### `CVEditorHeader`
**Path:** `src/components/cv-versions/CVEditorHeader.tsx`

```typescript
interface CVEditorHeaderProps {
  name: string;
  onNameChange: (name: string) => void;
  saveStatus: 'idle' | 'saving' | 'saved' | 'error';
  onSave: () => void;
  onBack: () => void;
  hasUnsavedChanges: boolean;
}
```

**States:** idle, saving (spinner), saved (checkmark), error (red + Retry)  
**Mobile:** Sticky top header; name input truncates; save button always visible

---

#### `CVEditorSidebar`
**Path:** `src/components/cv-versions/CVEditorSidebar.tsx`

```typescript
interface CVEditorSidebarProps {
  cvVersion: CVVersion;
  onUpdate: (patch: Partial<UpdateCVVersionPayload>) => void;
  isImported: boolean;
}
```

**States:** open (desktop), collapsed (mobile — opens as Sheet)  
**Mobile:** Triggered by a "Details" icon button in the editor header; renders as `Sheet` from bottom

---

#### `CVEditorTagInput`
**Path:** `src/components/cv-versions/CVEditorTagInput.tsx`

```typescript
interface CVEditorTagInputProps {
  tags: string[];
  onChange: (tags: string[]) => void;
  maxTags?: number;     // default 10
  maxTagLength?: number; // default 30
}
```

**States:** idle, focused (input shown), tag limit reached  
**Mobile:** Tags wrap; input is full-width on new line when tags wrap

---

#### `ImportSourcePanel`
**Path:** `src/components/cv-versions/ImportSourcePanel.tsx`

```typescript
interface ImportSourcePanelProps {
  fileName: string;
  fileType: 'pdf' | 'docx';
  fileUrl: string;
}
```

**States:** PDF (show download link + "content extraction not available" note), DOCX (show "content imported" confirmation)  
**Mobile:** Rendered inside `CVEditorSidebar` Sheet; full-width

---

#### `CVVersionBadge`
**Path:** `src/components/cv-versions/CVVersionBadge.tsx`

```typescript
interface CVVersionBadgeProps {
  name: string;
  maxChars?: number;  // default 15
  isArchived?: boolean;
}
```

**States:** normal (purple), archived (muted gray), truncated (with Tooltip)  
**Mobile:** Badge is inline; no hover tooltip on mobile — tap shows full name as native title attribute

---

#### `CVVersionPicker`
**Path:** `src/components/cv-versions/CVVersionPicker.tsx`

```typescript
interface CVVersionPickerProps {
  value: string | null;           // cv_version_id
  onChange: (id: string | null) => void;
  isLocked: boolean;
  lockedReason?: string;
  versions: CVVersionListItem[];
  isLoading?: boolean;
}
```

**States:** closed, open (Popover/Command), disabled/locked, searching, empty search results  
**Mobile:** Replaces Popover with shadcn/ui `Sheet` (bottom sheet) at `<640px`

---

#### `CVVersionLowConfidenceBadge`
**Path:** `src/components/cv-versions/CVVersionLowConfidenceBadge.tsx`

```typescript
interface CVVersionLowConfidenceBadgeProps {
  applicationCount: number;
  threshold?: number;  // default 10
}
```

**States:** shown (count < threshold), hidden (count ≥ threshold)  
**Mobile:** Inline badge; tooltip replaced by a tap-to-expand info row

---

### Modified Components

---

#### `ApplicationCard` (modified)
**Path:** `src/components/pipeline/ApplicationCard.tsx`

**Change:** Add `CVVersionBadge` below job title.  
**New prop:**
```typescript
cvVersionName?: string | null;
cvVersionIsArchived?: boolean;
```
**Mobile:** Badge must not cause card width overflow; wraps to new line if needed

---

#### `ApplicationModal` (modified)
**Path:** `src/components/pipeline/ApplicationModal.tsx`

**Change:** Add `CVVersionPicker` as a new form field section "CV Version".  
**New props:**
```typescript
cvVersions: CVVersionListItem[];
isLoadingCVVersions: boolean;
```
**Mobile:** Picker opens as bottom sheet; "CV Version" field appears after the stage selector in the form

---

#### `GettingStartedChecklist` (modified)
**Path:** `src/components/dashboard/GettingStartedChecklist.tsx`

**Change:** Add step "Upload or create your first CV version" with link to `/app/cv-versions`.  
**New prop:**
```typescript
hasCVVersion: boolean;
```
**Mobile:** No change to existing mobile behavior; new checklist item follows same pattern

---

#### `FilterBar` (modified — pipeline)
**Path:** `src/components/pipeline/FilterBar.tsx`

**Change:** Add CV version multi-select filter composing with existing filters via AND.  
**New props:**
```typescript
cvVersions: CVVersionListItem[];
selectedCVVersionIds: string[];
onCVVersionFilterChange: (ids: string[]) => void;
```
**Mobile:** CV version filter added to the filter sheet/drawer on mobile; does not appear inline in the top bar on small screens

---

### New Zustand Store

#### `useCVVersionDraftStore`
**Path:** `src/store/useCVVersionDraftStore.ts`

```typescript
interface CVVersionDraftState {
  cvVersionId: string | null;
  importedFileName: string | null;
  importedFileType: 'pdf' | 'docx' | null;
  importBannerDismissed: boolean;
  set: (patch: Partial<Omit<CVVersionDraftState, 'set' | 'clear'>>) => void;
  clear: () => void;
}
```

**Notes:** In-memory only (no `persist` middleware); cleared on successful save or on back navigation from gallery; does not survive page refresh by design

---

### New Zod Schemas

**Path:** `src/validations/cv-versions.ts`

```typescript
export const createCVVersionSchema = z.object({ ... });
export const updateCVVersionSchema = z.object({ ... });
export const assignCVVersionSchema = z.object({ ... });
export const uploadCVVersionSchema = z.object({
  name: z.string().min(1).max(100),
  is_default: z.coerce.boolean().optional().default(false),
});
```

---

### Supabase RPC

**Function:** `set_cv_version_default` — defined in `supabase/migrations/YYYYMMDD_set_cv_version_default.sql`  
**Function:** `get_cv_analytics` — LEFT JOIN query returning per-version conversion rates, defined in `supabase/migrations/YYYYMMDD_cv_analytics.sql`

```sql
-- get_cv_analytics
SELECT
  COALESCE(cv.name, 'Untagged') AS cv_name,
  cv.is_archived,
  COUNT(ja.id) AS application_count,
  COUNT(ja.id) FILTER (WHERE ja.stage IN ('screening', 'interviewing', 'offer')) AS reached_screening,
  COUNT(ja.id) FILTER (WHERE ja.stage IN ('interviewing', 'offer')) AS reached_interview,
  COUNT(ja.id) FILTER (WHERE ja.stage = 'offer') AS reached_offer
FROM job_applications ja
LEFT JOIN cv_versions cv ON ja.cv_version_id = cv.id
WHERE ja.user_id = uid
GROUP BY cv.id, cv.name, cv.is_archived
ORDER BY application_count DESC;
```