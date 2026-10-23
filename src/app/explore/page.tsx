import type { Metadata } from "next";
import { ExploreExperience } from "@/components/discovery/explore-experience";
import type { MediaKind } from "@/types/media";

export const metadata: Metadata = { title: "Explore | BharatFlix", description: "Search and filter the fictional BharatFlix demo catalogue." };

export default async function ExplorePage({ searchParams }: { searchParams: Promise<{ kind?: string }> }) {
  const { kind } = await searchParams;
  const selectedKind: MediaKind | "all" = kind === "movie" || kind === "series" ? kind : "all";
  return <ExploreExperience key={selectedKind} initialKind={selectedKind}/>;
}
