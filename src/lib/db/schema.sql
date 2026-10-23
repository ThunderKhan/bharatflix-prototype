-- BharatFlix CMS schema.
-- Applied idempotently on every connection (CREATE ... IF NOT EXISTS).
-- Phase 1 only seeds and reads titles/seasons/episodes/credits; the remaining
-- tables exist now so later CMS phases never have to migrate this one.

CREATE TABLE IF NOT EXISTS titles (
  id          TEXT PRIMARY KEY,
  slug        TEXT NOT NULL UNIQUE,
  title       TEXT NOT NULL,
  tagline     TEXT NOT NULL DEFAULT '',
  kind        TEXT NOT NULL DEFAULT 'movie' CHECK (kind IN ('movie', 'series')),
  year        INTEGER NOT NULL DEFAULT 2026,
  runtime     TEXT NOT NULL DEFAULT '',
  maturity    TEXT NOT NULL DEFAULT '',
  language    TEXT NOT NULL DEFAULT '',
  synopsis    TEXT NOT NULL DEFAULT '',
  poster      TEXT NOT NULL DEFAULT '',
  backdrop    TEXT NOT NULL DEFAULT '',
  featured    INTEGER NOT NULL DEFAULT 0,
  rating      REAL NOT NULL DEFAULT 0,
  badge       TEXT,
  status      TEXT NOT NULL DEFAULT 'published' CHECK (status IN ('published', 'draft', 'scheduled')),
  sort_order  INTEGER NOT NULL DEFAULT 0,
  published_at TEXT,
  created_at  TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at  TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS genres (
  id   INTEGER PRIMARY KEY AUTOINCREMENT,
  slug TEXT NOT NULL UNIQUE,
  name TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS title_genres (
  title_id TEXT NOT NULL REFERENCES titles(id) ON DELETE CASCADE,
  genre_id INTEGER NOT NULL REFERENCES genres(id) ON DELETE CASCADE,
  position INTEGER NOT NULL DEFAULT 0,
  PRIMARY KEY (title_id, genre_id)
);

CREATE TABLE IF NOT EXISTS collections (
  id   INTEGER PRIMARY KEY AUTOINCREMENT,
  slug TEXT NOT NULL UNIQUE,
  name TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS title_collections (
  title_id      TEXT NOT NULL REFERENCES titles(id) ON DELETE CASCADE,
  collection_id INTEGER NOT NULL REFERENCES collections(id) ON DELETE CASCADE,
  position      INTEGER NOT NULL DEFAULT 0,
  PRIMARY KEY (title_id, collection_id)
);

CREATE TABLE IF NOT EXISTS seasons (
  id       TEXT PRIMARY KEY,
  title_id TEXT NOT NULL REFERENCES titles(id) ON DELETE CASCADE,
  number   INTEGER NOT NULL,
  name     TEXT NOT NULL DEFAULT '',
  UNIQUE (title_id, number)
);

CREATE TABLE IF NOT EXISTS episodes (
  id       TEXT PRIMARY KEY,
  season_id TEXT NOT NULL REFERENCES seasons(id) ON DELETE CASCADE,
  number   INTEGER NOT NULL,
  title    TEXT NOT NULL,
  synopsis TEXT NOT NULL DEFAULT '',
  runtime  TEXT NOT NULL DEFAULT '',
  UNIQUE (season_id, number)
);

CREATE TABLE IF NOT EXISTS people (
  id   INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL UNIQUE
);

CREATE TABLE IF NOT EXISTS credits (
  title_id  TEXT NOT NULL REFERENCES titles(id) ON DELETE CASCADE,
  person_id INTEGER NOT NULL REFERENCES people(id) ON DELETE CASCADE,
  role      TEXT NOT NULL DEFAULT 'cast',
  position  INTEGER NOT NULL DEFAULT 0,
  PRIMARY KEY (title_id, person_id, role)
);

-- Playback sources. Phase 1 seeds the demo clips; the player switches to
-- reading this table in a later phase.
CREATE TABLE IF NOT EXISTS streams (
  id        TEXT PRIMARY KEY,
  title_id  TEXT REFERENCES titles(id) ON DELETE CASCADE,
  episode_id TEXT REFERENCES episodes(id) ON DELETE CASCADE,
  label     TEXT NOT NULL,
  kind      TEXT NOT NULL DEFAULT 'sample' CHECK (kind IN ('sample', 'youtube', 'file', 'hls')),
  quality   TEXT NOT NULL DEFAULT '',
  url       TEXT NOT NULL,
  priority  INTEGER NOT NULL DEFAULT 0,
  enabled   INTEGER NOT NULL DEFAULT 1,
  CHECK (title_id IS NOT NULL OR episode_id IS NOT NULL)
);

-- Homepage row configuration. Seeded in phase 1, rendered by the home page
-- from the database in the CMS phases.
CREATE TABLE IF NOT EXISTS rows (
  id          TEXT PRIMARY KEY,
  key         TEXT NOT NULL UNIQUE,
  eyebrow     TEXT NOT NULL DEFAULT '',
  title       TEXT NOT NULL,
  description TEXT NOT NULL DEFAULT '',
  source_type TEXT NOT NULL DEFAULT 'collection' CHECK (source_type IN ('collection', 'kind', 'manual')),
  source_value TEXT NOT NULL DEFAULT '',
  ranked      INTEGER NOT NULL DEFAULT 0,
  position    INTEGER NOT NULL DEFAULT 0,
  visible     INTEGER NOT NULL DEFAULT 1
);

CREATE TABLE IF NOT EXISTS users (
  id            TEXT PRIMARY KEY,
  email         TEXT NOT NULL UNIQUE,
  name          TEXT NOT NULL DEFAULT '',
  password_hash TEXT NOT NULL,
  role          TEXT NOT NULL DEFAULT 'editor' CHECK (role IN ('admin', 'editor')),
  created_at    TEXT NOT NULL DEFAULT (datetime('now')),
  last_login_at TEXT
);

CREATE TABLE IF NOT EXISTS audit_log (
  id         INTEGER PRIMARY KEY AUTOINCREMENT,
  actor      TEXT NOT NULL DEFAULT 'system',
  action     TEXT NOT NULL,
  entity     TEXT NOT NULL DEFAULT '',
  entity_id  TEXT NOT NULL DEFAULT '',
  detail     TEXT NOT NULL DEFAULT '',
  created_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS settings (
  key   TEXT PRIMARY KEY,
  value TEXT NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_titles_status ON titles(status, sort_order);
CREATE INDEX IF NOT EXISTS idx_seasons_title ON seasons(title_id, number);
CREATE INDEX IF NOT EXISTS idx_episodes_season ON episodes(season_id, number);
CREATE INDEX IF NOT EXISTS idx_credits_title ON credits(title_id, position);
CREATE INDEX IF NOT EXISTS idx_streams_title ON streams(title_id, priority);
CREATE INDEX IF NOT EXISTS idx_streams_episode ON streams(episode_id, priority);
