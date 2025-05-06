import Image from "next/image"

const About = () => {
  return (
    <section id="about" className="py-20 bg-white relative">
      {/* Decorative elements */}
      <div className="absolute top-0 left-0 w-full h-20 bg-gradient-to-b from-purple-50 to-white -z-10"></div>

      <div className="container mx-auto px-4">
        <div className="max-w-3xl mx-auto text-center mb-16">
          <h2 className="text-3xl font-bold mb-6 text-transparent bg-clip-text bg-gradient-to-r from-purple-600 to-green-600">
            TENTANG KAMI
          </h2>
          <div className="w-20 h-1 bg-gradient-to-r from-purple-600 to-green-600 mx-auto mb-8"></div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
          <div className="relative">
            <div className="relative h-80 w-full rounded-2xl overflow-hidden shadow-lg">
              <Image
                src="/about2.jpeg"
                alt="Hidroponik Nusantara Greenhouse"
                fill
                className="object-cover"
              />
            </div>
            {/* Decorative elements */}
            <div className="absolute -bottom-4 -right-4 w-32 h-32 bg-green-100 rounded-xl -z-10"></div>
          </div>

          <div className="space-y-6">
            <h3 className="text-2xl font-semibold text-gray-800">HIDROPONIK NUSANTARA</h3>
            <p className="text-gray-700">
              Sayuran hidroponik kami ditanam di lingkungan yang terkontrol dan steril di dalam greenhouse, memastikan
              standar kesegaran dan kualitas tertinggi. Dengan pengalaman kami selama 10 tahun dan bantuan petani kami
              yang berpengetahuan, tidak hanya berfokus pada pertumbuhan produk pertanian, tetapi juga memastikan bahwa
              setiap tahap proses produksi mulai dari pemilihan bibit unggul, pengelolaan nutrisi, proses panen hingga
              pengemasan dilakukan dengan baik.
            </p>
            <p className="text-gray-700">
              Sayuran kami dipetik secara selektif setiap hari, segar, dan dikemas dengan sangat hati-hati untuk
              memastikan bahwa produk kami sampai aman di tangan Anda.
            </p>
            <p className="text-gray-800 font-medium">
              Hidroponik Nusantara siap menjadi pilihan utama bagi Anda yang mengutamakan produk segar, sehat, dan
              berkualitas.
            </p>
          </div>
        </div>
      </div>
    </section>
  )
}

export default About
