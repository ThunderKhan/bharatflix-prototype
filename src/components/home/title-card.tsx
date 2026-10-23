"use client";

// Adapted from the media-card visual structure in xalonious/streaming-app (MIT).
// Replaced its TMDB runtime/data shape, click handling and artwork pipeline.
// License and upstream link: docs/OPEN_SOURCE.md.

import Image from "next/image";
import { ArrowUpRight, Play, Star } from "lucide-react";
import type { MediaTitle } from "@/types/media";

interface Props {
  title: MediaTitle;
  onSelect: (title: MediaTitle) => void;
  rank?: number;
  priority?: boolean;
}

export function TitleCard({ title, onSelect, rank, priority = false }: Props) {
  return (
    <button type="button" className="title-card" onClick={() => onSelect(title)} aria-label={`View details for ${title.title}`}>
      <div className="title-card-poster">
        <Image src={title.poster} alt={`${title.title} — ${title.mediaOrigin === "open-film" ? "attributed open-film poster" : "fictional concept artwork"}`} width={300} height={440} priority={priority} className="title-card-image" />
        {rank !== undefined && <span className="rank-ribbon" aria-label={`Ranked number ${rank}`}>{String(rank).padStart(2, "0")}</span>}
        <span className="card-hover-action" aria-hidden="true"><Play size={20} fill="currentColor" /></span>
        <span className="card-corner" aria-hidden="true"><ArrowUpRight size={17} /></span>
      </div>
      <div className="title-card-description">
        <span className="title-card-name">{title.title}</span>
        <span className="title-card-meta">{title.mediaOrigin === "open-film" ? "OPEN FILM" : <><Star size={12} fill="currentColor" /> {title.rating.toFixed(1)}</>} <span aria-hidden="true">·</span> {title.year} <span aria-hidden="true">·</span> {title.kind === "movie" ? "Film" : "Series"}</span>
      </div>
    </button>
  );
}
