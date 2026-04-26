import type { Metadata } from 'next'
import './globals.css'
import { MigrationBanner } from '@/components/migration-banner'

export const metadata: Metadata = {
  title: '街健力量指数',
  description: '世界首创的街健力量评估体系',
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="zh-CN">
      <body>
        <MigrationBanner />
        {children}
      </body>
    </html>
  )
}
