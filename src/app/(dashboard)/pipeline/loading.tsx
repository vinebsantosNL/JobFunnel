export default function PipelineLoading() {
  return (
    <div className="flex-1 p-6">
      <div className="flex gap-4 overflow-hidden">
        {Array.from({ length: 5 }).map((_, i) => (
          <div key={i} className="w-72 flex-shrink-0 space-y-2">
            <div className="h-9 bg-gray-100 rounded-lg animate-pulse" />
            {Array.from({ length: 3 }).map((_, j) => (
              <div key={j} className="h-20 bg-gray-100 rounded-lg animate-pulse" />
            ))}
          </div>
        ))}
      </div>
    </div>
  )
}
