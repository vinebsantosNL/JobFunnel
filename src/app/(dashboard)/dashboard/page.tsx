import { Header } from '@/components/layout/header'
import { createClient } from '@/lib/supabase/server'
import { UpgradeBanner } from '@/components/dashboard/UpgradeBanner'
import { DashboardStatsBlock } from '@/components/dashboard/DashboardStatsBlock'
import { GettingStartedBlock } from '@/components/dashboard/GettingStartedBlock'
import { NextCareerGoal } from '@/components/dashboard/NextCareerGoal'

export default async function DashboardPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  const { data: profile } = await supabase
    .from('profiles')
    .select('full_name, subscription_tier, target_role, target_date, target_salary_min, target_salary_max, target_salary_currency')
    .eq('id', user?.id ?? '')
    .single()

  const isPro = profile?.subscription_tier === 'pro'

  return (
    <div className="flex flex-col flex-1 min-h-0">
      <Header title="Home" />

      {/* Upgrade banner — server-rendered, no layout shift */}
      <UpgradeBanner isPro={isPro} />

      <main className="flex-1 p-6 overflow-auto">
        <div className="max-w-6xl mx-auto">
          {/* 2-column grid: left=main content, right=getting started */}
          <div className="grid grid-cols-1 lg:grid-cols-[1fr_320px] gap-6">

            {/* LEFT COLUMN */}
            <div className="space-y-6">
              {/* Stats block */}
              <DashboardStatsBlock />

              {/* Next Career Goal */}
              <NextCareerGoal initialProfile={profile ?? {}} />
            </div>

            {/* RIGHT COLUMN */}
            <GettingStartedBlock />
          </div>
        </div>
      </main>
    </div>
  )
}
