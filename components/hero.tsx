import Link from "next/link"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { ArrowRight } from "lucide-react"

const Hero = () => {
  return (
    <section className="relative pt-32 pb-20 md:pt-40 md:pb-28 overflow-hidden">
      {/* Background gradient */}
      <div className="absolute inset-0 bg-gradient-to-b from-purple-50 to-white -z-10"></div>

      {/* Decorative circles */}
      <div className="absolute top-20 right-0 w-72 h-72 bg-green-200 rounded-full opacity-20 blur-3xl -z-10"></div>
      <div className="absolute bottom-10 left-0 w-80 h-80 bg-purple-200 rounded-full opacity-20 blur-3xl -z-10"></div>

      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
          <div className="text-center md:text-left">
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6 leading-tight">
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-600 to-green-600">
                HIDROPONIK NUSANTARA
              </span>
            </h1>
            <p className="text-lg text-gray-700 mb-8 max-w-lg mx-auto md:mx-0">
              Pionir perusahaan yang bergerak di bidang pertanian hidroponik, menyediakan berbagai produk sayuran segar
              dan berkualitas tinggi langsung dari kebun hidroponik kami.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center md:justify-start">
              <Link href="https://wa.me/6281219614656" target="_blank" rel="noopener noreferrer">
                <Button className="bg-gradient-to-r from-purple-600 to-green-600 hover:from-purple-700 hover:to-green-700 px-6 py-6 h-auto text-base">
                  Pesan Sekarang
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
              </Link>
              <Link href="#catalog">
                <Button variant="outline" className="px-6 py-6 h-auto text-base">
                  Lihat Katalog
                </Button>
              </Link>
            </div>
          </div>
          <div className="relative">
            <div className="relative h-64 md:h-96 w-full rounded-2xl overflow-hidden shadow-2xl transform transition-transform hover:scale-105 duration-500">
              <Image
                src="/home.jpeg"
                alt="Hidroponik Nusantara"
                fill
                className="object-cover"
              />
            </div>
            {/* Decorative elements */}
            <div className="absolute -bottom-6 -left-6 w-24 h-24 bg-purple-100 rounded-full border-4 border-purple-200 -z-10"></div>
            <div className="absolute -top-6 -right-6 w-20 h-20 bg-green-100 rounded-full border-4 border-green-200 -z-10"></div>
          </div>
        </div>
      </div>
    </section>
  )
}

export default Hero