import { type NextRequest, NextResponse } from "next/server"
import { createClient } from "@supabase/supabase-js"

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!)

export async function POST(request: NextRequest) {
  try {
    const { gender, bodyweight, added_weight, reps } = await request.json()

    // Validate input
    if (!gender || !bodyweight || added_weight === undefined || !reps) {
      return NextResponse.json({ error: "Missing required parameters" }, { status: 400 })
    }

    // Get formula coefficients for the specified gender
    const { data: formula, error: formulaError } = await supabase
      .from("formulas")
      .select("*")
      .eq("gender", gender)
      .single()

    if (formulaError || !formula) {
      return NextResponse.json({ error: "Formula not found for specified gender" }, { status: 404 })
    }

    // Calculate 1RM using Epley formula
    const totalWeight = bodyweight + added_weight
    const estimated1RM = totalWeight * (1 + reps / 30)

    // Calculate strength coefficient using polynomial
    const W = bodyweight
    const coefficient =
      formula.coeff_a * Math.pow(W, 5) +
      formula.coeff_b * Math.pow(W, 4) +
      formula.coeff_c * Math.pow(W, 3) +
      formula.coeff_d * Math.pow(W, 2) +
      formula.coeff_e * W +
      formula.coeff_f

    // Calculate final strength score
    const finalScore = estimated1RM * coefficient

    return NextResponse.json({
      estimated_1rm: estimated1RM,
      final_score: finalScore,
      coefficient: coefficient,
    })
  } catch (error) {
    console.error("Calculation error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
