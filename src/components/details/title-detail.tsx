"use client";

import Image from "next/image";
import Link from "next/link";
import { useMemo, useState } from "react";
import { ArrowLeft, ArrowRight, CalendarDays, Check, Clapperboard, Clock3, Film, Globe2, ListVideo, Play, ShieldCheck, Sparkles, Star } from "lucide-react";
import type { MediaTitle, Season, Episode } from "@/types/media";
import { getFirstWatchId } from "@/lib/demo-media";
import { DiscoveryShell } from "@/components/discovery/discovery-shell";

interface Props {
  title: MediaTitle;
  seasons: Season[];
  cast: string[];
  related: MediaTitle[];
}

export function TitleDetail({ title, seasons, cast, related }: Props) {
  const [selectedSeason, setSelectedSeason] = useState(seasons[0]?.number ?? 1);
  const [expandedEpisodeId, setExpandedEpisodeId] = useState<string | null>(null);
  const season = useMemo(() => seasons.find((item) => item.number === selectedSeason), [seasons, selectedSeason]);
  const expandedEpisode: Episode | undefined = season?.episodes.find((item) => item.id === expandedEpisodeId);
  const isSeries = title.kind === "series";

  return <DiscoveryShell><main className="detail-main">
    <div className="detail-hero">
      <div className="detail-backdrop"><Image src={title.backdrop} alt="" fill priority sizes="100vw" className="detail-backdrop-image"/><div className="detail-backdrop-shade"/></div>
      <div className="detail-hero-inner">
        <Link className="detail-return" href="/explore"><ArrowLeft size={16}/> Back to explore</Link>
        <div className="detail-feature-grid">
          <div className="detail-copy">
            <div className="detail-overline"><span className="detail-overline-dot"/> {isSeries ? "ORIGINAL SERIES" : "FEATURE FILM"} <span className="detail-overline-divider">/</span> FICTIONAL SHOWCASE</div>
            {title.badge && <span className="detail-feature-badge"><Sparkles size={13}/>{title.badge}</span>}
            <h1>{title.title}</h1>
            <p className="detail-tagline">{title.tagline}</p>
            <div className="detail-stats"><span className="detail-rating"><Star size={16} fill="currentColor"/> {title.rating.toFixed(1)}</span><span>{title.year}</span><span>{title.runtime}</span><span className="detail-maturity">{title.maturity}</span></div>
            <p className="detail-synopsis">{title.synopsis}</p>
            <div className="detail-actions"><Link className="button-primary" href={`/watch/${getFirstWatchId(title)}`}><Play size={18}/> Watch sample clip</Link><Link className="detail-secondary-action" href="/explore"><Film size={18}/> More to explore <ArrowRight size={16}/></Link></div>
            <div className="detail-hero-footnote"><ShieldCheck size={15}/> Concept title. No movie or episode video is hosted or streamed.</div>
          </div>
          <div className="detail-poster-frame"><Image src={title.poster} alt={`Original fictional poster for ${title.title}`} fill priority sizes="(max-width: 800px) 180px, 320px"/><span className="detail-poster-gloss"/></div>
        </div>
      </div>
    </div>

    <div className="detail-body">
      <div className="detail-content-column">
        {isSeries && seasons.length > 0 && <section className="episode-section" aria-label={`Episodes of ${title.title}`}>
          <div className="detail-section-heading"><div><span className="section-eyebrow"><ListVideo size={14}/> THE STORY CONTINUES</span><h2>Episodes</h2><p>Explore each episode, then start its sample playback.</p></div>
            <label className="season-control"><span className="sr-only">Select a season</span><select value={selectedSeason} onChange={(event) => {setSelectedSeason(Number(event.target.value));setExpandedEpisodeId(null);}}>{seasons.map((item) => <option value={item.number} key={item.number}>{item.name}</option>)}</select></label>
          </div>
          <div className="episode-list">{season?.episodes.map((episode) => <button type="button" className={`episode-card ${expandedEpisodeId === episode.id ? "is-expanded" : ""}`} key={episode.id} aria-expanded={expandedEpisodeId === episode.id} onClick={() => setExpandedEpisodeId((prev) => prev === episode.id ? null : episode.id)}><span className="episode-number">{String(episode.number).padStart(2,"0")}</span><span className="episode-picture"><Image src={title.backdrop} alt="" fill sizes="(max-width: 730px) 110px, 188px"/><span className="episode-play"><Play size={21} fill="currentColor"/></span></span><span className="episode-copy"><span className="episode-copy-top"><strong>{episode.title}</strong><span><Clock3 size={14}/>{episode.runtime}</span></span><span className="episode-description">{episode.synopsis}</span><span className="episode-explore">{expandedEpisodeId === episode.id ? "Hide episode details" : "Explore episode"} <ArrowRight size={14}/></span></span></button>)}</div>
          {expandedEpisode && <div className="episode-selected" role="status"><div><span className="section-eyebrow">EPISODE {expandedEpisode.number} SELECTED</span><h3>{expandedEpisode.title}</h3><p>{expandedEpisode.synopsis}</p></div><span className="episode-availability"><Clapperboard size={16}/> Sample media demonstration</span><Link className="button-primary" href={`/watch/${expandedEpisode.id}`}><Play size={17}/> Play this episode</Link></div>}
        </section>}

        <section className="detail-about" aria-label="About this title"><div className="detail-section-heading"><div><span className="section-eyebrow">BEHIND THE STORY</span><h2>About this {isSeries ? "series" : "film"}</h2></div></div><div className="about-grid"><div className="about-feature"><span className="about-icon"><Globe2 size={19}/></span><span><small>ORIGINAL LANGUAGE</small><strong>{title.language}</strong></span></div><div className="about-feature"><span className="about-icon"><CalendarDays size={19}/></span><span><small>RELEASE YEAR</small><strong>{title.year}</strong></span></div><div className="about-feature"><span className="about-icon"><Film size={19}/></span><span><small>FORMAT</small><strong>{isSeries ? `${seasons.length} ${seasons.length === 1 ? "season" : "seasons"}` : title.runtime}</strong></span></div></div><div className="detail-about-block"><h3>Genres</h3><div className="genre-pills">{title.genres.map((genre) => <span key={genre}>{genre}</span>)}</div></div><div className="detail-about-block"><h3>Featured cast <span>· Fictional</span></h3><div className="cast-list">{cast.map((name, index) => <div className="cast-person" key={name}><div className="cast-avatar">{name.split(" ").map((segment) => segment[0]).slice(0,2).join("")}</div><div><strong>{name}</strong><small>{index === 0 ? "Lead performer" : "Featured performer"}</small></div><Check size={15} aria-hidden="true"/></div>)}</div></div></section>
      </div>

      <section className="related-section" aria-label="Related stories"><div className="detail-section-heading"><div><span className="section-eyebrow">KEEP EXPLORING</span><h2>You might also like</h2><p>More fictional stories selected by genre and language.</p></div><Link href="/explore" className="more-titles-link">View all titles <ArrowRight size={17}/></Link></div><div className="related-grid">{related.map((item) => <Link className="related-card" key={item.id} href={`/title/${item.slug}`}><span className="related-image"><Image src={item.poster} fill sizes="(max-width: 620px) 42vw, (max-width: 1100px) 21vw, 16vw" alt={`Poster for ${item.title}`}/></span><strong>{item.title}</strong><span>{item.year} · {item.kind === "series" ? "Series" : "Film"} · ★ {item.rating.toFixed(1)}</span></Link>)}</div></section>
      <div className="detail-legal"><ShieldCheck size={16}/> Fictional catalogue, original concept art and fictional cast. No copyrighted films or third-party media hosted.</div>
    </div>
  </main></DiscoveryShell>;
}
