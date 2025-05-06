import Image from "next/image"

const Partners = () => {
  return (
    <section id="partner" className="py-20 bg-white">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <h2 className="text-3xl font-bold mb-6 text-transparent bg-clip-text bg-gradient-to-r from-purple-600 to-green-600">
            PARTNER KAMI
          </h2>
          <div className="w-20 h-1 bg-gradient-to-r from-purple-600 to-green-600 mx-auto"></div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 place-items-center gap-8 mb-16">
  {["/partner1.jpg", "/partner2.png"].map((src, i) => (
    <div
      key={i}
      className="flex items-center justify-center bg-white p-4 rounded-lg shadow-sm hover:shadow-md transition-shadow"
    >
      <div className="relative h-24 w-60">
        <Image
          src={src}
          alt={`Partner ${i + 1}`}
          fill
          className="object-contain"
        />
      </div>
    </div>
  ))}
</div>


        <div className="max-w-3xl mx-auto text-center">
          <h3 className="text-2xl font-bold text-gray-800 mb-4">Partner Dengan Kami</h3>
          <p className="text-gray-700 mb-4">
            Ingin tahu lebih banyak tentang produk segar dari Hidroponik Nusantara?
            <br />
            Apakah Anda seorang reseller, afiliasi atau asosiasi yang mencari kerja sama dengan kami?
          </p>
          <p className="text-gray-600">
            Kirimkan pesan kepada kami melalui form di bawah dan kami akan menanggapi pertanyaan Anda sesegera mungkin.
          </p>
        </div>
      </div>
    </section>
  )
}

export default Partners
