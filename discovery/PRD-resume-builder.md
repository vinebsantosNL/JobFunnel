# PRD: Resume Builder with ATS-Optimized Templates

**Date:** 2026-03-22
**Status:** Draft — Decisions Resolved · Ready for Sprint 1
**Phase:** 2 — CV Versioning & Experimentation
**Pillar:** CV Experimentation (primary) · Funnel Analytics (secondary)
**Tier:** Free (2 versions, no performance analytics) · Pro (unlimited, full analytics)
**Effort:** ~5–6 solo weeks (XL)
**Route:** `/app/cv-versions` (existing) → expanded into full Resume Builder

---

## 1. Executive Summary

**One-liner:** A structured, ATS-validated resume builder that connects CV versions to pipeline outcomes — so users know which CV gets them interviews, not just which one looks good.

**Problem:** Mid-to-senior tech professionals in Europe apply to 20–60+ roles per search cycle with no way to know which CV version is actually working. They maintain multiple versions manually in Google Drive or Notion with no versioning, no ATS validation, and no outcome tracking. When they get ghosted, they have no data to diagnose whether the problem is the CV or the market.

**Solution:** An in-app resume builder with 5 curated ATS-validated templates, a structured content model (JSON-based, not a file upload), real-time PDF/DOCX export with per-company format guidance drawn from the user's pipeline, and an ATS score checker that surfaces missing keywords from the user's own saved job descriptions. Every CV version tagged to a job application feeds the Performance analytics loop: which version drove more screenings.

**Pillar impact:**
- **CV Experimentation** — This is the creation layer without which A/B performance attribution is impossible. Without structured CV data, the performance tab is meaningless.
- **Funnel Analytics** — Closes the loop: application → stage transition → CV version that drove it → screening rate per version.

**Effort:** 5–6 solo weeks (design locked, schema + API, editor, PDF/DOCX generation, ATS checker, pipeline keyword integration, mobile pass, E2E tests, beta).

---

## 2. Problem Definition

### 2.1 User Problem

- **Who:** Mid-to-senior tech professionals (SWE, PM, DS, ML, UX) in DACH + Benelux, running 20–60 applications per search cycle, applying across multiple countries simultaneously.
- **What:** They have no structured way to version, validate, or performance-test their CVs. Google Drive has 4 versions named "CV_final_v3_UPDATED_NL.pdf". They don't know which one is responsible for the two callbacks they got.
- **When:** At two critical moments: (1) when building their initial CV before applying, (2) when diagnosing why applications aren't converting to screenings.
- **Why it matters:** Without outcome-linked CV data, the user can't self-correct. They either keep sending the same underperforming CV or arbitrarily change it — both are blind. This drives churn ("JobFunnel isn't helping me") and suppresses Pro conversion ("why pay if I can't see what's working").
- **EU-specific pain:** European job seekers face additional CV complexity that US tools ignore: country-specific photo conventions (DE expects one, NL avoids them), A4 vs Letter format, CEFR language levels, Europass for public sector roles, and SAP SuccessFactors / Taleo dominance in DACH enterprise (which requires DOCX, not PDF).

### 2.2 Competitive Gap

| Competitor | Current approach | Why it falls short for our ICP |
|---|---|---|
| **Teal** | Chrome ext → JD keyword extraction → resume scoring | No outcome attribution post-submission. No EU adaptation. Screening rate = unknown. |
| **Jobscan** | Best ATS scoring engine, 9 basic templates | No pipeline integration. No outcome tracking. No EU market awareness. Ends at download. |
| **Resume.io / Zety** | Large template library, in-app editor | Design-first, ATS-secondary. No pipeline. No performance analytics. PDF download paywalled aggressively. |
| **Novoresume** | Most EU-aware (A4, CEFR) | No pipeline. No outcome attribution. No performance analytics. The loop is open at download. |
| **Canva** | 300+ community templates | Not ATS-optimized. Design tool masquerading as resume tool. High ATS failure rate. |

**Our gap:** None of the above close the loop. They all end at "download." We start where they end — by attributing every application to the CV version that produced it, then measuring screening rate per version.

### 2.3 Business Case

- **Activation impact:** A user who creates a CV version and tags it to an application has completed 2 of the 3 activation actions. This directly lifts the 70% activation target.
- **Conversion impact:** CV performance analytics (screening rate per version) is the clearest Pro gate in the product. A free user who sees "you have 14 applications but we can't show you which CV version is performing best — upgrade to Pro" is the strongest upgrade moment we have.
- **NPS impact:** Resolves the frustration of "I don't know what's wrong with my CV." Replaces helplessness with data.
- **Phase alignment:** Phase 2 — requires Phase 1 pipeline (job_applications table, stage tracking) to be stable. Does not require Phase 1 to be fully validated before starting schema work.

---

## 3. Solution

### 3.1 Overview

Three screens, one data model, one closed loop.

**Screen 1 — My CVs (library):** Card grid showing all CV versions with performance stats (screening rate), ATS safety badge, country target, and version management actions. Free users see 2 versions + Pro-locked card. Default version is pre-selected when adding pipeline applications.

**Screen 2 — Template Gallery:** 5 curated, ATS-validated templates. A pipeline-aware recommendation banner ("You have 6 companies using Greenhouse — Precision and Modern Tech are compatible with all of them") surfaces relevant templates without overwhelming choice. Template selection is a commit: switching template after editing warns the user.

**Screen 3 — Editor:** Split-pane (form left, live A4 preview right). 4 tabs: Content, Design, ATS Score, Pipeline Keywords. Content is stored as structured JSON — not a file — enabling keyword extraction, ATS validation, and performance attribution. PDF/DOCX export with per-company format guidance pulled from the user's active pipeline.

### 3.2 In Scope

| Feature | Priority | Notes |
|---|---|---|
| CV library (Screen 1): list, filter, create, duplicate, archive, set default | P0 | Core entry point |
| Free tier limit: 2 versions, upgrade gate on 3rd | P0 | Hard limit enforced at API + UI |
| Template gallery (Screen 2): 5 templates, filter, pipeline recommendation | P0 | Template selection before editor |
| Editor (Screen 3): content form with collapsible sections | P0 | Contact, Summary, Experience, Skills, Languages, Education |
| Live A4 PDF preview in editor (right pane) | P0 | Real-time, rendered from form data |
| PDF export via `@react-pdf/renderer` | P0 | Text-based PDF — ATS parseable |
| DOCX export via `docx` library | P0 | Required for SAP/Taleo (EU enterprise) |
| ATS score checker (tab in editor) | P1 | Rule-based, no external API |
| Pipeline keyword comparison (tab in editor) | P1 | From user's own saved job applications |
| Country tag + EU template defaults (A4, CEFR, no-photo) | P1 | From user's `target_countries[]` on profile |
| CV version lock once application reaches Screening | P0 | API returns 422; UI shows lock icon |
| Autosave (every 30s + on blur) | P1 | Prevent session loss during editing |
| Per-company export format guidance (PDF vs DOCX) | P1 | Pulled from pipeline ATS data |
| Section reordering within editor | P2 | Drag to reorder form sections |
| CV performance tab (screening rate per version) | P2 | Deferred — requires Pro plan to exist first. Out of scope for this release. |

### 3.3 Out of Scope

- **AI content generation** (cover letter writing, bullet rewriting) — Phase 3. Keeps this PRD focused on structure + performance attribution. Adding AI now risks scope bloat and delays the core loop.
- **File upload as CV version** — Replace the existing file upload model with structured data. No backward compatibility for previously uploaded PDFs as "structured" versions (they remain as legacy file references only, not editable).
- **ATS scoring against external ATS APIs** — Rule-based internal checker only. External API integration (Jobscan API) is Phase 3.
- **LinkedIn profile import** — Phase 3.
- **Custom template creation / template marketplace** — Not in this product. Curation is the differentiator, not volume.
- **Photo upload** in EU templates — Photo in CV is an ATS liability (parsers skip it). We default to no-photo and do not support photo upload in v1.
- **Multi-language CV translation** — Phase 3.
- **CV sharing / public link** — Not in scope. CVs are private by default.
- **Europass digital credential integration** — Phase 3 (requires OAuth with Europass API).
- **Version diff / change history** — Phase 3.

---

## 4. User Flows

### 4.1 Flow A — First-Time User Creates a CV (Happy Path)

```
Entry: User lands on /app/cv-versions (empty state)
  → Sees empty state: "Your resume library is empty. Build your first ATS-optimized resume."
  → CTA: "Create first resume" → Screen 2 (Template Gallery)

Screen 2 — Template Gallery:
  → Pipeline recommendation banner (if ≥1 saved jobs): "You have X companies using [ATS]..."
  → User browses 5 templates (filter by All / ATS-Safe / EU / Compact)
  → Hovers template → "Use this template" button appears
  → Clicks "Use Precision" → Modal: "Name your resume" (pre-filled: "My Resume")
  → Confirms → Screen 3 (Editor) opens with Precision template, blank form

Screen 3 — Editor:
  → Contact section open by default (required fields highlighted)
  → User fills: First name, Last name, Target job title, Email, Location, LinkedIn
  → Adds Professional Summary (textarea, no AI — just placeholder text as guidance)
  → Adds Work Experience entries (Company, Title, Dates, bullets)
  → Adds Skills (tag input)
  → Adds Languages (CEFR level selector per language)
  → Live preview updates in right pane on every keystroke
  → ATS chip shows score updating in real-time (rule-based)
  → User clicks "Save" → optimistic save, toast: "Resume saved"

Export:
  → User clicks "Download PDF" → PDF generated server-side via @react-pdf/renderer
  → If pipeline has SAP/Taleo companies: inline tip "Download DOCX for [Company A], [Company B]"
  → User clicks "Download DOCX" → DOCX generated server-side via docx library
  → Both downloads trigger analytics event for conversion tracking

Post-save:
  → User navigates back to My CVs → new card appears with 0 stats (no applications tagged yet)
  → Empty stats: "Tag this CV to an application to start tracking performance"
```

### 4.2 Flow B — Returning User Manages Multiple Versions

```
Entry: User on /app/cv-versions with 2 existing versions
  → Sees library with performance cards
  → Sees "+" New card disabled (free tier limit) with upgrade overlay

Actions available on each card:
  → Click card body → Editor (Screen 3)
  → Edit button → Editor (Screen 3)
  → Duplicate → Modal: "Name the duplicate" → creates copy → appears in grid
  → Archive → Confirmation: "Archive this version? Applications linked to it will keep their reference."
    → Archived card disappears from "Active" filter, visible in "Archived" filter
  → Set as default (3-dot menu) → Blue border appears on card, other default is unset

Filter:
  → "All" shows Active + Default
  → "Active" shows non-archived only
  → "Archived" shows archived only
```

### 4.3 Flow C — User Hits Free Tier Limit

```
Entry: Free user with 2 CV versions, tries to create 3rd
  → "+" New card is disabled (opacity-50, cursor-not-allowed)
  → Hover tooltip: "Free plan includes 2 CV versions"
  → Orange banner at top of library: "You're using 2/2 CV versions. Upgrade to track unlimited versions and see which one gets you more interviews."
  → CTA: "Upgrade to Pro · €15/mo" → Stripe checkout
  → Dismissing banner is NOT possible — it stays until upgrade or archiving a version frees a slot
```

### 4.4 Flow D — CV Version Becomes Locked

```
Entry: User edits a CV version. One of its linked applications transitions to Screening in the pipeline.
  → Real-time: the editor shows a lock banner at the top:
    "This CV version is now locked. An application linked to it has reached Screening stage — editing would break your performance data."
  → All form fields become read-only (disabled inputs)
  → Download (PDF/DOCX) still works
  → ATS Score and Pipeline Keywords tabs still work
  → "Duplicate to edit" CTA appears: "Want to make changes? Duplicate this version and edit the copy."
  → In the library card: lock icon appears next to CV name. Actions: View, Duplicate, Archive (no Edit)
  → API: PATCH /api/cv-versions/:id returns 422 if any linked application is in screening/interviewing/offer
```

### 4.5 Flow E — Pipeline Entry Point

```
Entry: User on /app/pipeline, clicks a job card that has no CV tagged
  → Job detail sheet opens (right slide-over on desktop, full-screen on mobile)
  → CV Version field shows "Untagged" with a yellow warning dot
  → Dropdown: list of user's active CV versions
  → Option at bottom: "Create new CV version" → navigates to Template Gallery
  → User selects or creates CV version → tagged to job application
  → Analytics attribution begins from that point
```

### 4.6 Flow F — Export with Format Guidance

```
Entry: User in Editor, ready to download
  → Download strip shows: "Download PDF" (primary) + "Download DOCX"
  → If pipeline has jobs at companies using Taleo or SAP:
    → Tooltip on "Download PDF": "Not recommended for [Company A] and [Company B] which use Taleo. Use DOCX instead."
    → "Download DOCX" button highlighted with amber border + "Recommended for 2 companies in your pipeline"
  → If no Taleo/SAP in pipeline → PDF is primary, no additional guidance shown
  → If two-column template is active and user downloads DOCX:
    → Warning dialog: "Two-column templates have limited DOCX support. ATS parsing may fail. Switch to Precision template for DOCX."
    → Options: "Use Precision for DOCX" (recommended) or "Download anyway"
```

---

## 5. User Stories

### Epic: Resume Builder

**Story US-01 — View CV Library**
```
As a job seeker tracking multiple applications in Europe,
I want to see all my CV versions on one page with performance data,
so that I can quickly understand which version is working and which needs attention.

Acceptance Criteria:
- [ ] Library shows all non-archived CV versions as cards
- [ ] Each card shows: name, template, last edited, screening rate badge, ATS safety badge, country tags
- [ ] Screening rate badge: green (≥18%), amber (8–17%), gray (<10 apps — "low confidence")
- [ ] ATS badge: "ATS Safe" (all rules pass) or "Review needed" (1+ rule fails)
- [ ] Default version card has blue border and star marker
- [ ] Filter tabs: All / Active / Archived — functional, no page reload
- [ ] Empty state: explanation + "Create first resume" CTA
- [ ] Mobile: single-column grid, all tap targets ≥ 44×44px
- [ ] RLS: only user's own CV versions returned
```

**Story US-02 — Create CV with Template Selection**
```
As a job seeker about to start applying,
I want to choose an ATS-validated template that matches my target companies' ATS systems,
so that my resume doesn't get filtered out before a human sees it.

Acceptance Criteria:
- [ ] Template gallery shows 5 templates in a grid
- [ ] Each template shows: structural thumbnail, name, ATS compatibility badges (pass/warn per system)
- [ ] Pipeline recommendation banner auto-surfaces if user has ≥1 saved jobs with known ATS
- [ ] Filter tabs: All / ATS-Safe / EU/A4 / Compact — filter grid without page reload
- [ ] "Use template" button appears on hover; clicking opens naming modal
- [ ] Naming modal: text input pre-filled "My Resume", confirm/cancel
- [ ] Creating a new version when free limit reached → disabled + upgrade gate (not error)
- [ ] Mobile: single-column grid, "Use template" always visible (not hover-only)
```

**Story US-03 — Edit CV Content**
```
As a job seeker building my resume,
I want to fill in my experience using a structured form and see a live PDF preview,
so that I know exactly how it will look when downloaded without any surprises.

Acceptance Criteria:
- [ ] Editor: 4 tabs (Content / Design / ATS Score / Pipeline Keywords) — all navigable
- [ ] Content tab: collapsible sections (Contact, Summary, Experience, Skills, Languages, Education)
- [ ] Contact section open by default; required fields visually indicated
- [ ] Work Experience: add/remove entries; add/remove/reorder bullets within entries
- [ ] Languages section: language name + CEFR level selector (A1–C2) per entry
- [ ] Skills: tag input (type + Enter to add, click × to remove)
- [ ] Autosave every 30s and on any field blur — no data loss on accidental navigation
- [ ] "Save" button: explicit save with optimistic UI + success toast
- [ ] CV name: editable inline in top bar
- [ ] Live preview: right pane updates on every keystroke (debounced 300ms)
- [ ] Preview shows correct A4 / Letter format per template
- [ ] Locked CV: all fields read-only; lock banner explains why; "Duplicate to edit" CTA shown
- [ ] Mobile: editor collapses to form-only (preview hidden); preview accessible via "Preview" tab
```

**Story US-04 — Export PDF and DOCX**
```
As a job seeker ready to apply,
I want to download my CV as PDF or DOCX with clear guidance on which format to use per company,
so that I don't accidentally submit a format that fails the ATS at my target companies.

Acceptance Criteria:
- [ ] "Download PDF" button always present in editor
- [ ] "Download DOCX" button always present in editor
- [ ] If user's pipeline contains companies using Taleo/SAP: amber highlight on DOCX + tooltip naming companies
- [ ] If two-column template + DOCX export: warning dialog with "Use Precision instead" CTA
- [ ] PDF: text-based (not rasterized), ATS-parseable — generated via @react-pdf/renderer
- [ ] DOCX: proper structure via docx library — not a converted PDF
- [ ] Download filename: "[CV-name]-[date].pdf" / ".docx"
- [ ] Download works offline once page is loaded (client-side generation for PDF, server for DOCX)
- [ ] Empty CV: download disabled (greyed) with tooltip "Add content before downloading"
- [ ] Download triggers an analytics event for conversion tracking
```

**Story US-05 — ATS Score Check**
```
As a job seeker preparing to apply,
I want to see an ATS score for my CV with specific warnings I can act on,
so that I fix issues before submitting to companies that use automated screening.

Acceptance Criteria:
- [ ] ATS Score tab shows a score (0–100) with color (green ≥80, amber 60–79, red <60)
- [ ] Score broken into 4 categories: Layout & Formatting / Section Headers / Pipeline Keywords / File Export
- [ ] Each category shows: score, pass/warn icon, specific actionable detail
- [ ] Sticky ATS chip in editor (Content tab) shows current score + warning count at all times
- [ ] Score updates in real-time as user edits content (debounced 500ms)
- [ ] ATS rules evaluated client-side (no API call needed for basic rules)
- [ ] "Re-scan" button forces re-evaluation
- [ ] If no pipeline jobs: keyword category shows "Add jobs to pipeline to see keyword gaps"
```

**Story US-06 — Pipeline Keyword Comparison**
```
As a job seeker who wants to optimize my CV for my specific target roles,
I want to see which keywords appear in my saved job descriptions but are missing from my CV,
so that I can tailor my content to what my target companies actually want — without pasting JDs manually.

Acceptance Criteria:
- [ ] Pipeline Keywords tab shows missing keywords ranked by frequency across saved pipeline jobs
- [ ] Each keyword shows: keyword text, count badge (×N jobs)
- [ ] Keywords sourced from user's own pipeline jobs (Saved + Applied stages only)
- [ ] Clicking a keyword opens a sidebar/drawer showing which pipeline jobs mention it + suggested CV section
- [ ] High-frequency keywords (≥3 jobs): amber highlight; lower frequency: gray
- [ ] If fewer than 3 pipeline jobs: "Add more jobs to pipeline for better keyword analysis"
- [ ] "How are these calculated?" link opens spec explanation
- [ ] RLS: only user's own pipeline jobs used
```

**Story US-07 — Free Tier Gating**
```
As a free user at my CV version limit,
I want to understand clearly why I can't create more versions and what I'd get with Pro,
so that I can make an informed upgrade decision — not feel blocked without context.

Acceptance Criteria:
- [ ] Free limit = 2 active (non-archived) CV versions; enforced at API (POST returns 403) + UI
- [ ] "+ New" card is disabled (not hidden) with tooltip "Free plan includes 2 CV versions"
- [ ] Amber banner in library explains limit + benefit of upgrading (performance analytics emphasis)
- [ ] Pro-locked placeholder card in grid shows blurred content + "Unlock unlimited CVs" CTA
- [ ] Archiving a version frees a slot immediately (no page reload needed)
- [ ] Upgrade CTA: links to Stripe checkout
- [ ] Pro users: no limit, no banner, no locked placeholder
```

**Story US-08 — CV Version Lock**
```
As a user whose application has reached the Screening stage,
I want my CV version to be locked from edits,
so that my performance analytics stay accurate — the version that got me the call is preserved.

Acceptance Criteria:
- [ ] CV version becomes locked when ANY linked application transitions to Screening or beyond
- [ ] Locked state is detected via API on every editor open (not just at transition time)
- [ ] Editor: lock banner explains why + "Duplicate to edit" CTA
- [ ] All form fields in locked CV: visually disabled (gray, no cursor)
- [ ] Download still works on locked CVs
- [ ] ATS Score and Pipeline Keywords tabs still work on locked CVs
- [ ] Library card: lock icon + lock tooltip + only "View", "Duplicate", "Archive" actions available
- [ ] API: PATCH /api/cv-versions/:id returns 422 with error body: `{ error: "locked", reason: "linked_application_in_screening" }`
- [ ] Unlocking: not supported — archive and start fresh
```

**Story US-09 — Set Default CV Version**
```
As a user managing multiple CV versions,
I want to set one version as my default,
so that it's automatically pre-selected when I tag a CV to a new job application in the pipeline.

Acceptance Criteria:
- [ ] "Set as default" action in library card 3-dot menu
- [ ] Only one version can be default at a time; setting new default unsets previous
- [ ] Default card has blue border + star icon
- [ ] Default version pre-populated in Pipeline "CV version" field on new application
- [ ] If default version is archived: no default set (system uses none)
- [ ] API: PATCH /api/cv-versions/:id/default — sets is_default=true, unsets others via transaction
```

**Story US-10 — Duplicate CV Version**
```
As a user who wants to create a country-specific variant without starting from scratch,
I want to duplicate an existing CV version and edit the copy,
so that I preserve my best-performing version while adapting content for a new market.

Acceptance Criteria:
- [ ] "Duplicate" action available on all cards (including locked ones)
- [ ] Duplicate modal: pre-filled name "[Original Name] – Copy"; user can rename
- [ ] Duplicate creates a full data copy of all sections and content
- [ ] Duplicate is NOT locked even if original is locked
- [ ] Duplicate's analytics start at 0 (no applications inherited)
- [ ] Duplicate respects free tier limit (if at 2, duplicate is blocked with upgrade prompt)
- [ ] Created duplicate appears in grid immediately (optimistic UI)
```

---

## 6. Corner Cases & Edge Handling

### 6.1 Data & Content Edge Cases

| Scenario | Expected Behaviour |
|---|---|
| CV name is blank on save | Block save; highlight name field; toast "Please name your resume" |
| CV name is duplicate of existing | Allow it — no uniqueness enforced. User may intentionally have "PM Berlin v1" and "PM Berlin v2" |
| CV with zero content (all sections empty) | Downloads disabled. ATS score shows 0. Tooltip: "Add content before downloading." |
| CV with >2 pages of content | In-preview page-break indicator shown ("Content continues on page 2"). No hard block — user decides. |
| User deletes all bullets in an experience entry | Entry remains with empty bullets array. Warning: "This role has no bullet points — it may hurt your screening rate." |
| Summary exceeds 150 words | Amber warning below textarea: "Most ATS systems prefer summaries under 150 words." No hard block. |
| User adds 15+ skills | All shown. No limit. Tag cloud wraps naturally. |
| User adds 5+ languages | All shown. No visual compression. CEFR selector per language. |
| Autosave conflicts (two tabs open) | Last-write wins. No conflict resolution in v1. Toast: "Saved from another tab." |
| Session expires mid-edit | On next load: draft is restored from autosave. Toast: "Unsaved changes restored." |
| Network offline during edit | Form still editable (client state). Autosave queued. On reconnect: saves automatically. Toast: "Back online — changes saved." |

### 6.2 Template & Export Edge Cases

| Scenario | Expected Behaviour |
|---|---|
| User switches template after filling content | Confirmation dialog: "Switching template will reformat your content. Your text is preserved." Confirm/Cancel. |
| Two-column template + DOCX download | Warning dialog: "Two-column templates may fail in Taleo/SAP ATS. We recommend downloading as PDF for these templates, or switch to Precision for DOCX." Options: "Switch to Precision", "Download anyway". |
| Two-column template + SAP/Taleo in pipeline | Both warnings triggered simultaneously — merge into one dialog with clear recommendation. |
| PDF generation fails server-side | Toast: "PDF generation failed — try again." Retry button. No silent failure. |
| DOCX generation fails server-side | Same as above with "DOCX generation failed". |
| Download on a locked CV | Allowed. Lock does not affect export. |
| Download on an archived CV | Allowed. Archived CVs remain downloadable. |
| User has no pipeline jobs (no keyword data) | Pipeline Keywords tab shows: "No saved jobs in your pipeline. Add jobs to see which keywords you're missing." CTA: "Go to Pipeline". |
| User's pipeline jobs have no job descriptions | Keyword tab shows: "Add job descriptions to your saved applications to enable keyword analysis." |

### 6.3 Versioning & Lifecycle Edge Cases

| Scenario | Expected Behaviour |
|---|---|
| User archives a version with active (Applied) applications | Warning dialog: "Archiving this version won't remove it from linked applications. It will still be tracked for performance data. Continue?" Confirm/Cancel. |
| User archives a version that is the current default | Default is unset. No version becomes default automatically. Notify: "Default removed — select a new default version." |
| User tries to delete (not archive) a CV version | No hard delete in v1. Archive only. No delete action in UI. API: DELETE /api/cv-versions/:id archives instead of deletes. |
| Free user archives 1 version to free a slot | Slot opens immediately. Orange banner updates. "+ New" card re-enables. |
| All versions archived | Library shows archived cards with empty-state message for active: "All your resumes are archived. Unarchive one or create a new resume." |
| User duplicates a locked version | Allowed. Duplicate is unlocked. Duplicate starts with 0 analytics. Original stays locked. |
| Free user tries to duplicate (would exceed 2-version limit) | Duplicate modal shows but on confirm → free tier limit error: upgrade prompt dialog. |
| User creates CV version, never tags it to any application | Stats show 0/0/—. Tooltip on stats: "Tag this CV to a job application in the pipeline to start tracking." |

### 6.4 ATS Score Edge Cases

| Scenario | Expected Behaviour |
|---|---|
| Single-column template selected but user adds a table-like structure in summary | Not possible — free-text textarea doesn't render tables in the PDF. Score unaffected. |
| Two-column template → layout score is automatically partial | ATS Layout score shows ⚠ with explanation: "Sidebar layout is not compatible with Taleo/SAP ATS." Score: 20/25 for layout. |
| User renames "Work Experience" section to custom label | ATS Section Headers score warns: "Non-standard section header detected. ATS parsers may misclassify this content." |
| ATS score = 100/100 | Score shows green with "Excellent — passes all major ATS systems." No action needed. |
| CV is locked — ATS score still calculated | Yes — score is read-only display. No edit prompts. |

### 6.5 Pro Gate Edge Cases

| Scenario | Expected Behaviour |
|---|---|
| Free user with 1 version creates a 2nd | Allowed. No warning. |
| Free user with 2 versions tries API directly (bypasses UI) | POST /api/cv-versions returns 403: `{ error: "limit_reached", tier: "free", limit: 2 }` |
| Free user upgrades mid-session | Zustand store updated via realtime Supabase subscription. Orange banner disappears. "+ New" card re-enables. No page reload required. |
| Pro user downgrades (future) | Versions above 2 become read-only (not deleted). User warned: "You have X versions above the free limit. Upgrade to restore access." |

### 6.6 Mobile Edge Cases

| Scenario | Expected Behaviour |
|---|---|
| Editor on mobile (390px) | Right pane (preview) hidden. "Preview" tab added to top of editor. Preview opens full-screen. |
| Template gallery on mobile | Single-column grid. "Use template" button always visible (not hover-dependent). ATS badges truncated to icons. |
| Downloading on mobile | Both PDF + DOCX downloads trigger native browser download. Test on iOS Safari (PDF opens in viewer, DOCX downloads). |
| Library card actions on mobile | 3-dot menu (not hover-based buttons). Tap → bottom sheet with action list. |
| Lock warning on mobile | Full-width banner at top of editor. "Duplicate to edit" as primary CTA button below it. |

---

## 7. Technical Specifications

### 7.1 Data Model

**Table: `cv_versions`** (already in schema — extend with structured data field)

```sql
-- Existing columns (keep):
id UUID PRIMARY KEY DEFAULT gen_random_uuid()
user_id UUID REFERENCES profiles(id) ON DELETE CASCADE
name VARCHAR(100) NOT NULL
description TEXT
tags TEXT[]
is_default BOOLEAN DEFAULT false
is_archived BOOLEAN DEFAULT false
file_url TEXT         -- DEPRECATED: soft-deprecated 2026-03-22. Column retained for schema stability. Never write to this column. Existing rows have null.
file_type TEXT        -- DEPRECATED: same as file_url. Retain, never write.
created_at TIMESTAMPTZ DEFAULT now()
updated_at TIMESTAMPTZ DEFAULT now()

-- New columns (add via migration):
template_id TEXT NOT NULL DEFAULT 'precision'
  -- values: 'precision' | 'modern_tech' | 'compact_eu' | 'europass' | 'senior_ic'

resume_data JSONB NOT NULL DEFAULT '{}'
  -- structured content; schema defined below

target_country TEXT
  -- e.g. 'DE', 'NL', 'GB', 'FR'; nullable; inferred from user profile on create

is_locked BOOLEAN GENERATED ALWAYS AS (
  EXISTS (
    SELECT 1 FROM job_applications ja
    WHERE ja.cv_version_id = id
    AND ja.stage IN ('screening', 'interviewing', 'offer', 'hired')
  )
) STORED
  -- computed column; not settable directly

-- RLS (already enabled; keep as-is):
-- CREATE POLICY "Users can only access own data" ON cv_versions
--   FOR ALL USING (auth.uid() = user_id);
```

**`resume_data` JSONB schema:**

```typescript
interface ResumeData {
  contact: {
    firstName: string
    lastName: string
    targetTitle: string
    email: string
    location: string
    linkedin?: string
    phone?: string
    website?: string
  }
  summary?: string
  experience: Array<{
    id: string           // nanoid for React key
    company: string
    title: string
    location?: string
    startDate: string    // "Jan 2022"
    endDate: string      // "Present" | "Dec 2021"
    bullets: Array<{
      id: string
      text: string
    }>
  }>
  education: Array<{
    id: string
    institution: string
    degree: string
    field?: string
    startDate?: string
    endDate?: string
    grade?: string
  }>
  skills: string[]       // ordered array; render as tags
  languages: Array<{
    id: string
    language: string
    level: 'A1' | 'A2' | 'B1' | 'B2' | 'C1' | 'C2'
  }>
  certifications?: Array<{
    id: string
    name: string
    issuer?: string
    date?: string
  }>
  projects?: Array<{
    id: string
    name: string
    description?: string
    url?: string
    technologies?: string[]
  }>
  sectionOrder: string[] // e.g. ['contact','summary','experience','skills','education','languages']
}
```

**New table: `cv_ats_snapshots`** (optional, Phase 2.5 — store ATS score at time of application for audit trail)

```sql
-- Defer to Phase 2.5. Not required for core builder.
```

### 7.2 API Design

| Endpoint | Method | Auth | Description | Status codes |
|---|---|---|---|---|
| `GET /api/cv-versions` | GET | Required | List user's CV versions with aggregated stats (screening rate) | 200, 401 |
| `POST /api/cv-versions` | POST | Required | Create new version. Free tier check: count active versions; return 403 if ≥2 | 201, 400, 401, 403 |
| `GET /api/cv-versions/:id` | GET | Required | Get single version with full `resume_data` | 200, 401, 404 |
| `PATCH /api/cv-versions/:id` | PATCH | Required | Update name, template_id, resume_data, tags, target_country. Returns 422 if is_locked=true | 200, 401, 404, 422 |
| `PATCH /api/cv-versions/:id/default` | PATCH | Required | Set as default (unsets all others in transaction) | 200, 401, 404 |
| `PATCH /api/cv-versions/:id/archive` | PATCH | Required | Toggle is_archived. If archiving default version: also unsets is_default | 200, 401, 404 |
| `POST /api/cv-versions/:id/export/pdf` | POST | Required | Generate PDF. Returns binary stream with Content-Type: application/pdf | 200, 401, 404, 500 |
| `POST /api/cv-versions/:id/export/docx` | POST | Required | Generate DOCX. Returns binary stream | 200, 401, 404, 500 |
| `GET /api/cv-versions/:id/keywords` | GET | Required | Pipeline keyword comparison. Queries job_applications for user's Saved/Applied jobs, extracts keywords from job descriptions | 200, 401, 404 |
| `GET /api/cv-versions/:id/stats` | GET | Required | Screening rate, application count, trend. Joins cv_versions → job_applications → stage_history | 200, 401, 404 |

**Error body format (all endpoints):**
```typescript
{ error: string, code?: string, details?: Record<string, string> }

// Lock error:
{ error: "CV version is locked", code: "locked", reason: "linked_application_in_screening" }

// Free tier limit:
{ error: "Free tier limit reached", code: "limit_reached", tier: "free", limit: 2 }
```

### 7.3 New Libraries (require explicit approval)

| Library | Purpose | Why justified | Stack impact |
|---|---|---|---|
| `@react-pdf/renderer` | PDF generation | Vercel-compatible, no Chromium, text-based ATS-safe output, 2M weekly downloads | Add to package.json |
| `docx` | DOCX generation | Pure JS, no system deps, required for Taleo/SAP EU enterprise compatibility | Add to package.json |

No other new libraries. Both additions must be documented in `CLAUDE.md` under "Tech Stack — Non-Negotiable" before build starts.

### 7.4 PDF Generation Architecture

```
User clicks "Download PDF"
  → POST /api/cv-versions/:id/export/pdf (Route Handler, Node.js runtime — NOT Edge)
  → Server fetches resume_data from Supabase (RLS-scoped)
  → Selects template React component: PrecisionTemplate | ModernTechTemplate | ...
  → Renders via @react-pdf/renderer: renderToBuffer(<Template data={resumeData} />)
  → Returns binary PDF stream with headers:
      Content-Type: application/pdf
      Content-Disposition: attachment; filename="[cv-name]-[date].pdf"
  → Client receives and triggers browser download
```

Important: Route Handler must use `export const runtime = 'nodejs'` (not Edge) due to `@react-pdf/renderer` Node.js dependency.

### 7.5 ATS Score Rules (client-side, no API)

Evaluated against `resume_data` + selected `template_id`:

```typescript
const ATS_RULES: Rule[] = [
  // Layout & Formatting (25pts)
  { id: 'single_column', score: 12, check: (d, t) => !['modern_tech'].includes(t) || isSidebarOnly(t) },
  { id: 'no_image', score: 8, check: (d) => true }, // never allowed in v1
  { id: 'contact_in_body', score: 5, check: (d) => !!d.contact.email }, // always true if contact filled

  // Section Headers (25pts)
  { id: 'standard_summary_header', score: 10, check: (d) => true }, // template controls header label
  { id: 'standard_experience_header', score: 8, check: (d) => true },
  { id: 'standard_education_header', score: 7, check: (d) => true },

  // Keywords vs Pipeline (25pts — requires pipeline data, fetched separately)
  // Scored as: 25 * (matched_keywords / total_high_freq_keywords), min 0
  { id: 'pipeline_keywords', score: 25, check: async (d, t, pipelineKeywords) => score(d, pipelineKeywords) },

  // File Export (25pts)
  { id: 'pdf_safe_template', score: 15, check: (d, t) => t !== 'modern_tech' || !hasTaloInPipeline() },
  { id: 'docx_recommended_flagged', score: 10, check: (d, t, pipeline) => !hasTalosInPipeline(pipeline) },
]
```

### 7.6 Pro Gate Implementation

```tsx
// In CV library and editor:
// Read tier from useUserStore (Zustand)
// Gate: Free users → 2 active versions max

// API enforcement (POST /api/cv-versions):
const { count } = await supabase
  .from('cv_versions')
  .select('id', { count: 'exact' })
  .eq('user_id', user.id)
  .eq('is_archived', false)

if (count >= 2 && profile.subscription_tier === 'free') {
  return NextResponse.json({ error: 'limit_reached', ... }, { status: 403 })
}

// UI enforcement:
// <ProGate> wrapper NOT used here (limit is count-based, not feature-based)
// Instead: disable "+ New" card, show tier banner, blur placeholder card
// Performance analytics tab in library: wrap in <ProGate feature="cv-performance" />
```

### 7.7 Supabase Query Patterns

```typescript
// List CV versions with screening rate
const { data } = await supabase
  .from('cv_versions')
  .select(`
    *,
    job_applications (
      id,
      stage,
      stage_history (to_stage, transitioned_at)
    )
  `)
  .eq('user_id', user.id)
  .eq('is_archived', false)
  .order('updated_at', { ascending: false })

// Compute screening rate client-side from joined data:
const screeningRate = (applied: number, screened: number) =>
  applied < 10 ? null : Math.round((screened / applied) * 100)
```

### 7.8 Mobile Architecture

| Screen | Desktop pattern | Mobile pattern |
|---|---|---|
| My CVs library | Multi-column grid (3 cols) | Single column (`grid-cols-1`) |
| Template gallery | 3-column grid | Single column |
| Card actions | Hover reveals buttons | Tap → bottom `<Sheet>` with action list |
| Editor | Split-pane (form left, preview right) | Tabs: "Edit" and "Preview" (stacked) |
| Lock banner | Inline in editor top bar | Full-width sticky banner |
| Free tier banner | Inline at top of library | Sticky at bottom (above bottom nav) |
| Modals | Centered `<Dialog>` | Bottom `<Sheet>` (slide up from bottom) |
| Download buttons | In download strip below preview | Sticky bottom bar in Preview tab |

---

## 8. Design & UX Specifications

### 8.1 Screen 1 — My CVs: Detailed Spec

**Empty state (no versions):**
```
[Icon: document with +]
Your resume library is empty
Build an ATS-validated resume that's tailored to your target roles.
[CTA: "Create first resume"] → navigates to Template Gallery
```

**Card anatomy (precise spec from prototype v2):**
- Thumbnail: 90px tall, shows structural layout wireframe of template (not real content)
- Title: 15px/700, gray-900, truncate at 1 line
- Meta: 12px/400, gray-400 — "[Template name] · Edited [relative time]"
- Tags row: country tag + role tag (from `target_country` + `resume_data.contact.targetTitle`)
- Screening rate badge: `badge-green` (≥18%) | `badge-amber` (8–17%) | `badge-secondary` with "Low confidence" (<10 apps)
- ATS badge: `badge-green` "ATS Safe" | `badge-amber` "Review needed"
- Stats grid: 3 columns — Applied / Screenings / Rate
- Rate value: green-600 (≥18%), amber-500 (8–17%), gray-300 with "—" (<10 apps)
- Default card: blue border (`border-2 border-blue-500`) + star icon + "Default" label
- Locked card: lock icon inline with title, actions: View / Duplicate / Archive only
- Actions (desktop): hover reveals icon buttons — Edit (pencil), Duplicate, Archive
- Actions (mobile): tap card → bottom Sheet with: Edit / Duplicate / Set as default / Archive

### 8.2 Screen 2 — Template Gallery: Detailed Spec

**Pipeline recommendation banner:**
- Shown only when: user has ≥1 saved/applied jobs with known ATS system in pipeline
- Blue gradient background (`blue-50` → `purple-50`)
- Text: "You have [N] companies using [ATS name] in your pipeline. [Template A] and [Template B] are fully compatible."
- If no pipeline data: banner not shown (no "generic" fallback message)

**Template card anatomy:**
- Thumbnail: 140px tall structural wireframe — visually distinct per template
- ATS badges: green ("Workday ✓") or amber ("Taleo ⚠") — per system
- "Recommended" banner on card if matches pipeline ATS majority
- Hover: "Use [Template Name] →" button appears (opacity transition)
- Selected: `border-2 border-blue-500` + box-shadow ring

**Naming modal (Dialog on desktop, bottom Sheet on mobile):**
- Input: pre-filled "[Template Name] – [Date]", e.g. "Precision – Mar 2026"
- Confirm button: "Create resume"
- Cancel: closes modal, returns to gallery

### 8.3 Screen 3 — Editor: Detailed Spec

**Tab bar: Content | Design | ATS Score | Pipeline Keywords**
- ATS Score tab: amber badge with warning count (e.g. "3")
- Pipeline Keywords tab: amber badge with missing keyword count (e.g. "8")
- Active tab: blue underline border
- Tabs persist state — switching tabs and back does not reset form

**Content tab — section collapse/expand rules:**
- Contact: open by default on first load of a new resume
- All others: collapsed by default on new resume; expanded state persisted per session
- Section header: click anywhere in header row to toggle
- Section status badge: "Complete" (green, all required fields filled) | "Optional" (gray) | "1 tip" (amber, ATS warning)

**Autosave behaviour:**
- Fires 30s after last keystroke (debounced)
- Fires on every field blur
- Does NOT fire if form is in error state
- Indicator: subtle "Saved [X seconds ago]" in editor top bar (not a toast — non-disruptive)
- If autosave fails: indicator turns red "Save failed — retry" with retry icon

**Live preview:**
- Updates debounced 300ms after last keystroke
- Shows real font (Arial in preview for ATS accuracy — not Inter)
- Page boundary indicator if content exceeds 1 A4 page
- No editing in the preview pane — it is read-only at all times

**ATS chip (sticky bottom of Content tab):**
- Always visible in Content tab — user doesn't need to switch to ATS tab to see score
- Score color: green (≥80) | amber (60–79) | red (<60)
- Click → switches to ATS Score tab
- Updates in real-time with content edits

---

## 9. Release Plan — Sprint by Sprint

**Total effort: 5 sprints × 1 week = ~5 solo weeks**
*(Each sprint = 1 focused work week, approximately 4–5 productive days)*

---

### Sprint 1 — Foundation: Data Model + CV Library UI
**Goal:** Stable schema, API layer, and CV library page (Screen 1) with real data.

| Task | Priority | Deliverable |
|---|---|---|
| Supabase migration: add `template_id`, `resume_data`, `target_country` to `cv_versions` | P0 | Schema live on staging |
| Verify `is_locked` computed column works correctly | P0 | Test with sample data |
| `GET /api/cv-versions` — list with joined stats | P0 | API functional |
| `POST /api/cv-versions` — create with free tier limit check | P0 | API functional + 403 on limit |
| `PATCH /api/cv-versions/:id/archive` | P0 | API functional |
| `PATCH /api/cv-versions/:id/default` | P0 | API functional |
| CV library page (`/app/cv-versions`) — grid of cards | P0 | UI renders from real API data |
| CV version card component — stats, badges, actions | P0 | Matches design spec |
| Empty state | P0 | Renders with CTA |
| Free tier banner (when at limit) | P0 | Shows/hides correctly |
| Pro-locked placeholder card | P0 | Renders for free users at limit |
| Filter pills (All / Active / Archived) | P1 | Client-side filter |
| Mobile: single-column, bottom sheet actions | P1 | 390px viewport pass |
| Playwright E2E: create version, archive, set default | P1 | Critical path covered |

**Sprint 1 Definition of Done:** User can view, create, archive, and manage CV versions from real Supabase data. Free tier limit enforced. Mobile pass complete.

---

### Sprint 2 — Template Gallery + Editor Shell
**Goal:** Template selection flow (Screen 2) and editor frame with tabs + collapsible sections (Screen 3, no PDF yet).

| Task | Priority | Deliverable |
|---|---|---|
| Template gallery page | P0 | 5 templates rendered with ATS badges |
| Pipeline recommendation banner (reads from `job_applications` ATS data) | P1 | Shows when pipeline has known ATS |
| Template selection → naming modal → creates `cv_version` via API | P0 | Full create flow works |
| Editor page layout: top bar, tabs, split pane shell | P0 | Shell renders |
| Content tab: all form sections with collapse/expand | P0 | Contact, Summary, Experience, Skills, Languages, Education |
| Work Experience: add/remove entries, add/remove bullets | P0 | Interactive |
| Skills: tag input (add/remove) | P0 | Interactive |
| Languages: CEFR level selector per language | P0 | Selector renders with A1–C2 options |
| `PATCH /api/cv-versions/:id` — save resume_data | P0 | API functional |
| Autosave (30s + on blur) | P1 | No data loss |
| Inline CV name editing in top bar | P1 | Editable and saves |
| Lock detection on editor open | P0 | Reads `is_locked`, renders read-only state |
| Mobile: editor collapses to form-only with Preview tab | P1 | 390px viewport pass |
| Design tab: placeholder ("Template design controls — coming soon") | P2 | Placeholder only |

**Sprint 2 Definition of Done:** User can select a template, name their CV, fill in all content sections, and save to Supabase. Editor is fully navigable. Locked CVs show correct read-only state.

---

### Sprint 3 — PDF/DOCX Generation + Live Preview
**Goal:** Live preview in editor right pane + working PDF and DOCX downloads.

| Task | Priority | Deliverable |
|---|---|---|
| Install `@react-pdf/renderer` + `docx` (document in CLAUDE.md) | P0 | Libraries added |
| 5 template React components for `@react-pdf/renderer` | P0 | Each renders from `resume_data` |
| `POST /api/cv-versions/:id/export/pdf` — Node.js runtime route | P0 | Returns binary PDF |
| `POST /api/cv-versions/:id/export/docx` — Node.js runtime route | P0 | Returns binary DOCX |
| Live preview component in editor right pane | P0 | `@react-pdf/renderer` `PDFViewer` — browser iframe with embedded live PDF |
| Preview debounce (300ms) | P0 | No jank on keystroke |
| Download strip: PDF + DOCX buttons | P0 | Both trigger download |
| Two-column template + DOCX warning dialog | P1 | Dialog renders and blocks/allows |
| Per-company export guidance (reads pipeline for Taleo/SAP companies) | P1 | Amber highlight + tooltip naming companies |
| Empty CV download disabled | P1 | Buttons greyed with tooltip |
| Filename format: `[cv-name]-[YYYY-MM-DD].pdf` | P1 | Correct filename on download |
| Page overflow indicator in preview (>1 A4 page) | P2 | Visual page break line |
| Mobile: preview full-screen in "Preview" tab | P1 | 390px viewport pass |
| Playwright E2E: fill form → download PDF → verify file received | P1 | Critical path covered |

**Sprint 3 Definition of Done:** User can see a live preview and download ATS-safe PDF and DOCX. Export format guidance works for pipeline-aware companies.

---

### Sprint 4 — ATS Score + Pipeline Keywords
**Goal:** ATS score checker and pipeline keyword tabs fully functional.

| Task | Priority | Deliverable |
|---|---|---|
| ATS rule engine (client-side) | P1 | Returns score 0–100 with category breakdown |
| ATS Score tab UI: gauge, category cards, specific warnings | P1 | Renders from rule engine output |
| Real-time ATS chip (debounced 500ms) in Content tab | P1 | Score updates as user types |
| `GET /api/cv-versions/:id/keywords` — pipeline keyword extraction | P1 | Returns keywords ranked by frequency |
| Pipeline Keywords tab UI: keyword tags with count badges | P1 | Renders from API |
| Keyword click → drawer/sheet: which jobs mention it + suggested CV section | P2 | Sheet renders correctly |
| "How are these calculated?" spec link | P2 | Opens explanation |
| ATS rules for two-column templates | P1 | Layout score appropriately penalised |
| "If no pipeline jobs" empty state for Keywords tab | P1 | Renders with CTA |
| Pro gate on CV performance stats in library cards | P0 | Free users see locked performance, Pro sees real data |
| `GET /api/cv-versions/:id/stats` — screening rate computation | P0 | Returns rate from joined data |
| Section reordering in editor (drag to reorder form sections) | P2 | @dnd-kit handles drag |
| Mobile: ATS and Keywords tabs in editor | P1 | 390px viewport pass |
| Playwright E2E: ATS tab renders, keywords load | P1 | Critical path covered |

**Sprint 4 Definition of Done:** ATS score and pipeline keyword tabs are functional. Pro gate on performance analytics is enforced. Screening rate shows on library cards.

---

### Sprint 5 — Polish, Mobile, Tests, Beta Launch
**Goal:** Production-ready: mobile pass, E2E coverage, QA, beta deploy.

| Task | Priority | Deliverable |
|---|---|---|
| Full mobile audit (390px viewport) — all 3 screens | P0 | No horizontal scroll, all taps ≥44×44px |
| Bottom sheet for card actions on mobile | P0 | Replaces hover-buttons |
| Modals → bottom sheet on mobile (<640px) | P0 | Dialog/Sheet responsive |
| Sticky bottom bar for downloads on mobile (Preview tab) | P0 | Accessible on mobile |
| All error states: Retry CTA, readable at 375px | P0 | No raw error text |
| All empty states: explanation + next-step CTA | P0 | No blank white space |
| Autosave network-offline handling | P1 | Queue + toast on reconnect |
| Lighthouse audit: >90 all categories | P0 | Pass before deploy |
| Playwright E2E: full happy path (create → edit → export → archive) | P0 | Passes in CI |
| Playwright E2E: free tier limit enforcement | P0 | Passes in CI |
| Playwright E2E: lock state (locked CV read-only) | P0 | Passes in CI |
| Playwright E2E: duplicate flow | P1 | Passes in CI |
| Code review pass (run @code-reviewer skill) | P0 | No critical issues |
| QA pass (run @qa-engineer skill) | P0 | No regressions |
| Deploy to staging → beta user group (5–10 users) | P0 | Staged rollout |
| In-app announcement: "Resume Builder is here" | P1 | Tooltip or banner for existing users |

**Sprint 5 Definition of Done:** Deployed to production. 5–10 beta users have access. All Playwright E2E tests passing in CI. Lighthouse >90. Pre-push quality gate completed.

---

## 10. Success Metrics

| Metric | Baseline | Target | How to measure | When to check |
|---|---|---|---|---|
| CV version creation rate (% of active users who create ≥1 version within 7 days) | 0% | >40% | Supabase event + pipeline query | 2 weeks post-launch |
| CV version tagged to application rate (% of new applications with cv_version_id set) | <10% (current untagged) | >60% | pipeline query: cv_version_id NOT NULL | 4 weeks post-launch |
| PDF/DOCX download per CV version created | — | ≥1 per version | export API hit count | 4 weeks post-launch |
| Free → Pro conversion lift (users who hit limit and upgrade) | baseline (pre-feature) | +2–3pp on current conversion rate | Stripe events | 6 weeks post-launch |
| ATS score tab engagement (% of editor sessions where ATS tab is opened) | — | >50% | tab click event | 4 weeks post-launch |
| Pipeline keyword tab engagement | — | >30% | tab click event | 4 weeks post-launch |
| NPS delta (users who created ≥1 CV version vs those who didn't) | — | +5pts | in-app survey | 8 weeks post-launch |

**Definition of done for this feature:**
> The Resume Builder is successful when ≥40% of active users create at least one CV version within 7 days of launch, and ≥60% of new pipeline applications have a CV version tagged — enabling performance attribution that drives Pro conversion.

---

## 11. Risks & Mitigations

| Risk | Probability | Impact | Mitigation |
|---|---|---|---|
| `@react-pdf/renderer` template development takes longer than estimated (5 templates × layout complexity) | High | High | Build Precision template first (simplest). Ship 1 template in Sprint 3, add remaining 4 in Sprint 4–5. |
| DOCX output for complex templates has unexpected ATS parsing issues | Medium | High | Test every template + DOCX output against 3 ATS parsers (Workday, Taleo, Greenhouse) before Sprint 3 closes. |
| Live preview performance on slow connections or older devices | Medium | Medium | Debounce 300ms. If render >500ms, show skeleton. Consider server-side rendering for preview if needed. |
| `resume_data` JSONB migration on existing `cv_versions` rows | Low | High | Migration adds `resume_data`, `template_id`, `target_country` columns with safe defaults. `file_url` soft-deprecated — no changes to existing rows. Test on staging before prod. |
| Computed column `is_locked` performance at scale | Low | Medium | Index on `(cv_version_id, stage)` in `job_applications`. Query plan check before deploy. |
| Pipeline keyword extraction quality (NLP vs simple frequency) | Medium | Medium | Start with simple frequency count of raw words from job description text. Good enough for v1. NLP upgrade in Phase 3. |
| Free tier conversion lift is lower than expected (users don't hit the 2-version limit fast enough) | Medium | Medium | If <20% hit limit in first 4 weeks: consider reducing free limit to 1 version, or surfacing performance analytics as the Pro gate rather than version count. |
| Mobile preview UX is confusing (form + preview as separate tabs) | Medium | Medium | Validate with 2–3 beta users in Sprint 5. If confused: change to "floating preview" button that overlays preview full-screen. |
| Solo capacity — feature takes longer than 5 weeks | High | Medium | P2 stories (section reordering, keyword click drawer, page overflow indicator) are cut first. P0 and P1 are non-negotiable. |

---

## 12. Open Questions

All decisions resolved 2026-03-22.

| # | Question | Decision |
|---|---|---|
| 1 | Live preview approach | **`@react-pdf/renderer PDFViewer`** — browser iframe, accurate PDF rendering. CPU note accepted; revisit if mobile performance issues are reported in Sprint 5. |
| 2 | Legacy `file_url` handling | **Soft deprecate** — column retained in schema, never written to going forward. No migration, no backward compatibility UI. Existing null rows unaffected. |
| 3 | ATS company database for export guidance | **Deferred** — ATS score engine ships without company-to-ATS mapping. Export guidance (Taleo/SAP DOCX recommendation) uses user-provided ATS field on job application (optional). Company DB is Phase 3. |
| 4 | Two-column template safety | **Include with warning label** — Modern Tech template ships in the gallery with explicit label: "Visual layout — may not parse correctly in Taleo, SAP, and Workday." Never labeled "ATS Safe." |
| 5 | Free tier performance data visibility | **Out of scope** — no Pro plan exists yet. Performance tab deferred to when Pro tier is implemented. Library cards show stats for all users with no tier gate for now. |

---

## 13. Full Acceptance Criteria Checklist

### Functional
- [ ] My CVs library renders from Supabase with real data
- [ ] Create, duplicate, archive, set-default all function end-to-end
- [ ] Free tier: 2-version limit enforced at API (403) and UI (disabled card + banner)
- [ ] Template gallery renders 5 templates with ATS badges
- [ ] Pipeline recommendation banner shows when pipeline has known ATS company
- [ ] Editor: all content sections editable and persistent
- [ ] Autosave: no data loss on accidental navigation
- [ ] PDF download: text-based, ATS-parseable, correct filename
- [ ] DOCX download: proper structure, correct filename
- [ ] Two-column + DOCX: warning dialog renders and works
- [ ] ATS score: renders 0–100 with category breakdown
- [ ] ATS chip: updates in real-time during editing
- [ ] Pipeline keywords: renders from user's own pipeline data
- [ ] CV version lock: enforced at API (422) and UI (read-only)
- [ ] Locked CV: download still works
- [ ] Free → Pro: upgrade CTA links to Stripe checkout

### Technical
- [ ] TypeScript strict — zero `any` across all new files
- [ ] All Supabase queries scoped to `auth.uid()` via RLS
- [ ] Zod validation on every API route input
- [ ] TanStack Query: all mutations have optimistic update + rollback on error
- [ ] No new libraries beyond `@react-pdf/renderer` and `docx` (both documented in CLAUDE.md)
- [ ] Server Components by default; `use client` only where required
- [ ] PDF Route Handler uses `export const runtime = 'nodejs'` (not Edge)
- [ ] DOCX Route Handler uses `export const runtime = 'nodejs'`

### Mobile (390px viewport)
- [ ] My CVs library: single-column grid, no horizontal scroll
- [ ] Template gallery: single-column grid
- [ ] Card actions: bottom sheet (not hover buttons)
- [ ] Editor: form-only on mobile, Preview tab opens full-screen preview
- [ ] Download buttons: sticky bottom bar in Preview tab on mobile
- [ ] All touch targets ≥ 44×44px
- [ ] Lock banner: full-width, readable on 375px
- [ ] Free tier banner: visible and dismissible on mobile

### Quality
- [ ] Lighthouse: >90 all categories
- [ ] Core Web Vitals: pass
- [ ] Playwright E2E: create → edit → export → archive
- [ ] Playwright E2E: free tier limit (API 403 + UI disabled)
- [ ] Playwright E2E: lock state (read-only, duplicate CTA)
- [ ] No console errors in production build
- [ ] Pre-push quality gate: @code-reviewer + @qa-engineer pass

### Product
- [ ] Success metrics have baseline + target defined and tracking instrumented
- [ ] Beta launch with 5–10 users complete
- [ ] In-app communication for existing users confirmed
