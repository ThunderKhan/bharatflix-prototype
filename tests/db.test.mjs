import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { execFileSync } from "node:child_process";
import { createRequire } from "node:module";

const require = createRequire(import.meta.url);
const Database = require("better-sqlite3");

const root = path.resolve(import.meta.dirname, "..");
const read = (p) => JSON.parse(fs.readFileSync(path.join(root, p), "utf8"));
const catalog = read("src/data/catalog.json");
const episodes = read("src/data/episodes.json");
const credits = read("src/data/credits.json");

const tmpDb = path.join(os.tmpdir(), `bharatflix-test-${process.pid}.db`);
const cli = path.join(root, "node_modules", "tsx", "dist", "cli.mjs");

function runCli(command) {
  execFileSync(process.execPath, [cli, path.join(root, "src", "lib", "db", "cli.ts"), command], {
    cwd: root,
    env: { ...process.env, BHARATFLIX_DB_FILE: tmpDb },
    stdio: "pipe",
  });
}

const count = (db, table) => db.prepare(`SELECT COUNT(*) AS n FROM ${table}`).get().n;
const seasonCount = Object.values(episodes).reduce((n, list) => n + list.length, 0);
const episodeCount = Object.values(episodes).flat().reduce((n, season) => n + season.episodes.length, 0);
const movieCount = catalog.filter((title) => title.kind === "movie").length;

test.after(() => {
  // SQLite can keep the WAL file alive for a moment after close.
  for (let attempt = 0; attempt < 5; attempt += 1) {
    try {
      for (const suffix of ["", "-wal", "-shm"]) fs.rmSync(tmpDb + suffix, { force: true });
      return;
    } catch {
      Atomics.wait(new Int32Array(new SharedArrayBuffer(4)), 0, 0, 100);
    }
  }
});

test("the seed creates the full CMS schema and matches the JSON fixture", () => {
  runCli("seed");
  const db = new Database(tmpDb, { readonly: true });
  try {
    for (const table of ["titles", "genres", "title_genres", "collections", "title_collections",
      "seasons", "episodes", "people", "credits", "streams", "rows", "users", "audit_log", "settings"]) {
      assert.ok(db.prepare(`SELECT COUNT(*) AS n FROM ${table}`).get().n >= 0, `${table} table missing`);
    }

    assert.equal(count(db, "titles"), catalog.length);
    assert.equal(count(db, "seasons"), seasonCount);
    assert.equal(count(db, "episodes"), episodeCount);
    assert.equal(count(db, "credits"), Object.values(credits).flat().length);
    assert.equal(count(db, "streams"), movieCount * 2 + episodeCount, "two demo sources per film, one per episode");
    assert.equal(count(db, "rows"), 4, "homepage rows are seeded for the CMS");
    assert.ok(count(db, "genres") > 5);
    assert.ok(count(db, "collections") >= 2);
    assert.equal(count(db, "users"), 1, "one studio operator is seeded for local sign-in");

    const first = catalog[0];
    const row = db.prepare("SELECT * FROM titles WHERE slug = ?").get(first.slug);
    assert.equal(row.title, first.title);
    assert.equal(row.tagline, first.tagline);
    assert.equal(row.year, first.year);
    assert.equal(row.rating, first.rating);
    assert.equal(row.language, first.language);
    assert.equal(row.poster, first.poster);
    assert.equal(row.featured, first.featured ? 1 : 0);
    assert.equal(row.status, "published");
    assert.equal(row.badge, first.badge ?? null);

    const genres = db.prepare(
      "SELECT g.name FROM title_genres tg JOIN genres g ON g.id = tg.genre_id WHERE tg.title_id = ? ORDER BY tg.position",
    ).all(first.id).map((entry) => entry.name);
    assert.deepEqual(genres, first.genres);

    const collections = db.prepare(
      "SELECT c.slug FROM title_collections tc JOIN collections c ON c.id = tc.collection_id WHERE tc.title_id = ? ORDER BY tc.position",
    ).all(first.id).map((entry) => entry.slug);
    assert.deepEqual(collections, first.collection);

    const cast = db.prepare(
      "SELECT p.name FROM credits c JOIN people p ON p.id = c.person_id WHERE c.title_id = ? ORDER BY c.position",
    ).all(first.id).map((entry) => entry.name);
    assert.deepEqual(cast, credits[first.slug]);

    const parallel = catalog.find((title) => title.slug === "parallel");
    const season = db.prepare("SELECT * FROM seasons WHERE title_id = ? ORDER BY number").all(parallel.id)[0];
    assert.equal(season.name, episodes.parallel[0].name);
    const stored = db.prepare("SELECT id, number, title, synopsis, runtime FROM episodes WHERE season_id = ? ORDER BY number").all(season.id);
    assert.deepEqual(stored.map((entry) => entry.id), episodes.parallel[0].episodes.map((entry) => entry.id));
    assert.deepEqual(stored.map((entry) => entry.title), episodes.parallel[0].episodes.map((entry) => entry.title));
  } finally {
    db.close();
  }
});

test("a second seed run is idempotent", () => {
  runCli("seed");
  runCli("seed");
  const db = new Database(tmpDb, { readonly: true });
  assert.equal(count(db, "titles"), catalog.length);
  assert.equal(count(db, "seasons"), seasonCount);
  assert.equal(count(db, "episodes"), episodeCount);
  assert.equal(count(db, "credits"), Object.values(credits).flat().length);
  assert.equal(count(db, "streams"), movieCount * 2 + episodeCount);
  db.close();
});

test("reset rebuilds the database from the fixture", () => {
  const db = new Database(tmpDb);
  db.prepare("UPDATE titles SET title = 'MUTATED', status = 'draft'").run();
  db.close();
  runCli("reset");
  const fresh = new Database(tmpDb, { readonly: true });
  assert.equal(fresh.prepare("SELECT COUNT(*) AS n FROM titles WHERE title = 'MUTATED'").get().n, 0);
  assert.equal(fresh.prepare("SELECT COUNT(*) AS n FROM titles WHERE status = 'draft'").get().n, 0);
  assert.equal(count(fresh, "titles"), catalog.length);
  fresh.close();
});
