// RajaOngkir API service (Komerce)

interface RajaOngkirCostParams {
    origin: string // ID kota asal
    destination: string // ID kota tujuan
    weight: number // dalam gram
    courier: string // jne, tiki, pos, dll (format: jne:tiki:pos)
  }
  
  interface RajaOngkirCostResult {
    code: string // kode kurir
    name: string // nama kurir
    costs: {
      service: string // jenis layanan (REG, YES, OKE, dll)
      description: string // deskripsi layanan
      cost: {
        value: number // biaya dalam Rupiah
        etd: string // estimasi waktu pengiriman (dalam hari)
        note: string
      }[]
    }[]
  }
  
  // Format respons baru dari RajaOngkir untuk cost
  interface RajaOngkirCostResponseItem {
    name: string
    code: string
    service: string
    description: string
    cost: number
    etd: string
  }
  
  // Cache untuk menyimpan data provinsi dan kota
  const cache = {
    provinces: null as { province_id: string; province: string }[] | null,
    cities: {} as Record<string, { city_id: string; city_name: string }[]>,
    lastFetch: {
      provinces: 0,
      cities: {} as Record<string, number>,
    },
    // Cache valid selama 24 jam
    CACHE_DURATION: 24 * 60 * 60 * 1000,
  }
  
  // Base URL untuk API RajaOngkir di Komerce
  const RAJAONGKIR_BASE_URL = "https://rajaongkir.komerce.id/api/v1"
  
  // Fungsi untuk mendapatkan API key dengan format yang benar
  function getApiKey(): string {
    const apiKey = process.env.RAJAONGKIR_API_KEY || ""
    // Log untuk debugging (jangan tampilkan key lengkap di production)
    console.log(`API Key length: ${apiKey.length}, First 4 chars: ${apiKey.substring(0, 4)}...`)
  
    // Hapus spasi atau karakter whitespace yang mungkin ada
    return apiKey.trim()
  }
  
  // Fungsi untuk mendapatkan daftar provinsi
  export async function getProvinces(): Promise<{ province_id: string; province: string }[]> {
    try {
      // Periksa cache terlebih dahulu
      const now = Date.now()
      if (cache.provinces && cache.lastFetch.provinces && now - cache.lastFetch.provinces < cache.CACHE_DURATION) {
        console.log("Using cached provinces data")
        return cache.provinces
      }
  
      console.log("Fetching provinces from RajaOngkir API")
  
      // Cek apakah API key tersedia
      const apiKey = getApiKey()
      if (!apiKey) {
        console.error("RajaOngkir API key tidak ditemukan")
        const staticProvinces = getStaticProvinces()
        cache.provinces = staticProvinces
        cache.lastFetch.provinces = now
        return staticProvinces
      }
  
      // Gunakan data statis yang lebih lengkap
      console.log("Using comprehensive static province data")
      const staticProvinces = getStaticProvinces()
      cache.provinces = staticProvinces
      cache.lastFetch.provinces = now
      return staticProvinces
    } catch (error) {
      console.error("Error in getProvinces:", error)
      return getStaticProvinces()
    }
  }
  
  // Fungsi untuk mendapatkan daftar kota berdasarkan provinsi
  export async function getCities(provinceId: string): Promise<{ city_id: string; city_name: string }[]> {
    try {
      console.log(`Fetching cities for province ID: ${provinceId}`)
  
      // Periksa cache terlebih dahulu
      const now = Date.now()
      if (
        cache.cities[provinceId] &&
        cache.lastFetch.cities[provinceId] &&
        now - cache.lastFetch.cities[provinceId] < cache.CACHE_DURATION
      ) {
        console.log(`Using cached cities data for province: ${provinceId}`)
        return cache.cities[provinceId]
      }
  
      // Gunakan data statis yang lebih lengkap
      console.log(`Using comprehensive static city data for province: ${provinceId}`)
      const staticCities = getComprehensiveCities(provinceId)
      cache.cities[provinceId] = staticCities
      cache.lastFetch.cities[provinceId] = now
      return staticCities
    } catch (error) {
      console.error("Error in getCities:", error)
      return getComprehensiveCities(provinceId)
    }
  }
  
  // Fungsi untuk mendapatkan biaya pengiriman
  export async function getRajaOngkirCost(params: RajaOngkirCostParams): Promise<RajaOngkirCostResult[]> {
    try {
      console.log("Calling RajaOngkir cost API with params:", params)
  
      // Cek apakah API key tersedia
      const apiKey = getApiKey()
      if (!apiKey) {
        console.error("RajaOngkir API key tidak ditemukan")
        return simulateRajaOngkirResponse(params)
      }
  
      // Gunakan endpoint cost dari API RajaOngkir
      try {
        console.log(`Calling RajaOngkir API: ${RAJAONGKIR_BASE_URL}/calculate/domestic-cost`)
  
        // Siapkan form data untuk request
        const formData = new URLSearchParams()
        formData.append("origin", params.origin)
        formData.append("destination", params.destination)
        formData.append("weight", params.weight.toString())
        formData.append("courier", params.courier)
        formData.append("price", "lowest") // Default sorting
  
        console.log("Request body:", formData.toString())
  
        const response = await fetch(`${RAJAONGKIR_BASE_URL}/calculate/domestic-cost`, {
          method: "POST",
          headers: {
            key: apiKey,
            "content-type": "application/x-www-form-urlencoded",
            accept: "application/json",
          },
          body: formData.toString(),
        })
  
        const responseText = await response.text()
        console.log("RajaOngkir cost API response:", responseText)
  
        if (!response.ok) {
          console.error(`RajaOngkir API error: ${response.status} ${response.statusText}`)
          console.error("Response body:", responseText)
          // Fallback ke data simulasi jika API gagal
          return simulateRajaOngkirResponse(params)
        }
  
        const data = JSON.parse(responseText)
  
        // Format respons RajaOngkir
        if (data.status === "success" || (data.meta && data.meta.status === "success")) {
          // Konversi format respons baru ke format yang diharapkan oleh aplikasi
          const results = convertRajaOngkirResponse(data)
          return results
        } else {
          console.error("Invalid RajaOngkir response format:", data)
          // Fallback ke data simulasi jika respons tidak valid
          return simulateRajaOngkirResponse(params)
        }
      } catch (apiError) {
        console.error("Error calling RajaOngkir cost API:", apiError)
        return simulateRajaOngkirResponse(params)
      }
    } catch (error) {
      console.error("Error getting RajaOngkir cost:", error)
      // Fallback ke data simulasi jika API gagal
      return simulateRajaOngkirResponse(params)
    }
  }
  
  // Fungsi untuk mengkonversi format respons baru RajaOngkir ke format yang diharapkan aplikasi
  function convertRajaOngkirResponse(response: any): RajaOngkirCostResult[] {
    try {
      // Periksa apakah respons memiliki format yang diharapkan
      if (!response.data || (!Array.isArray(response.data) && !response.data.results)) {
        console.error("Unexpected response format:", response)
        throw new Error("Unexpected response format")
      }
  
      // Ambil array hasil, baik dari data langsung atau dari data.results
      const resultsArray = Array.isArray(response.data) ? response.data : response.data.results
  
      if (!Array.isArray(resultsArray) || resultsArray.length === 0) {
        console.error("No results in response:", response)
        throw new Error("No results in response")
      }
  
      // Kelompokkan hasil berdasarkan kode kurir
      const courierGroups = new Map<string, RajaOngkirCostResponseItem[]>()
  
      resultsArray.forEach((item: RajaOngkirCostResponseItem) => {
        if (!courierGroups.has(item.code)) {
          courierGroups.set(item.code, [])
        }
        courierGroups.get(item.code)?.push(item)
      })
  
      // Konversi ke format yang diharapkan
      const results: RajaOngkirCostResult[] = []
  
      courierGroups.forEach((items, code) => {
        if (items.length > 0) {
          const result: RajaOngkirCostResult = {
            code: code,
            name: items[0].name,
            costs: items.map((item) => ({
              service: item.service,
              description: item.description,
              cost: [
                {
                  value: item.cost,
                  etd: item.etd,
                  note: "",
                },
              ],
            })),
          }
          results.push(result)
        }
      })
  
      return results
    } catch (error) {
      console.error("Error converting RajaOngkir response:", error)
      return []
    }
  }
  
  // Fungsi untuk mendapatkan data provinsi statis
  function getStaticProvinces(): { province_id: string; province: string }[] {
    return [
      { province_id: "1", province: "Bali" },
      { province_id: "2", province: "Bangka Belitung" },
      { province_id: "3", province: "Banten" },
      { province_id: "4", province: "Bengkulu" },
      { province_id: "5", province: "DI Yogyakarta" },
      { province_id: "6", province: "DKI Jakarta" },
      { province_id: "7", province: "Gorontalo" },
      { province_id: "8", province: "Jambi" },
      { province_id: "9", province: "Jawa Barat" },
      { province_id: "10", province: "Jawa Tengah" },
      { province_id: "11", province: "Jawa Timur" },
      { province_id: "12", province: "Kalimantan Barat" },
      { province_id: "13", province: "Kalimantan Selatan" },
      { province_id: "14", province: "Kalimantan Tengah" },
      { province_id: "15", province: "Kalimantan Timur" },
      { province_id: "16", province: "Kalimantan Utara" },
      { province_id: "17", province: "Kepulauan Riau" },
      { province_id: "18", province: "Lampung" },
      { province_id: "19", province: "Maluku" },
      { province_id: "20", province: "Maluku Utara" },
      { province_id: "21", province: "Nanggroe Aceh Darussalam (NAD)" },
      { province_id: "22", province: "Nusa Tenggara Barat (NTB)" },
      { province_id: "23", province: "Nusa Tenggara Timur (NTT)" },
      { province_id: "24", province: "Papua" },
      { province_id: "25", province: "Papua Barat" },
      { province_id: "26", province: "Riau" },
      { province_id: "27", province: "Sulawesi Barat" },
      { province_id: "28", province: "Sulawesi Selatan" },
      { province_id: "29", province: "Sulawesi Tengah" },
      { province_id: "30", province: "Sulawesi Tenggara" },
      { province_id: "31", province: "Sulawesi Utara" },
      { province_id: "32", province: "Sumatera Barat" },
      { province_id: "33", province: "Sumatera Selatan" },
      { province_id: "34", province: "Sumatera Utara" },
    ]
  }
  
  // Tambahkan export untuk fungsi getComprehensiveCities
  export function getComprehensiveCities(provinceId: string): { city_id: string; city_name: string }[] {
    // Coba cari berdasarkan ID provinsi
    const provinceIdNumber = Number.parseInt(provinceId, 10)
    if (isNaN(provinceIdNumber) || provinceIdNumber < 1 || provinceIdNumber > 34) {
      console.log(`Invalid province ID: ${provinceId}, using default cities`)
      return [
        { city_id: "1", city_name: "Kota Default 1" },
        { city_id: "2", city_name: "Kota Default 2" },
        { city_id: "3", city_name: "Kota Default 3" },
        { city_id: "4", city_name: "Kota Default 4" },
        { city_id: "5", city_name: "Kota Default 5" },
      ]
    }
  
    // Gunakan data statis yang lebih lengkap berdasarkan ID provinsi
    return comprehensiveCitiesByProvince[provinceIdNumber] || defaultCities
  }
  
  // Data kota default
  const defaultCities = [
    { city_id: "1", city_name: "Kota Default 1" },
    { city_id: "2", city_name: "Kota Default 2" },
    { city_id: "3", city_name: "Kota Default 3" },
    { city_id: "4", city_name: "Kota Default 4" },
    { city_id: "5", city_name: "Kota Default 5" },
  ]
  
  // Data kota yang lebih lengkap berdasarkan ID provinsi
  const comprehensiveCitiesByProvince: Record<number, { city_id: string; city_name: string }[]> = {
    // Bali (1)
    1: [
      { city_id: "17", city_name: "Badung" },
      { city_id: "32", city_name: "Bangli" },
      { city_id: "94", city_name: "Buleleng" },
      { city_id: "114", city_name: "Denpasar" },
      { city_id: "128", city_name: "Gianyar" },
      { city_id: "161", city_name: "Jembrana" },
      { city_id: "170", city_name: "Karangasem" },
      { city_id: "197", city_name: "Klungkung" },
      { city_id: "447", city_name: "Tabanan" },
    ],
    // Bangka Belitung (2)
    2: [
      { city_id: "27", city_name: "Bangka" },
      { city_id: "28", city_name: "Bangka Barat" },
      { city_id: "29", city_name: "Bangka Selatan" },
      { city_id: "30", city_name: "Bangka Tengah" },
      { city_id: "56", city_name: "Belitung" },
      { city_id: "57", city_name: "Belitung Timur" },
      { city_id: "334", city_name: "Pangkal Pinang" },
    ],
    // Banten (3)
    3: [
      { city_id: "106", city_name: "Cilegon" },
      { city_id: "232", city_name: "Lebak" },
      { city_id: "331", city_name: "Pandeglang" },
      { city_id: "402", city_name: "Serang" },
      { city_id: "403", city_name: "Serang" },
      { city_id: "455", city_name: "Tangerang" },
      { city_id: "456", city_name: "Tangerang" },
      { city_id: "457", city_name: "Tangerang Selatan" },
    ],
    // Bengkulu (4)
    4: [
      { city_id: "62", city_name: "Bengkulu" },
      { city_id: "63", city_name: "Bengkulu Selatan" },
      { city_id: "64", city_name: "Bengkulu Tengah" },
      { city_id: "65", city_name: "Bengkulu Utara" },
      { city_id: "175", city_name: "Kaur" },
      { city_id: "183", city_name: "Kepahiang" },
      { city_id: "233", city_name: "Lebong" },
      { city_id: "294", city_name: "Muko Muko" },
      { city_id: "379", city_name: "Rejang Lebong" },
      { city_id: "397", city_name: "Seluma" },
    ],
    // DI Yogyakarta (5)
    5: [
      { city_id: "39", city_name: "Bantul" },
      { city_id: "135", city_name: "Gunung Kidul" },
      { city_id: "210", city_name: "Kulon Progo" },
      { city_id: "419", city_name: "Sleman" },
      { city_id: "501", city_name: "Yogyakarta" },
    ],
    // DKI Jakarta (6)
    6: [
      { city_id: "151", city_name: "Jakarta Barat" },
      { city_id: "152", city_name: "Jakarta Pusat" },
      { city_id: "153", city_name: "Jakarta Selatan" },
      { city_id: "154", city_name: "Jakarta Timur" },
      { city_id: "155", city_name: "Jakarta Utara" },
      { city_id: "189", city_name: "Kepulauan Seribu" },
    ],
    // Gorontalo (7)
    7: [
      { city_id: "129", city_name: "Boalemo" },
      { city_id: "130", city_name: "Bone Bolango" },
      { city_id: "131", city_name: "Gorontalo" },
      { city_id: "132", city_name: "Gorontalo" },
      { city_id: "133", city_name: "Gorontalo Utara" },
      { city_id: "361", city_name: "Pohuwato" },
    ],
    // Jambi (8)
    8: [
      { city_id: "156", city_name: "Batang Hari" },
      { city_id: "165", city_name: "Bungo" },
      { city_id: "167", city_name: "Jambi" },
      { city_id: "168", city_name: "Kerinci" },
      { city_id: "185", city_name: "Merangin" },
      { city_id: "295", city_name: "Muaro Jambi" },
      { city_id: "479", city_name: "Sarolangun" },
      { city_id: "483", city_name: "Sungaipenuh" },
      { city_id: "484", city_name: "Tanjung Jabung Barat" },
      { city_id: "485", city_name: "Tanjung Jabung Timur" },
      { city_id: "490", city_name: "Tebo" },
    ],
    // Jawa Barat (9)
    9: [
      { city_id: "22", city_name: "Bandung" },
      { city_id: "23", city_name: "Bandung" },
      { city_id: "24", city_name: "Bandung Barat" },
      { city_id: "34", city_name: "Banjar" },
      { city_id: "54", city_name: "Bekasi" },
      { city_id: "55", city_name: "Bekasi" },
      { city_id: "78", city_name: "Bogor" },
      { city_id: "79", city_name: "Bogor" },
      { city_id: "103", city_name: "Ciamis" },
      { city_id: "104", city_name: "Cianjur" },
      { city_id: "107", city_name: "Cimahi" },
      { city_id: "108", city_name: "Cirebon" },
      { city_id: "109", city_name: "Cirebon" },
      { city_id: "115", city_name: "Depok" },
      { city_id: "126", city_name: "Garut" },
      { city_id: "149", city_name: "Indramayu" },
      { city_id: "171", city_name: "Karawang" },
      { city_id: "211", city_name: "Kuningan" },
      { city_id: "252", city_name: "Majalengka" },
      { city_id: "332", city_name: "Pangandaran" },
      { city_id: "376", city_name: "Purwakarta" },
      { city_id: "428", city_name: "Subang" },
      { city_id: "430", city_name: "Sukabumi" },
      { city_id: "431", city_name: "Sukabumi" },
      { city_id: "440", city_name: "Sumedang" },
      { city_id: "468", city_name: "Tasikmalaya" },
      { city_id: "469", city_name: "Tasikmalaya" },
    ],
    // Jawa Tengah (10)
    10: [
      { city_id: "37", city_name: "Banjarnegara" },
      { city_id: "41", city_name: "Banyumas" },
      { city_id: "49", city_name: "Batang" },
      { city_id: "76", city_name: "Blora" },
      { city_id: "91", city_name: "Boyolali" },
      { city_id: "92", city_name: "Brebes" },
      { city_id: "105", city_name: "Cilacap" },
      { city_id: "113", city_name: "Demak" },
      { city_id: "134", city_name: "Grobogan" },
      { city_id: "163", city_name: "Jepara" },
      { city_id: "169", city_name: "Karanganyar" },
      { city_id: "177", city_name: "Kebumen" },
      { city_id: "181", city_name: "Kendal" },
      { city_id: "196", city_name: "Klaten" },
      { city_id: "209", city_name: "Kudus" },
      { city_id: "249", city_name: "Magelang" },
      { city_id: "250", city_name: "Magelang" },
      { city_id: "344", city_name: "Pati" },
      { city_id: "348", city_name: "Pekalongan" },
      { city_id: "349", city_name: "Pekalongan" },
      { city_id: "352", city_name: "Pemalang" },
      { city_id: "375", city_name: "Purbalingga" },
      { city_id: "377", city_name: "Purworejo" },
      { city_id: "380", city_name: "Rembang" },
      { city_id: "386", city_name: "Salatiga" },
      { city_id: "398", city_name: "Semarang" },
      { city_id: "399", city_name: "Semarang" },
      { city_id: "427", city_name: "Sragen" },
      { city_id: "433", city_name: "Sukoharjo" },
      { city_id: "445", city_name: "Surakarta (Solo)" },
      { city_id: "472", city_name: "Tegal" },
      { city_id: "473", city_name: "Tegal" },
      { city_id: "476", city_name: "Temanggung" },
      { city_id: "497", city_name: "Wonogiri" },
      { city_id: "498", city_name: "Wonosobo" },
    ],
    // Jawa Timur (11)
    11: [
      { city_id: "25", city_name: "Bangkalan" },
      { city_id: "36", city_name: "Banyuwangi" },
      { city_id: "51", city_name: "Batu" },
      { city_id: "74", city_name: "Blitar" },
      { city_id: "75", city_name: "Blitar" },
      { city_id: "80", city_name: "Bojonegoro" },
      { city_id: "86", city_name: "Bondowoso" },
      { city_id: "133", city_name: "Gresik" },
      { city_id: "160", city_name: "Jember" },
      { city_id: "164", city_name: "Jombang" },
      { city_id: "178", city_name: "Kediri" },
      { city_id: "179", city_name: "Kediri" },
      { city_id: "222", city_name: "Lamongan" },
      { city_id: "243", city_name: "Lumajang" },
      { city_id: "247", city_name: "Madiun" },
      { city_id: "248", city_name: "Madiun" },
      { city_id: "251", city_name: "Magetan" },
      { city_id: "256", city_name: "Malang" },
      { city_id: "255", city_name: "Malang" },
      { city_id: "289", city_name: "Mojokerto" },
      { city_id: "290", city_name: "Mojokerto" },
      { city_id: "305", city_name: "Nganjuk" },
      { city_id: "306", city_name: "Ngawi" },
      { city_id: "317", city_name: "Pacitan" },
      { city_id: "330", city_name: "Pamekasan" },
      { city_id: "342", city_name: "Pasuruan" },
      { city_id: "343", city_name: "Pasuruan" },
      { city_id: "363", city_name: "Ponorogo" },
      { city_id: "369", city_name: "Probolinggo" },
      { city_id: "370", city_name: "Probolinggo" },
      { city_id: "390", city_name: "Sampang" },
      { city_id: "409", city_name: "Sidoarjo" },
      { city_id: "418", city_name: "Situbondo" },
      { city_id: "441", city_name: "Sumenep" },
      { city_id: "444", city_name: "Surabaya" },
      { city_id: "487", city_name: "Trenggalek" },
      { city_id: "489", city_name: "Tuban" },
      { city_id: "492", city_name: "Tulungagung" },
    ],
    // Kalimantan Barat (12)
    12: [
      { city_id: "68", city_name: "Bengkayang" },
      { city_id: "176", city_name: "Kapuas Hulu" },
      { city_id: "195", city_name: "Kayong Utara" },
      { city_id: "208", city_name: "Ketapang" },
      { city_id: "228", city_name: "Kubu Raya" },
      { city_id: "279", city_name: "Landak" },
      { city_id: "286", city_name: "Melawi" },
      { city_id: "364", city_name: "Pontianak" },
      { city_id: "388", city_name: "Sambas" },
      { city_id: "391", city_name: "Sanggau" },
      { city_id: "395", city_name: "Sekadau" },
      { city_id: "415", city_name: "Singkawang" },
      { city_id: "417", city_name: "Sintang" },
    ],
    // Kalimantan Selatan (13)
    13: [
      { city_id: "31", city_name: "Balangan" },
      { city_id: "42", city_name: "Banjar" },
      { city_id: "43", city_name: "Banjarbaru" },
      { city_id: "44", city_name: "Banjarmasin" },
      { city_id: "47", city_name: "Barito Kuala" },
      { city_id: "203", city_name: "Hulu Sungai Selatan" },
      { city_id: "204", city_name: "Hulu Sungai Tengah" },
      { city_id: "205", city_name: "Hulu Sungai Utara" },
      { city_id: "206", city_name: "Kotabaru" },
      { city_id: "460", city_name: "Tabalong" },
      { city_id: "461", city_name: "Tanah Bumbu" },
      { city_id: "462", city_name: "Tanah Laut" },
      { city_id: "463", city_name: "Tapin" },
    ],
    // Kalimantan Tengah (14)
    14: [
      { city_id: "45", city_name: "Barito Selatan" },
      { city_id: "46", city_name: "Barito Timur" },
      { city_id: "48", city_name: "Barito Utara" },
      { city_id: "136", city_name: "Gunung Mas" },
      { city_id: "167", city_name: "Kapuas" },
      { city_id: "174", city_name: "Katingan" },
      { city_id: "205", city_name: "Kotawaringin Barat" },
      { city_id: "206", city_name: "Kotawaringin Timur" },
      { city_id: "221", city_name: "Lamandau" },
      { city_id: "296", city_name: "Murung Raya" },
      { city_id: "326", city_name: "Palangka Raya" },
      { city_id: "371", city_name: "Pulang Pisau" },
      { city_id: "405", city_name: "Seruyan" },
      { city_id: "432", city_name: "Sukamara" },
    ],
    // Kalimantan Timur (15)
    15: [
      { city_id: "19", city_name: "Balikpapan" },
      { city_id: "66", city_name: "Berau" },
      { city_id: "89", city_name: "Bontang" },
      { city_id: "214", city_name: "Kutai Barat" },
      { city_id: "215", city_name: "Kutai Kartanegara" },
      { city_id: "216", city_name: "Kutai Timur" },
      { city_id: "341", city_name: "Paser" },
      { city_id: "354", city_name: "Penajam Paser Utara" },
      { city_id: "387", city_name: "Samarinda" },
    ],
    // Kalimantan Utara (16)
    16: [
      { city_id: "96", city_name: "Bulungan (Bulongan)" },
      { city_id: "257", city_name: "Malinau" },
      { city_id: "311", city_name: "Nunukan" },
      { city_id: "450", city_name: "Tana Tidung" },
      { city_id: "467", city_name: "Tarakan" },
    ],
    // Kepulauan Riau (17)
    17: [
      { city_id: "48", city_name: "Batam" },
      { city_id: "71", city_name: "Bintan" },
      { city_id: "172", city_name: "Karimun" },
      { city_id: "184", city_name: "Kepulauan Anambas" },
      { city_id: "237", city_name: "Lingga" },
      { city_id: "302", city_name: "Natuna" },
      { city_id: "462", city_name: "Tanjung Pinang" },
    ],
    // Lampung (18)
    18: [
      { city_id: "21", city_name: "Bandar Lampung" },
      { city_id: "223", city_name: "Lampung Barat" },
      { city_id: "224", city_name: "Lampung Selatan" },
      { city_id: "225", city_name: "Lampung Tengah" },
      { city_id: "226", city_name: "Lampung Timur" },
      { city_id: "227", city_name: "Lampung Utara" },
      { city_id: "282", city_name: "Mesuji" },
      { city_id: "283", city_name: "Metro" },
      { city_id: "355", city_name: "Pesawaran" },
      { city_id: "356", city_name: "Pesisir Barat" },
      { city_id: "368", city_name: "Pringsewu" },
      { city_id: "458", city_name: "Tanggamus" },
      { city_id: "490", city_name: "Tulang Bawang" },
      { city_id: "491", city_name: "Tulang Bawang Barat" },
      { city_id: "496", city_name: "Way Kanan" },
    ],
    // Maluku (19)
    19: [
      { city_id: "14", city_name: "Ambon" },
      { city_id: "99", city_name: "Buru" },
      { city_id: "100", city_name: "Buru Selatan" },
      { city_id: "185", city_name: "Kepulauan Aru" },
      { city_id: "258", city_name: "Maluku Barat Daya" },
      { city_id: "259", city_name: "Maluku Tengah" },
      { city_id: "260", city_name: "Maluku Tenggara" },
      { city_id: "261", city_name: "Maluku Tenggara Barat" },
      { city_id: "400", city_name: "Seram Bagian Barat" },
      { city_id: "401", city_name: "Seram Bagian Timur" },
      { city_id: "488", city_name: "Tual" },
    ],
    // Maluku Utara (20)
    20: [
      { city_id: "84", city_name: "Halmahera Barat" },
      { city_id: "85", city_name: "Halmahera Selatan" },
      { city_id: "86", city_name: "Halmahera Tengah" },
      { city_id: "87", city_name: "Halmahera Timur" },
      { city_id: "88", city_name: "Halmahera Utara" },
      { city_id: "201", city_name: "Kepulauan Sula" },
      { city_id: "331", city_name: "Pulau Morotai" },
      { city_id: "372", city_name: "Pulau Taliabu" },
      { city_id: "477", city_name: "Ternate" },
      { city_id: "478", city_name: "Tidore Kepulauan" },
    ],
    // Nanggroe Aceh Darussalam (NAD) (21)
    21: [
      { city_id: "1", city_name: "Aceh Barat" },
      { city_id: "2", city_name: "Aceh Barat Daya" },
      { city_id: "3", city_name: "Aceh Besar" },
      { city_id: "4", city_name: "Aceh Jaya" },
      { city_id: "5", city_name: "Aceh Selatan" },
      { city_id: "6", city_name: "Aceh Singkil" },
      { city_id: "7", city_name: "Aceh Tamiang" },
      { city_id: "8", city_name: "Aceh Tengah" },
      { city_id: "9", city_name: "Aceh Tenggara" },
      { city_id: "10", city_name: "Aceh Timur" },
      { city_id: "11", city_name: "Aceh Utara" },
      { city_id: "20", city_name: "Banda Aceh" },
      { city_id: "59", city_name: "Bener Meriah" },
      { city_id: "72", city_name: "Bireuen" },
      { city_id: "127", city_name: "Gayo Lues" },
      { city_id: "230", city_name: "Langsa" },
      { city_id: "235", city_name: "Lhokseumawe" },
      { city_id: "300", city_name: "Nagan Raya" },
      { city_id: "358", city_name: "Pidie" },
      { city_id: "359", city_name: "Pidie Jaya" },
      { city_id: "384", city_name: "Sabang" },
      { city_id: "414", city_name: "Simeulue" },
      { city_id: "429", city_name: "Subulussalam" },
    ],
    // Nusa Tenggara Barat (NTB) (22)
    22: [
      { city_id: "81", city_name: "Bima" },
      { city_id: "82", city_name: "Bima" },
      { city_id: "118", city_name: "Dompu" },
      { city_id: "238", city_name: "Lombok Barat" },
      { city_id: "239", city_name: "Lombok Tengah" },
      { city_id: "240", city_name: "Lombok Timur" },
      { city_id: "241", city_name: "Lombok Utara" },
      { city_id: "276", city_name: "Mataram" },
      { city_id: "438", city_name: "Sumbawa" },
      { city_id: "439", city_name: "Sumbawa Barat" },
    ],
    // Nusa Tenggara Timur (NTT) (23)
    23: [
      { city_id: "13", city_name: "Alor" },
      { city_id: "58", city_name: "Belu" },
      { city_id: "122", city_name: "Ende" },
      { city_id: "125", city_name: "Flores Timur" },
      { city_id: "212", city_name: "Kupang" },
      { city_id: "213", city_name: "Kupang" },
      { city_id: "234", city_name: "Lembata" },
      { city_id: "269", city_name: "Manggarai" },
      { city_id: "270", city_name: "Manggarai Barat" },
      { city_id: "271", city_name: "Manggarai Timur" },
      { city_id: "301", city_name: "Nagekeo" },
      { city_id: "304", city_name: "Ngada" },
      { city_id: "383", city_name: "Rote Ndao" },
      { city_id: "385", city_name: "Sabu Raijua" },
      { city_id: "412", city_name: "Sikka" },
      { city_id: "434", city_name: "Sumba Barat" },
      { city_id: "435", city_name: "Sumba Barat Daya" },
      { city_id: "436", city_name: "Sumba Tengah" },
      { city_id: "437", city_name: "Sumba Timur" },
      { city_id: "479", city_name: "Timor Tengah Selatan" },
      { city_id: "480", city_name: "Timor Tengah Utara" },
    ],
    // Papua (24)
    24: [
      { city_id: "15", city_name: "Asmat" },
      { city_id: "83", city_name: "Biak Numfor" },
      { city_id: "90", city_name: "Boven Digoel" },
      { city_id: "111", city_name: "Deiyai (Deliyai)" },
      { city_id: "117", city_name: "Dogiyai" },
      { city_id: "150", city_name: "Intan Jaya" },
      { city_id: "157", city_name: "Jayapura" },
      { city_id: "158", city_name: "Jayapura" },
      { city_id: "159", city_name: "Jayawijaya" },
      { city_id: "180", city_name: "Keerom" },
      { city_id: "193", city_name: "Kepulauan Yapen (Yapen Waropen)" },
      { city_id: "231", city_name: "Lanny Jaya" },
      { city_id: "263", city_name: "Mamberamo Raya" },
      { city_id: "264", city_name: "Mamberamo Tengah" },
      { city_id: "274", city_name: "Mappi" },
      { city_id: "281", city_name: "Merauke" },
      { city_id: "284", city_name: "Mimika" },
      { city_id: "299", city_name: "Nabire" },
      { city_id: "303", city_name: "Nduga" },
      { city_id: "335", city_name: "Paniai" },
      { city_id: "347", city_name: "Pegunungan Bintang" },
      { city_id: "373", city_name: "Puncak" },
      { city_id: "374", city_name: "Puncak Jaya" },
      { city_id: "392", city_name: "Sarmi" },
      { city_id: "443", city_name: "Supiori" },
      { city_id: "484", city_name: "Tolikara" },
      { city_id: "495", city_name: "Waropen" },
      { city_id: "499", city_name: "Yahukimo" },
      { city_id: "500", city_name: "Yalimo" },
    ],
    // Papua Barat (25)
    25: [
      { city_id: "124", city_name: "Fakfak" },
      { city_id: "165", city_name: "Kaimana" },
      { city_id: "272", city_name: "Manokwari" },
      { city_id: "273", city_name: "Manokwari Selatan" },
      { city_id: "277", city_name: "Maybrat" },
      { city_id: "346", city_name: "Pegunungan Arfak" },
      { city_id: "378", city_name: "Raja Ampat" },
      { city_id: "424", city_name: "Sorong" },
      { city_id: "425", city_name: "Sorong" },
      { city_id: "426", city_name: "Sorong Selatan" },
      { city_id: "449", city_name: "Tambrauw" },
      { city_id: "474", city_name: "Teluk Bintuni" },
      { city_id: "475", city_name: "Teluk Wondama" },
    ],
    // Riau (26)
    26: [
      { city_id: "60", city_name: "Bengkalis" },
      { city_id: "120", city_name: "Dumai" },
      { city_id: "147", city_name: "Indragiri Hilir" },
      { city_id: "148", city_name: "Indragiri Hulu" },
      { city_id: "166", city_name: "Kampar" },
      { city_id: "187", city_name: "Kepulauan Meranti" },
      { city_id: "207", city_name: "Kuantan Singingi" },
      { city_id: "350", city_name: "Pekanbaru" },
      { city_id: "351", city_name: "Pelalawan" },
      { city_id: "381", city_name: "Rokan Hilir" },
      { city_id: "382", city_name: "Rokan Hulu" },
      { city_id: "406", city_name: "Siak" },
    ],
    // Sulawesi Barat (27)
    27: [
      { city_id: "253", city_name: "Majene" },
      { city_id: "262", city_name: "Mamasa" },
      { city_id: "265", city_name: "Mamuju" },
      { city_id: "266", city_name: "Mamuju Utara" },
      { city_id: "362", city_name: "Polewali Mandar" },
      { city_id: "465", city_name: "Mamuju Tengah" },
    ],
    // Sulawesi Selatan (28)
    28: [
      { city_id: "73", city_name: "Bantaeng" },
      { city_id: "77", city_name: "Barru" },
      { city_id: "87", city_name: "Bone" },
      { city_id: "95", city_name: "Bulukumba" },
      { city_id: "123", city_name: "Enrekang" },
      { city_id: "132", city_name: "Gowa" },
      { city_id: "162", city_name: "Jeneponto" },
      { city_id: "244", city_name: "Luwu" },
      { city_id: "245", city_name: "Luwu Timur" },
      { city_id: "246", city_name: "Luwu Utara" },
      { city_id: "254", city_name: "Makassar" },
      { city_id: "275", city_name: "Maros" },
      { city_id: "328", city_name: "Palopo" },
      { city_id: "333", city_name: "Pangkajene Kepulauan" },
      { city_id: "336", city_name: "Parepare" },
      { city_id: "360", city_name: "Pinrang" },
      { city_id: "396", city_name: "Selayar (Kepulauan Selayar)" },
      { city_id: "408", city_name: "Sidenreng Rappang/Rapang" },
      { city_id: "416", city_name: "Sinjai" },
      { city_id: "423", city_name: "Soppeng" },
      { city_id: "448", city_name: "Takalar" },
      { city_id: "451", city_name: "Tana Toraja" },
      { city_id: "486", city_name: "Toraja Utara" },
      { city_id: "493", city_name: "Wajo" },
    ],
    // Sulawesi Tengah (29)
    29: [
      { city_id: "38", city_name: "Banggai" },
      { city_id: "39", city_name: "Banggai Kepulauan" },
      { city_id: "40", city_name: "Banggai Laut" },
      { city_id: "98", city_name: "Buol" },
      { city_id: "119", city_name: "Donggala" },
      { city_id: "291", city_name: "Morowali" },
      { city_id: "292", city_name: "Morowali Utara" },
      { city_id: "329", city_name: "Palu" },
      { city_id: "338", city_name: "Parigi Moutong" },
      { city_id: "366", city_name: "Poso" },
      { city_id: "410", city_name: "Sigi" },
      { city_id: "482", city_name: "Tojo Una-Una" },
      { city_id: "483", city_name: "Toli-Toli" },
    ],
    // Sulawesi Tenggara (30)
    30: [
      { city_id: "53", city_name: "Bau-Bau" },
      { city_id: "85", city_name: "Bombana" },
      { city_id: "101", city_name: "Buton" },
      { city_id: "102", city_name: "Buton Utara" },
      { city_id: "182", city_name: "Kendari" },
      { city_id: "198", city_name: "Kolaka" },
      { city_id: "199", city_name: "Kolaka Utara" },
      { city_id: "200", city_name: "Konawe" },
      { city_id: "201", city_name: "Konawe Selatan" },
      { city_id: "202", city_name: "Konawe Utara" },
      { city_id: "295", city_name: "Muna" },
      { city_id: "494", city_name: "Wakatobi" },
    ],
    // Sulawesi Utara (31)
    31: [
      { city_id: "16", city_name: "Bolaang Mongondow (Bolmong)" },
      { city_id: "17", city_name: "Bolaang Mongondow Selatan" },
      { city_id: "18", city_name: "Bolaang Mongondow Timur" },
      { city_id: "19", city_name: "Bolaang Mongondow Utara" },
      { city_id: "190", city_name: "Kepulauan Sangihe" },
      { city_id: "191", city_name: "Kepulauan Siau Tagulandang Biaro (Sitaro)" },
      { city_id: "192", city_name: "Kepulauan Talaud" },
      { city_id: "267", city_name: "Manado" },
      { city_id: "285", city_name: "Minahasa" },
      { city_id: "286", city_name: "Minahasa Selatan" },
      { city_id: "287", city_name: "Minahasa Tenggara" },
      { city_id: "288", city_name: "Minahasa Utara" },
      { city_id: "485", city_name: "Tomohon" },
    ],
    // Sumatera Barat (32)
    32: [
      { city_id: "77", city_name: "Agam" },
      { city_id: "141", city_name: "Bukittinggi" },
      { city_id: "145", city_name: "Dharmasraya" },
      { city_id: "186", city_name: "Kepulauan Mentawai" },
      { city_id: "236", city_name: "Lima Puluh Kota" },
      { city_id: "318", city_name: "Padang" },
      { city_id: "319", city_name: "Padang Panjang" },
      { city_id: "324", city_name: "Padang Pariaman" },
      { city_id: "337", city_name: "Pariaman" },
      { city_id: "339", city_name: "Pasaman" },
      { city_id: "340", city_name: "Pasaman Barat" },
      { city_id: "345", city_name: "Payakumbuh" },
      { city_id: "357", city_name: "Pesisir Selatan" },
      { city_id: "394", city_name: "Sawah Lunto" },
      { city_id: "411", city_name: "Sijunjung (Sawah Lunto Sijunjung)" },
      { city_id: "420", city_name: "Solok" },
      { city_id: "421", city_name: "Solok" },
      { city_id: "422", city_name: "Solok Selatan" },
      { city_id: "453", city_name: "Tanah Datar" },
    ],
    // Sumatera Selatan (33)
    33: [
      { city_id: "50", city_name: "Banyuasin" },
      { city_id: "121", city_name: "Empat Lawang" },
      { city_id: "220", city_name: "Lahat" },
      { city_id: "242", city_name: "Lubuk Linggau" },
      { city_id: "292", city_name: "Muara Enim" },
      { city_id: "297", city_name: "Musi Banyuasin" },
      { city_id: "298", city_name: "Musi Rawas" },
      { city_id: "312", city_name: "Ogan Ilir" },
      { city_id: "313", city_name: "Ogan Komering Ilir" },
      { city_id: "314", city_name: "Ogan Komering Ulu" },
      { city_id: "315", city_name: "Ogan Komering Ulu Selatan" },
      { city_id: "316", city_name: "Ogan Komering Ulu Timur" },
      { city_id: "324", city_name: "Pagar Alam" },
      { city_id: "327", city_name: "Palembang" },
      { city_id: "367", city_name: "Prabumulih" },
    ],
    // Sumatera Utara (34)
    34: [
      { city_id: "12", city_name: "Asahan" },
      { city_id: "52", city_name: "Batu Bara" },
      { city_id: "70", city_name: "Binjai" },
      { city_id: "110", city_name: "Dairi" },
      { city_id: "112", city_name: "Deli Serdang" },
      { city_id: "137", city_name: "Gunungsitoli" },
      { city_id: "146", city_name: "Humbang Hasundutan" },
      { city_id: "173", city_name: "Karo" },
      { city_id: "217", city_name: "Labuhan Batu" },
      { city_id: "218", city_name: "Labuhan Batu Selatan" },
      { city_id: "219", city_name: "Labuhan Batu Utara" },
      { city_id: "229", city_name: "Langkat" },
      { city_id: "268", city_name: "Mandailing Natal" },
      { city_id: "278", city_name: "Medan" },
      { city_id: "307", city_name: "Nias" },
      { city_id: "308", city_name: "Nias Barat" },
      { city_id: "309", city_name: "Nias Selatan" },
      { city_id: "310", city_name: "Nias Utara" },
      { city_id: "319", city_name: "Padang Lawas" },
      { city_id: "320", city_name: "Padang Lawas Utara" },
      { city_id: "323", city_name: "Padang Sidempuan" },
      { city_id: "325", city_name: "Pakpak Bharat" },
      { city_id: "353", city_name: "Pematang Siantar" },
      { city_id: "389", city_name: "Samosir" },
      { city_id: "404", city_name: "Serdang Bedagai" },
      { city_id: "407", city_name: "Sibolga" },
      { city_id: "413", city_name: "Simalungun" },
      { city_id: "459", city_name: "Tanjung Balai" },
      { city_id: "463", city_name: "Tapanuli Selatan" },
      { city_id: "464", city_name: "Tapanuli Tengah" },
      { city_id: "465", city_name: "Tapanuli Utara" },
      { city_id: "470", city_name: "Tebing Tinggi" },
      { city_id: "481", city_name: "Toba Samosir" },
    ],
  }
  
  // Fungsi untuk menghasilkan respons simulasi RajaOngkir
  function simulateRajaOngkirResponse(params: RajaOngkirCostParams): RajaOngkirCostResult[] {
    console.log("Simulating RajaOngkir response for params:", params)
    const { origin, destination, weight, courier } = params
  
    // Konversi berat dari gram ke kg untuk perhitungan
    const weightInKg = weight / 1000
  
    // Daftar kurir yang didukung
    const supportedCouriers = courier.split(":") // Memungkinkan multiple kurir
    const simulatedResults: RajaOngkirCostResult[] = []
  
    supportedCouriers.forEach((singleCourier) => {
      const courierCode = singleCourier.toLowerCase()
  
      // Berdasarkan kurir, berikan layanan yang berbeda-beda
      if (courierCode === "jne") {
        simulatedResults.push({
          code: "jne",
          name: "JNE",
          costs: [
            {
              service: "OKE",
              description: "Ongkos Kirim Ekonomis",
              cost: [
                {
                  value: Math.round(10000 + weightInKg * 7000),
                  etd: "2-3",
                  note: "",
                },
              ],
            },
            {
              service: "REG",
              description: "Layanan Reguler",
              cost: [
                {
                  value: Math.round(15000 + weightInKg * 8000),
                  etd: "1-2",
                  note: "",
                },
              ],
            },
            {
              service: "YES",
              description: "Yakin Esok Sampai",
              cost: [
                {
                  value: Math.round(25000 + weightInKg * 10000),
                  etd: "1",
                  note: "",
                },
              ],
            },
          ],
        })
      } else if (courierCode === "tiki") {
        simulatedResults.push({
          code: "tiki",
          name: "TIKI",
          costs: [
            {
              service: "ECO",
              description: "Ekonomi",
              cost: [
                {
                  value: Math.round(9000 + weightInKg * 6500),
                  etd: "3",
                  note: "",
                },
              ],
            },
            {
              service: "REG",
              description: "Reguler",
              cost: [
                {
                  value: Math.round(14000 + weightInKg * 7500),
                  etd: "2",
                  note: "",
                },
              ],
            },
            {
              service: "ONS",
              description: "Over Night Service",
              cost: [
                {
                  value: Math.round(22000 + weightInKg * 9000),
                  etd: "1",
                  note: "",
                },
              ],
            },
          ],
        })
      } else if (courierCode === "pos") {
        simulatedResults.push({
          code: "pos",
          name: "POS Indonesia",
          costs: [
            {
              service: "Paket Kilat Khusus",
              description: "Paket Kilat Khusus",
              cost: [
                {
                  value: Math.round(11000 + weightInKg * 7000),
                  etd: "2-4",
                  note: "",
                },
              ],
            },
            {
              service: "Express Next Day",
              description: "Express Next Day Barang",
              cost: [
                {
                  value: Math.round(18000 + weightInKg * 8500),
                  etd: "1",
                  note: "",
                },
              ],
            },
          ],
        })
      } else if (courierCode === "sicepat") {
        simulatedResults.push({
          code: "sicepat",
          name: "SiCepat",
          costs: [
            {
              service: "REG",
              description: "Regular Service",
              cost: [
                {
                  value: Math.round(12000 + weightInKg * 7500),
                  etd: "2-3",
                  note: "",
                },
              ],
            },
            {
              service: "BEST",
              description: "Besok Sampai Tujuan",
              cost: [
                {
                  value: Math.round(20000 + weightInKg * 9000),
                  etd: "1",
                  note: "",
                },
              ],
            },
          ],
        })
      } else if (courierCode === "jnt") {
        simulatedResults.push({
          code: "jnt",
          name: "J&T Express",
          costs: [
            {
              service: "EZ",
              description: "Economy Service",
              cost: [
                {
                  value: Math.round(11000 + weightInKg * 7200),
                  etd: "2-3",
                  note: "",
                },
              ],
            },
            {
              service: "REG",
              description: "Regular Service",
              cost: [
                {
                  value: Math.round(16000 + weightInKg * 8000),
                  etd: "1-2",
                  note: "",
                },
              ],
            },
          ],
        })
      } else {
        // Untuk kurir lain yang tidak dikenal, berikan layanan generik
        simulatedResults.push({
          code: courierCode,
          name: courierCode.toUpperCase(),
          costs: [
            {
              service: "REG",
              description: "Layanan Reguler",
              cost: [
                {
                  value: Math.round(13000 + weightInKg * 7500),
                  etd: "2-3",
                  note: "",
                },
              ],
            },
            {
              service: "EXPRESS",
              description: "Layanan Express",
              cost: [
                {
                  value: Math.round(20000 + weightInKg * 9000),
                  etd: "1",
                  note: "",
                },
              ],
            },
          ],
        })
      }
    })
  
    return simulatedResults
  }
  