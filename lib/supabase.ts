import { createClient } from "@supabase/supabase-js"

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

export type Database = {
  public: {
    Tables: {
      submissions: {
        Row: {
          id: string
          created_at: string
          gender: "Male" | "Female"
          bodyweight: number
          added_weight: number
          reps: number
          form_quality: "Competition" | "Good" | "Minor_Cheat" | "Major_Cheat"
          penalty_weight: number
          user_name: string | null
          video_url: string | null
          pullup_type: "Overhand" | "Underhand"
          is_processed: boolean
        }
        Insert: {
          id?: string
          created_at?: string
          gender: "Male" | "Female"
          bodyweight: number
          added_weight: number
          reps: number
          form_quality: "Competition" | "Good" | "Minor_Cheat" | "Major_Cheat"
          penalty_weight?: number
          user_name?: string | null
          video_url?: string | null
          pullup_type: "Overhand" | "Underhand"
          is_processed?: boolean
        }
        Update: {
          id?: string
          created_at?: string
          gender?: "Male" | "Female"
          bodyweight?: number
          added_weight?: number
          reps?: number
          form_quality?: "Competition" | "Good" | "Minor_Cheat" | "Major_Cheat"
          penalty_weight?: number
          user_name?: string | null
          video_url?: string | null
          pullup_type?: "Overhand" | "Underhand"
          is_processed?: boolean
        }
      }
      formulas: {
        Row: {
          id: number
          gender: "Male" | "Female"
          coeff_a: number
          coeff_b: number
          coeff_c: number
          coeff_d: number
          coeff_e: number
          coeff_f: number
          total_submissions_used: number
          last_updated: string
        }
        Insert: {
          id?: number
          gender: "Male" | "Female"
          coeff_a: number
          coeff_b: number
          coeff_c: number
          coeff_d: number
          coeff_e: number
          coeff_f: number
          total_submissions_used?: number
          last_updated?: string
        }
        Update: {
          id?: number
          gender?: "Male" | "Female"
          coeff_a?: number
          coeff_b?: number
          coeff_c?: number
          coeff_d?: number
          coeff_e?: number
          coeff_f?: number
          total_submissions_used?: number
          last_updated?: string
        }
      }
    }
  }
}
