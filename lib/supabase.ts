import { createClient } from "@supabase/supabase-js"

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

// Coach Link 项目数据库客户端 - 用于「寻找单杠」业务，与 coachlink 项目数据同步
// coachlink 使用表名 streetlifting_locations、存储桶 streetlifting-locations
const coachLinkSupabaseUrl = process.env.NEXT_PUBLIC_COACHLINK_SUPABASE_URL
const coachLinkSupabaseAnonKey = process.env.NEXT_PUBLIC_COACHLINK_SUPABASE_ANON_KEY

export const coachLinkSupabase =
  coachLinkSupabaseUrl && coachLinkSupabaseAnonKey
    ? createClient(coachLinkSupabaseUrl, coachLinkSupabaseAnonKey)
    : null

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
          exercise_type: "weighted_pullup" | "weighted_dips"
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
          exercise_type?: "weighted_pullup" | "weighted_dips"
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
          exercise_type?: "weighted_pullup" | "weighted_dips"
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
