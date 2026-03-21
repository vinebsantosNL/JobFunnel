export default function AnalyticsLoading() {
  return (
    <main className="flex-1 p-6 overflow-auto">
      <div className="space-y-6">
        {/* Metric cards skeleton */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="rounded-xl border border-gray-100 bg-white p-4 space-y-2">
              <div className="h-4 w-24 bg-gray-100 rounded animate-pulse" />
              <div className="h-8 w-16 bg-gray-100 rounded animate-pulse" />
              <div className="h-3 w-20 bg-gray-100 rounded animate-pulse" />
            </div>
          ))}
        </div>

        {/* Chart skeletons */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="rounded-xl border border-gray-100 bg-white p-6">
            <div className="h-5 w-32 bg-gray-100 rounded animate-pulse mb-4" />
            <div className="h-64 bg-gray-50 rounded-lg animate-pulse" />
          </div>
          <div className="rounded-xl border border-gray-100 bg-white p-6">
            <div className="h-5 w-32 bg-gray-100 rounded animate-pulse mb-4" />
            <div className="h-64 bg-gray-50 rounded-lg animate-pulse" />
          </div>
        </div>

        <div className="rounded-xl border border-gray-100 bg-white p-6">
          <div className="h-5 w-40 bg-gray-100 rounded animate-pulse mb-4" />
          <div className="h-48 bg-gray-50 rounded-lg animate-pulse" />
        </div>
      </div>
    </main>
  )
}
