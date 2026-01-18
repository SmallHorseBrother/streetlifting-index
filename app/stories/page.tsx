"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { ExternalLink, Plus, Calendar, Video, FileText } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { SiteHeader } from "@/components/SiteHeader"
import { BottomNav } from "@/components/BottomNav"
import { createClient } from "@supabase/supabase-js"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

type Story = {
  id: string
  title: string
  content?: string
  video_url?: string
  type: "story" | "event"
  event_date?: string
  created_at: string
  user_contact?: string
}

// 硬编码的原始故事（在数据库迁移完成前作为备份显示）
const legacyStories: Story[] = [
  {
    id: "legacy-1",
    title: "风吹裤管和小马哥冲突事件",
    video_url: "https://www.wolai.com/fxoxabrZCusUeZY4h67uEF",
    type: "event",
    created_at: "2024-01-01",
  },
]

export default function StoriesPage() {
  const [stories, setStories] = useState<Story[]>([])
  const [loading, setLoading] = useState(true)
  const [dialogOpen, setDialogOpen] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [formData, setFormData] = useState({
    title: "",
    content: "",
    video_url: "",
    type: "story" as "story" | "event",
    event_date: "",
    user_contact: "",
  })

  useEffect(() => {
    fetchStories()
  }, [])

  async function fetchStories() {
    try {
      const { data, error } = await supabase
        .from("stories")
        .select("*")
        .order("created_at", { ascending: false })

      if (error) {
        console.error("Error fetching stories:", error)
        // 如果数据库查询失败，显示原始硬编码故事
        setStories(legacyStories)
      } else {
        // 合并数据库故事和遗留故事（去重）
        const dbStoryTitles = new Set(data?.map((s) => s.title) || [])
        const uniqueLegacyStories = legacyStories.filter(
          (s) => !dbStoryTitles.has(s.title)
        )
        setStories([...(data || []), ...uniqueLegacyStories])
      }
    } catch (error) {
      console.error("Error:", error)
      setStories(legacyStories)
    } finally {
      setLoading(false)
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!formData.title.trim()) return

    setSubmitting(true)
    try {
      const { error } = await supabase.from("stories").insert([
        {
          title: formData.title,
          content: formData.content || null,
          video_url: formData.video_url || null,
          type: formData.type,
          event_date: formData.event_date || null,
          user_contact: formData.user_contact || null,
        },
      ])

      if (error) {
        console.error("Error submitting story:", error)
        alert("提交失败，请稍后重试")
      } else {
        setDialogOpen(false)
        setFormData({
          title: "",
          content: "",
          video_url: "",
          type: "story",
          event_date: "",
          user_contact: "",
        })
        fetchStories()
      }
    } catch (error) {
      console.error("Error:", error)
      alert("提交失败，请稍后重试")
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* 桌面端显示顶部导航 */}
      <div className="hidden md:block">
        <SiteHeader currentPage="stories" />
      </div>

      {/* 移动端App风格头部 */}
      <header className="md:hidden sticky top-0 z-40 bg-white border-b border-gray-100">
        <div className="flex items-center justify-center px-4 h-14">
          <h1 className="text-lg font-bold text-gray-900">社区故事</h1>
        </div>
      </header>

      <div className="py-4 md:py-12 px-3 md:px-4 sm:px-6 lg:px-8 pb-24 md:pb-12">
        <div className="max-w-4xl mx-auto">
          <div className="hidden md:block text-center mb-8">
            <h1 className="text-3xl font-bold text-gray-900">社区故事</h1>
            <p className="text-gray-600 mt-2">
              记录社区中的重要事件、故事和发展历程，点击标题或视频链接可跳转查看
            </p>
          </div>

          {/* 提交按钮 */}
          <div className="flex justify-end mb-6">
            <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
              <DialogTrigger asChild>
                <Button className="bg-blue-600 hover:bg-blue-700">
                  <Plus className="mr-2 h-4 w-4" />
                  分享故事/事件
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-[500px]">
                <DialogHeader>
                  <DialogTitle>分享社区故事或事件</DialogTitle>
                  <DialogDescription>
                    分享社区中发生的重要事件、故事或里程碑
                  </DialogDescription>
                </DialogHeader>
                <form onSubmit={handleSubmit} className="space-y-4 mt-4">
                  <div className="space-y-2">
                    <Label htmlFor="title">标题 *</Label>
                    <Input
                      id="title"
                      placeholder="例如：xxx比赛冠军"
                      value={formData.title}
                      onChange={(e) =>
                        setFormData({ ...formData, title: e.target.value })
                      }
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="type">类型</Label>
                    <Select
                      value={formData.type}
                      onValueChange={(value: "story" | "event") =>
                        setFormData({ ...formData, type: value })
                      }
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="选择类型" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="story">故事</SelectItem>
                        <SelectItem value="event">事件</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="content">内容描述</Label>
                    <Textarea
                      id="content"
                      placeholder="简要描述这个故事或事件..."
                      value={formData.content}
                      onChange={(e) =>
                        setFormData({ ...formData, content: e.target.value })
                      }
                      rows={3}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="video_url">视频/文档链接</Label>
                    <Input
                      id="video_url"
                      placeholder="B站、抖音、微信公众号链接等"
                      value={formData.video_url}
                      onChange={(e) =>
                        setFormData({ ...formData, video_url: e.target.value })
                      }
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="event_date">事件日期</Label>
                    <Input
                      id="event_date"
                      type="date"
                      value={formData.event_date}
                      onChange={(e) =>
                        setFormData({ ...formData, event_date: e.target.value })
                      }
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="user_contact">联系方式（可选）</Label>
                    <Input
                      id="user_contact"
                      placeholder="微信号或其他联系方式"
                      value={formData.user_contact}
                      onChange={(e) =>
                        setFormData({ ...formData, user_contact: e.target.value })
                      }
                    />
                  </div>

                  <div className="flex justify-end gap-2 pt-4">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => setDialogOpen(false)}
                    >
                      取消
                    </Button>
                    <Button type="submit" disabled={submitting}>
                      {submitting ? "提交中..." : "提交"}
                    </Button>
                  </div>
                </form>
              </DialogContent>
            </Dialog>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>故事列表</CardTitle>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="text-center py-8 text-gray-500">加载中...</div>
              ) : stories.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  暂无故事，成为第一个分享者吧！
                </div>
              ) : (
                <div className="divide-y">
                  {stories.map((story) => (
                    <div
                      key={story.id}
                      className="py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                    >
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          {story.type === "event" ? (
                            <Calendar className="h-4 w-4 text-orange-500" />
                          ) : (
                            <FileText className="h-4 w-4 text-blue-500" />
                          )}
                          <span className="font-medium">{story.title}</span>
                        </div>
                        {story.content && (
                          <p className="text-sm text-gray-600 mt-1 ml-6">
                            {story.content}
                          </p>
                        )}
                        {story.event_date && (
                          <p className="text-xs text-gray-400 mt-1 ml-6">
                            日期：{story.event_date}
                          </p>
                        )}
                      </div>
                      {story.video_url && (
                        <Button
                          variant="outline"
                          size="sm"
                          className="bg-transparent shrink-0"
                          onClick={() => window.open(story.video_url, "_blank")}
                        >
                          <Video className="mr-2 h-4 w-4" />
                          查看
                          <ExternalLink className="ml-2 h-4 w-4" />
                        </Button>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
      
      {/* 底部导航 - 仅移动端 */}
      <BottomNav />
    </div>
  )
}
