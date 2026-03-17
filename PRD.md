JobFunnel OS
Product Requirements Document – MVP (Phase 1)
Version 1.0 | March 2026 | Prepared for Claude Code Development
Field
Value
Product
JobFunnel OS – Logged Area MVP
Timeline
6–8 weeks to beta launch
Target Users
Mid-to-senior tech professionals in Europe
Development Tool
Claude Code via Antigravity


1. Executive Summary
JobFunnel OS is a B2C SaaS platform that helps tech professionals manage their job search like a product funnel. This PRD covers the MVP logged-in area, focusing on core pipeline management, basic analytics, and interview content organization.
1.1 MVP Scope
Multi-stage Kanban pipeline for application tracking
Basic funnel analytics (applications, conversions, time-in-stage)
Interview story library with CRUD and tagging
User authentication and profile management
Email notifications and reminders
1.2 Out of Scope for MVP
Chrome extension (Phase 2)
CV versioning and A/B testing (Phase 2)
Peer benchmarking (Phase 2)
EU job board integrations (Phase 3)
AI-powered insights (Future)

2. Recommended Tech Stack
The following stack optimizes for rapid MVP development, type safety, and future scalability. Selected for compatibility with Claude Code and modern best practices.
2.1 Frontend
Technology
Version
Purpose
Next.js
14.x (App Router)
React framework with SSR, routing, API routes
TypeScript
5.x
Type safety and better DX
Tailwind CSS
3.x
Utility-first styling
shadcn/ui
Latest
Accessible, customizable component library
TanStack Query
5.x
Server state management, caching
Zustand
4.x
Lightweight client state management
React DnD Kit
Latest
Kanban drag-and-drop functionality
Recharts
2.x
Analytics charts and visualizations

2.2 Backend & Infrastructure
Technology
Version
Purpose
Supabase
Latest
PostgreSQL, Auth, Realtime, Storage
PostgreSQL
15.x
Primary database (via Supabase)
Vercel
—
Deployment, edge functions, CDN
Resend
Latest
Transactional email delivery
Zod
3.x
Schema validation (frontend + API)

2.3 Development Tools
Tool
Purpose
ESLint + Prettier
Code quality and formatting
Husky + lint-staged
Pre-commit hooks
Vitest
Unit and integration testing
Playwright
E2E testing

2.4 Why This Stack?
Supabase provides auth, database, and realtime out-of-the-box – perfect for MVP speed
Next.js App Router enables server components and streaming for performance
shadcn/ui components are copy-paste, fully customizable, and accessible
TypeScript + Zod ensures end-to-end type safety
Stack is well-documented and Claude Code-friendly

3. Information Architecture
3.1 Route Structure
All authenticated routes live under /app, public routes at root level.
Route
Description
/ (public)
Landing page with value prop
/login
Authentication (email magic link + OAuth)
/signup
Registration flow
/app/dashboard
Main dashboard with pipeline overview
/app/pipeline
Full Kanban board view
/app/pipeline/[id]
Job application detail modal/page
/app/analytics
Funnel analytics dashboard
/app/stories
Interview story library
/app/stories/[id]
Story detail/edit view
/app/settings
User settings and preferences
/app/settings/profile
Profile management
/app/settings/notifications
Notification preferences

3.2 Navigation Structure
Left sidebar navigation with the following primary items:
Dashboard (overview metrics, recent activity)
Pipeline (main Kanban board)
Analytics (funnel metrics)
Story Library (interview content)
Settings (collapsed submenu)

4. Data Models
All models use UUID primary keys. Timestamps are auto-managed by Supabase.
4.1 User Profile
Field
Type
Description
id
UUID (PK)
Primary key, linked to Supabase Auth
email
String
User email (from auth)
full_name
String
Display name
role
Enum
software_engineer | product_manager | data_scientist | other
years_experience
Integer
Years in current role
location_country
String
ISO country code
target_countries
String[]
Countries user is targeting
subscription_tier
Enum
free | pro
notification_prefs
JSONB
Email notification settings
created_at
Timestamp
Account creation date
updated_at
Timestamp
Last profile update

4.2 Job Application
Field
Type
Description
id
UUID (PK)
Primary key
user_id
UUID (FK)
Reference to profiles
company_name
String
Company name
job_title
String
Position title
job_url
String?
Link to job posting
location
String?
Job location
salary_min
Integer?
Salary range min
salary_max
Integer?
Salary range max
salary_currency
String?
ISO currency code
stage
Enum
saved | applied | screening | interviewing | offer | rejected | withdrawn
priority
Enum
low | medium | high
notes
Text?
Free-form notes
applied_at
Timestamp?
Date of application
stage_updated_at
Timestamp
Last stage change
created_at
Timestamp
Record creation
updated_at
Timestamp
Last update

4.3 Stage History
Tracks all stage transitions for analytics.
Field
Type
Description
id
UUID (PK)
Primary key
job_id
UUID (FK)
Reference to job_applications
from_stage
Enum?
Previous stage (null if new)
to_stage
Enum
New stage
transitioned_at
Timestamp
When transition occurred

4.4 Interview Story
Field
Type
Description
id
UUID (PK)
Primary key
user_id
UUID (FK)
Reference to profiles
title
String
Story title/summary
situation
Text?
STAR: Situation
task
Text?
STAR: Task
action
Text?
STAR: Action
result
Text?
STAR: Result
full_content
Text?
Alternative: full story text
competencies
String[]
Tagged competencies
is_favorite
Boolean
Starred for quick access
created_at
Timestamp
Record creation
updated_at
Timestamp
Last update

4.5 Competency Tags (Reference)
Predefined competencies for story tagging:
Category
Competencies
Leadership
Team Management, Decision Making, Mentoring, Conflict Resolution
Technical
Problem Solving, System Design, Technical Excellence, Innovation
Collaboration
Cross-functional Work, Stakeholder Management, Communication
Execution
Project Delivery, Prioritization, Working Under Pressure, Adaptability
Growth
Learning Agility, Feedback Reception, Self-improvement


5. Feature Specifications
5.1 Authentication
Using Supabase Auth with magic link (email) as primary and OAuth (Google, GitHub) as secondary options.
5.1.1 User Stories
As a new user, I can sign up with my email to create an account
As a returning user, I can log in via magic link without remembering a password
As a user, I can alternatively sign in with Google or GitHub OAuth
As a user, I can log out from my session
As a user, I can view and update my profile information
5.1.2 Acceptance Criteria
Email validation with clear error messages
Magic link expires after 1 hour
OAuth creates profile automatically on first login
Session persists across browser closes (14-day expiry)
Protected routes redirect to /login if unauthenticated
5.2 Pipeline (Kanban Board)
Core job application tracking feature with drag-and-drop stage management.
5.2.1 User Stories
As a user, I can view all my applications organized by stage in a Kanban board
As a user, I can add a new job application with company, title, and URL
As a user, I can drag an application card between stages
As a user, I can click a card to view/edit full details
As a user, I can mark applications as high/medium/low priority
As a user, I can archive or delete applications
As a user, I can filter applications by priority, date, or search term
5.2.2 Pipeline Stages
Stage
Description
Visual
Saved
Bookmarked, not yet applied
Gray/neutral
Applied
Application submitted
Blue
Screening
Initial recruiter/HR contact
Purple
Interviewing
Active interview process
Yellow/amber
Offer
Received offer
Green
Rejected
Application rejected
Red (muted)
Withdrawn
User withdrew application
Gray

5.2.3 UI Components
KanbanBoard – main container with horizontal scrolling columns
KanbanColumn – individual stage column with card count
ApplicationCard – draggable card showing company, title, days-in-stage
ApplicationModal – slide-over panel for full details and editing
QuickAddForm – inline form at bottom of each column
FilterBar – top bar with search, priority filter, date range
5.2.4 Acceptance Criteria
Drag and drop works smoothly (using @dnd-kit/core)
Stage transitions are logged to stage_history for analytics
Cards show visual priority indicator (colored dot or border)
Time-in-stage badge shows days since entering current stage
Free tier limited to 5 active applications (soft limit with upgrade prompt)
Optimistic UI updates with rollback on error
5.3 Analytics Dashboard
Basic funnel metrics to help users understand their job search performance.
5.3.1 User Stories
As a user, I can see my overall funnel conversion rates
As a user, I can see how many applications I've made over time
As a user, I can see average time spent in each stage
As a user, I can filter analytics by date range
5.3.2 Metrics to Display
Metric
Calculation
Total Applications
Count of jobs with stage >= applied
Applied → Screening Rate
Screening / Applied × 100%
Screening → Interview Rate
Interviewing / Screening × 100%
Interview → Offer Rate
Offer / Interviewing × 100%
Overall Conversion
Offer / Applied × 100%
Avg Days per Stage
Mean days from stage_history transitions
Applications This Week/Month
Count by applied_at date range
Active Applications
Count where stage not in (rejected, withdrawn, offer)

5.3.3 UI Components
FunnelChart – horizontal funnel visualization with stage counts and percentages
MetricCard – summary stat cards (total apps, conversion rate, etc.)
TimeSeriesChart – line chart of applications over time
StageTimeChart – bar chart showing avg days per stage
DateRangePicker – filter for all analytics views
5.4 Interview Story Library
Central repository for STAR-format interview stories, tagged by competency.
5.4.1 User Stories
As a user, I can create a new interview story using STAR format
As a user, I can tag stories with competencies for easy retrieval
As a user, I can search and filter stories by competency or keyword
As a user, I can favorite stories for quick access
As a user, I can edit and delete my stories
5.4.2 UI Components
StoryList – grid/list view of all stories with search/filter
StoryCard – preview card showing title, competencies, excerpt
StoryEditor – form with STAR fields or free-form editor
CompetencyPicker – multi-select with predefined tags + custom
StoryDetail – full view with all STAR sections
5.4.3 Acceptance Criteria
Stories can be created with either STAR structure or free-form content
Competency tags are searchable and filterable
Rich text editor for content (bold, lists, links)
Auto-save drafts every 30 seconds
Word count displayed for each section

6. API Design
Using Next.js API routes with Supabase client. All endpoints require authentication unless marked public.
6.1 Authentication Endpoints
Method
Endpoint
Description
POST
/api/auth/signup
Create account (email)
POST
/api/auth/login
Send magic link
POST
/api/auth/logout
End session
GET
/api/auth/callback
OAuth/magic link callback
GET
/api/auth/me
Current user info

6.2 Job Application Endpoints
Method
Endpoint
Description
GET
/api/jobs
List all jobs (with filters)
POST
/api/jobs
Create new job application
GET
/api/jobs/:id
Get job details
PATCH
/api/jobs/:id
Update job (partial)
DELETE
/api/jobs/:id
Delete job
POST
/api/jobs/:id/stage
Update stage (creates history)

6.3 Analytics Endpoints
Method
Endpoint
Description
GET
/api/analytics/funnel
Funnel conversion metrics
GET
/api/analytics/timeline
Applications over time
GET
/api/analytics/stage-time
Avg time per stage

6.4 Stories Endpoints
Method
Endpoint
Description
GET
/api/stories
List all stories
POST
/api/stories
Create new story
GET
/api/stories/:id
Get story details
PATCH
/api/stories/:id
Update story
DELETE
/api/stories/:id
Delete story


7. UI/UX Guidelines
7.1 Design System
Using shadcn/ui as base with customizations to match JobFunnel branding.
7.1.1 Color Palette
Color
Hex
Usage
Primary Blue
#2563EB
Primary actions, links, active states
Success Green
#10B981
Positive metrics, offer stage
Warning Amber
#F59E0B
Interviewing stage, attention
Error Red
#EF4444
Rejected, errors, destructive
Neutral Gray
#64748B
Muted text, borders
Background
#FAFAFA
Page background
Card
#FFFFFF
Card backgrounds

7.1.2 Typography
Font: Inter (Google Fonts) – clean, modern, highly legible
H1: 36px/40px, bold
H2: 24px/32px, semibold
H3: 18px/28px, semibold
Body: 14px/20px, regular
Small: 12px/16px, regular
7.1.3 Spacing System
Using Tailwind's default spacing scale (4px base unit): 1=4px, 2=8px, 4=16px, 6=24px, 8=32px
7.2 Component Library
Leverage these shadcn/ui components:
Button, Input, Textarea, Select, Checkbox, RadioGroup
Dialog (modals), Sheet (slide-overs), Popover, Tooltip
Card, Badge, Avatar
Table, Tabs, Accordion
Toast (notifications), AlertDialog (confirmations)
Form (with react-hook-form integration)
Calendar, DatePicker
7.3 Responsive Breakpoints
Breakpoint
Width
Behavior
Mobile
< 640px
Stacked layout, bottom nav, collapsed sidebar
Tablet
640–1024px
Collapsible sidebar, 2-column pipeline
Desktop
> 1024px
Full sidebar, full Kanban board


8. Email Notifications (MVP)
Minimal email notifications for MVP using Resend.
8.1 Notification Types
Notification
Trigger
Frequency
Welcome Email
New user signup
Once
Weekly Summary
Cron job (Sunday)
Weekly (opt-in)
Stale Application
14+ days in same stage
Weekly digest

8.2 Weekly Summary Contents
Applications added this week
Stage transitions
Current funnel snapshot
Applications that need attention (stale)

9. Project Structure
Recommended folder structure for Next.js App Router:
jobfunnel/├── app/│   ├── (auth)/│   │   ├── login/page.tsx│   │   ├── signup/page.tsx│   │   └── layout.tsx│   ├── (dashboard)/│   │   ├── dashboard/page.tsx│   │   ├── pipeline/page.tsx│   │   ├── analytics/page.tsx│   │   ├── stories/page.tsx│   │   ├── settings/page.tsx│   │   └── layout.tsx│   ├── api/│   │   ├── auth/[...supabase]/route.ts│   │   ├── jobs/route.ts│   │   ├── jobs/[id]/route.ts│   │   ├── analytics/route.ts│   │   └── stories/route.ts│   ├── layout.tsx│   └── page.tsx (landing)├── components/│   ├── ui/ (shadcn)│   ├── pipeline/│   ├── analytics/│   ├── stories/│   └── layout/├── lib/│   ├── supabase/│   ├── utils.ts│   └── validations/├── hooks/├── types/├── styles/└── public/

10. Success Criteria
10.1 MVP Launch Criteria
User can sign up, log in, and manage profile
User can create, view, edit, delete job applications
Kanban board works with drag-and-drop between stages
Basic analytics dashboard shows funnel metrics
Story library supports CRUD with competency tagging
Free tier limits enforced (5 active applications)
Responsive design works on mobile, tablet, desktop
All critical paths have E2E tests
10.2 Technical Quality Gates
TypeScript strict mode, no `any` types
Lighthouse score > 90 on all categories
Core Web Vitals pass
Zero critical security vulnerabilities
Row Level Security (RLS) enabled for all Supabase tables
10.3 Beta Validation Metrics
From original business case:
>70% of users complete pipeline setup (pipeline + at least 2 stories)
Users report tool helps with interview preparation
NPS > 40 from beta users
5–10% free-to-paid conversion

11. Development Phases
11.1 Sprint 1: Foundation (Week 1–2)
Project setup: Next.js, TypeScript, Tailwind, shadcn/ui
Supabase setup: database schema, RLS policies
Authentication: magic link + OAuth
Basic layout: sidebar, header, responsive shell
11.2 Sprint 2: Pipeline (Week 3–4)
Kanban board implementation with dnd-kit
Job application CRUD
Stage transitions with history logging
Filters and search
11.3 Sprint 3: Analytics & Stories (Week 5–6)
Analytics dashboard with Recharts
Funnel visualization
Story library CRUD
Competency tagging system
11.4 Sprint 4: Polish & Launch (Week 7–8)
Email notifications setup (Resend)
Free tier limits implementation
Error handling and edge cases
Performance optimization
Testing and bug fixes
Beta deployment

Appendix A: Environment Variables
# SupabaseNEXT_PUBLIC_SUPABASE_URL=your-project-urlNEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-keySUPABASE_SERVICE_ROLE_KEY=your-service-key# Email (Resend)RESEND_API_KEY=your-resend-key# AppNEXT_PUBLIC_APP_URL=http://localhost:3000
Appendix B: Database Migrations
Supabase migrations should be generated using Supabase CLI. Key tables in order:
profiles (extends Supabase auth.users)
job_applications
stage_history
interview_stories
Enable Row Level Security (RLS) on all tables with policies restricting access to authenticated user's own data.