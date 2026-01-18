"use client"

import Link from "next/link"
import { TrendingUp } from "lucide-react"
import { MobileNav } from "@/components/ui/mobile-nav"

interface SiteHeaderProps {
  currentPage?: "home" | "calculator" | "data" | "stories" | "locations"
}

export function SiteHeader({ currentPage }: SiteHeaderProps) {
  const linkClass = (page: string) =>
    currentPage === page
      ? "text-gray-900 hover:text-blue-600"
      : "text-gray-700 hover:text-blue-600"

  return (
    <nav className="bg-white shadow-sm border-b">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex items-center">
            <Link href="/" className="flex items-center">
              <TrendingUp className="h-8 w-8 text-blue-600" />
              <span className="ml-2 text-xl font-bold text-gray-900">街健力量指数</span>
            </Link>
          </div>
          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-8">
            <Link href="/" className={linkClass("home")}>首页</Link>
            <Link href="/locations" className={linkClass("locations")}>寻找单杠</Link>
            <Link href="/calculator" className={linkClass("calculator")}>力量计算器</Link>
            <Link href="/data" className={linkClass("data")}>数据提交与社区</Link>
            <Link href="/stories" className={linkClass("stories")}>社区故事</Link>
          </div>
          {/* Mobile Navigation */}
          <div className="flex items-center md:hidden">
            <MobileNav />
          </div>
        </div>
      </div>
    </nav>
  )
}
