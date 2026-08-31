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
  organization_slug: string
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

export interface UpcomingEventGroup {
  date: string
  events: PublicEvent[]
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

// Staff/organizer-scoped tier shape (GET /api/events/<id>/tiers/) — unlike the public
// tier list, this includes inactive tiers and the is_active flag itself.
export interface StaffTicketTier extends TicketTier {
  is_active: boolean
  order: number
}

export interface PublicEventDetail {
  id: number
  name: string
  description: string
  organization_name: string
  organization_slug: string
  organization_has_refund_policy: boolean
  categories: LookupMini[]
  city: LookupMini | null
  venue_name: string
  address_text: string
  start_datetime: string | null
  end_datetime: string | null
  banners: string[]
  ticket_tiers: TicketTier[]
  commission_percent: string | null
}

// Org-facing event detail (GET /api/events/<id>/, EventDetailSerializer) — reachable by
// org_admin and by org_staff assigned to the event. Only the fields the walk-in sale flow
// needs are modeled here; add more as other org-facing screens need them.
export interface StaffEventDetail {
  id: number
  name: string
  ticket_tiers: StaffTicketTier[]
  commission_percent: string | null
}

export interface PublicOrganizer {
  id: number
  slug: string
  organization_name: string
  logo: string | null
  city: string
  events_hosted: number
}

export interface PublicOrganizerListResponse {
  count: number
  next: string | null
  previous: string | null
  results: PublicOrganizer[]
}

export interface PublicOrganizerDetail extends PublicOrganizer {
  description: string
  organizing_since: number
  total_tickets_sold: number
  previous_events: PublicEvent[]
  upcoming_events: PublicEvent[]
  refund_policy: { policy_text: string; contact_email: string; contact_phone: string } | null
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
