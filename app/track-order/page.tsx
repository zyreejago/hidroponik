"use client"

import { useState, useEffect } from "react"
import { useSearchParams } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Search, Package, CheckCircle2, Truck, Clock, XCircle } from 'lucide-react'
import { createClient } from "@/lib/supabase-client"
import { formatDate } from "@/lib/utils"
import type { Order, OrderItem } from "@/types/order"

export default function TrackOrderPage() {
  const searchParams = useSearchParams()
  const initialTrackingCode = searchParams.get("tracking") || ""
  const [trackingCode, setTrackingCode] = useState(initialTrackingCode)
  const [searchTrackingCode, setSearchTrackingCode] = useState(initialTrackingCode)
  const [order, setOrder] = useState<Order | null>(null)
  const [orderItems, setOrderItems] = useState<OrderItem[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const supabase = createClient()

  useEffect(() => {
    if (initialTrackingCode) {
      handleTrackOrder()
    }
  }, [initialTrackingCode])

  const handleTrackOrder = async () => {
    if (!searchTrackingCode) {
      setError("Masukkan kode tracking")
      return
    }

    setLoading(true)
    setError(null)

    try {
      // Fetch order
      const { data: orderData, error: orderError } = await supabase
        .from("orders")
        .select("*")
        .eq("tracking_code", searchTrackingCode)
        .single()

      if (orderError) {
        throw new Error("Pesanan tidak ditemukan")
      }

      // Use double casting to safely convert the data
      setOrder((orderData as unknown) as Order)
      setTrackingCode(searchTrackingCode)

      // Fetch order items
      const { data: itemsData, error: itemsError } = await supabase
        .from("order_items")
        .select("*")
        .eq("order_id", orderData.id)
        .order("created_at")

      if (itemsError) {
        console.error("Error fetching order items:", itemsError)
      } else {
        // Use double casting to safely convert the data
        setOrderItems((itemsData as unknown) as OrderItem[] || [])
      }
    } catch (error) {
      console.error("Error tracking order:", error)
      setError(error instanceof Error ? error.message : "Terjadi kesalahan saat melacak pesanan")
      setOrder(null)
      setOrderItems([])
    } finally {
      setLoading(false)
    }
  }

  // Update the getStatusBadge function to handle string status
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

  // Update the getStatusIcon function to handle string status
  const getStatusIcon = (status: string) => {
    switch (status) {
      case "pending":
        return <Clock className="h-6 w-6 text-yellow-500" />
      case "confirmed":
        return <CheckCircle2 className="h-6 w-6 text-blue-500" />
      case "processing":
        return <Package className="h-6 w-6 text-purple-500" />
      case "shipped":
        return <Truck className="h-6 w-6 text-green-500" />
      case "delivered":
        return <CheckCircle2 className="h-6 w-6 text-green-600" />
      case "cancelled":
        return <XCircle className="h-6 w-6 text-red-500" />
      default:
        return <Clock className="h-6 w-6 text-gray-500" />
    }
  }

  return (
    <div className="container mx-auto px-4 py-32 min-h-screen">
      <div className="max-w-3xl mx-auto">
        <h1 className="text-3xl font-bold mb-8 text-center">Lacak Pesanan</h1>

        <Card className="mb-8">
          <CardContent className="pt-6">
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="trackingCode">Kode Tracking</Label>
                <div className="flex space-x-2">
                  <Input
                    id="trackingCode"
                    value={searchTrackingCode}
                    onChange={(e) => setSearchTrackingCode(e.target.value)}
                    placeholder="Masukkan kode tracking pesanan Anda"
                  />
                  <Button
                    onClick={handleTrackOrder}
                    disabled={loading}
                    className="bg-gradient-to-r from-purple-600 to-green-600 hover:from-purple-700 hover:to-green-700"
                  >
                    {loading ? "Mencari..." : "Lacak"}
                    <Search className="ml-2 h-4 w-4" />
                  </Button>
                </div>
              </div>
              {error && <p className="text-red-500 text-sm">{error}</p>}
            </div>
          </CardContent>
        </Card>

        {order && (
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <div className="flex justify-between items-center">
                  <CardTitle>Informasi Pesanan</CardTitle>
                  {getStatusBadge(order.status)}
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-gray-500">Nomor Pesanan</p>
                    <p className="font-medium">{order.order_number}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Tanggal Pesanan</p>
                    <p className="font-medium">{formatDate(order.created_at)}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Nama Pemesan</p>
                    <p className="font-medium">{order.customer_name}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Telepon</p>
                    <p className="font-medium">{order.customer_phone}</p>
                  </div>
                  {order.customer_email && (
                    <div className="col-span-2">
                      <p className="text-sm text-gray-500">Email</p>
                      <p className="font-medium">{order.customer_email}</p>
                    </div>
                  )}
                  {order.customer_address && (
                    <div className="col-span-2">
                      <p className="text-sm text-gray-500">Alamat Pengiriman</p>
                      <p className="font-medium">{order.customer_address}</p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Detail Pesanan</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
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
                </div>

                <div className="pt-4 space-y-2">
                  <div className="flex justify-between">
                    <span>Subtotal</span>
                    <span>Rp{order.total_price.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Biaya Pengiriman</span>
                    <span>Rp{order.delivery_fee.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between font-bold pt-2 border-t">
                    <span>Total</span>
                    <span>Rp{(order.total_price + order.delivery_fee).toLocaleString()}</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Status Pesanan</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center space-x-4">
                  {getStatusIcon(order.status)}
                  <div>
                    <p className="font-medium">
                      {order.status === "pending"
                        ? "Menunggu Konfirmasi"
                        : order.status === "confirmed"
                          ? "Pesanan Dikonfirmasi"
                          : order.status === "processing"
                            ? "Pesanan Sedang Diproses"
                            : order.status === "shipped"
                              ? "Pesanan Sedang Dikirim"
                              : order.status === "delivered"
                                ? "Pesanan Telah Diterima"
                                : "Pesanan Dibatalkan"}
                    </p>
                    <p className="text-sm text-gray-500">
                      {order.status === "pending"
                        ? "Pesanan Anda sedang menunggu konfirmasi dari admin."
                        : order.status === "confirmed"
                          ? "Pesanan Anda telah dikonfirmasi dan akan segera diproses."
                          : order.status === "processing"
                            ? "Pesanan Anda sedang diproses dan disiapkan."
                            : order.status === "shipped"
                              ? "Pesanan Anda sedang dalam perjalanan."
                              : order.status === "delivered"
                                ? "Pesanan Anda telah diterima."
                                : "Pesanan Anda telah dibatalkan."}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </div>
  )
}
