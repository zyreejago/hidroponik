"use client"

import { useState } from "react"
import { createClient } from "@/lib/supabase-client"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card"
import { LogOut, RefreshCw, ShoppingBag, Wallet, MessageSquare } from 'lucide-react'
import Link from "next/link"
import type { PartnerInquiry, Order } from "@/types/order"

interface AdminDashboardProps {
  initialInquiries: PartnerInquiry[]
}

export default function AdminDashboard({ initialInquiries }: AdminDashboardProps) {
  const [inquiries, setInquiries] = useState<PartnerInquiry[]>(initialInquiries)
  const [orders, setOrders] = useState<Order[]>([])
  const [refreshing, setRefreshing] = useState(false)
  const router = useRouter()
  const supabase = createClient()

  const fetchData = async () => {
    try {
      setRefreshing(true)

      // Fetch partner inquiries
      const { data: inquiriesData, error: inquiriesError } = await supabase
        .from("partner_inquiries")
        .select("*")
        .order("created_at", { ascending: false })
        .limit(5)

      if (inquiriesError) {
        console.error("Error fetching inquiries:", inquiriesError)
      } else {
        // Use double casting to safely convert the data
        setInquiries((inquiriesData as unknown) as PartnerInquiry[] || [])
      }

      // Fetch orders
      const { data: ordersData, error: ordersError } = await supabase
        .from("orders")
        .select("*")
        .order("created_at", { ascending: false })
        .limit(5)

      if (ordersError) {
        console.error("Error fetching orders:", ordersError)
      } else {
        // Use double casting to safely convert the data
        setOrders((ordersData as unknown) as Order[] || [])
      }
    } catch (error) {
      console.error("Failed to fetch data:", error)
    } finally {
      setRefreshing(false)
    }
  }

  const handleSignOut = async () => {
    await supabase.auth.signOut()
    router.push("/admin/login")
    router.refresh()
  }

  const getStatusCounts = () => {
    const counts = {
      new: 0,
      contacted: 0,
      completed: 0,
      rejected: 0,
    }

    inquiries.forEach((inquiry) => {
      if (counts[inquiry.status as keyof typeof counts] !== undefined) {
        counts[inquiry.status as keyof typeof counts]++
      }
    })

    return counts
  }

  const getOrderStatusCounts = () => {
    const counts = {
      pending: 0,
      confirmed: 0,
      processing: 0,
      shipped: 0,
      delivered: 0,
      cancelled: 0,
    }

    orders.forEach((order) => {
      if (counts[order.status as keyof typeof counts] !== undefined) {
        counts[order.status as keyof typeof counts]++
      }
    })

    return counts
  }

  const statusCounts = getStatusCounts()
  const orderStatusCounts = getOrderStatusCounts()

  return (
    <div className="min-h-screen bg-gray-50">
      {/* No navbar - Admin dashboard with top padding */}
      <div className="container mx-auto pt-8 pb-16 px-4">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
          <div>
            <h1 className="text-3xl font-bold text-primary">Admin Dashboard</h1>
            <p className="text-gray-500">Selamat datang di panel admin Hidroponik Nusantara</p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={fetchData} disabled={refreshing}>
              <RefreshCw className={`h-4 w-4 mr-2 ${refreshing ? "animate-spin" : ""}`} />
              Refresh
            </Button>
            <Button variant="destructive" size="sm" onClick={handleSignOut}>
              <LogOut className="h-4 w-4 mr-2" />
              Logout
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-lg">Pesanan</CardTitle>
              <CardDescription>Kelola pesanan pelanggan</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{orders.length}</div>
              <div className="text-sm text-gray-500 mt-2">{orderStatusCounts.pending} menunggu konfirmasi</div>
            </CardContent>
            <CardFooter>
              <Link href="/admin/orders" className="w-full">
                <Button className="w-full z-10" variant="outline">
                  <ShoppingBag className="h-4 w-4 mr-2" />
                  Lihat Pesanan
                </Button>
              </Link>
            </CardFooter>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-lg">Partner Inquiries</CardTitle>
              <CardDescription>Kelola permintaan kerjasama</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{inquiries.length}</div>
              <div className="text-sm text-gray-500 mt-2">{statusCounts.new} permintaan baru</div>
            </CardContent>
            <CardFooter>
              <Link href="/admin/inquiries" className="w-full">
                <Button className="w-full" variant="outline">
                  <MessageSquare className="h-4 w-4 mr-2" />
                  Lihat Inquiries
                </Button>
              </Link>
            </CardFooter>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-lg">Pengaturan</CardTitle>
              <CardDescription>Kelola pengaturan aplikasi</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-sm text-gray-500">Atur metode pembayaran dan pengaturan lainnya</div>
            </CardContent>
            <CardFooter>
              <Link href="/admin/settings" className="w-full">
                <Button className="w-full" variant="outline">
                  <Wallet className="h-4 w-4 mr-2" />
                  Pengaturan
                </Button>
              </Link>
            </CardFooter>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <Card>
            <CardHeader>
              <CardTitle>Pesanan Terbaru</CardTitle>
              <CardDescription>5 pesanan terbaru dari pelanggan</CardDescription>
            </CardHeader>
            <CardContent>
              {orders.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">Belum ada pesanan</div>
              ) : (
                <div className="space-y-4">
                  {orders.map((order) => (
                    <div key={order.id} className="flex justify-between items-center border-b pb-4 last:border-0">
                      <div>
                        <p className="font-medium">{order.order_number}</p>
                        <p className="text-sm text-gray-500">{order.customer_name}</p>
                      </div>
                      <div className="text-right">
                        <p className="font-medium">Rp{(order.total_price + order.delivery_fee).toLocaleString()}</p>
                        <p className="text-sm text-gray-500">{new Date(order.created_at).toLocaleDateString("id-ID")}</p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
            <CardFooter>
              <Link href="/admin/orders" className="w-full">
                <Button className="w-full" variant="outline">
                  Lihat Semua Pesanan
                </Button>
              </Link>
            </CardFooter>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Partner Inquiries Terbaru</CardTitle>
              <CardDescription>5 permintaan kerjasama terbaru</CardDescription>
            </CardHeader>
            <CardContent>
              {inquiries.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">Belum ada permintaan kerjasama</div>
              ) : (
                <div className="space-y-4">
                  {inquiries.map((inquiry) => (
                    <div key={inquiry.id} className="flex justify-between items-center border-b pb-4 last:border-0">
                      <div>
                        <p className="font-medium">{inquiry.name}</p>
                        <p className="text-sm text-gray-500">{inquiry.email}</p>
                      </div>
                      <div className="text-right">
                        <p className="font-medium capitalize">{inquiry.status}</p>
                        <p className="text-sm text-gray-500">
                          {new Date(inquiry.created_at).toLocaleDateString("id-ID")}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
            <CardFooter>
              <Link href="/admin/inquiries" className="w-full">
                <Button className="w-full" variant="outline">
                  Lihat Semua Inquiries
                </Button>
              </Link>
            </CardFooter>
          </Card>
        </div>
      </div>
    </div>
  )
}