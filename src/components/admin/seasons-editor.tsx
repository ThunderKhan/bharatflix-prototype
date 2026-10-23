"use client";

import { Plus, Trash2 } from "lucide-react";
import { addEpisode, addSeason, deleteEpisode, deleteSeason, saveEpisode } from "@/lib/admin/actions";
import type { AdminSeason } from "@/lib/admin/queries";
import { ConfirmButton } from "./confirm-button";

/**
 * Season and episode management for a series. Each episode is its own form so
 * one saves without touching the others; delete buttons sit in sibling forms
 * (HTML forbids nested forms).
 */
export function SeasonsEditor({ titleId, seasons }: { titleId: string; seasons: AdminSeason[] }) {
  return (
    <section className="admin-section">
      <div className="admin-section-top">
        <div><h2>Seasons &amp; episodes</h2><p>{seasons.length} season{seasons.length === 1 ? "" : "s"} · every episode keeps its own synopsis and runtime.</p></div>
        <form action={addSeason}>
          <input type="hidden" name="titleId" value={titleId} />
          <button className="admin-edit" type="submit"><Plus size={14} /> Add season</button>
        </form>
      </div>

      {seasons.length === 0 ? (
        <p className="studio-empty">No seasons yet. Use “Add season” to start the episode list.</p>
      ) : (
        seasons.map((season) => (
          <div className="studio-season" key={season.id}>
            <div className="studio-season-head">
              <strong>Season {season.number}</strong>
              <form action={deleteSeason}>
                <input type="hidden" name="id" value={season.id} />
                <ConfirmButton message={`Delete Season ${season.number} and its ${season.episodes.length} episode(s)?`} className="studio-danger-button">
                  <Trash2 size={13} /> Delete season
                </ConfirmButton>
              </form>
            </div>

            {season.episodes.map((episode) => (
              <div className="studio-episode-wrap" key={episode.id}>
                <form className="studio-episode" action={saveEpisode}>
                  <input type="hidden" name="id" value={episode.id} />
                  <label>Ep
                    <input name="number" type="number" min={1} defaultValue={episode.number} />
                  </label>
                  <label className="studio-grow">Episode title
                    <input name="title" defaultValue={episode.title} maxLength={140} required />
                  </label>
                  <label>Runtime
                    <input name="runtime" defaultValue={episode.runtime} maxLength={20} placeholder="42m" />
                  </label>
                  <button className="admin-edit" type="submit">Save</button>
                  <label className="studio-wide">Synopsis
                    <textarea name="synopsis" defaultValue={episode.synopsis} rows={2} maxLength={900} />
                  </label>
                </form>
                <form className="studio-episode-delete" action={deleteEpisode}>
                  <input type="hidden" name="id" value={episode.id} />
                  <ConfirmButton message={`Delete “${episode.title}”?`} className="studio-danger-button">Delete</ConfirmButton>
                </form>
              </div>
            ))}

            <form action={addEpisode}>
              <input type="hidden" name="seasonId" value={season.id} />
              <button className="studio-ghost" type="submit"><Plus size={14} /> Add episode to Season {season.number}</button>
            </form>
          </div>
        ))
      )}
    </section>
  );
}
