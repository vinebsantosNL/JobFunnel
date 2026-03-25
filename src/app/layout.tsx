import type { Metadata } from 'next'
import { Inter, DM_Mono } from 'next/font/google'
import './globals.css'
import { QueryProvider } from '@/components/providers/query-provider'
import { Toaster } from '@/components/ui/sonner'
import { SpeedInsights } from '@vercel/speed-insights/next'
import { Analytics } from '@vercel/analytics/next'

const inter = Inter({ subsets: ['latin'] })
const dmMono = DM_Mono({
  subsets: ['latin'],
  weight: ['400', '500'],
  variable: '--font-dm-mono',
})

export const metadata: Metadata = {
  title: 'JobFunnel OS',
  description: 'Manage your job search like a product funnel',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className={`${inter.className} ${dmMono.variable}`}>
        <QueryProvider>{children}</QueryProvider>
        <Toaster />
        <SpeedInsights />
        <Analytics />
      </body>
    </html>
  )
}
