import Link from 'next/link'

export default function HomePage() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-[#FAFAFA] p-4">
      <div className="text-center max-w-2xl">
        <h1 className="text-5xl font-bold text-gray-900 mb-4">
          <span className="text-blue-600">JobFunnel</span> OS
        </h1>
        <p className="text-xl text-gray-600 mb-8">
          Manage your job search like a product funnel. Track applications, prepare for interviews, and land your next role.
        </p>
        <div className="flex gap-4 justify-center">
          <Link
            href="/signup"
            className="inline-flex items-center justify-center rounded-lg bg-gray-900 px-6 py-2.5 text-sm font-medium text-white transition-colors hover:bg-gray-700"
          >
            Get started free
          </Link>
          <Link
            href="/login"
            className="inline-flex items-center justify-center rounded-lg border border-gray-200 bg-white px-6 py-2.5 text-sm font-medium text-gray-900 transition-colors hover:bg-gray-50"
          >
            Sign in
          </Link>
        </div>
        <p className="mt-8 text-sm text-gray-500">Built for mid-to-senior tech professionals in Europe</p>
      </div>
    </div>
  )
}
