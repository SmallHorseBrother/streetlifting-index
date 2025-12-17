"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { CheckCircle, TrendingUp, Calculator, Users } from "lucide-react"
import Link from "next/link"
import { RecentSubmissions } from "@/components/recent-submissions"
import { DonationSection } from "@/components/donation-section"
import { MobileNav } from "@/components/ui/mobile-nav"

export default function SubmissionSuccessPage() {
  const [showConfetti, setShowConfetti] = useState(true)

  useEffect(() => {
    const timer = setTimeout(() => setShowConfetti(false), 3000)
    return () => clearTimeout(timer)
  }, [])

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      {/* Navigation */}
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
              <Link href="/" className="text-gray-700 hover:text-blue-600">
                首页
              </Link>
              <Link href="/submit" className="text-gray-700 hover:text-blue-600">
                数据提交
              </Link>
              <Link href="/calculator" className="text-gray-700 hover:text-blue-600">
                公式计算器
              </Link>
              <Link href="/data" className="text-gray-700 hover:text-blue-600">
                社区数据
              </Link>
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
          {/* Success Message */}
          <div className="text-center mb-12">
            <div className="relative">
              <CheckCircle className="h-20 w-20 text-green-500 mx-auto mb-6" />
              {showConfetti && (
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="animate-ping absolute h-20 w-20 rounded-full bg-green-400 opacity-75"></div>
                </div>
              )}
            </div>
            <h1 className="text-4xl font-bold text-gray-900 mb-4">提交成功！</h1>
            <p className="text-xl text-gray-600 mb-8">
              感谢您为社区贡献宝贵的数据！您的提交将帮助我们建立更准确的力量评估标准。
            </p>
          </div>

          {/* Donation Section */}
          <DonationSection variant="success" className="mb-12" />

          {/* Action Cards */}
          <div className="grid md:grid-cols-3 gap-6 mb-12">
            <Link href="/calculator">
              <Card className="hover:shadow-lg transition-shadow cursor-pointer h-full">
                <CardHeader className="text-center pb-2">
                  <Calculator className="h-12 w-12 text-green-600 mx-auto mb-3" />
                  <CardTitle className="text-lg">计算力量指数</CardTitle>
                </CardHeader>
                <CardContent className="text-center">
                  <p className="text-gray-600 text-sm">使用最新公式计算您的力量指数，看看您在社区中的排名</p>
                </CardContent>
              </Card>
            </Link>

            <Link href="/data">
              <Card className="hover:shadow-lg transition-shadow cursor-pointer h-full">
                <CardHeader className="text-center pb-2">
                  <Users className="h-12 w-12 text-blue-600 mx-auto mb-3" />
                  <CardTitle className="text-lg">查看社区数据</CardTitle>
                </CardHeader>
                <CardContent className="text-center">
                  <p className="text-gray-600 text-sm">浏览其他用户的成绩，观看训练视频，互相学习进步</p>
                </CardContent>
              </Card>
            </Link>

            <Link href="/submit">
              <Card className="hover:shadow-lg transition-shadow cursor-pointer h-full">
                <CardHeader className="text-center pb-2">
                  <TrendingUp className="h-12 w-12 text-purple-600 mx-auto mb-3" />
                  <CardTitle className="text-lg">继续提交数据</CardTitle>
                </CardHeader>
                <CardContent className="text-center">
                  <p className="text-gray-600 text-sm">记录更多训练成绩，追踪您的进步历程</p>
                </CardContent>
              </Card>
            </Link>
          </div>

          {/* Recent Community Activity */}
          <Card>
            <CardHeader>
              <CardTitle className="text-center">看看其他用户的最新成绩</CardTitle>
            </CardHeader>
            <CardContent>
              <RecentSubmissions />
            </CardContent>
          </Card>

          {/* Back to Home */}
          <div className="text-center mt-8">
            <Link href="/">
              <Button variant="outline" size="lg" className="bg-transparent">
                返回首页
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}
