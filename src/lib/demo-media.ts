import type { CatalogSnapshot, Episode, MediaTitle } from "@/types/media";

/** Only externally hosted, rights-cleared sample clips. Fictional titles do not represent these videos. */
export const DEMO_MP4 = "https://interactive-examples.mdn.mozilla.net/media/cc0-videos/flower.mp4";
/** True films, not embedded video platforms. Sources are freely viewable Blender open films.
 * The other titles use the explicitly labelled CC0 technical sample, never misrepresented
 * as the fictional movie or the full Blender film.
 */
export const LICENSED_FILM_MP4: Readonly<Record<string, string>> = {
  "big-buck-bunny": "https://storage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4",
  "elephants-dream": "https://storage.googleapis.com/gtv-videos-bucket/sample/ElephantsDream.mp4",
};

export function resolvePlaybackSource(target: WatchTarget): { url: string; fullFilm: boolean; credit: string } {
  const filmUrl = target.title.kind === "movie" ? LICENSED_FILM_MP4[target.title.slug] : undefined;
  if (filmUrl) return {
    url: filmUrl,
    fullFilm: true,
    credit: `${target.title.title} — Blender Foundation open film; see the film detail page for license and artwork attribution.`,
  };
  return {
    url: DEMO_MP4,
    fullFilm: false,
    credit: "CC0 flower sample footage (MDN). This is a technical player demo, not the selected title.",
  };
}

export type WatchTarget = {
  id: string;
  title: MediaTitle;
  episode?: Episode;
  seasonNumber?: number;
  nextId?: string;
  previousId?: string;
};

/**
 * Watch targets (a film, or one episode of a series) derived from a catalogue
 * snapshot. Pure functions: the caller decides whether the snapshot came from
 * the database or the JSON fixture.
 */
export function listWatchTargets(snapshot: CatalogSnapshot): WatchTarget[] {
  return snapshot.titles.flatMap((title) => {
    if (title.kind === "movie") return [{ id: title.slug, title }];
    const flattened = (snapshot.seasonsBySlug[title.slug] ?? []).flatMap((season) => season.episodes.map((episode) => ({
      id: episode.id, title, episode, seasonNumber: season.number,
    })));
    return flattened.map((entry, index) => ({
      ...entry, previousId: flattened[index - 1]?.id, nextId: flattened[index + 1]?.id,
    }));
  });
}

export function getWatchTarget(snapshot: CatalogSnapshot, id: string): WatchTarget | undefined {
  return listWatchTargets(snapshot).find((entry) => entry.id === id);
}

export function getFirstWatchId(snapshot: CatalogSnapshot, title: MediaTitle): string {
  return title.kind === "series" ? (snapshot.seasonsBySlug[title.slug]?.[0]?.episodes[0]?.id ?? title.slug) : title.slug;
}
