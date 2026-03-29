Sprint 1 — CV Version Management: Design Mockups
Audit summary before the designs:

Component	Status	Notes
CVVersionCard	✅ Solid	Tokens correct, stats/actions all there
CVVersionList filter tabs	❌ Missing	State exists, zero tab UI in JSX
Page header/title	❌ Bug	Says "Resume Builder", "New Resume" everywhere
Upload path	❌ Missing	new/page.tsx renders only TemplateGallery
CV badge on Kanban	✅ Built	Purple pill (var(--jf-purple)) — already works
GettingStartedBlock CV step	✅ Built	"Set up CV Versions" step exists at line 133
CVVersionPicker locked state	⚠ Weak	No lock icon, no caption, raw Tailwind classes
Empty state copy	⚠ Off-brand	Says "resume" — should say "CV"
Screen 1 — /cv-versions (My CVs page)
Current state: empty <div /> in the heading row, no filter tabs rendered, "Resume Builder" title.

Target design:


┌──────────────────────────────────────────────────────────────────────┐
│ HEADER                                                                │
│  ← My CVs                                                            │
│     Track which version gets you more interviews                     │
├──────────────────────────────────────────────────────────────────────┤
│                                                                       │
│  ┌─ Tab Pills ───────────────────┐       ┌──────────────────────┐    │
│  │  [● Active]  [All]  [Archived]│       │  + New Version       │    │
│  └───────────────────────────────┘       └──────────────────────┘    │
│                                                                       │
│  ┌── Free tier banner (amber, only at 2/2) ──────────────────────┐   │
│  │  ⚠  You're using 2/2 CV versions.                             │   │
│  │     Upgrade to Pro for unlimited tracking and see which CV    │   │
│  │     gets you more interviews.  [Upgrade · €15/mo →]           │   │
│  └───────────────────────────────────────────────────────────────┘   │
│                                                                       │
│  ┌─ CV Card ──────────────────┐  ┌─ Pro Locked Card ──────────┐     │
│  │  VERSION 01                │  │  ░░░░░░░░░░░░░░░░░░░░░░░░  │     │
│  │  Precision — Backend     ● │  │  ░░░░░░░░░░░░░░░░░░░░░░░░  │     │
│  │  [Default]          [···]  │  │  ░░░░░░░░░░░░░░░░░░░░░░░░  │     │
│  │                            │  │       ✦                     │     │
│  │  [ats-safe] [eu-a4]        │  │  Unlock unlimited CVs       │     │
│  │ ────────────────────────── │  │  See which version gets     │     │
│  │  12 apps · 42% screening   │  │  you more interviews.       │     │
│  │  18% interview rate        │  │                             │     │
│  │ ────────────────────────── │  │  [Upgrade to Pro · €15/mo]  │     │
│  │  Updated 20 Mar 2026       │  └─────────────────────────────┘     │
│  │ ────────────────────────── │                                       │
│  │  [↓ PDF]  [Duplicate]      │                                       │
│  │  [Archive]                 │                                       │
│  └────────────────────────────┘                                       │
│                                                                       │
└──────────────────────────────────────────────────────────────────────┘
Design tokens for the heading row (net new):


Eyebrow:     font-size: 11px, color: var(--jf-text-muted), font-family: var(--font-dm-mono)
Title:       font-size: 18px, font-weight: 600, color: var(--jf-text-primary)
Subtitle:    font-size: 13px, color: var(--jf-text-secondary)
Filter tab pills:


// Active tab
bg: var(--jf-text-primary) → #0F172A
text: #fff
border-radius: 9999px
padding: 6px 16px
font-size: 13px, font-weight: 500

// Inactive tab
bg: transparent
text: var(--jf-text-secondary)
hover: bg var(--jf-bg-subtle)
border-radius: 9999px
Accessibility: role="tablist" on container, role="tab" + aria-selected on each pill.

Screen 2 — "New CV" Entry (Two-path modal)
Current issue: new/page.tsx renders <TemplateGallery /> directly — no choice moment.

Target design — centered Dialog (md+), full-screen push (mobile):


┌───────────────────────────────────────────────────────────┐
│                                                           │
│  Create a CV version                                  [✕] │
│                                                           │
│  ┌─────────────────────────┐  ┌─────────────────────────┐ │
│  │                         │  │                         │ │
│  │  ┌──────────────────┐   │  │  ┌──────────────────┐   │ │
│  │  │ ◈  (blue/10%)    │   │  │  │ ↑  (purple/10%)  │   │ │
│  │  └──────────────────┘   │  │  └──────────────────┘   │ │
│  │                         │  │                         │ │
│  │  Build from template    │  │  Upload existing CV     │ │
│  │                         │  │                         │ │
│  │  5 EU-optimised         │  │  PDF or DOCX, max 10MB  │ │
│  │  templates with ATS     │  │  We'll store it and     │ │
│  │  scoring built in       │  │  track its performance  │ │
│  │                         │  │                         │ │
│  │  [Choose template →]    │  │  [Upload file →]        │ │
│  └─────────────────────────┘  └─────────────────────────┘ │
│                                                           │
│  ─────────────────────────────────────────────────────── │
│  WHAT'S A CV VERSION?                                    │
│  Each version gets its own screening rate. You'll see    │
│  which one gets you more interviews.                     │
└───────────────────────────────────────────────────────────┘
Design tokens:


// Option card container
border: 1px solid var(--jf-border)
border-radius: 12px
padding: 24px
hover: border-color → #2563EB, background → rgba(37,99,235,0.03)
transition: border-color 150ms ease-out, background 150ms ease-out

// Build-from-template icon container
w-10 h-10, border-radius: 10px
bg: rgba(37,99,235,0.08), color: #2563EB

// Upload icon container — purple to visually separate
bg: rgba(139,92,246,0.08), color: #8B5CF6

// "What's a CV version?" label
font-family: var(--font-dm-mono), font-size: 10px
letter-spacing: 0.1em, color: var(--jf-text-muted)
UPPERCASE
Mobile (390px): Full-screen push (/cv-versions/new as is), stacked vertically. Both option cards full-width with gap-4.

Screen 3 — Upload Path
Net new component: <UploadDropzone />


┌───────────────────────────────────────────────────────────┐
│                                                           │
│  ← Upload your CV                                     [✕] │
│                                                           │
│  ┌─────────────────────────────────────────────────────┐  │
│  │                                                     │  │
│  │              ↑                                      │  │
│  │    Drag your PDF or DOCX here                       │  │
│  │    or click to browse                               │  │
│  │                                                     │  │
│  │    PDF · DOCX · Max 10MB                            │  │
│  └─────────────────────────────────────────────────────┘  │
│                                                           │
│  [After file selected — inline success state]             │
│  ┌─────────────────────────────────────────────────────┐  │
│  │  ✓ Precision_Backend_2026.pdf         (234 KB)      │  │
│  │  [Remove ✕]                                         │  │
│  └─────────────────────────────────────────────────────┘  │
│                                                           │
│  Name this version *                                      │
│  ┌─────────────────────────────────────────────────────┐  │
│  │  e.g. Backend — NL market                           │  │
│  └─────────────────────────────────────────────────────┘  │
│                                                           │
│  Tags (optional)                                          │
│  ┌─────────────────────────────────────────────────────┐  │
│  │  [backend ✕] [netherlands ✕]   + Add tag            │  │
│  └─────────────────────────────────────────────────────┘  │
│                                                           │
│  Set as default?  [○]                                     │
│                                                           │
│  ────────────────────────────────────────────────────── │
│            [Cancel]          [Save CV version →]          │
└───────────────────────────────────────────────────────────┘
Dropzone states:

State	Border	Background	Notes
Default	2px dashed var(--jf-border)	var(--jf-bg-subtle)	
Hover	2px dashed #2563EB	rgba(37,99,235,0.03)	
Drag-over	2px dashed #2563EB	rgba(37,99,235,0.06)	Scale 1.01
Error (wrong type/size)	2px dashed #EF4444	rgba(239,68,68,0.04)	Shake animation
File accepted	Solid 1px #10B981	rgba(16,185,129,0.05)	Checkmark visible
Accessibility (critical):

<input type="file"> hidden but keyboard-reachable
Dropzone div has tabIndex={0}, role="button", aria-label="Upload CV file"
onKeyDown: Enter / Space triggers file picker
Post-upload success toast (Sonner):


✓ Backend — NL market saved
  Now assign it to applications in your pipeline.
  [Go to Pipeline →]
Screen 4 — CV Badge on Kanban Card
Already built. application-card.tsx:183-201 renders the badge in purple. No changes needed to the existing badge logic.

One design note: The badge uses border-radius: 100 (pill shape) but the Sprint PRD specified border-radius: 6px (rectangular). The pill reads better at this density. Recommendation: keep the pill shape — it differentiates from the salary badge while staying visually light.


┌──────────────────────────────────────┐
│  ██  Stripe                      ●   │  ← 30px colored initial + high-priority dot
│      Senior Product Manager          │
│      Amsterdam                        │
├──────────────────────────────────────┤
│  [Precision — Backend]  [€90k–€110k] │  ← CV badge (purple) + salary (neutral)
├──────────────────────────────────────┤
│  ⏱ 12d in stage           Medium    │
└──────────────────────────────────────┘
No CV state — when cv_version_id is null, the badge row collapses (already correct — job.cv_versions?.name guards the render).

Screen 5 — CVVersionPicker Locked State
Current issue: CVVersionPicker.tsx:24-35 disabled state uses raw Tailwind classes, no lock icon, no explanation.

Current:


┌─────────────────────────────────────────────┐
│  Precision — Backend                        │  ← gray bg, no lock, no caption
└─────────────────────────────────────────────┘
Target:


CV version
┌─────────────────────────────────────────────┐
│  🔒 Precision — Backend          [locked]   │  ← lock icon + locked badge
└─────────────────────────────────────────────┘
   CV version locked after screening stage.
   ↗ View version in My CVs
Design tokens for the locked state:


// Container
bg: var(--jf-bg-subtle)
border: 1px solid var(--jf-border)
border-radius: 8px
padding: 8px 12px
opacity: 0.8
cursor: not-allowed

// Lock icon
<Lock className="w-3.5 h-3.5" style={{ color: 'var(--jf-text-muted)' }} />

// Caption below
font-size: 12px
color: var(--jf-text-muted)
margin-top: 4px

// Link
color: var(--jf-interactive)
font-size: 12px
Tooltip on hover (desktop): "CV version cannot be changed once an application reaches Screening stage." Use <Tooltip> from shadcn/ui.

Screen 6 — Getting Started Block
Already built. GettingStartedBlock.tsx:133-137 has the "Set up CV Versions" step checking data?.hasCVVersion.

Two copy fixes needed:

Field	Current	Target
label	"Set up CV Versions"	"Create your first CV version"
subtitle	"Track which resume performs best"	"Track which CV gets you more interviews"

Getting Started                                        67% Complete
────────────────────────────────────────────────────  ████████░░░░
✓  Add a job to my Pipeline          Done
○  Create a STAR Story               [→ Stories]   ← High Priority
○  Create your first CV version      [→ My CVs]    ← needs copy fix
    "Track which CV gets you more interviews"
─  Get started with Resume Builder   (Soon)
Empty State — Design Token Fixes
CVVersionList.tsx:138-159 uses raw Tailwind colors. Target tokens:

Element	Current (raw)	Target (token)
Wrapper border	border-gray-200	border-[var(--jf-border)]
Icon bg	bg-gray-100	bg-[var(--jf-bg-subtle)]
Icon color	text-gray-300	text-[var(--jf-text-muted)]
Title	text-gray-700	text-[var(--jf-text-primary)]
Subtitle	text-gray-400	text-[var(--jf-text-muted)]
CTA text	"Create first resume"	"Create first CV"
Body copy	"resume library"	"CV library"
Implementation Order

Day 1:   Fix naming — "My CVs", "New CV" (page.tsx + new/page.tsx)
Day 1:   Fix empty state copy ("resume" → "CV") + token violations
Day 1:   Render filter tab pills in CVVersionList (state already wired)
Day 2:   Fix CVVersionPicker locked state (lock icon + caption + tooltip)
Day 2:   Fix GettingStartedBlock copy ("CV version", not "resume")
Day 3-4: Build TwoPathModal for new/page.tsx (template vs. upload choice)
Day 5-6: Build UploadDropzone + Supabase Storage upload (/api/cv-versions POST with file_url)
Day 7:   Wire name/tag form, success redirect, success toast
Day 8:   Stage-lock API enforcement (422 on screening+)
Day 9:   Mobile 390px audit
Day 10:  Playwright E2E — create → assign → verify badge