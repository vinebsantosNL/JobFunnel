interface MetricCardProps {
  title: string
  value: string
  subtitle?: string
  borderColor?: string
}

export function MetricCard({ title, value, subtitle, borderColor = 'border-blue-500' }: MetricCardProps) {
  return (
    <div className={`bg-white rounded-xl border border-gray-200 border-l-4 ${borderColor} p-5`}>
      <p className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-1">{title}</p>
      <p className="text-2xl font-bold text-gray-900">{value}</p>
      {subtitle && <p className="text-xs text-gray-400 mt-1">{subtitle}</p>}
    </div>
  )
}
