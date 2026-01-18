"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"

// 重定向旧的 /submit 路由到合并后的 /data 页面
export default function SubmitRedirectPage() {
  const router = useRouter()

  useEffect(() => {
    router.replace("/data")
  }, [router])

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
        <p className="text-gray-600">正在跳转...</p>
      </div>
    </div>
  )
}
