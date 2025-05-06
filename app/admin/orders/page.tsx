import { createServerClient } from "@/lib/supabase-server"
import AdminOrdersDashboard from "@/components/admin/orders-dashboard"
import type { Order } from "@/types/order"
import { redirect } from "next/navigation"

export const revalidate = 0 // Penting: Jangan cache halaman ini

export default async function AdminOrdersPage() {
  const supabase = createServerClient()

  // Periksa autentikasi di server
  const {
    data: { session },
  } = await supabase.auth.getSession()
  
  if (!session) {
    // Redirect dengan opsi { replace: true } untuk mengganti history entry
    redirect("/admin/login")
  }
  
  // Baru fetch data setelah memastikan user terotentikasi
  const { data } = await supabase
    .from("orders")
    .select("*")
    .order("created_at", { ascending: false })

  const orders = (data as unknown as Order[]) || []

  return <AdminOrdersDashboard initialOrders={orders} />
}