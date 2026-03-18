import Link from 'next/link'

interface NextCareerGoalProps {
  fullName?: string | null
}

export function NextCareerGoal({ fullName }: NextCareerGoalProps) {
  const greeting = fullName ? `Hi, ${fullName.split(' ')[0]}` : 'Welcome back'

  return (
    <div className="bg-white rounded-xl border border-gray-200 p-5">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-xs text-gray-500 mb-1">Next Career Goal</p>
          <h3 className="text-lg font-semibold text-gray-900">{greeting} 👋</h3>
          <p className="text-sm text-gray-500 mt-1">
            Track your job search, prepare your stories, and land your next role.
          </p>
        </div>
        <Link
          href="/settings/profile"
          className="flex-shrink-0 text-xs text-blue-600 hover:underline underline-offset-2"
        >
          Edit Goals
        </Link>
      </div>

      <div className="grid grid-cols-3 gap-4 mt-5 pt-5 border-t border-gray-100">
        <div>
          <p className="text-xs text-gray-400">Target Title</p>
          <p className="text-sm font-medium text-gray-900 mt-0.5">—</p>
        </div>
        <div>
          <p className="text-xs text-gray-400">Target Date</p>
          <p className="text-sm font-medium text-gray-900 mt-0.5">—</p>
        </div>
        <div>
          <p className="text-xs text-gray-400">Target Salary</p>
          <p className="text-sm font-medium text-gray-900 mt-0.5">—</p>
        </div>
      </div>
    </div>
  )
}
