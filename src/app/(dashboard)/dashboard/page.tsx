import { Header } from '@/components/layout/header'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { createClient } from '@/lib/supabase/server'
import { formatDistanceToNow } from '@/lib/date-utils'

export default async function DashboardPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  // Fetch profile
  const { data: profile } = await supabase
    .from('profiles')
    .select('full_name')
    .eq('id', user?.id ?? '')
    .single()

  // Fetch all job applications for this user
  const { data: jobs } = await supabase
    .from('job_applications')
    .select('id, stage, company_name, job_title')
    .eq('user_id', user?.id ?? '')

  const allJobs = jobs ?? []

  const totalApplications = allJobs.filter((j) => j.stage !== 'saved').length
  const activeApplications = allJobs.filter((j) =>
    ['applied', 'screening', 'interviewing'].includes(j.stage)
  ).length
  const interviews = allJobs.filter((j) => j.stage === 'interviewing').length
  const hasFirstJob = allJobs.length > 0

  // Fetch story count
  const { count: storyCount } = await supabase
    .from('interview_stories')
    .select('id', { count: 'exact', head: true })
    .eq('user_id', user?.id ?? '')

  const storiesCreated = storyCount ?? 0

  // Fetch last 5 stage history entries with job info
  const jobIds = allJobs.map((j) => j.id)

  interface RecentActivity {
    id: string
    from_stage: string | null
    to_stage: string
    transitioned_at: string
    job_applications: {
      company_name: string
      job_title: string
    } | null
  }

  let recentActivity: RecentActivity[] = []

  if (jobIds.length > 0) {
    const { data: history } = await supabase
      .from('stage_history')
      .select('id, from_stage, to_stage, transitioned_at, job_applications(company_name, job_title)')
      .in('job_id', jobIds)
      .order('transitioned_at', { ascending: false })
      .limit(5)

    recentActivity = (history ?? []) as unknown as RecentActivity[]
  }

  const hasFullName = Boolean(profile?.full_name)

  const checklist = [
    { label: 'Create account', done: true },
    { label: 'Add first job application', done: hasFirstJob },
    { label: 'Create first story', done: storiesCreated > 0 },
    { label: 'Complete profile (add your name)', done: hasFullName },
  ]

  return (
    <>
      <Header title="Dashboard" />
      <main className="flex-1 p-6 overflow-auto">
        <div className="max-w-6xl mx-auto">
          {/* Metric Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-gray-500">Total Applications</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-2xl font-bold text-gray-900">{totalApplications}</p>
                <p className="text-xs text-gray-500 mt-1">
                  {totalApplications === 0 ? 'Get started by adding your first job' : 'All time'}
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-gray-500">Active</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-2xl font-bold text-gray-900">{activeApplications}</p>
                <p className="text-xs text-gray-500 mt-1">In progress</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-gray-500">Interviews</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-2xl font-bold text-gray-900">{interviews}</p>
                <p className="text-xs text-gray-500 mt-1">Currently interviewing</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-gray-500">Stories Created</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-2xl font-bold text-gray-900">{storiesCreated}</p>
                <p className="text-xs text-gray-500 mt-1">STAR stories in library</p>
              </CardContent>
            </Card>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Getting Started Checklist */}
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Getting Started</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {checklist.map((item) => (
                  <div
                    key={item.label}
                    className={`flex items-center gap-3 text-sm ${
                      item.done ? 'text-gray-600' : 'text-gray-400'
                    }`}
                  >
                    <span className={item.done ? 'text-green-500' : ''}>
                      {item.done ? '✓' : '○'}
                    </span>
                    {item.label}
                  </div>
                ))}
              </CardContent>
            </Card>

            {/* Recent Activity */}
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Recent Activity</CardTitle>
              </CardHeader>
              <CardContent>
                {recentActivity.length === 0 ? (
                  <div className="space-y-2">
                    <p className="text-sm text-gray-400">No activity yet.</p>
                    <div className="pt-2 space-y-2">
                      <a href="/pipeline" className="block text-sm text-blue-600 hover:underline">
                        → Go to Pipeline
                      </a>
                      <a href="/stories" className="block text-sm text-blue-600 hover:underline">
                        → Add Interview Story
                      </a>
                      <a href="/settings/profile" className="block text-sm text-blue-600 hover:underline">
                        → Complete Profile
                      </a>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {recentActivity.map((entry) => {
                      const company = entry.job_applications?.company_name ?? 'Unknown'
                      const title = entry.job_applications?.job_title ?? ''
                      const from = entry.from_stage
                      const to = entry.to_stage
                      const ago = formatDistanceToNow(new Date(entry.transitioned_at))

                      return (
                        <div key={entry.id} className="text-sm">
                          <span className="font-medium text-gray-900">
                            {company}{title ? ` — ${title}` : ''}
                          </span>
                          <span className="text-gray-500">
                            {': '}
                            {from ? (
                              <>
                                <span className="capitalize">{from}</span>
                                {' → '}
                              </>
                            ) : null}
                            <span className="capitalize">{to}</span>
                          </span>
                          <span className="text-xs text-gray-400 ml-1">({ago})</span>
                        </div>
                      )
                    })}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
    </>
  )
}
