import Database from "better-sqlite3";
import { mkdirSync } from "fs";
import path from "path";
import { logger } from "../logger";

let db: Database.Database | null = null;

function ensureSchema(database: Database.Database) {
  // Schema upgrades live here (no separate migration files).
  database.exec(`
    PRAGMA journal_mode = WAL;
    PRAGMA foreign_keys = ON;
  `);

  const latest = 1;
  const row = database.prepare("PRAGMA user_version").get() as
    | { user_version: number }
    | undefined;
  let current = row?.user_version ?? 0;

  while (current < latest) {
    switch (current) {
      case 0: {
        database.exec(`
          CREATE TABLE IF NOT EXISTS json_store (
            name TEXT PRIMARY KEY,
            json TEXT NOT NULL,
            updated_at INTEGER NOT NULL
          );
          PRAGMA user_version = 1;
        `);
        current = 1;
        break;
      }
      default: {
        // Safety net: if we ever get here, stop looping.
        logger.error({ current }, "Unknown SQLite schema version");
        return;
      }
    }
  }

  if (current > latest) {
    logger.warn(
      { current, latest },
      "SQLite schema is newer than this code expects; continuing anyway",
    );
  }
}

export function getDb(): Database.Database {
  if (db) return db;

  const dataDir = path.join(process.cwd(), "data");
  mkdirSync(dataDir, { recursive: true });
  const dbPath = path.join(dataDir, "bot.sqlite");

  db = new Database(dbPath);
  ensureSchema(db);

  logger.info(`SQLite initialized at ${dbPath}`);
  return db;
}
