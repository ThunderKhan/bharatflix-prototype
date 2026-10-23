import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync, existsSync } from "node:fs";
import path from "node:path";

const projectRoot = path.resolve(import.meta.dirname, "..");
const titles = JSON.parse(readFileSync(path.join(projectRoot, "src/data/catalog.json"), "utf8"));

test("catalogue is large enough for rows, with both movies and series", () => {
  assert.ok(titles.length >= 12);
  assert.ok(titles.filter((item) => item.kind === "movie").length >= 6);
  assert.ok(titles.filter((item) => item.kind === "series").length >= 3);
  assert.ok(titles.filter((item) => item.featured).length >= 3);
});

test("all IDs and slugs are unique and names are fictional", () => {
  assert.equal(new Set(titles.map((t) => t.id)).size, titles.length);
  assert.equal(new Set(titles.map((t) => t.slug)).size, titles.length);
  for (const item of titles) {
    assert.match(item.id, /^bf-\d{3}$/);
    assert.match(item.slug, /^[a-z0-9-]+$/);
    assert.ok(item.title.trim().length >= 3);
    assert.ok(item.synopsis.trim().length >= 35);
  }
});

test("every title has locally available original poster and backdrop assets", () => {
  for (const item of titles) {
    for (const key of ["poster", "backdrop"]) {
      assert.match(item[key], /^\/artwork\/[a-z0-9-]+\.svg$/);
      const abs = path.join(projectRoot, "public", item[key].slice(1));
      assert.ok(existsSync(abs), `Missing artwork for ${item.slug}: ${key}`);
      assert.match(readFileSync(abs, "utf8"), /^<svg /);
    }
  }
});

test("each collection and score is valid", () => {
  const kinds = new Set(["movie", "series"]);
  for (const item of titles) {
    assert.ok(kinds.has(item.kind));
    assert.ok(item.year >= 2010 && item.year <= 2035);
    assert.ok(item.rating > 0 && item.rating <= 10);
    assert.ok(item.collection.length > 0);
    assert.ok(item.genres.length > 0);
  }
});

test("Five-phase roadmap and upstream license notices exist", () => {
  const roadmap = readFileSync(path.join(projectRoot, "docs/ROADMAP.md"), "utf8");
  const licenses = readFileSync(path.join(projectRoot, "docs/OPEN_SOURCE.md"), "utf8");
  for (const phase of ["Phase 01", "Phase 02", "Phase 03", "Phase 04", "Phase 05"]) assert.ok(roadmap.includes(phase));
  assert.match(licenses, /Copyright \(c\) 2026 xalonious/);
  assert.match(licenses, /Permission is hereby granted/);
});
