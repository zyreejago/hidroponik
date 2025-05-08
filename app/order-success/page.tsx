"use client"

import { useEffect, useState } from "react"
import { useSearchParams, useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { CheckCircle2, ArrowRight, Home } from "lucide-react"
import Link from "next/link"
import { createClient } from "@/lib/supabase-client"
import type { Order } from "@/types/order"

export default function OrderSuccessPage() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const trackingCode = searchParams.get("tracking")
  const [order, setOrder] = useState<Order | null>(null)
  const [loading, setLoading] = useState(true)
  const supabase = createClient()

  useEffect(() => {
    if (!trackingCode) {
      router.push("/")
      return
    }

    const fetchOrder = async () => {
      try {
        console.log("Fetching order with tracking code:", trackingCode)
        const { data, error } = await supabase.from("orders").select("*").eq("tracking_code", trackingCode).single()

        if (error) {
          console.error("Error fetching order:", error)
          throw error
        }

        console.log("Order data received:", data)
        // Use double casting to safely convert the data
        setOrder(data as unknown as Order)
      } catch (error) {
        console.error("Error fetching order:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchOrder()
  }, [trackingCode, router, supabase])

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-32 min-h-screen">
        <div className="max-w-2xl mx-auto text-center">
          <p>Memuat...</p>
        </div>
      </div>
    )
  }

  if (!order) {
    return (
      <div className="container mx-auto px-4 py-32 min-h-screen">
        <div className="max-w-2xl mx-auto text-center">
          <h1 className="text-2xl font-bold mb-4">Pesanan Tidak Ditemukan</h1>
          <p className="text-gray-600 mb-8">Maaf, kami tidak dapat menemukan pesanan dengan kode tracking tersebut.</p>
          <Link href="/">
            <Button className="bg-gradient-to-r from-purple-600 to-green-600 hover:from-purple-700 hover:to-green-700">
              Kembali ke Beranda
            </Button>
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-32 min-h-screen">
      <div className="max-w-2xl mx-auto">
        <div className="text-center mb-8">
          <div className="mb-6 flex justify-center">
            <div className="h-24 w-24 rounded-full bg-green-100 flex items-center justify-center">
              <CheckCircle2 className="h-12 w-12 text-green-600" />
            </div>
          </div>
          <h1 className="text-2xl font-bold mb-4">Pesanan Berhasil!</h1>
          <p className="text-gray-600">
            Terima kasih telah berbelanja di Hidroponik Nusantara. Pesanan Anda telah kami terima dan sedang diproses.
          </p>
        </div>

        <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 mb-8 rounded-md">
          <div className="flex">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-yellow-400" viewBox="0 0 20 20" fill="currentColor">
                <path
                  fillRule="evenodd"
                  d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z"
                  clipRule="evenodd"
                />
              </svg>
            </div>
            <div className="ml-3">
              <h3 className="text-sm font-medium text-yellow-800">Penting: Simpan Kode Tracking Anda</h3>
              <div className="mt-2 text-sm text-yellow-700">
                <p>
                  Harap catat dan simpan kode tracking Anda: <strong>{order.tracking_code}</strong>
                </p>
                <p className="mt-1">
                  Kode ini diperlukan untuk melacak status pesanan Anda. Jika halaman ini ditutup, Anda akan membutuhkan
                  kode tracking untuk mengakses informasi pesanan.
                </p>
              </div>
            </div>
          </div>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Detail Pesanan</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-gray-500">Nomor Pesanan</p>
                <p className="font-medium">{order.order_number}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Kode Tracking</p>
                <p className="font-medium">{order.tracking_code}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Status</p>
                <p className="font-medium capitalize">{order.status}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Tanggal Pesanan</p>
                <p className="font-medium">{new Date(order.created_at).toLocaleDateString("id-ID")}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Total Pembayaran</p>
                <p className="font-medium">Rp{(order.total_price + order.delivery_fee).toLocaleString()}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Metode Pengiriman</p>
                <p className="font-medium">
                  {order.delivery_method === "self_pickup"
                    ? "Ambil Sendiri"
                    : order.delivery_method === "own_delivery"
                      ? "Diantar oleh Armada Kami"
                      : order.delivery_method === "courier"
                        ? `${order.courier?.toUpperCase()} - ${order.courier_service}`
                        : "Kurir"}
                </p>
              </div>
            </div>

            <div className="pt-4 border-t">
              <p className="text-sm text-gray-500 mb-2">Informasi Pemesan</p>
              <p className="font-medium">{order.customer_name}</p>
              <p>{order.customer_phone}</p>
              {order.customer_email && <p>{order.customer_email}</p>}
              {order.customer_address && <p className="mt-2">{order.customer_address}</p>}
            </div>
          </CardContent>
        </Card>

        <div className="mt-8 flex flex-col sm:flex-row gap-4 justify-center">
          <Link href="/">
            <Button variant="outline" className="w-full sm:w-auto">
              <Home className="h-4 w-4 mr-2" />
              Kembali ke Beranda
            </Button>
          </Link>
          <Link href={`/track-order?tracking=${order.tracking_code}`}>
            <Button className="w-full sm:w-auto bg-gradient-to-r from-purple-600 to-green-600 hover:from-purple-700 hover:to-green-700">
              Lacak Pesanan
              <ArrowRight className="h-4 w-4 ml-2" />
            </Button>
          </Link>
        </div>
      </div>
    </div>
  )
}
