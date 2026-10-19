import { createClientComponentClient } from "@supabase/auth-helpers-nextjs"
import { createClient as createSupabaseClient } from "@supabase/supabase-js"
import type { Database } from "@/types/supabase"

// Nilai dummy agar aplikasi tetap bisa build & jalan tanpa env Supabase
// (mode portfolio: hanya frontend yang ditampilkan, data dinamis dinonaktifkan)
const PLACEHOLDER_URL = "https://placeholder.supabase.co"
const PLACEHOLDER_KEY = "placeholder-anon-key"

const hasSupabaseEnv = () =>
  !!process.env.NEXT_PUBLIC_SUPABASE_URL && !!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

// Gunakan createClientComponentClient untuk autentikasi saat di browser
export const createClient = () => {
  if (!hasSupabaseEnv()) {
    // Tanpa env Supabase: pakai client dummy, tidak throw, query gagal graceful
    return createSupabaseClient<Database>(PLACEHOLDER_URL, PLACEHOLDER_KEY)
  }
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
