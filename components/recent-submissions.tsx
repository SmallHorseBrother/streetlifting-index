"use client"

import { useState, useEffect } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { User, Video, RefreshCw } from "lucide-react"
import { createClient } from "@supabase/supabase-js"

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

export function RecentSubmissions() {
  const [submissions, setSubmissions] = useState<Submission[]>([])
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)

  const fetchRecentSubmissions = async (showRefreshing = false) => {
    if (showRefreshing) setRefreshing(true)

    try {
      const { data, error } = await supabase
        .from("submissions")
        .select("*")
        .order("created_at", { ascending: false })
        .limit(5)

      if (error) throw error
      setSubmissions(data || [])
    } catch (error) {
      console.error("Error fetching recent submissions:", error)
    } finally {
      setLoading(false)
      if (showRefreshing) setRefreshing(false)
    }
  }

  useEffect(() => {
    fetchRecentSubmissions()
  }, [])

  const calculate1RM = (bodyweight: number, addedWeight: number, reps: number, penaltyWeight: number) => {
    const adjustedWeight = addedWeight - penaltyWeight
    const totalWeight = bodyweight + adjustedWeight

    if (reps === 1) {
      return adjustedWeight
    }

    if (reps >= 37) {
      return 0
    }

    const epley1RM = totalWeight * (1 + 0.0333 * reps)
    const brzycki1RM = totalWeight * (36 / (37 - reps))
    const lombardi1RM = totalWeight * Math.pow(reps, 0.1)

    const totalEstimated1RM = (epley1RM + brzycki1RM + lombardi1RM) / 3

    return totalEstimated1RM - bodyweight
  }

  const getQualityColor = (quality: string) => {
    switch (quality) {
      case "Competition":
        return "bg-green-100 text-green-700"
      case "Minor_Cheat":
        return "bg-yellow-100 text-yellow-700"
      case "Major_Cheat":
        return "bg-red-100 text-red-700"
      default:
        return "bg-gray-100 text-gray-700"
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

  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4">
        {[...Array(5)].map((_, i) => (
          <Card key={i} className="animate-pulse">
            <CardContent className="p-4">
              <div className="space-y-3">
                <div className="h-4 bg-gray-200 rounded"></div>
                <div className="space-y-2">
                  <div className="h-3 bg-gray-200 rounded"></div>
                  <div className="h-3 bg-gray-200 rounded"></div>
                  <div className="h-3 bg-gray-200 rounded"></div>
                </div>
                <div className="h-6 bg-gray-200 rounded"></div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold">最新动态</h3>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => fetchRecentSubmissions(true)}
          disabled={refreshing}
          className="bg-transparent"
        >
          <RefreshCw className={`h-4 w-4 mr-1 ${refreshing ? "animate-spin" : ""}`} />
          刷新
        </Button>
      </div>

      {submissions.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4">
          {submissions.map((submission) => {
            const estimated1RM = calculate1RM(
              submission.bodyweight,
              submission.added_weight,
              submission.reps,
              submission.penalty_weight,
            )

            return (
              <Card key={submission.id} className="hover:shadow-lg transition-shadow">
                <CardContent className="p-4">
                  <div className="space-y-3">
                    {/* User Info */}
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-1">
                        <User className="h-3 w-3 text-gray-500" />
                        <span className="text-xs font-medium truncate max-w-20">{submission.user_name || "匿名"}</span>
                      </div>
                      <Badge
                        variant="outline"
                        className={`text-xs ${submission.gender === "Male" ? "text-blue-600" : "text-pink-600"}`}
                      >
                        {submission.gender === "Male" ? "男" : "女"}
                      </Badge>
                    </div>

                    {/* Performance Data */}
                    <div className="space-y-1">
                      <div className="flex justify-between text-xs">
                        <span className="text-gray-500">体重:</span>
                        <span className="font-medium">{submission.bodyweight}kg</span>
                      </div>
                      <div className="flex justify-between text-xs">
                        <span className="text-gray-500">负重:</span>
                        <span className="font-medium">{submission.added_weight}kg</span>
                      </div>
                      <div className="flex justify-between text-xs">
                        <span className="text-gray-500">次数:</span>
                        <span className="font-medium">{submission.reps}次</span>
                      </div>
                      <div className="flex justify-between text-xs border-t pt-1">
                        <span className="text-gray-500">估算1RM:</span>
                        <span className="font-semibold text-blue-600">{estimated1RM.toFixed(1)}kg</span>
                      </div>
                    </div>

                    {/* Tags */}
                    <div className="flex flex-wrap gap-1">
                      <Badge className={`text-xs px-1.5 py-0.5 ${getQualityColor(submission.form_quality)}`}>
                        {getQualityText(submission.form_quality)}
                      </Badge>
                      <Badge variant="outline" className="text-xs px-1.5 py-0.5">
                        {submission.pullup_type === "Overhand" ? "正手" : "反手"}
                      </Badge>
                    </div>

                    {/* Penalty Weight */}
                    {submission.penalty_weight > 0 && (
                      <div className="text-xs text-orange-600 bg-orange-50 px-2 py-1 rounded">
                        惩罚: -{submission.penalty_weight}kg
                      </div>
                    )}

                    {/* Video Link */}
                    {submission.video_url && (
                      <Button
                        variant="outline"
                        size="sm"
                        className="w-full h-7 text-xs bg-transparent"
                        onClick={() => window.open(submission.video_url!, "_blank")}
                      >
                        <Video className="h-3 w-3 mr-1" />
                        观看视频
                      </Button>
                    )}

                    {/* Time */}
                    <div className="text-xs text-gray-400 text-center">
                      {new Date(submission.created_at).toLocaleDateString("zh-CN", {
                        month: "short",
                        day: "numeric",
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </div>
                  </div>
                </CardContent>
              </Card>
            )
          })}
        </div>
      ) : (
        <div className="text-center py-12 bg-gray-50 rounded-lg">
          <User className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-500">还没有用户提交数据</p>
          <p className="text-sm text-gray-400 mt-2">成为第一个贡献数据的用户吧！</p>
        </div>
      )}
    </div>
  )
}
