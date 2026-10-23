import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import vm from "node:vm";
import ts from "typescript";

const base = path.resolve(import.meta.dirname, "..");
const read = (file) => fs.readFileSync(path.join(base, file), "utf8");
const code = ts.transpileModule(read("src/lib/demo-ops.ts"), {
  compilerOptions: { target: ts.ScriptTarget.ES2022, module: ts.ModuleKind.CommonJS }, reportDiagnostics: true,
});
assert.equal(code.diagnostics.filter((d) => d.category === ts.DiagnosticCategory.Error).length, 0);
const exports = {};
vm.runInNewContext(code.outputText, { exports, require: (id) => {
  if (id === "react") return { useMemo: () => {}, useSyncExternalStore: () => {} };
  throw Error(`Unexpected import: ${id}`);
}, Set, Map, Date, Math, JSON, Object, Number, String }, { filename: "src/lib/demo-ops.ts" });
const ops = exports;

test("operator studio begins with safely empty plans and seven defined shelves", () => {
  assert.deepEqual(Array.from(ops.parseOperations(null).featuredOrder), []);
  assert.equal(ops.SHELVES.length, 7);
  assert.equal(ops.parseOperations("malformed").releases.length, 0);
});
test("operator studio rejects malformed state and unexpected rights or asset values", () => {
  const p = ops.parseOperations(JSON.stringify({
    featuredOrder: ["one", "one", "../evil"], hiddenShelves: ["trending", "nonexistent"],
    releases: [{slug:"sample",date:"2026-11-03",note:"Premiere"},{slug:"invalid/slug",date:"2026-11-03",note:"bad"}],
    rights: [{slug:"sample",status:"hold"},{slug:"test",status:"admin"}],
    intakes: [{id:"task-1",slug:"sample",asset:"video",status:"queued",createdAt:"2026-10-23"},{id:"bad",slug:"sample",asset:"executable",status:"queued",createdAt:"today"}],
  }));
  assert.equal(p.featuredOrder.length,1);
  assert.equal(p.hiddenShelves.length,1);
  assert.equal(p.releases.length,1);
  assert.equal(p.rights.length,1);
  assert.equal(p.intakes.length,1);
});
test("featured title reorder respects the editorial order without losing other records", () => {
  const items = ["first", "second", "third"].map(slug => ({slug}));
  assert.deepEqual(Array.from(ops.orderFeatured(items,["third","first"]),x=>x.slug), ["third","first","second"]);
  assert.deepEqual(items.map(x=>x.slug),["first","second","third"]);
});
test("homepage uses operator shelf visibility and ordered hero, CMS remains server role gated", () => {
  const homepage = read("src/components/home/home-experience.tsx");
  const admin = read("src/app/admin/page.tsx");
  const css = read("src/components/admin/admin-studio.css");
  assert.match(homepage,/shelfIsVisible\("trending"\)/);
  assert.match(homepage,/orderFeatured\(/);
  assert.match(admin,/currentAccount\(/);
  assert.match(admin,/user\.role === "viewer"|user\.role==="viewer"/);
  assert.match(css,/studio-media-grid/);
});
test("CMS includes the requested operational workspaces and labels demo-only reporting", () => {
  const ui = read("src/components/admin/admin-experience.tsx");
  for (const heading of ["Content library","Homepage curation","Media operations","Release planner","Rights checklist","Catalogue insights","Export CSV"]) {
    assert.ok(ui.includes(heading), heading);
  }
  assert.match(ui,/No fabricated viewership metrics/);
  assert.match(ui,/not automatically publish|does not automatically publish/);
});
