import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync, existsSync } from "node:fs";
import path from "node:path";
import vm from "node:vm";
import ts from "typescript";

const root = path.resolve(import.meta.dirname, "..");
const file = (name) => path.join(root, name);
const titles = JSON.parse(readFileSync(file("src/data/catalog.json"), "utf8"));
const series = JSON.parse(readFileSync(file("src/data/episodes.json"), "utf8"));
const casts = JSON.parse(readFileSync(file("src/data/credits.json"), "utf8"));

const source = readFileSync(file("src/lib/discovery.ts"), "utf8");
const compiled = ts.transpileModule(source, {
  compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022 },
  reportDiagnostics: true,
});
assert.deepEqual((compiled.diagnostics ?? []).filter((d) => d.category === ts.DiagnosticCategory.Error), []);
const exportsObject = {};
vm.runInNewContext(compiled.outputText, { exports: exportsObject, Object, Array, Set, Number, String }, { filename: "discovery.cjs" });
const { filterCatalogue, getFilterOptions, findRelatedTitles } = exportsObject;

test("filters compose across type, genre, language, year and search", () => {
  const results = filterCatalogue(titles, { kind: "movie", genre: "Drama", language: "Hindi", year: "2026", search: "Monsoon" });
  assert.deepEqual(Array.from(results, (item) => item.slug), ["last-monsoon"]);
  assert.equal(filterCatalogue(titles, { kind: "series" }).length, 3);
  assert.equal(filterCatalogue(titles, { search: "no such film exists" }).length, 0);
});

test("sort options produce stable and meaningful ordering", () => {
  const newest = filterCatalogue(titles, { sort: "newest" });
  assert.ok(newest.every((item, index) => index === 0 || newest[index-1].year >= item.year));
  const rating = filterCatalogue(titles, { sort: "rating" });
  assert.ok(rating.every((item, index) => index === 0 || rating[index-1].rating >= item.rating));
  const alphabetic = filterCatalogue(titles, { sort: "title" });
  assert.ok(alphabetic.every((item, index) => index === 0 || alphabetic[index-1].title.localeCompare(item.title) <= 0));
});

test("filter options are derived from catalogue and include regional language", () => {
  const options = getFilterOptions(titles);
  assert.ok(options.languages.includes("Tamil"));
  assert.ok(options.languages.includes("Malayalam"));
  assert.ok(options.genres.includes("Mystery"));
  assert.ok(options.years.includes("2026"));
});

test("related content excludes current title and prefers overlapping genres", () => {
  const title = titles.find((item) => item.slug === "afterlight");
  const related = findRelatedTitles(titles, title, 4);
  assert.equal(related.length, 4);
  assert.ok(related.every((item) => item.id !== title.id));
  assert.ok(related[0].genres.some((genre) => title.genres.includes(genre)));
});

test("series manifests have distinct episode IDs, ordered seasons and valid metadata", () => {
  const seriesTitles = titles.filter((item) => item.kind === "series");
  assert.equal(Object.keys(series).length, seriesTitles.length);
  const IDs = new Set();
  for (const show of seriesTitles) {
    const seasons = series[show.slug];
    assert.ok(Array.isArray(seasons) && seasons.length >= 1, show.slug);
    assert.ok(show.runtime.includes(String(seasons.length)), show.slug);
    for (const [index, season] of seasons.entries()) {
      assert.equal(season.number, index + 1);
      assert.ok(season.episodes.length >= 3);
      for (const [number, episode] of season.episodes.entries()) {
        assert.equal(episode.number, number + 1);
        assert.match(episode.id, /^[a-z0-9-]+-s\de\d+$/);
        assert.ok(!IDs.has(episode.id), `duplicate ${episode.id}`);
        IDs.add(episode.id);
        assert.ok(episode.title.length >= 5);
        assert.ok(episode.synopsis.length >= 35);
        assert.match(episode.runtime, /^\d+m$/);
      }
    }
  }
});

test("fictional cast exists for all titles", () => {
  for (const title of titles) {
    assert.ok(Array.isArray(casts[title.slug]));
    assert.ok(casts[title.slug].length >= 2);
  }
});

test("Phase 2 routes and license notes are present", () => {
  assert.ok(existsSync(file("src/app/explore/page.tsx")));
  assert.ok(existsSync(file("src/app/title/[slug]/page.tsx")));
  assert.ok(existsSync(file("docs/PHASE_02_REVIEW.md")));
  assert.match(readFileSync(file("docs/OPEN_SOURCE.md"), "utf8"), /MIT/);
});
