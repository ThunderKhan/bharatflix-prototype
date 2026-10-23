import fs from "node:fs";
import path from "node:path";
import type Database from "better-sqlite3";
import type { MediaTitle, Season } from "@/types/media";
import { DEMO_MP4 } from "@/lib/demo-media";
import { hashPassword } from "@/lib/admin/crypto";

/**
 * Seeds the SQLite catalogue from the original JSON files in src/data.
 *
 * The JSON files stay in the repo: they are the fixture that a fresh clone (and
 * the seed-parity test) can always rebuild from. Everything the app renders,
 * however, is read from the database.
 */

export type SeedSummary = {
  titles: number;
  genres: number;
  collections: number;
  seasons: number;
  episodes: number;
  people: number;
  credits: number;
  streams: number;
  rows: number;
  settings: number;
};

const EMPTY: SeedSummary = {
  titles: 0, genres: 0, collections: 0, seasons: 0, episodes: 0,
  people: 0, credits: 0, streams: 0, rows: 0, settings: 0,
};

export function readJsonSeed(): { catalog: MediaTitle[]; episodes: Record<string, Season[]>; credits: Record<string, string[]> } {
  const read = <T>(file: string): T =>
    JSON.parse(fs.readFileSync(path.join(process.cwd(), "src", "data", file), "utf8")) as T;
  return {
    catalog: read<MediaTitle[]>("catalog.json"),
    episodes: read<Record<string, Season[]>>("episodes.json"),
    credits: read<Record<string, string[]>>("credits.json"),
  };
}

export function countJsonSeed(): SeedSummary {
  const { catalog, episodes, credits } = readJsonSeed();
  return {
    ...EMPTY,
    titles: catalog.length,
    seasons: Object.values(episodes).reduce((n, list) => n + list.length, 0),
    episodes: Object.values(episodes).reduce((n, list) => n + list.reduce((m, season) => m + season.episodes.length, 0), 0),
    credits: Object.values(credits).reduce((n, list) => n + list.length, 0),
  };
}

const slugify = (value: string): string =>
  value.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");

const collectionName = (slug: string): string =>
  slug.charAt(0).toUpperCase() + slug.slice(1);

export function seedFromJson(db: Database.Database): SeedSummary {
  const { catalog, episodes, credits } = readJsonSeed();
  const summary: SeedSummary = { ...EMPTY };
  const now = new Date().toISOString();

  const insertTitle = db.prepare(`
    INSERT INTO titles (id, slug, title, tagline, kind, year, runtime, maturity, language, synopsis,
                        poster, backdrop, featured, rating, badge, status, sort_order, published_at)
    VALUES (@id, @slug, @title, @tagline, @kind, @year, @runtime, @maturity, @language, @synopsis,
            @poster, @backdrop, @featured, @rating, @badge, 'published', @sortOrder, @publishedAt)
    ON CONFLICT(slug) DO UPDATE SET
      title = excluded.title, tagline = excluded.tagline, kind = excluded.kind, year = excluded.year,
      runtime = excluded.runtime, maturity = excluded.maturity, language = excluded.language,
      synopsis = excluded.synopsis, poster = excluded.poster, backdrop = excluded.backdrop,
      featured = excluded.featured, rating = excluded.rating, badge = excluded.badge,
      sort_order = excluded.sort_order, status = 'published', updated_at = datetime('now')
  `);
  const insertGenre = db.prepare("INSERT INTO genres (slug, name) VALUES (?, ?) ON CONFLICT(slug) DO NOTHING");
  const genreId = db.prepare("SELECT id FROM genres WHERE slug = ?");
  const insertTitleGenre = db.prepare("INSERT OR IGNORE INTO title_genres (title_id, genre_id, position) VALUES (?, ?, ?)");
  const insertCollection = db.prepare("INSERT INTO collections (slug, name) VALUES (?, ?) ON CONFLICT(slug) DO NOTHING");
  const collectionId = db.prepare("SELECT id FROM collections WHERE slug = ?");
  const insertTitleCollection = db.prepare("INSERT OR IGNORE INTO title_collections (title_id, collection_id, position) VALUES (?, ?, ?)");
  const insertSeason = db.prepare("INSERT INTO seasons (id, title_id, number, name) VALUES (?, ?, ?, ?) ON CONFLICT(id) DO UPDATE SET name = excluded.name");
  const insertEpisode = db.prepare(`
    INSERT INTO episodes (id, season_id, number, title, synopsis, runtime) VALUES (?, ?, ?, ?, ?, ?)
    ON CONFLICT(id) DO UPDATE SET title = excluded.title, synopsis = excluded.synopsis, runtime = excluded.runtime
  `);
  const insertPerson = db.prepare("INSERT INTO people (name) VALUES (?) ON CONFLICT(name) DO NOTHING");
  const personId = db.prepare("SELECT id FROM people WHERE name = ?");
  const insertCredit = db.prepare("INSERT OR IGNORE INTO credits (title_id, person_id, role, position) VALUES (?, ?, 'cast', ?)");
  const insertStream = db.prepare(`
    INSERT INTO streams (id, title_id, episode_id, label, kind, quality, url, priority, enabled)
    VALUES (@id, @titleId, @episodeId, @label, @kind, @quality, @url, @priority, 1)
    ON CONFLICT(id) DO UPDATE SET label = excluded.label, kind = excluded.kind, quality = excluded.quality,
      url = excluded.url, priority = excluded.priority, enabled = 1
  `);
  const insertRow = db.prepare(`
    INSERT INTO rows (id, key, eyebrow, title, description, source_type, source_value, ranked, position, visible)
    VALUES (@id, @key, @eyebrow, @title, @description, @sourceType, @sourceValue, @ranked, @position, 1)
    ON CONFLICT(key) DO UPDATE SET eyebrow = excluded.eyebrow, title = excluded.title,
      description = excluded.description, source_type = excluded.source_type,
      source_value = excluded.source_value, ranked = excluded.ranked, position = excluded.position
  `);
  const insertSetting = db.prepare("INSERT INTO settings (key, value) VALUES (?, ?) ON CONFLICT(key) DO UPDATE SET value = excluded.value");

  const run = db.transaction(() => {
    const idBySlug = new Map(catalog.map((title) => [title.slug, title.id]));
    catalog.forEach((title, index) => {
      insertTitle.run({
        id: title.id,
        slug: title.slug,
        title: title.title,
        tagline: title.tagline,
        kind: title.kind,
        year: title.year,
        runtime: title.runtime,
        maturity: title.maturity,
        language: title.language,
        synopsis: title.synopsis,
        poster: title.poster,
        backdrop: title.backdrop,
        featured: title.featured ? 1 : 0,
        rating: title.rating,
        badge: title.badge ?? null,
        sortOrder: index,
        publishedAt: now,
      });
      summary.titles += 1;

      title.genres.forEach((genre, position) => {
        insertGenre.run(slugify(genre), genre);
        const row = genreId.get(slugify(genre)) as { id: number } | undefined;
        if (row) insertTitleGenre.run(title.id, row.id, position);
        summary.genres += 0;
      });

      title.collection.forEach((collection, position) => {
        insertCollection.run(collection, collectionName(collection));
        const row = collectionId.get(collection) as { id: number } | undefined;
        if (row) insertTitleCollection.run(title.id, row.id, position);
      });

      (credits[title.slug] ?? []).forEach((name, position) => {
        insertPerson.run(name);
        const row = personId.get(name) as { id: number } | undefined;
        if (row) insertCredit.run(title.id, row.id, position);
      });

      if (title.kind === "movie") {
        insertStream.run({
          id: title.id, titleId: title.id, episodeId: null, label: "Sample clip",
          kind: "sample", quality: "720p", url: DEMO_MP4, priority: 0,
        });
        insertStream.run({
          id: `${title.id}-youtube`, titleId: title.id, episodeId: null, label: "YouTube demo",
          kind: "youtube", quality: "1080p", url: `https://www.youtube-nocookie.com/embed/aqz-KE-bpKQ`, priority: 10,
        });
        summary.streams += 2;
      }
    });

    for (const [slug, seasons] of Object.entries(episodes)) {
      const titleId = idBySlug.get(slug);
      if (!titleId) continue;
      seasons.forEach((season) => {
        const seasonId = `${slug}-s${season.number}`;
        insertSeason.run(seasonId, titleId, season.number, season.name);
        summary.seasons += 1;
        season.episodes.forEach((episode) => {
          insertEpisode.run(episode.id, seasonId, episode.number, episode.title, episode.synopsis, episode.runtime);
          insertStream.run({
            id: `${episode.id}-sample`, titleId, episodeId: episode.id, label: "Sample clip",
            kind: "sample", quality: "720p", url: DEMO_MP4, priority: 0,
          });
          summary.episodes += 1;
          summary.streams += 1;
        });
      });
    }

    [
      { id: "row-trending", key: "trending", eyebrow: "WHAT'S MAKING WAVES", title: "Trending this week", description: "A little of everything, and a lot to discover.", sourceType: "collection", sourceValue: "trending", ranked: 1, position: 10 },
      { id: "row-movies", key: "movies", eyebrow: "MADE FOR MOVIE NIGHTS", title: "Featured films", description: "Fictional titles created for this design prototype.", sourceType: "kind", sourceValue: "movie", ranked: 0, position: 20 },
      { id: "row-series", key: "series", eyebrow: "ONE MORE EPISODE", title: "Series worth starting", description: "Open a series to explore seasons and episodes.", sourceType: "kind", sourceValue: "series", ranked: 0, position: 30 },
      { id: "row-collections", key: "collections", eyebrow: "EXPLORE SOMETHING DIFFERENT", title: "Off the beaten path", description: "", sourceType: "collection", sourceValue: "discovery", ranked: 0, position: 40 },
    ].forEach((row) => { insertRow.run(row); summary.rows += 1; });

    [["site_name", "BharatFlix"], ["tagline", "Stories worth staying for."]].forEach(([key, value]) => {
      insertSetting.run(key, value);
      summary.settings += 1;
    });

    summary.genres = (db.prepare("SELECT COUNT(*) AS n FROM genres").get() as { n: number }).n;
    summary.collections = (db.prepare("SELECT COUNT(*) AS n FROM collections").get() as { n: number }).n;
    summary.people = (db.prepare("SELECT COUNT(*) AS n FROM people").get() as { n: number }).n;
    summary.credits = (db.prepare("SELECT COUNT(*) AS n FROM credits").get() as { n: number }).n;
  });

  run();
  ensureOperator(db);
  return summary;
}

/**
 * Guarantees at least one studio operator exists. The first sign-in locally is
 * admin@bharatflix.local / admin123 (override with ADMIN_EMAIL / ADMIN_PASSWORD
 * before the first run, and change it from the Users screen afterwards).
 */
export function ensureOperator(db: Database.Database): boolean {
  const existing = db.prepare("SELECT COUNT(*) AS n FROM users WHERE role = 'admin'").get() as { n: number };
  if (existing.n > 0) return false;
  const email = process.env.ADMIN_EMAIL ?? "admin@bharatflix.local";
  const password = process.env.ADMIN_PASSWORD ?? "admin123";
  db.prepare(
    "INSERT OR IGNORE INTO users (id, email, name, password_hash, role) VALUES (?, ?, ?, ?, 'admin')",
  ).run(`op-${Date.now().toString(36)}`, email, "Studio Admin", hashPassword(password));
  return true;
}
