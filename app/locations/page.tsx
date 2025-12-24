"use client"

import { useState, useEffect, useRef } from "react"
import { MapPin, Plus, Upload, Image as ImageIcon, Building2, Share2, ChevronLeft, ChevronRight, Edit2, Camera, X } from "lucide-react"
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

const MAX_IMAGES = 4

type Location = {
  id: string
  name: string
  description?: string
  address?: string
  city?: string
  province?: string
  image_url?: string  // 旧字段，保持兼容
  image_urls?: string[]  // 新字段，支持多图
  created_at: string
}

// 获取位置的所有图片（兼容旧数据）
function getLocationImages(location: Location): string[] {
  if (location.image_urls && location.image_urls.length > 0) {
    return location.image_urls
  }
  if (location.image_url) {
    return [location.image_url]
  }
  return []
}

export default function LocationsPage() {
  const [locations, setLocations] = useState<Location[]>([])
  const [filteredLocations, setFilteredLocations] = useState<Location[]>([])
  const [loading, setLoading] = useState(true)
  const [dialogOpen, setDialogOpen] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [imagePreviews, setImagePreviews] = useState<string[]>([])
  const [imageUrls, setImageUrls] = useState<string[]>([])
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [searchQuery, setSearchQuery] = useState("")
  const [filterProvince, setFilterProvince] = useState("all")
  const [editingLocation, setEditingLocation] = useState<Location | null>(null)
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    address: "",
    city: "",
    province: "",
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
    const files = e.target.files
    if (!files || files.length === 0) return

    const currentCount = imageUrls.length
    const remainingSlots = MAX_IMAGES - currentCount
    
    if (remainingSlots <= 0) {
      alert(`最多只能上传${MAX_IMAGES}张图片`)
      return
    }

    const filesToUpload = Array.from(files).slice(0, remainingSlots)
    
    setUploading(true)
    try {
      for (const file of filesToUpload) {
        // 预览图片
        const reader = new FileReader()
        reader.onloadend = () => {
          setImagePreviews(prev => [...prev, reader.result as string])
        }
        reader.readAsDataURL(file)

        // 上传图片
        const fileExt = file.name.split(".").pop()
        const fileName = `${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`
        const filePath = `bar-images/${fileName}`

        const { error: uploadError } = await supabase.storage
          .from("locations")
          .upload(filePath, file)

        if (uploadError) {
          console.error("Upload error:", uploadError)
          alert("图片上传失败，请稍后重试")
          continue
        }

        const { data: urlData } = supabase.storage
          .from("locations")
          .getPublicUrl(filePath)

        setImageUrls(prev => [...prev, urlData.publicUrl])
      }
    } catch (error) {
      console.error("Error uploading image:", error)
      alert("图片上传失败，请稍后重试")
    } finally {
      setUploading(false)
      // 清空 file input
      if (fileInputRef.current) {
        fileInputRef.current.value = ""
      }
    }
  }

  function removeImage(index: number) {
    setImagePreviews(prev => prev.filter((_, i) => i !== index))
    setImageUrls(prev => prev.filter((_, i) => i !== index))
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!formData.name.trim()) return

    setSubmitting(true)
    try {
      if (editingLocation) {
        // 更新现有记录
        const { error } = await supabase
          .from("locations")
          .update({
            name: formData.name,
            description: formData.description || null,
            address: formData.address || null,
            city: formData.city || null,
            province: formData.province || null,
            image_urls: imageUrls.length > 0 ? imageUrls : null,
          })
          .eq("id", editingLocation.id)

        if (error) {
          console.error("Error updating location:", error)
          alert("更新失败，请稍后重试")
        } else {
          setDialogOpen(false)
          resetForm()
          fetchLocations()
        }
      } else {
        // 新增记录
        const { error } = await supabase.from("locations").insert([
          {
            name: formData.name,
            description: formData.description || null,
            address: formData.address || null,
            city: formData.city || null,
            province: formData.province || null,
            image_urls: imageUrls.length > 0 ? imageUrls : null,
          },
        ])

        if (error) {
          console.error("Error submitting location:", error)
          alert("提交失败，请稍后重试")
        } else {
          setDialogOpen(false)
          resetForm()
          fetchLocations()
        }
      }
    } catch (error) {
      console.error("Error:", error)
      alert("操作失败，请稍后重试")
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
    })
    setImagePreviews([])
    setImageUrls([])
    setEditingLocation(null)
  }

  function handleEdit(location: Location) {
    setEditingLocation(location)
    setFormData({
      name: location.name,
      description: location.description || "",
      address: location.address || "",
      city: location.city || "",
      province: location.province || "",
    })
    const existingImages = getLocationImages(location)
    setImageUrls(existingImages)
    setImagePreviews(existingImages)
    setDialogOpen(true)
  }

  function handleShare(location: Location) {
    const locationUrl = `${window.location.origin}/locations`
    const addressPart = [location.province, location.city, location.address]
      .filter(Boolean)
      .join(" ")
    
    const shareText = `🏋️ 发现单杠训练点：${location.name}\n📍 地址：${addressPart || "暂无详细地址"}\n${location.description ? `💬 描述：${location.description}\n` : ""}🔗 查看更多单杠位置：${locationUrl}`
    
    navigator.clipboard.writeText(shareText).then(
      () => {
        alert("分享内容已复制到剪贴板！")
      },
      () => {
        alert("复制失败，请手动复制")
      }
    )
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
              <DialogContent className="sm:max-w-[500px] max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                  <DialogTitle>{editingLocation ? "编辑单杠位置" : "分享单杠位置"}</DialogTitle>
                  <DialogDescription>
                    {editingLocation 
                      ? "修改位置信息或补充更多图片（最多4张）" 
                      : "分享你发现的单杠位置，帮助其他训练者找到训练场地"}
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
                    <Label>上传图片（最多{MAX_IMAGES}张）</Label>
                    <div className="space-y-3">
                      {/* 图片预览网格 */}
                      {imagePreviews.length > 0 && (
                        <div className="grid grid-cols-4 gap-2">
                          {imagePreviews.map((preview, index) => (
                            <div key={index} className="relative aspect-square">
                              <img
                                src={preview}
                                alt={`Preview ${index + 1}`}
                                className="w-full h-full object-cover rounded"
                              />
                              <button
                                type="button"
                                onClick={() => removeImage(index)}
                                className="absolute -top-1 -right-1 bg-red-500 text-white rounded-full p-0.5 hover:bg-red-600"
                              >
                                <X className="h-3 w-3" />
                              </button>
                            </div>
                          ))}
                        </div>
                      )}
                      
                      {/* 上传按钮 */}
                      {imageUrls.length < MAX_IMAGES && (
                        <div className="flex items-center gap-4">
                          <input
                            type="file"
                            accept="image/*"
                            multiple
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
                          <span className="text-sm text-gray-500">
                            已上传 {imageUrls.length}/{MAX_IMAGES} 张
                          </span>
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
                      {submitting ? "提交中..." : editingLocation ? "保存修改" : "提交"}
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
                <LocationCard 
                  key={location.id} 
                  location={location} 
                  onEdit={handleEdit}
                  onShare={handleShare}
                />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

// 独立的地点卡片组件，支持图片轮播
function LocationCard({ 
  location, 
  onEdit, 
  onShare 
}: { 
  location: Location
  onEdit: (location: Location) => void
  onShare: (location: Location) => void
}) {
  const [currentImageIndex, setCurrentImageIndex] = useState(0)
  const images = getLocationImages(location)
  const imageCount = images.length

  const nextImage = () => {
    setCurrentImageIndex((prev) => (prev + 1) % imageCount)
  }

  const prevImage = () => {
    setCurrentImageIndex((prev) => (prev - 1 + imageCount) % imageCount)
  }

  return (
    <Card className="overflow-hidden hover:shadow-lg transition-shadow">
      {/* 图片区域 */}
      <div className="aspect-video bg-gray-100 relative group">
        {imageCount > 0 ? (
          <>
            <img
              src={images[currentImageIndex]}
              alt={location.name}
              className="w-full h-full object-cover"
            />
            {/* 图片计数和轮播控制 */}
            {imageCount > 1 && (
              <>
                <button
                  onClick={prevImage}
                  className="absolute left-2 top-1/2 -translate-y-1/2 bg-black/50 text-white p-1 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  <ChevronLeft className="h-4 w-4" />
                </button>
                <button
                  onClick={nextImage}
                  className="absolute right-2 top-1/2 -translate-y-1/2 bg-black/50 text-white p-1 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  <ChevronRight className="h-4 w-4" />
                </button>
                <div className="absolute bottom-2 left-1/2 -translate-x-1/2 flex gap-1">
                  {images.map((_, idx) => (
                    <span
                      key={idx}
                      className={`w-1.5 h-1.5 rounded-full ${
                        idx === currentImageIndex ? "bg-white" : "bg-white/50"
                      }`}
                    />
                  ))}
                </div>
              </>
            )}
            {/* 可以补充更多图片的提示 */}
            {imageCount < MAX_IMAGES && (
              <div className="absolute top-2 right-2 bg-black/60 text-white text-xs px-2 py-1 rounded flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                <Camera className="h-3 w-3" />
                可补充{MAX_IMAGES - imageCount}张图
              </div>
            )}
          </>
        ) : (
          <div 
            className="w-full h-full bg-gradient-to-br from-green-100 to-emerald-200 flex flex-col items-center justify-center cursor-pointer hover:from-green-200 hover:to-emerald-300 transition-colors"
            onClick={() => onEdit(location)}
          >
            <Camera className="h-10 w-10 text-green-400 mb-2" />
            <span className="text-green-600 text-sm font-medium">待补充图片</span>
            <span className="text-green-500 text-xs mt-1">点击添加</span>
          </div>
        )}
      </div>

      <CardHeader className="pb-2">
        <CardTitle className="text-lg flex items-center justify-between">
          <div className="flex items-center gap-2">
            <MapPin className="h-5 w-5 text-green-600" />
            {location.name}
          </div>
          <div className="flex items-center gap-1">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onEdit(location)}
              className="h-8 w-8 p-0"
              title="编辑此地点"
            >
              <Edit2 className="h-4 w-4 text-gray-500 hover:text-green-600" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onShare(location)}
              className="h-8 w-8 p-0"
              title="分享此地点"
            >
              <Share2 className="h-4 w-4 text-gray-500 hover:text-green-600" />
            </Button>
          </div>
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
  )
}
