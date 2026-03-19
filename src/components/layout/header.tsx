interface HeaderProps {
  title: string
}

export async function Header({ title }: HeaderProps) {
  return (
    <header className="flex items-center h-16 px-6 bg-white border-b border-gray-200">
      <div>
        <p className="text-xs font-medium text-gray-400 uppercase tracking-wide">Workspace</p>
        <h1 className="text-xl font-bold text-gray-900 leading-tight">{title}</h1>
      </div>
    </header>
  )
}
