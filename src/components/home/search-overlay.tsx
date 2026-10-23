"use client";

import { Search, X } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { searchTitles } from "@/lib/catalog";
import type { MediaTitle } from "@/types/media";

interface Props { onClose: () => void; onSelect: (title: MediaTitle) => void; }

export function SearchOverlay({ onClose, onSelect }: Props) {
  const [query, setQuery] = useState("");
  const input = useRef<HTMLInputElement>(null);
  const results = searchTitles(query);
  useEffect(() => {
    input.current?.focus();
    const onKey = (event: KeyboardEvent) => { if (event.key === "Escape") onClose(); };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  return <div className="overlay-backdrop" role="presentation" onMouseDown={(event) => { if (event.target === event.currentTarget) onClose(); }}>
    <section className="search-panel" role="dialog" aria-modal="true" aria-labelledby="search-title">
      <div className="dialog-title-row"><div><span className="section-eyebrow">DISCOVER</span><h2 id="search-title">Find your next story</h2></div><button className="dialog-close" type="button" onClick={onClose} aria-label="Close search"><X size={23}/></button></div>
      <label className="search-field"><Search size={21}/><input ref={input} value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search titles, genres or languages…" aria-label="Search fictional catalogue"/><kbd>ESC</kbd></label>
      <p className="search-support">{query.trim() ? `${results.length} matching ${results.length === 1 ? "title" : "titles"}` : "Try Drama, Mystery, Sci-Fi or Hindi"}</p>
      <div className="search-results" aria-live="polite">
        {!query.trim() ? <p className="search-empty">Start typing to discover the sample catalogue.</p> : results.length === 0 ? <p className="search-empty">No matching titles. Try a different genre or keyword.</p> : results.map((title) => (
          <button className="search-result" key={title.id} type="button" onClick={() => onSelect(title)}><span className="search-result-image" style={{ backgroundImage: `url(${title.poster})` }}/><span><strong>{title.title}</strong><small>{title.year} · {title.kind === "movie" ? "Movie" : "Series"} · {title.genres.join(", ")}</small></span><span className="search-result-arrow" aria-hidden="true">↗</span></button>
        ))}
      </div>
    </section>
  </div>;
}
