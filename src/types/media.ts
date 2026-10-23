export type MediaKind = "movie" | "series";

export interface MediaTitle {
  id: string;
  slug: string;
  title: string;
  tagline: string;
  kind: MediaKind;
  year: number;
  runtime: string;
  maturity: string;
  language: string;
  genres: string[];
  synopsis: string;
  poster: string;
  backdrop: string;
  featured: boolean;
  collection: string[];
  rating: number;
  badge?: string;
  /** Open-film artwork and metadata are sourced from attributed Creative Commons releases. */
  mediaOrigin?: "open-film";
  imageSourceUrl?: string;
  imageCredit?: string;
  /** Photo-based concept artwork is illustrative, not an actual film poster. */
  artworkDescription?: string;
  artworkChanges?: string;
  artworkLicenseUrl?: string;
  filmSourceUrl?: string;
  /** Official or rights-authorized embeddable YouTube video ID, never a scraped player URL. */
  youtubeId?: string;
}

/** Fictional metadata for the Phase 2 series browser. Video sources arrive in Phase 3. */
export interface Episode {
  id: string;
  number: number;
  title: string;
  synopsis: string;
  runtime: string;
}

export interface Season {
  number: number;
  name: string;
  episodes: Episode[];
}

/**
 * Everything a viewer page needs, assembled server-side from the catalogue
 * database. `seasonsBySlug` / `castBySlug` only carry keys for titles that
 * actually have seasons or cast.
 */
export interface CatalogSnapshot {
  titles: MediaTitle[];
  seasonsBySlug: Record<string, Season[]>;
  castBySlug: Record<string, string[]>;
}

/** A homepage carousel row as configured in the CMS. */
export interface HomeRow {
  id: string;
  key: string;
  eyebrow: string;
  title: string;
  description: string;
  sourceType: "collection" | "kind" | "manual";
  sourceValue: string;
  ranked: boolean;
  position: number;
}
