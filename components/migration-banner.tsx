"use client"

import { useState } from "react"
import { X, AlertTriangle, ExternalLink } from "lucide-react"

export function MigrationBanner() {
  const [isVisible, setIsVisible] = useState(true)

  const handleDismiss = () => {
    setIsVisible(false)
  }

  return (
    <div
      className={`relative z-[60] bg-gradient-to-r from-red-600 via-red-500 to-orange-500 text-white transition-all duration-500 ${
        isVisible ? "max-h-60 opacity-100" : "max-h-0 opacity-0 overflow-hidden"
      }`}
    >
      {/* 顶部闪烁条 */}
      <div className="h-1 w-full bg-yellow-400 animate-pulse" />

      <div className="max-w-7xl mx-auto px-4 py-4 sm:px-6 lg:px-8">
        <div className="flex items-start gap-3 sm:gap-4">
          <div className="flex-shrink-0 mt-1">
            <div className="relative">
              <AlertTriangle className="h-7 w-7 sm:h-8 sm:w-8 text-yellow-300" />
              <span className="absolute -top-1 -right-1 flex h-3 w-3">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-yellow-300 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-3 w-3 bg-yellow-400"></span>
              </span>
            </div>
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-base sm:text-lg font-bold leading-snug tracking-wide">
              ⚠️ 重大迁移通知 — 请立即阅读
            </p>
            <p className="text-sm sm:text-base text-white/95 mt-2 leading-relaxed">
              由于<strong className="text-yellow-200">服务器成本问题</strong>，本网站
              <strong className="text-yellow-200 underline decoration-2 underline-offset-2">
                所有功能将在 2 周内迁移完毕并关闭
              </strong>。
            </p>
            <p className="text-sm sm:text-base text-white/95 mt-1 leading-relaxed">
              请大家尽快前往{" "}
              <strong className="text-yellow-200">「教链」小程序 — 工具箱</strong>
              {" "}或{" "}
              <a
                href="https://coachlink.fit"
                target="_blank"
                rel="noopener noreferrer"
                className="underline font-bold text-yellow-200 hover:text-white inline-flex items-center gap-1 transition-colors"
              >
                coachlink.fit
                <ExternalLink className="h-3.5 w-3.5 inline" />
              </a>
              {" "}继续使用，感谢理解与支持！
            </p>
          </div>
          <button
            onClick={handleDismiss}
            className="flex-shrink-0 p-2 rounded-full bg-white/10 hover:bg-white/25 transition-colors mt-0.5"
            aria-label="关闭通知"
          >
            <X className="h-5 w-5 text-white" />
          </button>
        </div>
      </div>
    </div>
  )
}
