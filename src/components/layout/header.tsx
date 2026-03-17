import { createClient } from '@/lib/supabase/server'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'

interface HeaderProps {
  title: string
}

export async function Header({ title }: HeaderProps) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  const initials = user?.email?.slice(0, 2).toUpperCase() ?? 'JF'

  return (
    <header className="flex items-center justify-between h-16 px-6 bg-white border-b border-gray-100">
      <h1 className="text-lg font-semibold text-gray-900">{title}</h1>
      <div className="flex items-center gap-3">
        <span className="text-sm text-gray-500">{user?.email}</span>
        <Avatar className="h-8 w-8">
          <AvatarFallback className="bg-blue-100 text-blue-600 text-xs">
            {initials}
          </AvatarFallback>
        </Avatar>
      </div>
    </header>
  )
}
