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
}
