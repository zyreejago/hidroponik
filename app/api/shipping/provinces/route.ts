import { NextResponse } from "next/server"
import { getProvinces } from "@/lib/rajaongkir-service"

export async function GET() {
  try {
    // Periksa apakah API key tersedia
    if (!process.env.RAJAONGKIR_API_KEY) {
      console.error("RajaOngkir API key tidak ditemukan")
      // Tetap lanjutkan dengan data fallback
    }

    const provinces = await getProvinces()
    return NextResponse.json({ provinces })
  } catch (error) {
    console.error("Error fetching provinces:", error)
    return NextResponse.json({ error: "Terjadi kesalahan saat mengambil data provinsi" }, { status: 500 })
  }
}
