import Database from "better-sqlite3";
import fs from "fs";
import path from "path";

const DB_PATH = path.join(process.cwd(), "data", "rfc1149.db");

let _db: Database.Database | null = null;

function getDb(): Database.Database {
  if (_db) return _db;

  fs.mkdirSync(path.dirname(DB_PATH), { recursive: true });

  _db = new Database(DB_PATH);
  _db.pragma("journal_mode = WAL");
  _db.pragma("foreign_keys = ON");

  _db.exec(`
    CREATE TABLE IF NOT EXISTS lofts (
      id          TEXT PRIMARY KEY,
      lat         REAL NOT NULL,
      lon         REAL NOT NULL,
      heading     INTEGER NOT NULL DEFAULT 0,
      alt_band    INTEGER NOT NULL DEFAULT 1,
      created_at  INTEGER NOT NULL
    );

    CREATE TABLE IF NOT EXISTS messages (
      id            TEXT PRIMARY KEY,
      from_loft_id  TEXT NOT NULL REFERENCES lofts(id),
      to_loft_id    TEXT NOT NULL REFERENCES lofts(id),
      content       TEXT NOT NULL,
      status        TEXT NOT NULL DEFAULT 'in_flight',
      dispatched_at INTEGER NOT NULL,
      eta_at        INTEGER NOT NULL,
      delivered_at  INTEGER,
      distance_km    REAL NOT NULL,
      wind_ms        REAL NOT NULL DEFAULT 0,
      failure_reason TEXT
    );

    CREATE INDEX IF NOT EXISTS idx_messages_from ON messages(from_loft_id);
    CREATE INDEX IF NOT EXISTS idx_messages_to   ON messages(to_loft_id);
    CREATE INDEX IF NOT EXISTS idx_messages_status ON messages(status, eta_at);
  `);

  // Safe migration: add failure_reason to existing databases.
  try {
    _db.exec(`ALTER TABLE messages ADD COLUMN failure_reason TEXT`);
  } catch {
    // Column already exists — ignore.
  }

  return _db;
}

export type LoftRow = {
  id: string;
  lat: number;
  lon: number;
  heading: number;
  alt_band: number;
  created_at: number;
};

export type MessageRow = {
  id: string;
  from_loft_id: string;
  to_loft_id: string;
  content: string;
  status: "in_flight" | "delivered" | "nxpigeon";
  dispatched_at: number;
  eta_at: number;
  delivered_at: number | null;
  distance_km: number;
  wind_ms: number;
  failure_reason: string | null;
};

export const db = {
  lofts: {
    create(loft: Omit<LoftRow, "created_at">): LoftRow {
      const row = { ...loft, created_at: Date.now() };
      getDb()
        .prepare(
          `INSERT INTO lofts (id, lat, lon, heading, alt_band, created_at)
           VALUES (@id, @lat, @lon, @heading, @alt_band, @created_at)`
        )
        .run(row);
      return row;
    },
    findById(id: string): LoftRow | undefined {
      return getDb()
        .prepare("SELECT * FROM lofts WHERE id = ?")
        .get(id) as LoftRow | undefined;
    },
    findByIds(ids: string[]): LoftRow[] {
      if (ids.length === 0) return [];
      const placeholders = ids.map(() => "?").join(",");
      return getDb()
        .prepare(`SELECT * FROM lofts WHERE id IN (${placeholders})`)
        .all(...ids) as LoftRow[];
    },
    findByCoords(lat: number, lon: number, radiusDeg = 0.001): LoftRow | undefined {
      return getDb()
        .prepare(
          `SELECT * FROM lofts
           WHERE ABS(lat - ?) < ? AND ABS(lon - ?) < ?
           ORDER BY (lat - ?) * (lat - ?) + (lon - ?) * (lon - ?)
           LIMIT 1`
        )
        .get(lat, radiusDeg, lon, radiusDeg, lat, lat, lon, lon) as
        | LoftRow
        | undefined;
    },
  },
  messages: {
    create(msg: Omit<MessageRow, "delivered_at">): MessageRow {
      const row = { ...msg, delivered_at: null };
      getDb()
        .prepare(
          `INSERT INTO messages
           (id, from_loft_id, to_loft_id, content, status,
            dispatched_at, eta_at, delivered_at, distance_km, wind_ms, failure_reason)
           VALUES (@id, @from_loft_id, @to_loft_id, @content, @status,
                   @dispatched_at, @eta_at, @delivered_at, @distance_km, @wind_ms, @failure_reason)`
        )
        .run(row);
      return row;
    },
    findById(id: string): MessageRow | undefined {
      return getDb()
        .prepare("SELECT * FROM messages WHERE id = ?")
        .get(id) as MessageRow | undefined;
    },
    forLoft(loftId: string): MessageRow[] {
      return getDb()
        .prepare(
          `SELECT * FROM messages
           WHERE from_loft_id = ? OR to_loft_id = ?
           ORDER BY dispatched_at DESC`
        )
        .all(loftId, loftId) as MessageRow[];
    },
    deliver(id: string): void {
      getDb()
        .prepare(
          `UPDATE messages SET status = 'delivered', delivered_at = ?
           WHERE id = ? AND status = 'in_flight'`
        )
        .run(Date.now(), id);
    },
    markNxpigeon(id: string): void {
      getDb()
        .prepare(
          `UPDATE messages SET status = 'nxpigeon'
           WHERE id = ? AND status = 'in_flight'`
        )
        .run(id);
    },
    // Settles all messages whose ETA has passed and are still in_flight.
    settleArrived(): void {
      const now = Date.now();
      getDb()
        .prepare(
          `UPDATE messages SET status = 'delivered', delivered_at = ?
           WHERE status = 'in_flight' AND eta_at <= ?`
        )
        .run(now, now);
    },
  },
};
