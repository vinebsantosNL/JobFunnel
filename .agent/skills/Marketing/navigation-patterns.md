# Navigation Patterns — JobFunnel OS

Detailed navigation patterns for the JobFunnel marketing site and app. Two completely separate nav systems — never mix them.

---

## The Two Nav Zones (Never Mix)

| Zone | Routes | Nav type | Who sees it |
|---|---|---|---|
| Marketing | `/`, `/features/*`, `/pricing`, `/blog/*`, `/compare/*`, `/resources/*`, `/about`, `/login`, `/signup` | Header + Footer | Everyone |
| App | `/app/*` | Sidebar (desktop) + Bottom tab (mobile) | Authenticated users only |

App routes must **never** appear in the marketing header. Marketing links can appear in the app (e.g., "Upgrade to Pro" linking to `/pricing`) but not in primary nav.

---

## Marketing Site Header

### Desktop Header

```
[JobFunnel logo]   Features ▾   Pricing   Blog   Compare   Resources   [Login]   [Get Started Free]
├── Logo: links to /                                                                ↑
├── Features: dropdown (see below)                                          Primary CTA
├── Pricing: /pricing — direct link (no dropdown)                           filled blue button
├── Blog: /blog — direct link                                               #2563EB
├── Compare: /compare — direct link (or dropdown listing all 4 compare pages)
├── Resources: /resources (or dropdown to Guides, Templates)
├── Login: text link → /login
└── Get Started Free: filled button → /signup
```

**Rules:**
- Logo links to `/` always
- 5 items max in primary nav (not counting Login / CTA)
- "Get Started Free" is the rightmost element, always visible without scrolling
- "Login" is a text link — not a button — positioned left of CTA
- Active page gets underline indicator (not just bold)
- Sticky header — stays fixed on scroll with subtle shadow

### Features Dropdown

```
┌──────────────────────────────────────────────────────────────┐
│                                                              │
│  📊 Funnel Analytics                                        │
│     Track your Applied→Screening→Offer conversion rates     │
│                                                              │
│  📖 Interview Content OS                                    │
│     Build a versioned STAR story bank, tagged by competency  │
│                                                              │
│  🧪 CV Experimentation  ● Pro                               │
│     A/B test which CV version gets more callbacks            │
│                                                              │
│  ──────────────────────────────────────────────────────      │
│  [See all features →]                                        │
│                                                              │
└──────────────────────────────────────────────────────────────┘
```

**Rules:**
- Each item has an icon, a bolded name, and a one-line description
- CV Experimentation shows a `● Pro` badge (purple `#8B5CF6`) — teased, not hidden
- "See all features →" links to `/features` hub
- Opens on hover (desktop) / tap (mobile)
- Never nest a dropdown inside this dropdown

### Mobile Header (< 640px)

```
[JobFunnel logo]                              [Get Started]  [☰]
```

- Hamburger (☰) opens a full-screen slide-over panel
- "Get Started" stays visible without opening the menu — always accessible
- Inside the hamburger panel:

```
┌─────────────────────────┐
│  [× Close]              │
│                         │
│  Features               │
│    Funnel Analytics     │
│    Interview OS         │
│    CV Experimentation   │
│  Pricing                │
│  Blog                   │
│  Compare                │
│  Resources              │
│  ─────────────────────  │
│  Login                  │
│  [Get Started Free]     │
└─────────────────────────┘
```

Rules:
- Accordion pattern for "Features" nested items
- CTA button at bottom — always visible after scrolling in the menu
- Close button top-right

---

## App Navigation (Authenticated)

### Desktop Sidebar

```
┌──────────────────────┐
│  [JobFunnel logo]    │
│                      │
│  ⊞  Dashboard        │
│  ■  Pipeline    ←←←  │  ← Active: highlighted with #2563EB background
│  📊 Analytics        │
│  📖 Stories          │
│  📄 CV Versions  [2] │  ← Phase 2 badge / Pro indicator
│                      │
│  ─────────────────── │
│  ⚙  Settings         │
│  🔒 [Upgrade Pro]    │  ← Shown only for free-tier users
└──────────────────────┘
```

Rules:
- Sidebar width: 240px on desktop, collapsible to 64px (icon-only mode)
- Active item: blue background `#2563EB`, white text
- Pro upgrade nudge at bottom for free users — not intrusive, persistent
- CV Versions shows `[Phase 2]` badge or is greyed out until launched

### Mobile Bottom Tab Bar

```
┌────────────────────────────────────────┐
│           [Page Content]               │
├────────────────────────────────────────┤
│  Pipeline   Analytics  Stories  Profile│
│    ■           📊        📖      👤    │
│  (active)                              │
└────────────────────────────────────────┘
```

Rules:
- 4 items max (Pipeline, Analytics, Stories, Profile)
- Active tab highlighted with `#2563EB` icon + label color
- Icons + labels always — no icon-only tabs
- Settings accessible from Profile tab → settings page
- FAB (floating action button) for "Add application" sits above the tab bar on Pipeline screen

---

## Footer Navigation

### Full Footer (Desktop)

```
┌──────────────────────────────────────────────────────────────────────┐
│                                                                      │
│  Product              Resources           Compare          Legal     │
│  ─────────────        ──────────          ─────────        ─────     │
│  Funnel Analytics     Blog                vs Teal          Privacy   │
│  Interview OS         EU Job Search Guide vs Jobscan       Terms     │
│  CV Experimentation   STAR Method Guide   vs Eztrackr      GDPR      │
│  Pricing              CV Templates        vs Careerflow    Contact   │
│  Changelog                                                           │
│                       Company                                        │
│                       About                                          │
│                                                                      │
│  ──────────────────────────────────────────────────────────────────  │
│  [JobFunnel logo]   Built for EU tech job seekers                    │
│  © 2026 JobFunnel   ·   [LinkedIn]  [Twitter/X]                     │
└──────────────────────────────────────────────────────────────────────┘
```

**Strategic notes:**
- **Compare column** in footer is an SEO play — footer links pass PageRank to competitor pages, which are high-intent SEO targets
- **GDPR link** is legally required for EU product — never remove
- **Changelog** shows product is alive and actively maintained — trust signal

### Minimal Footer (Landing Pages / Login / Signup)

```
┌──────────────────────────────────────────────────────────────────────┐
│  [JobFunnel logo]   © 2026 JobFunnel  ·  Privacy  ·  Terms  ·  GDPR │
└──────────────────────────────────────────────────────────────────────┘
```

Used on: `/login`, `/signup`, `/app/*` pages where full footer is not appropriate.

---

## Breadcrumbs

### When to Use

Use breadcrumbs on:
- Feature pages: `Home > Features > Funnel Analytics`
- Blog posts: `Home > Blog > EU Tech Market > [Post title]`
- Compare pages: `Home > Compare > JobFunnel vs Teal`
- Resource guides: `Home > Resources > Guides > EU Job Search Guide`

Do NOT use breadcrumbs on:
- Homepage
- Pricing (flat, no parent section)
- Login / Signup
- App pages (`/app/*`)

### Format

```
Home > Features > Funnel Analytics
Home > Blog > EU Tech Market > How to Track Your Application Conversion Rate
Home > Compare > JobFunnel vs Teal
Home > Resources > Guides > EU Job Search Guide
```

Rules:
- Separator: `>` (not `/`)
- Every segment is a link except the current page (plain text)
- Match breadcrumb exactly to URL hierarchy
- Implement with JSON-LD schema for SEO

### JSON-LD Schema (Standard Implementation)

```json
{
  "@context": "https://schema.org",
  "@type": "BreadcrumbList",
  "itemListElement": [
    {
      "@type": "ListItem",
      "position": 1,
      "name": "Home",
      "item": "https://jobfunnel.app/"
    },
    {
      "@type": "ListItem",
      "position": 2,
      "name": "Features",
      "item": "https://jobfunnel.app/features"
    },
    {
      "@type": "ListItem",
      "position": 3,
      "name": "Funnel Analytics"
    }
  ]
}
```

Add this `<script type="application/ld+json">` block to the `<head>` of every page that has breadcrumbs.

---

## Anti-Patterns to Avoid

| Problem | What goes wrong | Fix |
|---|---|---|
| App routes in marketing nav | `/app/pipeline` in header | Marketing nav links to `/signup` only; never `/app/*` |
| Feature names as jargon | "Interview Content OS" without explanation | Always add a one-liner description in the dropdown |
| Too many header items | 8+ nav items | Max 5 primary items + Login + CTA |
| Icon-only mobile tabs | Users don't know what tabs mean | Always icon + label on bottom tab bar |
| No GDPR link in footer | EU legal requirement | GDPR link in footer on every marketing page |
| "Get Started" hidden on mobile | Users can't find the CTA | Keep CTA in mobile header even when hamburger is closed |
| Compare pages not in footer | SEO equity not flowing | Always list all 4 compare pages in footer |
| Breadcrumb-URL mismatch | "Compare > Teal" but URL is `/compare?competitor=teal` | Use clean URLs: `/compare/teal` |

---

## Navigation SEO Rules

Internal links in navigation pass PageRank. Apply this strategically:

- **Header nav links are highest authority** — only put the most important marketing pages here
- **Footer links are moderate authority** — use deliberately for compare pages, guides, and legal pages
- **Breadcrumbs** are free internal links on every page — always implement with schema markup
- **Don't use JavaScript-only nav** — Next.js `<Link>` components render as crawlable `<a>` tags ✅
- **Descriptive anchor text** — "Funnel Analytics" not "Features" as the link text
- **Compare pages in footer** — even with moderate link equity, these compound over time for high-intent SEO

---

## Related Files

- [site-architecture.md](site-architecture.md) — Full site hierarchy, URL map, internal linking strategy
- [mermaid-templates.md](mermaid-templates.md) — Visual sitemap diagram templates
- [site-type-templates.md](site-type-templates.md) — Full page hierarchy templates per site type
