import type { Metadata } from "next"

const SITE_URL = "https://jwcommunity.space"

export const metadata: Metadata = {
  title: "寻找单杠 | 街健力量指数",
  description: "查看全国单杠点位、补充图片与地址信息，帮助更多训练者快速找到可训练地点。",
  alternates: {
    canonical: `${SITE_URL}/locations`,
  },
  openGraph: {
    title: "寻找单杠 | 街健力量指数",
    description: "查看全国单杠点位、补充图片与地址信息，帮助更多训练者快速找到可训练地点。",
    url: `${SITE_URL}/locations`,
    siteName: "街健力量指数",
    type: "website",
  },
}

export default function LocationsLayout({ children }: { children: React.ReactNode }) {
  return children
}
