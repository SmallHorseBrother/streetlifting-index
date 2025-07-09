"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Slider } from "@/components/ui/slider"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { AlertTriangle, CheckCircle, TrendingUp } from "lucide-react"
import Link from "next/link"
import { createClient } from "@supabase/supabase-js"
import { DonationSection } from "@/components/donation-section"

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!)

export default function SubmissionPage() {
  const [formData, setFormData] = useState({
    gender: "",
    bodyweight: "",
    addedWeight: "",
    reps: "",
    formQuality: "",
    penaltyWeight: 3,
    userName: "", // 新增
    videoUrl: "", // 新增
    pullupType: "", // 新增
  })
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitSuccess, setSubmitSuccess] = useState(false)
  const [error, setError] = useState("")

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    setError("")

    try {
      const { error: submitError } = await supabase.from("submissions").insert([
        {
          gender: formData.gender,
          bodyweight: Number.parseFloat(formData.bodyweight),
          added_weight: Number.parseFloat(formData.addedWeight),
          reps: Number.parseInt(formData.reps),
          form_quality: formData.formQuality,
          penalty_weight: ["Minor_Cheat", "Major_Cheat"].includes(formData.formQuality) ? formData.penaltyWeight : 0,
          user_name: formData.userName || null, // 新增
          video_url: formData.videoUrl || null, // 新增
          pullup_type: formData.pullupType, // 新增
        },
      ])

      if (submitError) {
        throw submitError
      }

      // 重定向到成功页面而不是显示成功消息
      window.location.href = "/submit/success"

      setFormData({
        gender: "",
        bodyweight: "",
        addedWeight: "",
        reps: "",
        formQuality: "",
        penaltyWeight: 3,
        userName: "", // 新增
        videoUrl: "", // 新增
        pullupType: "", // 新增
      })
    } catch (err) {
      setError("提交失败，请稍后重试")
      console.error("Submission error:", err)
    } finally {
      setIsSubmitting(false)
    }
  }

  const showPenaltySlider = ["Minor_Cheat", "Major_Cheat"].includes(formData.formQuality)
  const penaltyRange = formData.formQuality === "Minor_Cheat" ? [2, 5] : [5, 20]

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
              <Link href="/submit" className="text-gray-900 hover:text-blue-600">
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

      <div className="py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-2xl mx-auto">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-4">数据提交</h1>
            <p className="text-gray-600">感谢您为社区贡献数据！您的每一次提交都将帮助我们建立更准确的力量评估标准。</p>
          </div>

          {/* Important Notice */}
          <Alert className="mb-8 border-orange-200 bg-orange-50">
            <AlertTriangle className="h-4 w-4 text-orange-600" />
            <AlertDescription className="text-orange-800">
              <strong>动作标准的重要性：</strong>
              高质量的数据，才能产生高质量的公式。请诚实地评估你的动作质量，这将直接影响整个社区的评估标准。
            </AlertDescription>
          </Alert>

          {submitSuccess && (
            <Alert className="mb-8 border-green-200 bg-green-50">
              <CheckCircle className="h-4 w-4 text-green-600" />
              <AlertDescription className="text-green-800">
                数据提交成功！感谢您的贡献。您可以继续提交更多数据或前往计算器查看您的力量指数。
              </AlertDescription>
            </Alert>
          )}

          {error && (
            <Alert className="mb-8 border-red-200 bg-red-50">
              <AlertTriangle className="h-4 w-4 text-red-600" />
              <AlertDescription className="text-red-800">{error}</AlertDescription>
            </Alert>
          )}

          <Card>
            <CardHeader>
              <CardTitle>引体向上数据表单</CardTitle>
              <CardDescription>请如实填写您的引体向上成绩数据</CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="gender">性别</Label>
                    <Select
                      value={formData.gender}
                      onValueChange={(value) => setFormData({ ...formData, gender: value })}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="选择性别" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Male">男性</SelectItem>
                        <SelectItem value="Female">女性</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label htmlFor="bodyweight">体重 (kg)</Label>
                    <Input
                      id="bodyweight"
                      type="number"
                      step="0.1"
                      placeholder="70.5"
                      value={formData.bodyweight}
                      onChange={(e) => setFormData({ ...formData, bodyweight: e.target.value })}
                      required
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="addedWeight">附加负重 (kg)</Label>
                    <Input
                      id="addedWeight"
                      type="number"
                      step="0.1"
                      placeholder="0"
                      value={formData.addedWeight}
                      onChange={(e) => setFormData({ ...formData, addedWeight: e.target.value })}
                      required
                    />
                  </div>

                  <div>
                    <Label htmlFor="reps">完成次数</Label>
                    <Input
                      id="reps"
                      type="number"
                      placeholder="8"
                      value={formData.reps}
                      onChange={(e) => setFormData({ ...formData, reps: e.target.value })}
                      required
                    />
                  </div>
                </div>

                <div>
                  <Label htmlFor="formQuality">动作质量</Label>
                  <Select
                    value={formData.formQuality}
                    onValueChange={(value) => setFormData({ ...formData, formQuality: value })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="选择动作质量" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Competition">比赛级标准 - 动作完美，符合比赛要求</SelectItem>
                      <SelectItem value="Good">良好标准 - 动作干净，但未达到比赛严苛程度</SelectItem>
                      <SelectItem value="Minor_Cheat">轻微借力 - 少量借力完成动作</SelectItem>
                      <SelectItem value="Major_Cheat">严重借力 - 明显借力完成动作</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="pullupType">引体向上类型</Label>
                  <Select
                    value={formData.pullupType}
                    onValueChange={(value) => setFormData({ ...formData, pullupType: value })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="选择引体类型" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Overhand">正手负重引体</SelectItem>
                      <SelectItem value="Underhand">反手负重引体</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="userName">姓名/社媒账号 (选填)</Label>
                  <Input
                    id="userName"
                    type="text"
                    placeholder="张三 或 @your_handle"
                    value={formData.userName}
                    onChange={(e) => setFormData({ ...formData, userName: e.target.value })}
                  />
                  <p className="text-sm text-gray-500 mt-1">可填写真实姓名或社交媒体账号，方便其他用户关注</p>
                </div>

                <div>
                  <Label htmlFor="videoUrl">视频链接 (选填)</Label>
                  <Input
                    id="videoUrl"
                    type="url"
                    placeholder="https://example.com/your-video"
                    value={formData.videoUrl}
                    onChange={(e) => setFormData({ ...formData, videoUrl: e.target.value })}
                  />
                  <p className="text-sm text-gray-500 mt-1">分享您的训练视频，让社区见证您的实力</p>
                </div>

                {showPenaltySlider && (
                  <div>
                    <Label>惩罚重量: {formData.penaltyWeight} kg</Label>
                    <div className="mt-2">
                      <Slider
                        value={[formData.penaltyWeight]}
                        onValueChange={(value) => setFormData({ ...formData, penaltyWeight: value[0] })}
                        min={penaltyRange[0]}
                        max={penaltyRange[1]}
                        step={0.5}
                        className="w-full"
                      />
                      <div className="flex justify-between text-sm text-gray-500 mt-1">
                        <span>{penaltyRange[0]} kg</span>
                        <span>{penaltyRange[1]} kg</span>
                      </div>
                    </div>
                    <p className="text-sm text-gray-600 mt-2">
                      根据借力程度选择相应的惩罚重量，这将从您的附加负重中扣除。
                    </p>
                  </div>
                )}

                <Button type="submit" className="w-full" disabled={isSubmitting}>
                  {isSubmitting ? "提交中..." : "提交数据"}
                </Button>
              </form>
            </CardContent>
          </Card>

          <div className="mt-8 text-center">
            <p className="text-gray-600 mb-4">提交完成后，您可以前往计算器查看基于最新公式的力量指数</p>
            <Link href="/calculator">
              <Button variant="outline">前往力量计算器</Button>
            </Link>
          </div>
        </div>
      </div>

      {/* Donation Section */}
      <DonationSection variant="footer" />
    </div>
  )
}
