import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { getWatchTarget, listWatchTargets } from "@/lib/demo-media";
import { WatchExperience } from "@/components/player/watch-experience";

export function generateStaticParams() {
  return listWatchTargets().map((target) => ({ id: target.id }));
}

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }): Promise<Metadata> {
  const { id } = await params;
  const target = getWatchTarget(id);
  return { title: target ? `Watch ${target.episode?.title ?? target.title.title} | BharatFlix` : "Player unavailable | BharatFlix", robots: { index: false } };
}

export default async function WatchPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const target = getWatchTarget(id);
  if (!target) notFound();
  return <WatchExperience target={target} />;
}
