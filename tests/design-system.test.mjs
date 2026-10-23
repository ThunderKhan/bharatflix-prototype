import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
const root=path.resolve(import.meta.dirname,"..");
const read=p=>fs.readFileSync(path.join(root,p),"utf8");
const entries=JSON.parse(read("src/data/catalog.json"));
test("Nocturne design tokens are synchronized with CSS",()=>{
 const design=read("DESIGN.md"),css=read("src/app/globals.css");
 for(const color of ["#080C10","#12181F","#1B232C","#F5F3EC","#D8B47B","#EACB98"]){assert.ok(design.includes(color),color);assert.ok(css.includes(color),color)}
 for(const cls of [".concept-card-cover",".concept-grid-cover",".concept-detail-cover"])assert.ok(css.includes(cls),cls);
});
test("All 12 fictional entries have real sourced photographs and registered links",()=>{
 const concepts=entries.filter(x=>x.mediaOrigin!=="open-film");
 assert.equal(concepts.length,12);
 assert.equal(new Set(concepts.map(x=>x.imageSourceUrl)).size,12);
 const docs=read("docs/CONCEPT_PHOTOGRAPHY.md");
 for(const t of concepts){assert.ok(t.poster.startsWith(t.imageSourceUrl));assert.ok(t.backdrop.startsWith(t.imageSourceUrl));assert.ok(docs.includes(t.imageSourceUrl))}
 assert.match(read("next.config.ts"),/images\.unsplash\.com/);
});
