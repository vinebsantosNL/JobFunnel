import { Header } from '@/components/layout/header'

export default function SettingsLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <Header title="Settings" />
      {children}
    </>
  )
}
