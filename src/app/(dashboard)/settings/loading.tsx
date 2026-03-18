export default function SettingsLoading() {
  return (
    <main className="flex-1 p-6">
      <div className="max-w-xl mx-auto space-y-6">
        <div className="h-6 w-32 bg-gray-100 rounded animate-pulse" />
        <div className="rounded-xl border border-gray-100 bg-white p-6 space-y-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="space-y-2">
              <div className="h-4 w-24 bg-gray-100 rounded animate-pulse" />
              <div className="h-9 w-full bg-gray-100 rounded-lg animate-pulse" />
            </div>
          ))}
        </div>
      </div>
    </main>
  )
}
