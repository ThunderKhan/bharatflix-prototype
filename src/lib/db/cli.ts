import fs from "node:fs";
import { closeDb, openDb, recreateSeededDb, resolveDbFile } from "./connection";
import { countJsonSeed, seedFromJson } from "./seed";
import { buildSnapshot } from "./snapshot";

/**
 * Small catalogue CLI used during local development:
 *
 *   npm run db:seed    rebuild/refresh the database from src/data/*.json
 *   npm run db:reset   delete the database file, then reseed
 *   npm run db:status  show row counts and JSON parity
 *   npm run db:inspect print the catalogue the app would render
 */

type Args = { command: string; flags: Record<string, string> };

function parseArgs(argv: string[]): Args {
  const [command = "status", ...rest] = argv;
  const flags: Record<string, string> = {};
  for (let index = 0; index < rest.length; index += 1) {
    const token = rest[index];
    if (token.startsWith("--")) {
      const key = token.slice(2);
      const value = rest[index + 1] && !rest[index + 1].startsWith("--") ? rest[(index += 1)] : "true";
      flags[key] = value;
    }
  }
  return { command, flags };
}

const line = (label: string, value: string | number): void => console.log(`  ${label.padEnd(16)} ${value}`);

function printSummary(summary: ReturnType<typeof seedFromJson>): void {
  line("titles", summary.titles);
  line("genres", summary.genres);
  line("collections", summary.collections);
  line("seasons", summary.seasons);
  line("episodes", summary.episodes);
  line("people", summary.people);
  line("credits", summary.credits);
  line("streams", summary.streams);
  line("rows", summary.rows);
  line("settings", summary.settings);
}

const { command } = parseArgs(process.argv.slice(2));

switch (command) {
  case "seed": {
    const db = openDb();
    console.log(`Seeding ${resolveDbFile()}`);
    printSummary(seedFromJson(db));
    db.close();
    break;
  }
  case "reset": {
    console.log(`Rebuilding ${resolveDbFile()}`);
    printSummary(recreateSeededDb());
    break;
  }
  case "status": {
    const db = openDb();
    const file = resolveDbFile();
    const size = fs.existsSync(file) ? `${(fs.statSync(file).size / 1024).toFixed(1)} KB` : "missing";
    const count = (table: string): number => (db.prepare(`SELECT COUNT(*) AS n FROM ${table}`).get() as { n: number }).n;
    console.log(`BharatFlix catalogue database`);
    line("file", file);
    line("size", size);
    for (const table of ["titles", "seasons", "episodes", "genres", "collections", "people", "credits", "streams", "rows", "users", "settings"]) {
      line(table, count(table));
    }
    const json = countJsonSeed();
    const parity = { titles: count("titles"), episodes: count("episodes"), credits: count("credits") };
    console.log("\n  JSON seed parity");
    line("titles", `${parity.titles} / ${json.titles}`);
    line("episodes", `${parity.episodes} / ${json.episodes}`);
    line("credits", `${parity.credits} / ${json.credits}`);
    db.close();
    break;
  }
  case "inspect": {
    const db = openDb();
    const snapshot = buildSnapshot(db, "all");
    console.log(`${snapshot.titles.length} titles (drafts included)\n`);
    for (const title of snapshot.titles) {
      const seasons = snapshot.seasonsBySlug[title.slug]?.length ?? 0;
      const extra = seasons ? ` · ${seasons} season${seasons === 1 ? "" : "s"}` : "";
      console.log(`  ${title.featured ? "★" : " "} ${title.slug.padEnd(26)} ${title.kind.padEnd(7)} ${String(title.year)}  ${title.title}${extra}`);
    }
    db.close();
    break;
  }
  default:
    console.log(`Unknown command "${command}". Use: seed | reset | status | inspect`);
    process.exitCode = 1;
}

closeDb();
