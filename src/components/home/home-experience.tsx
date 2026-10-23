"use client";

import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import { ArrowRight } from "lucide-react";
import { useDemoCMS } from "@/lib/demo-cms";
import { orderFeatured, useDemoOperations } from "@/lib/demo-ops";
import { useViewerLibrary } from "@/lib/viewer-library";
import { getWatchTarget } from "@/lib/demo-media";
import type { MediaTitle } from "@/types/media";
import { FeaturedHero } from "./featured-hero";
import { PreviewDialog } from "./preview-dialog";
import { ProviderStrip } from "./provider-strip";
import { SearchOverlay } from "./search-overlay";
import { SiteHeader } from "./site-header";
import { TitleRow } from "./title-row";

export function HomeExperience() {
  const { published: catalogue } = useDemoCMS();
  const ops = useDemoOperations();
  const shelfIsVisible = (id: string) => !ops.hiddenShelves.includes(id);
  const { library } = useViewerLibrary();
  const continueTitles = library.history.map((entry) => getWatchTarget(entry.id)?.title).filter((item): item is MediaTitle => Boolean(item)).filter((item, index, array) => array.findIndex((other) => other.slug === item.slug) === index);
  const [searchOpen, setSearchOpen] = useState(false);
  const [selected, setSelected] = useState<MediaTitle | null>(null);
  const openSearch = useCallback(() => setSearchOpen(true), []);
  const closeSearch = useCallback(() => setSearchOpen(false), []);
  const closePreview = useCallback(() => setSelected(null), []);
  const openTitle = useCallback((title: MediaTitle) => { setSearchOpen(false); setSelected(title); }, []);
  const movies = catalogue.filter((item) => item.kind === "movie");
  const series = catalogue.filter((item) => item.kind === "series");
  const openCinema = movies.filter((item) => item.mediaOrigin === "open-film");
  const hindi = catalogue.filter((item) => item.language === "Hindi");
  const animated = movies.filter((item) => item.genres.includes("Animation"));
  const fantasy = catalogue.filter((item) => item.genres.includes("Fantasy") || item.genres.includes("Sci-Fi"));

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
      <FeaturedHero titles={orderFeatured(catalogue.filter((item) => item.featured), ops.featuredOrder)} onSelect={openTitle}/>
      <div className="home-main-content home-editorial">
        <nav className="home-quick-filters" aria-label="Browse by category"><Link href="/explore?kind=movie">Movies</Link><Link href="/explore?kind=series">TV Series</Link><Link href="/explore?language=Hindi">Hindi</Link><Link href="/explore?language=Tamil">Tamil</Link><Link href="/explore?language=Telugu">Telugu</Link><Link href="/explore">All titles <ArrowRight size={16}/></Link></nav>
        {continueTitles.length > 0 && <TitleRow id="continue" title="Continue Watching" titles={continueTitles} onSelect={openTitle}/>}
        {shelfIsVisible("trending") && <TitleRow id="trending" title="Trending Movies" titles={[...openCinema, ...movies.filter((item) => item.mediaOrigin !== "open-film")]} onSelect={openTitle} ranked />}
        {shelfIsVisible("trending-tv") && <TitleRow id="trending-tv" title="Trending TV" titles={series} onSelect={openTitle}/>}
        <ProviderStrip/>
        {shelfIsVisible("bollywood") && <TitleRow id="bollywood" title="Hindi Movies & Series" description="Fictional Hindi-language concepts for the prototype." titles={hindi} onSelect={openTitle}/>}
        {shelfIsVisible("animation") && <TitleRow id="animation" title="Animation & Family" titles={animated} onSelect={openTitle}/>}
        {shelfIsVisible("open-cinema") && <TitleRow id="open-cinema" title="Open Cinema · Real Films" description="Playable open films and attributed posters from Blender Studio." titles={openCinema} onSelect={openTitle}/>}
        {shelfIsVisible("fantasy") && <TitleRow id="fantasy" title="Sci-Fi & Fantasy" titles={fantasy} onSelect={openTitle}/>}
        {shelfIsVisible("series") && <TitleRow id="series" title="Series to Explore" titles={series} onSelect={openTitle}/>}
      </div>
    </main>
    <footer className="site-footer site-footer-editorial"><div className="footer-grid"><div><span className="footer-brand">BharatFlix</span><p>A streaming platform prototype by VSPH.</p></div><div><strong>EXPLORE</strong><a href="#trending">Movies</a><a href="#trending-tv">TV</a><a href="#open-cinema">Open Cinema</a></div><div><strong>LIBRARY</strong><Link href="/explore">Browse all</Link><Link href="/my-space">My Space</Link><Link href="/admin">Demo studio</Link></div><div><strong>ABOUT THE DEMO</strong><p>Licensed open-film posters and videos appear alongside clearly labeled fictional content. Third-party service links are not content integrations.</p></div></div><div className="footer-bottom"><span>© 2026 BharatFlix · VSPH concept</span><span>Open-film licenses linked on details pages · Not a commercial streaming service</span></div></footer>
    {searchOpen && <SearchOverlay onClose={closeSearch} onSelect={openTitle}/>}
    {selected && <PreviewDialog title={selected} onClose={closePreview}/>}
  </div>;
}
