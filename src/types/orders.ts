export type PaymentStatus = 'pending' | 'paid' | 'failed' | 'refunded'
export type OrderStatus = 'pending' | 'confirmed' | 'cancelled'
export type TicketStatus = 'valid' | 'used' | 'cancelled'

export interface Order {
  id: number
  event: number
  event_name: string
  event_date: string | null
  payment_status: PaymentStatus
  order_status: OrderStatus
  subtotal: string
  platform_fee_amount: string
  processing_fee_amount: string
  tax_amount: string
  total_amount: string
  ticket_count: number
  created_at: string
}

export interface Ticket {
  id: number
  qr_code: string
  status: TicketStatus
  issued_at: string
}

export interface OrderItem {
  id: number
  tier_name: string
  quantity: number
  unit_price: string
  subtotal: string
  tickets: Ticket[]
}

export interface OrderDetail {
  id: number
  event: number
  event_name: string
  payment_status: PaymentStatus
  order_status: OrderStatus
  subtotal: string
  platform_fee_amount: string
  processing_fee_amount: string
  tax_amount: string
  total_amount: string
  items: OrderItem[]
  created_at: string
}
