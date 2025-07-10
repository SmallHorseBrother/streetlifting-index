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

    const totalWeight = bodyweight + added_weight

    // If reps is 1, the total weight is already the 1RM
    let totalEstimated1RM = totalWeight;
    
    // Only calculate using formulas if reps > 1
    if (reps > 1) {
      // The Brzycki formula is undefined for reps >= 37.
      if (reps >= 37) {
        return NextResponse.json({ error: "完成次数必须小于37次" }, { status: 400 })
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

    return NextResponse.json({
      estimated_1rm: estimated1RM_added_weight,
      final_score: finalScore,
      coefficient: coefficient,
    })
  } catch (error) {
    console.error("Calculation error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
