import { supabase } from "./supabase"

export async function calculateScore(gender: "Male" | "Female", bodyweight: number, addedWeight: number, reps: number) {
  try {
    // Get formula coefficients for the specified gender
    const { data: formula, error: formulaError } = await supabase
      .from("formulas")
      .select("*")
      .eq("gender", gender)
      .single()

    if (formulaError || !formula) {
      throw new Error("Formula not found for specified gender")
    }

    // Calculate 1RM using Epley formula
    const totalWeight = bodyweight + addedWeight
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

    return {
      estimated_1rm: estimated1RM,
      final_score: finalScore,
      coefficient: coefficient,
    }
  } catch (error) {
    console.error("Calculation error:", error)
    throw error
  }
}
