import entries from "@/data/catalog.json";
import type { MediaKind, MediaTitle } from "@/types/media";

export const titles: MediaTitle[] = entries as MediaTitle[];

export function getFeaturedTitles(): MediaTitle[] {
  return titles.filter((title) => title.featured);
}

export function getCollection(collection: string): MediaTitle[] {
  return titles.filter((title) => title.collection.includes(collection));
}

export function getTitlesByKind(kind: MediaKind): MediaTitle[] {
  return titles.filter((title) => title.kind === kind);
}

export function searchTitles(query: string): MediaTitle[] {
  const term = query.trim().toLocaleLowerCase();
  if (!term) return [];
  return titles.filter((title) =>
    [title.title, title.tagline, title.synopsis, title.language, ...title.genres]
      .some((value) => value.toLocaleLowerCase().includes(term)),
  );
}

import episodeData from "@/data/episodes.json";
import creditsData from "@/data/credits.json";
import type { Season } from "@/types/media";

const episodes = episodeData as Record<string, Season[]>;
const credits = creditsData as Record<string, string[]>;

export function getTitleBySlug(slug: string): MediaTitle | undefined {
  return titles.find((item) => item.slug === slug);
}

export function getSeasonsForTitle(slug: string): Season[] {
  return episodes[slug] ?? [];
}

export function getCastForTitle(slug: string): string[] {
  return credits[slug] ?? [];
}
