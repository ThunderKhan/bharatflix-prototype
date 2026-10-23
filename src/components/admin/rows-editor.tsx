"use client";

import { ArrowDown, ArrowUp, Eye, EyeOff } from "lucide-react";
import { moveRow, saveRow, toggleRowVisible } from "@/lib/admin/actions";
import type { AdminRow } from "@/lib/admin/queries";

/**
 * Homepage carousel configuration. Each row is its own form; reordering and
 * visibility are one-click actions alongside it.
 */
export function RowsEditor({ rows }: { rows: AdminRow[] }) {
  return (
    <div className="studio-rows">
      {rows.map((row) => (
        <section className="admin-section" key={row.id}>
          <div className="admin-section-top">
            <div>
              <h2>{row.title}</h2>
              <p>{row.source_type} · {row.source_value} · position {row.position}</p>
            </div>
            <div className="studio-row-actions">
              <form action={moveRow}>
                <input type="hidden" name="id" value={row.id} />
                <input type="hidden" name="direction" value="up" />
                <button className="admin-edit" type="submit" aria-label="Move up"><ArrowUp size={14} /></button>
              </form>
              <form action={moveRow}>
                <input type="hidden" name="id" value={row.id} />
                <input type="hidden" name="direction" value="down" />
                <button className="admin-edit" type="submit" aria-label="Move down"><ArrowDown size={14} /></button>
              </form>
              <form action={toggleRowVisible}>
                <input type="hidden" name="id" value={row.id} />
                <button className="admin-edit" type="submit">
                  {row.visible ? <><EyeOff size={14} /> Hide</> : <><Eye size={14} /> Show</>}
                </button>
              </form>
            </div>
          </div>

          <form className="studio-form" action={saveRow}>
            <input type="hidden" name="id" value={row.id} />
            <div className="studio-grid">
              <label>Eyebrow
                <input name="eyebrow" defaultValue={row.eyebrow} maxLength={80} />
              </label>
              <label>Row title
                <input name="title" defaultValue={row.title} maxLength={80} required />
              </label>
              <label className="studio-wide">Description
                <input name="description" defaultValue={row.description} maxLength={180} />
              </label>
              <label>Source type
                <select name="sourceType" defaultValue={row.source_type}>
                  <option value="collection">Collection (e.g. trending, discovery)</option>
                  <option value="kind">Type (movie / series)</option>
                  <option value="manual">Manual list</option>
                </select>
              </label>
              <label>Source value
                <input name="sourceValue" defaultValue={row.source_value} maxLength={60} />
              </label>
              <label>Position
                <input name="position" type="number" min={0} defaultValue={row.position} />
              </label>
            </div>
            <div className="studio-switch-row">
              <label className="admin-switch">
                <input type="checkbox" name="ranked" defaultChecked={row.ranked === 1} /> Show ranking numbers
              </label>
              <label className="admin-switch">
                <input type="checkbox" name="visible" defaultChecked={row.visible === 1} /> Visible on the homepage
              </label>
              <button className="studio-primary" type="submit">Save row</button>
            </div>
          </form>
        </section>
      ))}
    </div>
  );
}
