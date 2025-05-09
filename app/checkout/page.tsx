"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import Image from "next/image"
import { useCart } from "@/contexts/cart-context"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { ArrowLeft, ShoppingBag, Upload, Loader2, Info } from "lucide-react"
import Link from "next/link"
import { createClient } from "@/lib/supabase-client"
import { toast } from "@/hooks/use-toast"
import { generateOrderNumber } from "@/lib/utils"
import type { EWalletSetting } from "@/types/order"

export default function CheckoutPage() {
  const { items, totalItems, totalPrice, totalWeight, clearCart } = useCart()
  const router = useRouter()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [eWalletSettings, setEWalletSettings] = useState<EWalletSetting[]>([])
  const [deliveryFee, setDeliveryFee] = useState(0)
  const [isCalculatingFee, setIsCalculatingFee] = useState(false)
  const [paymentProofFile, setPaymentProofFile] = useState<File | null>(null)
  const [paymentProofUrl, setPaymentProofUrl] = useState<string | null>(null)
  const supabase = createClient()

  // State untuk data pengiriman
  const [provinces, setProvinces] = useState<{ province_id: string; province: string }[]>([])
  const [cities, setCities] = useState<{ city_id: string; city_name: string }[]>([])
  const [selectedProvince, setSelectedProvince] = useState<string>("")
  const [selectedCity, setSelectedCity] = useState<string>("")
  const [availableShippingOptions, setAvailableShippingOptions] = useState<any[]>([])
  const [selectedShippingOption, setSelectedShippingOption] = useState<any>(null)

  // Data provinsi Jabodetabek
  const jabodetabekProvinces = [
    { province_id: "6", province: "DKI Jakarta" },
    { province_id: "9", province: "Jawa Barat" }, // Untuk Bogor, Depok, Bekasi
    { province_id: "3", province: "Banten" }, // Untuk Tangerang
  ]

  // Data kota Jabodetabek
  const jabodetabekCities = {
    "6": [
      // DKI Jakarta
      { city_id: "151", city_name: "Jakarta Barat" },
      { city_id: "152", city_name: "Jakarta Pusat" },
      { city_id: "153", city_name: "Jakarta Selatan" },
      { city_id: "154", city_name: "Jakarta Timur" },
      { city_id: "155", city_name: "Jakarta Utara" },
    ],
    "9": [
      // Jawa Barat
      { city_id: "78", city_name: "Bogor" },
      { city_id: "79", city_name: "Bogor (Kota)" },
      { city_id: "115", city_name: "Depok" },
      { city_id: "54", city_name: "Bekasi" },
      { city_id: "55", city_name: "Bekasi (Kota)" },
    ],
    "3": [
      // Banten
      { city_id: "455", city_name: "Tangerang" },
      { city_id: "456", city_name: "Tangerang (Kota)" },
      { city_id: "457", city_name: "Tangerang Selatan" },
    ],
  }

  const [formData, setFormData] = useState({
    customerName: "",
    customerPhone: "",
    customerEmail: "",
    customerAddress: "",
    province: "",
    city: "",
    deliveryMethod: "self_pickup", // self_pickup, own_delivery, courier
    courier: "jne", // jne, tiki, pos
    shippingService: "", // OKE, REG, YES, dll
    paymentMethod: "", // DANA, OVO, GoPay, etc.
    notes: "",
  })

  useEffect(() => {
    // Redirect to cart if cart is empty
    if (items.length === 0) {
      router.push("/cart")
      return
    }

    // Fetch e-wallet settings
    const fetchEWalletSettings = async () => {
      const { data, error } = await supabase
        .from("e_wallet_settings")
        .select("*")
        .eq("is_active", true)
        .order("wallet_type")

      if (!error && data) {
        setEWalletSettings(data)
        if (data.length > 0) {
          setFormData((prev) => ({ ...prev, paymentMethod: data[0].wallet_type }))
        }
      }
    }

    fetchEWalletSettings()
  }, [items.length, router, supabase])

  // Set provinsi Jabodetabek saja
  useEffect(() => {
    // Langsung set provinsi Jabodetabek tanpa perlu API call
    setProvinces(jabodetabekProvinces)
  }, [])

  // Mengambil data kota berdasarkan provinsi
  useEffect(() => {
    if (!selectedProvince) {
      setCities([])
      return
    }

    // Gunakan data kota Jabodetabek yang sudah didefinisikan
    if (jabodetabekCities[selectedProvince as keyof typeof jabodetabekCities]) {
      setCities(jabodetabekCities[selectedProvince as keyof typeof jabodetabekCities])
    } else {
      setCities([])
    }
  }, [selectedProvince])

  // Menghitung biaya pengiriman berdasarkan metode pengiriman
  useEffect(() => {
    const calculateDeliveryFee = async () => {
      if (formData.deliveryMethod === "self_pickup") {
        setDeliveryFee(0)
      } else if (formData.deliveryMethod === "own_delivery") {
        // Free delivery for orders > 10kg within 2km
        if (totalWeight > 10) {
          setDeliveryFee(0)
        } else {
          setDeliveryFee(20000) // Flat fee for smaller orders
        }
      }
      // Untuk courier, biaya akan dihitung oleh calculateShippingCost
    }

    calculateDeliveryFee()
  }, [formData.deliveryMethod, totalWeight])

  // Menghitung ongkir dengan RajaOngkir
  const calculateShippingCost = async () => {
    if (formData.deliveryMethod !== "courier" || !selectedCity || !formData.courier) return

    setIsCalculatingFee(true)
    try {
      // Konversi berat dari kg ke gram untuk RajaOngkir
      const weightInGrams = totalWeight * 1000

      const response = await fetch("/api/shipping/cost", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          origin: "155", // ID kota asal (Jakarta Timur - sesuaikan dengan lokasi toko Anda)
          destination: selectedCity,
          weight: weightInGrams,
          courier: formData.courier,
        }),
      })

      if (!response.ok) throw new Error("Failed to calculate shipping cost")

      const data = await response.json()
      if (data.results && data.results.length > 0 && data.results[0].costs.length > 0) {
        setAvailableShippingOptions(data.results[0].costs)
        // Default ke opsi pengiriman pertama
        setSelectedShippingOption(data.results[0].costs[0])
        setDeliveryFee(data.results[0].costs[0].cost[0].value)

        // Update formData dengan layanan pengiriman default
        setFormData((prev) => ({
          ...prev,
          shippingService: data.results[0].costs[0].service,
        }))
      } else {
        setAvailableShippingOptions([])
        setSelectedShippingOption(null)
        setDeliveryFee(0)
      }
    } catch (error) {
      console.error("Error calculating shipping cost:", error)
      setAvailableShippingOptions([])
      setSelectedShippingOption(null)
      setDeliveryFee(0)
    } finally {
      setIsCalculatingFee(false)
    }
  }

  // Menghitung ongkir saat kota atau kurir berubah
  useEffect(() => {
    if (formData.deliveryMethod === "courier" && selectedCity && formData.courier) {
      calculateShippingCost()
    }
  }, [selectedCity, formData.courier, formData.deliveryMethod])

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleSelectChange = (name: string, value: string) => {
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  // Handler untuk perubahan provinsi
  const handleProvinceChange = (provinceId: string) => {
    setSelectedProvince(provinceId)
    setSelectedCity("")
    setFormData((prev) => ({
      ...prev,
      province: provinceId,
      city: "",
    }))
  }

  // Handler untuk perubahan kota
  const handleCityChange = (cityId: string) => {
    setSelectedCity(cityId)
    setFormData((prev) => ({
      ...prev,
      city: cityId,
    }))
  }

  // Handler untuk perubahan kurir
  const handleCourierChange = (courier: string) => {
    setFormData((prev) => ({
      ...prev,
      courier,
    }))
  }

  // Handler untuk perubahan layanan pengiriman
  const handleShippingServiceChange = (service: string, fee: number) => {
    setFormData((prev) => ({
      ...prev,
      shippingService: service,
    }))
    setDeliveryFee(fee)
  }

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    setPaymentProofFile(file)

    // Create a preview URL
    const url = URL.createObjectURL(file)
    setPaymentProofUrl(url)
  }

  // Fungsi untuk mengirimkan pesanan
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)

    try {
      // Validate form
      if (!formData.customerName || !formData.customerPhone || !formData.paymentMethod) {
        toast({
          title: "Form tidak lengkap",
          description: "Mohon lengkapi semua field yang diperlukan",
          variant: "destructive",
        })
        setIsSubmitting(false)
        return
      }

      // Validate address for delivery
      if (formData.deliveryMethod === "own_delivery" && !formData.customerAddress) {
        toast({
          title: "Alamat diperlukan",
          description: "Mohon isi alamat pengiriman",
          variant: "destructive",
        })
        setIsSubmitting(false)
        return
      }

      // Validate courier details
      if (formData.deliveryMethod === "courier") {
        if (
          !formData.province ||
          !formData.city ||
          !formData.customerAddress ||
          !formData.courier ||
          !formData.shippingService
        ) {
          toast({
            title: "Detail pengiriman tidak lengkap",
            description: "Mohon lengkapi semua detail pengiriman",
            variant: "destructive",
          })
          setIsSubmitting(false)
          return
        }
      }

      // Validate payment proof
      if (!paymentProofFile) {
        toast({
          title: "Bukti pembayaran diperlukan",
          description: "Mohon unggah bukti pembayaran",
          variant: "destructive",
        })
        setIsSubmitting(false)
        return
      }

      // Upload payment proof
      const fileName = `payment_proof/${Date.now()}_${paymentProofFile.name}`
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from("order-files")
        .upload(fileName, paymentProofFile)

      if (uploadError) {
        throw new Error(`Error uploading payment proof: ${uploadError.message}`)
      }

      // Get public URL for the uploaded file
      const { data: publicUrlData } = supabase.storage.from("order-files").getPublicUrl(fileName)
      const paymentProofPublicUrl = publicUrlData.publicUrl

      // Prepare shipping details
      let shippingDetails = {}
      if (formData.deliveryMethod === "courier") {
        const selectedProvinceName = provinces.find((p) => p.province_id === formData.province)?.province || ""
        const selectedCityName = cities.find((c) => c.city_id === formData.city)?.city_name || ""

        shippingDetails = {
          province: selectedProvinceName,
          city: selectedCityName,
          courier: formData.courier,
          courier_service: formData.shippingService,
          shipping_etd: selectedShippingOption?.cost[0]?.etd || "",
        }
      }

      // Create order
      const orderNumber = generateOrderNumber()
      const { data: orderData, error: orderError } = await supabase
        .from("orders")
        .insert([
          {
            order_number: orderNumber,
            customer_name: formData.customerName,
            customer_phone: formData.customerPhone,
            customer_email: formData.customerEmail || null,
            customer_address: formData.customerAddress || null,
            delivery_method: formData.deliveryMethod,
            payment_method: formData.paymentMethod,
            payment_proof_url: paymentProofPublicUrl,
            total_weight: totalWeight,
            total_price: totalPrice,
            delivery_fee: deliveryFee,
            status: "pending",
            tracking_code: orderNumber, // Use order number as tracking code
            notes: formData.notes || null,
            ...shippingDetails,
          },
        ])
        .select("id")
        .single()

      if (orderError) {
        throw new Error(`Error creating order: ${orderError.message}`)
      }

      // Create order items
      const orderItems = items.map((item) => ({
        order_id: orderData.id,
        product_name: item.product.name,
        quantity: item.quantity,
        price_per_kg: item.product.price,
        subtotal: item.product.price * item.quantity,
      }))

      const { error: itemsError } = await supabase.from("order_items").insert(orderItems)

      if (itemsError) {
        throw new Error(`Error creating order items: ${itemsError.message}`)
      }

      // Clear cart and redirect to success page
      clearCart()

      // Tampilkan toast untuk memberi tahu pengguna
      toast({
        title: "Pesanan berhasil dibuat",
        description: "Anda akan dialihkan ke halaman detail pesanan dalam beberapa detik.",
        duration: 5000,
      })

      // Tambahkan delay sebelum redirect untuk memastikan data tersimpan
      setTimeout(() => {
        console.log("Redirecting to order success page with tracking:", orderNumber)
        router.push(`/order-success?tracking=${orderNumber}`)
      }, 1500)
    } catch (error) {
      console.error("Checkout error:", error)
      toast({
        title: "Checkout gagal",
        description: error instanceof Error ? error.message : "Terjadi kesalahan saat checkout",
        variant: "destructive",
      })
      setIsSubmitting(false)
    }
  }

  if (items.length === 0) {
    return (
      <div className="container mx-auto px-4 py-32 min-h-screen">
        <div className="max-w-2xl mx-auto text-center">
          <div className="mb-6 flex justify-center">
            <div className="h-24 w-24 rounded-full bg-purple-100 flex items-center justify-center">
              <ShoppingBag className="h-12 w-12 text-primary" />
            </div>
          </div>
          <h1 className="text-2xl font-bold mb-4">Keranjang Belanja Kosong</h1>
          <p className="text-gray-600 mb-8">
            Anda belum menambahkan produk apapun ke keranjang belanja. Silakan lihat katalog produk kami untuk mulai
            berbelanja.
          </p>
          <Link href="/#catalog">
            <Button className="bg-gradient-to-r from-purple-600 to-green-600 hover:from-purple-700 hover:to-green-700">
              Lihat Katalog
            </Button>
          </Link>
        </div>
      </div>
    )
  }

  const selectedWallet = eWalletSettings.find((wallet) => wallet.wallet_type === formData.paymentMethod)

  return (
    <div className="container mx-auto px-4 py-32 min-h-screen">
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center mb-8">
          <Link href="/cart" className="flex items-center text-gray-600 hover:text-primary">
            <ArrowLeft className="h-4 w-4 mr-2" />
            <span>Kembali ke Keranjang</span>
          </Link>
        </div>

        <h1 className="text-3xl font-bold mb-8">Checkout</h1>

        {/* Informasi penting tentang kode tracking */}
        <div className="bg-blue-50 border-l-4 border-blue-400 p-4 mb-8 rounded-md">
          <div className="flex">
            <div className="flex-shrink-0">
              <Info className="h-5 w-5 text-blue-400" />
            </div>
            <div className="ml-3">
              <h3 className="text-sm font-medium text-blue-800">Informasi Penting</h3>
              <div className="mt-2 text-sm text-blue-700">
                <p>
                  Setelah menyelesaikan pemesanan, Anda akan dialihkan ke halaman detail pesanan dalam beberapa detik.
                  Harap tunggu hingga halaman tersebut muncul dan simpan kode tracking yang ditampilkan untuk melacak
                  pesanan Anda.
                </p>
              </div>
            </div>
          </div>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 space-y-8">
              {/* Customer Information */}
              <Card>
                <CardHeader>
                  <CardTitle>Informasi Pemesan</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="customerName">Nama Lengkap *</Label>
                      <Input
                        id="customerName"
                        name="customerName"
                        value={formData.customerName}
                        onChange={handleInputChange}
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="customerPhone">Nomor Telepon *</Label>
                      <Input
                        id="customerPhone"
                        name="customerPhone"
                        value={formData.customerPhone}
                        onChange={handleInputChange}
                        required
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="customerEmail">Email (opsional)</Label>
                    <Input
                      id="customerEmail"
                      name="customerEmail"
                      type="email"
                      value={formData.customerEmail}
                      onChange={handleInputChange}
                    />
                  </div>
                </CardContent>
              </Card>

              {/* Delivery Method */}
              <Card>
                <CardHeader>
                  <CardTitle>Metode Pengiriman</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <RadioGroup
                    value={formData.deliveryMethod}
                    onValueChange={(value) => handleSelectChange("deliveryMethod", value)}
                    className="space-y-3"
                  >
                    <div className="flex items-start space-x-2">
                      <RadioGroupItem value="self_pickup" id="self_pickup" />
                      <div className="grid gap-1.5">
                        <Label htmlFor="self_pickup" className="font-medium">
                          Ambil Sendiri
                        </Label>
                        <p className="text-sm text-gray-500">
                          Ambil pesanan langsung di lokasi kami (Bambu Apus, Jakarta Timur)
                        </p>
                      </div>
                    </div>
                    <div className="flex items-start space-x-2">
                      <RadioGroupItem value="own_delivery" id="own_delivery" />
                      <div className="grid gap-1.5">
                        <Label htmlFor="own_delivery" className="font-medium">
                          Diantar oleh Armada Kami
                        </Label>
                        <p className="text-sm text-gray-500">
                          Gratis untuk pesanan &gt; 10kg dengan jarak maksimal 2km. Biaya pengiriman Rp20.000 untuk
                          pesanan lainnya.
                        </p>
                      </div>
                    </div>
                    <div className="flex items-start space-x-2">
                      <RadioGroupItem value="courier" id="courier" />
                      <div className="grid gap-1.5">
                        <Label htmlFor="courier" className="font-medium">
                          Kurir Pengiriman
                        </Label>
                        <p className="text-sm text-gray-500">Pengiriman menggunakan jasa kurir </p>
                      </div>
                    </div>
                  </RadioGroup>

                  {formData.deliveryMethod === "courier" && (
                    <div className="space-y-4 pt-4 border-t">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor="province">Provinsi *</Label>
                          <Select value={selectedProvince} onValueChange={handleProvinceChange}>
                            <SelectTrigger>
                              <SelectValue placeholder="Pilih Provinsi" />
                            </SelectTrigger>
                            <SelectContent>
                              {provinces.map((province) => (
                                <SelectItem key={province.province_id} value={province.province_id}>
                                  {province.province}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="city">Kota/Kabupaten *</Label>
                          <Select value={selectedCity} onValueChange={handleCityChange} disabled={!selectedProvince}>
                            <SelectTrigger>
                              <SelectValue placeholder="Pilih Kota/Kabupaten" />
                            </SelectTrigger>
                            <SelectContent>
                              {cities.map((city) => (
                                <SelectItem key={city.city_id} value={city.city_id}>
                                  {city.city_name}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="customerAddress">Alamat Lengkap *</Label>
                        <Textarea
                          id="customerAddress"
                          name="customerAddress"
                          value={formData.customerAddress}
                          onChange={handleInputChange}
                          rows={3}
                          required
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="courier">Pilih Kurir *</Label>
                        <Select value={formData.courier} onValueChange={handleCourierChange}>
                          <SelectTrigger>
                            <SelectValue placeholder="Pilih Kurir" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="jne">JNE</SelectItem>
                            <SelectItem value="tiki">TIKI</SelectItem>
                            <SelectItem value="pos">POS Indonesia</SelectItem>
                            <SelectItem value="sicepat">SiCepat</SelectItem>
                            <SelectItem value="jnt">J&T Express</SelectItem>
                            <SelectItem value="anteraja">AnterAja</SelectItem>
                            <SelectItem value="ninja">Ninja Express</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      {selectedCity ? (
                        isCalculatingFee ? (
                          <div className="flex items-center justify-center py-4">
                            <Loader2 className="h-6 w-6 mr-2 animate-spin" />
                            <span>Menghitung biaya pengiriman...</span>
                          </div>
                        ) : availableShippingOptions.length > 0 ? (
                          <div className="space-y-2">
                            <Label>Pilih Layanan Pengiriman *</Label>
                            <RadioGroup
                              value={formData.shippingService}
                              onValueChange={(value) => {
                                const option = availableShippingOptions.find((opt) => opt.service === value)
                                if (option) {
                                  handleShippingServiceChange(value, option.cost[0].value)
                                }
                              }}
                              className="space-y-2"
                            >
                              {availableShippingOptions.map((option) => (
                                <div
                                  key={option.service}
                                  className="flex items-center justify-between border p-3 rounded-md"
                                >
                                  <div className="flex items-start space-x-2">
                                    <RadioGroupItem value={option.service} id={`service-${option.service}`} />
                                    <div>
                                      <Label htmlFor={`service-${option.service}`} className="font-medium">
                                        {option.service} - {option.description}
                                      </Label>
                                      <p className="text-sm text-gray-500">Estimasi {option.cost[0].etd} hari</p>
                                    </div>
                                  </div>
                                  <div className="font-medium">Rp{option.cost[0].value.toLocaleString()}</div>
                                </div>
                              ))}
                            </RadioGroup>
                          </div>
                        ) : formData.courier ? (
                          <div className="text-center py-4 text-yellow-600">
                            Tidak ada layanan pengiriman yang tersedia untuk tujuan ini.
                          </div>
                        ) : (
                          <div className="text-center py-4 text-gray-600">Silakan pilih kurir pengiriman</div>
                        )
                      ) : (
                        <div className="text-center py-4 text-gray-600">
                          Silakan pilih kota/kabupaten terlebih dahulu
                        </div>
                      )}
                    </div>
                  )}

                  {formData.deliveryMethod === "own_delivery" && (
                    <div className="space-y-2 pt-4">
                      <Label htmlFor="customerAddress">Alamat Pengiriman *</Label>
                      <Textarea
                        id="customerAddress"
                        name="customerAddress"
                        value={formData.customerAddress}
                        onChange={handleInputChange}
                        rows={3}
                        required
                      />
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Payment Method */}
              <Card>
                <CardHeader>
                  <CardTitle>Metode Pembayaran</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {eWalletSettings.length > 0 ? (
                    <>
                      <Select
                        value={formData.paymentMethod}
                        onValueChange={(value) => handleSelectChange("paymentMethod", value)}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Pilih metode pembayaran" />
                        </SelectTrigger>
                        <SelectContent>
                          {eWalletSettings.map((wallet) => (
                            <SelectItem key={wallet.id} value={wallet.wallet_type}>
                              {wallet.wallet_type}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>

                      {selectedWallet && (
                        <div className="p-4 bg-gray-50 rounded-md mt-4">
                          <p className="font-medium mb-2">{selectedWallet.wallet_type}</p>
                          <p className="text-sm">Nama: {selectedWallet.account_name}</p>
                          <p className="text-sm">Nomor: {selectedWallet.account_number}</p>
                          <p className="text-sm mt-2">
                            Silakan transfer sejumlah{" "}
                            <span className="font-semibold">Rp{(totalPrice + deliveryFee).toLocaleString()}</span> ke
                            rekening di atas.
                          </p>
                        </div>
                      )}

                      <div className="space-y-2 pt-4">
                        <Label htmlFor="paymentProof">Bukti Pembayaran *</Label>
                        <div className="flex items-center gap-4">
                          <Button
                            type="button"
                            variant="outline"
                            onClick={() => document.getElementById("paymentProof")?.click()}
                            className="flex items-center"
                          >
                            <Upload className="h-4 w-4 mr-2" />
                            Unggah Bukti Transfer
                          </Button>
                          <Input
                            id="paymentProof"
                            type="file"
                            accept="image/*"
                            className="hidden"
                            onChange={handleFileChange}
                          />
                          {paymentProofFile && <span className="text-sm text-gray-600">{paymentProofFile.name}</span>}
                        </div>
                        {paymentProofUrl && (
                          <div className="mt-4">
                            <p className="text-sm text-gray-600 mb-2">Preview:</p>
                            <div className="relative h-40 w-40 border rounded-md overflow-hidden">
                              <Image
                                src={paymentProofUrl || "/placeholder.svg"}
                                alt="Payment proof"
                                fill
                                className="object-contain"
                              />
                            </div>
                          </div>
                        )}
                      </div>
                    </>
                  ) : (
                    <p className="text-gray-600">Tidak ada metode pembayaran yang tersedia. Silakan hubungi admin.</p>
                  )}
                </CardContent>
              </Card>

              {/* Notes */}
              <Card>
                <CardHeader>
                  <CardTitle>Catatan (Opsional)</CardTitle>
                </CardHeader>
                <CardContent>
                  <Textarea
                    id="notes"
                    name="notes"
                    value={formData.notes}
                    onChange={handleInputChange}
                    placeholder="Tambahkan catatan untuk pesanan Anda"
                    rows={3}
                  />
                </CardContent>
              </Card>
            </div>

            {/* Order Summary */}
            <div>
              <Card className="sticky top-24">
                <CardHeader>
                  <CardTitle>Ringkasan Pesanan</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="space-y-2">
                      {items.map((item) => (
                        <div key={item.product.id} className="flex justify-between text-sm">
                          <span>
                            {item.product.name} x {item.quantity}kg
                          </span>
                          <span>Rp{(item.product.price * item.quantity).toLocaleString()}</span>
                        </div>
                      ))}
                    </div>

                    <div className="border-t pt-4 space-y-2">
                      <div className="flex justify-between">
                        <span>Subtotal</span>
                        <span>Rp{totalPrice.toLocaleString()}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Biaya Pengiriman</span>
                        {isCalculatingFee ? (
                          <span className="flex items-center">
                            <Loader2 className="h-3 w-3 mr-1 animate-spin" /> Menghitung...
                          </span>
                        ) : (
                          <span>Rp{deliveryFee.toLocaleString()}</span>
                        )}
                      </div>
                      <div className="flex justify-between font-bold pt-2 border-t">
                        <span>Total</span>
                        {isCalculatingFee ? (
                          <span className="flex items-center">
                            <Loader2 className="h-3 w-3 mr-1 animate-spin" /> Menghitung...
                          </span>
                        ) : (
                          <span>Rp{(totalPrice + deliveryFee).toLocaleString()}</span>
                        )}
                      </div>
                    </div>

                    <Button
                      type="submit"
                      className="w-full bg-gradient-to-r from-purple-600 to-green-600 hover:from-purple-700 hover:to-green-700"
                      disabled={isSubmitting || !formData.paymentMethod || !paymentProofFile || isCalculatingFee}
                    >
                      {isSubmitting ? (
                        <span className="flex items-center">
                          <Loader2 className="h-4 w-4 mr-2 animate-spin" /> Memproses...
                        </span>
                      ) : (
                        "Selesaikan Pesanan"
                      )}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </form>
      </div>
    </div>
  )
}