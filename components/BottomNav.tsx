"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { Home, MapPin, Calculator, Database, BookOpen } from "lucide-react"

interface BottomNavProps {
  className?: string
}

export function BottomNav({ className }: BottomNavProps) {
  const pathname = usePathname()

  const navItems = [
    { href: "/", icon: Home, label: "首页" },
    { href: "/locations", icon: MapPin, label: "寻找单杠" },
    { href: "/calculator", icon: Calculator, label: "计算器" },
    { href: "/data", icon: Database, label: "数据社区" },
    { href: "/stories", icon: BookOpen, label: "故事" },
  ]

  return (
    <nav className={`fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 z-50 md:hidden ${className || ""}`}>
      <div className="flex justify-around items-center h-16 px-2 safe-area-pb">
        {navItems.map((item) => {
          const isActive = pathname === item.href || 
            (item.href !== "/" && pathname?.startsWith(item.href))
          const Icon = item.icon
          
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex flex-col items-center justify-center flex-1 h-full py-2 transition-colors ${
                isActive 
                  ? "text-blue-600" 
                  : "text-gray-500 hover:text-gray-700"
              }`}
            >
              <Icon className={`h-5 w-5 mb-1 ${isActive ? "stroke-[2.5]" : ""}`} />
              <span className={`text-[10px] leading-tight ${isActive ? "font-semibold" : ""}`}>
                {item.label}
              </span>
            </Link>
          )
        })}
      </div>
    </nav>
  )
}
