"use client";

import { useCallback, useEffect, useState } from "react";
import { ArrowRight, Film, MonitorPlay, Sparkles } from "lucide-react";
import { getCollection, getFeaturedTitles, getTitlesByKind } from "@/lib/catalog";
import type { MediaTitle } from "@/types/media";
import { FeaturedHero } from "./featured-hero";
import { PreviewDialog } from "./preview-dialog";
import { SearchOverlay } from "./search-overlay";
import { SiteHeader } from "./site-header";
import { TitleRow } from "./title-row";

export function HomeExperience() {
  const [searchOpen, setSearchOpen] = useState(false);
  const [selected, setSelected] = useState<MediaTitle | null>(null);
  const openSearch = useCallback(() => setSearchOpen(true), []);
  const closeSearch = useCallback(() => setSearchOpen(false), []);
  const closePreview = useCallback(() => setSelected(null), []);
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
      <FeaturedHero titles={getFeaturedTitles()} onSelect={openTitle}/>
      <div className="home-main-content">
        <div className="editorial-divider"><span><Sparkles size={16}/> CURATED FOR THE BIG SCREEN</span><span>EVERY STORY DESERVES A SPOTLIGHT</span></div>
        <TitleRow id="trending" eyebrow="WHAT'S MAKING WAVES" title="Trending this week" description="A little of everything, and a lot to discover." titles={getCollection("trending")} onSelect={openTitle} ranked />
        <section className="discovery-banner" aria-label="BharatFlix content discovery"><div className="discovery-icon"><MonitorPlay size={32}/></div><div><span className="section-eyebrow">A NEW WAY TO WATCH</span><h2>Stories don&apos;t have borders.</h2><p>Discover films, series and voices across genres—curated for a better viewing experience.</p></div><button type="button" onClick={openSearch}>Explore the catalogue <ArrowRight size={18}/></button></section>
        <TitleRow id="movies" eyebrow="MADE FOR MOVIE NIGHTS" title="Featured films" description="Fictional titles created for this design prototype." titles={getTitlesByKind("movie")} onSelect={openTitle}/>
        <TitleRow id="series" eyebrow="ONE MORE EPISODE" title="Series worth starting" description="Multi-episode experiences arrive in the upcoming phases." titles={getTitlesByKind("series")} onSelect={openTitle}/>
        <TitleRow id="collections" eyebrow="EXPLORE SOMETHING DIFFERENT" title="Off the beaten path" titles={getCollection("discovery")} onSelect={openTitle}/>
        <section className="next-phase-section"><div className="next-phase-icon"><Film size={24}/></div><div><span className="section-eyebrow">THIS IS JUST THE BEGINNING</span><h2>One platform. Infinite possibilities.</h2><p>Coming next: dedicated discovery, rich title pages, playable licensed sample content, watchlists and an operator dashboard.</p></div><span className="phase-label">PHASE 01 / 05</span></section>
      </div>
    </main>
    <footer className="site-footer"><div className="footer-grid"><div><span className="footer-brand">bharat<span>flix</span>.</span><p>Stories worth staying for.</p></div><div><strong>EXPLORE</strong><a href="#trending">Trending</a><a href="#movies">Films</a><a href="#series">Series</a></div><div><strong>DISCOVER</strong><a href="#collections">Collections</a><button type="button" onClick={openSearch}>Search titles</button></div><div><strong>PROTOTYPE</strong><p>This is a VSPH concept demonstration. All catalogue titles and artwork are fictional.</p></div></div><div className="footer-bottom"><span>© 2026 BharatFlix · Prototype concept</span><span>Built as a presentation prototype · No commercial media hosted</span></div></footer>
    {searchOpen && <SearchOverlay onClose={closeSearch} onSelect={openTitle}/>}
    {selected && <PreviewDialog title={selected} onClose={closePreview}/>}
  </div>;
}
