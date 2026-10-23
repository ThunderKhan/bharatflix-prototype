import type Database from "better-sqlite3";
import type { CatalogSnapshot, MediaTitle, Season } from "@/types/media";

/**
 * Pure SQLite → CatalogSnapshot mapping.
 *
 * Kept free of React so the CLI (src/lib/db/cli.ts) and the app share exactly
 * the same assembly logic; queries.ts adds per-request caching on top.
 */

export type CatalogStatus = "published" | "all";

type TitleRow = {
  id: string;
  slug: string;
  title: string;
  tagline: string;
  kind: MediaTitle["kind"];
  year: number;
  runtime: string;
  maturity: string;
  language: string;
  synopsis: string;
  poster: string;
  backdrop: string;
  featured: number;
  rating: number;
  badge: string | null;
  sort_order: number;
};

function mapTitle(row: TitleRow, genres: string[], collections: string[]): MediaTitle {
  return {
    id: row.id,
    slug: row.slug,
    title: row.title,
    tagline: row.tagline,
    kind: row.kind,
    year: row.year,
    runtime: row.runtime,
    maturity: row.maturity,
    language: row.language,
    synopsis: row.synopsis,
    poster: row.poster,
    backdrop: row.backdrop,
    featured: row.featured === 1,
    genres,
    collection: collections,
    rating: row.rating,
    ...(row.badge ? { badge: row.badge } : {}),
  };
}

export function buildSnapshot(db: Database.Database, status: CatalogStatus): CatalogSnapshot {
  const rows = db
    .prepare(
      `SELECT id, slug, title, tagline, kind, year, runtime, maturity, language, synopsis, poster, backdrop,
              featured, rating, badge, sort_order
         FROM titles
        WHERE status = ? OR (? = 'all')
        ORDER BY sort_order, year DESC, title`,
    )
    .all(status, status) as TitleRow[];

  const genresByTitle = new Map<string, string[]>();
  for (const row of db
    .prepare(
      `SELECT tg.title_id AS titleId, g.name AS name
         FROM title_genres tg JOIN genres g ON g.id = tg.genre_id
        ORDER BY tg.position, g.name`,
    )
    .all() as { titleId: string; name: string }[]) {
    const list = genresByTitle.get(row.titleId) ?? [];
    list.push(row.name);
    genresByTitle.set(row.titleId, list);
  }

  const collectionsByTitle = new Map<string, string[]>();
  for (const row of db
    .prepare(
      `SELECT tc.title_id AS titleId, c.slug AS slug
         FROM title_collections tc JOIN collections c ON c.id = tc.collection_id
        ORDER BY tc.position, c.slug`,
    )
    .all() as { titleId: string; slug: string }[]) {
    const list = collectionsByTitle.get(row.titleId) ?? [];
    list.push(row.slug);
    collectionsByTitle.set(row.titleId, list);
  }

  const titles = rows.map((row) => mapTitle(row, genresByTitle.get(row.id) ?? [], collectionsByTitle.get(row.id) ?? []));

  const seasonsBySlug: Record<string, Season[]> = {};
  const seasonRows = db
    .prepare(
      `SELECT t.slug AS slug, s.number AS number, s.name AS name,
              e.id AS episodeId, e.number AS episodeNumber, e.title AS episodeTitle,
              e.synopsis AS episodeSynopsis, e.runtime AS episodeRuntime
         FROM seasons s
         JOIN titles t ON t.id = s.title_id
         LEFT JOIN episodes e ON e.season_id = s.id
        WHERE t.status = ? OR (? = 'all')
        ORDER BY s.number, e.number`,
    )
    .all(status, status) as {
    slug: string; number: number; name: string;
    episodeId: string | null; episodeNumber: number | null; episodeTitle: string | null;
    episodeSynopsis: string | null; episodeRuntime: string | null;
  }[];

  const seasonIndex = new Map<string, Season>();
  for (const row of seasonRows) {
    const key = `${row.slug}:${row.number}`;
    if (!seasonIndex.has(key)) {
      const list = seasonsBySlug[row.slug] ?? [];
      const season: Season = { number: row.number, name: row.name, episodes: [] };
      list.push(season);
      seasonsBySlug[row.slug] = list;
      seasonIndex.set(key, season);
    }
    if (row.episodeId) {
      seasonIndex.get(key)!.episodes.push({
        id: row.episodeId,
        number: row.episodeNumber!,
        title: row.episodeTitle!,
        synopsis: row.episodeSynopsis ?? "",
        runtime: row.episodeRuntime ?? "",
      });
    }
  }

  const castBySlug: Record<string, string[]> = {};
  for (const row of db
    .prepare(
      `SELECT t.slug AS slug, p.name AS name
         FROM credits c
         JOIN people p ON p.id = c.person_id
         JOIN titles t ON t.id = c.title_id
        WHERE t.status = ? OR (? = 'all')
        ORDER BY c.position, p.name`,
    )
    .all(status, status) as { slug: string; name: string }[]) {
    const list = castBySlug[row.slug] ?? [];
    list.push(row.name);
    castBySlug[row.slug] = list;
  }

  return { titles, seasonsBySlug, castBySlug };
}
