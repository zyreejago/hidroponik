import { NextResponse } from "next/server"
import { getRajaOngkirCost } from "@/lib/rajaongkir-service"

export async function POST(request: Request) {
  try {
    const { origin, destination, weight, courier } = await request.json()

    if (!origin || !destination || !weight || !courier) {
      return NextResponse.json(
        { error: "Semua parameter diperlukan: origin, destination, weight, courier" },
        { status: 400 },
      )
    }

    // Periksa apakah API key tersedia
    if (!process.env.RAJAONGKIR_API_KEY) {
      console.error("RajaOngkir API key tidak ditemukan")
      // Tetap lanjutkan dengan data fallback
    }

    // Untuk API Komerce, format courier bisa berupa "jne:tiki:pos"
    // Jika hanya satu kurir, tetap gunakan format yang sama
    const formattedCourier = courier.includes(":") ? courier : courier

    const results = await getRajaOngkirCost({
      origin,
      destination,
      weight,
      courier: formattedCourier,
    })

    return NextResponse.json({ results })
  } catch (error) {
    console.error("Error calculating shipping cost:", error)
    return NextResponse.json({ error: "Terjadi kesalahan saat menghitung biaya pengiriman" }, { status: 500 })
  }
}
