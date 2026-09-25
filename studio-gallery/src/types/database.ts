export type BookingStatus = 'inquiry' | 'confirmed' | 'completed' | 'cancelled'
export type InvoiceStatus = 'draft' | 'sent' | 'paid' | 'overdue' | 'void'
export type OrderStatus = 'pending' | 'paid' | 'fulfilled' | 'cancelled'

export type LineItem = {
  description: string
  quantity: number
  unit_price: number
}

export type Client = {
  id: string
  name: string
  email: string | null
  phone: string | null
  notes: string | null
  created_at: string
}

export type Gallery = {
  id: string
  client_id: string | null
  title: string
  event_date: string | null
  cover_photo_url: string | null
  slug: string
  password_hash: string | null
  expires_at: string | null
  is_published: boolean
  created_at: string
  clients?: Client | null
}

export type Photo = {
  id: string
  gallery_id: string
  storage_path: string
  thumbnail_path: string | null
  position: number
  created_at: string
}

export type Booking = {
  id: string
  client_id: string | null
  gallery_id: string | null
  title: string
  event_date: string | null
  location: string | null
  status: BookingStatus
  notes: string | null
  created_at: string
  clients?: Client | null
  galleries?: Gallery | null
}

export type Invoice = {
  id: string
  client_id: string
  booking_id: string | null
  invoice_number: string
  status: InvoiceStatus
  line_items: LineItem[]
  amount_total: number
  stripe_payment_link: string | null
  due_date: string | null
  created_at: string
  clients?: Client | null
}

export type Order = {
  id: string
  gallery_id: string | null
  client_id: string | null
  stripe_checkout_session_id: string | null
  status: OrderStatus
  line_items: LineItem[]
  amount_total: number
  created_at: string
  galleries?: Gallery | null
  clients?: Client | null
}

export const PRINT_PRODUCTS = [
  { id: 'digital', name: 'Digital download', price: 15, description: 'High-resolution digital file' },
  { id: 'print-8x10', name: '8×10 print', price: 25, description: 'Professional photo print' },
  { id: 'print-11x14', name: '11×14 print', price: 40, description: 'Large format print' },
] as const
