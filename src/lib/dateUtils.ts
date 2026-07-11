const pad = (n: number) => String(n).padStart(2, '0')

// Local date components only — avoids the UTC-midnight parsing shift that
// `date.toISOString()` / `new Date('YYYY-MM-DD')` introduce in negative-offset timezones
export function toISODateString(date: Date): string {
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`
}

export function parseISODateString(value: string): Date {
  const [y, m, d] = value.split('T')[0].split('-').map(Number)
  return new Date(y, m - 1, d)
}

export function displayDate(value: string | null | undefined): string {
  if (!value) return ''
  return new Intl.DateTimeFormat('en', { day: 'numeric', month: 'short', year: 'numeric' }).format(
    parseISODateString(value),
  )
}

// For real timestamps (not pure dates) — the API already serializes these with the
// request's timezone offset embedded, so a plain `new Date()` parse is correct here.
export function displayDateTime(value: string | null | undefined): string {
  if (!value) return ''
  return new Intl.DateTimeFormat('en', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  }).format(new Date(value))
}
