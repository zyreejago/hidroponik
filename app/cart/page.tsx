"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import Image from "next/image"
import { useCart } from "@/contexts/cart-context"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Trash2, Plus, Minus, ArrowLeft, ShoppingBag } from "lucide-react"
import Link from "next/link"

export default function CartPage() {
  const { items, updateQuantity, removeItem, totalItems, totalPrice, totalWeight } = useCart()
  const router = useRouter()
  const [isCheckingOut, setIsCheckingOut] = useState(false)

  const handleCheckout = () => {
    if (items.length === 0) return
    router.push("/checkout")
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

  return (
    <div className="container mx-auto px-4 py-32 min-h-screen">
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center mb-8">
          <Link href="/" className="flex items-center text-gray-600 hover:text-primary">
            <ArrowLeft className="h-4 w-4 mr-2" />
            <span>Kembali Berbelanja</span>
          </Link>
        </div>

        <h1 className="text-3xl font-bold mb-8">Keranjang Belanja</h1>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2">
            <Card>
              <CardHeader>
                <CardTitle>Produk ({totalItems})</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {items.map((item) => (
                    <div key={item.product.id} className="flex items-center border-b pb-4">
                      <div className="relative h-20 w-20 rounded-md overflow-hidden flex-shrink-0">
                        <Image
                          src={item.product.image || "/placeholder.svg"}
                          alt={item.product.name}
                          fill
                          className="object-cover"
                        />
                      </div>
                      <div className="ml-4 flex-grow">
                        <h3 className="font-medium">{item.product.name}</h3>
                        <p className="text-sm text-gray-600">Rp{item.product.price.toLocaleString()}/kg</p>
                      </div>
                      <div className="flex items-center border rounded-md">
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8"
                          onClick={() => updateQuantity(item.product.id, item.quantity - 1)}
                        >
                          <Minus className="h-4 w-4" />
                        </Button>
                        <span className="w-8 text-center">{item.quantity}</span>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8"
                          onClick={() => updateQuantity(item.product.id, item.quantity + 1)}
                        >
                          <Plus className="h-4 w-4" />
                        </Button>
                      </div>
                      <div className="ml-4 w-24 text-right">
                        <p className="font-medium">Rp{(item.product.price * item.quantity).toLocaleString()}</p>
                      </div>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="ml-2 text-gray-500 hover:text-red-500"
                        onClick={() => removeItem(item.product.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          <div>
            <Card>
              <CardHeader>
                <CardTitle>Ringkasan Belanja</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex justify-between">
                    <span>Total Berat</span>
                    <span>{totalWeight} kg</span>
                  </div>
                  <div className="flex justify-between font-medium">
                    <span>Total Harga</span>
                    <span>Rp{totalPrice.toLocaleString()}</span>
                  </div>
                  <div className="pt-4 border-t">
                    <Button
                      className="w-full bg-gradient-to-r from-purple-600 to-green-600 hover:from-purple-700 hover:to-green-700"
                      onClick={handleCheckout}
                      disabled={isCheckingOut}
                    >
                      {isCheckingOut ? "Memproses..." : "Lanjutkan ke Pembayaran"}
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}
