"use client"

import Link from "next/link"
import { TrendingUp, ExternalLink } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { MobileNav } from "@/components/ui/mobile-nav"

type Story = {
  title: string
  url: string
}

const stories: Story[] = [
  {
    title: "风吹裤管和小马哥冲突事件",
    url: "https://www.wolai.com/fxoxabrZCusUeZY4h67uEF",
  },
]

export default function StoriesPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      {/* Navigation */}
      <nav className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center">
              <Link href="/" className="flex items-center">
                <TrendingUp className="h-8 w-8 text-blue-600" />
                <span className="ml-2 text-xl font-bold text-gray-900">引体向上力量指数</span>
              </Link>
            </div>
            {/* Desktop Navigation */}
            <div className="hidden md:flex items-center space-x-8">
              <Link href="/" className="text-gray-700 hover:text-blue-600">首页</Link>
              <Link href="/submit" className="text-gray-700 hover:text-blue-600">数据提交</Link>
              <Link href="/calculator" className="text-gray-700 hover:text-blue-600">公式计算器</Link>
              <Link href="/data" className="text-gray-700 hover:text-blue-600">社区数据</Link>
              <Link href="/methodology" className="text-gray-700 hover:text-blue-600">方法论</Link>
              <Link href="/stories" className="text-gray-900 hover:text-blue-600">街头健身故事会</Link>
            </div>
            {/* Mobile Navigation */}
            <div className="flex items-center md:hidden">
              <MobileNav />
            </div>
          </div>
        </div>
      </nav>

      <div className="py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-gray-900">街头健身故事会</h1>
            <p className="text-gray-600 mt-2">点击标题跳转到相应故事页面</p>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>故事列表</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="divide-y">
                {stories.map((s, idx) => (
                  <div key={idx} className="py-3 flex items-center justify-between">
                    <a
                      href={s.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-600 hover:underline"
                    >
                      {s.title}
                    </a>
                    <Button
                      variant="outline"
                      size="sm"
                      className="bg-transparent"
                      onClick={() => window.open(s.url, "_blank")}
                    >
                      查看
                      <ExternalLink className="ml-2 h-4 w-4" />
                    </Button>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}


