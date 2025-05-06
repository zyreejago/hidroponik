"use client"

import { useState, useEffect } from "react"
import { createClient } from "@/lib/supabase-client"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { LogOut, RefreshCw } from "lucide-react"
import { formatDate } from "@/lib/utils"

interface PartnerInquiry {
  id: string
  name: string
  email: string
  phone: string
  message: string
  status: string
  created_at: string
}

export default function InquiriesPage() {
  const [inquiries, setInquiries] = useState<PartnerInquiry[]>([])
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const router = useRouter()
  const supabase = createClient()

  // Cek session saat halaman dimuat
  useEffect(() => {
    const checkSession = async () => {
      const { data } = await supabase.auth.getSession()
      if (!data.session) {
        router.push("/admin/login")
        return
      }
      setIsAuthenticated(true)
      fetchInquiries()
    }
    
    checkSession()
  }, [router])

  const fetchInquiries = async () => {
    try {
      setRefreshing(true)
      const { data, error } = await supabase
        .from("partner_inquiries")
        .select("*")
        .order("created_at", { ascending: false })

      if (error) {
        console.error("Error fetching inquiries:", error)
        return
      }

      setInquiries(data || [])
    } catch (error) {
      console.error("Failed to fetch inquiries:", error)
    } finally {
      setLoading(false)
      setRefreshing(false)
    }
  }

  const handleStatusChange = async (id: string, newStatus: string) => {
    try {
      const { error } = await supabase
        .from("partner_inquiries")
        .update({ status: newStatus })
        .eq("id", id)
  
      if (error) {
        console.error("❌ Gagal update status:", error)
        alert(`Gagal update status: ${error.message}`)
        return
      }
  
      setInquiries((prev) =>
        prev.map((inquiry) => (inquiry.id === id ? { ...inquiry, status: newStatus } : inquiry))
      )
    } catch (err) {
      console.error("❌ Exception saat update:", err)
      alert("Terjadi error saat update status.")
    }
  }
  
  const handleSignOut = async () => {
    await supabase.auth.signOut()
    router.push("/admin/login")
    router.refresh()
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "new":
        return <Badge className="bg-blue-500 text-white">Baru</Badge>
      case "contacted":
        return <Badge className="bg-yellow-500 text-black">Dihubungi</Badge>
      case "completed":
        return <Badge className="bg-green-600 text-white">Selesai</Badge>
      case "rejected":
        return <Badge className="bg-red-500 text-white">Ditolak</Badge>
      default:
        return <Badge variant="outline">{status}</Badge>
    }
  }

  if (!isAuthenticated) {
    return <div className="container mx-auto py-10 px-4 text-center">Memeriksa autentikasi...</div>
  }

  return (
    <div className="container mx-auto py-10 px-4">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold text-primary">Partner Inquiries</h1>
        <div className="flex gap-2">
          <Link href="/admin">
            <Button variant="outline" size="sm">
              Dashboard
            </Button>
          </Link>
          <Link href="/admin/settings">
            <Button variant="outline" size="sm">
              Pengaturan
            </Button>
          </Link>
          <Button variant="outline" size="sm" onClick={fetchInquiries} disabled={refreshing}>
            <RefreshCw className={`h-4 w-4 mr-2 ${refreshing ? "animate-spin" : ""}`} />
            Refresh
          </Button>
          <Button variant="destructive" size="sm" onClick={handleSignOut}>
            <LogOut className="h-4 w-4 mr-2" />
            Logout
          </Button>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Daftar Permintaan</CardTitle>
          <CardDescription>Kelola status permintaan dari calon mitra</CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="text-center py-8">Memuat...</div>
          ) : inquiries.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">Belum ada permintaan masuk</div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Tanggal</TableHead>
                  <TableHead>Nama</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Telepon</TableHead>
                  <TableHead>Pesan</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Aksi</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {inquiries.map((inquiry) => (
                  <TableRow key={inquiry.id}>
                    <TableCell className="whitespace-nowrap">{formatDate(inquiry.created_at)}</TableCell>
                    <TableCell className="font-medium">{inquiry.name}</TableCell>
                    <TableCell>{inquiry.email}</TableCell>
                    <TableCell>{inquiry.phone}</TableCell>
                    <TableCell className="max-w-xs truncate">{inquiry.message}</TableCell>
                    <TableCell>{getStatusBadge(inquiry.status)}</TableCell>
                    <TableCell>
                      <Select
                        value={inquiry.status}
                        onValueChange={(value) => handleStatusChange(inquiry.id, value)}
                      >
                        <SelectTrigger className="w-[130px]">
                          <SelectValue placeholder="Ubah Status" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="new">Baru</SelectItem>
                          <SelectItem value="contacted">Dihubungi</SelectItem>
                          <SelectItem value="completed">Selesai</SelectItem>
                          <SelectItem value="rejected">Ditolak</SelectItem>
                        </SelectContent>
                      </Select>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  )
}