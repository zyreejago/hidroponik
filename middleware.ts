import { createMiddlewareClient } from "@supabase/auth-helpers-nextjs"
import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"
import type { Database } from "@/types/supabase"

export async function middleware(req: NextRequest) {
  const res = NextResponse.next()

  // Mode tanpa Supabase (portfolio): lewati auth check agar tidak throw
  if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
    return res
  }

  const supabase = createMiddlewareClient<Database>({ req, res })

  // ⬇️ Inilah yang penting: ini sinkronkan cookie auth
  await supabase.auth.getSession()

  return res
}

// ⬇️ Penting: pastikan "/admin" juga termasuk
export const config = {
  matcher: ["/admin", "/admin/:path*"],
}
