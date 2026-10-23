import { getDb } from "@/lib/db/connection";

/** Read models for the studio screens. Every call asserts an operator first. */

export type AdminTitle = {
  id: string;
  slug: string;
  title: string;
  kind: "movie" | "series";
  year: number;
  language: string;
  rating: number;
  badge: string | null;
  poster: string;
  status: "published" | "draft" | "scheduled";
  featured: number;
  sort_order: number;
  seasons: number;
  episodes: number;
  updated_at: string;
};

export type AdminTitleDetail = {
  id: string;
  slug: string;
  title: string;
  tagline: string;
  kind: "movie" | "series";
  year: number;
  runtime: string;
  maturity: string;
  language: string;
  synopsis: string;
  poster: string;
  backdrop: string;
  featured: number;
  rating: number;
  badge: string | null;
  status: "published" | "draft" | "scheduled";
  sort_order: number;
  created_at: string;
  updated_at: string;
};

export type AdminSeason = { id: string; number: number; name: string; episodes: AdminEpisode[] };
export type AdminEpisode = { id: string; number: number; title: string; synopsis: string; runtime: string };
export type AdminStream = {
  id: string;
  title_id: string;
  label: string;
  kind: string;
  quality: string;
  url: string;
  priority: number;
  enabled: number;
};
export type AdminRow = {
  id: string;
  key: string;
  eyebrow: string;
  title: string;
  description: string;
  source_type: string;
  source_value: string;
  ranked: number;
  position: number;
  visible: number;
};
export type AdminUser = { id: string; email: string; name: string; role: string; created_at: string; last_login_at: string | null };
export type AuditEntry = { id: number; actor: string; action: string; entity: string; entity_id: string; detail: string; created_at: string };

export function listTitles(query = ""): AdminTitle[] {
  const term = `%${query.trim().toLowerCase()}%`;
  return getDb()
    .prepare(
      `SELECT t.id, t.slug, t.title, t.kind, t.year, t.language, t.rating, t.badge, t.poster, t.status,
              t.featured, t.sort_order, t.updated_at,
              (SELECT COUNT(*) FROM seasons s WHERE s.title_id = t.id) AS seasons,
              (SELECT COUNT(*) FROM episodes e JOIN seasons s2 ON s2.id = e.season_id WHERE s2.title_id = t.id) AS episodes
         FROM titles t
        WHERE ? = '%%'
           OR LOWER(t.title) LIKE ? OR LOWER(t.slug) LIKE ? OR LOWER(t.language) LIKE ?
        ORDER BY t.sort_order, t.title`,
    )
    .all(term, term, term, term) as AdminTitle[];
}

export function getTitle(id: string): AdminTitleDetail | undefined {
  return getDb().prepare("SELECT * FROM titles WHERE id = ?").get(id) as AdminTitleDetail | undefined;
}

export function getTitleGenres(id: string): string[] {
  return (getDb()
    .prepare("SELECT g.name FROM title_genres tg JOIN genres g ON g.id = tg.genre_id WHERE tg.title_id = ? ORDER BY tg.position")
    .all(id) as { name: string }[]).map((row) => row.name);
}

export function getTitleCollections(id: string): string[] {
  return (getDb()
    .prepare("SELECT c.slug FROM title_collections tc JOIN collections c ON c.id = tc.collection_id WHERE tc.title_id = ? ORDER BY tc.position")
    .all(id) as { slug: string }[]).map((row) => row.slug);
}

export function listCollections(): { slug: string; name: string }[] {
  return getDb().prepare("SELECT slug, name FROM collections ORDER BY slug").all() as { slug: string; name: string }[];
}

export function listSeasonsWithEpisodes(titleId: string): AdminSeason[] {
  const seasons = getDb()
    .prepare("SELECT id, number, name FROM seasons WHERE title_id = ? ORDER BY number")
    .all(titleId) as { id: string; number: number; name: string }[];
  return seasons.map((season) => ({
    ...season,
    episodes: getDb()
      .prepare("SELECT id, number, title, synopsis, runtime FROM episodes WHERE season_id = ? ORDER BY number")
      .all(season.id) as AdminEpisode[],
  }));
}

export function listStreams(titleId: string): AdminStream[] {
  return getDb()
    .prepare("SELECT * FROM streams WHERE title_id = ? ORDER BY priority, id")
    .all(titleId) as AdminStream[];
}

export function listRows(): AdminRow[] {
  return getDb().prepare("SELECT * FROM rows ORDER BY position").all() as AdminRow[];
}

export function listUsers(): AdminUser[] {
  return getDb().prepare("SELECT id, email, name, role, created_at, last_login_at FROM users ORDER BY role, email").all() as AdminUser[];
}

export function listAudit(limit = 60): AuditEntry[] {
  return getDb().prepare("SELECT * FROM audit_log ORDER BY id DESC LIMIT ?").all(limit) as AuditEntry[];
}

export function studioStats(): {
  total: number; published: number; drafts: number; seasons: number; episodes: number;
  streams: number; rows: number; users: number; operators: string;
} {
  const db = getDb();
  const count = (sql: string): number => (db.prepare(sql).get() as { n: number }).n;
  const total = count("SELECT COUNT(*) AS n FROM titles");
  const published = count("SELECT COUNT(*) AS n FROM titles WHERE status = 'published'");
  return {
    total,
    published,
    drafts: total - published,
    seasons: count("SELECT COUNT(*) AS n FROM seasons"),
    episodes: count("SELECT COUNT(*) AS n FROM episodes"),
    streams: count("SELECT COUNT(*) AS n FROM streams WHERE enabled = 1"),
    rows: count("SELECT COUNT(*) AS n FROM rows"),
    users: count("SELECT COUNT(*) AS n FROM users"),
    operators: (db.prepare("SELECT GROUP_CONCAT(email, ', ') AS emails FROM users WHERE role = 'admin'").get() as { emails: string | null }).emails ?? "—",
  };
}
