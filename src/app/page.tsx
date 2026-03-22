import type { Metadata } from 'next'
import { MarketingNav } from '@/components/marketing/MarketingNav'
import { HeroSection } from '@/components/marketing/HeroSection'
import { StatsBar } from '@/components/marketing/StatsBar'
import { ProblemBlock } from '@/components/marketing/ProblemBlock'
import { FeaturePillars } from '@/components/marketing/FeaturePillars'
import { HowItWorks } from '@/components/marketing/HowItWorks'
import { DashboardMockup } from '@/components/marketing/DashboardMockup'
import { PricingSection } from '@/components/marketing/PricingSection'
import { FAQSection } from '@/components/marketing/FAQSection'
import { FinalCTA } from '@/components/marketing/FinalCTA'
import { MarketingFooter } from '@/components/marketing/MarketingFooter'

export const metadata: Metadata = {
  title: 'Job Funnel — The job search platform for tech professionals who think in funnels',
  description:
    'Track applications with stage-by-stage conversion analytics, build an interview story vault, and A/B test your CV. Built for tech professionals in Europe.',
  openGraph: {
    title: 'Job Funnel — Run your job search like a product funnel',
    description:
      'Stop sending applications into a black hole. Job Funnel shows you exactly where your search breaks down — and what to do about it.',
    type: 'website',
  },
}

export default function HomePage() {
  return (
    <main>
      <MarketingNav />
      <HeroSection />
      <StatsBar />
      <ProblemBlock />
      <FeaturePillars />
      <HowItWorks />
      <DashboardMockup />
      <PricingSection />
      <FAQSection />
      <FinalCTA />
      <MarketingFooter />
    </main>
  )
}
