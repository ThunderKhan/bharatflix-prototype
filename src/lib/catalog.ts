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
