import { createServerClient } from "@/lib/supabase-server"
import AdminSettingsDashboard from "@/components/admin/settings-dashboard"
import type { EWalletSetting } from "@/types/order"
import { redirect } from "next/navigation"


export default async function AdminSettingsPage() {
  const supabase = createServerClient()
  
    // Periksa autentikasi di server
    const {
      data: { session },
    } = await supabase.auth.getSession()
    
    if (!session) {
      // Redirect dengan opsi { replace: true } untuk mengganti history entry
      redirect("/admin/login")
    }
    
  // Tapi tidak redirect jika kosong

  // Fetch the e-wallet settings
  const { data } = await supabase.from("e_wallet_settings").select("*").order("wallet_type")

  const eWalletSettings = (data as unknown) as EWalletSetting[] || []

  return <AdminSettingsDashboard initialEWalletSettings={eWalletSettings} />
}
