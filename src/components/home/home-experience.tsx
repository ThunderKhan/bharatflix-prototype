"use client";

import { useCallback, useEffect, useState } from "react";
import { ArrowRight, Film, MonitorPlay, Sparkles } from "lucide-react";
import Link from "next/link";
import { useDemoCMS } from "@/lib/demo-cms";
import { useDemoLibrary } from "@/lib/demo-library";
import { getWatchTarget } from "@/lib/demo-media";
import type { MediaTitle } from "@/types/media";
import { FeaturedHero } from "./featured-hero";
import { PreviewDialog } from "./preview-dialog";
import { SearchOverlay } from "./search-overlay";
import { SiteHeader } from "./site-header";
import { TitleRow } from "./title-row";

export function HomeExperience() {
  const { published: catalogue } = useDemoCMS();
  const library = useDemoLibrary();
  const continueTitles = library.history.map((entry) => getWatchTarget(entry.id)?.title).filter((item): item is MediaTitle => Boolean(item)).filter((item, index, array) => array.findIndex((other) => other.slug === item.slug) === index);
  const [searchOpen, setSearchOpen] = useState(false);
  const [selected, setSelected] = useState<MediaTitle | null>(null);
  const openSearch = useCallback(() => setSearchOpen(true), []);
  const closeSearch = useCallback(() => setSearchOpen(false), []);
  const closePreview = useCallback(() => setSelected(null), []);
  const getCollection = (collection: string) => catalogue.filter((title) => title.collection.includes(collection));
  const getTitlesByKind = (kind: "movie" | "series") => catalogue.filter((title) => title.kind === kind);
  const openTitle = useCallback((title: MediaTitle) => { setSearchOpen(false); setSelected(title); }, []);

  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === "k") { event.preventDefault(); openSearch(); }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [openSearch]);

  return <div id="top" className="site-shell">
    <SiteHeader onOpenSearch={openSearch}/>
    <main>
      <FeaturedHero titles={catalogue.filter((title) => title.featured)} onSelect={openTitle}/>
      <div className="home-main-content">
        <div className="editorial-divider"><span><Sparkles size={16}/> FEATURED OPEN CINEMA & ORIGINAL CONCEPTS</span><span>DISCOVER. WATCH. REPEAT.</span></div>
        <section className="language-curation"><div><span className="section-eyebrow">DISCOVER INDIA</span><h2>Stories in your language</h2></div><div>{["Hindi","Tamil","Telugu","Malayalam","English"].map((language)=><Link href={`/explore?language=${encodeURIComponent(language)}`} key={language}>{language} <ArrowRight size={14}/></Link>)}</div></section>
        {continueTitles.length > 0 && <TitleRow id="continue" eyebrow="BACK FOR MORE" title="Continue watching" description="Pick up your sample playback from My Space." titles={continueTitles} onSelect={openTitle}/> }
        <TitleRow id="open-cinema" eyebrow="REAL FILMS. REAL CREDITS." title="Open cinema spotlight" description="Blender open films with authentic posters, film details and clearly credited Creative Commons artwork." titles={getCollection("open-cinema")} onSelect={openTitle}/>
        <TitleRow id="trending" eyebrow="WHAT'S MAKING WAVES" title="Trending this week" description="A little of everything, and a lot to discover." titles={getCollection("trending")} onSelect={openTitle} ranked />
        <section className="discovery-banner" aria-label="BharatFlix content discovery"><div className="discovery-icon"><MonitorPlay size={32}/></div><div><span className="section-eyebrow">A NEW WAY TO WATCH</span><h2>Stories don&apos;t have borders.</h2><p>Discover films, series and voices across genres—curated for a better viewing experience.</p></div><Link href="/explore">Explore the catalogue <ArrowRight size={18}/></Link></section>
        <TitleRow id="movies" eyebrow="MADE FOR MOVIE NIGHTS" title="Featured films" description="Real open films alongside fictional design concepts." titles={getTitlesByKind("movie")} onSelect={openTitle}/>
        <TitleRow id="series" eyebrow="ONE MORE EPISODE" title="Series worth starting" description="Open a series to explore seasons and episodes." titles={getTitlesByKind("series")} onSelect={openTitle}/>
        <TitleRow id="collections" eyebrow="EXPLORE SOMETHING DIFFERENT" title="Off the beaten path" titles={getCollection("discovery")} onSelect={openTitle}/>
        <section className="next-phase-section"><div className="next-phase-icon"><Film size={24}/></div><div><span className="section-eyebrow">THIS IS JUST THE BEGINNING</span><h2>One platform. Infinite possibilities.</h2><p>Explore the new catalogue and title pages. Watch sample video, save titles to My Space, and manage the fictional catalogue in Operator Studio.</p></div><span className="phase-label">ALL 05 PHASES</span></section>
      </div>
    </main>
    <footer className="site-footer"><div className="footer-grid"><div><span className="footer-brand">bharat<span>flix</span>.</span><p>Stories worth staying for.</p></div><div><strong>EXPLORE</strong><a href="#trending">Trending</a><a href="#movies">Films</a><a href="#series">Series</a></div><div><strong>DISCOVER</strong><a href="#collections">Collections</a><button type="button" onClick={openSearch}>Search titles</button></div><div><strong>PROTOTYPE</strong><p>VSPH concept demonstration with credited Blender open films and fictional showcase titles.</p></div></div><div className="footer-bottom"><span>© 2026 BharatFlix · Prototype concept</span><span>Open-film artwork credits on title pages · No commercial movie sources hosted</span></div></footer>
    {searchOpen && <SearchOverlay onClose={closeSearch} onSelect={openTitle}/>}
    {selected && <PreviewDialog title={selected} onClose={closePreview}/>}
  </div>;
}
