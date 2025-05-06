"use client"

import { useState } from "react"
import Image from "next/image"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { ShoppingCart, Plus, Minus, ExternalLink } from 'lucide-react'
import { motion } from "framer-motion"
import { useCart } from "@/contexts/cart-context"
import { toast } from "@/hooks/use-toast"
import type { Product } from "@/types/order"

const products: Product[] = [
  {
    id: 1,
    name: "Bayam Hijau",
    price: 20000,
    description:
      "Bayam mengandung antioksidan, seperti vitamin C dan Vitamin E yang membantu melawan radikal bebas dalam tubuh dan dapat melindungi sel-sel dari kerusakan. Kandungan folat dalam bayam penting untuk kesehatan otak dan dapat membantu meningkatkan kognisi sehingga menjadikannya pilihan yang sangat baik untuk mendukung kesehatan mental dan fisik.",
    source: "https://telemed.ihc.id/artikel-detail-1081-Manfaat-Sayur-Bayam-Untuk-Kesehatan.html",
    image: "/bayam_hijau.jpg",
  },
  {
    id: 2,
    name: "Kangkung",
    price: 20000,
    description:
      "Kangkung memiliki ragam senyawa tanaman dengan aktivitas antioksidan, seperti flavonoid, asam palmitate dan phytol. Antioksidan tersebut guna melawan radikal bebas yang kerap menyebabkan kerusakan DNA, sel jaringan hingga organ tubuh.",
    source: "https://telemed.ihc.id/artikel-detail-609-Manfaat-Kangkung-Untuk-Kesehatan.html",
    image: "/kangkung.jpg",
  },
  {
    id: 3,
    name: "Caisim",
    price: 22000,
    description:
      "Caisim adalah sayuran yang kaya vitamin juga mineral, yang dibutuhkan tubuh. Caisim mengandung vitamin K dan C yang berkontribusi secara baik untuk menjaga sistem pertahanan kekebalan tubuh.",
    source:
      "https://www.liputan6.com/hot/read/5126130/14-manfaat-sawi-hijau-untuk-kesehatan-kaya-antioksidan-dan-sumber-vitamin?page=4",
    image: "/caisim.jpg",
  },
  {
    id: 4,
    name: "Pakcoy",
    price: 22000,
    description:
      "Sayuran ini penuh dengan senyawa untuk melawan kanker seperti vitamin C, vitamin E, beta-karoten, folat, dan selenium. Vitamin C, vitamin E, dan beta-karoten adalah antioksidan kuat yang dapat membantu mencegah kerusakan sel akibat radikal bebas.",
    source: "https://www.kompas.com/sains/read/2023/08/02/203000823/6-manfaat-pakcoy-untuk-kesehatan",
    image: "/pakcoy.jpg",
  },
  {
    id: 5,
    name: "Kale",
    price: 35000,
    description:
      'Kale adalah sayuran hijau bergizi tinggi yang sering disebut "superfood" karena kandungan nutrisi yang melimpah dan manfaatnya bagi kesehatan. Kale dikenal baik untuk kesehatan jantung, mata, tulang, sistem pencernaan, serta memiliki efek anti-penuaan dan detoksifikasi kulit.',
    source: "https://www.halodoc.com/artikel/mengenal-sayur-kale-dan-manfaatnya-untuk-kesehatan",
    image: "/kale.jpg",
  },
  {
    id: 6,
    name: "Selada Keriting",
    price: 25000,
    description:
      "Selada keriting adalah salah satu sayuran daun yang rendah kalori dan banyak mengandung serat. Kombinasi rendah kalori dan tinggi serat membuat selada cocok dikonsumsi sebagai makanan penurun berat badan.",
    source:
      "https://www.kompas.com/tren/read/2023/11/22/063000665/jadi-lalapan-penurun-berat-badan-ini-4-efek-samping-daun-selada?page=all",
    image: "/selada_keriting.jpg",
  },
  {
    id: 7,
    name: "Selada Romaine",
    price: 25000,
    description:
      "Selada romaine adalah salah satu jenis sayuran hijau yang sering digunakan dalam salad dan hidangan sehat lainnya. Selada romaine juga kaya akan nutrisi penting seperti serat, vitamin A, vitamin K, folat, dan mineral seperti kalium.",
    source: "https://www.halodoc.com/artikel/selada-romaine-ini-kandungan-nutrisi-dan-manfaatnya-untuk-kesehatan",
    image: "/selada_romaine.jpg",
  },
  {
    id: 8,
    name: "Melon Fujisawa",
    price: 33000,
    description:
      "Melon Fujisawa merupakan jenis melon varietas Jepang yang memiliki tekstur daging empuk, renyah, dan manis, dengan warna orange, sedangkan kulitnya tebal dan berjaring rapat berwarna hijau.",
    source:
      "https://surabaya.tribunnews.com/2022/09/14/sukses-budidaya-melon-sehat-dari-jepang-desa-di-lamongan-raup-pendapatan-besar-tanpa-pupuk-kimia",
    image: "/melon_fujisawa.jpg",
  },
  {
    id: 9,
    name: "Bayam Merah",
    price: 20000,
    description:
      "Bayam mengandung antioksidan, seperti vitamin C dan Vitamin E yang membantu melawan radikal bebas dalam tubuh dan dapat melindungi sel-sel dari kerusakan. Kandungan folat dalam bayam penting untuk kesehatan otak dan dapat membantu meningkatkan kognisi sehingga menjadikannya pilihan yang sangat baik untuk mendukung kesehatan mental dan fisik.",
    source: "https://telemed.ihc.id/artikel-detail-1081-Manfaat-Sayur-Bayam-Untuk-Kesehatan.html",
    image: "/bayam_merah.jpg",
  },
  {
    id: 10,
    name: "Melon Sweetnet",
    price: 33000,
    description:
      "Melon Fujisawa merupakan jenis melon varietas Jepang yang memiliki tekstur daging empuk, renyah, dan manis, dengan warna orange, sedangkan kulitnya tebal dan berjaring rapat berwarna hijau.",
    source:
      "https://surabaya.tribunnews.com/2022/09/14/sukses-budidaya-melon-sehat-dari-jepang-desa-di-lamongan-raup-pendapatan-besar-tanpa-pupuk-kimia",
    image: "/melon_sweetnet.jpg",
  },
]

const Catalog = () => {
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null)
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [quantity, setQuantity] = useState(1)
  const { addItem } = useCart()

  const handleProductClick = (product: Product) => {
    setSelectedProduct(product)
    setQuantity(1)
    setIsDialogOpen(true)
  }

  const handleAddToCart = () => {
    if (selectedProduct) {
      addItem(selectedProduct, quantity)
      toast({
        title: "Produk ditambahkan ke keranjang",
        description: `${quantity} kg ${selectedProduct.name} telah ditambahkan ke keranjang belanja.`,
      })
      setIsDialogOpen(false)
    }
  }

  const incrementQuantity = () => setQuantity((prev) => prev + 1)
  const decrementQuantity = () => setQuantity((prev) => (prev > 1 ? prev - 1 : 1))

  const container = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
      },
    },
  }

  const item = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0 },
  }

  return (
    <section id="catalog" className="py-20 bg-gradient-to-b from-white to-purple-50">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <h2 className="text-3xl font-bold mb-6 text-transparent bg-clip-text bg-gradient-to-r from-purple-600 to-green-600">
            KATALOG PRODUK
          </h2>
          <p className="text-gray-600 mb-4">(Klik pada produk untuk melihat detail)</p>
          <div className="w-20 h-1 bg-gradient-to-r from-purple-600 to-green-600 mx-auto"></div>
        </div>

        <motion.div
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6"
          variants={container}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, amount: 0.2 }}
        >
          {products.map((product) => (
            <motion.div key={product.id} variants={item}>
              <Card
                className="overflow-hidden hover:shadow-lg transition-all duration-300 cursor-pointer h-full"
                onClick={() => handleProductClick(product)}
              >
                <div className="relative h-[300px] w-full">
                  <Image
                    src={product.image || "/placeholder.svg"}
                    alt={product.name}
                    fill
                    className="object-cover transition-transform duration-300 hover:scale-105"
                  />
                </div>
                <CardContent className="p-4">
                  <h3 className="text-xl font-semibold text-gray-800 mb-1">{product.name}</h3>
                  <p className="text-primary font-medium">Rp{product.price.toLocaleString()}/kg</p>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </motion.div>
      </div>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-3xl">
          {selectedProduct && (
            <>
              <DialogHeader>
                <DialogTitle className="text-2xl text-primary">{selectedProduct.name}</DialogTitle>
                <DialogDescription className="text-primary font-medium">
                  Rp{selectedProduct.price.toLocaleString()}/kg
                </DialogDescription>
              </DialogHeader>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-4">
                <div className="relative h-64 rounded-lg overflow-hidden">
                  <Image
                    src={selectedProduct.image || "/placeholder.svg"}
                    alt={selectedProduct.name}
                    fill
                    className="object-cover"
                  />
                </div>
                <div>
                  <p className="text-gray-700 mb-4">{selectedProduct.description}</p>
                  <p className="text-sm text-gray-500 flex items-center">
                    <ExternalLink className="h-4 w-4 mr-1" />
                    <a
                      href={selectedProduct.source}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-primary hover:underline"
                    >
                      Sumber Informasi
                    </a>
                  </p>
                  <div className="flex items-center space-x-4 mt-6">
                    <span className="text-gray-700">Jumlah (kg):</span>
                    <div className="flex items-center border rounded-md">
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8"
                        onClick={(e) => {
                          e.stopPropagation()
                          decrementQuantity()
                        }}
                      >
                        <Minus className="h-4 w-4" />
                      </Button>
                      <span className="w-8 text-center">{quantity}</span>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8"
                        onClick={(e) => {
                          e.stopPropagation()
                          incrementQuantity()
                        }}
                      >
                        <Plus className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                  <p className="mt-4 font-semibold">Total: Rp{(selectedProduct.price * quantity).toLocaleString()}</p>
                </div>
              </div>
              <div className="mt-6 flex justify-end space-x-2">
                <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
                  Batal
                </Button>
                <Button
                  className="bg-gradient-to-r from-purple-600 to-green-600 hover:from-purple-700 hover:to-green-700"
                  onClick={handleAddToCart}
                >
                  <ShoppingCart className="h-4 w-4 mr-2" />
                  Tambah ke Keranjang
                </Button>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>
    </section>
  )
}

export default Catalog
