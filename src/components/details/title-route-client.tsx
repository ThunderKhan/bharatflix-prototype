"use client";
import Link from "next/link";
import { TitleDetail } from "@/components/details/title-detail";
import { getCast, getSeasons, hasPlayableMedia } from "@/lib/catalog";
import { useCatalog } from "@/lib/catalog-context";
import { findRelatedTitles } from "@/lib/discovery";
import { getFirstWatchId } from "@/lib/demo-media";
export function TitleRouteClient({ slug }: { slug:string }) {
  const catalog = useCatalog();
  const published = catalog.titles;
  const title = published.find((item) => item.slug === slug);
  if (!title) return <main className="demo-missing"><h1>Title not available</h1><p>This title may be a draft or removed from the demo catalogue.</p><Link className="button-primary" href="/explore">Browse available titles</Link></main>;
  const cast = getCast(catalog, slug);
  return <TitleDetail
    title={title}
    seasons={getSeasons(catalog, slug)}
    cast={cast.length ? cast : ["Fictional demo performer", "Fictional supporting performer"]}
    related={findRelatedTitles(published, title)}
    watchId={hasPlayableMedia(catalog, slug) ? getFirstWatchId(catalog, title) : undefined}
  />;
}
