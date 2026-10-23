import fs from "node:fs";
import path from "node:path";
import Database from "better-sqlite3";
import { seedFromJson, countJsonSeed, ensureOperator, type SeedSummary } from "./seed";

/**
 * SQLite connection for the CMS.
 *
 * The database file defaults to `data/bharatflix.db` in the project root and can
 * be redirected with BHARATFLIX_DB_FILE (used by the tests). The singleton is
 * cached on globalThis so `next dev` hot reloads keep one handle instead of
 * opening the file over and over.
 */

const globalForDb = globalThis as unknown as { __bharatflixDb?: Database.Database };

export function resolveDbFile(): string {
  const override = process.env.BHARATFLIX_DB_FILE;
  if (override) return override;
  return path.join(process.cwd(), "data", "bharatflix.db");
}

export function openDb(file = resolveDbFile()): Database.Database {
  fs.mkdirSync(path.dirname(file), { recursive: true });
  const db = new Database(file);
  db.pragma("journal_mode = WAL");
  db.pragma("foreign_keys = ON");
  const schema = fs.readFileSync(path.join(process.cwd(), "src", "lib", "db", "schema.sql"), "utf8");
  db.exec(schema);
  return db;
}

/** True when the titles table already holds catalogue rows. */
export function isSeeded(db: Database.Database): boolean {
  const row = db.prepare("SELECT COUNT(*) AS n FROM titles").get() as { n: number };
  return row.n > 0;
}

/**
 * Opens (and on first use creates + seeds) the catalogue database.
 * Seeding is skipped automatically when the file already has titles, so the
 * app works on a fresh clone without an extra setup step.
 */
export function getDb(): Database.Database {
  if (globalForDb.__bharatflixDb) return globalForDb.__bharatflixDb;
  const db = openDb();
  if (!isSeeded(db)) {
    const summary = seedFromJson(db);
    console.info(`[db] seeded ${summary.titles} titles, ${summary.episodes} episodes into ${resolveDbFile()}`);
  } else {
    ensureOperator(db);
  }
  globalForDb.__bharatflixDb = db;
  return db;
}

export function closeDb(): void {
  globalForDb.__bharatflixDb?.close();
  globalForDb.__bharatflixDb = undefined;
}

/** Used by the CLI: rebuild the database from the JSON seed. */
export function recreateSeededDb(file = resolveDbFile()): SeedSummary {
  for (const suffix of ["", "-wal", "-shm"]) {
    if (fs.existsSync(file + suffix)) fs.unlinkSync(file + suffix);
  }
  const db = openDb(file);
  const summary = seedFromJson(db);
  db.close();
  return summary;
}

export { countJsonSeed };
