"use client";

import Image from "next/image";
import { useState } from "react";
import { createTitle, saveTitle } from "@/lib/admin/actions";
import type { AdminTitleDetail } from "@/lib/admin/queries";

type Props = {
  mode: "create" | "edit";
  title?: AdminTitleDetail;
  genres: string[];
  collections: { slug: string; name: string }[];
  titleCollections: string[];
};

const slugify = (value: string): string =>
  value.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-$/g, "").slice(0, 60);

/**
 * The full title editor. One form posts every field to a single server action,
 * so a save is atomic: either the whole title updates or nothing does.
 */
export function TitleForm({ mode, title, genres, collections, titleCollections }: Props) {
  const [name, setName] = useState(title?.title ?? "");
  const [slug, setSlug] = useState(title?.slug ?? "");
  const [slugTouched, setSlugTouched] = useState(mode === "edit");
  const [poster, setPoster] = useState(title?.poster ?? "/artwork/placeholder-poster.svg");
  const [backdrop, setBackdrop] = useState(title?.backdrop ?? "/artwork/placeholder-wide.svg");
  const [picked, setPicked] = useState<string[]>(titleCollections);

  const toggleCollection = (value: string) =>
    setPicked((current) => (current.includes(value) ? current.filter((entry) => entry !== value) : [...current, value]));

  return (
    <form className="studio-form" action={mode === "create" ? createTitle : saveTitle}>
      {mode === "edit" ? <input type="hidden" name="id" value={title?.id} /> : null}

      <section className="admin-section">
        <div className="admin-section-top">
          <div><h2>{mode === "create" ? "Basics" : "Title details"}</h2><p>What visitors read on the poster, detail page and search results.</p></div>
        </div>
        <div className="studio-grid">
          <label>Title
            <input name="title" value={name} required maxLength={120}
              onChange={(event) => {
                setName(event.target.value);
                if (!slugTouched) setSlug(slugify(event.target.value));
              }} />
          </label>
          <label>URL slug
            <input name="slug" value={slug} required maxLength={60}
              onChange={(event) => { setSlug(slugify(event.target.value)); setSlugTouched(true); }} />
            <small className="studio-hint">Seen at /title/{slug || "your-slug"}</small>
          </label>
          <label className="studio-wide">Tagline
            <input name="tagline" defaultValue={title?.tagline ?? ""} maxLength={180} placeholder="One line that sells it" />
          </label>
          <label className="studio-wide">Synopsis
            <textarea name="synopsis" defaultValue={title?.synopsis ?? ""} rows={5} required maxLength={1500}
              placeholder="At least 10 characters." />
          </label>
        </div>
      </section>

      <section className="admin-section">
        <h2>Artwork</h2>
        <p>Files served from <code>public/</code> — for example <code>/artwork/my-poster.svg</code>.</p>
        <div className="studio-grid">
          <label>Poster path (2:3)
            <input name="poster" value={poster} onChange={(event) => setPoster(event.target.value)} maxLength={300} />
          </label>
          <label>Backdrop path (16:9)
            <input name="backdrop" value={backdrop} onChange={(event) => setBackdrop(event.target.value)} maxLength={300} />
          </label>
        </div>
        <div className="studio-artwork-preview">
          <Image src={poster || "/artwork/placeholder-poster.svg"} alt="Poster preview" width={120} height={172} />
          <Image src={backdrop || "/artwork/placeholder-wide.svg"} alt="Backdrop preview" width={426} height={240} />
        </div>
      </section>

      <section className="admin-section">
        <h2>Classification</h2>
        <div className="studio-grid">
          <label>Type
            <select name="kind" defaultValue={title?.kind ?? "movie"}>
              <option value="movie">Film</option>
              <option value="series">Series</option>
            </select>
          </label>
          <label>Year
            <input name="year" type="number" min={1880} max={2100} defaultValue={title?.year ?? new Date().getFullYear()} />
          </label>
          <label>Runtime
            <input name="runtime" defaultValue={title?.runtime ?? ""} maxLength={40} placeholder="2h 05m / 8 episodes" />
          </label>
          <label>Maturity rating
            <input name="maturity" defaultValue={title?.maturity ?? ""} maxLength={12} placeholder="U/A 16+" />
          </label>
          <label>Language
            <input name="language" defaultValue={title?.language ?? ""} maxLength={40} placeholder="Hindi" />
          </label>
          <label>Score (0–10)
            <input name="rating" type="number" step="0.1" min={0} max={10} defaultValue={title?.rating ?? 0} />
          </label>
          <label>Badge
            <input name="badge" defaultValue={title?.badge ?? ""} maxLength={40} placeholder="NEW / TOP 10" />
          </label>
          <label>Sort order
            <input name="sortOrder" type="number" min={0} defaultValue={title?.sort_order ?? 0} />
            <small className="studio-hint">Lower numbers appear first</small>
          </label>
          <label className="studio-wide">Genres (comma separated)
            <input name="genres" defaultValue={genres.join(", ")} maxLength={300} placeholder="Drama, Mystery" />
          </label>
        </div>
        <div className="studio-chip-row">
          <span>Collections:</span>
          {collections.map((collection) => (
            <label key={collection.slug} className="studio-chip">
              <input type="checkbox" checked={picked.includes(collection.slug)} onChange={() => toggleCollection(collection.slug)} />
              {collection.name}
            </label>
          ))}
          <label className="studio-wide">Add new collections (comma separated)
            <input name="collectionsOther" maxLength={200} placeholder="festival-winners, new-for-you" />
          </label>
        </div>
        {picked.map((slugValue) => <input key={slugValue} type="hidden" name="collections" value={slugValue} />)}
      </section>

      <section className="admin-section">
        <h2>Visibility</h2>
        <div className="studio-switch-row">
          <label className="admin-switch">
            <input type="checkbox" name="featured" defaultChecked={Boolean(title?.featured)} /> Feature on the homepage hero
          </label>
        </div>
        <div className="studio-grid">
          <label>Status
            <select name="status" defaultValue={title?.status ?? "draft"}>
              <option value="published">Published — visible to everyone</option>
              <option value="draft">Draft — only in the studio</option>
              <option value="scheduled">Scheduled — hold for later</option>
            </select>
          </label>
        </div>
      </section>

      <div className="studio-form-actions">
        <button className="studio-primary" type="submit">{mode === "create" ? "Create title" : "Save changes"}</button>
      </div>
    </form>
  );
}
