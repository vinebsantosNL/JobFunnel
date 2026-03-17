import { Header } from '@/components/layout/header'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

export default function DashboardPage() {
  return (
    <>
      <Header title="Dashboard" />
      <main className="flex-1 p-6">
        <div className="max-w-6xl mx-auto">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
            {[
              { label: 'Total Applications', value: '0', sub: 'Get started by adding your first job' },
              { label: 'Active Applications', value: '0', sub: 'In progress' },
              { label: 'Interviews', value: '0', sub: 'Scheduled' },
              { label: 'Conversion Rate', value: '—', sub: 'Offer / Applied' },
            ].map((metric) => (
              <Card key={metric.label}>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium text-gray-500">{metric.label}</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-2xl font-bold text-gray-900">{metric.value}</p>
                  <p className="text-xs text-gray-500 mt-1">{metric.sub}</p>
                </CardContent>
              </Card>
            ))}
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Getting Started</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-center gap-3 text-sm text-gray-600">
                  <span className="text-green-500">✓</span> Create your account
                </div>
                <div className="flex items-center gap-3 text-sm text-gray-400">
                  <span>○</span> Add your first job application
                </div>
                <div className="flex items-center gap-3 text-sm text-gray-400">
                  <span>○</span> Create an interview story
                </div>
                <div className="flex items-center gap-3 text-sm text-gray-400">
                  <span>○</span> Complete your profile
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-base">Quick Actions</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <a href="/app/pipeline" className="block text-sm text-blue-600 hover:underline">
                  → Go to Pipeline
                </a>
                <a href="/app/stories" className="block text-sm text-blue-600 hover:underline">
                  → Add Interview Story
                </a>
                <a href="/app/settings/profile" className="block text-sm text-blue-600 hover:underline">
                  → Complete Profile
                </a>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
    </>
  )
}
