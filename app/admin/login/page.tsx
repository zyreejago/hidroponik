
// 3. File /app/admin/login/page.tsx
"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { createClient } from "@/lib/supabase-client"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { toast } from "@/hooks/use-toast"
import Image from "next/image"

export default function LoginPage() {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [loading, setLoading] = useState(false)
  const router = useRouter()
  const supabase = createClient()

  // Periksa apakah sudah login saat halaman dimuat
  useEffect(() => {
    const checkSession = async () => {
      const { data } = await supabase.auth.getSession()
      if (data.session) {
        router.push("/admin")
      }
    }
    
    checkSession()
  }, [])

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      })

      if (error || !data.session) {
        toast({
          title: "Login gagal",
          description: error?.message || "Gagal mendapatkan sesi pengguna",
          variant: "destructive",
        })
        setLoading(false)
        return
      }

      toast({
        title: "Login berhasil",
        description: "Anda berhasil masuk ke dashboard admin",
      })

      // Gunakan router.replace daripada push untuk menghindari masalah navigasi back
      router.replace("/admin")
      router.refresh() // Refresh router untuk memastikan perubahan state

    } catch (error) {
      console.error("Login error:", error)
      toast({
        title: "Login gagal",
        description: "Terjadi kesalahan saat login",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-purple-50 to-white p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-1 flex flex-col items-center">
          <div className="w-32 h-32 relative mb-4">
            <Image
              src="/logo.png"
              alt="Hidroponik Nusantara Logo"
              fill
              className="object-contain"
            />
          </div>
          <CardTitle className="text-2xl text-center text-primary">Admin Login</CardTitle>
          <CardDescription className="text-center">
            Masuk ke dashboard admin Hidroponik Nusantara
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleLogin} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="admin@hidroponik.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>
            <Button className="w-full mt-6" type="submit" disabled={loading}>
              {loading ? "Memproses..." : "Login"}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}