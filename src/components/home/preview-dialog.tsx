"use client";

import Image from "next/image";
import Link from "next/link";
import { ArrowUpRight, Clapperboard, X } from "lucide-react";
import { useEffect } from "react";
import type { MediaTitle } from "@/types/media";

interface Props { title: MediaTitle; onClose: () => void; }

export function PreviewDialog({ title, onClose }: Props) {
  useEffect(() => {
    const onKey = (event: KeyboardEvent) => { if (event.key === "Escape") onClose(); };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  return <div className="overlay-backdrop" role="presentation" onMouseDown={(event) => { if (event.target === event.currentTarget) onClose(); }}>
    <section className="preview-panel" role="dialog" aria-modal="true" aria-labelledby="preview-heading">
      <div className="preview-visual"><Image src={title.backdrop} alt="" fill sizes="(max-width: 700px) 100vw, 620px" className="preview-image"/><button className="preview-close" type="button" onClick={onClose} aria-label="Close title preview"><X size={21}/></button></div>
      <div className="preview-content"><span className="section-eyebrow">{title.kind === "movie" ? "FILM" : "ORIGINAL SERIES"} · SAMPLE CONTENT</span><h2 id="preview-heading">{title.title}</h2><p className="preview-tagline">{title.tagline}</p><div className="preview-metadata"><span>★ {title.rating.toFixed(1)}</span><span>{title.year}</span><span>{title.runtime}</span><span>{title.maturity}</span></div><p>{title.synopsis}</p><div className="genre-pills">{title.genres.map((genre) => <span key={genre}>{genre}</span>)}</div><div className="preview-footer"><span><Clapperboard size={16}/> Fictional sample title · Video playback arrives in Phase 3.</span><Link href={`/title/${title.slug}`} className="preview-detail-link" onClick={onClose}>Full details <ArrowUpRight size={16}/></Link></div></div>
    </section>
  </div>;
}
