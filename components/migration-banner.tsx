"use client"

import { useState } from "react"
import { X, Clock, ExternalLink } from "lucide-react"

export function MigrationBanner() {
  const [isVisible, setIsVisible] = useState(true)

  const handleDismiss = () => {
    setIsVisible(false)
  }

  return (
    <div
      className={`relative z-[60] bg-gradient-to-r from-amber-500 to-orange-500 text-white transition-all duration-300 ${
        isVisible ? "max-h-40 opacity-100" : "max-h-0 opacity-0 overflow-hidden"
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 py-3 sm:px-6 lg:px-8">
        <div className="flex items-start gap-3">
          <div className="flex-shrink-0 mt-0.5">
            <Clock className="h-5 w-5 text-white animate-pulse" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm sm:text-base font-semibold leading-snug">
              📢 重大迁移通知
            </p>
            <p className="text-xs sm:text-sm text-white/90 mt-1 leading-relaxed">
              由于服务器成本问题，本网站<strong>所有功能将在 2 周内迁移完毕</strong>。
              请大家前往<strong>「教链」小程序 — 工具箱</strong>或{" "}
              <a
                href="https://coachlink.fit"
                target="_blank"
                rel="noopener noreferrer"
                className="underline font-semibold hover:text-white inline-flex items-center gap-0.5"
              >
                coachlink.fit
                <ExternalLink className="h-3 w-3 inline" />
              </a>{" "}
              继续使用。感谢大家的理解与支持！
            </p>
          </div>
          <button
            onClick={handleDismiss}
            className="flex-shrink-0 p-1 rounded-full hover:bg-white/20 transition-colors"
            aria-label="关闭通知"
          >
            <X className="h-4 w-4 text-white" />
          </button>
        </div>
      </div>
    </div>
  )
}
