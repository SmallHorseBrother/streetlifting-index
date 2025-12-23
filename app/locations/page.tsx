"use client"

import { useState, useEffect, useRef } from "react"
import { MapPin, Plus, Upload, Image as ImageIcon, Building2 } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { SiteHeader } from "@/components/SiteHeader"
import { createClient } from "@supabase/supabase-js"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

type Location = {
  id: string
  name: string
  description?: string
  address?: string
  city?: string
  province?: string
  image_url?: string
  created_at: string
}

export default function LocationsPage() {
  const [locations, setLocations] = useState<Location[]>([])
  const [filteredLocations, setFilteredLocations] = useState<Location[]>([])
  const [loading, setLoading] = useState(true)
  const [dialogOpen, setDialogOpen] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [imagePreview, setImagePreview] = useState<string | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [searchQuery, setSearchQuery] = useState("")
  const [filterProvince, setFilterProvince] = useState("all")
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    address: "",
    city: "",
    province: "",
    image_url: "",
  })

  useEffect(() => {
    fetchLocations()
  }, [])

  // Filter locations based on search query and province filter
  useEffect(() => {
    let filtered = [...locations]

    // Search filter
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase()
      filtered = filtered.filter((loc) =>
        loc.name.toLowerCase().includes(query) ||
        loc.province?.toLowerCase().includes(query) ||
        loc.city?.toLowerCase().includes(query) ||
        loc.address?.toLowerCase().includes(query) ||
        loc.description?.toLowerCase().includes(query)
      )
    }

    // Province filter
    if (filterProvince !== "all") {
      filtered = filtered.filter((loc) => loc.province === filterProvince)
    }

    setFilteredLocations(filtered)
  }, [locations, searchQuery, filterProvince])

  async function fetchLocations() {
    try {
      const { data, error } = await supabase
        .from("locations")
        .select("*")
        .order("created_at", { ascending: false })

      if (error) {
        console.error("Error fetching locations:", error)
        setLocations([])
      } else {
        setLocations(data || [])
      }
    } catch (error) {
      console.error("Error:", error)
      setLocations([])
    } finally {
      setLoading(false)
    }
  }

  async function handleImageUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return

    // 预览图片
    const reader = new FileReader()
    reader.onloadend = () => {
      setImagePreview(reader.result as string)
    }
    reader.readAsDataURL(file)

    setUploading(true)
    try {
      const fileExt = file.name.split(".").pop()
      const fileName = `${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`
      const filePath = `bar-images/${fileName}`

      const { error: uploadError } = await supabase.storage
        .from("locations")
        .upload(filePath, file)

      if (uploadError) {
        console.error("Upload error:", uploadError)
        alert("图片上传失败，请稍后重试")
        return
      }

      const { data: urlData } = supabase.storage
        .from("locations")
        .getPublicUrl(filePath)

      setFormData({ ...formData, image_url: urlData.publicUrl })
    } catch (error) {
      console.error("Error uploading image:", error)
      alert("图片上传失败，请稍后重试")
    } finally {
      setUploading(false)
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!formData.name.trim()) return

    setSubmitting(true)
    try {
      const { error } = await supabase.from("locations").insert([
        {
          name: formData.name,
          description: formData.description || null,
          address: formData.address || null,
          city: formData.city || null,
          province: formData.province || null,
          image_url: formData.image_url || null,
        },
      ])

      if (error) {
        console.error("Error submitting location:", error)
        alert("提交失败，请稍后重试")
      } else {
        setDialogOpen(false)
        setFormData({
          name: "",
          description: "",
          address: "",
          city: "",
          province: "",
          image_url: "",
        })
        setImagePreview(null)
        fetchLocations()
      }
    } catch (error) {
      console.error("Error:", error)
      alert("提交失败，请稍后重试")
    } finally {
      setSubmitting(false)
    }
  }

  function resetForm() {
    setFormData({
      name: "",
      description: "",
      address: "",
      city: "",
      province: "",
      image_url: "",
    })
    setImagePreview(null)
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-emerald-100">
      <SiteHeader currentPage="locations" />

      <div className="py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-gray-900">寻找单杠</h1>
            <p className="text-gray-600 mt-2">
              全国各地的单杠位置分享，帮你找到附近的训练场地
            </p>
          </div>

          {/* Search and Filter */}
          <Card className="mb-6">
            <CardContent className="p-4">
              <div className="flex flex-col md:flex-row gap-4">
                <div className="flex-1">
                  <Input
                    placeholder="搜索地点名称、省份、城市、地址..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full"
                  />
                </div>
                <div className="w-full md:w-48">
                  <select
                    value={filterProvince}
                    onChange={(e) => setFilterProvince(e.target.value)}
                    className="w-full h-10 px-3 rounded-md border border-gray-300 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="all">全部省份</option>
                    {Array.from(new Set(locations.map(loc => loc.province).filter(Boolean))).sort().map(province => (
                      <option key={province} value={province}>{province}</option>
                    ))}
                  </select>
                </div>
              </div>
              <div className="mt-2 text-sm text-gray-500">
                找到 {filteredLocations.length} 个地点
              </div>
            </CardContent>
          </Card>

          {/* 提交按钮 */}
          <div className="flex justify-end mb-6">
            <Dialog open={dialogOpen} onOpenChange={(open) => {
              setDialogOpen(open)
              if (!open) resetForm()
            }}>
              <DialogTrigger asChild>
                <Button className="bg-green-600 hover:bg-green-700">
                  <Plus className="mr-2 h-4 w-4" />
                  分享单杠位置
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-[500px]">
                <DialogHeader>
                  <DialogTitle>分享单杠位置</DialogTitle>
                  <DialogDescription>
                    分享你发现的单杠位置，帮助其他训练者找到训练场地
                  </DialogDescription>
                </DialogHeader>
                <form onSubmit={handleSubmit} className="space-y-4 mt-4">
                  <div className="space-y-2">
                    <Label htmlFor="name">地点名称 *</Label>
                    <Input
                      id="name"
                      placeholder="例如：朝阳公园健身区"
                      value={formData.name}
                      onChange={(e) =>
                        setFormData({ ...formData, name: e.target.value })
                      }
                      required
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="province">省份</Label>
                      <Input
                        id="province"
                        placeholder="例如：北京市"
                        value={formData.province}
                        onChange={(e) =>
                          setFormData({ ...formData, province: e.target.value })
                        }
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="city">城市/区</Label>
                      <Input
                        id="city"
                        placeholder="例如：朝阳区"
                        value={formData.city}
                        onChange={(e) =>
                          setFormData({ ...formData, city: e.target.value })
                        }
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="address">详细地址</Label>
                    <Input
                      id="address"
                      placeholder="具体位置描述"
                      value={formData.address}
                      onChange={(e) =>
                        setFormData({ ...formData, address: e.target.value })
                      }
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="description">描述</Label>
                    <Textarea
                      id="description"
                      placeholder="例如：单杠数量、高度、杠面宽度/粗细/手感、安全性（是否牢固）、周边环境等..."
                      value={formData.description}
                      onChange={(e) =>
                        setFormData({ ...formData, description: e.target.value })
                      }
                      rows={3}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label>上传图片</Label>
                    <div className="flex items-center gap-4">
                      <input
                        type="file"
                        accept="image/*"
                        ref={fileInputRef}
                        onChange={handleImageUpload}
                        className="hidden"
                      />
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => fileInputRef.current?.click()}
                        disabled={uploading}
                      >
                        {uploading ? (
                          "上传中..."
                        ) : (
                          <>
                            <Upload className="mr-2 h-4 w-4" />
                            选择图片
                          </>
                        )}
                      </Button>
                      {imagePreview && (
                        <div className="relative w-16 h-16">
                          <img
                            src={imagePreview}
                            alt="Preview"
                            className="w-full h-full object-cover rounded"
                          />
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="flex justify-end gap-2 pt-4">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => {
                        setDialogOpen(false)
                        resetForm()
                      }}
                    >
                      取消
                    </Button>
                    <Button type="submit" disabled={submitting || uploading}>
                      {submitting ? "提交中..." : "提交"}
                    </Button>
                  </div>
                </form>
              </DialogContent>
            </Dialog>
          </div>

          {/* 地点列表 */}
          {loading ? (
            <div className="text-center py-12 text-gray-500">加载中...</div>
          ) : filteredLocations.length === 0 ? (
            <Card>
              <CardContent className="text-center py-12">
                <MapPin className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                {locations.length === 0 ? (
                  <>
                    <p className="text-gray-500">暂无单杠位置信息</p>
                    <p className="text-gray-400 text-sm mt-1">成为第一个分享者吧！</p>
                  </>
                ) : (
                  <p className="text-gray-500">没有找到符合条件的地点</p>
                )}
              </CardContent>
            </Card>
          ) : (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredLocations.map((location) => (
                <Card key={location.id} className="overflow-hidden hover:shadow-lg transition-shadow">
                  {location.image_url ? (
                    <div className="aspect-video bg-gray-100">
                      <img
                        src={location.image_url}
                        alt={location.name}
                        className="w-full h-full object-cover"
                      />
                    </div>
                  ) : (
                    <div className="aspect-video bg-gradient-to-br from-green-100 to-emerald-200 flex items-center justify-center">
                      <ImageIcon className="h-12 w-12 text-green-300" />
                    </div>
                  )}
                  <CardHeader className="pb-2">
                    <CardTitle className="text-lg flex items-center gap-2">
                      <MapPin className="h-5 w-5 text-green-600" />
                      {location.name}
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    {(location.province || location.city) && (
                      <div className="flex items-center gap-1 text-sm text-gray-500 mb-2">
                        <Building2 className="h-4 w-4" />
                        {[location.province, location.city].filter(Boolean).join(" · ")}
                      </div>
                    )}
                    {location.address && (
                      <p className="text-sm text-gray-600 mb-2">{location.address}</p>
                    )}
                    {location.description && (
                      <p className="text-sm text-gray-500">{location.description}</p>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
