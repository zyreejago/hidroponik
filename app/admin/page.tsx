import { redirect } from "next/navigation"
import { createServerClient } from "@/lib/supabase-server"
import AdminDashboard from "@/components/admin/dashboard"
import { Database } from "@/types/supabase"

// Define the PartnerInquiry type based on the database schema
type PartnerInquiry = {
  id: string
  name: string
  email: string
  phone: string
  message: string
  status: string
  created_at: string
}

export default async function AdminPage() {
  const supabase = createServerClient()

  const {
    data: { session },
  } = await supabase.auth.getSession()

  

  // Fetch the partner inquiries data
  const { data } = await supabase
    .from("partner_inquiries")
    .select("*")
    .order("created_at", { ascending: false })

  // Double casting to avoid TypeScript errors
  // First cast to unknown, then to the target type
  const inquiries: PartnerInquiry[] = (data as unknown) as PartnerInquiry[] || []

  return <AdminDashboard initialInquiries={inquiries} />
}