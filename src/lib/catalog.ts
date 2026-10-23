import catalogEntries from "@/data/catalog.json";
import episodeData from "@/data/episodes.json";
import creditsData from "@/data/credits.json";
import type { CatalogSnapshot, MediaTitle, Season } from "@/types/media";

/**
 * Catalogue selectors.
 *
 * The viewer catalogue now lives in SQLite (see src/lib/db) and is read on the
 * server, then handed to client components through CatalogProvider. The JSON
 * fixture below is kept as the seed source and as the fallback snapshot for any
 * component rendered outside a provider.
 */

export const seedTitles: MediaTitle[] = catalogEntries as MediaTitle[];

export const SEED_SNAPSHOT: CatalogSnapshot = {
  titles: seedTitles,
  seasonsBySlug: episodeData as Record<string, Season[]>,
  castBySlug: creditsData as Record<string, string[]>,
};

export function getSeasons(snapshot: CatalogSnapshot, slug: string): Season[] {
  return snapshot.seasonsBySlug[slug] ?? [];
}

export function getCast(snapshot: CatalogSnapshot, slug: string): string[] {
  return snapshot.castBySlug[slug] ?? [];
}

/** A title is playable while the seed fixture carries a sample clip for it. */
export function hasPlayableMedia(snapshot: CatalogSnapshot, slug: string): boolean {
  return snapshot.titles.some((title) => title.slug === slug);
}

export function searchTitles(titles: MediaTitle[], query: string): MediaTitle[] {
  const term = query.trim().toLocaleLowerCase();
  if (!term) return [];
  return titles.filter((title) =>
    [title.title, title.tagline, title.synopsis, title.language, ...title.genres]
      .some((value) => value.toLocaleLowerCase().includes(term)),
  );
}
