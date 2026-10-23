"use client";

import Image from "next/image";
import Link from "next/link";
import { ArrowRight, Film, Search, SlidersHorizontal, Sparkles, X } from "lucide-react";
import { useMemo, useState } from "react";
import { useDemoCMS } from "@/lib/demo-cms";
import { filterCatalogue, getFilterOptions, type CatalogueSort } from "@/lib/discovery";
import type { MediaKind } from "@/types/media";
import { DiscoveryShell } from "./discovery-shell";

const sortChoices: { id: CatalogueSort; label: string }[] = [
  { id: "featured", label: "Recommended" }, { id: "newest", label: "Newest first" },
  { id: "oldest", label: "Oldest first" }, { id: "rating", label: "Highest rated" },
  { id: "title", label: "A to Z" },
];

export function ExploreExperience({ initialKind = "all", initialLanguage = "all" }: { initialKind?: MediaKind | "all"; initialLanguage?: string }) {
  const { published: titles } = useDemoCMS();
  const options = useMemo(() => getFilterOptions(titles), [titles]);
  const [query, setQuery] = useState("");
  const [kind, setKind] = useState<MediaKind | "all">(initialKind);
  const [genre, setGenre] = useState("all");
  const [language, setLanguage] = useState(initialLanguage);
  const [year, setYear] = useState("all");
  const [sort, setSort] = useState<CatalogueSort>("featured");
  const filtered = useMemo(() => filterCatalogue(titles, { search: query, kind, genre, language, year, sort }), [query, kind, genre, language, year, sort]);
  const hasFilters = Boolean(query.trim()) || kind !== "all" || genre !== "all" || language !== "all" || year !== "all" || sort !== "featured";
  const clear = () => { setQuery(""); setKind("all"); setGenre("all"); setLanguage("all"); setYear("all"); setSort("featured"); };

  return <DiscoveryShell><main className="explore-main">
    <div className="explore-ambient" aria-hidden="true"/>
    <div className="explore-intro">
      <div><span className="section-eyebrow"><Sparkles size={14}/> THE BHARATFLIX LIBRARY</span><h1>Find your <em>next obsession.</em></h1><p>Explore real Blender open films alongside fictional series and concepts. Source and image licensing are linked on each open-film detail page.</p></div>
      <span className="explore-library-count"><strong>{String(titles.length).padStart(2,"0")}</strong><small>CURATED TITLES</small></span>
    </div>
    <section className="explore-filters" aria-label="Catalogue search and filters">
      <label className="explore-search"><Search size={20}/><span className="sr-only">Search movies and series</span><input type="search" value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search titles, genres, stories…" />{query && <button type="button" aria-label="Clear search" onClick={() => setQuery("")}><X size={17}/></button>}</label>
      <div className="explore-filter-row">
        <div className="kind-pills" role="group" aria-label="Content type">
          {(["all","movie","series"] as const).map((choice) => <button key={choice} type="button" aria-pressed={kind === choice} onClick={() => setKind(choice)}>{choice === "all" ? "All titles" : choice === "movie" ? "Movies" : "Series"}</button>)}
        </div>
        <div className="explore-selectors">
          <span className="filters-label"><SlidersHorizontal size={16}/> FILTER</span>
          <label><span className="sr-only">Genre</span><select value={genre} onChange={(event) => setGenre(event.target.value)}><option value="all">All genres</option>{options.genres.map((item) => <option key={item} value={item}>{item}</option>)}</select></label>
          <label><span className="sr-only">Language</span><select value={language} onChange={(event) => setLanguage(event.target.value)}><option value="all">All languages</option>{options.languages.map((item) => <option key={item} value={item}>{item}</option>)}</select></label>
          <label><span className="sr-only">Release year</span><select value={year} onChange={(event) => setYear(event.target.value)}><option value="all">Any year</option>{options.years.map((item) => <option key={item} value={item}>{item}</option>)}</select></label>
          <label><span className="sr-only">Sort order</span><select value={sort} onChange={(event) => setSort(sortChoices.find((choice) => choice.id === event.target.value)?.id ?? "featured")}>{sortChoices.map(({id,label}) => <option key={id} value={id}>{label}</option>)}</select></label>
        </div>
      </div>
    </section>
    <div className="explore-results-heading"><div><span className="section-eyebrow">THE COLLECTION</span><h2>{query.trim() ? "Search results" : kind === "movie" ? "All films" : kind === "series" ? "All series" : "Explore everything"}</h2><p aria-live="polite">Showing {filtered.length} of {titles.length} titles</p></div>{hasFilters && <button className="clear-filters" onClick={clear} type="button"><X size={16}/> Clear filters</button>}</div>
    {filtered.length ? <div className="explore-grid">{filtered.map((item) => <Link key={item.id} href={`/title/${item.slug}`} className="explore-tile" aria-label={`View ${item.title} details`}><div className="explore-tile-visual"><Image src={item.poster} alt={`${item.mediaOrigin === "open-film" ? "Attributed film poster" : "Illustrative photographic concept"} for ${item.title}`} fill sizes="(max-width: 550px) 45vw, (max-width: 980px) 27vw, 16vw"/>{item.mediaOrigin !== "open-film" && <span className="concept-grid-cover" aria-hidden="true">{item.title}</span>}<span className="explore-tile-badge">{item.kind === "movie" ? "FILM" : "SERIES"}</span></div><div className="explore-tile-title">{item.title} <ArrowRight size={15}/></div><div className="explore-tile-meta">{item.year} <span>·</span> {item.language} <span>·</span> {item.mediaOrigin === "open-film" ? "Open film" : `★ ${item.rating.toFixed(1)}`}</div><div className="explore-tile-genres">{item.genres.join(" / ")}</div></Link>)}</div> : <div className="explore-no-results"><Film size={35}/><h3>No titles match your filters</h3><p>Try another genre, language, year or search term.</p><button type="button" className="button-primary" onClick={clear}>Reset catalogue filters</button></div>}
    <div className="explore-bottom"><span>END OF COLLECTION</span><p>Real open-film posters are attributed to their creators; other titles are fictional demonstrations.</p></div>
  </main></DiscoveryShell>;
}
