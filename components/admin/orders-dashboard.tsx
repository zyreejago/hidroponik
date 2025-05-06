"use client"

import type React from "react"

import { useState } from "react"
import { createClient } from "@/lib/supabase-client"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { formatDate } from "@/lib/utils"
import { LogOut, RefreshCw, Search, Eye } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import Link from "next/link"
import type { Order, OrderItem } from "@/types/order"

interface AdminOrdersDashboardProps {
  initialOrders: Order[]
}

export default function AdminOrdersDashboard({ initialOrders }: AdminOrdersDashboardProps) {
  const [orders, setOrders] = useState<Order[]>(initialOrders)
  const [filteredOrders, setFilteredOrders] = useState<Order[]>(initialOrders)
  const [refreshing, setRefreshing] = useState(false)
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null)
  const [orderItems, setOrderItems] = useState<OrderItem[]>([])
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const router = useRouter()
  const supabase = createClient()

  const fetchOrders = async () => {
    try {
      setRefreshing(true)
      const { data, error } = await supabase.from("orders").select("*").order("created_at", { ascending: false })

      if (error) {
        console.error("Error fetching orders:", error)
        return
      }

      // Use double casting to safely convert the data
      const ordersData = (data as unknown as Order[]) || []
      setOrders(ordersData)
      applyFilters(ordersData, searchTerm, statusFilter)
    } catch (error) {
      console.error("Failed to fetch orders:", error)
    } finally {
      setRefreshing(false)
    }
  }

  const applyFilters = (data: Order[], search: string, status: string) => {
    let filtered = [...data]

    // Apply search filter
    if (search) {
      const searchLower = search.toLowerCase()
      filtered = filtered.filter(
        (order) =>
          order.order_number.toLowerCase().includes(searchLower) ||
          order.customer_name.toLowerCase().includes(searchLower) ||
          order.customer_phone.toLowerCase().includes(searchLower) ||
          (order.customer_email && order.customer_email.toLowerCase().includes(searchLower)),
      )
    }

    // Apply status filter
    if (status !== "all") {
      filtered = filtered.filter((order) => order.status === status)
    }

    setFilteredOrders(filtered)
  }

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value
    setSearchTerm(value)
    applyFilters(orders, value, statusFilter)
  }

  const handleStatusFilterChange = (value: string) => {
    setStatusFilter(value)
    applyFilters(orders, searchTerm, value)
  }

  const handleStatusChange = async (id: string, newStatus: string) => {
    try {
      const { error } = await supabase.from("orders").update({ status: newStatus }).eq("id", id)

      if (error) {
        console.error("Error updating status:", error)
        return
      }

      const updatedOrders = orders.map((order) => (order.id === id ? { ...order, status: newStatus } : order))

      setOrders(updatedOrders)
      applyFilters(updatedOrders, searchTerm, statusFilter)

      // Update selected order if it's the one being modified
      if (selectedOrder && selectedOrder.id === id) {
        setSelectedOrder({ ...selectedOrder, status: newStatus })
      }
    } catch (error) {
      console.error("Failed to update status:", error)
    }
  }

  const handleViewOrder = async (order: Order) => {
    setSelectedOrder(order)

    // Fetch order items
    try {
      const { data, error } = await supabase
        .from("order_items")
        .select("*")
        .eq("order_id", order.id)
        .order("created_at")

      if (error) {
        console.error("Error fetching order items:", error)
      } else {
        // Use double casting to safely convert the data
        setOrderItems((data as unknown as OrderItem[]) || [])
      }
    } catch (error) {
      console.error("Failed to fetch order items:", error)
      setOrderItems([])
    }

    setIsDialogOpen(true)
  }

  const handleSignOut = async () => {
    await supabase.auth.signOut()
    router.push("/admin/login")
    router.refresh()
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "pending":
        return (
          <Badge variant="outline" className="bg-yellow-100 text-yellow-800 border-yellow-300">
            Menunggu Konfirmasi
          </Badge>
        )
      case "confirmed":
        return (
          <Badge variant="outline" className="bg-blue-100 text-blue-800 border-blue-300">
            Dikonfirmasi
          </Badge>
        )
      case "processing":
        return (
          <Badge variant="outline" className="bg-purple-100 text-purple-800 border-purple-300">
            Diproses
          </Badge>
        )
      case "shipped":
        return (
          <Badge variant="outline" className="bg-green-100 text-green-800 border-green-300">
            Dikirim
          </Badge>
        )
      case "delivered":
        return (
          <Badge variant="outline" className="bg-green-100 text-green-800 border-green-300">
            Terkirim
          </Badge>
        )
      case "cancelled":
        return (
          <Badge variant="outline" className="bg-red-100 text-red-800 border-red-300">
            Dibatalkan
          </Badge>
        )
      default:
        return (
          <Badge variant="outline" className="bg-gray-100 text-gray-800 border-gray-300">
            {status}
          </Badge>
        )
    }
  }

  const getStatusCounts = () => {
    const counts = {
      all: orders.length,
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

  return (
    <div className="container mx-auto py-10 px-4">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-bold text-primary">Manajemen Pesanan</h1>
          <p className="text-gray-500">Kelola pesanan dari pelanggan</p>
        </div>
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
          <Button variant="outline" size="sm" onClick={fetchOrders} disabled={refreshing}>
            <RefreshCw className={`h-4 w-4 mr-2 ${refreshing ? "animate-spin" : ""}`} />
            Refresh
          </Button>
          <Button variant="destructive" size="sm" onClick={handleSignOut}>
            <LogOut className="h-4 w-4 mr-2" />
            Logout
          </Button>
        </div>
      </div>

      <Tabs defaultValue="all" className="mb-6">
        <TabsList className="grid grid-cols-7 w-full max-w-4xl">
          <TabsTrigger value="all" onClick={() => handleStatusFilterChange("all")}>
            Semua ({statusCounts.all})
          </TabsTrigger>
          <TabsTrigger value="pending" onClick={() => handleStatusFilterChange("pending")}>
            Menunggu ({statusCounts.pending})
          </TabsTrigger>
          <TabsTrigger value="confirmed" onClick={() => handleStatusFilterChange("confirmed")}>
            Dikonfirmasi ({statusCounts.confirmed})
          </TabsTrigger>
          <TabsTrigger value="processing" onClick={() => handleStatusFilterChange("processing")}>
            Diproses ({statusCounts.processing})
          </TabsTrigger>
          <TabsTrigger value="shipped" onClick={() => handleStatusFilterChange("shipped")}>
            Dikirim ({statusCounts.shipped})
          </TabsTrigger>
          <TabsTrigger value="delivered" onClick={() => handleStatusFilterChange("delivered")}>
            Terkirim ({statusCounts.delivered})
          </TabsTrigger>
          <TabsTrigger value="cancelled" onClick={() => handleStatusFilterChange("cancelled")}>
            Dibatalkan ({statusCounts.cancelled})
          </TabsTrigger>
        </TabsList>
      </Tabs>

      <Card>
        <CardHeader>
          <div className="flex flex-col md:flex-row justify-between md:items-center gap-4">
            <div>
              <CardTitle>Daftar Pesanan</CardTitle>
              <CardDescription>Kelola pesanan dari pelanggan</CardDescription>
            </div>
            <div className="relative w-full md:w-64">
              <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input placeholder="Cari..." className="pl-8" value={searchTerm} onChange={handleSearch} />
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {filteredOrders.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              {orders.length === 0 ? "Belum ada pesanan" : "Tidak ada pesanan yang sesuai dengan filter"}
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>No. Pesanan</TableHead>
                    <TableHead>Tanggal</TableHead>
                    <TableHead>Pelanggan</TableHead>
                    <TableHead>Telepon</TableHead>
                    <TableHead>Total</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Aksi</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredOrders.map((order) => (
                    <TableRow key={order.id}>
                      <TableCell className="font-medium">{order.order_number}</TableCell>
                      <TableCell className="whitespace-nowrap">{formatDate(order.created_at)}</TableCell>
                      <TableCell>{order.customer_name}</TableCell>
                      <TableCell>{order.customer_phone}</TableCell>
                      <TableCell>Rp{(order.total_price + order.delivery_fee).toLocaleString()}</TableCell>
                      <TableCell>{getStatusBadge(order.status)}</TableCell>
                      <TableCell>
                        <div className="flex gap-2">
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleViewOrder(order)}
                            title="Lihat Detail"
                          >
                            <Eye className="h-4 w-4" />
                          </Button>
                          <Select value={order.status} onValueChange={(value) => handleStatusChange(order.id, value)}>
                            <SelectTrigger className="w-[130px]">
                              <SelectValue placeholder="Ubah Status" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="pending">Menunggu</SelectItem>
                              <SelectItem value="confirmed">Dikonfirmasi</SelectItem>
                              <SelectItem value="processing">Diproses</SelectItem>
                              <SelectItem value="shipped">Dikirim</SelectItem>
                              <SelectItem value="delivered">Terkirim</SelectItem>
                              <SelectItem value="cancelled">Dibatalkan</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Order Detail Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-4xl">
          {selectedOrder && (
            <>
              <DialogHeader>
                <DialogTitle>Detail Pesanan #{selectedOrder.order_number}</DialogTitle>
                <DialogDescription>Dibuat pada {formatDate(selectedOrder.created_at)}</DialogDescription>
              </DialogHeader>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-4">
                <div className="space-y-4">
                  <div>
                    <h3 className="text-sm font-medium text-gray-500">Informasi Pelanggan</h3>
                    <p className="font-medium mt-2">{selectedOrder.customer_name}</p>
                    <p>{selectedOrder.customer_phone}</p>
                    {selectedOrder.customer_email && <p>{selectedOrder.customer_email}</p>}
                  </div>

                  {selectedOrder.customer_address && (
                    <div>
                      <h3 className="text-sm font-medium text-gray-500">Alamat Pengiriman</h3>
                      <p className="mt-2 whitespace-pre-wrap">{selectedOrder.customer_address}</p>
                    </div>
                  )}

                  <div>
                    <h3 className="text-sm font-medium text-gray-500">Metode Pengiriman</h3>
                    <p className="mt-2">
                      {selectedOrder.delivery_method === "self_pickup"
                        ? "Ambil Sendiri"
                        : selectedOrder.delivery_method === "own_delivery"
                          ? "Diantar oleh Armada Kami"
                          : "Lalamove"}
                    </p>
                  </div>

                  <div>
                    <h3 className="text-sm font-medium text-gray-500">Metode Pembayaran</h3>
                    <p className="mt-2">{selectedOrder.payment_method}</p>
                  </div>

                  <div>
                    <h3 className="text-sm font-medium text-gray-500">Status</h3>
                    <div className="mt-2">{getStatusBadge(selectedOrder.status)}</div>
                  </div>
                </div>

                <div>
                  <h3 className="text-sm font-medium text-gray-500 mb-2">Detail Produk</h3>
                  <div className="space-y-2 border rounded-md p-3">
                    {orderItems.map((item) => (
                      <div key={item.id} className="flex justify-between py-2 border-b last:border-0">
                        <div>
                          <p className="font-medium">{item.product_name}</p>
                          <p className="text-sm text-gray-500">
                            {item.quantity} kg x Rp{item.price_per_kg.toLocaleString()}/kg
                          </p>
                        </div>
                        <p className="font-medium">Rp{item.subtotal.toLocaleString()}</p>
                      </div>
                    ))}

                    <div className="pt-4 space-y-2">
                      <div className="flex justify-between">
                        <span>Subtotal</span>
                        <span>Rp{selectedOrder.total_price.toLocaleString()}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Biaya Pengiriman</span>
                        <span>Rp{selectedOrder.delivery_fee.toLocaleString()}</span>
                      </div>
                      <div className="flex justify-between font-bold pt-2 border-t">
                        <span>Total</span>
                        <span>Rp{(selectedOrder.total_price + selectedOrder.delivery_fee).toLocaleString()}</span>
                      </div>
                    </div>
                  </div>

                  {selectedOrder.notes && (
                    <div className="mt-4">
                      <h3 className="text-sm font-medium text-gray-500">Catatan</h3>
                      <p className="mt-2 text-gray-700 whitespace-pre-wrap">{selectedOrder.notes}</p>
                    </div>
                  )}

                  {selectedOrder.payment_proof_url && (
                    <div className="mt-4">
                      <h3 className="text-sm font-medium text-gray-500">Bukti Pembayaran</h3>
                      <div className="mt-2">
                        <a
                          href={selectedOrder.payment_proof_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-primary hover:underline"
                        >
                          Lihat Bukti Pembayaran
                        </a>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              <div className="mt-6 flex justify-between">
                <Select
                  value={selectedOrder.status}
                  onValueChange={(value) => handleStatusChange(selectedOrder.id, value)}
                >
                  <SelectTrigger className="w-[200px]">
                    <SelectValue placeholder="Ubah Status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="pending">Menunggu Konfirmasi</SelectItem>
                    <SelectItem value="confirmed">Dikonfirmasi</SelectItem>
                    <SelectItem value="processing">Diproses</SelectItem>
                    <SelectItem value="shipped">Dikirim</SelectItem>
                    <SelectItem value="delivered">Terkirim</SelectItem>
                    <SelectItem value="cancelled">Dibatalkan</SelectItem>
                  </SelectContent>
                </Select>
                <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
                  Tutup
                </Button>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}
