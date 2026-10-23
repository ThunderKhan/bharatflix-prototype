"use client";

// Presentation layers and manually selectable featured-title concept adapted
// from the MIT-licensed HeroSection in xalonious/streaming-app.
// This version deliberately has no TMDB fetches, remote video sources or autoplay.

import Image from "next/image";
import Link from "next/link";
import { getFirstWatchId } from "@/lib/demo-media";
import { hasPlayableMedia } from "@/lib/catalog";
import { useCatalog } from "@/lib/catalog-context";
import { ArrowUpRight, CirclePlay, Info, Sparkles } from "lucide-react";
import { useState } from "react";
import type { MediaTitle } from "@/types/media";

interface Props {
  titles: MediaTitle[];
  onSelect: (title: MediaTitle) => void;
}

export function FeaturedHero({ titles, onSelect }: Props) {
  const [index, setIndex] = useState(0);
  const catalog = useCatalog();
  const active = titles[index];
  if (!active) return null;

  return (
    <section className="featured-hero" aria-label="Featured stories">
      <div className="hero-image" key={active.id}>
        <Image src={active.backdrop} alt="" fill priority sizes="100vw" className="hero-art" />
      </div>
      <div className="hero-gradient" />
      <div className="hero-inner">
        <div className="hero-copy" key={`${active.id}-copy`}>
          <div className="hero-kicker"><span className="hero-kicker-dot" /> {active.mediaOrigin === "open-film" ? "BLENDER OPEN FILM" : "SERIES & MOVIES"} <Sparkles size={13}/></div>
          <div className="hero-highlight">{active.badge ?? "FEATURED PREMIERE"}</div>
          <h1>{active.title}</h1>
          <p className="hero-tagline">{active.tagline}</p>
          <div className="hero-metadata">{active.mediaOrigin === "open-film" ? <span className="rating-pill">OPEN FILM</span> : <span className="rating-pill">CONCEPT PREVIEW</span>}<span>{active.year}</span><span>{active.kind === "movie" ? active.runtime : "Original series"}</span><span className="age-pill">{active.maturity}</span></div>
          <p className="hero-synopsis">{active.synopsis}</p>
          <div className="hero-ctas">
            {hasPlayableMedia(catalog, active.slug) ? <Link className="button-primary" href={`/watch/${getFirstWatchId(catalog, active)}`}><CirclePlay size={21} fill="currentColor" strokeWidth={1.6}/> {active.youtubeId ? "Watch film / preview" : "Watch sample"}</Link> : <button className="button-primary" type="button" onClick={() => onSelect(active)}><CirclePlay size={21} fill="currentColor" strokeWidth={1.6}/> Explore title</button>}
            <button className="button-secondary" type="button" onClick={() => onSelect(active)}><Info size={19}/> More info <ArrowUpRight size={17}/></button>
          </div>
        </div>
        <div className="hero-navigation">
          <div className="hero-progress"><span>NOW SHOWING</span><span>{String(index + 1).padStart(2, "0")} / {String(titles.length).padStart(2, "0")}</span></div>
          <div className="hero-bars">{titles.map((title, position) => (
            <button key={title.id} type="button" aria-label={`Show featured title ${title.title}`} aria-pressed={position === index} className={position === index ? "active" : ""} onClick={() => setIndex(position)} />
          ))}</div>
        </div>
      </div>
    </section>
  );
}
