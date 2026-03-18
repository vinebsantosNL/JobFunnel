# JobFunnel OS — CV Versioning & A/B Testing

**Product Requirements Document — Phase 2**

| Field | Value |
|---|---|
| Product | JobFunnel OS — CV Versioning & A/B Testing |
| Phase | 2 (Post-MVP) |
| Version | 1.0 |
| Date | March 2026 |
| Author | Vinicius Barbosa |
| Depends on | Phase 1 MVP (Pipeline, Analytics, Story Library) |
| Target Users | Mid-to-senior tech professionals in Europe (Pro tier) |
| Timeline | 4–6 weeks after MVP stabilization |

---

## 1. Problem Statement

Job seekers today have no way to know *which version of their CV actually performs better*. They create a "quantified impact" version, a "narrative" version, maybe one tailored for startups versus corporates — then send them out and hope for the best. When silence or rejections come back, they have no data to diagnose whether the CV itself was the bottleneck or whether it was targeting, timing, or fit.

This affects the primary ICP directly: mid-to-senior tech professionals running 20–60+ applications per search cycle across multiple European markets. These users already think in funnels and metrics (they use Jira, Amplitude, Notion daily), but their most important career document — the CV — remains an untested, gut-feel artifact.

The cost of not solving this is significant. Users waste weeks sending an underperforming CV before realizing something is off. The competitive analysis confirms no existing tool (Teal, Jobscan, Eztrackr) closes the loop between CV version and funnel outcomes. This is JobFunnel's clearest differentiation opportunity and a key driver of Pro tier conversion.

---

## 2. Goals

1. **Enable data-driven CV optimization**: Users can create, manage, and switch between multiple CV versions and see which version correlates with higher screening and interview rates.

2. **Increase Applied → Screening conversion by making it measurable**: Give users a clear view of how each CV version performs at the top of the funnel, so they can iterate with confidence.

3. **Drive Pro tier conversion and retention**: CV versioning and A/B testing are Pro-only features. Users who see measurable improvement in their funnel have a concrete reason to stay subscribed.

4. **Differentiate from competitors**: No existing job tracker offers outcome-linked CV experimentation. Shipping this establishes JobFunnel's positioning as the "data-driven job search" platform.

5. **Lay the foundation for advanced analytics (Phase 3)**: The data model and tracking infrastructure built here enables future statistical significance calculations, trend lines, and AI-powered recommendations.

---

## 3. Non-Goals

1. **AI-powered CV generation or rewriting** — This is a Future/Post-MVP feature. Phase 2 focuses on versioning, tracking, and comparison. Users bring their own CV content.

2. **ATS scoring or keyword optimization** — Jobscan already does this well. JobFunnel's value is in *outcome measurement*, not content optimization. We may integrate with ATS scoring tools later.

3. **Automated CV distribution** — We do not send CVs on behalf of users. Users manually select which version to use per application; we track the choice and the outcome.

4. **Statistical significance testing** — Phase 3 will add p-values, confidence intervals, and minimum sample size indicators. Phase 2 provides directional data (conversion rates by version) without claiming statistical rigor.

5. **Multi-language CV variants** — Phase 3 includes multi-language support and auto-translation. Phase 2 treats language variants as just another CV version the user creates manually.

6. **CV file storage/hosting** — We store metadata and version labels, not the actual PDF/DOCX files. Users can optionally upload a file or link to cloud storage, but the system of record is the version tag on each application.

---

## 4. User Stories

### Job Seeker (Pro Tier)

**CV Version Management**

- As a job seeker, I want to create and name multiple CV versions so that I can tailor my approach for different job types, industries, or regions.
- As a job seeker, I want to add a description and tags to each CV version so that I can remember the strategy behind each variant (e.g., "quantified impact for fintech" vs. "narrative for startups").
- As a job seeker, I want to set one version as my current default so that new applications are pre-tagged with my active CV version.
- As a job seeker, I want to archive old versions without deleting them so that I retain historical data for completed experiments.
- As a job seeker, I want to optionally attach a file (PDF/DOCX) or external link to each version so that I can reference the actual document alongside the analytics.

**Tagging Applications with CV Versions**

- As a job seeker, I want to select which CV version I used when creating or editing a job application so that the system can track outcomes per version.
- As a job seeker, I want the application form to default to my current active CV version so that tagging is low-friction for my primary variant.
- As a job seeker, I want to change the CV version on an existing application (before it moves past "Applied") so that I can correct mistakes.
- As a job seeker, I want to bulk-tag existing untagged applications with a CV version so that I can retroactively set up tracking for applications created before this feature existed.

**A/B Test Dashboard**

- As a job seeker, I want to see a comparison dashboard showing conversion rates per CV version so that I can identify which version performs best at each funnel stage.
- As a job seeker, I want to see the number of applications, screening rate, and interview rate broken down by CV version so that I have enough data context to make decisions.
- As a job seeker, I want to filter the comparison by date range, job type, or target country so that I can compare versions within a controlled context (e.g., "How does Version A perform for PM roles in Germany?").
- As a job seeker, I want to see a visual side-by-side bar chart comparing two or more CV versions so that differences are immediately obvious.
- As a job seeker, I want the dashboard to warn me when sample sizes are too small to draw conclusions so that I don't over-index on noisy data.

**Edge Cases**

- As a job seeker, I want applications without a CV version tag to appear as "Untagged" in analytics so that they don't silently skew my data.
- As a job seeker, I want to see a prompt encouraging me to tag a CV version whenever I create a new application so that I build the habit without being blocked.
- As a job seeker on the Free tier, I want to see a preview of the A/B testing feature (locked) so that I understand the value and am motivated to upgrade.

---

## 5. Requirements

### Must-Have (P0)

**5.1 CV Version CRUD**

Users can create, read, update, and delete CV versions. Each version has a name, optional description, optional tags (e.g., "startup", "corporate", "DACH"), and an `is_default` flag.

*Acceptance Criteria:*
- [ ] User can create a new CV version with a name (required, max 100 chars) and optional description
- [ ] User can add freeform tags to a CV version for categorization
- [ ] User can mark one version as the default; setting a new default un-defaults the previous one
- [ ] User can edit version name, description, and tags
- [ ] User can delete a version only if it has zero linked applications (otherwise: archive)
- [ ] User can archive/un-archive versions
- [ ] Archived versions are hidden from the active version picker but visible in analytics and in the version management page
- [ ] Free tier users can create up to 2 CV versions (soft limit with upgrade prompt); Pro users get unlimited

**5.2 CV Version Linking on Applications**

Each job application can be tagged with the CV version that was used. This field is nullable (for backward compatibility with MVP applications).

*Acceptance Criteria:*
- [ ] The "Add Application" form and the ApplicationModal include a CV version selector (dropdown)
- [ ] The selector defaults to the user's current default CV version
- [ ] The selector shows only active (non-archived) versions, plus the currently selected version if it happens to be archived
- [ ] CV version can be changed on an application that is in `saved` or `applied` stage; locked after the application moves to `screening` or beyond (to preserve data integrity)
- [ ] When version is locked (application in `screening` or later), the CVVersionPicker displays in read-only mode with a tooltip: "CV version cannot be changed after the application reaches screening stage"
- [ ] API returns 422 with a clear error message if a client attempts to change the version on a locked application
- [ ] Applications created before this feature have `cv_version_id = null` and appear as "Untagged" in analytics
- [ ] A non-blocking nudge (tooltip or inline hint) appears if a user tries to save an application without selecting a CV version
- [ ] If the user has no CV versions yet, the picker shows an inline "Create new version" button
- [ ] If the user's default version is archived, the picker defaults to the most recently created active version

**5.3 A/B Comparison Dashboard**

A new analytics view that shows funnel conversion rates segmented by CV version.

*Acceptance Criteria:*
- [ ] Dashboard accessible from `/app/analytics/cv-testing` (new tab/section within the existing analytics page)
- [ ] Shows a comparison table: each row is a CV version, columns are: Applications count, Applied → Screening rate, Screening → Interviewing rate, Overall conversion (Applied → Offer), Avg days in "Applied" stage
- [ ] Shows a grouped bar chart comparing the top-of-funnel rates (Applied → Screening) across all active versions
- [ ] Supports filtering by date range (reuses existing `DateRangePicker` component)
- [ ] Shows a "Low confidence" badge on any version with fewer than 10 applications in the filtered period
- [ ] "Untagged" applications are shown as a separate row so users can see what data is unattributed
- [ ] By default, only active (non-archived) CV versions appear in the comparison table; a "Show archived versions" toggle includes historical versions
- [ ] Empty state shows explanatory text ("Compare your CV versions to find what works best"), a CTA to create the first version, and for Free tier a locked preview with upgrade prompt
- [ ] Pro-only: Free tier users see a blurred/locked preview with an upgrade CTA

**5.4 CV Version Indicator on Pipeline**

The Kanban board should visually indicate which CV version was used per application.

*Acceptance Criteria:*
- [ ] ApplicationCard on the Kanban board shows a small badge or label with the CV version name (truncated to ~15 chars)
- [ ] Users can filter the pipeline by CV version via a multi-select dropdown added to the existing FilterBar; filter options include all active versions plus "Untagged"
- [ ] CV version filter composes with existing filters (priority, date, search) using AND logic
- [ ] Version badge uses a muted style to avoid visual clutter on the board

### Nice-to-Have (P1)

**5.5 Bulk Tagging**

Allow users to select multiple existing applications and assign a CV version in bulk.

*Acceptance Criteria:*
- [ ] Multi-select mode on the pipeline (checkboxes on cards) or a list view
- [ ] Bulk action dropdown includes "Set CV Version"
- [ ] Only applications in `saved` or `applied` stage can be bulk-tagged
- [ ] Confirmation dialog shows how many applications will be updated

**5.6 CV Version File Attachment**

Users can optionally upload a PDF/DOCX or paste an external link (Google Drive, Dropbox) for each CV version.

*Acceptance Criteria:*
- [ ] File upload field on the CV version create/edit form (max 5MB, PDF/DOCX only)
- [ ] Files stored in Supabase Storage under `cv-files/{user_id}/{version_id}/`
- [ ] External link field as an alternative to file upload
- [ ] Download/preview link accessible from the version detail and from the ApplicationModal
- [ ] RLS policy ensures only the owning user can access their files

**5.7 CV Version Notes & Changelog**

Users can add notes to a CV version to track what they changed and why.

*Acceptance Criteria:*
- [ ] Rich text notes field on the CV version detail view
- [ ] `updated_at` timestamp visible so users know when they last edited a version
- [ ] Notes are searchable from the version list

### Future Considerations (P2)

**5.8 Statistical Significance Indicators** — Phase 3 will add p-values and confidence intervals so users know when a result is likely r    eal vs. noise. The Phase 2 data model must support this by storing per-version, per-stage counts and conversion rates in a way that's queryable for statistical calculations.

**5.9 AI-Powered CV Recommendations** — Future feature that analyzes funnel data and suggests what to change in the underperforming CV version. Requires the file attachment (P1) to be in place so the AI has content to analyze.

**5.10 Automated Version Rotation** — Automatically alternate CV versions across applications to create a more controlled experiment. Deferred because it adds complexity and most users prefer manual control during job search.

**5.11 Interview Story ↔ CV Version Linking** — Connect which interview stories were used alongside which CV version to build a complete picture of "what content combination works best." Depends on interview outcome logging (also Phase 2).

---

## 6. Data Model

All new models follow the existing conventions: UUID primary keys, timestamps auto-managed by Supabase, RLS enabled.

### 6.1 `cv_versions` (New Table)

| Field | Type | Description |
|---|---|---|
| `id` | UUID (PK) | Primary key |
| `user_id` | UUID (FK) | Reference to `profiles` |
| `name` | String | Version name (required, max 100 chars) |
| `description` | Text? | Strategy notes, what's different about this version |
| `tags` | String[] | Freeform tags for categorization |
| `is_default` | Boolean | Whether this is the user's current default version |
| `is_archived` | Boolean | Soft delete / hide from active selectors |
| `file_url` | String? | Supabase Storage path or external link (P1) |
| `file_type` | Enum? | `pdf` \| `docx` \| `external_link` (P1) |
| `created_at` | Timestamp | Record creation |
| `updated_at` | Timestamp | Last update |

**RLS Policy:** `user_id = auth.uid()`

**Indexes:**
- `cv_versions_user_id_idx` on `(user_id)`
- `cv_versions_user_default_idx` on `(user_id, is_default)` where `is_default = true` (partial unique index to enforce one default per user)

### 6.2 `job_applications` (Existing Table — Add Column)

| Field | Type | Description |
|---|---|---|
| `cv_version_id` | UUID? (FK) | Reference to `cv_versions`. Nullable for backward compatibility. |

**Migration:** `ALTER TABLE job_applications ADD COLUMN cv_version_id UUID REFERENCES cv_versions(id) ON DELETE SET NULL;`

**Index:** `job_applications_cv_version_idx` on `(cv_version_id)`

### 6.3 Analytics Query (Materialized View or API Computation)

The A/B dashboard computes conversion rates per CV version. For MVP of this feature, compute in the API route using a SQL query that joins `job_applications` with `cv_versions` and groups by `cv_version_id`. If performance becomes an issue at scale, introduce a materialized view refreshed on stage transitions.

```sql
-- Core analytics query (includes untagged applications)
WITH version_stats AS (
  SELECT
    ja.cv_version_id AS version_id,
    COALESCE(cv.name, 'Untagged') AS version_name,
    COUNT(*) FILTER (WHERE ja.stage IN ('applied','screening','interviewing','offer','rejected','withdrawn')) AS total_applied,
    COUNT(*) FILTER (WHERE ja.stage IN ('screening','interviewing','offer')) AS reached_screening,
    COUNT(*) FILTER (WHERE ja.stage IN ('interviewing','offer')) AS reached_interviewing,
    COUNT(*) FILTER (WHERE ja.stage = 'offer') AS reached_offer,
    ROUND(AVG(
      EXTRACT(EPOCH FROM (ja.stage_updated_at - ja.applied_at)) / 86400
    ) FILTER (WHERE ja.applied_at IS NOT NULL AND ja.stage != 'applied'), 1) AS avg_days_in_applied
  FROM job_applications ja
  LEFT JOIN cv_versions cv ON ja.cv_version_id = cv.id
  WHERE ja.user_id = :user_id
    AND ja.stage != 'saved'
  GROUP BY ja.cv_version_id, cv.name
)
SELECT
  version_id,
  version_name,
  total_applied,
  reached_screening,
  reached_interviewing,
  reached_offer,
  avg_days_in_applied,
  ROUND(reached_screening::numeric / NULLIF(total_applied, 0) * 100, 1) AS screening_rate,
  ROUND(reached_interviewing::numeric / NULLIF(reached_screening, 0) * 100, 1) AS interview_rate,
  ROUND(reached_offer::numeric / NULLIF(total_applied, 0) * 100, 1) AS overall_conversion
FROM version_stats
ORDER BY total_applied DESC;
```

> **Note:** This query uses a LEFT JOIN from `job_applications` to `cv_versions` (not the reverse) so that applications with `cv_version_id = NULL` are included as "Untagged" in the result set.

---

## 7. API Design

Following the existing pattern: Next.js API routes with Supabase client, all endpoints authenticated.

### 7.1 CV Version Endpoints

| Method | Endpoint | Description |
|---|---|---|
| GET | `/api/cv-versions` | List all CV versions for the current user (includes archived if `?include_archived=true`) |
| POST | `/api/cv-versions` | Create a new CV version |
| GET | `/api/cv-versions/:id` | Get version details |
| PATCH | `/api/cv-versions/:id` | Update version (name, description, tags, is_default, is_archived) |
| DELETE | `/api/cv-versions/:id` | Delete version (only if no linked applications) |

### 7.2 Application Update (Existing Endpoint — Extend)

| Method | Endpoint | Change |
|---|---|---|
| PATCH | `/api/jobs/:id` | Accept `cv_version_id` in the request body. Validate: version belongs to user, application is in `saved` or `applied` stage. |
| POST | `/api/jobs` | Accept optional `cv_version_id`. Default to user's default version if not provided. |

### 7.3 Analytics Endpoint (New)

| Method | Endpoint | Description |
|---|---|---|
| GET | `/api/analytics/cv-comparison` | Returns per-version conversion metrics. Supports `?from=DATE&to=DATE` filters. |

### 7.4 Bulk Tagging (P1)

| Method | Endpoint | Description |
|---|---|---|
| PATCH | `/api/jobs/bulk-cv-version` | Accept `{ job_ids: string[], cv_version_id: string }`. Validates stage constraints. |

---

## 8. UI Components

### 8.1 New Pages & Sections

| Route | Description |
|---|---|
| `/app/cv-versions` | CV version management page (list, create, edit, archive) |
| `/app/cv-versions/[id]` | Version detail view with stats summary and linked applications |
| `/app/analytics` → new tab | "CV Testing" tab within existing analytics dashboard |

### 8.2 New Components

**CVVersionList** — Grid/list view of all CV versions with name, tags, application count, and screening rate summary. Active/archived toggle.

**CVVersionCard** — Card showing version name, description excerpt, tags, stats (total apps, screening rate), default badge, and actions (edit, archive, delete).

**CVVersionForm** — Dialog/sheet for creating and editing a version. Fields: name, description, tags (multi-input), file upload (P1).

**CVVersionPicker** — Dropdown/combobox used in the ApplicationModal and QuickAddForm. Shows active versions, highlights the default, allows quick creation of a new version inline.

**CVComparisonTable** — Table component for the A/B dashboard. Rows = versions, columns = metrics. Sortable by any column. Highlights the best-performing version in green.

**CVComparisonChart** — Grouped bar chart (using Recharts) comparing screening rates across versions. Color-coded per version.

**LowConfidenceBadge** — Small warning badge ("< 10 apps") shown next to versions with insufficient data.

### 8.3 Modified Components

**ApplicationModal** — Add CVVersionPicker to the form, between the job details section and the notes field.

**QuickAddForm** — Add a compact CVVersionPicker (defaults to user's default version).

**ApplicationCard** — Add a small version badge (pill) showing the CV version name.

**FilterBar** — Add a CV version filter dropdown (multi-select) to the existing filter bar on the pipeline page.

**Sidebar Navigation** — Add "CV Versions" as a new nav item (below "Story Library", above "Settings").

---

## 9. Success Metrics

### Leading Indicators (Days to Weeks)

| Metric | Target | Measurement |
|---|---|---|
| **Adoption rate** | 60% of Pro users create ≥2 CV versions within 14 days of feature launch | Count of Pro users with ≥2 versions / total Pro users |
| **Tagging rate** | 80% of new applications (by Pro users) have a CV version tag within 30 days | Tagged apps / total new apps (Pro users, post-launch) |
| **Dashboard visits** | 40% of Pro users visit the CV Testing analytics tab at least once per week | Weekly unique visitors to `/app/analytics/cv-testing` |
| **Version iteration** | 30% of users who create 2+ versions create a 3rd within 30 days | Signal that users are iterating based on data |

### Lagging Indicators (Weeks to Months)

| Metric | Target | Measurement |
|---|---|---|
| **Pro conversion lift** | 15% increase in free → Pro conversion rate (attributed to CV testing as a motivating feature) | Conversion rate comparison, pre/post launch + survey data |
| **Retention improvement** | 10% improvement in 30-day Pro retention | Cohort retention curves, pre/post launch |
| **Reported funnel improvement** | 25% of active CV testers report improved screening rates | In-app survey after 30 days of use |
| **NPS impact** | Maintain NPS > 40; CV testing appears in top-3 valued features | NPS survey with feature attribution |

### When to Evaluate

- **1 week post-launch:** Adoption and tagging rates, error rates, UI friction (session recordings)
- **4 weeks post-launch:** Dashboard engagement, version iteration, Pro conversion lift
- **12 weeks post-launch:** Retention impact, NPS, reported funnel improvement

---

## 10. Open Questions

| # | Question | Owner | Blocking? |
|---|---|---|---|
| 1 | Should we auto-tag the CV version when a user saves a job via the Chrome extension (Phase 2 scope overlap)? | Product + Engineering | No — Chrome extension is a separate Phase 2 workstream; can integrate later |
| 2 | Should the "Low confidence" threshold be 10 applications or a different number? What does the data science community recommend for directional A/B results? | Data / Product | No — start with 10, make it configurable |
| 3 | Do we need to support CV versions scoped per job type (e.g., "PM versions" vs "SWE versions") or is the tagging system sufficient? | Product + Design | No — tags cover this; reassess after user feedback |
| 4 | Should archived versions' historical analytics still count toward the A/B dashboard by default, or be excluded unless explicitly included? | Product | No — default to including archived data with a toggle to exclude |
| 5 | What is the right free tier limit for CV versions — 1 or 2? **Recommendation: 2** (allows users to experience the A/B concept and see directional data, creating a natural upgrade moment when they want to test a 3rd variant or access the full dashboard). | Product + Growth | Yes — needs decision before launch to configure the paywall |
| 6 | Should we store the full CV file in Supabase Storage or only support external links (Google Drive, Dropbox)? Implications for storage costs and GDPR data subject requests. | Engineering + Legal | No — P1 feature; can ship P0 without file storage |
| 7 | How do we handle the analytics for applications that change CV version after creation? **Recommendation: Lock to version at time of application.** The version is editable only in `saved`/`applied` stages (before outcome data exists). Once the application reaches `screening`, the version is frozen. This avoids the need for version-change tracking in `stage_history` and keeps the analytics model simple. If a user changes the version while still in `applied`, the new version is what gets credited. | Engineering + Product | Yes — resolved with recommendation above; needs eng sign-off |

---

## 11. Timeline Considerations

### Dependencies

- **Phase 1 MVP must be stable**: Pipeline (Kanban), Analytics dashboard, and Application CRUD must be working and deployed before Phase 2 development begins.
- **Supabase migration**: Adding `cv_version_id` to `job_applications` requires a database migration. Must be backward-compatible (nullable column, no breaking changes to existing queries).
- **No external dependencies**: This feature is entirely within JobFunnel's control. No third-party API integrations required.

### Suggested Phasing

| Sprint | Duration | Scope |
|---|---|---|
| **Sprint 1: Data & CRUD** | Week 1–2 | Database migration, `cv_versions` table, RLS policies, API endpoints for CRUD, CVVersionList and CVVersionForm UI |
| **Sprint 2: Application Integration** | Week 2–3 | CVVersionPicker in ApplicationModal and QuickAddForm, version badge on ApplicationCard, FilterBar integration, version locking logic |
| **Sprint 3: Analytics & Dashboard** | Week 3–4 | CV comparison API endpoint, CVComparisonTable, CVComparisonChart, LowConfidenceBadge, DateRangePicker integration, empty states |
| **Sprint 4: Polish & Launch** | Week 4–5 | Free tier limits and upgrade prompts, bulk tagging (P1), file attachment (P1 if time permits), E2E tests, performance optimization, beta rollout |

### Hard Deadlines

None currently. However, this feature should ship before the Soft Launch phase (Weeks 9–16 per the business canvas) to support the positioning of JobFunnel as a data-driven job search tool and to drive Pro tier conversions during the early growth period.

---

## 12. Technical Considerations

### Backward Compatibility

The `cv_version_id` column on `job_applications` is nullable. All existing MVP queries continue to work without modification. The analytics dashboard handles `null` version IDs by grouping them as "Untagged."

### Performance

The CV comparison analytics query joins two tables and groups by version. For users with < 500 applications (covers 99%+ of users), this executes in < 50ms on PostgreSQL. If performance degrades, introduce a materialized view or a denormalized `cv_version_stats` table updated via Supabase database triggers on stage transitions.

### GDPR Compliance

CV files (P1) contain personal data. Ensure:
- Files are stored in EU-region Supabase Storage buckets
- Data subject deletion requests cascade to CV version files
- CV version metadata (name, description, tags) is included in data export requests
- RLS ensures no cross-user data access

### Free Tier Enforcement

CV versioning is a Pro feature with a limited free tier preview:
- Free: create up to 2 CV versions, no A/B dashboard access (see blurred preview)
- Pro: unlimited versions, full dashboard access
- Enforcement: API-level check on `subscription_tier` from `profiles` table before allowing version creation beyond the limit

---

*This PRD is ready for engineering review. After alignment, the next step is to create tickets in the project tracker for each sprint and begin implementation alongside the other Phase 2 workstreams (Chrome extension, interview outcome logging, cohort comparison).*
