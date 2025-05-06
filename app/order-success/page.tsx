"use client"

import { useEffect, useState } from "react"
import { useSearchParams, useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { CheckCircle2, ArrowRight, Home } from 'lucide-react'
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
        const { data, error } = await supabase.from("orders").select("*").eq("tracking_code", trackingCode).single()

        if (error) {
          throw error
        }

        // Use double casting to safely convert the data
        setOrder((data as unknown) as Order)
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
                      : "Lalamove"}
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
