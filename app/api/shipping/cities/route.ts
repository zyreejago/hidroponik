import { NextResponse } from "next/server"
import { getCities } from "@/lib/rajaongkir-service"

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const provinceId = searchParams.get("province")

    if (!provinceId) {
      return NextResponse.json({ error: "Parameter province diperlukan" }, { status: 400 })
    }

    // Periksa apakah API key tersedia
    if (!process.env.RAJAONGKIR_API_KEY) {
      console.error("RajaOngkir API key tidak ditemukan")
      // Tetap lanjutkan dengan data fallback
    }

    const cities = await getCities(provinceId)
    return NextResponse.json({ cities })
  } catch (error) {
    console.error("Error fetching cities:", error)
    return NextResponse.json({ error: "Terjadi kesalahan saat mengambil data kota" }, { status: 500 })
  }
}
