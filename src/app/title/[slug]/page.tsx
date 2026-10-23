import type { Metadata } from "next";
import { CatalogProvider } from "@/lib/catalog-context";
import { TitleRouteClient } from "@/components/details/title-route-client";
import { getPublishedCatalog } from "@/lib/db/queries";

export const dynamic = "force-dynamic";

export function generateStaticParams() {
  return getPublishedCatalog().titles.map((title) => ({ slug: title.slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const title = getPublishedCatalog().titles.find((item) => item.slug === slug);
  return title ? { title: `${title.title} | BharatFlix`, description: title.synopsis } : { title: "Title not found | BharatFlix" };
}

export default async function TitlePage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  return <CatalogProvider snapshot={getPublishedCatalog()}><TitleRouteClient slug={slug}/></CatalogProvider>;
}
