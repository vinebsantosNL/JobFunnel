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
    <div className="flex flex-col flex-1 min-h-0 relative">
      <Header title="Home" />

      <UpgradeBanner isPro={isPro} />

      <main className="flex-1 p-6 overflow-auto">
        <div className="space-y-5">
          <DashboardStatsBlock />

          <NextCareerGoal initialProfile={{
            full_name: profile?.full_name,
            target_role: profile?.target_role,
            target_date: profile?.target_date,
            target_salary_min: profile?.target_salary_min,
            target_salary_max: profile?.target_salary_max,
            target_salary_currency: profile?.target_salary_currency,
          }} />

          <GettingStartedBlock />
        </div>
      </main>

    </div>
  )
}
