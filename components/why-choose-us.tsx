"use client"

import { Check, Leaf, Shield, TrendingUp } from "lucide-react"
import { motion } from "framer-motion"

const WhyChooseUs = () => {
  const benefits = [
    {
      icon: <Leaf className="h-6 w-6 text-white" />,
      title: "Sayuran Segar dan Bergizi",
      description:
        "Dengan menggunakan bibit unggul, menghasilkan tanaman yang memiliki ukuran, rasa, dan nilai gizi yang lebih baik.",
    },
    {
      icon: <Check className="h-6 w-6 text-white" />,
      title: "Kualitas Terjamin",
      description:
        "Setiap produk sayuran kami dipilih dengan selektif dan ditanam menggunakan sistem hidroponik yang terkontrol untuk memastikan kualitas dan kesegarannya tetap terjaga.",
    },
    {
      icon: <Shield className="h-6 w-6 text-white" />,
      title: "Bebas Pestisida dan Bahan Kimia",
      description:
        "Semua sayuran kami bebas dari bahan kimia berbahaya, kami menyediakan sayuran yang tumbuh tanpa pestisida untuk menghasilkan produk yang lebih sehat dan kaya akan nutrisi.",
    },
    {
      icon: <TrendingUp className="h-6 w-6 text-white" />,
      title: "Harga Stabil",
      description: "Masa panen yang terjadwal mencegah kelangkaan dan harga meroket.",
    },
  ]

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
    <section className="py-20 bg-gradient-to-b from-purple-50 to-white">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <h2 className="text-3xl font-bold mb-6 text-transparent bg-clip-text bg-gradient-to-r from-purple-600 to-green-600">
            KENAPA MEMILIH KAMI
          </h2>
          <div className="w-20 h-1 bg-gradient-to-r from-purple-600 to-green-600 mx-auto"></div>
        </div>

        <motion.div
          className="grid grid-cols-1 md:grid-cols-2 gap-8"
          variants={container}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, amount: 0.2 }}
        >
          {benefits.map((benefit, index) => (
            <motion.div key={index} variants={item}>
              <div className="bg-white rounded-xl shadow-md hover:shadow-lg transition-shadow p-6 h-full">
                <div className="flex items-start">
                  <div className="flex-shrink-0 w-12 h-12 rounded-full bg-gradient-to-r from-purple-600 to-green-600 flex items-center justify-center">
                    {benefit.icon}
                  </div>
                  <div className="ml-4">
                    <h3 className="text-xl font-semibold text-gray-800 mb-2">{benefit.title}</h3>
                    <p className="text-gray-600">{benefit.description}</p>
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  )
}

export default WhyChooseUs
