import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { getPublishedCatalog } from "@/lib/db/queries";
import { getWatchTarget, listWatchTargets } from "@/lib/demo-media";
import { WatchExperience } from "@/components/player/watch-experience";

export const dynamic = "force-dynamic";

export function generateStaticParams() {
  return listWatchTargets(getPublishedCatalog()).map((target) => ({ id: target.id }));
}

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }): Promise<Metadata> {
  const { id } = await params;
  const target = getWatchTarget(getPublishedCatalog(), id);
  return { title: target ? `Watch ${target.episode?.title ?? target.title.title} | BharatFlix` : "Player unavailable | BharatFlix", robots: { index: false } };
}

export default async function WatchPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const target = getWatchTarget(getPublishedCatalog(), id);
  if (!target) notFound();
  return <WatchExperience target={target} />;
}
