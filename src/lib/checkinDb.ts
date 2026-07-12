import { open, type DB } from '@op-engineering/op-sqlite'

export interface CheckinTicket {
  qr_code: string
  status: string
}

export interface CheckinLogEntry {
  qr_code: string
  scanned_at: string
  client_scan_id: string | null
  scanned_by_name: string | null
  synced: boolean
}

export interface ServerCheckInLog {
  qr_code: string
  scanned_at: string
  scanned_by_name: string
}

let db: DB | null = null

// Not cryptographically random — doesn't need to be, this is just a client-generated
// idempotency key, not a security token. Avoids pulling in a uuid dependency.
function generateUuidV4(): string {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0
    const v = c === 'x' ? r : (r & 0x3) | 0x8
    return v.toString(16)
  })
}

function getDb(): DB {
  if (!db) {
    db = open({ name: 'checkin.db' })
    db.executeSync(`
      CREATE TABLE IF NOT EXISTS tickets (
        qr_code TEXT NOT NULL,
        event_id TEXT NOT NULL,
        status TEXT NOT NULL,
        PRIMARY KEY (qr_code, event_id)
      )
    `)
    db.executeSync(`
      CREATE TABLE IF NOT EXISTS checkin_log (
        qr_code TEXT NOT NULL,
        event_id TEXT NOT NULL,
        client_scan_id TEXT,
        scanned_at TEXT NOT NULL,
        scanned_by_name TEXT,
        synced INTEGER NOT NULL DEFAULT 0,
        PRIMARY KEY (qr_code, event_id)
      )
    `)
  }
  return db
}

function rowToLogEntry(row: Record<string, unknown>): CheckinLogEntry {
  return {
    qr_code: row.qr_code as string,
    scanned_at: row.scanned_at as string,
    client_scan_id: (row.client_scan_id as string) ?? null,
    scanned_by_name: (row.scanned_by_name as string) ?? null,
    synced: Boolean(row.synced),
  }
}

// Full replace — one native batch call (DELETE + bulk INSERT), not a per-row loop.
export async function updateEventTickets(eventId: string, tickets: CheckinTicket[]): Promise<void> {
  const database = getDb()

  await database.executeBatch([
    ['DELETE FROM tickets WHERE event_id = ?', [eventId]],
    [
      'INSERT INTO tickets (qr_code, event_id, status) VALUES (?, ?, ?)',
      tickets.map((t) => [t.qr_code, eventId, t.status]),
    ],
  ])
}

export async function getTicketByQrCode(eventId: string, qrCode: string): Promise<CheckinTicket | null> {
  const database = getDb()
  const result = await database.execute(
    'SELECT qr_code, status FROM tickets WHERE qr_code = ? AND event_id = ?',
    [qrCode, eventId],
  )
  const row = result.rows[0]
  if (!row) return null
  return { qr_code: row.qr_code as string, status: row.status as string }
}

// First scan wins — returns the existing log entry (isNew=false) if this ticket was
// already scanned for this event, otherwise records a new unsynced entry (isNew=true).
export async function recordScan(
  eventId: string,
  qrCode: string,
): Promise<{ entry: CheckinLogEntry; isNew: boolean }> {
  const database = getDb()

  const existing = await database.execute(
    'SELECT qr_code, scanned_at, client_scan_id, scanned_by_name, synced FROM checkin_log WHERE qr_code = ? AND event_id = ?',
    [qrCode, eventId],
  )
  if (existing.rows.length > 0) {
    return { entry: rowToLogEntry(existing.rows[0]), isNew: false }
  }

  const entry: CheckinLogEntry = {
    qr_code: qrCode,
    scanned_at: new Date().toISOString(),
    client_scan_id: generateUuidV4(),
    scanned_by_name: null,
    synced: false,
  }
  await database.execute(
    'INSERT INTO checkin_log (qr_code, event_id, client_scan_id, scanned_at, scanned_by_name, synced) VALUES (?, ?, ?, ?, ?, 0)',
    [entry.qr_code, eventId, entry.client_scan_id, entry.scanned_at, entry.scanned_by_name],
  )
  return { entry, isNew: true }
}

export async function getUnsyncedLogs(eventId: string): Promise<CheckinLogEntry[]> {
  const database = getDb()
  const result = await database.execute(
    'SELECT qr_code, scanned_at, client_scan_id, scanned_by_name, synced FROM checkin_log WHERE event_id = ? AND synced = 0',
    [eventId],
  )
  return result.rows.map(rowToLogEntry)
}

// Full replace with the server's response — the authoritative log for this event
// after a push. Rows sourced this way have no local client_scan_id (not needed
// once synced) and are marked synced=1.
export async function replaceLogsAfterSync(eventId: string, serverLogs: ServerCheckInLog[]): Promise<void> {
  const database = getDb()

  await database.executeBatch([
    ['DELETE FROM checkin_log WHERE event_id = ?', [eventId]],
    [
      'INSERT INTO checkin_log (qr_code, event_id, client_scan_id, scanned_at, scanned_by_name, synced) VALUES (?, ?, NULL, ?, ?, 1)',
      serverLogs.map((log) => [log.qr_code, eventId, log.scanned_at, log.scanned_by_name]),
    ],
  ])
}
