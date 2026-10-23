import type { MediaTitle, MediaKind } from "@/types/media";

export type CatalogueSort = "featured" | "newest" | "oldest" | "rating" | "title";
export type CatalogueFilters = {
  search?: string;
  kind?: MediaKind | "all";
  genre?: string;
  language?: string;
  year?: string;
  sort?: CatalogueSort;
};

/** Pure filtering core — the Explore screen uses the same data as the homepage. */
export function filterCatalogue(items: MediaTitle[], filters: CatalogueFilters): MediaTitle[] {
  const term = (filters.search ?? "").trim().toLocaleLowerCase();
  const filtered = items.filter((item) => {
    if (filters.kind && filters.kind !== "all" && item.kind !== filters.kind) return false;
    if (filters.genre && filters.genre !== "all" && !item.genres.includes(filters.genre)) return false;
    if (filters.language && filters.language !== "all" && item.language !== filters.language) return false;
    if (filters.year && filters.year !== "all" && String(item.year) !== filters.year) return false;
    if (!term) return true;
    return [item.title, item.tagline, item.synopsis, item.language, String(item.year), ...item.genres]
      .some((value) => value.toLocaleLowerCase().includes(term));
  });
  switch (filters.sort ?? "featured") {
    case "newest": return filtered.sort((a, b) => b.year - a.year || a.title.localeCompare(b.title));
    case "oldest": return filtered.sort((a, b) => a.year - b.year || a.title.localeCompare(b.title));
    case "rating": return filtered.sort((a, b) => b.rating - a.rating || a.title.localeCompare(b.title));
    case "title": return filtered.sort((a, b) => a.title.localeCompare(b.title));
    default: return filtered.sort((a, b) => Number(b.featured) - Number(a.featured) || b.rating - a.rating);
  }
}

export function getFilterOptions(items: MediaTitle[]) {
  return {
    genres: [...new Set(items.flatMap((item) => item.genres))].sort(),
    languages: [...new Set(items.map((item) => item.language))].sort(),
    years: [...new Set(items.map((item) => String(item.year)))].sort((a, b) => Number(b) - Number(a)),
  };
}

export function findRelatedTitles(items: MediaTitle[], current: MediaTitle, limit = 5): MediaTitle[] {
  return items.filter((item) => item.id !== current.id)
    .sort((a, b) => {
      const score = (item: MediaTitle) => item.genres.filter((genre) => current.genres.includes(genre)).length * 5
        + Number(item.language === current.language) * 2
        + Number(item.kind === current.kind)
        + item.rating / 10;
      return score(b) - score(a) || a.title.localeCompare(b.title);
    }).slice(0, limit);
}
