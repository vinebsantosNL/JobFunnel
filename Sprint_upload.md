Sprint 1 — CV Version Management
Full Feature PRD + User Flow + Design Audit
Phase 1 Audit — What's Already Built vs. What's Missing
Running the audit before writing requirements (per Design Workflow Step 1.1–1.2):

Area	Status	Gap
Template gallery (/cv-versions/new)	Built	No "Upload existing CV" path — only template creation
Resume editor with ATS scoring	Built	Editor exists, ATS tab exists
CV version cards with stats	Built	Cards show applications + screening rate
Free tier limit (2 versions)	Built	Limit enforced, Pro locked placeholder present
PDF export	Built	—
CVVersionPicker in application modal	Built	—
Filter tabs (All / Active / Archived)	Logic built, not rendered	filter state exists but tab buttons not rendered in JSX
Page title / section header	Missing	Empty <div /> in heading row; no eyebrow label or description
CV version badge on Kanban card	Unknown	Need to verify application-card.tsx renders the badge
Dashboard Getting Started step	Unknown	Need to verify GettingStartedBlock has CV step
Stage-lock enforcement (screening+)	Unknown	API 422 rule from CLAUDE.md Phase 2 domain rules
Page naming inconsistency	Bug	Page title says "Resume Builder" — should be "My CVs" (EU audience, CLAUDE.md: use "CV" not "Resume")
PRD: CV Version Management (Sprint 1 — Phase 2)

Status: Draft
Phase: 2 | Effort: M (~2 weeks) | Tier: Free (2 CVs) / Pro (unlimited)
Pillar: Outcome-Linked CV Experimentation
Problem
Mid-senior tech professionals in Europe apply with multiple CV variants — one tuned for backend roles, one for product-adjacent roles, one for DACH vs. NL markets — but have no system to track which version correlates with better screening outcomes. They lose the experiment: the CV that got them an interview at Booking.com lives in a Downloads folder with no metadata and no connection to their application history.

Customer language:

"I have three versions of my CV and no idea which one is actually working."

Users Affected
All active users who have ≥1 job application in the pipeline. Users with 5+ applications are the primary audience — they're the ones running variants.

Solution
A structured CV library where users create, name, and tag CV versions — then assign a version to each job application. Outcomes (screening rate, interview rate per version) feed directly into the Analytics CV Testing view. The loop is: create version → assign to applications → see which version converts better.

Two creation paths:

Build from template — existing flow (template gallery → editor → PDF)
Upload existing — new path (drag PDF/DOCX → name → tag → done)
Out of Scope (Sprint 1)
A/B statistical significance testing (Phase 3)
AI-generated CV content suggestions (Sprint 2)
ATS keyword matching against a specific job description (Sprint 3 — cover letter sprint adds this)
Multi-language CV versions (Phase 3)
CV import parsing (extracting text fields from uploaded PDF — too complex, not needed for v1)
Success Metrics
Metric	Baseline	Target	Measurement
CV version creation rate	0	≥60% of Pro users create ≥2 versions within 7 days	Supabase analytics
CV-tagged application rate	0	>50% of new applications have a cv_version_id	job_applications table
Analytics CV Testing visits	0	≥2 visits/week per active Pro user	Page view tracking
Free → Pro conversion from CV gate	—	Measurable uplift vs. baseline	Stripe events
Mobile Spec
/cv-versions page: single-column card grid at mobile (grid-cols-1), 2-col at sm:
"New CV" flow: full-screen push on mobile (not a Sheet/modal)
Template gallery: 1-col on mobile, 2-col at sm:, 3-col at lg:
Upload dropzone: full-width touch target, min 120px height, min-h-[44px] all tap targets
CV badge on Kanban card: truncated to 12 chars, overflow-hidden text-ellipsis
Pro Gate
Free tier: 2 active CV versions. At limit: "New Version" button disabled, <ProLockedCard /> shown (already built). Enforce limit at /api/cv-versions POST route — return 403 with { error: 'free_limit_reached' }. UI reads this error and shows upgrade modal, not a generic toast.

Acceptance Criteria
 Upload path: drag-and-drop + file picker for PDF/DOCX, max 10MB, stored in Supabase Storage at cv-files/{user_id}/{version_id}
 Filter tabs rendered: All / Active / Archived pill tabs above card grid
 Page naming: Header title = "My CVs", not "Resume Builder"
 CV version badge visible on Kanban ApplicationCard (truncated, with version color)
 Getting Started checklist: "Upload or create your first CV version" step, links to /cv-versions
 Stage lock: cv_version_id cannot be changed once job is in screening or beyond — API returns 422, UI shows locked state in picker
 Mobile: 390px viewport check passes
 RLS: all queries scoped to auth.uid()
 Optimistic update + rollback on archive/set-default actions
 E2E: Playwright test for create → assign → verify badge on Kanban card
User Flow (Marketing-Informed)
Designed from the ICP's perspective: a PM or SWE actively applying across DACH + Benelux, running 20–40 applications, knows their process has inefficiencies but can't diagnose which.

Entry Points (4 ways users arrive)

1. Getting Started checklist (Dashboard) → "Create your first CV" CTA
2. Application modal → CVVersionPicker → "Create new" when no versions exist
3. Sidebar nav → "My CVs"
4. Analytics → CV Testing tab → empty state CTA
Flow A — First-time user (empty state)

/cv-versions (empty state)
  └─ "Create first CV" CTA
       ├─ [Build from template] → Template Gallery → Editor → Save
       └─ [Upload existing CV] → Upload dropzone → Name + Tag → Save
            └─ CV version created → redirect to /cv-versions with new card
Flow B — Returning user (has CVs, creates another)

/cv-versions
  └─ "New Version" button (if < free limit or Pro)
       ├─ Same 2-path modal as Flow A
       └─ On Pro limit exceeded → upgrade modal shown instead
Flow C — Assigning a CV to an application (core loop)

Pipeline (Kanban) → click Application Card → Application Modal
  └─ "CV version" field (CVVersionPicker)
       ├─ No version yet → "(None)" shown, dropdown to pick
       ├─ Stage is screening/interviewing/offer → field locked, lock icon shown
       └─ Pick version → save → badge appears on Kanban card
Flow D — Checking what's working (analytics connection)

Analytics → "CV Testing" tab
  └─ Table: each CV version row with applications / screening rate / interview rate
       └─ Click a version row → filters pipeline to show only those applications
Critical moment: the "aha" loop

User adds 10 applications (5 with CV A, 5 with CV B)
→ 2 weeks later: CV A has 40% screening rate, CV B has 10%
→ Analytics surfaces this → user archives CV B, creates CV C based on what worked
→ This is the moment JobFunnel earns the Pro subscription
High-Fidelity Mockups
Screen 1 — /cv-versions (Active state, 2 versions, Free tier)

┌─────────────────────────────────────────────────────────────────────┐
│  ← [Sidebar]  │  My CVs                                   [Header]  │
│               ├─────────────────────────────────────────────────────┤
│  Dashboard    │                                                       │
│  Pipeline     │  ┌── Tab Pills ──────────────────────────────────┐   │
│  Analytics    │  │  [Active ●]  [All]  [Archived]                │   │
│  My CVs  ◀━━  │  └───────────────────────────────────────────────┘   │
│  Stories      │                                                       │
│  Settings     │  ┌── Free tier warning ──────────────────────────┐   │
│               │  │  ⚠  You're using 2/2 CV versions.             │   │
│               │  │     Upgrade to Pro for unlimited tracking      │   │
│               │  │     and see which CV gets you more interviews. │   │
│               │  │     [Upgrade · €15/mo]                        │   │
│               │  └───────────────────────────────────────────────┘   │
│               │                                                       │
│               │  ┌── CV Card ─────────────────┐ ┌─ Pro Locked ────┐  │
│               │  │  VERSION 01                 │ │ ░░░░░░░░░░░░░░ │  │
│               │  │  Precision — Backend        │ │ ░░░░░░░░░░░░░░ │  │
│               │  │  [Default ●]      [···]     │ │    blur layer  │  │
│               │  │                             │ │                │  │
│               │  │  [ats-safe] [eu-a4]         │ │  ✦ Unlock CVs  │  │
│               │  │ ─────────────────────────── │ │  See what works│  │
│               │  │  12 applications            │ │  [Upgrade Pro] │  │
│               │  │  Screening 42% · Interview  │ │                │  │
│               │  │  18%                        │ └────────────────┘  │
│               │  │ ─────────────────────────── │                     │
│               │  │  Updated 20 Mar 2026        │                     │
│               │  │ ─────────────────────────── │                     │
│               │  │  [▼ PDF]  [Duplicate]       │                     │
│               │  │  [Archive]                  │                     │
│               │  └─────────────────────────────┘                     │
└─────────────────────────────────────────────────────────────────────┘
Design tokens used:

Card: rounded-[16px] border var(--jf-border) bg var(--jf-bg-card) shadow var(--jf-shadow-sm)
Tab pills active: bg-[#0F172A] text-white rounded-full px-4 py-1.5 text-sm font-medium
Tab pills inactive: text-[var(--jf-text-secondary)] hover:bg-[var(--jf-bg-subtle)]
Warning banner: border border-amber-200 bg-amber-50 text-amber-800 rounded-lg px-4 py-3
Version label eyebrow: DM Mono, 10px, var(--jf-text-muted), letter-spacing: 0.1em
Stats row: DM Mono, 11px, var(--jf-text-muted), border-top/bottom var(--jf-border)
Screen 2 — "New CV" Modal (Two-path entry)

┌───────────────────────────────────────────────────────┐
│                                                       │
│  Create a CV version                              [✕] │
│                                                       │
│  ┌─────────────────────┐  ┌─────────────────────────┐ │
│  │                     │  │                         │ │
│  │  ◈  Build from      │  │  ↑  Upload existing     │ │
│  │     template        │  │     CV                  │ │
│  │                     │  │                         │ │
│  │  5 EU-optimised     │  │  PDF or DOCX, max 10MB  │ │
│  │  templates with     │  │  We'll store it and     │ │
│  │  ATS validation     │  │  track its performance  │ │
│  │                     │  │                         │ │
│  │  [Choose template→] │  │  [Upload file →]        │ │
│  └─────────────────────┘  └─────────────────────────┘ │
│                                                       │
│  ─────────────────────────────────────────────────── │
│  WHAT'S A CV VERSION?                                │
│  Each version gets its own screening rate. You'll    │
│  see which one gets you more interviews.             │
└───────────────────────────────────────────────────────┘
Mobile (390px): Full-screen push, not modal. Stacked vertically.


┌─────────────────┐
│ ← New CV version│
├─────────────────┤
│                 │
│ ◈ Build from    │
│   template      │
│                 │
│ 5 EU-optimised  │
│ templates with  │
│ ATS validation  │
│                 │
│ [Choose→]       │
├─────────────────┤
│                 │
│ ↑ Upload        │
│   existing CV   │
│                 │
│ PDF or DOCX,    │
│ max 10MB        │
│                 │
│ [Upload→]       │
└─────────────────┘
Design tokens:

Modal: Dialog shadcn/ui, size="md", rounded-2xl
Option cards: rounded-xl border border-[var(--jf-border)] p-6 hover:border-[#2563EB] hover:bg-[rgba(37,99,235,0.04)] transition-colors cursor-pointer
Icon container: w-10 h-10 rounded-xl bg-[rgba(37,99,235,0.08)] text-[#2563EB] (blue, matching primary)
Upload option icon: same pattern but with #8B5CF6 (purple) to visually differentiate paths
Screen 3 — Upload Path (after clicking "Upload existing CV")

┌───────────────────────────────────────────────────────┐
│                                                       │
│  ← Upload your CV                                 [✕] │
│                                                       │
│  ┌─────────────────────────────────────────────────┐  │
│  │                                                 │  │
│  │          ↑                                      │  │
│  │   Drag your PDF or DOCX here                    │  │
│  │   or click to browse files                      │  │
│  │                                                 │  │
│  │   PDF · DOCX · Max 10MB                         │  │
│  └─────────────────────────────────────────────────┘  │
│                                                       │
│  Name this version *                                  │
│  ┌─────────────────────────────────────────────────┐  │
│  │  e.g. Backend — NL market                       │  │
│  └─────────────────────────────────────────────────┘  │
│                                                       │
│  Tags (optional)                                      │
│  ┌─────────────────────────────────────────────────┐  │
│  │  [backend ✕] [netherlands ✕]  + Add tag         │  │
│  └─────────────────────────────────────────────────┘  │
│                                                       │
│  Set as default?  [○]                                 │
│                                                       │
│  ─────────────────────────────────────────────────── │
│              [Cancel]  [Save CV version →]            │
└───────────────────────────────────────────────────────┘
After upload (success state):


┌─────────────────────────────────────────────────────┐
│  ✓ Backend — NL market  saved                       │
│  Now assign it to applications in your pipeline.    │
│  [Go to Pipeline →]  [View My CVs]                  │
└─────────────────────────────────────────────────────┘
Design tokens:

Dropzone: border-2 border-dashed border-[var(--jf-border)] rounded-xl py-12 flex flex-col items-center gap-2 hover:border-[#2563EB] hover:bg-[rgba(37,99,235,0.03)] transition-colors
Dropzone active (dragging): border-[#2563EB] bg-[rgba(37,99,235,0.06)]
File uploaded state: show filename with checkmark + file size in DM Mono
Success toast: Sonner with green icon, message + CTA link inline
Screen 4 — CV Badge on Kanban Card (application-card.tsx update)

┌──────────────────────────────────────┐
│  ●  Stripe                           │   ← company initial
│  Senior Product Manager              │   ← job title
│                                      │
│  Amsterdam · €90k–€110k              │   ← location + salary
│                                      │
│  ┌────────────────┐  ┌────────────┐  │
│  │ 📄 Precision   │  │ ⚡ High     │  │   ← CV badge  + priority
│  └────────────────┘  └────────────┘  │
│                                      │
│  12d in stage          [···]         │   ← time in stage + menu
└──────────────────────────────────────┘
CV badge design:


// If cv_version_id is set:
<span style={{
  fontFamily: 'var(--font-dm-mono)',
  fontSize: '10px',
  padding: '3px 7px',
  borderRadius: '6px',
  background: 'rgba(37,99,235,0.08)',
  border: '1px solid rgba(37,99,235,0.2)',
  color: '#2563EB',
  maxWidth: '90px',
  overflow: 'hidden',
  textOverflow: 'ellipsis',
  whiteSpace: 'nowrap',
}}>
  📄 Precision
</span>

// If no cv_version_id:
<span style={{
  fontSize: '10px', padding: '3px 7px', borderRadius: '6px',
  background: 'var(--jf-bg-subtle)', border: '1px solid var(--jf-border)',
  color: 'var(--jf-text-muted)',
  fontFamily: 'var(--font-dm-mono)',
}}>
  No CV
</span>
Screen 5 — CVVersionPicker in Application Modal (locked state)

CV version
┌──────────────────────────────────────────────────┐
│  🔒  Precision — Backend     [locked]             │
│      CV locked after screening                    │
└──────────────────────────────────────────────────┘

// vs. unlocked (saved/applied stage):
┌──────────────────────────────────────────────────┐
│  📄 Precision — Backend                      [▼] │
└──────────────────────────────────────────────────┘
Lock state design tokens:

Locked container: bg-[var(--jf-bg-subtle)] border border-[var(--jf-border)] rounded-lg px-3 py-2.5 opacity-75 cursor-not-allowed
Lock icon: w-3.5 h-3.5 text-[var(--jf-text-muted)]
Lock caption: text-xs text-[var(--jf-text-muted)] mt-1
Screen 6 — Getting Started Block (dashboard integration)
The existing GettingStartedBlock should add:


Getting started
─────────────────────────────────────────────────────────
✓  Add your first application         [Done]
○  Add 2 interview stories            [+Stories →]
○  Create your first CV version       [My CVs →]    ◀ NEW
○  Assign a CV to an application      (unlocks after above)
─────────────────────────────────────────────────────────
Progress ████████░░░░░░░░ 50%
Design System Audit (Phase 1 — per Design Workflow Step 1.2)
Token violations found in current /cv-versions code
Component	Violation	Fix
CVVersionList free tier warning	Uses raw border-amber-200 bg-amber-50 text-amber-800	These are Tailwind color classes, not var(--jf-) tokens — acceptable for semantic status colors
CVVersionList empty state	Uses raw border-gray-200 bg-gray-100 text-gray-300 text-gray-700 text-gray-400	Should use var(--jf-border), var(--jf-bg-subtle), var(--jf-text-muted), var(--jf-text-primary)
ProLockedCard	Uses raw border-gray-200 bg-gray-100 text-gray-800 text-gray-500 bg-blue-50 text-blue-600	Mixed system — should use var(--jf-*) tokens consistently
CVVersionList filter tabs	Not rendered — filter state exists but no tab UI	Needs tab pill component (see pattern above)
Page title	Header says "Resume Builder"	Should be "My CVs" per EU-first naming in marketing context
CVVersionCard duplicate input	Uses raw border-gray-200 focus:ring-blue-500	Should use shadcn <Input> component
Missing component specs
Component	Status	Action
FilterTabs (pill tabs)	Not specced, pattern exists in codebase	Needs spec at .agent/skills/Design/components/FilterTabs.md
UploadDropzone	Net-new	Needs spec before building
CVBadge (on Kanban card)	Not specced	Needs spec at .agent/skills/Design/components/CVBadge.md
TwoPathModal (template vs upload)	Net-new	Needs spec
Accessibility gaps
Issue	Severity	Fix
CVVersionCard dropdown button has aria-label="Actions" but no disclosure role	Minor	Add aria-haspopup="menu" + aria-expanded
Dropzone (to be built) must have keyboard focus + Enter/Space to open file picker	Critical	Build with keyboard handler from the start
Filter tab pills must use role="tablist" + role="tab" + aria-selected	Major	Use semantic roles when implementing
Implementation Order (within Sprint 1)
Based on dependency order and risk:


Day 1–2:  Fix naming (Header title "My CVs"), render filter tabs, fix token violations in empty state
Day 3–4:  Build UploadDropzone component + upload path API (/api/cv-versions POST with file_url)
Day 5–6:  Wire upload to Supabase Storage, name/tag form, success redirect
Day 7:    CV badge on ApplicationCard (Kanban)
Day 8:    CVVersionPicker locked state for screening+ stages
Day 9:    Getting Started checklist step for CV version
Day 10:   Mobile audit (390px), Playwright E2E test, Design System component registration
Open Questions Before Building
Upload vs. parse — When a user uploads a PDF, do we show a "preview" of it in the CV versions list? Or just store it as a file download? Recommendation: store + allow download; do not parse content (scope creep, complex, not needed for v1).

Default CV on new applications — When a user creates a new application, should it auto-assign their default CV version? Recommendation: yes — reduce friction, easy to change later.

Analytics empty state — The CV Testing tab in Analytics is currently built. When a user has versions but no applications tagged to them, what does it show? Need an interim state: "Tag applications with a CV version to start seeing comparison data."

File size limit — 10MB is generous for PDFs. Most CVs are <500KB. Consider 5MB to reduce Supabase Storage costs, with a clear error message.

DOCX support — Storing a DOCX is straightforward. Previewing it is not (requires server-side conversion). Recommendation: store DOCX for download only; preview only available for PDFs (use react-pdf or the existing ResumePDF infrastructure).