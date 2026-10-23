"use client";
import Link from "next/link";
import { TitleDetail } from "@/components/details/title-detail";
import { getSeasonsForTitle, getCastForTitle } from "@/lib/catalog";
import { findRelatedTitles } from "@/lib/discovery";
import { useDemoCMS } from "@/lib/demo-cms";
export function TitleRouteClient({ slug }: { slug:string }) {
  const { published } = useDemoCMS();
  const title = published.find((item) => item.slug === slug);
  if (!title) return <main className="demo-missing"><h1>Title not available</h1><p>This title may be a draft or removed from the demo catalogue.</p><Link className="button-primary" href="/explore">Browse available titles</Link></main>;
  const cast = getCastForTitle(slug);
  return <TitleDetail title={title} seasons={getSeasonsForTitle(slug)} cast={cast.length ? cast : ["Fictional demo performer", "Fictional supporting performer"]} related={findRelatedTitles(published,title)}/>;
}
