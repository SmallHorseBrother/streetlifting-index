"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { TrendingUp, Users, Calculator, BookOpen, ArrowRight } from "lucide-react"
import Link from "next/link"
import { createClient } from "@supabase/supabase-js"
import { RecentSubmissions } from "@/components/recent-submissions"
import { DonationSection } from "@/components/donation-section"
import { MobileNav } from "@/components/ui/mobile-nav"

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!)

export default function HomePage() {
  const [stats, setStats] = useState({
    totalCount: 0,
    lastUpdated: null as string | null,
    loading: true
  })

  useEffect(() => {
    async function getStats() {
      try {
        const { count: totalCount, error: submissionsError } = await supabase
          .from("submissions")
          .select("*", { count: "exact", head: true })

        const { data: formulas, error: formulasError } = await supabase
          .from("formulas")
          .select("last_updated")
          .order("last_updated", { ascending: false })
          .limit(1)

        if (submissionsError || formulasError) {
          setStats({ totalCount: 0, lastUpdated: null, loading: false })
          return
        }

        setStats({
          totalCount: totalCount || 0,
          lastUpdated: formulas?.[0]?.last_updated || null,
          loading: false
        })
      } catch (error) {
        setStats({ totalCount: 0, lastUpdated: null, loading: false })
      }
    }

    getStats()
  }, [])

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      {/* Navigation */}
      <nav className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center">
              <TrendingUp className="h-8 w-8 text-blue-600" />
              <span className="ml-2 text-xl font-bold text-gray-900">街健力量指数</span>
            </div>
            <div className="hidden md:flex items-center space-x-8">
              <Link href="/" className="text-gray-900 hover:text-blue-600">首页</Link>
              <Link href="/calculator" className="text-gray-700 hover:text-blue-600">力量计算器</Link>
              <Link href="/submit" className="text-gray-700 hover:text-blue-600">数据提交</Link>
              <Link href="/data" className="text-gray-700 hover:text-blue-600">社区数据</Link>
              <Link href="/stories" className="text-gray-700 hover:text-blue-600">街头健身故事会</Link>
            </div>
            <div className="flex items-center md:hidden">
              <MobileNav />
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section with Prominent CTAs */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-gradient-to-br from-blue-600 to-indigo-700 text-white">
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="text-5xl font-bold mb-6">世界首创的街健力量系数</h1>
          <p className="text-xl mb-8 max-w-2xl mx-auto opacity-90">
            由<span className="font-semibold">枭马葛</span>创建的科学评估体系，支持引体向上、臂屈伸等动作，为不同体重的训练者提供公平、透明的力量评估标准。
          </p>
          
          {/* Primary CTAs */}
          <div className="flex flex-col sm:flex-row justify-center gap-4 mb-12">
            <Link href="/calculator">
              <Button size="lg" className="w-full sm:w-auto bg-green-500 hover:bg-green-600 text-white px-8 py-6 text-lg flex items-center justify-center">
                <Calculator className="mr-2 h-6 w-6" />
                计算我的力量分
              </Button>
            </Link>
            <Link href="/submit">
              <Button size="lg" variant="outline" className="w-full sm:w-auto bg-white/10 hover:bg-white/20 text-white border-white/20 px-8 py-6 text-lg flex items-center justify-center">
                <Users className="mr-2 h-6 w-6" />
                贡献我的数据
              </Button>
            </Link>
            <Link href="/stories">
              <Button size="lg" className="w-full sm:w-auto bg-red-500 hover:bg-red-600 text-white px-8 py-6 text-lg flex items-center justify-center font-bold">
                <span className="text-yellow-300 mr-2">🆕</span>
                最新故事：刘金峰和肖林
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </Link>
          </div>

          {/* Social Links */}
          <div className="flex justify-center space-x-4">
            <a
              href="https://space.bilibili.com/495933903"
              target="_blank"
              rel="noopener noreferrer"
              className="text-white/80 hover:text-white flex items-center"
            >
              <svg className="w-5 h-5 mr-1" viewBox="0 0 24 24" fill="currentColor">
                <path d="M17.813 4.653h.854c1.51.054 2.769.578 3.773 1.574 1.004.995 1.524 2.249 1.56 3.76v7.36c-.036 1.51-.556 2.769-1.56 3.773s-2.262 1.524-3.773 1.56H5.333c-1.51-.036-2.769-.556-3.773-1.56S.036 18.858 0 17.347v-7.36c.036-1.511.556-2.765 1.56-3.76 1.004-.996 2.262-1.52 3.773-1.574h.774l-1.174-1.12a1.234 1.234 0 0 1-.373-.906c0-.356.124-.658.373-.907l.027-.027c.267-.249.573-.373.92-.373.347 0 .653.124.92.373L9.653 4.44c.071.071.134.142.187.213h4.267a.836.836 0 0 1 .16-.213l2.853-2.747c.267-.249.573-.373.92-.373.347 0 .662.151.929.4.267.249.391.551.391.907 0 .355-.124.657-.373.906L17.813 4.653zM5.333 7.24c-.746.018-1.373.276-1.88.773-.506.498-.769 1.13-.786 1.894v7.52c.017.764.28 1.395.786 1.893.507.498 1.134.756 1.88.773h13.334c.746-.017 1.373-.275 1.88-.773.506-.498.769-1.129.786-1.893v-7.52c-.017-.765-.28-1.396-.786-1.894-.507-.497-1.134-.755-1.88-.773H5.333zM8 11.107c.373 0 .684.124.933.373.25.249.383.569.4.96v1.173c-.017.391-.15.711-.4.96-.249.25-.56.374-.933.374s-.684-.125-.933-.374c-.25-.249-.383-.569-.4-.96V12.44c0-.373.129-.689.386-.947.258-.257.574-.386.947-.386zm8 0c.373 0 .684.124.933.373.25.249.383.569.4.96v1.173c-.017.391-.15.711-.4.96-.249.25-.56.374-.933.374s-.684-.125-.933-.374c-.25-.249-.383-.569-.4-.96V12.44c.017-.391.15-.711.4-.96.249-.249.56-.373.933-.373z" />
              </svg>
              B站主页
            </a>
            <a
              href="https://www.douyin.com/user/MS4wLjABAAAAy7udlkayIqU8bv2_78wy-WnexjBe0yqo1VoKwLlwCmee2p52Wzpdlf2zcoy8pJNm"
              target="_blank"
              rel="noopener noreferrer"
              className="text-white/80 hover:text-white flex items-center"
            >
              <svg className="w-5 h-5 mr-1" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12.525.02c1.31-.02 2.61-.01 3.91-.02.08 1.53.63 3.09 1.75 4.17 1.12 1.11 2.7 1.62 4.24 1.79v4.03c-1.44-.05-2.89-.35-4.2-.97-.57-.26-1.1-.59-1.62-.93-.01 2.92.01 5.84-.02 8.75-.08 1.4-.54 2.79-1.35 3.94-1.31 1.92-3.58 3.17-5.91 3.21-1.43.08-2.86-.31-4.08-1.03-2.02-1.19-3.44-3.37-3.65-5.71-.02-.5-.03-1-.01-1.49.18-1.9 1.12-3.72 2.58-4.96 1.66-1.44 3.98-2.13 6.15-1.72.02 1.48-.04 2.96-.04 4.44-.99-.32-2.15-.23-3.02.37-.63.41-1.11 1.04-1.36 1.75-.21.51-.15 1.07-.14 1.61.24 1.64 1.82 3.02 3.5 2.87 1.12-.01 2.19-.66 2.77-1.61.19-.33.4-.67.41-1.06.1-1.79.06-3.57.07-5.36.01-4.03-.01-8.05.02-12.07z" />
              </svg>
              抖音主页
            </a>
          </div>
        </div>
      </section>

      {/* Feature Cards */}
      <section className="py-16 px-4 sm:px-6 lg:px-8 -mt-12">
        <div className="max-w-6xl mx-auto">
          <div className="grid md:grid-cols-3 gap-8">
            {/* Calculator Card */}
            <Card className="bg-white shadow-xl transform hover:-translate-y-1 transition-all duration-300">
              <CardHeader className="text-center pb-4">
                <Calculator className="h-12 w-12 text-green-600 mx-auto mb-2" />
                <CardTitle className="text-xl text-green-700">力量计算器</CardTitle>
              </CardHeader>
              <CardContent className="text-center">
                <p className="text-gray-600 mb-4">快速计算你的力量分数，评估训练水平</p>
                <Link href="/calculator">
                  <Button className="w-full bg-green-600 hover:bg-green-700">
                    开始计算
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </Link>
              </CardContent>
            </Card>

            {/* Data Submission Card */}
            <Card className="bg-white shadow-xl transform hover:-translate-y-1 transition-all duration-300">
              <CardHeader className="text-center pb-4">
                <Users className="h-12 w-12 text-blue-600 mx-auto mb-2" />
                <CardTitle className="text-xl text-blue-700">数据提交</CardTitle>
                {stats.loading ? (
                  <div className="text-2xl font-bold text-blue-600">加载中...</div>
                ) : (
                  <div className="text-3xl font-bold text-blue-600">{stats.totalCount.toLocaleString()}</div>
                )}
                <p className="text-sm text-gray-500">条数据已收录</p>
              </CardHeader>
              <CardContent className="text-center">
                <Link href="/submit">
                  <Button className="w-full bg-blue-600 hover:bg-blue-700">
                    提交数据
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </Link>
              </CardContent>
            </Card>

            {/* Community Data Card */}
            <Card className="bg-white shadow-xl transform hover:-translate-y-1 transition-all duration-300">
              <CardHeader className="text-center pb-4">
                <TrendingUp className="h-12 w-12 text-purple-600 mx-auto mb-2" />
                <CardTitle className="text-xl text-purple-700">社区数据</CardTitle>
                <p className="text-sm text-gray-500">查看社区成员的训练成绩</p>
              </CardHeader>
              <CardContent className="text-center">
                <Link href="/data">
                  <Button className="w-full bg-purple-600 hover:bg-purple-700">
                    查看排行榜
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </Link>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Project Introduction */}
      <section className="py-16 px-4 sm:px-6 lg:px-8 bg-white">
        <div className="max-w-6xl mx-auto">
          <Card className="border-0 shadow-none">
            <CardHeader>
              <CardTitle className="text-2xl text-center mb-4">项目简介</CardTitle>
            </CardHeader>
            <CardContent className="prose max-w-none">
              <div className="grid md:grid-cols-2 gap-8">
                <div>
                  <h3 className="text-lg font-semibold mb-3">项目目标</h3>
                  <ul className="space-y-2 text-gray-600">
                    <li>• 建立透明、科学的街健力量评估标准</li>
                    <li>• 通过社区数据驱动，持续优化评估公式</li>
                    <li>• 为不同体重的训练者提供公平的力量对比</li>
                    <li>• 推动街头健身训练的科学化发展</li>
                  </ul>
                </div>
                <div>
                  <h3 className="text-lg font-semibold mb-3">核心价值</h3>
                  <ul className="space-y-2 text-gray-600">
                    <li>• 数据透明：所有计算过程公开可查</li>
                    <li>• 社区驱动：每个人的数据都有价值</li>
                    <li>• 持续改进：公式随数据增长而优化</li>
                    <li>• 科学严谨：基于统计学和运动科学</li>
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Recent Submissions */}
      <section className="py-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-6xl mx-auto">
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-3xl font-bold text-gray-900">社区动态</h2>
            <Link href="/data">
              <Button variant="outline" className="bg-transparent">
                查看全部 →
              </Button>
            </Link>
          </div>
          <RecentSubmissions />
        </div>
      </section>

      {/* Donation Section */}
      <DonationSection variant="footer" />

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="flex items-center justify-center mb-4">
            <TrendingUp className="h-8 w-8 text-blue-400" />
            <span className="ml-2 text-xl font-bold">街健力量指数</span>
          </div>
          <p className="text-gray-400">© 2024 Pull-up Strength Coefficient. 开源项目，社区驱动。</p>
        </div>
      </footer>
    </div>
  )
}
