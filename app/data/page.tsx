"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { TrendingUp, ExternalLink, User, Video, Filter } from "lucide-react"
import Link from "next/link"
import { createClient } from "@supabase/supabase-js"
import { DonationSection } from "@/components/donation-section"
import { MobileNav } from "@/components/ui/mobile-nav"

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!)

interface Submission {
  id: string
  created_at: string
  gender: "Male" | "Female"
  bodyweight: number
  added_weight: number
  reps: number
  form_quality: "Competition" | "Good" | "Minor_Cheat" | "Major_Cheat"
  penalty_weight: number
  user_name: string | null
  video_url: string | null
  pullup_type: "Overhand" | "Underhand"
}

export default function DataPage() {
  const [submissions, setSubmissions] = useState<Submission[]>([])
  const [filteredSubmissions, setFilteredSubmissions] = useState<Submission[]>([])
  const [loading, setLoading] = useState(true)
  const [filters, setFilters] = useState({
    gender: "all",
    pullupType: "all",
    formQuality: "all",
    search: "",
  })

  useEffect(() => {
    fetchSubmissions()
  }, [])

  useEffect(() => {
    applyFilters()
  }, [submissions, filters])

  const fetchSubmissions = async () => {
    try {
      const { data, error } = await supabase.from("submissions").select("*").order("created_at", { ascending: false })

      if (error) throw error
      setSubmissions(data || [])
    } catch (error) {
      console.error("Error fetching submissions:", error)
    } finally {
      setLoading(false)
    }
  }

  const applyFilters = () => {
    let filtered = submissions

    if (filters.gender !== "all") {
      filtered = filtered.filter((sub) => sub.gender === filters.gender)
    }

    if (filters.pullupType !== "all") {
      filtered = filtered.filter((sub) => sub.pullup_type === filters.pullupType)
    }

    if (filters.formQuality !== "all") {
      filtered = filtered.filter((sub) => sub.form_quality === filters.formQuality)
    }

    if (filters.search) {
      filtered = filtered.filter((sub) => sub.user_name?.toLowerCase().includes(filters.search.toLowerCase()))
    }

    setFilteredSubmissions(filtered)
  }

  const getQualityColor = (quality: string) => {
    switch (quality) {
      case "Competition":
        return "bg-green-100 text-green-800"
      case "Minor_Cheat":
        return "bg-yellow-100 text-yellow-800"
      case "Major_Cheat":
        return "bg-red-100 text-red-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  const getQualityText = (quality: string) => {
    switch (quality) {
      case "Competition":
        return "比赛级"
      case "Minor_Cheat":
        return "轻微借力"
      case "Major_Cheat":
        return "严重借力"
      default:
        return quality
    }
  }

  const calculate1RM = (bodyweight: number, addedWeight: number, reps: number, penaltyWeight: number) => {
    const adjustedWeight = addedWeight - penaltyWeight
    const totalWeight = bodyweight + adjustedWeight

    // If reps is 1, the total weight is already the 1RM
    if (reps === 1) {
      return adjustedWeight // 直接返回调整后的负重
    }

    // The Brzycki formula is undefined for reps >= 37
    if (reps >= 37) {
      return 0 // 或者返回一个错误信息
    }

    // Calculate 1RM using three different formulas
    const epley1RM = totalWeight * (1 + 0.0333 * reps)
    const brzycki1RM = totalWeight * (36 / (37 - reps))
    const lombardi1RM = totalWeight * Math.pow(reps, 0.1)

    // Average the results for a more accurate 1RM
    const totalEstimated1RM = (epley1RM + brzycki1RM + lombardi1RM) / 3

    // Return the 1RM for added weight (subtract bodyweight)
    return totalEstimated1RM - bodyweight
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">加载数据中...</p>
        </div>
      </div>
    )
  }

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
              <Link href="/data" className="text-gray-900 hover:text-blue-600">
                社区数据
              </Link>
              <Link href="/methodology" className="text-gray-700 hover:text-blue-600">
                方法论
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
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-4">社区数据展示</h1>
            <p className="text-gray-600">查看社区成员分享的引体向上成绩和训练视频</p>
          </div>

          {/* Filters */}
          <Card className="mb-8">
            <CardHeader>
              <CardTitle className="flex items-center">
                <Filter className="h-5 w-5 mr-2" />
                数据筛选
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div>
                  <Select value={filters.gender} onValueChange={(value) => setFilters({ ...filters, gender: value })}>
                    <SelectTrigger>
                      <SelectValue placeholder="选择性别" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">全部性别</SelectItem>
                      <SelectItem value="Male">男性</SelectItem>
                      <SelectItem value="Female">女性</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Select
                    value={filters.pullupType}
                    onValueChange={(value) => setFilters({ ...filters, pullupType: value })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="引体类型" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">全部类型</SelectItem>
                      <SelectItem value="Overhand">正手</SelectItem>
                      <SelectItem value="Underhand">反手</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Select
                    value={filters.formQuality}
                    onValueChange={(value) => setFilters({ ...filters, formQuality: value })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="选择质量" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">全部质量</SelectItem>
                      <SelectItem value="Competition">比赛级</SelectItem>
                      <SelectItem value="Minor_Cheat">轻微借力</SelectItem>
                      <SelectItem value="Major_Cheat">严重借力</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Input
                    placeholder="搜索用户名..."
                    value={filters.search}
                    onChange={(e) => setFilters({ ...filters, search: e.target.value })}
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Statistics */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
            <Card>
              <CardContent className="p-4 text-center">
                <div className="text-2xl font-bold text-blue-600">{filteredSubmissions.length}</div>
                <p className="text-sm text-gray-600">筛选结果</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4 text-center">
                <div className="text-2xl font-bold text-green-600">
                  {filteredSubmissions.filter((s) => s.video_url).length}
                </div>
                <p className="text-sm text-gray-600">包含视频</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4 text-center">
                <div className="text-2xl font-bold text-purple-600">
                  {filteredSubmissions.filter((s) => s.pullup_type === "Overhand").length}
                </div>
                <p className="text-sm text-gray-600">正手引体</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4 text-center">
                <div className="text-2xl font-bold text-orange-600">
                  {filteredSubmissions.filter((s) => s.pullup_type === "Underhand").length}
                </div>
                <p className="text-sm text-gray-600">反手引体</p>
              </CardContent>
            </Card>
          </div>

          {/* Submissions Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredSubmissions.map((submission) => {
              const estimated1RM = calculate1RM(
                submission.bodyweight,
                submission.added_weight,
                submission.reps,
                submission.penalty_weight,
              )

              return (
                <Card key={submission.id} className="hover:shadow-lg transition-shadow">
                  <CardHeader className="pb-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        {submission.user_name ? (
                          <div className="flex items-center">
                            <User className="h-4 w-4 text-gray-500 mr-1" />
                            <span className="font-medium text-sm">{submission.user_name}</span>
                          </div>
                        ) : (
                          <span className="text-sm text-gray-500">匿名用户</span>
                        )}
                      </div>
                      <Badge
                        variant="outline"
                        className={submission.gender === "Male" ? "text-blue-600" : "text-pink-600"}
                      >
                        {submission.gender === "Male" ? "男" : "女"}
                      </Badge>
                    </div>
                    <div className="flex items-center justify-between">
                      <Badge className={getQualityColor(submission.form_quality)}>
                        {getQualityText(submission.form_quality)}
                      </Badge>
                      <Badge variant="outline">{submission.pullup_type === "Overhand" ? "正手" : "反手"}</Badge>
                    </div>
                  </CardHeader>

                  <CardContent className="space-y-3">
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <span className="text-gray-500">体重:</span>
                        <span className="ml-1 font-medium">{submission.bodyweight}kg</span>
                      </div>
                      <div>
                        <span className="text-gray-500">负重:</span>
                        <span className="ml-1 font-medium">{submission.added_weight}kg</span>
                      </div>
                      <div>
                        <span className="text-gray-500">次数:</span>
                        <span className="ml-1 font-medium">{submission.reps}次</span>
                      </div>
                      <div>
                        <span className="text-gray-500">估算1RM:</span>
                        <span className="ml-1 font-medium">{estimated1RM.toFixed(1)}kg</span>
                      </div>
                    </div>

                    {submission.penalty_weight > 0 && (
                      <div className="text-xs text-orange-600 bg-orange-50 p-2 rounded">
                        惩罚重量: -{submission.penalty_weight}kg
                      </div>
                    )}

                    {submission.video_url && (
                      <div className="pt-2">
                        <Button
                          variant="outline"
                          size="sm"
                          className="w-full bg-transparent"
                          onClick={() => window.open(submission.video_url!, "_blank")}
                        >
                          <Video className="h-4 w-4 mr-2" />
                          观看训练视频
                          <ExternalLink className="h-3 w-3 ml-2" />
                        </Button>
                      </div>
                    )}

                    <div className="text-xs text-gray-500 pt-2 border-t">
                      提交时间: {new Date(submission.created_at).toLocaleDateString("zh-CN")}
                    </div>
                  </CardContent>
                </Card>
              )
            })}
          </div>

          {filteredSubmissions.length === 0 && (
            <div className="text-center py-12">
              <div className="text-gray-500 mb-4">
                <Filter className="h-12 w-12 mx-auto opacity-50" />
              </div>
              <p className="text-gray-500">没有找到符合条件的数据</p>
              <Button
                variant="outline"
                className="mt-4 bg-transparent"
                onClick={() => setFilters({ gender: "all", pullupType: "all", formQuality: "all", search: "" })}
              >
                清除筛选条件
              </Button>
            </div>
          )}
        </div>
      </div>

      {/* Donation Section */}
      <DonationSection variant="footer" />
    </div>
  )
}
