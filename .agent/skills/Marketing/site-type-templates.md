# Site Type Templates — JobFunnel OS

Full page hierarchy templates, URL maps, and navigation specs. The JobFunnel template is the primary reference. Generic templates included for comparison when planning new content sections.

---

## JobFunnel OS — Marketing Site (Primary Template)

JobFunnel is a **Hybrid SaaS + Content** site with a strict separation between the public marketing site and the authenticated app.

### Full Page Hierarchy

```
Homepage (/)
├── Features (/features)
│   ├── Funnel Analytics (/features/funnel-analytics)          ← Pillar 1 — Phase 1
│   ├── Interview Content OS (/features/interview-content-os)  ← Pillar 2 — Phase 1
│   └── CV Experimentation (/features/cv-experimentation)      ← Pillar 3 — Phase 2, Pro only
├── Pricing (/pricing)
├── Blog (/blog)
│   ├── [Category: Job Search Strategy] (/blog/category/job-search-strategy)
│   ├── [Category: Interview Prep] (/blog/category/interview-prep)
│   ├── [Category: EU Tech Market] (/blog/category/eu-tech-market)
│   ├── [Category: CV & Applications] (/blog/category/cv-applications)
│   └── [Posts] (/blog/{slug})
├── Compare (/compare)
│   ├── JobFunnel vs Teal (/compare/teal)
│   ├── JobFunnel vs Jobscan (/compare/jobscan)
│   ├── JobFunnel vs Eztrackr (/compare/eztrackr)
│   └── JobFunnel vs Careerflow (/compare/careerflow)
├── Resources (/resources)
│   ├── Guides (/resources/guides)
│   │   ├── EU Job Search Guide (/resources/guides/eu-job-search)
│   │   ├── Funnel Analytics for Job Seekers (/resources/guides/funnel-analytics)
│   │   └── STAR Method Interview Guide (/resources/guides/star-method)
│   └── Templates (/resources/templates)
│       └── CV Templates (/resources/templates/cv-templates)
├── About (/about)
├── Login (/login)
├── Signup (/signup)
├── Privacy (/privacy)
├── Terms (/terms)
└── GDPR (/gdpr)

─── App (authenticated, separate nav zone) ───────────────────
/app/dashboard
/app/pipeline
/app/analytics
/app/analytics/cv-testing  ← Phase 2, Pro only
/app/stories
/app/cv-versions            ← Phase 2
/app/settings
```

### URL Map

| Page | URL | Nav Location | SEO Priority | Phase |
|---|---|---|---|---|
| Homepage | `/` | Logo | Critical | 1 |
| Features hub | `/features` | Header | High | 1 |
| Funnel Analytics | `/features/funnel-analytics` | Header dropdown | High | 1 |
| Interview Content OS | `/features/interview-content-os` | Header dropdown | High | 1 |
| CV Experimentation | `/features/cv-experimentation` | Header dropdown | Medium | 2 |
| Pricing | `/pricing` | Header | Critical | 1 |
| Blog index | `/blog` | Header | High | 1 |
| Blog post | `/blog/{slug}` | — | Medium | 1 |
| Blog category | `/blog/category/{slug}` | Blog sidebar | Medium | 1 |
| Compare index | `/compare` | Footer | Medium | 1 |
| vs Teal | `/compare/teal` | Footer | High (SEO) | 1 |
| vs Jobscan | `/compare/jobscan` | Footer | High (SEO) | 1 |
| vs Eztrackr | `/compare/eztrackr` | Footer | High (SEO) | 1 |
| vs Careerflow | `/compare/careerflow` | Footer | Medium (SEO) | 1 |
| EU Job Search Guide | `/resources/guides/eu-job-search` | Footer | High (SEO) | 1 |
| STAR Guide | `/resources/guides/star-method` | Footer | Medium | 1 |
| About | `/about` | Footer | Low | 1 |
| Login | `/login` | Header (auth) | — | 1 |
| Signup | `/signup` | Header (CTA) | — | 1 |
| Privacy | `/privacy` | Footer Legal | Required | 1 |
| Terms | `/terms` | Footer Legal | Required | 1 |
| GDPR | `/gdpr` | Footer Legal | Required (EU) | 1 |

### Navigation Spec

**Header (5 items + auth + CTA):**
```
[JobFunnel]   Features ▾   Pricing   Blog   Compare   Resources   [Login]   [Get Started Free]
```

**Features dropdown:**
- Funnel Analytics — "Track your Applied→Screening→Offer conversion rates"
- Interview Content OS — "Build a versioned STAR story bank by competency"
- CV Experimentation [Pro] — "A/B test which CV version gets more callbacks" *(Phase 2)*

**Footer (4 columns):**
- **Product**: Funnel Analytics, Interview OS, CV Experimentation, Pricing, Changelog
- **Resources**: Blog, EU Job Search Guide, STAR Method Guide, CV Templates
- **Compare**: vs Teal, vs Jobscan, vs Eztrackr, vs Careerflow
- **Legal**: Privacy, Terms, GDPR, About, Contact

**App sidebar (authenticated, separate):**
- Desktop: Dashboard | Pipeline | Analytics | Stories | CV Versions | Settings
- Mobile bottom tab: Pipeline | Analytics | Stories | Profile

---

## Feature Page Template (Each of the Three Pillars)

Each pillar feature page follows this structure:

```
/features/funnel-analytics
/features/interview-content-os
/features/cv-experimentation

Page structure:
├── Hero: headline + subheadline + product screenshot + "Get Started Free" CTA
├── Problem statement: "Most job seekers have no data on why they're not getting callbacks"
├── Feature breakdown: 3–4 specific capabilities with screenshots/GIFs
├── Comparison callout: "Unlike [competitor], JobFunnel shows you X"
├── Social proof: beta user quote (once available)
├── Pricing nudge: "Available on Free / Pro only" badge
└── CTA block: "Start tracking free" → /signup
```

## Compare Page Template (All Four Competitors)

```
/compare/teal
/compare/jobscan
/compare/eztrackr
/compare/careerflow

Page structure:
├── H1: "JobFunnel vs [Competitor]: Which is right for EU tech job seekers?"
├── TL;DR summary table (6–8 rows, checkmarks)
├── Detailed comparison by pillar (Funnel Analytics / Interview OS / CV Testing)
├── Where [Competitor] wins (honest — builds trust)
├── Where JobFunnel wins (EU-focus, analytics depth, all three pillars)
├── Pricing comparison
├── "Who should choose JobFunnel" — specific ICP statement
└── CTA: "Try JobFunnel free — no credit card required"
```

Comparison table columns: `Feature | JobFunnel | [Competitor]`
Rows: Pipeline tracking, Funnel analytics, Interview story bank, CV A/B testing, EU job boards, Free tier, Pricing

---

## Generic SaaS Marketing Site (Reference)

```
Homepage (/)
├── Features (/features)
│   ├── Feature A (/features/feature-a)
│   ├── Feature B (/features/feature-b)
│   └── Feature C (/features/feature-c)
├── Pricing (/pricing)
├── Customers (/customers)
│   └── [Case Study] (/customers/company-name)
├── Resources (/resources)
│   ├── Blog (/blog)
│   ├── Guides (/resources/guides)
│   └── Templates (/resources/templates)
├── Docs (/docs)
├── Compare (/compare)
│   └── [Competitor] (/compare/competitor-name)
├── About (/about)
├── Privacy (/privacy)
└── Terms (/terms)
```

**Header**: Features | Pricing | Customers | Resources | Docs | [Get Started]

**Footer**: Product · Resources · Company · Legal

---

## Generic Content / Blog Site (Reference)

```
Homepage (/)
├── Blog (/blog)
│   ├── [Category] (/blog/category/slug)
│   └── [Posts] (/blog/slug)
├── Newsletter (/newsletter)
├── Resources (/resources)
│   └── Guides (/resources/guides)
├── About (/about)
├── Privacy (/privacy)
└── Terms (/terms)
```

**Header**: Blog | Resources | About | [Subscribe]

**Sidebar**: Categories, Popular Posts, Newsletter signup

---

## Generic Documentation Site (Reference)

```
Docs Home (/docs)
├── Getting Started (/docs/getting-started)
│   ├── Installation (/docs/getting-started/installation)
│   └── Quick Start (/docs/getting-started/quick-start)
├── Guides (/docs/guides)
├── API Reference (/docs/api)
│   ├── Authentication (/docs/api/authentication)
│   └── Endpoints (/docs/api/endpoints)
├── Examples (/docs/examples)
└── Changelog (/docs/changelog)
```

**Header**: Docs | API | Blog | GitHub | [Dashboard]

**Left sidebar**: Persistent, sticky, collapsible sections, search at top, Previous/Next at bottom

---

## Phase 2 Site Expansion (Planned)

When Phase 2 launches (CV Versioning + Chrome Extension):

```
New pages to add:
├── /features/cv-experimentation (already planned, launch with Phase 2)
├── /chrome-extension            ← Download + install guide
├── /changelog                   ← Feature announcements
└── /blog/category/cv-optimization ← New content category

New compare rows to add to all /compare/* pages:
└── "CV A/B Testing: ✅ JobFunnel | ❌ [Competitor]"
```

Phase 3 (EU integrations, multi-language):
```
New pages:
├── /integrations                ← StepStone, EURES, Xing, Totaljobs
│   └── /integrations/{name}
└── /de, /nl, /fr                ← Localized landing pages
```
