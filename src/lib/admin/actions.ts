"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { getDb } from "@/lib/db/connection";
import { assertOperator, assertSuperadmin } from "./auth";

/**
 * Every studio mutation lives here. Rules that apply to all of them:
 *  - assertOperator() first, so a crafted request cannot write without a session
 *  - strict input validation, never trusting the form blindly
 *  - an audit_log row naming the operator and what changed
 *  - redirect back with ?saved= / ?error= so the screens stay server-rendered
 */

const KINDS = ["movie", "series"] as const;
const STATUSES = ["published", "draft", "scheduled"] as const;
const STREAM_KINDS = ["sample", "youtube", "file", "hls"] as const;
const ROW_SOURCES = ["collection", "kind", "manual"] as const;

const text = (value: FormDataEntryValue | null, max = 500): string => String(value ?? "").trim().slice(0, max);
const slugify = (value: string): string =>
  value.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-$/g, "").slice(0, 60);
const int = (value: FormDataEntryValue | null, min: number, max: number, fallback: number): number => {
  const parsed = Number.parseInt(text(value, 12), 10);
  return Number.isFinite(parsed) ? Math.min(max, Math.max(min, parsed)) : fallback;
};
const num = (value: FormDataEntryValue | null, min: number, max: number, fallback: number): number => {
  const parsed = Number.parseFloat(text(value, 12));
  return Number.isFinite(parsed) ? Math.min(max, Math.max(min, parsed)) : fallback;
};
const oneOf = <T extends string>(value: FormDataEntryValue | null, allowed: readonly T[], fallback: T): T =>
  (allowed as readonly string[]).includes(text(value, 20)) ? (text(value, 20) as T) : fallback;
const flag = (formData: FormData, name: string): number => (formData.get(name) ? 1 : 0);

/** Local artwork paths only — remote hosts would break next/image and the demo. */
function artwork(value: FormDataEntryValue | null): string {
  const raw = text(value, 300);
  if (!raw) return "";
  if (/^\/(artwork|uploads|images)\/[a-zA-Z0-9._\-/]+$/.test(raw)) return raw;
  try {
    const url = new URL(raw);
    if (url.protocol === "https:" && ["thumb.wikimedia.org", "images.unsplash.com", "i.ytimg.com"].includes(url.hostname)) return raw;
  } catch { /* invalid URL */ }
  return "";
}

function backToError(back: string, message: string): never {
  redirect(`${back}?error=${encodeURIComponent(message)}`);
}
function backToSaved(back: string, message = "Saved."): never {
  redirect(`${back}?saved=${encodeURIComponent(message)}`);
}

function audit(actor: string, action: string, entity: string, entityId: string, detail = ""): void {
  getDb()
    .prepare("INSERT INTO audit_log (actor, action, entity, entity_id, detail) VALUES (?, ?, ?, ?, ?)")
    .run(actor, action, entity, entityId, detail.slice(0, 300));
}

function uniqueSlug(base: string, excludeId = ""): string {
  const db = getDb();
  const root = base || "title";
  let candidate = root;
  let attempt = 1;
  while (db.prepare("SELECT 1 FROM titles WHERE slug = ? AND id <> ?").get(candidate, excludeId)) {
    attempt += 1;
    candidate = `${root}-${attempt}`;
  }
  return candidate;
}

function nextSortOrder(): number {
  const row = getDb().prepare("SELECT COALESCE(MAX(sort_order), 0) + 10 AS n FROM titles").get() as { n: number };
  return row.n;
}

function applyGenres(titleId: string, raw: string): void {
  const db = getDb();
  const genres = Array.from(new Set(text(raw, 300).split(",").map((entry) => entry.trim()).filter(Boolean))).slice(0, 8);
  db.prepare("DELETE FROM title_genres WHERE title_id = ?").run(titleId);
  genres.forEach((name, position) => {
    db.prepare("INSERT INTO genres (slug, name) VALUES (?, ?) ON CONFLICT(slug) DO UPDATE SET name = excluded.name")
      .run(slugify(name), name);
    const row = db.prepare("SELECT id FROM genres WHERE slug = ?").get(slugify(name)) as { id: number } | undefined;
    if (row) db.prepare("INSERT OR IGNORE INTO title_genres (title_id, genre_id, position) VALUES (?, ?, ?)").run(titleId, row.id, position);
  });
}

function applyCollections(titleId: string, selected: string[], extra: string): void {
  const db = getDb();
  const wanted = Array.from(new Set([...selected, ...extra.split(",").map((entry) => slugify(entry)).filter(Boolean)])).slice(0, 6);
  db.prepare("DELETE FROM title_collections WHERE title_id = ?").run(titleId);
  wanted.forEach((slug, position) => {
    const existing = db.prepare("SELECT id FROM collections WHERE slug = ?").get(slug) as { id: number } | undefined;
    const id = existing
      ? existing.id
      : (db.prepare("INSERT INTO collections (slug, name) VALUES (?, ?)").run(slug, slug.charAt(0).toUpperCase() + slug.slice(1)).lastInsertRowid as number);
    db.prepare("INSERT OR IGNORE INTO title_collections (title_id, collection_id, position) VALUES (?, ?, ?)").run(titleId, id, position);
  });
}

/* ----------------------------------------------------------- titles ----- */

export async function createTitle(formData: FormData): Promise<void> {
  const operator = await assertOperator();
  const back = "/admin/titles/new";
  const title = text(formData.get("title"), 120);
  const synopsis = text(formData.get("synopsis"), 1500);
  if (title.length < 3) backToError(back, "Title needs at least 3 characters.");
  if (synopsis.length < 10) backToError(back, "Synopsis needs at least 10 characters.");
  const requested = slugify(text(formData.get("slug"), 60) || title);
  if (requested.length < 2) backToError(back, "Slug must contain letters or numbers.");
  const slug = uniqueSlug(requested);
  const db = getDb();
  db.prepare(
    `INSERT INTO titles (id, slug, title, tagline, kind, year, runtime, maturity, language, synopsis,
                         poster, backdrop, featured, rating, badge, status, sort_order, published_at)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
  ).run(
    slug, slug, title, text(formData.get("tagline"), 180), oneOf(formData.get("kind"), KINDS, "movie"),
    int(formData.get("year"), 1880, 2100, new Date().getFullYear()), text(formData.get("runtime"), 40),
    text(formData.get("maturity"), 12), text(formData.get("language"), 40), synopsis,
    artwork(formData.get("poster")) || "/artwork/placeholder-poster.svg",
    artwork(formData.get("backdrop")) || "/artwork/placeholder-wide.svg",
    flag(formData, "featured"), num(formData.get("rating"), 0, 10, 0), text(formData.get("badge"), 40) || null,
    oneOf(formData.get("status"), STATUSES, flag(formData, "published") ? "published" : "draft"), nextSortOrder(), new Date().toISOString(),
  );
  applyGenres(slug, text(formData.get("genres"), 300));
  applyCollections(slug, formData.getAll("collections").map((entry) => text(entry, 60)), text(formData.get("collectionsOther"), 200));
  audit(operator.email, "create", "title", slug, title);
  revalidatePath("/", "layout");
  backToSaved(`/admin/titles/${slug}`, "Title created.");
}

export async function saveTitle(formData: FormData): Promise<void> {
  const operator = await assertOperator();
  const id = text(formData.get("id"), 80);
  const back = `/admin/titles/${id}`;
  const existing = getDb().prepare("SELECT id, slug FROM titles WHERE id = ?").get(id) as { id: string; slug: string } | undefined;
  if (!existing) backToError("/admin/titles", "Title not found.");
  const title = text(formData.get("title"), 120);
  const synopsis = text(formData.get("synopsis"), 1500);
  if (title.length < 3) backToError(back, "Title needs at least 3 characters.");
  if (synopsis.length < 10) backToError(back, "Synopsis needs at least 10 characters.");
  const slug = uniqueSlug(slugify(text(formData.get("slug"), 60) || title), id);
  getDb().prepare(
    `UPDATE titles SET slug = ?, title = ?, tagline = ?, kind = ?, year = ?, runtime = ?, maturity = ?,
            language = ?, synopsis = ?, poster = ?, backdrop = ?, featured = ?, rating = ?, badge = ?,
            status = ?, sort_order = ?, updated_at = datetime('now')
      WHERE id = ?`,
  ).run(
    slug, title, text(formData.get("tagline"), 180), oneOf(formData.get("kind"), KINDS, "movie"),
    int(formData.get("year"), 1880, 2100, new Date().getFullYear()), text(formData.get("runtime"), 40),
    text(formData.get("maturity"), 12), text(formData.get("language"), 40), synopsis,
    artwork(formData.get("poster")) || "/artwork/placeholder-poster.svg",
    artwork(formData.get("backdrop")) || "/artwork/placeholder-wide.svg",
    flag(formData, "featured"), num(formData.get("rating"), 0, 10, 0), text(formData.get("badge"), 40) || null,
    oneOf(formData.get("status"), STATUSES, "draft"), int(formData.get("sortOrder"), 0, 999999, 0), id,
  );
  applyGenres(id, text(formData.get("genres"), 300));
  applyCollections(id, formData.getAll("collections").map((entry) => text(entry, 60)), text(formData.get("collectionsOther"), 200));
  audit(operator.email, "update", "title", id, title);
  revalidatePath("/", "layout");
  backToSaved(back);
}

export async function setStatus(formData: FormData): Promise<void> {
  const operator = await assertOperator();
  const id = text(formData.get("id"), 80);
  const status = oneOf(formData.get("status"), STATUSES, "draft");
  const row = getDb().prepare("SELECT title FROM titles WHERE id = ?").get(id) as { title: string } | undefined;
  if (!row) backToError("/admin/titles", "Title not found.");
  getDb().prepare("UPDATE titles SET status = ?, updated_at = datetime('now') WHERE id = ?").run(status, id);
  audit(operator.email, "status", "title", id, `${row.title} → ${status}`);
  revalidatePath("/", "layout");
  backToSaved("/admin/titles", `“${row.title}” is now ${status}.`);
}

export async function deleteTitle(formData: FormData): Promise<void> {
  const operator = await assertOperator();
  const id = text(formData.get("id"), 80);
  const row = getDb().prepare("SELECT title FROM titles WHERE id = ?").get(id) as { title: string } | undefined;
  if (!row) backToError("/admin/titles", "Title not found.");
  getDb().prepare("DELETE FROM titles WHERE id = ?").run(id);
  audit(operator.email, "delete", "title", id, row.title);
  revalidatePath("/", "layout");
  backToSaved("/admin/titles", `“${row.title}” deleted.`);
}

/* ------------------------------------------------ seasons and episodes -- */

export async function addSeason(formData: FormData): Promise<void> {
  const operator = await assertOperator();
  const titleId = text(formData.get("titleId"), 80);
  const back = `/admin/titles/${titleId}`;
  const row = getDb().prepare("SELECT COALESCE(MAX(number), 0) + 1 AS n FROM seasons WHERE title_id = ?").get(titleId) as { n: number };
  const id = `${titleId}-s${row.n}`;
  getDb().prepare("INSERT INTO seasons (id, title_id, number, name) VALUES (?, ?, ?, ?)").run(id, titleId, row.n, `Season ${row.n}`);
  audit(operator.email, "create", "season", id, `Season ${row.n}`);
  backToSaved(back, "Season added.");
}

export async function deleteSeason(formData: FormData): Promise<void> {
  const operator = await assertOperator();
  const id = text(formData.get("id"), 80);
  const row = getDb().prepare("SELECT title_id, number FROM seasons WHERE id = ?").get(id) as { title_id: string; number: number } | undefined;
  if (!row) backToError("/admin/titles", "Season not found.");
  getDb().prepare("DELETE FROM seasons WHERE id = ?").run(id);
  audit(operator.email, "delete", "season", id, `Season ${row.number}`);
  backToSaved(`/admin/titles/${row.title_id}`, "Season deleted.");
}

export async function addEpisode(formData: FormData): Promise<void> {
  const operator = await assertOperator();
  const seasonId = text(formData.get("seasonId"), 80);
  const season = getDb().prepare("SELECT title_id, number FROM seasons WHERE id = ?").get(seasonId) as
    { title_id: string; number: number } | undefined;
  if (!season) backToError("/admin/titles", "Season not found.");
  const row = getDb().prepare("SELECT COALESCE(MAX(number), 0) + 1 AS n FROM episodes WHERE season_id = ?").get(seasonId) as { n: number };
  const id = `${seasonId}e${row.n}`;
  getDb().prepare("INSERT INTO episodes (id, season_id, number, title, synopsis, runtime) VALUES (?, ?, ?, ?, ?, ?)")
    .run(id, seasonId, row.n, `Episode ${row.n}`, "Add an episode description.", "—");
  audit(operator.email, "create", "episode", id, `S${season.number}E${row.n}`);
  backToSaved(`/admin/titles/${season.title_id}`, "Episode added.");
}

export async function saveEpisode(formData: FormData): Promise<void> {
  const operator = await assertOperator();
  const id = text(formData.get("id"), 90);
  const row = getDb().prepare("SELECT s.title_id AS titleId FROM episodes e JOIN seasons s ON s.id = e.season_id WHERE e.id = ?")
    .get(id) as { titleId: string } | undefined;
  if (!row) backToError("/admin/titles", "Episode not found.");
  const title = text(formData.get("title"), 140) || "Untitled episode";
  getDb().prepare(
    "UPDATE episodes SET number = ?, title = ?, synopsis = ?, runtime = ? WHERE id = ?",
  ).run(int(formData.get("number"), 1, 999, 1), title, text(formData.get("synopsis"), 900), text(formData.get("runtime"), 20) || "—", id);
  audit(operator.email, "update", "episode", id, title);
  backToSaved(`/admin/titles/${row.titleId}`, "Episode saved.");
}

export async function deleteEpisode(formData: FormData): Promise<void> {
  const operator = await assertOperator();
  const id = text(formData.get("id"), 90);
  const row = getDb().prepare("SELECT s.title_id AS titleId, e.title AS title FROM episodes e JOIN seasons s ON s.id = e.season_id WHERE e.id = ?")
    .get(id) as { titleId: string; title: string } | undefined;
  if (!row) backToError("/admin/titles", "Episode not found.");
  getDb().prepare("DELETE FROM episodes WHERE id = ?").run(id);
  audit(operator.email, "delete", "episode", id, row.title);
  backToSaved(`/admin/titles/${row.titleId}`, "Episode deleted.");
}

/* ------------------------------------------------------------ streams --- */

export async function addStream(formData: FormData): Promise<void> {
  const operator = await assertOperator();
  const titleId = text(formData.get("titleId"), 80);
  const row = getDb().prepare("SELECT COALESCE(MAX(priority), 0) + 10 AS n FROM streams WHERE title_id = ?").get(titleId) as { n: number };
  const id = `${titleId}-src${row.n}`;
  getDb().prepare(
    "INSERT INTO streams (id, title_id, label, kind, quality, url, priority, enabled) VALUES (?, ?, ?, 'sample', '1080p', '', ?, 1)",
  ).run(id, titleId, `Server ${row.n / 10}`, row.n);
  audit(operator.email, "create", "stream", id, titleId);
  backToSaved(`/admin/titles/${titleId}`, "Stream added — set its URL and save.");
}

export async function saveStream(formData: FormData): Promise<void> {
  const operator = await assertOperator();
  const id = text(formData.get("id"), 90);
  const row = getDb().prepare("SELECT title_id FROM streams WHERE id = ?").get(id) as { title_id: string } | undefined;
  if (!row) backToError("/admin/titles", "Stream not found.");
  const url = text(formData.get("url"), 500);
  if (!url) backToError(`/admin/titles/${row.title_id}`, "A stream needs a URL or embed address.");
  getDb().prepare(
    "UPDATE streams SET label = ?, kind = ?, quality = ?, url = ?, priority = ?, enabled = ? WHERE id = ?",
  ).run(
    text(formData.get("label"), 60) || "Server", oneOf(formData.get("kind"), STREAM_KINDS, "sample"),
    text(formData.get("quality"), 20), url, int(formData.get("priority"), 0, 9999, 0), flag(formData, "enabled"), id,
  );
  audit(operator.email, "update", "stream", id, url);
  backToSaved(`/admin/titles/${row.title_id}`, "Stream saved.");
}

export async function deleteStream(formData: FormData): Promise<void> {
  const operator = await assertOperator();
  const id = text(formData.get("id"), 90);
  const row = getDb().prepare("SELECT title_id FROM streams WHERE id = ?").get(id) as { title_id: string } | undefined;
  if (!row) backToError("/admin/titles", "Stream not found.");
  getDb().prepare("DELETE FROM streams WHERE id = ?").run(id);
  audit(operator.email, "delete", "stream", id);
  backToSaved(`/admin/titles/${row.title_id}`, "Stream deleted.");
}

/* --------------------------------------------------------------- rows --- */

export async function saveRow(formData: FormData): Promise<void> {
  const operator = await assertOperator();
  const id = text(formData.get("id"), 60);
  const row = getDb().prepare("SELECT key FROM rows WHERE id = ?").get(id) as { key: string } | undefined;
  if (!row) backToError("/admin/rows", "Row not found.");
  getDb().prepare(
    "UPDATE rows SET eyebrow = ?, title = ?, description = ?, source_type = ?, source_value = ?, ranked = ?, visible = ?, position = ? WHERE id = ?",
  ).run(
    text(formData.get("eyebrow"), 80), text(formData.get("title"), 80) || row.key,
    text(formData.get("description"), 180), oneOf(formData.get("sourceType"), ROW_SOURCES, "collection"),
    text(formData.get("sourceValue"), 60), flag(formData, "ranked"), flag(formData, "visible"),
    int(formData.get("position"), 0, 9999, 0), id,
  );
  audit(operator.email, "update", "row", id, row.key);
  backToSaved("/admin/rows", "Row saved.");
}

export async function moveRow(formData: FormData): Promise<void> {
  const operator = await assertOperator();
  const id = text(formData.get("id"), 60);
  const direction = text(formData.get("direction"), 4) === "up" ? -1 : 1;
  const db = getDb();
  const all = db.prepare("SELECT id, position FROM rows ORDER BY position").all() as { id: string; position: number }[];
  const index = all.findIndex((row) => row.id === id);
  const swap = all[index + direction];
  if (index >= 0 && swap) {
    const mine = all[index].position;
    db.prepare("UPDATE rows SET position = ? WHERE id = ?").run(swap.position, id);
    db.prepare("UPDATE rows SET position = ? WHERE id = ?").run(mine, swap.id);
    audit(operator.email, "reorder", "row", id, direction === -1 ? "moved up" : "moved down");
  }
  backToSaved("/admin/rows", "Order updated.");
}

export async function toggleRowVisible(formData: FormData): Promise<void> {
  const operator = await assertOperator();
  const id = text(formData.get("id"), 60);
  const db = getDb();
  const row = db.prepare("SELECT key, visible FROM rows WHERE id = ?").get(id) as { key: string; visible: number } | undefined;
  if (!row) backToError("/admin/rows", "Row not found.");
  db.prepare("UPDATE rows SET visible = ? WHERE id = ?").run(row.visible ? 0 : 1, id);
  audit(operator.email, row.visible ? "hide" : "show", "row", id, row.key);
  backToSaved("/admin/rows", row.visible ? "Row hidden from the homepage." : "Row is live on the homepage.");
}

/* ----------------------------------------------------------- settings --- */

export async function saveSettings(formData: FormData): Promise<void> {
  const operator = await assertSuperadmin();
  const siteName = text(formData.get("siteName"), 60) || "BharatFlix";
  const tagline = text(formData.get("tagline"), 120) || "Stories worth staying for.";
  const db = getDb();
  db.prepare("INSERT INTO settings (key, value) VALUES ('site_name', ?) ON CONFLICT(key) DO UPDATE SET value = excluded.value").run(siteName);
  db.prepare("INSERT INTO settings (key, value) VALUES ('tagline', ?) ON CONFLICT(key) DO UPDATE SET value = excluded.value").run(tagline);
  audit(operator.email, "update", "settings", "site", `${siteName} / ${tagline}`);
  backToSaved("/admin/settings", "Settings saved.");
}

