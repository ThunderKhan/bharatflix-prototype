"use client";

// Scroll-by-card carousel adapted from xalonious/streaming-app
// frontend/src/components/rows/CardRow.tsx (MIT) for Next.js and accessibility.

import { useRef } from "react";
import { ArrowUpRight, ChevronLeft, ChevronRight } from "lucide-react";
import type { MediaTitle } from "@/types/media";
import { TitleCard } from "./title-card";

interface Props {
  id: string;
  eyebrow?: string;
  title: string;
  description?: string;
  titles: MediaTitle[];
  onSelect: (title: MediaTitle) => void;
  ranked?: boolean;
}

export function TitleRow({ id, eyebrow, title, description, titles, onSelect, ranked = false }: Props) {
  const trackRef = useRef<HTMLDivElement>(null);

  function scroll(direction: -1 | 1) {
    const track = trackRef.current;
    if (!track) return;
    const first = track.firstElementChild;
    const width = first?.getBoundingClientRect().width ?? 220;
    const gap = Number.parseFloat(window.getComputedStyle(track).columnGap) || 18;
    track.scrollBy({ left: direction * (width + gap) * 2, behavior: "smooth" });
  }

  if (!titles.length) return null;

  return (
    <section id={id} className="title-row-section" aria-label={title}>
      <div className="section-heading">
        <div>
          {eyebrow && <span className="section-eyebrow">{eyebrow}</span>}
          <h2>{title} <ArrowUpRight size={19} aria-hidden="true" /></h2>
          {description && <p>{description}</p>}
        </div>
        <div className="carousel-controls">
          <button type="button" aria-label={`Scroll ${title} left`} onClick={() => scroll(-1)}><ChevronLeft size={19} /></button>
          <button type="button" aria-label={`Scroll ${title} right`} onClick={() => scroll(1)}><ChevronRight size={19} /></button>
        </div>
      </div>
      <div className="title-track" ref={trackRef}>
        {titles.map((item, index) => <TitleCard key={item.id} title={item} onSelect={onSelect} rank={ranked ? index + 1 : undefined} />)}
      </div>
    </section>
  );
}
