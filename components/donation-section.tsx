"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Heart, Coffee, ChevronDown, ChevronUp, Maximize2, X, CircleDollarSign } from "lucide-react"

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
            rounded-lg shadow-lg transition-all duration-300 border-4 border-white
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
          <div className="absolute top-4 right-4 bg-black/60 text-white p-2 rounded-full opacity-0 group-hover:opacity-100 transition-opacity backdrop-blur-sm">
            <Maximize2 className="h-5 w-5" />
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
      <div className="space-y-4 max-w-2xl mx-auto">
        <p className="text-base sm:text-lg text-gray-800 font-medium leading-relaxed">
          引体向上力量指数是免费开源项目，但随着用户量增长，<span className="text-red-600 font-bold">服务器和存储成本</span>日益增加。
        </p>
        <p className="text-sm sm:text-base text-gray-600">
          如果您觉得这个工具有价值，希望能请小马哥喝杯咖啡，您的支持将直接用于支付服务器账单，保证项目持续稳定运行 ❤️
        </p>
      </div>
    </div>
  )

  // Modal for enlarged QR code
  const Modal = () => (
    <div
      className={`fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4 transition-opacity duration-300 backdrop-blur-sm ${
        isModalOpen ? "opacity-100" : "opacity-0 pointer-events-none"
      }`}
      onClick={() => setIsModalOpen(false)}
    >
      <div
        className="bg-white rounded-2xl p-6 sm:p-8 max-w-lg w-full mx-4 relative transform transition-transform duration-300 shadow-2xl"
        style={{ transform: isModalOpen ? "scale(1)" : "scale(0.95)" }}
        onClick={(e) => e.stopPropagation()}
      >
        <Button
          variant="ghost"
          size="sm"
          className="absolute top-2 right-2 rounded-full hover:bg-gray-100 p-2 h-auto"
          onClick={() => setIsModalOpen(false)}
        >
          <X className="h-5 w-5 text-gray-500" />
        </Button>

        <div className="text-center space-y-6">
          <div>
            <h3 className="text-2xl font-bold text-gray-900 mb-1">小马哥的赞赏码</h3>
            <p className="text-gray-500">微信扫码支持</p>
          </div>
          <QRCodeImage size="large" clickable={false} />
          <div className="bg-orange-50 p-4 rounded-lg border border-orange-100">
            <p className="text-orange-800 font-medium">"聚沙成塔，感谢每一份支持"</p>
            <p className="text-sm text-orange-600 mt-1">资金将用于服务器续费与功能开发</p>
          </div>
        </div>
      </div>
    </div>
  )

  if (variant === "footer") {
    return (
      <>
        <div className={`bg-gradient-to-b from-gray-50 to-white border-t border-gray-100 ${className}`}>
          <div className="max-w-6xl mx-auto px-4 py-12">
            <div className="text-center">
              <div className="flex justify-center mb-8">
                 <Button
                  onClick={() => setIsExpanded(!isExpanded)}
                  className={`
                    group relative overflow-hidden rounded-full px-8 py-6 text-base font-medium transition-all duration-300
                    ${isExpanded 
                      ? "bg-gray-100 text-gray-700 hover:bg-gray-200" 
                      : "bg-gradient-to-r from-red-500 to-pink-500 text-white hover:shadow-lg hover:scale-105 hover:from-red-600 hover:to-pink-600"
                    }
                  `}
                >
                  <Heart className={`h-5 w-5 mr-2 ${isExpanded ? "text-red-500" : "text-white animate-pulse"}`} />
                  {isExpanded ? "收起打赏信息" : "支持项目发展 (服务器募捐)"}
                  {isExpanded ? (
                    <ChevronUp className="h-4 w-4 ml-2 opacity-60" />
                  ) : (
                    <ChevronDown className="h-4 w-4 ml-2 opacity-80 group-hover:translate-y-0.5 transition-transform" />
                  )}
                </Button>
              </div>

              {isExpanded && (
                <div className="animate-in slide-in-from-top-4 fade-in duration-500 ease-out">
                  <div className="bg-white rounded-2xl p-8 border border-red-100 shadow-xl shadow-red-50/50 max-w-3xl mx-auto">
                    {content}
                  </div>
                </div>
              )}
            </div>
            
            {!isExpanded && (
               <p className="text-center text-gray-400 text-sm mt-4">
                 项目由个人维护，您的支持对我们很重要
               </p>
            )}
          </div>
        </div>
        <Modal />
      </>
    )
  }

  if (variant === "success") {
    return (
      <>
        <Card className={`bg-gradient-to-br from-yellow-50 to-orange-50 border-yellow-200 shadow-md ${className}`}>
          <CardHeader className="text-center pb-4">
            <CardTitle className="flex items-center justify-center text-xl text-orange-800">
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
      <Card className={`bg-gradient-to-br from-red-50 to-pink-50 border-red-200 shadow-lg ${className}`}>
        <CardHeader className="text-center border-b border-red-100 bg-white/50">
          <CardTitle className="flex items-center justify-center text-2xl text-red-700 py-2">
            <CircleDollarSign className="h-7 w-7 mr-3 text-red-500" />
            支持项目持续运行
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-8 pb-8 bg-white/30 backdrop-blur-sm">
          {content}
        </CardContent>
      </Card>
      <Modal />
    </>
  )
}
