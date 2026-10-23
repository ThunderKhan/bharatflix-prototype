"use client";

import { Plus } from "lucide-react";
import { addStream, deleteStream, saveStream } from "@/lib/admin/actions";
import type { AdminStream } from "@/lib/admin/queries";
import { ConfirmButton } from "./confirm-button";

/**
 * Playback sources for a title: the label, quality, URL and order a visitor
 * picks from in the player. One form per stream, delete in a sibling form.
 */
export function StreamsEditor({ titleId, streams }: { titleId: string; streams: AdminStream[] }) {
  return (
    <section className="admin-section">
      <div className="admin-section-top">
        <div><h2>Streams &amp; servers</h2><p>Where playback comes from. Lower priority numbers appear first in the player.</p></div>
        <form action={addStream}>
          <input type="hidden" name="titleId" value={titleId} />
          <button className="admin-edit" type="submit"><Plus size={14} /> Add stream</button>
        </form>
      </div>

      {streams.length === 0 ? (
        <p className="studio-empty">No streams yet — visitors will see “Media not connected”.</p>
      ) : (
        streams.map((stream) => (
          <div className="studio-stream" key={stream.id}>
            <form className="studio-stream-form" action={saveStream}>
              <input type="hidden" name="id" value={stream.id} />
              <label>Label
                <input name="label" defaultValue={stream.label} maxLength={60} required />
              </label>
              <label>Type
                <select name="kind" defaultValue={stream.kind}>
                  <option value="sample">Sample clip</option>
                  <option value="youtube">YouTube embed</option>
                  <option value="file">Direct file</option>
                  <option value="hls">HLS stream</option>
                </select>
              </label>
              <label>Quality
                <input name="quality" defaultValue={stream.quality} maxLength={20} placeholder="1080p" />
              </label>
              <label>Priority
                <input name="priority" type="number" min={0} defaultValue={stream.priority} />
              </label>
              <label className="studio-wide">URL or embed address
                <input name="url" defaultValue={stream.url} maxLength={500} placeholder="https://… or /media/file.mp4" required />
              </label>
              <label className="admin-switch">
                <input type="checkbox" name="enabled" defaultChecked={stream.enabled === 1} /> Enabled
              </label>
              <button className="admin-edit" type="submit">Save</button>
            </form>
            <form className="studio-episode-delete" action={deleteStream}>
              <input type="hidden" name="id" value={stream.id} />
              <ConfirmButton message="Remove this stream?" className="studio-danger-button">Delete</ConfirmButton>
            </form>
          </div>
        ))
      )}
    </section>
  );
}
