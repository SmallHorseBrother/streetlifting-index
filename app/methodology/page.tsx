import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { TrendingUp, Database, Calculator, BarChart3, Users, Shield } from "lucide-react"
import Link from "next/link"
import { DonationSection } from "@/components/donation-section"

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
            <div className="flex items-center space-x-8">
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
                    <h4 className="font-semibold mb-3">匿名化处��</h4>
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

                      <div className="border-l-4 border-blue-500 pl-4">
                        <h5 className="font-semibold text-blue-700">良好标准</h5>
                        <p className="text-sm text-gray-600">动作干净，但未达到比赛严苛程度</p>
                        <p className="text-sm font-medium">惩罚：0 kg</p>
                      </div>
                    </div>

                    <div className="space-y-3">
                      <div className="border-l-4 border-yellow-500 pl-4">
                        <h5 className="font-semibold text-yellow-700">轻微借力</h5>
                        <p className="text-sm text-gray-600">少量借力完成动作</p>
                        <p className="text-sm font-medium">惩罚：2-5 kg（用户自评）</p>
                      </div>

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
                  1RM估算方法
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <p className="text-gray-700">我们使用经典的Epley公式来估算用户的1RM（一次最大重复）：</p>

                  <div className="bg-purple-50 p-6 rounded-lg text-center">
                    <h4 className="font-semibold text-purple-800 mb-4">Epley 1RM估算公式</h4>
                    <div className="font-mono text-lg text-purple-700 mb-2">1RM = 负重 × (1 + 次数 ÷ 30)</div>
                    <p className="text-sm text-purple-600">其中负重 = 体重 + 调整后附加负重</p>
                  </div>

                  <div className="grid md:grid-cols-2 gap-4 mt-4">
                    <div className="bg-gray-50 p-4 rounded-lg">
                      <h5 className="font-semibold mb-2">公式优势</h5>
                      <ul className="text-sm text-gray-700 space-y-1">
                        <li>• 广泛验证的科学方法</li>
                        <li>• 适用于中等次数范围</li>
                        <li>• 计算简单，易于理解</li>
                      </ul>
                    </div>
                    <div className="bg-gray-50 p-4 rounded-lg">
                      <h5 className="font-semibold mb-2">应用范围</h5>
                      <ul className="text-sm text-gray-700 space-y-1">
                        <li>• 最适用于1-10次范围</li>
                        <li>• 考虑了动作质量因素</li>
                        <li>• 结合体重进行标准化</li>
                      </ul>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Performance Envelope */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <BarChart3 className="h-6 w-6 mr-2 text-indigo-600" />
                  性能包络线提取
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <p className="text-gray-700">性能包络线代表了不同体重下的理论最大拉力，是计算力量系数的基础：</p>

                  <div className="space-y-4">
                    <div className="bg-indigo-50 p-4 rounded-lg">
                      <h5 className="font-semibold text-indigo-800 mb-2">提取步骤</h5>
                      <ol className="text-sm text-indigo-700 space-y-2">
                        <li>
                          <strong>1. 数据分箱：</strong>按体重区间（如5kg为一组）对数据进行分组
                        </li>
                        <li>
                          <strong>2. 百分位提取：</strong>在每个体重区间内提取99百分位的1RM数据
                        </li>
                        <li>
                          <strong>3. LOESS平滑：</strong>使用局部回归对数据点进行平滑处理
                        </li>
                        <li>
                          <strong>4. 包络线生成：</strong>得到连续的T_max(W)函数
                        </li>
                      </ol>
                    </div>

                    <div className="grid md:grid-cols-2 gap-4">
                      <div className="bg-gray-50 p-4 rounded-lg">
                        <h5 className="font-semibold mb-2">统计学原理</h5>
                        <p className="text-sm text-gray-700">
                          99百分位确保我们捕获的是真正的高水平表现，而不是异常值。
                          LOESS平滑则保证了曲线的连续性和合理性。
                        </p>
                      </div>
                      <div className="bg-gray-50 p-4 rounded-lg">
                        <h5 className="font-semibold mb-2">实际意义</h5>
                        <p className="text-sm text-gray-700">
                          性能包络线反映了不同体重下的理论最大潜力， 为建立公平的力量比较标准提供了科学依据。
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Coefficient Formula */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Calculator className="h-6 w-6 mr-2 text-red-600" />
                  系数公式推导
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <p className="text-gray-700">力量系数的核心思想是标准化不同体重下的力量表现：</p>

                  <div className="bg-red-50 p-6 rounded-lg">
                    <h4 className="font-semibold text-red-800 mb-4 text-center">力量系数公式</h4>
                    <div className="font-mono text-lg text-red-700 text-center mb-4">C(W) = 500 ÷ T_max(W)</div>
                    <div className="text-center">
                      <p className="text-sm text-red-600 mb-2">最终力量分 = 用户1RM × C(体重)</p>
                      <p className="text-xs text-red-500">其中500是标准化常数，T_max(W)是体重W下的性能包络线值</p>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <div>
                      <h5 className="font-semibold mb-2">多项式拟合</h5>
                      <p className="text-gray-700 mb-3">为了便于计算和存储，我们将C(W)函数拟合为5阶多项式：</p>
                      <div className="bg-gray-50 p-4 rounded-lg font-mono text-sm">
                        C(W) = a×W⁵ + b×W⁴ + c×W³ + d×W² + e×W + f
                      </div>
                    </div>

                    <div className="grid md:grid-cols-2 gap-4">
                      <div className="bg-gray-50 p-4 rounded-lg">
                        <h5 className="font-semibold mb-2">设计理念</h5>
                        <ul className="text-sm text-gray-700 space-y-1">
                          <li>• 体重越轻，系数越大</li>
                          <li>• 体重越重，系数越小</li>
                          <li>• 反映生理学规律</li>
                          <li>• 实现公平比较</li>
                        </ul>
                      </div>
                      <div className="bg-gray-50 p-4 rounded-lg">
                        <h5 className="font-semibold mb-2">更新机制</h5>
                        <ul className="text-sm text-gray-700 space-y-1">
                          <li>• 定期自动更新</li>
                          <li>• 基于最新数据</li>
                          <li>• 分性别独立计算</li>
                          <li>• 版本控制追踪</li>
                        </ul>
                      </div>
                    </div>
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
