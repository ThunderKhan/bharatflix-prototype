import type { Metadata } from "next";
import { CatalogProvider } from "@/lib/catalog-context";
import { ExploreExperience } from "@/components/discovery/explore-experience";
import { getPublishedCatalog } from "@/lib/db/queries";
import type { MediaKind } from "@/types/media";

export const metadata: Metadata = { title: "Explore | BharatFlix", description: "Search and filter the fictional BharatFlix demo catalogue." };

export const dynamic = "force-dynamic";

export default async function ExplorePage({ searchParams }: { searchParams: Promise<{ kind?: string; language?: string }> }) {
  const { kind, language } = await searchParams;
  const selectedKind: MediaKind | "all" = kind === "movie" || kind === "series" ? kind : "all";
  return <CatalogProvider snapshot={getPublishedCatalog()}>
    <ExploreExperience key={`${selectedKind}-${language ?? "all"}`} initialKind={selectedKind} initialLanguage={language ?? "all"}/>
  </CatalogProvider>;
}
