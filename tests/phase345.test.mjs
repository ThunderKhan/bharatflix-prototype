import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import vm from "node:vm";
import ts from "typescript";

const root = path.resolve(import.meta.dirname, "..");
const read = (p) => fs.readFileSync(path.join(root, p), "utf8");
function loadTs(relative, mocks={}) {
  const code = ts.transpileModule(read(relative), { compilerOptions: { target: ts.ScriptTarget.ES2022, module: ts.ModuleKind.CommonJS }, reportDiagnostics: true });
  assert.equal((code.diagnostics || []).filter(d=>d.category===ts.DiagnosticCategory.Error).length,0);
  const exports = {};
  vm.runInNewContext(code.outputText, {exports,require:(id)=>{if(!(id in mocks))throw Error(`Missing ${id}`);return mocks[id]},Set,Map,Date,JSON,Object,Array,Number,String}, {filename:relative});
  return exports;
}
const titles = JSON.parse(read("src/data/catalog.json"));
const episodes = JSON.parse(read("src/data/episodes.json"));
const catalogue = {
 titles,
 getSeasonsForTitle:(slug)=>episodes[slug]||[]
};
const media = loadTs("src/lib/demo-media.ts", {"@/lib/catalog":catalogue});

test("Phase 3 creates playable film and episode routes",()=>{
 const all=media.listWatchTargets();
 assert.equal(all.length,titles.filter(x=>x.kind==="movie").length+Object.values(episodes).flat().reduce((n,s)=>n+s.episodes.length,0));
 for(const target of all)assert.equal(media.getWatchTarget(target.id).id,target.id);
 assert.equal(media.getWatchTarget("arbitrary-id"),undefined);
 assert.ok(media.getWatchTarget("parallel-s1e1")?.nextId);
});
test("Phase 3 video sources are allowlisted demos and credits are visible",()=>{
 assert.match(media.DEMO_MP4,/^https:\/\/interactive-examples\.mdn\.mozilla\.net\/media\/cc0-videos\//);
 assert.match(media.LICENSED_FILM_MP4["big-buck-bunny"],/BigBuckBunny\.mp4$/);
 assert.match(media.LICENSED_FILM_MP4["elephants-dream"],/ElephantsDream\.mp4$/);
 assert.match(read("src/lib/demo-media.ts"),/BigBuckBunny/);
});
test("Phase 4 local-library parser rejects corrupt input and sanitizes entries",()=>{
 const lib=loadTs("src/lib/demo-library.ts", {react:{useMemo:()=>{},useSyncExternalStore:()=>{}}});
 assert.equal(lib.parseLibrary("invalid").watchlist.length,0);
 const x=lib.parseLibrary(JSON.stringify({watchlist:["test","test","../../bad"],history:[{id:"valid-id",seconds:4,duration:8,updatedAt:1},{id:"other",seconds:-1,duration:0,updatedAt:1}]}));
 assert.deepEqual(Array.from(x.watchlist),["test"]);
 assert.equal(x.history.length,1);
});
test("Phase 5 CMS applies edits to sample catalogue and excludes unpublished titles",()=>{
 const cms=loadTs("src/lib/demo-cms.ts", {react:{useMemo:()=>{},useSyncExternalStore:()=>{}},"@/lib/catalog":{titles}});
 const base= cms.applyCMS({edits:[],created:[]});
 assert.equal(base.published.length,titles.length);
 const first=titles[0];
 const after=cms.applyCMS({edits:[{slug:first.slug,title:"Editorial title",synopsis:"Example editorial text",published:false,featured:true}],created:[]});
 assert.equal(after.all[0].title,"Editorial title");
 assert.equal(after.published.length,titles.length-1);
 assert.equal(titles[0].title,first.title);
});
test("all three demo pages and review docs exist",()=>{
 for(const target of ["src/app/watch/[id]/page.tsx","src/app/my-space/page.tsx","src/app/admin/page.tsx","docs/PHASE_03_REVIEW.md","docs/PHASE_04_REVIEW.md","docs/PHASE_05_REVIEW.md"])assert.ok(fs.existsSync(path.join(root,target)),target);
});
