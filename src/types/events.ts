import type { LookupItem } from '../store/slices/lookupsSlice'
import type { MediaObject } from './auth'

export type EventStatus = 'draft' | 'submitted' | 'approved' | 'rejected' | 'postponed'

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
