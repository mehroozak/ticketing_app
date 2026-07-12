export const END_POINTS = {
  LOGIN: '/api/auth/login/',
  REGISTER: '/api/auth/register/',
  TOKEN_REFRESH: '/api/auth/token/refresh/',
  GOOGLE_AUTH: '/api/auth/google/',
  FACEBOOK_AUTH: '/api/auth/facebook/',
  CHECKIN: '/api/orders/checkin/',
  STAFF_ASSIGNED_EVENTS: '/api/events/staff-assigned/',
  EVENT_CHECKIN_TICKETS: (eventId: string | number) => `/api/orders/checkin-tickets/${eventId}/`,
  EVENT_CHECKIN_LOGS: (eventId: string | number) => `/api/orders/checkin-logs/${eventId}/`,
}
