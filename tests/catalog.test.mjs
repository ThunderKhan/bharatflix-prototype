import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import path from "node:path";

const projectRoot = path.resolve(import.meta.dirname, "..");
const titles = JSON.parse(readFileSync(path.join(projectRoot, "src/data/catalog.json"), "utf8"));

test("catalogue is large enough for rows, with both movies and series", () => {
  assert.ok(titles.length >= 12);
  assert.ok(titles.filter((item) => item.kind === "movie").length >= 6);
  assert.ok(titles.filter((item) => item.kind === "series").length >= 3);
  assert.ok(titles.filter((item) => item.featured).length >= 3);
});

test("all IDs and slugs are unique with no deceptive catalogue entries", () => {
  assert.equal(new Set(titles.map((t) => t.id)).size, titles.length);
  assert.equal(new Set(titles.map((t) => t.slug)).size, titles.length);
  for (const item of titles) {
    assert.match(item.id, /^bf-\d{3}$/);
    assert.match(item.slug, /^[a-z0-9-]+$/);
    assert.ok(item.title.trim().length >= 3);
    assert.ok(item.synopsis.trim().length >= 35);
  }
});

test("fictional titles use sourced photographic concept art; open films use attributed posters", () => {
  for (const item of titles) {
    if (item.mediaOrigin === "open-film") {
      assert.match(item.poster, /^https:\/\/thumb\.wikimedia\.org\/wikipedia\/commons\/thumb\//);
      assert.match(item.backdrop, /^https:\/\/(?:thumb\.wikimedia\.org|i\.ytimg\.com)\//);
      assert.match(item.imageSourceUrl, /^https:\/\/commons\.wikimedia\.org\/wiki\/File:/);
      assert.match(item.artworkLicenseUrl, /^https:\/\/creativecommons\.org\/licenses\/by\/[34]\.0\//);
      assert.match(item.filmSourceUrl, /^https:\/\/studio\.blender\.org\//);
      assert.ok(item.imageCredit?.length > 10);
      assert.ok(item.artworkChanges?.length > 10);
      if (item.youtubeId) assert.match(item.youtubeId, /^[\w-]{11}$/);
      assert.equal(item.rating, 0, "Do not invent ratings for real films");
    } else {
      for (const key of ["poster", "backdrop"]) {
        assert.match(item[key], /^https:\/\/images\.unsplash\.com\/photo-[a-zA-Z0-9-]+\?/);
      }
      assert.match(item.imageSourceUrl, /^https:\/\/images\.unsplash\.com\/photo-[a-zA-Z0-9-]+$/);
      assert.equal(item.artworkLicenseUrl, "https://unsplash.com/license");
      assert.match(item.imageCredit, /photograph sourced from Unsplash/);
      assert.ok(item.artworkDescription?.length > 10);
    }
  }
});

test("collections and dates are valid without fictitious scores for open films", () => {
  const kinds = new Set(["movie", "series"]);
  for (const item of titles) {
    assert.ok(kinds.has(item.kind));
    assert.ok(item.year >= 2000 && item.year <= 2035);
    if (item.mediaOrigin !== "open-film") assert.ok(item.rating >= 0 && item.rating <= 10);
    assert.ok(item.collection.length > 0);
    assert.ok(item.genres.length > 0);
  }
  const open = titles.filter(x => x.mediaOrigin === "open-film");
  assert.equal(open.length, 7);
  assert.ok(open.filter(x => x.youtubeId).length >= 6);
  assert.ok(open.some(x=>x.slug==="sintel"));
});

test("Five-phase roadmap and upstream license notices exist", () => {
  const roadmap = readFileSync(path.join(projectRoot, "docs/ROADMAP.md"), "utf8");
  const licenses = readFileSync(path.join(projectRoot, "docs/OPEN_SOURCE.md"), "utf8");
  for (const phase of ["Phase 01", "Phase 02", "Phase 03", "Phase 04", "Phase 05"]) assert.ok(roadmap.includes(phase));
  assert.match(licenses, /Copyright \(c\) 2026 xalonious/);
  assert.match(licenses, /Permission is hereby granted/);
});
