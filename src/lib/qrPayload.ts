export interface ParsedQrPayload {
  ticketId: string
  eventId: string
}

export function parseQrPayload(raw: string): ParsedQrPayload | null {
  const parts = raw.split(':')
  if (parts.length !== 2) return null
  const [ticketId, eventId] = parts
  if (!ticketId || !eventId) return null
  return { ticketId, eventId }
}

export function buildQrPayload(ticketId: string, eventId: string | number): string {
  return `${ticketId}:${eventId}`
}
