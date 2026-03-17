export default function StoriesLoading() {
  return (
    <main className="flex-1 p-6 overflow-auto">
      <div className="max-w-6xl mx-auto space-y-6">
        {/* Search bar skeleton */}
        <div className="flex items-center justify-between gap-3">
          <div className="h-8 w-64 bg-gray-100 rounded-lg animate-pulse" />
          <div className="h-8 w-24 bg-gray-100 rounded-lg animate-pulse" />
        </div>

        {/* Competency filter skeleton */}
        <div className="flex gap-2">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="h-6 w-20 bg-gray-100 rounded-full animate-pulse" />
          ))}
        </div>

        {/* Story card grid skeleton */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="rounded-xl border border-gray-100 bg-white p-5 space-y-3">
              <div className="h-5 w-3/4 bg-gray-100 rounded animate-pulse" />
              <div className="h-3 w-full bg-gray-100 rounded animate-pulse" />
              <div className="h-3 w-2/3 bg-gray-100 rounded animate-pulse" />
              <div className="flex gap-1 mt-2">
                <div className="h-5 w-16 bg-gray-100 rounded-full animate-pulse" />
                <div className="h-5 w-16 bg-gray-100 rounded-full animate-pulse" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </main>
  )
}
