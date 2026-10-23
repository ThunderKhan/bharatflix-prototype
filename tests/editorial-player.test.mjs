import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";

const root = path.resolve(import.meta.dirname, "..");
const text = (file) => fs.readFileSync(path.join(root, file), "utf8");

test("editorial catalogue mirrors reference taxonomy without claiming service licenses", () => {
 const home = text("src/components/home/home-experience.tsx");
 for(const shelf of ["Trending Movies","Trending TV","Hindi Movies & Series","Animation & Family","Open Cinema · Real Films"]) assert.ok(home.includes(shelf), shelf);
 const providers=text("src/components/home/provider-strip.tsx");
 for(const provider of ["Netflix","Prime Video","Disney+","JioHotstar","Tata Play Binge"]) assert.ok(providers.includes(provider),provider);
 assert.match(providers,/not affiliated/);
});

test("player uses Video.js native video controls, not YouTube iframe", () => {
 const player = text("src/components/player/watch-experience.tsx");
 assert.match(player,/VideoPlayer/);
 assert.match(player,/NeutralVideoSkin/);
 assert.match(player,/onTimeUpdate/);
 assert.doesNotMatch(player,/<iframe|youtube-nocookie/);
 const sources=text("src/lib/demo-media.ts");
 assert.match(sources,/BigBuckBunny\.mp4/);
 assert.match(sources,/ElephantsDream\.mp4/);
 assert.match(sources,/DEMO_MP4/);
});

test("new design spec and licensing decisions are documented",()=>{
 const design=text("DESIGN.md");
 assert.match(design,/## Layout/);
 assert.match(design,/## Components/);
 assert.match(design,/Netflix design-system study/);
 const reference=text("docs/OTT_UI_REFERENCES.md");
 assert.match(reference,/No commercial movie posters/);
});
