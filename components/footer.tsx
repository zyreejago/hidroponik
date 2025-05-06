import Link from "next/link"
import Image from "next/image"
import { Phone, Mail, Clock, Instagram, Facebook } from "lucide-react"

const Footer = () => {
  return (
    <footer className="bg-gradient-to-r from-purple-900 to-green-900 text-white">
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div>
            <div className="flex items-center mb-6">
              <div className="relative h-12 w-12 mr-3">
                <Image src="/logo.png" alt="Hidroponik Nusantara Logo" fill className="object-contain" />
              </div>
              <div>
                <h3 className="text-xl font-bold">Hidroponik Nusantara</h3>
                <p className="text-xs text-green-300">sayuran sehat, segar, bernutrisi</p>
              </div>
            </div>
            <p className="mb-6 text-gray-300">
              Pionir perusahaan yang bergerak di bidang pertanian hidroponik, menyediakan berbagai produk sayuran segar
              dan berkualitas tinggi.
            </p>
            <div className="flex space-x-4">
              <Link
                href="https://www.instagram.com/hidroponikciracas?igsh=MXNjZmM4MXZzNWFweQ=="
                target="_blank"
                className="hover:text-green-300 transition-colors"
              >
                <Instagram className="h-6 w-6" />
                <span className="sr-only">Instagram</span>
              </Link>
              <Link
                href="https://www.facebook.com/profile.php?id=100010931989561"
                target="_blank"
                className="hover:text-green-300 transition-colors"
              >
                <Facebook className="h-6 w-6" />
                <span className="sr-only">Facebook</span>
              </Link>
            </div>
          </div>

          <div>
            <h3 className="text-xl font-bold mb-6">Informasi Kontak</h3>
            <ul className="space-y-4">
              <li className="flex items-center">
                <Phone className="h-5 w-5 mr-3 text-green-300" />
                <Link
                  href="https://wa.me/6281219614656"
                  target="_blank"
                  className="hover:text-green-300 transition-colors"
                >
                  081219614656
                </Link>
              </li>
              <li className="flex items-center">
                <Mail className="h-5 w-5 mr-3 text-green-300" />
                <Link href="mailto:hidroponikciracas@gmail.com" className="hover:text-green-300 transition-colors">
                  hidroponikciracas@gmail.com
                </Link>
              </li>
              <li className="flex items-start">
                <Clock className="h-5 w-5 mr-3 mt-0.5 text-green-300" />
                <div>
                  <p>Jam Operasional:</p>
                  <p className="text-gray-300">Senin – Minggu</p>
                  <p className="text-gray-300">08.00 – 17.00</p>
                </div>
              </li>
            </ul>
          </div>

          <div>
            <h3 className="text-xl font-bold mb-6">Tautan Cepat</h3>
            <ul className="space-y-3">
              <li>
                <Link href="#about" className="hover:text-green-300 transition-colors flex items-center">
                  <span className="w-2 h-2 bg-green-400 rounded-full mr-2"></span>
                  Tentang Kami
                </Link>
              </li>
              <li>
                <Link href="#catalog" className="hover:text-green-300 transition-colors flex items-center">
                  <span className="w-2 h-2 bg-green-400 rounded-full mr-2"></span>
                  Katalog
                </Link>
              </li>
              <li>
                <Link href="#how-to-order" className="hover:text-green-300 transition-colors flex items-center">
                  <span className="w-2 h-2 bg-green-400 rounded-full mr-2"></span>
                  Cara Pesan
                </Link>
              </li>
              <li>
                <Link href="#contact" className="hover:text-green-300 transition-colors flex items-center">
                  <span className="w-2 h-2 bg-green-400 rounded-full mr-2"></span>
                  Kontak
                </Link>
              </li>
              <li>
                <Link href="/admin/login" className="hover:text-green-300 transition-colors flex items-center">
                  <span className="w-2 h-2 bg-green-400 rounded-full mr-2"></span>
                  Admin Login
                </Link>
              </li>
            </ul>
          </div>
        </div>

        <div className="border-t border-gray-700 mt-12 pt-8 text-center">
          <p className="text-gray-300">&copy; {new Date().getFullYear()} Hidroponik Nusantara. Hak Cipta Dilindungi.</p>
        </div>
      </div>
    </footer>
  )
}

export default Footer
