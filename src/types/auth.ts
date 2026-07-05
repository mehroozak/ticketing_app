export type UserRole = 'super_admin' | 'user'
export type UserStatus = 'pending' | 'active' | 'inactive' | 'locked'
export type UserGender = 'male' | 'female' | 'other' | 'prefer_not_to_say' | ''
export type OrgRole = 'org_admin' | 'org_staff'

export interface MediaObject {
  id: number
  name: string
  uuid: string
  uri: string | null
  url: string | null
  extension: string | null
  media_type: string
  created_at: string
}

export interface User {
  id: number
  email: string
  first_name: string
  last_name: string
  phone: string
  gender: UserGender
  date_of_birth: string | null
  country: string
  state: string
  city: string
  role: UserRole
  status: UserStatus
  created_at: string
}

export interface Organization {
  id: number
  organization_name: string
  business_type: string
  description: string
  contact_email: string
  contact_phone: string
  logo: MediaObject | null
  address: string
  city: string
  state: string
  country: string
  created_at: string
  updated_at: string
}

export interface OrganizationMembership {
  id: number
  organization: Organization
  role: OrgRole
  joined_at: string
}

export interface AuthResponse {
  message: string
  user: User
  organizations: OrganizationMembership[]
  access: string
  refresh: string
}

export interface RefreshResponse {
  access: string
  refresh?: string
}
