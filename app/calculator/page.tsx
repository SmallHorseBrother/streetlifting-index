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
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs"

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

type CalcResult = {
  estimated_1rm: number
  final_score: number
  coefficient: number
  computed_added_weight?: number
  computed_reps?: number
  adjusted_added_weight?: number
  total_1rm?: number
}

// 运动类型定义
type ExerciseType = 'weighted_pullup' | 'weighted_dips' | 'squat' | 'bench' | 'deadlift'

// 判断是否为上肢类运动（使用枭马葛公式）
const isUpperBodyExercise = (type: ExerciseType) => ['weighted_pullup', 'weighted_dips'].includes(type)

// 判断是否为力量三项（使用DOTS系数）
const isPowerliftingExercise = (type: ExerciseType) => ['squat', 'bench', 'deadlift'].includes(type)

// DOTS 系数计算函数 - 用于深蹲、卧推、硬拉
// 公式: DOTS = 500 / (A*x^4 + B*x^3 + C*x^2 + D*x + E)
const computeDOTSCoefficient = (weight: number, isMale: boolean) => {
  // 官方 DOTS 系数 (最新版本)
  const A = isMale ? -0.0000010930 : -0.0000010706
  const B = isMale ? 0.0007391293 : 0.0005158568
  const C = isMale ? -0.1918759221 : -0.1126655495
  const D = isMale ? 24.0900756 : 13.6175032
  const E = isMale ? -307.75076 : -57.96288
  
  const denom = A * Math.pow(weight, 4) + B * Math.pow(weight, 3) + C * Math.pow(weight, 2) + D * weight + E
  return 500 / denom
}

// 获取力量等级描述
const getScoreLevel = (score: number, isPowerlifting: boolean): { level: string; color: string } => {
  if (isPowerlifting) {
    // DOTS 等级
    if (score >= 520) return { level: "🏆 世界级", color: "text-purple-600" }
    if (score >= 450) return { level: "🥇 国内顶级", color: "text-yellow-600" }
    if (score >= 380) return { level: "💪 大佬", color: "text-blue-600" }
    if (score >= 300) return { level: "🔥 爱好者水平", color: "text-green-600" }
    return { level: "🌱 菜就多练", color: "text-gray-600" }
  } else {
    // 引体/臂屈伸等级 (满分500)
    if (score >= 500) return { level: "🏆 世界级", color: "text-purple-600" }
    if (score >= 450) return { level: "🥇 国内顶级", color: "text-yellow-600" }
    if (score >= 400) return { level: "💪 大佬", color: "text-blue-600" }
    if (score >= 300) return { level: "🔥 爱好者水平", color: "text-green-600" }
    return { level: "🌱 菜就多练", color: "text-gray-600" }
  }
}

export default function CalculatorPage() {
  const [formData, setFormData] = useState({
    gender: "",
    bodyweight: "",
    addedWeight: "",
    added1RM: "",
    workingAddedWeight: "",
    liftWeight: "", // 新增：三大项使用的重量
    reps: "",
    sets: "",
    restCat: "",
    dayFirstType: "", // "RIR" | "Achieved"
    dayFirstValue: "",
    dayLastType: "",
    dayLastValue: "",
    formQuality: "",
    penaltyWeight: 3,
  })
  const [exerciseType, setExerciseType] = useState<ExerciseType>('weighted_pullup')
  const [mode, setMode] = useState<"forward" | "reverse_weight" | "reverse_reps" | "day_max">("forward")
  const [result, setResult] = useState<CalcResult | null>(null)
  const [isCalculating, setIsCalculating] = useState(false)
  const [error, setError] = useState("")
  const [formulas, setFormulas] = useState<{ Male?: FormulaCoefficients; Female?: FormulaCoefficients }>({})

  useEffect(() => {
    fetchFormulas()
  }, [])

  // 当动作质量改变时，自动调整惩罚重量到合适的范围
  useEffect(() => {
    if (formData.formQuality === "Minor_Cheat") {
      if (formData.penaltyWeight < 2 || formData.penaltyWeight > 5) {
        setFormData(prev => ({ ...prev, penaltyWeight: 3 }))
      }
    } else if (formData.formQuality === "Major_Cheat") {
      if (formData.penaltyWeight < 5 || formData.penaltyWeight > 20) {
        setFormData(prev => ({ ...prev, penaltyWeight: 10 }))
      }
    } else if (formData.formQuality === "Extreme_Cheat") {
      if (formData.penaltyWeight < 20 || formData.penaltyWeight > 50) {
        setFormData(prev => ({ ...prev, penaltyWeight: 30 }))
      }
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

  const computeCoefficient = (W: number, formula: FormulaCoefficients) => {
    return (
      formula.coeff_b * Math.pow(W, 4) +
      formula.coeff_c * Math.pow(W, 3) +
      formula.coeff_d * Math.pow(W, 2) +
      formula.coeff_e * W +
      formula.coeff_f
    )
  }

  const estimateTotal1RMFromTotalWeightAndReps = (totalWeight: number, reps: number) => {
    if (reps === 1) return totalWeight
    if (reps >= 37) throw new Error("完成次数必须小于37次")
    const epley1RM = totalWeight * (1 + 0.0333 * reps)
    const brzycki1RM = totalWeight * (36 / (37 - reps))
    const lombardi1RM = totalWeight * Math.pow(reps, 0.1)
    return (epley1RM + brzycki1RM + lombardi1RM) / 3
  }

  const invertTotalWeightForTarget1RM = (targetTotal1RM: number, reps: number) => {
    if (reps === 1) return targetTotal1RM
    if (reps < 1 || reps >= 37) throw new Error("完成次数必须在1到36之间")
    const wtE = targetTotal1RM / (1 + 0.0333 * reps)
    const wtB = targetTotal1RM * ((37 - reps) / 36)
    const wtL = targetTotal1RM / Math.pow(reps, 0.1)
    return (wtE + wtB + wtL) / 3
  }

  const estimateRepsForTarget1RM = (targetTotal1RM: number, totalWorkingWeight: number) => {
    let bestReps = 1
    let bestDiff = Math.abs(estimateTotal1RMFromTotalWeightAndReps(totalWorkingWeight, 1) - targetTotal1RM)
    for (let r = 2; r <= 36; r++) {
      const diff = Math.abs(estimateTotal1RMFromTotalWeightAndReps(totalWorkingWeight, r) - targetTotal1RM)
      if (diff < bestDiff) {
        bestDiff = diff
        bestReps = r
      }
    }
    return bestReps
  }

  // Continuous reps estimation (Epley-only, linear inversion)
  const estimateRepsForTarget1RMContinuous = (targetTotal1RM: number, totalWorkingWeight: number) => {
    if (totalWorkingWeight <= 0 || targetTotal1RM <= 0) return 0
    const ratio = targetTotal1RM / totalWorkingWeight
    const rE = (ratio - 1) / 0.0333
    return Math.max(0.1, rE)
  }

  // Day max estimation (without quality multiplier; using penalty only)
  type RestCat = "short" | "moderate" | "long" | "very_long"
  const restMultiplier = (cat: RestCat) => {
    switch (cat) {
      case "short": return 1.6
      case "moderate": return 1.25
      case "long": return 1.0
      case "very_long": return 0.85
      default: return 1.0
    }
  }

  const intensityAvg = (reps: number) => {
    const r = Math.max(1, Math.min(36, Math.round(reps)))
    const e = 1 / (1 + 0.0333 * r)
    const b = (37 - r) / 36
    const l = Math.pow(r, -0.1)
    return (e + b + l) / 3
  }

  const estimateDayMaxFromSets = (params: {
    bodyweight: number
    addedWeight: number
    penaltyWeight: number
    sets: number
    reps: number
    restCat: RestCat
    firstSet?: { type: "RIR" | "Achieved"; value: number }
    lastSet?: { type: "RIR" | "Achieved"; value: number }
    alphaPerRep?: number
  }) => {
    const { bodyweight: W, addedWeight: A, penaltyWeight: P, sets: n, reps: r, restCat, firstSet, lastSet, alphaPerRep = 0.004 } = params
    const adjustedAdded = A - P
    const Tw = W + adjustedAdded
    if (!Number.isFinite(Tw) || Tw <= 0) throw new Error("输入导致总重量无效")
    const rm = restMultiplier(restCat)
    const beta = alphaPerRep * r * rm
    const lastAvail = Math.max(0.75, 1 - (n - 1) * beta)
    const effReps = (input?: { type: "RIR" | "Achieved"; value: number }) => {
      if (!input) return null
      const v = input.type === "RIR" ? r + input.value : input.value
      return Math.max(1, Math.min(36, v))
    }
    const r1 = effReps(firstSet)
    const rn = effReps(lastSet)
    let D_first: number | null = null
    let D_last: number | null = null
    if (r1 !== null) {
      const I1 = intensityAvg(r1)
      D_first = Tw / I1
    }
    if (rn !== null) {
      const In = intensityAvg(rn)
      D_last = Tw / (In * lastAvail)
    }
    let D_day: number
    if (D_first !== null && D_last !== null) {
      // 第一组占比80%，最后一组占比20%
      const w_first = 0.8
      const w_last = 0.2
      D_day = w_first * D_first + w_last * D_last
    } else if (D_first !== null) {
      D_day = D_first
    } else if (D_last !== null) {
      D_day = D_last
    } else {
      throw new Error("请输入第一组或最后一组的RIR/实际次数信息")
    }
    return { total1RM: D_day, added1RM: D_day - W }
  }

  const handleCalculate = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsCalculating(true)
    setError("")
    setResult(null)

    try {
      const gender = formData.gender
      const bodyweight = Number.parseFloat(formData.bodyweight)
      const isMale = gender === "Male"
      
      // 所有运动都支持动作质量惩罚
      const penalty_weight = ["Minor_Cheat", "Major_Cheat", "Extreme_Cheat"].includes(formData.formQuality) 
        ? formData.penaltyWeight 
        : 0

      if (!gender || !bodyweight) {
        throw new Error("请完整填写性别和体重")
      }

      // 所有运动都需要动作质量
      if (!formData.formQuality) {
        throw new Error("请选择动作质量")
      }

      // ==== 力量三项计算 (使用 DOTS) ====
      if (isPowerliftingExercise(exerciseType)) {
        const liftWeight = Number.parseFloat(formData.liftWeight)
        const reps = Number.parseInt(formData.reps)
        
        if (!Number.isFinite(liftWeight) || liftWeight <= 0) {
          throw new Error("请填写有效的使用重量")
        }
        if (!Number.isFinite(reps) || reps <= 0) {
          throw new Error("请填写有效的完成次数")
        }
        
        // 扣除惩罚重量
        const adjustedWeight = liftWeight - penalty_weight
        if (adjustedWeight <= 0) {
          throw new Error("惩罚重量过高，调整后的重量必须大于0")
        }
        
        // 使用三公式平均法估算1RM
        const estimated1RM = estimateTotal1RMFromTotalWeightAndReps(adjustedWeight, reps)
        
        // 使用 DOTS 系数
        const coefficient = computeDOTSCoefficient(bodyweight, isMale)
        const finalScore = estimated1RM * coefficient
        
        setResult({
          estimated_1rm: estimated1RM,
          final_score: finalScore,
          coefficient,
          total_1rm: estimated1RM,
          adjusted_added_weight: penalty_weight > 0 ? adjustedWeight : undefined,
        })
        return
      }

      // ==== 上肢类计算 (使用枭马葛公式) ====
      // Get formula coefficients for the specified gender
      const { data: formula, error: formulaError } = await supabase
        .from("formulas")
        .select("*")
        .eq("gender", gender)
        .single()

      if (formulaError || !formula) {
        throw new Error("Formula not found for specified gender")
      }
      if (mode === "forward") {
        const added_weight = Number.parseFloat(formData.addedWeight)
        const reps = Number.parseInt(formData.reps)
        if (!Number.isFinite(added_weight) || !Number.isFinite(reps)) {
          throw new Error("请填写附加负重与次数")
        }
        const adjusted_added_weight = added_weight - penalty_weight
        if (adjusted_added_weight < -bodyweight) {
          throw new Error("惩罚重量过高，调整后的负重不能使总重量为负")
        }
        const totalWeight = bodyweight + adjusted_added_weight
        const totalEstimated1RM = estimateTotal1RMFromTotalWeightAndReps(totalWeight, reps)
        const estimated1RM_added_weight = totalEstimated1RM - bodyweight
        const coefficient = computeCoefficient(bodyweight, formula)
        const finalScore = totalEstimated1RM * coefficient
        setResult({
          estimated_1rm: estimated1RM_added_weight,
          final_score: finalScore,
          coefficient,
          adjusted_added_weight,
          total_1rm: totalEstimated1RM,
        })
      } else if (mode === "reverse_weight") {
        const added1RM = Number.parseFloat(formData.added1RM)
        const reps = Number.parseInt(formData.reps)
        if (!Number.isFinite(added1RM) || !Number.isFinite(reps)) {
          throw new Error("请填写负重1RM与次数")
        }
        const targetTotal1RM = bodyweight + added1RM
        const totalWorkingWeight = invertTotalWeightForTarget1RM(targetTotal1RM, reps)
        if (totalWorkingWeight <= 0) {
          throw new Error("计算得到的总重量无效，请检查输入")
        }
        const adjusted_added_weight = totalWorkingWeight - bodyweight
        if (adjusted_added_weight < -bodyweight) {
          throw new Error("惩罚重量过高，调整后的负重不能使总重量为负")
        }
        const added_weight = adjusted_added_weight + penalty_weight
        const coefficient = computeCoefficient(bodyweight, formula)
        const finalScore = targetTotal1RM * coefficient
        setResult({
          estimated_1rm: added1RM,
          final_score: finalScore,
          coefficient,
          computed_added_weight: added_weight,
          adjusted_added_weight,
          total_1rm: targetTotal1RM,
        })
      } else if (mode === "reverse_reps") {
        const added1RM = Number.parseFloat(formData.added1RM)
        const workingAddedWeight = Number.parseFloat(formData.workingAddedWeight)
        if (!Number.isFinite(added1RM) || !Number.isFinite(workingAddedWeight)) {
          throw new Error("请填写负重1RM与做组重量")
        }
        const targetTotal1RM = bodyweight + added1RM
        const adjusted_added_weight = workingAddedWeight - penalty_weight
        const totalWorkingWeight = bodyweight + adjusted_added_weight
        if (adjusted_added_weight < -bodyweight || totalWorkingWeight <= 0) {
          throw new Error("输入的做组重量或惩罚不合理，导致总重量无效")
        }
        const repsContinuous = estimateRepsForTarget1RMContinuous(targetTotal1RM, totalWorkingWeight)
        const coefficient = computeCoefficient(bodyweight, formula)
        const finalScore = targetTotal1RM * coefficient
        setResult({
          estimated_1rm: added1RM,
          final_score: finalScore,
          coefficient,
          computed_reps: Number.parseFloat(repsContinuous.toFixed(1)),
          adjusted_added_weight,
          total_1rm: targetTotal1RM,
        })
      } else if (mode === "day_max") {
        const sets = Number.parseInt(formData.sets)
        const reps = Number.parseInt(formData.reps)
        const addedWeight = Number.parseFloat(formData.addedWeight)
        const restCat = (formData.restCat || "long") as any
        if (!Number.isFinite(sets) || sets <= 0) throw new Error("请填写有效的组数")
        if (!Number.isFinite(reps) || reps <= 0) throw new Error("请填写有效的每组次数")
        if (!Number.isFinite(addedWeight)) throw new Error("请填写做组重量")
        const firstSet = formData.dayFirstType && formData.dayFirstValue
          ? { type: formData.dayFirstType as any, value: Number.parseFloat(formData.dayFirstValue) }
          : undefined
        const lastSet = formData.dayLastType && formData.dayLastValue
          ? { type: formData.dayLastType as any, value: Number.parseFloat(formData.dayLastValue) }
          : undefined

        if (!firstSet && !lastSet) {
          throw new Error("请至少输入第一组或最后一组的信息")
        }

        const { total1RM, added1RM } = estimateDayMaxFromSets({
          bodyweight,
          addedWeight,
          penaltyWeight: penalty_weight,
          sets,
          reps,
          restCat,
          firstSet,
          lastSet,
        })

        const coefficient = computeCoefficient(bodyweight, formula)
        const finalScore = total1RM * coefficient
        setResult({
          estimated_1rm: added1RM,
          final_score: finalScore,
          coefficient,
          adjusted_added_weight: addedWeight - penalty_weight,
        })
      }
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
              <Link href="/stories" className="text-gray-700 hover:text-blue-600">
                街头健身故事会
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
                  {/* 运动类型选择 */}
                  <div>
                    <Label htmlFor="exerciseType">运动类型</Label>
                    <Select
                      value={exerciseType}
                      onValueChange={(value) => { setExerciseType(value as ExerciseType); setResult(null); setError("") }}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="选择运动类型" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="weighted_pullup">💪 负重引体向上</SelectItem>
                        <SelectItem value="weighted_dips">💪 负重双杠臂屈伸</SelectItem>
                        <SelectItem value="squat">🏋️ 深蹲 (DOTS)</SelectItem>
                        <SelectItem value="bench">🏋️ 卧推 (DOTS)</SelectItem>
                        <SelectItem value="deadlift">🏋️ 硬拉 (DOTS)</SelectItem>
                      </SelectContent>
                    </Select>
                    <p className="mt-1 text-xs text-muted-foreground">
                      {isUpperBodyExercise(exerciseType) 
                        ? "使用枭马葛公式计算力量分（满分500分）"
                        : "使用国际标准 DOTS 公式计算力量分"
                      }
                    </p>
                    {isUpperBodyExercise(exerciseType) && (
                      <Alert className="mt-2 border-amber-200 bg-amber-50">
                        <AlertTriangle className="h-4 w-4 text-amber-600" />
                        <AlertDescription className="text-amber-800 text-xs">
                          <strong>注意：</strong>引体和臂屈伸公式对100kg以上体重的人估算不够准确（数据不足）
                        </AlertDescription>
                      </Alert>
                    )}
                  </div>

                  {/* 计算模式 - 仅上肢类显示全部模式 */}
                  {isUpperBodyExercise(exerciseType) ? (
                    <div>
                      <Label>计算模式</Label>
                      <div className="mt-2">
                        <Tabs value={mode} onValueChange={(v) => { setMode(v as any); setResult(null); setError("") }}>
                          <TabsList>
                            <TabsTrigger value="forward">正向计算</TabsTrigger>
                            <TabsTrigger value="reverse_weight">反推做组重量</TabsTrigger>
                            <TabsTrigger value="reverse_reps">反推次数</TabsTrigger>
                            <TabsTrigger value="day_max">做组极限估算</TabsTrigger>
                          </TabsList>
                        </Tabs>
                      </div>
                    </div>
                  ) : (
                    <Alert className="border-blue-200 bg-blue-50">
                      <Info className="h-4 w-4 text-blue-600" />
                      <AlertDescription className="text-blue-800">
                        <strong>力量三项计算：</strong>使用国际标准 DOTS 系数进行跨体重力量比较
                      </AlertDescription>
                    </Alert>
                  )}
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

                    {/* 上肢类：附加负重 */}
                    {isUpperBodyExercise(exerciseType) && mode === "forward" && (
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
                    )}

                    {/* 三大项：使用重量 */}
                    {isPowerliftingExercise(exerciseType) && (
                      <div>
                        <Label htmlFor="liftWeight">使用重量 (kg)</Label>
                        <Input
                          id="liftWeight"
                          type="number"
                          step="0.5"
                          placeholder="100"
                          value={formData.liftWeight}
                          onChange={(e) => setFormData({ ...formData, liftWeight: e.target.value })}
                          required
                        />
                      </div>
                    )}
                  </div>

                  {/* 上肢类的其他计算模式输入 */}
                  {isUpperBodyExercise(exerciseType) && mode === "reverse_weight" && (
                    <div>
                      <Label htmlFor="added1RM">负重1RM (kg)</Label>
                      <Input
                        id="added1RM"
                        type="number"
                        step="0.1"
                        placeholder="例如 50"
                        value={formData.added1RM}
                        onChange={(e) => setFormData({ ...formData, added1RM: e.target.value })}
                        required
                      />
                    </div>
                  )}

                  {isUpperBodyExercise(exerciseType) && mode === "reverse_reps" && (
                    <div>
                      <Label htmlFor="workingAddedWeight">做组重量（附加负重）(kg)</Label>
                      <Input
                        id="workingAddedWeight"
                        type="number"
                        step="0.1"
                        placeholder="例如 20"
                        value={formData.workingAddedWeight}
                        onChange={(e) => setFormData({ ...formData, workingAddedWeight: e.target.value })}
                        required
                      />
                    </div>
                  )}

                  {/* 次数输入 - 上肢类和三大项都需要 */}
                  {(isUpperBodyExercise(exerciseType) ? (mode === "forward" || mode === "reverse_weight") : true) && (
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
                  )}

                  {isUpperBodyExercise(exerciseType) && mode === "day_max" && (
                    <>
                      <Alert className="mb-4 border-blue-200 bg-blue-50">
                        <Info className="h-4 w-4 text-blue-600" />
                        <AlertDescription className="text-blue-800">
                          <strong>做组极限估算：</strong>根据您的做组表现（组数、次数、休息时长）以及第一组或最后一组的完成情况，科学估算您当天的最佳极限负重能力。（若两者都填，第一组信息占比80%）
                        </AlertDescription>
                      </Alert>
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <Label htmlFor="addedWeight_day">做组重量（附加负重）(kg)</Label>
                          <Input
                            id="addedWeight_day"
                            type="number"
                            step="0.1"
                            placeholder="例如 50"
                            value={formData.addedWeight}
                            onChange={(e) => setFormData({ ...formData, addedWeight: e.target.value })}
                          />
                        </div>
                        <div>
                          <Label htmlFor="sets">组数</Label>
                          <Input
                            id="sets"
                            type="number"
                            placeholder="例如 5"
                            value={formData.sets}
                            onChange={(e) => setFormData({ ...formData, sets: e.target.value })}
                          />
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <Label htmlFor="reps_day">每组次数</Label>
                          <Input
                            id="reps_day"
                            type="number"
                            placeholder="例如 5"
                            value={formData.reps}
                            onChange={(e) => setFormData({ ...formData, reps: e.target.value })}
                          />
                        </div>
                        <div>
                          <Label htmlFor="restCat">平均休息</Label>
                          <Select
                            value={formData.restCat}
                            onValueChange={(value) => setFormData({ ...formData, restCat: value })}
                          >
                            <SelectTrigger>
                              <SelectValue placeholder="选择休息时长" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="short">≤90秒</SelectItem>
                              <SelectItem value="moderate">90秒-3分钟</SelectItem>
                              <SelectItem value="long">3-5分钟</SelectItem>
                              <SelectItem value="very_long">&gt;5分钟</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <Label>第一组信息</Label>
                          <div className="grid grid-cols-2 gap-2 mt-2">
                            <Select
                              value={formData.dayFirstType}
                              onValueChange={(v) => setFormData({ ...formData, dayFirstType: v })}
                            >
                              <SelectTrigger>
                                <SelectValue placeholder="类型 (可选)" />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="RIR">RIR</SelectItem>
                                <SelectItem value="Achieved">实际次数</SelectItem>
                              </SelectContent>
                            </Select>
                            <Input
                              type="number"
                              placeholder="数值 (可选)"
                              value={formData.dayFirstValue}
                              onChange={(e) => setFormData({ ...formData, dayFirstValue: e.target.value })}
                            />
                          </div>
                        </div>
                        <div>
                          <Label>最后一组信息</Label>
                          <div className="grid grid-cols-2 gap-2 mt-2">
                            <Select
                              value={formData.dayLastType}
                              onValueChange={(v) => setFormData({ ...formData, dayLastType: v })}
                            >
                              <SelectTrigger>
                                <SelectValue placeholder="类型 (可选)" />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="RIR">RIR</SelectItem>
                                <SelectItem value="Achieved">实际次数</SelectItem>
                              </SelectContent>
                            </Select>
                            <Input
                              type="number"
                              placeholder="数值 (可选)"
                              value={formData.dayLastValue}
                              onChange={(e) => setFormData({ ...formData, dayLastValue: e.target.value })}
                            />
                          </div>
                        </div>
                      </div>
                    </>
                  )}

                  {/* 动作质量 - 所有运动都需要 */}
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
                        <SelectItem value="Minor_Cheat">轻微借力（2-5kg）</SelectItem>
                        <SelectItem value="Major_Cheat">严重借力（5-20kg）</SelectItem>
                        <SelectItem value="Extreme_Cheat">超严重借力（20-50kg）</SelectItem>
                      </SelectContent>
                    </Select>
                    <p className="mt-2 text-sm text-muted-foreground">
                      {isPowerliftingExercise(exerciseType) 
                        ? "请诚实评估动作质量（如深度、锁定、ROM等），这将影响最终的力量评分。"
                        : "请诚实评估动作质量，这将影响最终的力量评分。"
                      }
                    </p>
                  </div>

                  {["Minor_Cheat", "Major_Cheat", "Extreme_Cheat"].includes(formData.formQuality) && (
                    <div>
                      <Label htmlFor="penaltyWeight">
                        惩罚重量: {formData.penaltyWeight}kg
                      </Label>
                      <Slider
                        id="penaltyWeight"
                        min={formData.formQuality === "Minor_Cheat" ? 2 : formData.formQuality === "Major_Cheat" ? 5 : 20}
                        max={formData.formQuality === "Minor_Cheat" ? 5 : formData.formQuality === "Major_Cheat" ? 20 : 50}
                        step={0.5}
                        value={[formData.penaltyWeight]}
                        onValueChange={(value) => setFormData({ ...formData, penaltyWeight: value[0] })}
                        className="mt-2"
                      />
                      <p className="mt-2 text-sm text-muted-foreground">
                        {formData.formQuality === "Minor_Cheat" 
                          ? "轻微借力：2-5kg 惩罚重量"
                          : formData.formQuality === "Major_Cheat"
                            ? "严重借力：5-20kg 惩罚重量"
                            : "超严重借力：20-50kg 惩罚重量"
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
                    {isCalculating
                      ? "计算中..."
                      : mode === "forward"
                        ? "计算力量指数"
                        : mode === "reverse_weight"
                          ? "反推做组重量"
                          : mode === "reverse_reps"
                            ? "反推次数"
                            : "做组极限估算"}
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
                      {["Minor_Cheat", "Major_Cheat", "Extreme_Cheat"].includes(formData.formQuality) && (
                        <p className="text-orange-700">
                          <strong>惩罚重量：</strong> -{formData.penaltyWeight}kg
                        </p>
                      )}
                      
                      {/* 三大项的结果显示 - 直接显示 DOTS 分数 */}
                      {isPowerliftingExercise(exerciseType) && (
                        <>
                          {["Minor_Cheat", "Major_Cheat", "Extreme_Cheat"].includes(formData.formQuality) && (
                            <p className="text-green-700">
                              <strong>实际用于计算的重量：</strong> {(Number.parseFloat(formData.liftWeight) - formData.penaltyWeight).toFixed(1)} kg
                            </p>
                          )}
                          <p className="text-green-700">
                            <strong>估算1RM：</strong> {result.estimated_1rm.toFixed(1)} kg
                          </p>
                          <div className="mt-3 p-3 bg-blue-100 rounded-lg">
                            <p className="text-2xl font-bold text-blue-800">
                              DOTS 分数：{result.final_score.toFixed(1)} 分
                            </p>
                            <p className={`mt-1 font-semibold ${getScoreLevel(result.final_score, true).color}`}>
                              {getScoreLevel(result.final_score, true).level}
                            </p>
                          </div>
                        </>
                      )}
                      
                      {/* 上肢类的结果显示 */}
                      {isUpperBodyExercise(exerciseType) && mode === "forward" && (
                        <>
                          <p className="text-green-700">
                            <strong>实际用于计算的负重：</strong> {(Number.parseFloat(formData.addedWeight) - (["Minor_Cheat", "Major_Cheat", "Extreme_Cheat"].includes(formData.formQuality) ? formData.penaltyWeight : 0)).toFixed(1)} kg
                          </p>
                          <p className="text-green-700">
                            <strong>估算1RM：</strong> {result.estimated_1rm.toFixed(1)} kg
                          </p>
                        </>
                      )}
                      
                      {isUpperBodyExercise(exerciseType) && mode === "reverse_weight" && (
                        <>
                          <p className="text-green-700">
                            <strong>反推做组重量（附加负重）：</strong> {result.computed_added_weight?.toFixed(1)} kg
                          </p>
                          <p className="text-green-700">
                            <strong>实际用于计算的负重：</strong> {result.adjusted_added_weight?.toFixed(1)} kg
                          </p>
                          <p className="text-green-700">
                            <strong>输入负重1RM：</strong> {result.estimated_1rm.toFixed(1)} kg
                          </p>
                        </>
                      )}
                      
                      {isUpperBodyExercise(exerciseType) && mode === "reverse_reps" && (
                        <>
                          <p className="text-green-700">
                            <strong>反推可完成次数：</strong> {result.computed_reps?.toFixed ? result.computed_reps.toFixed(1) : result.computed_reps} 次
                          </p>
                          <p className="text-green-700">
                            <strong>实际用于计算的负重：</strong> {result.adjusted_added_weight?.toFixed(1)} kg
                          </p>
                          <p className="text-green-700">
                            <strong>输入负重1RM：</strong> {result.estimated_1rm.toFixed(1)} kg
                          </p>
                        </>
                      )}
                      
                      {isUpperBodyExercise(exerciseType) && mode === "day_max" && (
                        <>
                          <p className="text-green-700">
                            <strong>当天极限负重1RM：</strong> {result.estimated_1rm.toFixed(1)} kg
                          </p>
                        </>
                      )}
                      
                      {/* 上肢类最终力量分和等级 */}
                      {isUpperBodyExercise(exerciseType) && (
                        <div className="mt-3 p-3 bg-green-100 rounded-lg">
                          <p className="text-2xl font-bold text-green-800">
                            力量分：{result.final_score.toFixed(0)} / 500 分
                          </p>
                          <p className={`mt-1 font-semibold ${getScoreLevel(result.final_score, false).color}`}>
                            {getScoreLevel(result.final_score, false).level}
                          </p>
                        </div>
                      )}
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
