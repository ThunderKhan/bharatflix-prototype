import { cache } from "react";
import { getDb } from "./connection";
import { buildSnapshot, type CatalogStatus } from "./snapshot";

/**
 * Server-side catalogue reads for pages.
 *
 * Each accessor is wrapped in React's cache() so several components on one
 * request share a single database pass, while a fresh read still happens on the
 * next request (so studio edits are visible on refresh).
 */

export type { CatalogStatus };

export const getPublishedCatalog = cache(() => buildSnapshot(getDb(), "published"));
export const getAllCatalog = cache(() => buildSnapshot(getDb(), "all"));

export function getSettings(): Record<string, string> {
  const rows = getDb().prepare("SELECT key, value FROM settings").all() as { key: string; value: string }[];
  return Object.fromEntries(rows.map((row) => [row.key, row.value]));
}

export function catalogueStats(): { total: number; published: number; drafts: number; episodes: number; streams: number } {
  const db = getDb();
  const count = (sql: string): number => (db.prepare(sql).get() as { n: number }).n;
  const published = count("SELECT COUNT(*) AS n FROM titles WHERE status = 'published'");
  const total = count("SELECT COUNT(*) AS n FROM titles");
  return {
    total,
    published,
    drafts: total - published,
    episodes: count("SELECT COUNT(*) AS n FROM episodes"),
    streams: count("SELECT COUNT(*) AS n FROM streams WHERE enabled = 1"),
  };
}
