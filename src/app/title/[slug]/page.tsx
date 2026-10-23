import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { TitleDetail } from "@/components/details/title-detail";
import { getCastForTitle, getSeasonsForTitle, getTitleBySlug, titles } from "@/lib/catalog";
import { findRelatedTitles } from "@/lib/discovery";

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
  const title = getTitleBySlug(slug);
  if (!title) notFound();
  return <TitleDetail title={title} seasons={getSeasonsForTitle(slug)} cast={getCastForTitle(slug)} related={findRelatedTitles(titles,title)}/>;
}
