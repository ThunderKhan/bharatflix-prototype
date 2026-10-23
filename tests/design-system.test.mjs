import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";

const root = path.resolve(import.meta.dirname, "..");
const read = (p) => fs.readFileSync(path.join(root,p), "utf8");
const entries = JSON.parse(read("src/data/catalog.json"));

test("Editorial DESIGN.md palette matches the shared CSS tokens", () => {
  const design = read("DESIGN.md");
  const css = read("src/app/globals.css");
  for (const color of ["#080A0D", "#15181D", "#1E242B", "#F7F8FA", "#92B9D3", "#B2D2E4"]) {
    assert.ok(design.includes(color), `${color} missing in DESIGN.md`);
    assert.ok(css.includes(color), `${color} missing in globals.css`);
  }
  assert.match(css, /\.concept-card-cover/);
  assert.match(css, /\.concept-grid-cover/);
  assert.match(css, /\.concept-detail-cover/);
});

test("All fictional entries now have real sourced photography with explicit attribution", () => {
  const concepts=entries.filter(t=>t.mediaOrigin!=="open-film");
  assert.equal(concepts.length,12);
  assert.equal(new Set(concepts.map(t=>t.imageSourceUrl)).size,12);
  const sources=read("docs/CONCEPT_PHOTOGRAPHY.md");
  for(const t of concepts){
    assert.ok(t.poster.startsWith(t.imageSourceUrl), t.slug);
    assert.ok(t.backdrop.startsWith(t.imageSourceUrl), t.slug);
    assert.ok(sources.includes(t.imageSourceUrl), t.slug);
  }
  assert.match(read("next.config.ts"), /images\.unsplash\.com/);
});
