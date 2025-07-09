import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { TrendingUp, Users, Calculator, BookOpen } from "lucide-react"
import Link from "next/link"
import { createClient } from "@supabase/supabase-js"
import { RecentSubmissions } from "@/components/recent-submissions"
import { DonationSection } from "@/components/donation-section"

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!)

async function getStats() {
  try {
    const { data: submissions, error: submissionsError } = await supabase.from("submissions").select("id")

    const { data: formulas, error: formulasError } = await supabase
      .from("formulas")
      .select("last_updated")
      .order("last_updated", { ascending: false })
      .limit(1)

    if (submissionsError || formulasError) {
      return { totalCount: 0, lastUpdated: null }
    }

    return {
      totalCount: submissions?.length || 0,
      lastUpdated: formulas?.[0]?.last_updated || null,
    }
  } catch (error) {
    return { totalCount: 0, lastUpdated: null }
  }
}

export default async function HomePage() {
  const { totalCount, lastUpdated } = await getStats()

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      {/* Navigation */}
      <nav className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center">
              <TrendingUp className="h-8 w-8 text-blue-600" />
              <span className="ml-2 text-xl font-bold text-gray-900">引体向上力量指数</span>
            </div>
            <div className="flex items-center space-x-8">
              <Link href="/" className="text-gray-900 hover:text-blue-600">
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
              <Link href="/methodology" className="text-gray-700 hover:text-blue-600">
                方法论
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="text-5xl font-bold text-gray-900 mb-6">引体向上力量指数计划</h1>
          <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
            共创一个透明、公平的力量标准。通过社区数据驱动，建立科学的引体向上力量评估体系。
          </p>
          <Link href="/submit">
            <Button size="lg" className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-4 text-lg">
              贡献我的数据
            </Button>
          </Link>
        </div>
      </section>

      {/* Dynamic Data Display */}
      <section className="py-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-6xl mx-auto">
          <div className="grid md:grid-cols-2 gap-8 mb-12">
            <Card className="bg-white shadow-lg">
              <CardHeader className="text-center">
                <Users className="h-12 w-12 text-blue-600 mx-auto mb-4" />
                <CardTitle className="text-2xl">数据收录状态</CardTitle>
              </CardHeader>
              <CardContent className="text-center">
                <div className="text-4xl font-bold text-blue-600 mb-2">{totalCount.toLocaleString()}</div>
                <p className="text-gray-600">条有效数据已收录</p>
              </CardContent>
            </Card>

            <Card className="bg-white shadow-lg">
              <CardHeader className="text-center">
                <Calculator className="h-12 w-12 text-green-600 mx-auto mb-4" />
                <CardTitle className="text-2xl">公式状态</CardTitle>
              </CardHeader>
              <CardContent className="text-center">
                <div className="text-lg font-semibold text-green-600 mb-2">
                  {lastUpdated ? new Date(lastUpdated).toLocaleDateString("zh-CN") : "待更新"}
                </div>
                <p className="text-gray-600">公式最近更新时间</p>
              </CardContent>
            </Card>
          </div>

          {/* Project Introduction */}
          <Card className="bg-white shadow-lg">
            <CardHeader>
              <CardTitle className="text-2xl text-center mb-4">项目简介</CardTitle>
            </CardHeader>
            <CardContent className="prose max-w-none">
              <div className="grid md:grid-cols-2 gap-8">
                <div>
                  <h3 className="text-lg font-semibold mb-3">项目目标</h3>
                  <ul className="space-y-2 text-gray-600">
                    <li>• 建立透明、科学的引体向上力量评估标准</li>
                    <li>• 通过社区数据驱动，持续优化评估公式</li>
                    <li>• 为不同体重的训练者提供公平的力量对比</li>
                    <li>• 推动引体向上训练的科学化发展</li>
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

      {/* Quick Actions */}
      <section className="py-16 px-4 sm:px-6 lg:px-8 bg-white">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-3xl font-bold text-center mb-12">快速开始</h2>
          <div className="grid md:grid-cols-4 gap-8">
            <Link href="/submit">
              <Card className="hover:shadow-lg transition-shadow cursor-pointer">
                <CardHeader className="text-center">
                  <Users className="h-12 w-12 text-blue-600 mx-auto mb-4" />
                  <CardTitle>提交数据</CardTitle>
                  <CardDescription>分享你的引体向上成绩，为社区贡献数据</CardDescription>
                </CardHeader>
              </Card>
            </Link>

            <Link href="/calculator">
              <Card className="hover:shadow-lg transition-shadow cursor-pointer">
                <CardHeader className="text-center">
                  <Calculator className="h-12 w-12 text-green-600 mx-auto mb-4" />
                  <CardTitle>力量计算器</CardTitle>
                  <CardDescription>使用最新公式计算你的力量指数</CardDescription>
                </CardHeader>
              </Card>
            </Link>

            <Link href="/data">
              <Card className="hover:shadow-lg transition-shadow cursor-pointer">
                <CardHeader className="text-center">
                  <TrendingUp className="h-12 w-12 text-purple-600 mx-auto mb-4" />
                  <CardTitle>社区数据</CardTitle>
                  <CardDescription>查看其他用户的成绩和训练视频</CardDescription>
                </CardHeader>
              </Card>
            </Link>

            <Link href="/methodology">
              <Card className="hover:shadow-lg transition-shadow cursor-pointer">
                <CardHeader className="text-center">
                  <BookOpen className="h-12 w-12 text-orange-600 mx-auto mb-4" />
                  <CardTitle>方法论</CardTitle>
                  <CardDescription>了解项目的科学依据和计算方法</CardDescription>
                </CardHeader>
              </Card>
            </Link>
          </div>
        </div>
      </section>

      {/* Donation Section */}
      <DonationSection variant="footer" />

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="flex items-center justify-center mb-4">
            <TrendingUp className="h-8 w-8 text-blue-400" />
            <span className="ml-2 text-xl font-bold">引体向上力量指数计划</span>
          </div>
          <p className="text-gray-400">© 2024 Pull-up Index Project. 开源项目，社区驱动。</p>
        </div>
      </footer>
    </div>
  )
}
