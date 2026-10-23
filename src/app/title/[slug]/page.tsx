import type { Metadata } from "next";
import { TitleRouteClient } from "@/components/details/title-route-client";
import { getTitleBySlug, titles } from "@/lib/catalog";

export function generateStaticParams() {
  return titles.map((title) => ({ slug: title.slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const title = getTitleBySlug(slug);
  return title ? { title: `${title.title} | BharatFlix`, description: title.synopsis } : { title: "Title not found | BharatFlix" };
}

export default async function TitlePage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  return <TitleRouteClient slug={slug}/>;
}
