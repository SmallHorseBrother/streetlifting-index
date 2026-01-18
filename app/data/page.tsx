"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Slider } from "@/components/ui/slider"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import {
  TrendingUp,
  ExternalLink,
  User,
  Video,
  Filter,
  LayoutGrid,
  List,
  AlertTriangle,
  CheckCircle,
  Plus,
  X,
  SlidersHorizontal,
} from "lucide-react"
import Link from "next/link"
import { createClient } from "@supabase/supabase-js"
import { BottomNav } from "@/components/BottomNav"
import { SiteHeader } from "@/components/SiteHeader"

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!)

interface FormulaCoefficients {
  coeff_a: number
  coeff_b: number
  coeff_c: number
  coeff_d: number
  coeff_e: number
  coeff_f: number
}

interface Submission {
  id: string
  created_at: string
  gender: "Male" | "Female"
  bodyweight: number
  added_weight: number
  reps: number
  form_quality: "Competition" | "Good" | "Minor_Cheat" | "Major_Cheat" | "Extreme_Cheat"
  penalty_weight: number
  user_name: string | null
  video_url: string | null
  pullup_type: "Overhand" | "Underhand" | null
  exercise_type: "weighted_pullup" | "weighted_dips"
}

export default function DataCommunityPage() {
  // ========== 数据提交相关状态 ==========
  const [formData, setFormData] = useState({
    gender: "",
    bodyweight: "",
    addedWeight: "",
    reps: "",
    formQuality: "",
    penaltyWeight: 3,
    userName: "",
    videoUrl: "",
    pullupType: "",
    exerciseType: "weighted_pullup",
  })
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitSuccess, setSubmitSuccess] = useState(false)
  const [submitError, setSubmitError] = useState("")
  const [isFormOpen, setIsFormOpen] = useState(false)
  const [isFilterOpen, setIsFilterOpen] = useState(false)

  // ========== 数据展示相关状态 ==========
  const [submissions, setSubmissions] = useState<Submission[]>([])
  const [filteredSubmissions, setFilteredSubmissions] = useState<Submission[]>([])
  const [loading, setLoading] = useState(true)
  const [formulas, setFormulas] = useState<{ Male?: FormulaCoefficients; Female?: FormulaCoefficients }>({})
  const [filters, setFilters] = useState({
    gender: "all",
    pullupType: "all",
    formQuality: "all",
    hasVideo: "all",
    search: "",
    exerciseType: "all",
  })
  const [sortBy, setSortBy] = useState<"date" | "weight" | "score">("weight")
  const [viewMode, setViewMode] = useState<"cards" | "table">("cards")

  useEffect(() => {
    fetchSubmissions()
    fetchFormulas()
  }, [])

  useEffect(() => {
    applyFiltersAndSort()
  }, [submissions, filters, sortBy, formulas])

  useEffect(() => {
    if (submitSuccess) {
      const timer = setTimeout(() => setSubmitSuccess(false), 5000)
      return () => clearTimeout(timer)
    }
  }, [submitSuccess])

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

  const fetchFormulas = async () => {
    try {
      const { data, error } = await supabase.from("formulas").select("*")
      if (error) throw error
      const formulaMap: { Male?: FormulaCoefficients; Female?: FormulaCoefficients } = {}
      data?.forEach((formula) => {
        formulaMap[formula.gender as "Male" | "Female"] = formula
      })
      setFormulas(formulaMap)
    } catch (err) {
      console.error("Error fetching formulas:", err)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    setSubmitError("")

    try {
      const { error: submitErr } = await supabase.from("submissions").insert([
        {
          gender: formData.gender,
          bodyweight: Number.parseFloat(formData.bodyweight),
          added_weight: Number.parseFloat(formData.addedWeight),
          reps: Number.parseInt(formData.reps),
          form_quality: formData.formQuality,
          penalty_weight: ["Minor_Cheat", "Major_Cheat"].includes(formData.formQuality) ? formData.penaltyWeight : 0,
          user_name: formData.userName || null,
          video_url: formData.videoUrl || null,
          pullup_type: formData.exerciseType === "weighted_pullup" ? formData.pullupType : null,
          exercise_type: formData.exerciseType,
        },
      ])

      if (submitErr) throw submitErr

      setSubmitSuccess(true)
      setIsFormOpen(false)
      setFormData({
        gender: "",
        bodyweight: "",
        addedWeight: "",
        reps: "",
        formQuality: "",
        penaltyWeight: 3,
        userName: "",
        videoUrl: "",
        pullupType: "",
        exerciseType: "weighted_pullup",
      })
      fetchSubmissions()
    } catch (err) {
      setSubmitError("提交失败，请稍后重试")
      console.error("Submission error:", err)
    } finally {
      setIsSubmitting(false)
    }
  }

  const showPenaltySlider = ["Minor_Cheat", "Major_Cheat", "Extreme_Cheat"].includes(formData.formQuality)
  const penaltyRange =
    formData.formQuality === "Minor_Cheat"
      ? [2, 5]
      : formData.formQuality === "Major_Cheat"
        ? [5, 20]
        : [20, 50]

  const computeCoefficient = (W: number, formula: FormulaCoefficients) => {
    return (
      formula.coeff_b * Math.pow(W, 4) +
      formula.coeff_c * Math.pow(W, 3) +
      formula.coeff_d * Math.pow(W, 2) +
      formula.coeff_e * W +
      formula.coeff_f
    )
  }

  const calculate1RM = (bodyweight: number, addedWeight: number, reps: number, penaltyWeight: number) => {
    const adjustedWeight = addedWeight - penaltyWeight
    const totalWeight = bodyweight + adjustedWeight
    if (reps === 1) return adjustedWeight
    if (reps >= 37) return 0
    const epley1RM = totalWeight * (1 + 0.0333 * reps)
    const brzycki1RM = totalWeight * (36 / (37 - reps))
    const lombardi1RM = totalWeight * Math.pow(reps, 0.1)
    return (epley1RM + brzycki1RM + lombardi1RM) / 3 - bodyweight
  }

  const calculateScore = (submission: Submission) => {
    const formula = formulas[submission.gender]
    if (!formula) return 0
    const adjustedWeight = submission.added_weight - submission.penalty_weight
    const totalWeight = submission.bodyweight + adjustedWeight
    let totalEstimated1RM: number
    if (submission.reps === 1) {
      totalEstimated1RM = totalWeight
    } else if (submission.reps >= 37) {
      return 0
    } else {
      const epley1RM = totalWeight * (1 + 0.0333 * submission.reps)
      const brzycki1RM = totalWeight * (36 / (37 - submission.reps))
      const lombardi1RM = totalWeight * Math.pow(submission.reps, 0.1)
      totalEstimated1RM = (epley1RM + brzycki1RM + lombardi1RM) / 3
    }
    const coefficient = computeCoefficient(submission.bodyweight, formula)
    let score = totalEstimated1RM * coefficient
    if (submission.exercise_type === "weighted_dips") {
      score = score / 1.3
    }
    return score
  }

  const applyFiltersAndSort = () => {
    let filtered = [...submissions]
    if (filters.exerciseType !== "all") {
      filtered = filtered.filter((sub) => sub.exercise_type === filters.exerciseType)
    }
    if (filters.gender !== "all") {
      filtered = filtered.filter((sub) => sub.gender === filters.gender)
    }
    if (filters.pullupType !== "all") {
      filtered = filtered.filter((sub) => sub.pullup_type === filters.pullupType)
    }
    if (filters.formQuality !== "all") {
      filtered = filtered.filter((sub) => sub.form_quality === filters.formQuality)
    }
    if (filters.hasVideo !== "all") {
      if (filters.hasVideo === "with_video") {
        filtered = filtered.filter((sub) => sub.video_url !== null && sub.video_url !== "")
      } else if (filters.hasVideo === "without_video") {
        filtered = filtered.filter((sub) => sub.video_url === null || sub.video_url === "")
      }
    }
    if (filters.search) {
      filtered = filtered.filter((sub) => sub.user_name?.toLowerCase().includes(filters.search.toLowerCase()))
    }
    if (sortBy === "weight") {
      filtered.sort((a, b) => {
        const aRM = calculate1RM(a.bodyweight, a.added_weight, a.reps, a.penalty_weight)
        const bRM = calculate1RM(b.bodyweight, b.added_weight, b.reps, b.penalty_weight)
        return bRM - aRM
      })
    } else if (sortBy === "score") {
      filtered.sort((a, b) => calculateScore(b) - calculateScore(a))
    } else {
      filtered.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
    }
    setFilteredSubmissions(filtered)
  }

  const getQualityColor = (quality: string) => {
    switch (quality) {
      case "Competition": return "bg-green-100 text-green-800"
      case "Minor_Cheat": return "bg-yellow-100 text-yellow-800"
      case "Major_Cheat": return "bg-red-100 text-red-800"
      case "Extreme_Cheat": return "bg-red-200 text-red-900"
      default: return "bg-gray-100 text-gray-800"
    }
  }

  const getQualityText = (quality: string) => {
    switch (quality) {
      case "Competition": return "比赛级"
      case "Minor_Cheat": return "轻微借力"
      case "Major_Cheat": return "严重借力"
      case "Extreme_Cheat": return "超严重借力"
      default: return quality
    }
  }

  const getExerciseTypeText = (type: string) => {
    return type === "weighted_pullup" ? "负重引体" : "负重臂屈伸"
  }

  const activeFiltersCount = Object.entries(filters).filter(([key, value]) => 
    key !== "search" && value !== "all"
  ).length

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-600 mx-auto mb-3"></div>
          <p className="text-gray-600 text-sm">加载数据中...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* 桌面端显示顶部导航 */}
      <div className="hidden md:block">
        <SiteHeader currentPage="data" />
      </div>

      {/* 移动端App风格头部 */}
      <header className="md:hidden sticky top-0 z-40 bg-white border-b border-gray-100">
        <div className="flex items-center justify-between px-4 h-14">
          <h1 className="text-lg font-bold text-gray-900">数据提交与社区</h1>
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="sm"
              className="relative"
              onClick={() => setIsFilterOpen(true)}
            >
              <SlidersHorizontal className="h-5 w-5" />
              {activeFiltersCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-blue-600 text-white text-[10px] rounded-full h-4 w-4 flex items-center justify-center">
                  {activeFiltersCount}
                </span>
              )}
            </Button>
            <Button
              variant={viewMode === "cards" ? "default" : "ghost"}
              size="sm"
              onClick={() => setViewMode(viewMode === "cards" ? "table" : "cards")}
            >
              {viewMode === "cards" ? <LayoutGrid className="h-5 w-5" /> : <List className="h-5 w-5" />}
            </Button>
          </div>
        </div>
      </header>

      {/* 主要内容区域 */}
      <main className="pb-20 md:pb-8">
        {/* 桌面端标题 */}
        <div className="hidden md:block py-8 px-4 sm:px-6 lg:px-8">
          <div className="max-w-7xl mx-auto text-center">
            <h1 className="text-3xl font-bold text-gray-900 mb-4">数据提交与社区数据</h1>
            <p className="text-gray-600">查看社区成员分享的训练成绩，或提交您的数据为社区贡献力量</p>
          </div>
        </div>

        <div className="px-3 md:px-4 sm:px-6 lg:px-8 md:max-w-7xl md:mx-auto">
          {/* 提交成功提示 */}
          {submitSuccess && (
            <Alert className="mb-3 border-green-200 bg-green-50 mx-0">
              <CheckCircle className="h-4 w-4 text-green-600" />
              <AlertDescription className="text-green-800 text-sm">
                🎉 数据提交成功！感谢您的贡献。
              </AlertDescription>
            </Alert>
          )}

          {/* 移动端统计条 */}
          <div className="md:hidden flex gap-2 overflow-x-auto py-3 -mx-3 px-3 scrollbar-hide">
            <div className="flex-shrink-0 bg-white rounded-xl px-4 py-3 shadow-sm border border-gray-100">
              <div className="text-xl font-bold text-blue-600">{filteredSubmissions.length}</div>
              <div className="text-xs text-gray-500">总数据</div>
            </div>
            <div className="flex-shrink-0 bg-white rounded-xl px-4 py-3 shadow-sm border border-gray-100">
              <div className="text-xl font-bold text-green-600">
                {filteredSubmissions.filter((s) => s.video_url).length}
              </div>
              <div className="text-xs text-gray-500">有视频</div>
            </div>
            <div className="flex-shrink-0 bg-white rounded-xl px-4 py-3 shadow-sm border border-gray-100">
              <div className="text-xl font-bold text-purple-600">
                {filteredSubmissions.filter((s) => s.exercise_type === "weighted_pullup").length}
              </div>
              <div className="text-xs text-gray-500">引体</div>
            </div>
            <div className="flex-shrink-0 bg-white rounded-xl px-4 py-3 shadow-sm border border-gray-100">
              <div className="text-xl font-bold text-orange-600">
                {filteredSubmissions.filter((s) => s.exercise_type === "weighted_dips").length}
              </div>
              <div className="text-xs text-gray-500">臂屈伸</div>
            </div>
          </div>

          {/* 桌面端筛选和统计区域 */}
          <div className="hidden md:block space-y-6 mb-8">
            {/* 桌面端数据提交区域 */}
            <Card>
              <CardHeader 
                className="cursor-pointer hover:bg-gray-50 transition-colors"
                onClick={() => setIsFormOpen(!isFormOpen)}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Plus className="h-5 w-5 text-blue-600" />
                    <CardTitle>提交我的数据</CardTitle>
                  </div>
                  <span className="text-sm text-gray-500">
                    {isFormOpen ? "点击收起" : "点击展开表单"}
                  </span>
                </div>
                <CardDescription>
                  感谢您为社区贡献数据！您的每一次提交都将帮助我们建立更准确的力量评估标准。
                </CardDescription>
              </CardHeader>
              {isFormOpen && (
                <CardContent>
                  <SubmissionForm
                    formData={formData}
                    setFormData={setFormData}
                    handleSubmit={handleSubmit}
                    isSubmitting={isSubmitting}
                    submitError={submitError}
                    showPenaltySlider={showPenaltySlider}
                    penaltyRange={penaltyRange}
                  />
                </CardContent>
              )}
            </Card>

            {/* 桌面端筛选 */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <span className="flex items-center">
                    <Filter className="h-5 w-5 mr-2" />
                    数据筛选与排序
                  </span>
                  <div className="flex items-center gap-2">
                    <Button
                      variant={viewMode === "cards" ? "default" : "outline"}
                      size="sm"
                      onClick={() => setViewMode("cards")}
                    >
                      <LayoutGrid className="h-4 w-4" />
                    </Button>
                    <Button
                      variant={viewMode === "table" ? "default" : "outline"}
                      size="sm"
                      onClick={() => setViewMode("table")}
                    >
                      <List className="h-4 w-4" />
                    </Button>
                  </div>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <FilterSection filters={filters} setFilters={setFilters} sortBy={sortBy} setSortBy={setSortBy} />
              </CardContent>
            </Card>

            {/* 桌面端统计 */}
            <div className="grid grid-cols-4 gap-4">
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
                    {filteredSubmissions.filter((s) => s.exercise_type === "weighted_pullup").length}
                  </div>
                  <p className="text-sm text-gray-600">负重引体</p>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-4 text-center">
                  <div className="text-2xl font-bold text-orange-600">
                    {filteredSubmissions.filter((s) => s.exercise_type === "weighted_dips").length}
                  </div>
                  <p className="text-sm text-gray-600">负重臂屈伸</p>
                </CardContent>
              </Card>
            </div>
          </div>

          {/* 数据列表 - 移动端卡片视图 */}
          {viewMode === "cards" && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 md:gap-6">
              {filteredSubmissions.map((submission) => {
                const estimated1RM = calculate1RM(
                  submission.bodyweight,
                  submission.added_weight,
                  submission.reps,
                  submission.penalty_weight,
                )
                const score = calculateScore(submission)

                return (
                  <Card key={submission.id} className="bg-white shadow-sm border-gray-100 overflow-hidden">
                    <CardContent className="p-4">
                      {/* 用户信息行 */}
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center gap-2">
                          <div className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center">
                            <User className="h-4 w-4 text-gray-500" />
                          </div>
                          <div>
                            <div className="font-medium text-sm">
                              {submission.user_name || "匿名用户"}
                            </div>
                            <div className="text-xs text-gray-400">
                              {new Date(submission.created_at).toLocaleDateString("zh-CN")}
                            </div>
                          </div>
                        </div>
                        <Badge
                          variant="outline"
                          className={submission.gender === "Male" ? "text-blue-600 border-blue-200" : "text-pink-600 border-pink-200"}
                        >
                          {submission.gender === "Male" ? "男" : "女"}
                        </Badge>
                      </div>

                      {/* 标签 */}
                      <div className="flex flex-wrap gap-1.5 mb-3">
                        <Badge variant="outline" className={submission.exercise_type === "weighted_pullup" ? "text-blue-600 border-blue-200" : "text-orange-600 border-orange-200"}>
                          {getExerciseTypeText(submission.exercise_type)}
                        </Badge>
                        {submission.exercise_type === "weighted_pullup" && submission.pullup_type && (
                          <Badge variant="outline" className="border-gray-200">
                            {submission.pullup_type === "Overhand" ? "正手" : "反手"}
                          </Badge>
                        )}
                        <Badge className={getQualityColor(submission.form_quality)}>
                          {getQualityText(submission.form_quality)}
                        </Badge>
                      </div>

                      {/* 数据展示 */}
                      <div className="grid grid-cols-4 gap-2 text-center mb-3">
                        <div className="bg-gray-50 rounded-lg p-2">
                          <div className="text-xs text-gray-500">体重</div>
                          <div className="font-semibold text-sm">{submission.bodyweight}kg</div>
                        </div>
                        <div className="bg-gray-50 rounded-lg p-2">
                          <div className="text-xs text-gray-500">负重</div>
                          <div className="font-semibold text-sm">{submission.added_weight}kg</div>
                        </div>
                        <div className="bg-gray-50 rounded-lg p-2">
                          <div className="text-xs text-gray-500">次数</div>
                          <div className="font-semibold text-sm">{submission.reps}</div>
                        </div>
                        <div className="bg-gray-50 rounded-lg p-2">
                          <div className="text-xs text-gray-500">1RM</div>
                          <div className="font-semibold text-sm">{estimated1RM.toFixed(1)}</div>
                        </div>
                      </div>

                      {/* 力量分 */}
                      <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg p-3 text-center mb-3">
                        <span className="text-gray-600 text-sm">力量分 </span>
                        <span className="font-bold text-xl text-blue-600">{score.toFixed(1)}</span>
                      </div>

                      {/* 惩罚重量 */}
                      {submission.penalty_weight > 0 && (
                        <div className="text-xs text-orange-600 bg-orange-50 p-2 rounded-lg mb-3 text-center">
                          惩罚重量: -{submission.penalty_weight}kg
                        </div>
                      )}

                      {/* 视频按钮 */}
                      {submission.video_url && (
                        <Button
                          variant="outline"
                          size="sm"
                          className="w-full"
                          onClick={() => window.open(submission.video_url!, "_blank")}
                        >
                          <Video className="h-4 w-4 mr-2" />
                          观看训练视频
                          <ExternalLink className="h-3 w-3 ml-2" />
                        </Button>
                      )}
                    </CardContent>
                  </Card>
                )
              })}
            </div>
          )}

          {/* 表格视图 */}
          {viewMode === "table" && filteredSubmissions.length > 0 && (
            <Card className="overflow-hidden">
              <CardContent className="p-0 overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-12">#</TableHead>
                      <TableHead>用户</TableHead>
                      <TableHead>类型</TableHead>
                      <TableHead>体重</TableHead>
                      <TableHead>负重</TableHead>
                      <TableHead>次数</TableHead>
                      <TableHead>1RM</TableHead>
                      <TableHead>力量分</TableHead>
                      <TableHead>视频</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredSubmissions.map((submission, index) => {
                      const estimated1RM = calculate1RM(
                        submission.bodyweight,
                        submission.added_weight,
                        submission.reps,
                        submission.penalty_weight,
                      )
                      const score = calculateScore(submission)
                      return (
                        <TableRow key={submission.id}>
                          <TableCell className="font-medium">{index + 1}</TableCell>
                          <TableCell>
                            <span className="text-sm">{submission.user_name || "匿名"}</span>
                          </TableCell>
                          <TableCell>
                            <Badge variant="outline" className="text-xs">
                              {getExerciseTypeText(submission.exercise_type)}
                            </Badge>
                          </TableCell>
                          <TableCell>{submission.bodyweight}</TableCell>
                          <TableCell>{submission.added_weight}</TableCell>
                          <TableCell>{submission.reps}</TableCell>
                          <TableCell className="font-medium">{estimated1RM.toFixed(1)}</TableCell>
                          <TableCell className="font-medium text-blue-600">{score.toFixed(1)}</TableCell>
                          <TableCell>
                            {submission.video_url ? (
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => window.open(submission.video_url!, "_blank")}
                              >
                                <Video className="h-4 w-4" />
                              </Button>
                            ) : (
                              <span className="text-gray-400">-</span>
                            )}
                          </TableCell>
                        </TableRow>
                      )
                    })}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          )}

          {filteredSubmissions.length === 0 && (
            <div className="text-center py-12">
              <Filter className="h-12 w-12 mx-auto opacity-30 mb-4" />
              <p className="text-gray-500 mb-4">没有找到符合条件的数据</p>
              <Button
                variant="outline"
                onClick={() => setFilters({ gender: "all", pullupType: "all", formQuality: "all", hasVideo: "all", search: "", exerciseType: "all" })}
              >
                清除筛选条件
              </Button>
            </div>
          )}
        </div>
      </main>

      {/* 移动端浮动添加按钮 - 独立放置确保显示 */}
      <Button
        className="md:hidden fixed right-5 bottom-24 z-50 h-16 w-16 rounded-full shadow-xl bg-gradient-to-br from-blue-500 to-blue-700 hover:from-blue-600 hover:to-blue-800 border-4 border-white"
        size="icon"
        onClick={() => setIsFormOpen(true)}
      >
        <Plus className="h-8 w-8 text-white" />
      </Button>

      {/* 移动端数据提交抽屉 */}
      <Sheet open={isFormOpen} onOpenChange={setIsFormOpen}>
        <SheetContent side="bottom" className="h-[90vh] rounded-t-3xl">
          <SheetHeader className="pb-4">
            <SheetTitle>提交我的数据</SheetTitle>
          </SheetHeader>
          <div className="overflow-y-auto h-[calc(100%-60px)] pb-8">
            <Alert className="mb-4 border-orange-200 bg-orange-50">
              <AlertTriangle className="h-4 w-4 text-orange-600" />
              <AlertDescription className="text-orange-800 text-sm">
                请诚实评估动作质量，这将影响社区评估标准。
              </AlertDescription>
            </Alert>
            <SubmissionForm
              formData={formData}
              setFormData={setFormData}
              handleSubmit={handleSubmit}
              isSubmitting={isSubmitting}
              submitError={submitError}
              showPenaltySlider={showPenaltySlider}
              penaltyRange={penaltyRange}
            />
          </div>
        </SheetContent>
      </Sheet>

      {/* 移动端筛选抽屉 */}
      <Sheet open={isFilterOpen} onOpenChange={setIsFilterOpen}>
        <SheetContent side="bottom" className="h-[70vh] rounded-t-3xl">
          <SheetHeader className="pb-4">
            <SheetTitle className="flex items-center justify-between">
              <span>筛选与排序</span>
              {activeFiltersCount > 0 && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    setFilters({ gender: "all", pullupType: "all", formQuality: "all", hasVideo: "all", search: "", exerciseType: "all" })
                  }}
                >
                  重置全部
                </Button>
              )}
            </SheetTitle>
          </SheetHeader>
          <div className="overflow-y-auto h-[calc(100%-80px)] pb-8">
            <FilterSection filters={filters} setFilters={setFilters} sortBy={sortBy} setSortBy={setSortBy} />
            <Button className="w-full mt-6" onClick={() => setIsFilterOpen(false)}>
              应用筛选
            </Button>
          </div>
        </SheetContent>
      </Sheet>

      {/* 底部导航 - 仅移动端 */}
      <BottomNav />
    </div>
  )
}

// 筛选区域组件
function FilterSection({ filters, setFilters, sortBy, setSortBy }: {
  filters: any
  setFilters: (f: any) => void
  sortBy: "date" | "weight" | "score"
  setSortBy: (s: "date" | "weight" | "score") => void
}) {
  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-3">
        <div>
          <Label className="text-xs text-gray-500 mb-1.5 block">运动类型</Label>
          <Select value={filters.exerciseType} onValueChange={(value) => setFilters({ ...filters, exerciseType: value })}>
            <SelectTrigger>
              <SelectValue placeholder="全部运动" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">全部运动</SelectItem>
              <SelectItem value="weighted_pullup">负重引体</SelectItem>
              <SelectItem value="weighted_dips">负重臂屈伸</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div>
          <Label className="text-xs text-gray-500 mb-1.5 block">性别</Label>
          <Select value={filters.gender} onValueChange={(value) => setFilters({ ...filters, gender: value })}>
            <SelectTrigger>
              <SelectValue placeholder="全部性别" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">全部性别</SelectItem>
              <SelectItem value="Male">男性</SelectItem>
              <SelectItem value="Female">女性</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div>
          <Label className="text-xs text-gray-500 mb-1.5 block">引体类型</Label>
          <Select value={filters.pullupType} onValueChange={(value) => setFilters({ ...filters, pullupType: value })}>
            <SelectTrigger>
              <SelectValue placeholder="全部类型" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">全部类型</SelectItem>
              <SelectItem value="Overhand">正手</SelectItem>
              <SelectItem value="Underhand">反手</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div>
          <Label className="text-xs text-gray-500 mb-1.5 block">动作质量</Label>
          <Select value={filters.formQuality} onValueChange={(value) => setFilters({ ...filters, formQuality: value })}>
            <SelectTrigger>
              <SelectValue placeholder="全部质量" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">全部质量</SelectItem>
              <SelectItem value="Competition">比赛级</SelectItem>
              <SelectItem value="Minor_Cheat">轻微借力</SelectItem>
              <SelectItem value="Major_Cheat">严重借力</SelectItem>
              <SelectItem value="Extreme_Cheat">超严重借力</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div>
          <Label className="text-xs text-gray-500 mb-1.5 block">视频</Label>
          <Select value={filters.hasVideo} onValueChange={(value) => setFilters({ ...filters, hasVideo: value })}>
            <SelectTrigger>
              <SelectValue placeholder="全部" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">全部</SelectItem>
              <SelectItem value="with_video">有视频</SelectItem>
              <SelectItem value="without_video">无视频</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div>
          <Label className="text-xs text-gray-500 mb-1.5 block">排序方式</Label>
          <Select value={sortBy} onValueChange={(value: "date" | "weight" | "score") => setSortBy(value)}>
            <SelectTrigger>
              <SelectValue placeholder="排序方式" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="date">按时间</SelectItem>
              <SelectItem value="weight">按重量</SelectItem>
              <SelectItem value="score">按力量分</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>
      <div>
        <Label className="text-xs text-gray-500 mb-1.5 block">搜索用户</Label>
        <Input
          placeholder="搜索用户名..."
          value={filters.search}
          onChange={(e) => setFilters({ ...filters, search: e.target.value })}
        />
      </div>
    </div>
  )
}

// 提交表单组件
function SubmissionForm({ formData, setFormData, handleSubmit, isSubmitting, submitError, showPenaltySlider, penaltyRange }: {
  formData: any
  setFormData: (f: any) => void
  handleSubmit: (e: React.FormEvent) => void
  isSubmitting: boolean
  submitError: string
  showPenaltySlider: boolean
  penaltyRange: number[]
}) {
  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {submitError && (
        <Alert className="border-red-200 bg-red-50">
          <AlertTriangle className="h-4 w-4 text-red-600" />
          <AlertDescription className="text-red-800 text-sm">{submitError}</AlertDescription>
        </Alert>
      )}

      <div>
        <Label className="text-sm">运动类型</Label>
        <Select
          value={formData.exerciseType}
          onValueChange={(value) => setFormData({ ...formData, exerciseType: value })}
        >
          <SelectTrigger className="mt-1.5">
            <SelectValue placeholder="选择运动类型" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="weighted_pullup">💪 负重引体向上</SelectItem>
            <SelectItem value="weighted_dips">💪 负重双杠臂屈伸</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div>
          <Label className="text-sm">性别</Label>
          <Select
            value={formData.gender}
            onValueChange={(value) => setFormData({ ...formData, gender: value })}
          >
            <SelectTrigger className="mt-1.5">
              <SelectValue placeholder="选择性别" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="Male">男性</SelectItem>
              <SelectItem value="Female">女性</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div>
          <Label className="text-sm">体重 (kg)</Label>
          <Input
            type="number"
            step="0.1"
            placeholder="70.5"
            value={formData.bodyweight}
            onChange={(e) => setFormData({ ...formData, bodyweight: e.target.value })}
            className="mt-1.5"
            required
          />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div>
          <Label className="text-sm">附加负重 (kg)</Label>
          <Input
            type="number"
            step="0.1"
            placeholder="0"
            value={formData.addedWeight}
            onChange={(e) => setFormData({ ...formData, addedWeight: e.target.value })}
            className="mt-1.5"
            required
          />
        </div>
        <div>
          <Label className="text-sm">完成次数</Label>
          <Input
            type="number"
            placeholder="5"
            min="1"
            max="10"
            value={formData.reps}
            onChange={(e) => setFormData({ ...formData, reps: e.target.value })}
            className="mt-1.5"
            required
          />
        </div>
      </div>

      <div>
        <Label className="text-sm">动作质量</Label>
        <Select
          value={formData.formQuality}
          onValueChange={(value) => setFormData({ ...formData, formQuality: value })}
        >
          <SelectTrigger className="mt-1.5">
            <SelectValue placeholder="选择动作质量" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="Competition">比赛级标准</SelectItem>
            <SelectItem value="Minor_Cheat">轻微借力 (2-5kg)</SelectItem>
            <SelectItem value="Major_Cheat">严重借力 (5-20kg)</SelectItem>
            <SelectItem value="Extreme_Cheat">超严重借力 (20-50kg)</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {formData.exerciseType === "weighted_pullup" && (
        <div>
          <Label className="text-sm">引体向上类型</Label>
          <Select
            value={formData.pullupType}
            onValueChange={(value) => setFormData({ ...formData, pullupType: value })}
          >
            <SelectTrigger className="mt-1.5">
              <SelectValue placeholder="选择引体类型" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="Overhand">正手</SelectItem>
              <SelectItem value="Underhand">反手</SelectItem>
            </SelectContent>
          </Select>
        </div>
      )}

      <div>
        <Label className="text-sm">姓名/社媒账号 (选填)</Label>
        <Input
          type="text"
          placeholder="张三 或 @your_handle"
          value={formData.userName}
          onChange={(e) => setFormData({ ...formData, userName: e.target.value })}
          className="mt-1.5"
        />
      </div>

      <div>
        <Label className="text-sm">视频链接 (选填)</Label>
        <Input
          type="url"
          placeholder="https://example.com/your-video"
          value={formData.videoUrl}
          onChange={(e) => setFormData({ ...formData, videoUrl: e.target.value })}
          className="mt-1.5"
        />
      </div>

      {showPenaltySlider && (
        <div>
          <Label className="text-sm">惩罚重量: {formData.penaltyWeight} kg</Label>
          <Slider
            value={[formData.penaltyWeight]}
            onValueChange={(value) => setFormData({ ...formData, penaltyWeight: value[0] })}
            min={penaltyRange[0]}
            max={penaltyRange[1]}
            step={0.5}
            className="mt-3"
          />
          <div className="flex justify-between text-xs text-gray-500 mt-1">
            <span>{penaltyRange[0]} kg</span>
            <span>{penaltyRange[1]} kg</span>
          </div>
        </div>
      )}

      <Button type="submit" className="w-full h-12 text-base" disabled={isSubmitting}>
        {isSubmitting ? "提交中..." : "提交数据"}
      </Button>
    </form>
  )
}
