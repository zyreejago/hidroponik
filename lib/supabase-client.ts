import { createClientComponentClient } from "@supabase/auth-helpers-nextjs"
import { createClient as createSupabaseClient } from "@supabase/supabase-js"
import type { Database } from "@/types/supabase"

// Gunakan createClientComponentClient untuk autentikasi saat di browser
export const createClient = () => {
  if (typeof window !== 'undefined') {
    // Di browser, gunakan createClientComponentClient yang mendukung cookie
    return createClientComponentClient<Database>()
  } else {
    // Di server, gunakan implementasi asli
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
    const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    return createSupabaseClient<Database>(supabaseUrl, supabaseKey)
  }
}