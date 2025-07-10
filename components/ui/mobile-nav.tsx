import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"
import { Button } from "@/components/ui/button"
import { Menu } from "lucide-react"
import Link from "next/link"

export function MobileNav() {
  return (
    <Sheet>
      <SheetTrigger asChild>
        <Button variant="ghost" className="md:hidden">
          <Menu className="h-6 w-6" />
          <span className="sr-only">打开菜单</span>
        </Button>
      </SheetTrigger>
      <SheetContent side="right" className="w-[240px] sm:w-[300px]">
        <nav className="flex flex-col gap-4">
          <Link href="/" className="text-lg font-medium hover:text-blue-600 transition-colors">
            首页
          </Link>
          <Link href="/submit" className="text-lg font-medium hover:text-blue-600 transition-colors">
            数据提交
          </Link>
          <Link href="/calculator" className="text-lg font-medium hover:text-blue-600 transition-colors">
            公式计算器
          </Link>
          <Link href="/data" className="text-lg font-medium hover:text-blue-600 transition-colors">
            社区数据
          </Link>
          <Link href="/methodology" className="text-lg font-medium hover:text-blue-600 transition-colors">
            方法论
          </Link>
        </nav>
      </SheetContent>
    </Sheet>
  )
} 