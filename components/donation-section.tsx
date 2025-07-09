"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Heart, Coffee, ChevronDown, ChevronUp, Maximize2, X } from "lucide-react"

interface DonationSectionProps {
  variant?: "footer" | "page" | "success"
  className?: string
}

export function DonationSection({ variant = "footer", className = "" }: DonationSectionProps) {
  const [isExpanded, setIsExpanded] = useState(variant === "page" || variant === "success")
  const [isModalOpen, setIsModalOpen] = useState(false)

  const QRCodeImage = ({ size = "normal", clickable = true }: { size?: "normal" | "large"; clickable?: boolean }) => (
    <div className="flex justify-center">
      <div className="relative group">
        <img
          src="https://hebbkx1anhila5yf.public.blob.vercel-storage.com/cab356474435dc404d0d47781a97de5-zh0ZTLCQmMJ4tG6zZQPWE52QB2aKi2.png"
          alt="小马哥的赞赏码"
          className={`
            rounded-lg shadow-lg transition-all duration-300
            ${
              size === "normal"
                ? "w-64 h-64 sm:w-80 sm:h-80 md:w-96 md:h-96"
                : "w-80 h-80 sm:w-96 sm:h-96 md:w-[28rem] md:h-[28rem]"
            }
            ${clickable ? "cursor-pointer hover:shadow-xl hover:scale-105" : ""}
          `}
          onClick={clickable ? () => setIsModalOpen(true) : undefined}
          onError={(e) => {
            e.currentTarget.style.display = "none"
            e.currentTarget.nextElementSibling?.classList.remove("hidden")
          }}
        />
        {clickable && (
          <div className="absolute top-2 right-2 bg-black bg-opacity-50 text-white p-1 rounded opacity-0 group-hover:opacity-100 transition-opacity">
            <Maximize2 className="h-4 w-4" />
          </div>
        )}
        <div className="hidden bg-gray-100 rounded-lg shadow-lg flex items-center justify-center w-64 h-64 sm:w-80 sm:h-80 md:w-96 md:h-96">
          <p className="text-gray-500 text-sm">赞赏码加载中...</p>
        </div>
      </div>
    </div>
  )

  const content = (
    <div className="text-center space-y-6">
      <QRCodeImage />
      <div className="space-y-3">
        <p className="text-base sm:text-lg text-gray-700 font-medium">
          如果这个项目对你有帮助，欢迎请小马哥喝杯咖啡 ☕
        </p>
        <p className="text-sm text-gray-500">你的支持是项目持续发展的动力！点击二维码可放大查看</p>
      </div>
    </div>
  )

  // Modal for enlarged QR code
  const Modal = () => (
    <div
      className={`fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4 transition-opacity duration-300 ${
        isModalOpen ? "opacity-100" : "opacity-0 pointer-events-none"
      }`}
      onClick={() => setIsModalOpen(false)}
    >
      <div
        className="bg-white rounded-xl p-6 max-w-lg w-full mx-4 relative transform transition-transform duration-300"
        style={{ transform: isModalOpen ? "scale(1)" : "scale(0.9)" }}
        onClick={(e) => e.stopPropagation()}
      >
        <Button
          variant="ghost"
          size="sm"
          className="absolute top-2 right-2 bg-transparent hover:bg-gray-100"
          onClick={() => setIsModalOpen(false)}
        >
          <X className="h-4 w-4" />
        </Button>

        <div className="text-center space-y-4">
          <h3 className="text-xl font-semibold text-gray-900">小马哥的赞赏码</h3>
          <QRCodeImage size="large" clickable={false} />
          <div className="space-y-2">
            <p className="text-gray-700">"只管去做，你的潜力超乎你的想象"</p>
            <p className="text-sm text-gray-500">感谢你对引体向上力量指数项目的支持！</p>
          </div>
        </div>
      </div>
    </div>
  )

  if (variant === "footer") {
    return (
      <>
        <div className={`bg-gray-50 border-t ${className}`}>
          <div className="max-w-6xl mx-auto px-4 py-8">
            <div className="text-center">
              <Button
                variant="ghost"
                onClick={() => setIsExpanded(!isExpanded)}
                className="mb-6 text-gray-600 hover:text-gray-800 bg-transparent text-base"
              >
                <Heart className="h-5 w-5 mr-2 text-red-500" />
                支持项目发展
                {isExpanded ? <ChevronUp className="h-5 w-5 ml-2" /> : <ChevronDown className="h-5 w-5 ml-2" />}
              </Button>

              {isExpanded && <div className="animate-in slide-in-from-top-2 duration-300">{content}</div>}
            </div>
          </div>
        </div>
        <Modal />
      </>
    )
  }

  if (variant === "success") {
    return (
      <>
        <Card className={`bg-gradient-to-br from-yellow-50 to-orange-50 border-yellow-200 ${className}`}>
          <CardHeader className="text-center pb-4">
            <CardTitle className="flex items-center justify-center text-xl">
              <Coffee className="h-6 w-6 mr-2 text-orange-600" />
              感谢你的贡献！
            </CardTitle>
          </CardHeader>
          <CardContent className="pb-8">{content}</CardContent>
        </Card>
        <Modal />
      </>
    )
  }

  // variant === "page"
  return (
    <>
      <Card className={`bg-gradient-to-br from-blue-50 to-indigo-50 border-blue-200 ${className}`}>
        <CardHeader className="text-center">
          <CardTitle className="flex items-center justify-center text-xl">
            <Heart className="h-6 w-6 mr-2 text-red-500" />
            支持项目
          </CardTitle>
        </CardHeader>
        <CardContent className="pb-8">{content}</CardContent>
      </Card>
      <Modal />
    </>
  )
}
