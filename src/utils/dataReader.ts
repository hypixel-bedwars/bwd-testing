import { logger } from "../logger";
import { getDb } from "./db";

/**
 * Simple key/value JSON store backed by SQLite.
 *
 * Note: this preserves the existing API surface so callers don't change.
 */

export async function writeData<T>(name: string, data: T): Promise<void> {
  try {
    const db = getDb();
    const json = JSON.stringify(data);
    const updatedAt = Date.now();

    db.prepare(
      `INSERT INTO json_store (name, json, updated_at)
       VALUES (@name, @json, @updated_at)
       ON CONFLICT(name) DO UPDATE SET
         json = excluded.json,
         updated_at = excluded.updated_at`,
    ).run({ name, json, updated_at: updatedAt });
  } catch (err) {
    logger.error({ err }, `Failed to write SQLite json_store row: ${name}`);
    throw err;
  }
}

export async function readData<T>(name: string): Promise<T | null> {
  try {
    const db = getDb();
    const row = db
      .prepare("SELECT json FROM json_store WHERE name = ?")
      .get(name) as { json: string } | undefined;

    if (!row) return null;
    return JSON.parse(row.json) as T;
  } catch (err) {
    logger.error({ err }, `Failed to read SQLite json_store row: ${name}`);
    return null;
  }
}
