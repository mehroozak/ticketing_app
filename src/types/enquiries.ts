export type EnquiryType = 'contact_us' | 'contact_support' | 'artist' | 'event_management'

export interface CreateEnquiryPayload {
  enquiry_type: EnquiryType
  name: string
  email: string
  phone?: string
  message: string
  artist_name?: string
  event_date?: string | null
  budget?: string
  order_number?: string
}
