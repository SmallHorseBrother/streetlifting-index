import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { TrendingUp, Database, Calculator, BarChart3, Users, Shield } from "lucide-react"
import Link from "next/link"
import { DonationSection } from "@/components/donation-section"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { MobileNav } from "@/components/ui/mobile-nav"

export default function MethodologyPage() {
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
              <Link href="/methodology" className="text-gray-900 hover:text-blue-600">
                方法论
              </Link>
              <Link href="/stories" className="text-gray-700 hover:text-blue-600">
                街头健身故事会
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
          <div className="text-center mb-12">
            <h1 className="text-4xl font-bold text-gray-900 mb-4">方法论</h1>
            <p className="text-xl text-gray-600">了解引体向上力量指数计划的科学依据和计算方法</p>
          </div>

          <div className="space-y-8">
            {/* Project Overview */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Users className="h-6 w-6 mr-2 text-blue-600" />
                  项目概述
                </CardTitle>
              </CardHeader>
              <CardContent className="prose max-w-none">
                <p className="text-gray-700 leading-relaxed">
                  引体向上力量指数计划是一个社区驱动的开源项目，旨在通过收集和分析大量真实的引体向上数据，
                  建立一个科学、公平、透明的力量评估标准。项目的核心理念是让不同体重的训练者能够在同一标准下比较力量水平。
                </p>
                <div className="mt-4 grid md:grid-cols-2 gap-4">
                  <div className="bg-blue-50 p-4 rounded-lg">
                    <h4 className="font-semibold text-blue-800 mb-2">核心目标</h4>
                    <ul className="text-sm text-blue-700 space-y-1">
                      <li>• 建立体重标准化的力量评估体系</li>
                      <li>• 提供透明、可验证的计算方法</li>
                      <li>• 持续优化和改进评估公式</li>
                    </ul>
                  </div>
                  <div className="bg-green-50 p-4 rounded-lg">
                    <h4 className="font-semibold text-green-800 mb-2">社区价值</h4>
                    <ul className="text-sm text-green-700 space-y-1">
                      <li>• 每个人的数据都有价值</li>
                      <li>• 开放透明的数据处理过程</li>
                      <li>• 基于统计学的科学方法</li>
                    </ul>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Data Collection */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Database className="h-6 w-6 mr-2 text-green-600" />
                  数据收集与处理
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  <div>
                    <h4 className="font-semibold mb-3">数据收集标准</h4>
                    <div className="bg-gray-50 p-4 rounded-lg">
                      <p className="text-gray-700 mb-3">我们收集以下核心数据：</p>
                      <ul className="space-y-2 text-gray-700">
                        <li>
                          <strong>基础信息：</strong>性别、体重
                        </li>
                        <li>
                          <strong>成绩数据：</strong>附加负重、完成次数
                        </li>
                        <li>
                          <strong>质量评估：</strong>动作标准等级
                        </li>
                      </ul>
                    </div>
                  </div>

                  <div>
                    <h4 className="font-semibold mb-3">匿名化处理</h4>
                    <p className="text-gray-700">
                      所有提交的数据都经过严格的匿名化处理，我们不收集任何个人身份信息。
                      数据仅用于统计分析和公式优化，确保用户隐私安全。
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Quality Penalty System */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Shield className="h-6 w-6 mr-2 text-orange-600" />
                  动作质量惩罚机制
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <p className="text-gray-700">为确保数据质量和公式准确性，我们实施了基于动作标准的惩罚机制：</p>

                  <div className="grid md:grid-cols-2 gap-4">
                    <div className="space-y-3">
                      <div className="border-l-4 border-green-500 pl-4">
                        <h5 className="font-semibold text-green-700">比赛级标准</h5>
                        <p className="text-sm text-gray-600">动作完美，符合比赛要求</p>
                        <p className="text-sm font-medium">惩罚：0 kg</p>
                      </div>

                      <div className="border-l-4 border-yellow-500 pl-4">
                        <h5 className="font-semibold text-yellow-700">轻微借力</h5>
                        <p className="text-sm text-gray-600">少量借力完成动作</p>
                        <p className="text-sm font-medium">惩罚：2-5 kg（用户自评）</p>
                      </div>
                    </div>

                    <div className="space-y-3">
                      <div className="border-l-4 border-red-500 pl-4">
                        <h5 className="font-semibold text-red-700">严重借力</h5>
                        <p className="text-sm text-gray-600">明显借力完成动作</p>
                        <p className="text-sm font-medium">惩罚：5-20 kg（用户自评）</p>
                      </div>
                    </div>
                  </div>

                  <div className="bg-blue-50 p-4 rounded-lg">
                    <h5 className="font-semibold text-blue-800 mb-2">计算公式</h5>
                    <p className="font-mono text-sm text-blue-700">调整后负重 = 原始附加负重 - 惩罚重量</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* 1RM Estimation */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Calculator className="h-6 w-6 mr-2 text-purple-600" />
                  1RM估算方法 (V0.1)
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <p className="text-gray-700">
                    为了更准确地估算用户的1RM（一次最大重复），我们综合了三种广受认可的公式，并取其平均值。
                    这种方法可以有效减少单一公式在特定次数区间的偏差，提供更可靠的估算。
                  </p>
                  <p className="text-gray-700 font-medium">
                    特别地，当用户输入的完成次数为1次时，我们直接将 (自身体重 + 调整后附加负重)
                    作为其1RM，因为这本身就是1RM的定义。
                  </p>

                  <div className="bg-purple-50 p-6 rounded-lg">
                    <h4 className="font-semibold text-purple-800 mb-4">综合1RM估算公式</h4>
                    <ul className="font-mono text-sm md:text-base text-purple-700 space-y-2 text-left">
                      <li>
                        <strong>Epley:</strong> Total_1RM = Total_Weight × (1 + 0.0333 × Reps)
                      </li>
                      <li>
                        <strong>Brzycki:</strong> Total_1RM = Total_Weight × (36 / (37 - Reps))
                      </li>
                      <li>
                        <strong>Lombardi:</strong> Total_1RM = Total_Weight × (Reps ^ 0.1)
                      </li>
                      <li className="pt-2">
                        <strong>最终估算:</strong> (Epley_1RM + Brzycki_1RM + Lombardi_1RM) / 3
                      </li>
                    </ul>
                    <p className="text-xs text-purple-600 mt-3 text-left">
                      * Total_Weight = 自身体重 + 调整后附加负重
                    </p>
                    <p className="text-xs text-purple-600 mt-1 text-left">
                      * 页面显示的1RM为 <strong>负重1RM</strong> (Total_1RM - 自身体重)
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Performance Envelope & Coefficient Formula */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <BarChart3 className="h-6 w-6 mr-2 text-indigo-600" />
                  力量系数公式 (V0.1 - 初始版)
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  <div className="bg-gray-50 p-4 rounded-lg border text-center">
                    <p className="text-gray-800 leading-relaxed font-semibold">
                      本站采用的引体向上力量系数公式为世界首创，由北京大学博士生 <span className="text-indigo-600">枭马葛</span> 计算与提供。
                    </p>
                    <div className="mt-3">
                      <p className="text-sm text-gray-600">关注他的社交媒体，了解更多健身科学：</p>
                      <div className="flex flex-col sm:flex-row justify-center gap-2 mt-1">
                        <a
                          href="https://space.bilibili.com/495933903"
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-blue-500 hover:underline text-sm"
                        >
                          B站: 枭马葛的主页
                        </a>
                        <span className="hidden sm:inline text-gray-400">|</span>
                        <a
                          href="https://www.douyin.com/user/MS4wLjABAAAAy7udlkayIqU8bv2_78wy-WnexjBe0yqo1VoKwLlwCmee2p52Wzpdlf2zcoy8pJNm"
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-red-500 hover:underline text-sm"
                        >
                          抖音: 枭马葛的主页
                        </a>
                      </div>
                    </div>
                  </div>
                  <p className="text-gray-700">
                    力量系数 C(W) 是一个与体重相关的函数，旨在消除体重差异，使不同体重的训练者可以公平比较。
                  </p>
                  <Alert className="border-orange-200 bg-orange-50">
                    <AlertDescription className="text-orange-800">
                      <strong>V0.1版本说明：</strong>
                      当前的系数公式是基于少量世界顶尖运动员的数据生成的初始版本。它的意义在于为项目提供一个可运行的“冷启动”模型。随着社区数据的不断积累，我们将通过统计学方法（如下文所述的性能包络线提取）自动生成和迭代更精确的公式。
                    </AlertDescription>
                  </Alert>

                  <div className="bg-indigo-50 p-4 rounded-lg">
                    <h5 className="font-semibold text-indigo-800 mb-2">V0.1 系数公式 (4阶多项式)</h5>
                    <p className="font-mono text-sm text-indigo-700">
                      C(W) = a·W⁴ + b·W³ + c·W² + d·W + e
                    </p>
                    <p className="text-xs text-indigo-600 mt-2">
                      * W代表体重(kg)，a,b,c,d,e为拟合系数，男女有别。
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Final Score Calculation */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <TrendingUp className="h-6 w-6 mr-2 text-teal-600" />
                  最终力量分计算
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <p className="text-gray-700">
                    最终的力量分结合了您的最大力量（总重量1RM）和体重标准化系数C(W)，得出一个能够跨体重进行比较的综合分数。
                  </p>
                  <div className="bg-teal-50 p-6 rounded-lg text-center">
                    <h4 className="font-semibold text-teal-800 mb-4">力量分计算公式</h4>
                    <div className="font-mono text-lg text-teal-700 mb-2">力量分 = 总重量1RM × C(W)</div>
                    <p className="text-sm text-teal-600">
                      其中，总重量1RM = (自身体重 + 调整后附加负重) 的估算1RM
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Transparency & Trust */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Shield className="h-6 w-6 mr-2 text-green-600" />
                  透明度与信任
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <p className="text-gray-700">我们致力于建立一个完全透明、可信赖的力量评估系统：</p>

                  <div className="grid md:grid-cols-2 gap-6">
                    <div>
                      <h5 className="font-semibold mb-3 text-green-700">开放透明</h5>
                      <ul className="space-y-2 text-gray-700">
                        <li className="flex items-start">
                          <span className="text-green-500 mr-2">•</span>
                          <span>所有计算方法公开可查</span>
                        </li>
                        <li className="flex items-start">
                          <span className="text-green-500 mr-2">•</span>
                          <span>数据处理过程完全透明</span>
                        </li>
                        <li className="flex items-start">
                          <span className="text-green-500 mr-2">•</span>
                          <span>公式更新历史可追溯</span>
                        </li>
                        <li className="flex items-start">
                          <span className="text-green-500 mr-2">•</span>
                          <span>开源代码，社区监督</span>
                        </li>
                      </ul>
                    </div>

                    <div>
                      <h5 className="font-semibold mb-3 text-blue-700">质量保证</h5>
                      <ul className="space-y-2 text-gray-700">
                        <li className="flex items-start">
                          <span className="text-blue-500 mr-2">•</span>
                          <span>严格的数据验证机制</span>
                        </li>
                        <li className="flex items-start">
                          <span className="text-blue-500 mr-2">•</span>
                          <span>异常值检测和处理</span>
                        </li>
                        <li className="flex items-start">
                          <span className="text-blue-500 mr-2">•</span>
                          <span>多重统计验证方法</span>
                        </li>
                        <li className="flex items-start">
                          <span className="text-blue-500 mr-2">•</span>
                          <span>持续的算法优化</span>
                        </li>
                      </ul>
                    </div>
                  </div>

                  <div className="bg-yellow-50 p-4 rounded-lg border border-yellow-200">
                    <h5 className="font-semibold text-yellow-800 mb-2">社区参与</h5>
                    <p className="text-yellow-700 text-sm">
                      我们鼓励社区成员参与项目的改进和优化。如果您有任何建议或发现问题，
                      欢迎通过GitHub或其他渠道与我们联系。每个人的贡献都将推动项目向更好的方向发展。
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Support Project */}
            <DonationSection variant="page" className="mt-12" />
          </div>
        </div>
      </div>
    </div>
  )
}
