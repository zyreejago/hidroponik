"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import Image from "next/image"
import { Menu, X, ShoppingCart } from "lucide-react"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import { useCart } from "@/contexts/cart-context"
import { Badge } from "@/components/ui/badge"
import { usePathname } from "next/navigation"

const Navbar = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [scrolled, setScrolled] = useState(false)
  const { totalItems } = useCart()
  const pathname = usePathname()
  
  // Check if current path is an admin page, but allow navbar on login page
  const isAdminPage = pathname?.startsWith('/admin') && pathname !== '/admin/login'
  
  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 10)
    }

    // Only add event listener if not on admin page or if on login page
    if (!isAdminPage) {
      window.addEventListener("scroll", handleScroll)
      return () => window.removeEventListener("scroll", handleScroll)
    }
  }, [isAdminPage])

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen)
  }

  const navItems = [
    { name: "Beranda", href: "/" },
    { name: "Tentang Kami", href: "/#about" },
    { name: "Katalog", href: "/#catalog" },
    { name: "Cara Pesan", href: "/#how-to-order" },
    { name: "Lokasi", href: "/#locations" },
    { name: "Kontak", href: "/#contact" },
    { name: "Lacak Pesanan", href: "/track-order" },
  ]
  
  // Don't render navbar on admin pages except login page
  if (isAdminPage) {
    return null
  }

  return (
    <header
      className={cn(
        "fixed top-0 left-0 right-0 z-50 transition-all duration-300",
        scrolled ? "bg-white/90 backdrop-blur-md shadow-sm py-2" : "bg-transparent py-4",
      )}
    >
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between">
          <Link href="/" className="flex items-center space-x-2">
            <div className="relative h-10 w-10">
              <Image src="/logo.png" alt="Hidroponik Nusantara Logo" fill className="object-contain" />
            </div>
            <div>
              <span className="font-bold text-transparent bg-clip-text bg-gradient-to-r from-purple-600 to-green-600">
                Hidroponik Nusantara
              </span>
              <p className="text-xs text-green-600 hidden sm:block">sayuran sehat, segar, bernutrisi</p>
            </div>
          </Link>

          <nav className="hidden md:flex items-center space-x-6">
            {navItems.map((item) => (
              <a
                key={item.name}
                href={item.href}
                className="text-gray-700 hover:text-primary transition-colors text-sm font-medium"
              >
                {item.name}
              </a>
            ))}
            <Link href="/cart" className="relative">
              <Button variant="ghost" size="icon" className="relative">
                <ShoppingCart className="h-5 w-5" />
                {totalItems > 0 && (
                  <Badge
                    className="absolute -top-2 -right-2 h-5 w-5 flex items-center justify-center p-0 bg-primary text-white"
                    variant="default"
                  >
                    {totalItems}
                  </Badge>
                )}
              </Button>
            </Link>
            <a href="https://wa.me/6281219614656" target="_blank" rel="noopener noreferrer">
              <Button
                size="sm"
                className="bg-gradient-to-r from-purple-600 to-green-600 hover:from-purple-700 hover:to-green-700"
              >
                Pesan Sekarang
              </Button>
            </a>
          </nav>

          <div className="flex items-center md:hidden">
            <Link href="/cart" className="relative mr-2">
              <Button variant="ghost" size="icon" className="relative">
                <ShoppingCart className="h-5 w-5" />
                {totalItems > 0 && (
                  <Badge
                    className="absolute -top-2 -right-2 h-5 w-5 flex items-center justify-center p-0 bg-primary text-white"
                    variant="default"
                  >
                    {totalItems}
                  </Badge>
                )}
              </Button>
            </Link>
            <button onClick={toggleMenu} className="text-gray-700 focus:outline-none">
              {isMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile menu */}
      {isMenuOpen && (
        <div className="md:hidden bg-white border-t mt-2 shadow-lg">
          <div className="container mx-auto px-4 py-3">
            <nav className="flex flex-col space-y-3">
              {navItems.map((item) => (
                <a
                  key={item.name}
                  href={item.href}
                  className="text-gray-700 hover:text-primary py-2 transition-colors"
                  onClick={() => setIsMenuOpen(false)}
                >
                  {item.name}
                </a>
              ))}
              <a
                href="https://wa.me/6281219614656"
                target="_blank"
                rel="noopener noreferrer"
                className="pt-2"
                onClick={() => setIsMenuOpen(false)}
              >
                <Button className="w-full bg-gradient-to-r from-purple-600 to-green-600 hover:from-purple-700 hover:to-green-700">
                  Pesan Sekarang
                </Button>
              </a>
            </nav>
          </div>
        </div>
      )}
    </header>
  )
}

export default Navbar