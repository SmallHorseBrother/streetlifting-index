"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Slider } from "@/components/ui/slider"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { TrendingUp, Calculator, Info, AlertTriangle } from "lucide-react"
import Link from "next/link"
import { createClient } from "@supabase/supabase-js"
import { DonationSection } from "@/components/donation-section"
import { MobileNav } from "@/components/ui/mobile-nav"

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!)

interface FormulaCoefficients {
  coeff_a: number
  coeff_b: number
  coeff_c: number
  coeff_d: number
  coeff_e: number
  coeff_f: number
  last_updated: string
  total_submissions_used: number
}

export default function CalculatorPage() {
  const [formData, setFormData] = useState({
    gender: "",
    bodyweight: "",
    addedWeight: "",
    reps: "",
    formQuality: "",
    penaltyWeight: 3,
  })
  const [result, setResult] = useState<{ estimated_1rm: number; final_score: number; coefficient: number } | null>(null)
  const [isCalculating, setIsCalculating] = useState(false)
  const [error, setError] = useState("")
  const [formulas, setFormulas] = useState<{ Male?: FormulaCoefficients; Female?: FormulaCoefficients }>({})

  useEffect(() => {
    fetchFormulas()
  }, [])

  // 当动作质量改变时，自动调整惩罚重量到合适的范围
  useEffect(() => {
    if (formData.formQuality === "Minor_Cheat" && formData.penaltyWeight > 5) {
      setFormData(prev => ({ ...prev, penaltyWeight: 3 }))
    } else if (formData.formQuality === "Major_Cheat" && formData.penaltyWeight < 5) {
      setFormData(prev => ({ ...prev, penaltyWeight: 10 }))
    }
  }, [formData.formQuality])

  const fetchFormulas = async () => {
    try {
      const { data, error } = await supabase.from("formulas").select("*")

      if (error) throw error

      const formulaMap: { Male?: FormulaCoefficients; Female?: FormulaCoefficients } = {}
      data?.forEach((formula) => {
        formulaMap[formula.gender as "Male" | "Female"] = formula
      })
      setFormulas(formulaMap)
    } catch (err) {
      console.error("Error fetching formulas:", err)
    }
  }

  const handleCalculate = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsCalculating(true)
    setError("")
    setResult(null)

    try {
      const gender = formData.gender
      const bodyweight = Number.parseFloat(formData.bodyweight)
      const added_weight = Number.parseFloat(formData.addedWeight)
      const reps = Number.parseInt(formData.reps)
      const penalty_weight = ["Minor_Cheat", "Major_Cheat"].includes(formData.formQuality) ? formData.penaltyWeight : 0

      // Validate input
      if (!gender || !bodyweight || added_weight === undefined || !reps || !formData.formQuality) {
        throw new Error("Missing required parameters")
      }

      // Apply penalty weight to added weight
      const adjusted_added_weight = added_weight - penalty_weight

      // Check if adjusted weight is too low
      if (adjusted_added_weight < -bodyweight) {
        throw new Error("惩罚重量过高，调整后的负重不能使总重量为负")
      }

      // Get formula coefficients for the specified gender
      const { data: formula, error: formulaError } = await supabase
        .from("formulas")
        .select("*")
        .eq("gender", gender)
        .single()

      if (formulaError || !formula) {
        throw new Error("Formula not found for specified gender")
      }

      const totalWeight = bodyweight + adjusted_added_weight

      // If reps is 1, the total weight is already the 1RM
      let totalEstimated1RM = totalWeight;
      
      // Only calculate using formulas if reps > 1
      if (reps > 1) {
        // The Brzycki formula is undefined for reps >= 37.
        if (reps >= 37) {
          throw new Error("完成次数必须小于37次")
        }

        // Calculate 1RM using three different formulas for total weight
        const epley1RM = totalWeight * (1 + 0.0333 * reps)
        const brzycki1RM = totalWeight * (36 / (37 - reps))
        const lombardi1RM = totalWeight * Math.pow(reps, 0.1)

        // Average the results for a more accurate total 1RM
        totalEstimated1RM = (epley1RM + brzycki1RM + lombardi1RM) / 3
      }

      // The estimated 1RM for added weight is the total 1RM minus bodyweight
      const estimated1RM_added_weight = totalEstimated1RM - bodyweight

      // Calculate strength coefficient using polynomial (V0.1 formula)
      const W = bodyweight
      const coefficient =
        formula.coeff_b * Math.pow(W, 4) +
        formula.coeff_c * Math.pow(W, 3) +
        formula.coeff_d * Math.pow(W, 2) +
        formula.coeff_e * W +
        formula.coeff_f

      // Calculate final strength score using total estimated 1RM
      const finalScore = totalEstimated1RM * coefficient

      setResult({
        estimated_1rm: estimated1RM_added_weight,
        final_score: finalScore,
        coefficient: coefficient,
      })
    } catch (err: any) {
      setError(err.message || "计算失败，请检查输入数据或稍后重试")
      console.error("Calculation error:", err)
    } finally {
      setIsCalculating(false)
    }
  }

  const currentFormula = formData.gender ? formulas[formData.gender as "Male" | "Female"] : null

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      {/* Navigation */}
      <nav className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center">
              <Link href="/" className="flex items-center">
                <TrendingUp className="h-8 w-8 text-blue-600" />
                <span className="ml-2 text-xl font-bold text-gray-900">引体向上力量指数</span>
              </Link>
            </div>
            {/* Desktop Navigation */}
            <div className="hidden md:flex items-center space-x-8">
              <Link href="/" className="text-gray-700 hover:text-blue-600">
                首页
              </Link>
              <Link href="/submit" className="text-gray-700 hover:text-blue-600">
                数据提交
              </Link>
              <Link href="/calculator" className="text-gray-900 hover:text-blue-600">
                公式计算器
              </Link>
              <Link href="/data" className="text-gray-700 hover:text-blue-600">
                社区数据
              </Link>
              <Link href="/methodology" className="text-gray-700 hover:text-blue-600">
                方法论
              </Link>
            </div>
            {/* Mobile Navigation */}
            <div className="flex items-center md:hidden">
              <MobileNav />
            </div>
          </div>
        </div>
      </nav>

      <div className="py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-4">公式与计算器</h1>
            <p className="text-gray-600">使用最新的社区数据生成的公式，计算您的引体向上力量指数</p>
          </div>

          <div className="grid lg:grid-cols-2 gap-8">
            {/* Calculator */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Calculator className="h-5 w-5 mr-2" />
                  在线力量分计算器
                </CardTitle>
                <CardDescription>输入您的数据，获得基于最新公式的力量评估</CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleCalculate} className="space-y-4">
                  <div>
                    <Label htmlFor="gender">性别</Label>
                    <Select
                      value={formData.gender}
                      onValueChange={(value) => setFormData({ ...formData, gender: value })}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="选择性别" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Male">男性</SelectItem>
                        <SelectItem value="Female">女性</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="bodyweight">体重 (kg)</Label>
                      <Input
                        id="bodyweight"
                        type="number"
                        step="0.1"
                        placeholder="70.5"
                        value={formData.bodyweight}
                        onChange={(e) => setFormData({ ...formData, bodyweight: e.target.value })}
                        required
                      />
                    </div>

                    <div>
                      <Label htmlFor="addedWeight">附加负重 (kg)</Label>
                      <Input
                        id="addedWeight"
                        type="number"
                        step="0.1"
                        placeholder="0"
                        value={formData.addedWeight}
                        onChange={(e) => setFormData({ ...formData, addedWeight: e.target.value })}
                        required
                      />
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="reps">完成次数</Label>
                    <Input
                      id="reps"
                      type="number"
                      placeholder="8"
                      value={formData.reps}
                      onChange={(e) => setFormData({ ...formData, reps: e.target.value })}
                      required
                    />
                    <p className="mt-2 text-sm text-muted-foreground">
                      建议输入5次以内的次数，结果更准确。
                    </p>
                  </div>

                  <div>
                    <Label htmlFor="formQuality">动作质量</Label>
                    <Select
                      value={formData.formQuality}
                      onValueChange={(value) => setFormData({ ...formData, formQuality: value })}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="选择动作质量" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Competition">比赛级（标准动作）</SelectItem>
                        <SelectItem value="Minor_Cheat">轻微借力</SelectItem>
                        <SelectItem value="Major_Cheat">严重借力</SelectItem>
                      </SelectContent>
                    </Select>
                    <p className="mt-2 text-sm text-muted-foreground">
                      请诚实评估动作质量，这将影响最终的力量评分。
                    </p>
                  </div>

                  {["Minor_Cheat", "Major_Cheat"].includes(formData.formQuality) && (
                    <div>
                      <Label htmlFor="penaltyWeight">
                        惩罚重量: {formData.penaltyWeight}kg
                      </Label>
                      <Slider
                        id="penaltyWeight"
                        min={formData.formQuality === "Minor_Cheat" ? 2 : 5}
                        max={formData.formQuality === "Minor_Cheat" ? 5 : 20}
                        step={0.5}
                        value={[formData.penaltyWeight]}
                        onValueChange={(value) => setFormData({ ...formData, penaltyWeight: value[0] })}
                        className="mt-2"
                      />
                      <p className="mt-2 text-sm text-muted-foreground">
                        {formData.formQuality === "Minor_Cheat" 
                          ? "轻微借力：2-5kg 惩罚重量"
                          : "严重借力：5-20kg 惩罚重量"
                        }
                      </p>
                    </div>
                  )}

                  {formData.formQuality === "Competition" && (
                    <Alert className="border-green-200 bg-green-50">
                      <AlertTriangle className="h-4 w-4 text-green-600" />
                      <AlertDescription className="text-green-800">
                        <strong>比赛级动作：</strong>无惩罚重量，按标准动作计算力量分数。
                      </AlertDescription>
                    </Alert>
                  )}

                  <Button type="submit" className="w-full" disabled={isCalculating}>
                    {isCalculating ? "计算中..." : "计算力量指数"}
                  </Button>
                </form>

                {error && (
                  <Alert className="mt-4 border-red-200 bg-red-50">
                    <AlertDescription className="text-red-800">{error}</AlertDescription>
                  </Alert>
                )}

                {result && (
                  <div className="mt-6 p-4 bg-green-50 rounded-lg border border-green-200">
                    <h3 className="font-semibold text-green-800 mb-2">计算结果</h3>
                    <div className="space-y-2">
                      {["Minor_Cheat", "Major_Cheat"].includes(formData.formQuality) && (
                        <p className="text-orange-700">
                          <strong>惩罚重量：</strong> -{formData.penaltyWeight}kg
                        </p>
                      )}
                      <p className="text-green-700">
                        <strong>实际用于计算的负重：</strong> {(Number.parseFloat(formData.addedWeight) - (["Minor_Cheat", "Major_Cheat"].includes(formData.formQuality) ? formData.penaltyWeight : 0)).toFixed(1)} kg
                      </p>
                      <p className="text-green-700">
                        <strong>估算1RM：</strong> {result.estimated_1rm.toFixed(1)} kg
                      </p>
                      <p className="text-green-700">
                        <strong>最终力量分：</strong> {result.final_score.toFixed(0)} 分
                      </p>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Current Formula Display */}
            <Card>
              <CardHeader>
                <CardTitle>当前系数公式</CardTitle>
                <CardDescription>基于社区数据生成的最新力量系数公式</CardDescription>
              </CardHeader>
              <CardContent>
                {currentFormula ? (
                  <div className="space-y-4">
                    <div>
                      <h4 className="font-semibold mb-2">{formData.gender === "Male" ? "男性" : "女性"}系数公式</h4>
                      <div className="bg-gray-50 p-3 rounded font-mono text-sm">
                        C(W) = {currentFormula.coeff_a.toExponential(3)}×W⁵ + {currentFormula.coeff_b.toExponential(3)}
                        ×W⁴ + {currentFormula.coeff_c.toExponential(3)}×W³ + {currentFormula.coeff_d.toExponential(3)}
                        ×W² + {currentFormula.coeff_e.toExponential(3)}×W + {currentFormula.coeff_f.toFixed(3)}
                      </div>
                    </div>

                    <div className="text-sm text-gray-600 space-y-1">
                      <p>
                        <strong>数据来源：</strong> {currentFormula.total_submissions_used} 条有效提交
                      </p>
                      <p>
                        <strong>更新时间：</strong> {new Date(currentFormula.last_updated).toLocaleString("zh-CN")}
                      </p>
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-8 text-gray-500">
                    <Info className="h-12 w-12 mx-auto mb-4 opacity-50" />
                    <p>请选择性别以查看对应的公式系数</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Data Visualization Placeholder */}
          <div className="mt-12">
            <Card>
              <CardHeader>
                <CardTitle>数据可视化</CardTitle>
                <CardDescription>基于社区数据的分析图表</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid md:grid-cols-2 gap-8">
                  <div className="text-center">
                    <h4 className="font-semibold mb-4">体重 vs 1RM总拉力分布图</h4>
                    <div className="bg-gray-100 h-64 rounded-lg flex items-center justify-center">
                      <p className="text-gray-500">图表将在数据足够时显示</p>
                    </div>
                  </div>

                  <div className="text-center">
                    <h4 className="font-semibold mb-4">性能包络线与力量系数曲线</h4>
                    <div className="bg-gray-100 h-64 rounded-lg flex items-center justify-center">
                      <p className="text-gray-500">图表将在数据足够时显示</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      {/* Donation Section */}
      <DonationSection variant="footer" />
    </div>
  )
}
