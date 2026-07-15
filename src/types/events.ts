import type { LookupItem } from '../store/slices/lookupsSlice'
import type { MediaObject } from './auth'

export type EventStatus = 'draft' | 'submitted' | 'approved' | 'rejected' | 'postponed'

// Slim shape embedded in public event responses (LookupMiniSerializer) —
// not the full LookupItem shape used by the global lookups fetch.
export interface LookupMini {
  id: number
  display_name: string
  type: string
}

export interface PublicEvent {
  id: number
  name: string
  description: string
  organization_name: string
  categories: LookupMini[]
  city: LookupMini | null
  venue_name: string
  start_datetime: string | null
  end_datetime: string | null
  banners: string[]
  min_price: string | null
}

export interface PublicEventListResponse {
  count: number
  next: string | null
  previous: string | null
  results: PublicEvent[]
}

export interface TicketTier {
  id: number
  name: string
  description: string
  price: string
  quantity: number
  max_per_person: number
  sale_start: string | null
  sale_end: string | null
}

export interface PublicEventDetail {
  id: number
  name: string
  description: string
  organization_name: string
  categories: LookupMini[]
  city: LookupMini | null
  venue_name: string
  address_text: string
  start_datetime: string | null
  end_datetime: string | null
  banners: string[]
  ticket_tiers: TicketTier[]
}

export interface AssignedEvent {
  id: number
  name: string
  status: EventStatus
  categories: LookupItem[]
  city: LookupItem | null
  venue_name: string
  start_datetime: string
  end_datetime: string
  banner: MediaObject | null
  created_at: string
  updated_at: string
}
