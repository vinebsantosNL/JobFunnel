# Mermaid Diagram Templates — JobFunnel OS

Copy-paste-ready Mermaid diagrams for JobFunnel's marketing site structure. Uses the official JobFunnel color palette. Customize node labels and connections as the site evolves.

---

## JobFunnel Full Marketing Site Hierarchy

Complete sitemap with nav zones and JobFunnel brand colors.

```mermaid
graph TD
    subgraph "Header Nav"
        HOME["Homepage<br/>/"]
        FEAT["Features<br/>/features"]
        PRICE["Pricing<br/>/pricing"]
        BLOG["Blog<br/>/blog"]
        COMPARE["Compare<br/>/compare"]
        CTA["Get Started Free ★<br/>/signup"]
    end

    subgraph "Three Pillars — Feature Pages"
        F1["📊 Funnel Analytics<br/>/features/funnel-analytics"]
        F2["📖 Interview Content OS<br/>/features/interview-content-os"]
        F3["🧪 CV Experimentation [Pro]<br/>/features/cv-experimentation"]
    end

    subgraph "Compare Pages — SEO Priority"
        C1["vs Teal<br/>/compare/teal"]
        C2["vs Jobscan<br/>/compare/jobscan"]
        C3["vs Eztrackr<br/>/compare/eztrackr"]
        C4["vs Careerflow<br/>/compare/careerflow"]
    end

    subgraph "Content"
        B1["Blog Index<br/>/blog"]
        B2["EU Tech Market<br/>/blog/category/eu-tech-market"]
        B3["Interview Prep<br/>/blog/category/interview-prep"]
        B4["CV & Applications<br/>/blog/category/cv-applications"]
        B5["Job Search Strategy<br/>/blog/category/job-search-strategy"]
        G1["EU Job Search Guide<br/>/resources/guides/eu-job-search"]
        G2["STAR Method Guide<br/>/resources/guides/star-method"]
    end

    subgraph "Footer Only"
        ABOUT["About<br/>/about"]
        PRIVACY["Privacy<br/>/privacy"]
        TERMS["Terms<br/>/terms"]
        GDPR["GDPR ✓<br/>/gdpr"]
    end

    HOME --> FEAT
    HOME --> PRICE
    HOME --> BLOG
    HOME --> COMPARE
    FEAT --> F1
    FEAT --> F2
    FEAT --> F3
    COMPARE --> C1
    COMPARE --> C2
    COMPARE --> C3
    COMPARE --> C4
    BLOG --> B1
    B1 --> B2
    B1 --> B3
    B1 --> B4
    B1 --> B5
    HOME --> G1
    HOME --> G2
    HOME --> ABOUT

    style CTA fill:#2563EB,color:#fff
    style F1 fill:#2563EB,color:#fff
    style F2 fill:#2563EB,color:#fff
    style F3 fill:#8B5CF6,color:#fff
    style C1 fill:#10B981,color:#fff
    style C2 fill:#10B981,color:#fff
    style C3 fill:#10B981,color:#fff
    style C4 fill:#10B981,color:#fff
    style GDPR fill:#F59E0B,color:#fff
```

Color key for JobFunnel diagrams:
- **Blue** (`#2563EB`): Core pages, primary CTAs, Phase 1 features
- **Purple** (`#8B5CF6`): Pro-only features, Phase 2 pages
- **Green** (`#10B981`): Compare pages (high-intent SEO), conversion pages
- **Amber** (`#F59E0B`): Required pages (GDPR, legal), Phase 2 planned pages
- **Red** (`#EF4444`): Pages to remove or deprecate

---

## Marketing Site vs App — Two-Zone Diagram

Shows the clear separation between public marketing and authenticated app.

```mermaid
graph LR
    subgraph "Public — Marketing Site"
        MHOME["Homepage /"]
        MFEAT["Features /features/*"]
        MPRICE["Pricing /pricing"]
        MBLOG["Blog /blog/*"]
        MCOMP["Compare /compare/*"]
        MLOGIN["Login /login"]
        MSIGNUP["Signup /signup"]
    end

    subgraph "Authenticated — App"
        ADASH["Dashboard /app/dashboard"]
        APIPE["Pipeline /app/pipeline"]
        AANAL["Analytics /app/analytics"]
        ASTORY["Stories /app/stories"]
        ACV["CV Versions /app/cv-versions"]
        ASET["Settings /app/settings"]
    end

    MHOME --> MSIGNUP
    MHOME --> MLOGIN
    MFEAT --> MSIGNUP
    MPRICE --> MSIGNUP
    MSIGNUP --> ADASH
    MLOGIN --> ADASH
    ADASH --> APIPE
    ADASH --> AANAL
    ADASH --> ASTORY
    APIPE --> ASTORY
    AANAL --> ACV

    style MSIGNUP fill:#2563EB,color:#fff
    style ADASH fill:#10B981,color:#fff
    style ACV fill:#8B5CF6,color:#fff
```

---

## Three-Pillar Feature Hub

Shows the three strategic pillars as a hub-and-spoke from the Features section.

```mermaid
graph TD
    FEAT["Features Hub<br/>/features"]

    FEAT --> F1["📊 Funnel Analytics<br/>/features/funnel-analytics<br/><small>Applied→Screening→Offer rates</small>"]
    FEAT --> F2["📖 Interview Content OS<br/>/features/interview-content-os<br/><small>STAR story bank by competency</small>"]
    FEAT --> F3["🧪 CV Experimentation [Pro]<br/>/features/cv-experimentation<br/><small>A/B test CV versions</small>"]

    F1 -.-> F3
    F2 -.-> F3

    style FEAT fill:#0F172A,color:#fff
    style F1 fill:#2563EB,color:#fff
    style F2 fill:#2563EB,color:#fff
    style F3 fill:#8B5CF6,color:#fff
```

Legend:
- Solid lines = primary feature hub links
- Dashed lines = cross-feature upsell links (Phase 2 links from Phase 1)

---

## Competitor Compare Pages

Shows compare pages as SEO spokes off the Compare hub.

```mermaid
graph TD
    COMP["Compare Hub<br/>/compare"]

    COMP --> T["JobFunnel vs Teal<br/>/compare/teal"]
    COMP --> J["JobFunnel vs Jobscan<br/>/compare/jobscan"]
    COMP --> E["JobFunnel vs Eztrackr<br/>/compare/eztrackr"]
    COMP --> C["JobFunnel vs Careerflow<br/>/compare/careerflow"]

    T --> PRICE["Pricing<br/>/pricing"]
    J --> PRICE
    E --> PRICE
    C --> PRICE

    T -.-> F1["Funnel Analytics"]
    J -.-> F1
    E -.-> F2["Interview OS"]
    C -.-> F2

    style COMP fill:#0F172A,color:#fff
    style T fill:#10B981,color:#fff
    style J fill:#10B981,color:#fff
    style E fill:#10B981,color:#fff
    style C fill:#10B981,color:#fff
    style PRICE fill:#2563EB,color:#fff
```

Legend:
- Solid lines = primary nav flow (compare → pricing)
- Dashed lines = contextual internal links (compare → feature page)

---

## Content Hub-and-Spoke Model

Three content clusters mapped to the three pillars.

```mermaid
graph TD
    subgraph "Cluster 1: Funnel Analytics"
        H1["Hub: Funnel Analytics Guide<br/>/resources/guides/funnel-analytics"]
        S1A["Job Search Metrics That Matter<br/>/blog/job-search-metrics"]
        S1B["Applied-to-Screening Rate Explained<br/>/blog/applied-to-screening-rate"]
        S1C["How Long Should a Job Search Take<br/>/blog/how-long-job-search"]
    end

    subgraph "Cluster 2: Interview Prep"
        H2["Hub: STAR Method Guide<br/>/resources/guides/star-method"]
        S2A["Competency Interviews in Europe<br/>/blog/competency-interviews-europe"]
        S2B["STAR Method Examples<br/>/blog/star-method-examples"]
        S2C["Behavioral Interview Prep<br/>/blog/behavioral-interview-prep"]
    end

    subgraph "Cluster 3: EU Job Market"
        H3["Hub: EU Job Search Guide<br/>/resources/guides/eu-job-search"]
        S3A["Job Search in Germany<br/>/blog/job-search-germany"]
        S3B["Job Search in Netherlands<br/>/blog/job-search-netherlands"]
        S3C["Cross-Border EU Applications<br/>/blog/cross-border-eu-jobs"]
    end

    H1 --> S1A
    H1 --> S1B
    H1 --> S1C
    S1A -.-> S1B
    S1B -.-> S1C

    H2 --> S2A
    H2 --> S2B
    H2 --> S2C
    S2A -.-> S2B

    H3 --> S3A
    H3 --> S3B
    H3 --> S3C
    S3A -.-> S3B

    style H1 fill:#2563EB,color:#fff
    style H2 fill:#2563EB,color:#fff
    style H3 fill:#2563EB,color:#fff
```

Legend:
- Solid lines = hub → spoke links (hub page links to each spoke)
- Dashed lines = spoke cross-links (spokes link to each other where relevant)
- All spokes also link back to their hub (not shown for clarity)

---

## Internal Linking Flow (Marketing Site)

Shows how different sections link to each other for SEO equity flow.

```mermaid
graph LR
    subgraph "Marketing"
        HOME["Homepage /"]
        FEAT["Features /features"]
        PRICE["Pricing /pricing"]
    end

    subgraph "Content"
        BLOG["Blog /blog/*"]
        GUIDE["Guides /resources/guides/*"]
        COMP["Compare /compare/*"]
    end

    subgraph "Conversion"
        SIGNUP["Signup /signup"]
        LOGIN["Login /login"]
    end

    BLOG --> FEAT
    BLOG --> PRICE
    COMP --> FEAT
    COMP --> PRICE
    GUIDE --> FEAT
    GUIDE --> BLOG
    FEAT --> PRICE
    FEAT --> SIGNUP
    HOME --> FEAT
    HOME --> BLOG
    HOME --> COMP
    PRICE --> SIGNUP
```

---

## Phase Roadmap Diagram

Shows which pages are Phase 1 (shipped) vs Phase 2 (planned).

```mermaid
graph TD
    subgraph "Phase 1 — MVP"
        P1_HOME["Homepage /"]
        P1_FA["Funnel Analytics /features/funnel-analytics"]
        P1_IO["Interview OS /features/interview-content-os"]
        P1_PRICE["Pricing /pricing"]
        P1_BLOG["Blog /blog"]
        P1_COMP["Compare /compare/*"]
        P1_GUIDE["EU Job Search Guide"]
    end

    subgraph "Phase 2 — CV Experimentation"
        P2_CV["CV Experimentation /features/cv-experimentation"]
        P2_CHEXT["Chrome Extension /chrome-extension"]
        P2_CHANGE["Changelog /changelog"]
    end

    subgraph "Phase 3 — EU Integrations"
        P3_INT["Integrations /integrations/*"]
        P3_DE["German Version /de"]
        P3_NL["Dutch Version /nl"]
    end

    P1_HOME --> P1_FA
    P1_HOME --> P1_IO
    P1_HOME --> P1_PRICE
    P1_HOME --> P1_BLOG
    P1_IO -.-> P2_CV
    P2_CV --> P2_CHEXT
    P2_CV -.-> P3_INT

    style P1_HOME fill:#2563EB,color:#fff
    style P1_FA fill:#2563EB,color:#fff
    style P1_IO fill:#2563EB,color:#fff
    style P1_PRICE fill:#2563EB,color:#fff
    style P1_BLOG fill:#2563EB,color:#fff
    style P1_COMP fill:#10B981,color:#fff
    style P2_CV fill:#8B5CF6,color:#fff
    style P2_CHEXT fill:#8B5CF6,color:#fff
    style P2_CHANGE fill:#8B5CF6,color:#fff
    style P3_INT fill:#F59E0B,color:#fff
    style P3_DE fill:#F59E0B,color:#fff
    style P3_NL fill:#F59E0B,color:#fff
```

---

## Before / After — Site Restructuring Template

Use this when planning a navigation change. Replace placeholder labels with actual pages.

```mermaid
graph TD
    subgraph "Before (Current)"
        B_HOME["Homepage"] --> B_P1["Page 1"]
        B_HOME --> B_P2["Page 2"]
        B_HOME --> B_P3["Page 3"]
        B_HOME --> B_P4["Page 4"]
        B_HOME --> B_P5["Page 5"]
        B_HOME --> B_P6["Page 6"]
    end

    subgraph "After (Proposed)"
        A_HOME["Homepage"] --> A_S1["Features"]
        A_HOME --> A_S2["Resources"]
        A_HOME --> A_S3["Compare"]
        A_S1 --> A_P1["Funnel Analytics"]
        A_S1 --> A_P2["Interview OS"]
        A_S2 --> A_P3["Blog"]
        A_S2 --> A_P4["Guides"]
        A_S3 --> A_P5["vs Teal"]
        A_S3 --> A_P6["vs Jobscan"]
    end
```

---

## Color Coding Reference

Use these styles consistently across all JobFunnel Mermaid diagrams:

```
Phase 1 / Core pages:      style NODE fill:#2563EB,color:#fff   ← Primary blue
Pro / Phase 2 features:    style NODE fill:#8B5CF6,color:#fff   ← Purple
Compare / Conversion:      style NODE fill:#10B981,color:#fff   ← Green
Planned / Phase 3:         style NODE fill:#F59E0B,color:#fff   ← Amber
Deprecated / To remove:    style NODE fill:#EF4444,color:#fff   ← Red
Footer-only / Legal:       style NODE fill:#64748B,color:#fff   ← Gray
```

---

## Related Files

- [site-architecture.md](site-architecture.md) — Full hierarchy, URL map, internal linking strategy
- [navigation-patterns.md](navigation-patterns.md) — Header, footer, mobile, breadcrumb patterns
- [site-type-templates.md](site-type-templates.md) — Full page hierarchy templates
