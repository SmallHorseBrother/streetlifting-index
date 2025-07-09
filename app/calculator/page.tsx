"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Slider } from "@/components/ui/slider"
import { calculateScore } from "@/lib/calculate-score"

export default function CalculatorPage() {
  const [gender, setGender] = useState<"Male" | "Female">("Male")
  const [bodyweight, setBodyweight] = useState(70)
  const [addedWeight, setAddedWeight] = useState(0)
  const [reps, setReps] = useState(1)
  const [result, setResult] = useState<{
    estimated_1rm: number
    final_score: number
    coefficient: number
  } | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleCalculate = async () => {
    setLoading(true)
    setError(null)

    try {
      const calculationResult = await calculateScore(gender, bodyweight, addedWeight, reps)
      setResult(calculationResult)
    } catch (err) {
      setError(err instanceof Error ? err.message : "计算失败")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 py-12 px-4">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">引体向上强度计算器</h1>
          <p className="text-xl text-gray-600">输入你的数据，计算标准化强度分数</p>
        </div>

        <div className="grid md:grid-cols-2 gap-8">
          {/* 输入表单 */}
          <Card>
            <CardHeader>
              <CardTitle>输入参数</CardTitle>
              <CardDescription>填写你的基本信息和训练数据</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="gender">性别</Label>
                <Select value={gender} onValueChange={(value: "Male" | "Female") => setGender(value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="选择性别" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Male">男性</SelectItem>
                    <SelectItem value="Female">女性</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="bodyweight">体重 (kg)</Label>
                <div className="px-3">
                  <Slider
                    value={[bodyweight]}
                    onValueChange={(value) => setBodyweight(value[0])}
                    max={150}
                    min={40}
                    step={1}
                    className="w-full"
                  />
                  <div className="flex justify-between text-sm text-gray-500 mt-1">
                    <span>40kg</span>
                    <span className="font-medium">{bodyweight}kg</span>
                    <span>150kg</span>
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="added-weight">负重 (kg)</Label>
                <div className="px-3">
                  <Slider
                    value={[addedWeight]}
                    onValueChange={(value) => setAddedWeight(value[0])}
                    max={100}
                    min={0}
                    step={0.5}
                    className="w-full"
                  />
                  <div className="flex justify-between text-sm text-gray-500 mt-1">
                    <span>0kg</span>
                    <span className="font-medium">{addedWeight}kg</span>
                    <span>100kg</span>
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="reps">次数</Label>
                <div className="px-3">
                  <Slider
                    value={[reps]}
                    onValueChange={(value) => setReps(value[0])}
                    max={50}
                    min={1}
                    step={1}
                    className="w-full"
                  />
                  <div className="flex justify-between text-sm text-gray-500 mt-1">
                    <span>1次</span>
                    <span className="font-medium">{reps}次</span>
                    <span>50次</span>
                  </div>
                </div>
              </div>

              <Button onClick={handleCalculate} className="w-full" disabled={loading}>
                {loading ? "计算中..." : "计算强度分数"}
              </Button>

              {error && <div className="text-red-600 text-sm mt-2">错误: {error}</div>}
            </CardContent>
          </Card>

          {/* 结果显示 */}
          <Card>
            <CardHeader>
              <CardTitle>计算结果</CardTitle>
              <CardDescription>基于社区数据的标准化分数</CardDescription>
            </CardHeader>
            <CardContent>
              {result ? (
                <div className="space-y-4">
                  <div className="text-center">
                    <div className="text-3xl font-bold text-blue-600 mb-2">{result.final_score.toFixed(2)}</div>
                    <div className="text-gray-600">强度分数</div>
                  </div>

                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div className="bg-gray-50 p-3 rounded">
                      <div className="font-medium text-gray-700">预估1RM</div>
                      <div className="text-lg font-bold">{result.estimated_1rm.toFixed(1)}kg</div>
                    </div>
                    <div className="bg-gray-50 p-3 rounded">
                      <div className="font-medium text-gray-700">强度系数</div>
                      <div className="text-lg font-bold">{result.coefficient.toFixed(4)}</div>
                    </div>
                  </div>

                  <div className="text-xs text-gray-500 mt-4">
                    * 分数基于社区数据计算，用于横向比较不同体重选手的相对强度
                  </div>
                </div>
              ) : (
                <div className="text-center text-gray-500 py-8">填写参数并点击计算按钮查看结果</div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* 说明信息 */}
        <Card className="mt-8">
          <CardHeader>
            <CardTitle>计算说明</CardTitle>
          </CardHeader>
          <CardContent className="prose max-w-none">
            <div className="grid md:grid-cols-2 gap-6 text-sm">
              <div>
                <h4 className="font-semibold mb-2">计算方法</h4>
                <ul className="space-y-1 text-gray-600">
                  <li>• 使用 Epley 公式估算 1RM</li>
                  <li>• 基于体重的多项式系数调整</li>
                  <li>• 男女分别建立不同的计算模型</li>
                  <li>• 持续根据社区数据优化公式</li>
                </ul>
              </div>
              <div>
                <h4 className="font-semibold mb-2">分数意义</h4>
                <ul className="space-y-1 text-gray-600">
                  <li>• 分数越高表示相对强度越强</li>
                  <li>• 可用于不同体重选手间的比较</li>
                  <li>• 基于大量真实训练数据</li>
                  <li>• 定期更新以保持准确性</li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
