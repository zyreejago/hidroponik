"use client"

import type React from "react"

import { useState } from "react"
import { createClient } from "@/lib/supabase-client"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Switch } from "@/components/ui/switch"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog"
import { LogOut, RefreshCw, Plus, Edit, Trash2 } from 'lucide-react'
import { toast } from "@/hooks/use-toast"
import Link from "next/link"
import type { EWalletSetting } from "@/types/order"

interface AdminSettingsDashboardProps {
  initialEWalletSettings: EWalletSetting[]
}

export default function AdminSettingsDashboard({ initialEWalletSettings }: AdminSettingsDashboardProps) {
  const [eWalletSettings, setEWalletSettings] = useState<EWalletSetting[]>(initialEWalletSettings)
  const [refreshing, setRefreshing] = useState(false)
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false)
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)
  const [selectedWallet, setSelectedWallet] = useState<EWalletSetting | null>(null)
  const [formData, setFormData] = useState({
    walletType: "",
    accountName: "",
    accountNumber: "",
    isActive: true,
  })
  const router = useRouter()
  const supabase = createClient()

  const fetchEWalletSettings = async () => {
    try {
      setRefreshing(true)
      const { data, error } = await supabase.from("e_wallet_settings").select("*").order("wallet_type")

      if (error) {
        console.error("Error fetching e-wallet settings:", error)
        return
      }

      // Use double casting to safely convert the data
      setEWalletSettings((data as unknown) as EWalletSetting[] || [])
    } catch (error) {
      console.error("Failed to fetch e-wallet settings:", error)
    } finally {
      setRefreshing(false)
    }
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleSwitchChange = (checked: boolean) => {
    setFormData((prev) => ({ ...prev, isActive: checked }))
  }

  const handleAddWallet = async () => {
    try {
      if (!formData.walletType || !formData.accountName || !formData.accountNumber) {
        toast({
          title: "Form tidak lengkap",
          description: "Mohon lengkapi semua field yang diperlukan",
          variant: "destructive",
        })
        return
      }

      const { data, error } = await supabase
        .from("e_wallet_settings")
        .insert([
          {
            wallet_type: formData.walletType,
            account_name: formData.accountName,
            account_number: formData.accountNumber,
            is_active: formData.isActive,
          },
        ])
        .select()

      if (error) {
        throw error
      }

      setEWalletSettings((prev) => [...prev, data[0]])
      setIsAddDialogOpen(false)
      resetForm()

      toast({
        title: "E-Wallet berhasil ditambahkan",
        description: `${formData.walletType} telah berhasil ditambahkan`,
      })
    } catch (error) {
      console.error("Error adding e-wallet:", error)
      toast({
        title: "Gagal menambahkan e-wallet",
        description: error instanceof Error ? error.message : "Terjadi kesalahan saat menambahkan e-wallet",
        variant: "destructive",
      })
    }
  }

  const handleEditWallet = async () => {
    try {
      if (!selectedWallet) return

      if (!formData.walletType || !formData.accountName || !formData.accountNumber) {
        toast({
          title: "Form tidak lengkap",
          description: "Mohon lengkapi semua field yang diperlukan",
          variant: "destructive",
        })
        return
      }

      const { error } = await supabase
        .from("e_wallet_settings")
        .update({
          wallet_type: formData.walletType,
          account_name: formData.accountName,
          account_number: formData.accountNumber,
          is_active: formData.isActive,
        })
        .eq("id", selectedWallet.id)

      if (error) {
        throw error
      }

      setEWalletSettings((prev) =>
        prev.map((wallet) =>
          wallet.id === selectedWallet.id
            ? {
                ...wallet,
                wallet_type: formData.walletType,
                account_name: formData.accountName,
                account_number: formData.accountNumber,
                is_active: formData.isActive,
              }
            : wallet,
        ),
      )
      setIsEditDialogOpen(false)
      setSelectedWallet(null)
      resetForm()

      toast({
        title: "E-Wallet berhasil diperbarui",
        description: `${formData.walletType} telah berhasil diperbarui`,
      })
    } catch (error) {
      console.error("Error updating e-wallet:", error)
      toast({
        title: "Gagal memperbarui e-wallet",
        description: error instanceof Error ? error.message : "Terjadi kesalahan saat memperbarui e-wallet",
        variant: "destructive",
      })
    }
  }

  const handleDeleteWallet = async () => {
    try {
      if (!selectedWallet) return

      const { error } = await supabase.from("e_wallet_settings").delete().eq("id", selectedWallet.id)

      if (error) {
        throw error
      }

      setEWalletSettings((prev) => prev.filter((wallet) => wallet.id !== selectedWallet.id))
      setIsDeleteDialogOpen(false)
      setSelectedWallet(null)

      toast({
        title: "E-Wallet berhasil dihapus",
        description: `${selectedWallet.wallet_type} telah berhasil dihapus`,
      })
    } catch (error) {
      console.error("Error deleting e-wallet:", error)
      toast({
        title: "Gagal menghapus e-wallet",
        description: error instanceof Error ? error.message : "Terjadi kesalahan saat menghapus e-wallet",
        variant: "destructive",
      })
    }
  }

  const handleToggleActive = async (wallet: EWalletSetting) => {
    try {
      const newStatus = !wallet.is_active

      const { error } = await supabase.from("e_wallet_settings").update({ is_active: newStatus }).eq("id", wallet.id)

      if (error) {
        throw error
      }

      setEWalletSettings((prev) =>
        prev.map((item) => (item.id === wallet.id ? { ...item, is_active: newStatus } : item)),
      )

      toast({
        title: `E-Wallet ${newStatus ? "diaktifkan" : "dinonaktifkan"}`,
        description: `${wallet.wallet_type} telah berhasil ${newStatus ? "diaktifkan" : "dinonaktifkan"}`,
      })
    } catch (error) {
      console.error("Error toggling e-wallet status:", error)
      toast({
        title: "Gagal mengubah status e-wallet",
        description: error instanceof Error ? error.message : "Terjadi kesalahan saat mengubah status e-wallet",
        variant: "destructive",
      })
    }
  }

  const openEditDialog = (wallet: EWalletSetting) => {
    setSelectedWallet(wallet)
    setFormData({
      walletType: wallet.wallet_type,
      accountName: wallet.account_name,
      accountNumber: wallet.account_number,
      isActive: wallet.is_active,
    })
    setIsEditDialogOpen(true)
  }

  const openDeleteDialog = (wallet: EWalletSetting) => {
    setSelectedWallet(wallet)
    setIsDeleteDialogOpen(true)
  }

  const resetForm = () => {
    setFormData({
      walletType: "",
      accountName: "",
      accountNumber: "",
      isActive: true,
    })
  }

  const handleSignOut = async () => {
    await supabase.auth.signOut()
    router.push("/admin/login")
    router.refresh()
  }

  return (
    <div className="container mx-auto py-10 px-4">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-bold text-primary">Pengaturan</h1>
          <p className="text-gray-500">Kelola pengaturan aplikasi</p>
        </div>
        <div className="flex gap-2">
          <Link href="/admin">
            <Button variant="outline" size="sm">
              Dashboard
            </Button>
          </Link>
          <Link href="/admin/orders">
            <Button variant="outline" size="sm">
              Pesanan
            </Button>
          </Link>
          <Button variant="outline" size="sm" onClick={fetchEWalletSettings} disabled={refreshing}>
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
          <div className="flex flex-col md:flex-row justify-between md:items-center gap-4">
            <div>
              <CardTitle>Pengaturan E-Wallet</CardTitle>
              <CardDescription>Kelola metode pembayaran e-wallet yang tersedia</CardDescription>
            </div>
            <Button onClick={() => setIsAddDialogOpen(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Tambah E-Wallet
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {eWalletSettings.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">Belum ada e-wallet yang ditambahkan</div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Jenis E-Wallet</TableHead>
                    <TableHead>Nama Akun</TableHead>
                    <TableHead>Nomor Akun</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Aksi</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {eWalletSettings.map((wallet) => (
                    <TableRow key={wallet.id}>
                      <TableCell className="font-medium">{wallet.wallet_type}</TableCell>
                      <TableCell>{wallet.account_name}</TableCell>
                      <TableCell>{wallet.account_number}</TableCell>
                      <TableCell>
                        <Switch
                          checked={wallet.is_active}
                          onCheckedChange={() => handleToggleActive(wallet)}
                          aria-label="Toggle active status"
                        />
                      </TableCell>
                      <TableCell>
                        <div className="flex gap-2">
                          <Button variant="ghost" size="icon" onClick={() => openEditDialog(wallet)} title="Edit">
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => openDeleteDialog(wallet)}
                            title="Hapus"
                            className="text-red-500"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
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

      {/* Add E-Wallet Dialog */}
      <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Tambah E-Wallet</DialogTitle>
            <DialogDescription>Tambahkan metode pembayaran e-wallet baru</DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="walletType">Jenis E-Wallet</Label>
              <Input
                id="walletType"
                name="walletType"
                value={formData.walletType}
                onChange={handleInputChange}
                placeholder="Contoh: DANA, OVO, GoPay"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="accountName">Nama Akun</Label>
              <Input
                id="accountName"
                name="accountName"
                value={formData.accountName}
                onChange={handleInputChange}
                placeholder="Nama pemilik akun"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="accountNumber">Nomor Akun</Label>
              <Input
                id="accountNumber"
                name="accountNumber"
                value={formData.accountNumber}
                onChange={handleInputChange}
                placeholder="Nomor akun/telepon"
              />
            </div>
            <div className="flex items-center space-x-2">
              <Switch id="isActive" checked={formData.isActive} onCheckedChange={handleSwitchChange} />
              <Label htmlFor="isActive">Aktif</Label>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsAddDialogOpen(false)}>
              Batal
            </Button>
            <Button onClick={handleAddWallet}>Simpan</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit E-Wallet Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit E-Wallet</DialogTitle>
            <DialogDescription>Ubah informasi metode pembayaran e-wallet</DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="editWalletType">Jenis E-Wallet</Label>
              <Input id="editWalletType" name="walletType" value={formData.walletType} onChange={handleInputChange} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="editAccountName">Nama Akun</Label>
              <Input
                id="editAccountName"
                name="accountName"
                value={formData.accountName}
                onChange={handleInputChange}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="editAccountNumber">Nomor Akun</Label>
              <Input
                id="editAccountNumber"
                name="accountNumber"
                value={formData.accountNumber}
                onChange={handleInputChange}
              />
            </div>
            <div className="flex items-center space-x-2">
              <Switch id="editIsActive" checked={formData.isActive} onCheckedChange={handleSwitchChange} />
              <Label htmlFor="editIsActive">Aktif</Label>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsEditDialogOpen(false)}>
              Batal
            </Button>
            <Button onClick={handleEditWallet}>Simpan</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete E-Wallet Dialog */}
      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Hapus E-Wallet</DialogTitle>
            <DialogDescription>
              Apakah Anda yakin ingin menghapus e-wallet {selectedWallet?.wallet_type}?
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDeleteDialogOpen(false)}>
              Batal
            </Button>
            <Button variant="destructive" onClick={handleDeleteWallet}>
              Hapus
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
