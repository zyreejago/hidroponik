import { createServerComponentClient } from "@supabase/auth-helpers-nextjs"
import { cookies } from "next/headers"
import type { Database } from "@/types/supabase"

// Method terminal yang langsung mengembalikan Promise (bukan lanjutan chain)
const TERMINAL_METHODS = new Set([
  "getSession",
  "getUser",
  "signIn",
  "signOut",
  "signUp",
  "insert",
  "update",
  "delete",
  "upsert",
  "single",
  "maybeSingle",
])

// Stub client untuk mode tanpa Supabase (portfolio: hanya frontend).
// Chain apapun bisa di-await dan menghasilkan data kosong,
// jadi halaman server tidak crash saat prerender.
function createStubClient(): any {
  const builder: any = new Proxy(() => {}, {
    get(_target, prop) {
      if (prop === "then") {
        // await di ujung chain (mis. .from("x").select("*")) -> hasil kosong
        return (resolve: (v: any) => void) => resolve({ data: [], error: null })
      }
      if (typeof prop === "string" && TERMINAL_METHODS.has(prop)) {
        return (..._args: any[]) => {
          if (prop === "getSession" || prop === "getUser") {
            return Promise.resolve({ data: { session: null, user: null }, error: null })
          }
          return Promise.resolve({ data: [], error: null })
        }
      }
      return builder
    },
    apply() {
      return builder
    },
  })
  return builder
}

export const createServerClient = () => {
  const hasEnv =
    !!process.env.NEXT_PUBLIC_SUPABASE_URL && !!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  if (!hasEnv) {
    return createStubClient()
  }
  return createServerComponentClient<Database>({
    cookies, // ⬅️ ini langsung, BUKAN fungsi
  })
}
