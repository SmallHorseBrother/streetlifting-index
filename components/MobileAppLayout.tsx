"use client"

import { ReactNode } from "react"
import { SiteHeader } from "@/components/SiteHeader"
import { BottomNav } from "@/components/BottomNav"

interface MobileAppLayoutProps {
  children: ReactNode
  title: string
  currentPage?: "home" | "calculator" | "data" | "stories" | "locations"
  showBackButton?: boolean
  rightAction?: ReactNode
  hideBottomNav?: boolean
}

export function MobileAppLayout({
  children,
  title,
  currentPage,
  showBackButton = false,
  rightAction,
  hideBottomNav = false,
}: MobileAppLayoutProps) {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* 桌面端显示顶部导航 */}
      <div className="hidden md:block">
        <SiteHeader currentPage={currentPage} />
      </div>

      {/* 移动端App风格头部 */}
      <header className="md:hidden sticky top-0 z-40 bg-white border-b border-gray-100 safe-area-pt">
        <div className="flex items-center justify-between px-4 h-14">
          <h1 className="text-lg font-bold text-gray-900 truncate">{title}</h1>
          {rightAction && <div className="flex items-center gap-2">{rightAction}</div>}
        </div>
      </header>

      {/* 主要内容区域 */}
      <main className={`${hideBottomNav ? '' : 'pb-20'} md:pb-0`}>
        {children}
      </main>

      {/* 底部导航 - 仅移动端 */}
      {!hideBottomNav && <BottomNav />}
    </div>
  )
}
