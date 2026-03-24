import { Header } from '@/components/layout/header'
import { AnalyticsDashboard } from '@/components/analytics/analytics-dashboard'

export default function AnalyticsPage() {
  return (
    <>
      <Header title="Analytics" />
      <div className="flex-1 overflow-auto">
        <AnalyticsDashboard />
      </div>
    </>
  )
}

