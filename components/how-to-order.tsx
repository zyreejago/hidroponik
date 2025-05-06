"use client"

import { Phone, ShoppingCart, CreditCard, Truck } from "lucide-react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { motion } from "framer-motion"

const HowToOrder = () => {
  const steps = [
    {
      icon: <Phone className="h-8 w-8 text-white" />,
      title: "Hubungi WhatsApp",
      description:
        "Anda dapat menghubungi WhatsApp resmi Hidroponik Nusantara untuk melakukan pemesanan. Anda bisa menanyakan harga dan kesediaan stock yang ada.",
    },
    {
      icon: <ShoppingCart className="h-8 w-8 text-white" />,
      title: "Lakukan Pemesanan",
      description:
        "Setelah deal dengan harga dan stock tersedia, Anda dapat segera melakukan pemesanan dengan mengisi nama, alamat tujuan, dan jumlah pesanan (kg).",
    },
    {
      icon: <CreditCard className="h-8 w-8 text-white" />,
      title: "Pembayaran",
      description:
        "Setelah menghitung total pesanan dan ongkir (jika menggunakan lalamove). Anda dapat melakukan pembayaran via transfer.",
    },
    {
      icon: <Truck className="h-8 w-8 text-white" />,
      title: "Pengiriman",
      description:
        "Pengiriman akan segera dilakukan pada hari H sesuai jam operasional. Jika pesanan sudah sampai, harap segera konfirmasi penerimaan pesanan.",
    },
  ]

  return (
    <section id="how-to-order" className="py-20 bg-white">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <h2 className="text-3xl font-bold mb-6 text-transparent bg-clip-text bg-gradient-to-r from-purple-600 to-green-600">
            CARA PEMESANAN
          </h2>
          <div className="w-20 h-1 bg-gradient-to-r from-purple-600 to-green-600 mx-auto"></div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {steps.map((step, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              viewport={{ once: true }}
              className="flex flex-col items-center text-center"
            >
              <div className="w-16 h-16 rounded-full bg-gradient-to-r from-purple-600 to-green-600 flex items-center justify-center mb-6 shadow-lg">
                {step.icon}
              </div>
              <h3 className="text-xl font-semibold text-gray-800 mb-3">{step.title}</h3>
              <p className="text-gray-600">{step.description}</p>
            </motion.div>
          ))}
        </div>

        <div className="mt-16 text-center">
          <Link href="https://wa.me/6281219614656" target="_blank" rel="noopener noreferrer">
            <Button className="bg-gradient-to-r from-purple-600 to-green-600 hover:from-purple-700 hover:to-green-700 px-8 py-6 h-auto text-base">
              PESAN SEKARANG
            </Button>
          </Link>
        </div>

        <div className="mt-16 bg-purple-50 p-8 rounded-2xl shadow-sm">
          <div className="max-w-3xl mx-auto">
            <p className="text-gray-700 mb-4">
              Salah satu keunggulan menanam dengan cara hidroponik adalah asupan nutrisinya lengkap dan semua nutrisi
              untuk pertumbuhan dapat terserap dengan sempurna. Selain asupan nutrisinya yang sempurna, teknologi
              hidroponik akan mampu mengendalikan hama dan penyakit secara lebih terkontrol.
            </p>
            <p className="text-gray-700 mb-4">
              Kami memahami bahwa sifat produk segar kami yang mudah rusak membuat pengemasan harus menjadi kunci untuk
              memastikan produk sampai di tempat tujuan dengan aman, segar, dan dalam kondisi baik.
            </p>
            <p className="text-gray-800 font-semibold">
              Jangan khawatir! Kualitas sayuran kami berada pada level premium dan kami siap memenuhi kebutuhan Anda!
            </p>
          </div>
        </div>
      </div>
    </section>
  )
}

export default HowToOrder
