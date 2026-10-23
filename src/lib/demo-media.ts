import { titles, getSeasonsForTitle } from "@/lib/catalog";
import type { MediaTitle, Episode } from "@/types/media";

/** Only externally hosted, rights-cleared sample clips. Fictional titles do not represent these videos. */
export const DEMO_MP4 = "https://interactive-examples.mdn.mozilla.net/media/cc0-videos/flower.mp4";
export const DEMO_YOUTUBE_ID = "aqz-KE-bpKQ"; // Big Buck Bunny, Blender Foundation, CC BY 3.0

export type WatchTarget = {
  id: string;
  title: MediaTitle;
  episode?: Episode;
  seasonNumber?: number;
  nextId?: string;
  previousId?: string;
};

export function listWatchTargets(): WatchTarget[] {
  return titles.flatMap((title) => {
    if (title.kind === "movie") return [{ id: title.slug, title }];
    const flattened = getSeasonsForTitle(title.slug).flatMap((season) => season.episodes.map((episode) => ({
      id: episode.id, title, episode, seasonNumber: season.number,
    })));
    return flattened.map((entry, index) => ({
      ...entry, previousId: flattened[index - 1]?.id, nextId: flattened[index + 1]?.id,
    }));
  });
}

export function getWatchTarget(id: string): WatchTarget | undefined {
  return listWatchTargets().find((entry) => entry.id === id);
}

export function getFirstWatchId(title: MediaTitle): string {
  return title.kind === "series" ? getSeasonsForTitle(title.slug)[0]?.episodes[0]?.id ?? title.slug : title.slug;
}
