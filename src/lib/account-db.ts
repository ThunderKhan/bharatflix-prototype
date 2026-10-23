import "server-only";
import { DatabaseSync } from "node:sqlite";
import fs from "node:fs";
import path from "node:path";

/** Persistent local/demo auth store. Requires a writable persistent volume and Node.js 22. */
let connection: DatabaseSync | undefined;

export function accountDb(): DatabaseSync {
  if (connection) return connection;
  const file = path.resolve(process.env.BHARATFLIX_DATABASE_PATH ?? ".local-data/bharatflix.sqlite");
  fs.mkdirSync(path.dirname(file), { recursive: true, mode: 0o700 });
  connection = new DatabaseSync(file, { timeout: 5000 });
  connection.exec(`
    PRAGMA journal_mode=WAL;
    PRAGMA foreign_keys=ON;
    CREATE TABLE IF NOT EXISTS users (
      id TEXT PRIMARY KEY,
      email TEXT NOT NULL UNIQUE,
      display_name TEXT NOT NULL,
      password_hash TEXT NOT NULL,
      role TEXT NOT NULL CHECK(role IN ('viewer','admin','superadmin')),
      disabled INTEGER NOT NULL DEFAULT 0,
      failed_attempts INTEGER NOT NULL DEFAULT 0,
      locked_until INTEGER NOT NULL DEFAULT 0,
      created_at INTEGER NOT NULL
    );
    CREATE TABLE IF NOT EXISTS sessions (
      token_hash TEXT PRIMARY KEY,
      user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      expires_at INTEGER NOT NULL,
      created_at INTEGER NOT NULL
    );
    CREATE INDEX IF NOT EXISTS sessions_user_id ON sessions(user_id);
    CREATE TABLE IF NOT EXISTS watchlist (
      user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      slug TEXT NOT NULL,
      PRIMARY KEY(user_id,slug)
    );
    CREATE TABLE IF NOT EXISTS watch_history (
      user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      media_id TEXT NOT NULL,
      seconds REAL NOT NULL,
      duration REAL NOT NULL,
      updated_at INTEGER NOT NULL,
      PRIMARY KEY(user_id,media_id)
    );
    CREATE TABLE IF NOT EXISTS auth_rate_limits (
      identifier TEXT PRIMARY KEY,
      count INTEGER NOT NULL,
      reset_at INTEGER NOT NULL
    );
  `);
  return connection;
}
