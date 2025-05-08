export interface Product {
  id: number
  name: string
  price: number
  description: string
  source: string
  image: string
}

export interface CartItem {
  product: Product
  quantity: number
}

export interface OrderItem {
  id: string
  order_id: string
  product_name: string
  quantity: number
  price_per_kg: number
  subtotal: number
  created_at: string
}

export interface Order {
  id: string
  order_number: string
  customer_name: string
  customer_phone: string
  customer_email: string | null
  customer_address: string | null
  delivery_method: string
  payment_method: string
  payment_proof_url: string | null
  total_weight: number
  total_price: number
  delivery_fee: number
  status: string
  tracking_code: string
  notes: string | null
  created_at: string
  updated_at: string
  items?: OrderItem[]
  // Tambahkan properti baru untuk pengiriman
  courier?: string
  courier_service?: string
  shipping_etd?: string
  province?: string
  city?: string
}

export interface EWalletSetting {
  id: string
  wallet_type: string
  account_name: string
  account_number: string
  is_active: boolean
  created_at: string
  updated_at: string
}

export interface PartnerInquiry {
  id: string
  name: string
  phone: string
  email: string
  message: string
  status: string
  created_at: string
}
