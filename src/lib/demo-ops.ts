"use client";

import { useMemo, useSyncExternalStore } from "react";
import type { MediaTitle } from "@/types/media";

const KEY = "bharatflix:operator:v1";
const EVENT = "bharatflix:operator-change";
export type RightsState = "needs-review" | "reviewed" | "hold";
export type ReleasePlan = { slug: string; date: string; note: string };
export type RightsReview = { slug: string; status: RightsState };
export type IntakeTask = { id: string; slug: string; asset: "poster" | "video" | "subtitles"; status: "queued" | "reviewed"; createdAt: string };
export type OperatorEvent = { id: string; at: string; message: string };
export type DemoOperations = {
  featuredOrder: string[];
  hiddenShelves: string[];
  releases: ReleasePlan[];
  rights: RightsReview[];
  intakes: IntakeTask[];
  activity: OperatorEvent[];
};
export const SHELVES = [
  { id: "trending", name: "Trending Movies", description: "Leading films and curated highlights" },
  { id: "trending-tv", name: "Trending TV", description: "Series discovery" },
  { id: "bollywood", name: "Hindi Movies & Series", description: "Hindi-language titles" },
  { id: "animation", name: "Animation & Family", description: "Animated and family-friendly films" },
  { id: "open-cinema", name: "Open Cinema", description: "Credited open-film collection" },
  { id: "fantasy", name: "Sci-Fi & Fantasy", description: "Genre-based discoveries" },
  { id: "series", name: "Series to Explore", description: "Episode-based titles" },
] as const;
export const emptyOperations: DemoOperations = { featuredOrder: [], hiddenShelves: [], releases: [], rights: [], intakes: [], activity: [] };
const isSlug = (value: unknown): value is string => typeof value === "string" && /^[a-z0-9-]{1,100}$/.test(value);
const isDate = (value: unknown): value is string => typeof value === "string" && /^\d{4}-\d{2}-\d{2}$/.test(value) && !Number.isNaN(Date.parse(`${value}T00:00:00Z`));
const allowedShelves = new Set<string>(SHELVES.map((s) => s.id));
const allowedRights = new Set<RightsState>(["needs-review", "reviewed", "hold"]);

export function parseOperations(raw: string | null): DemoOperations {
  if (!raw) return { ...emptyOperations };
  try {
    const value: unknown = JSON.parse(raw);
    if (!value || typeof value !== "object") return { ...emptyOperations };
    const data = value as Record<string, unknown>;
    const featuredOrder = Array.isArray(data.featuredOrder) ? [...new Set(data.featuredOrder.filter(isSlug))].slice(0, 80) : [];
    const hiddenShelves = Array.isArray(data.hiddenShelves) ? [...new Set(data.hiddenShelves.filter((x): x is string => typeof x === "string" && allowedShelves.has(x)))].slice(0, 10) : [];
    const releases = Array.isArray(data.releases) ? data.releases.filter((r): r is ReleasePlan => {
      if (!r || typeof r !== "object") return false;
      const x = r as Record<string, unknown>;
      return isSlug(x.slug) && isDate(x.date) && typeof x.note === "string" && x.note.length <= 160;
    }).slice(-100) : [];
    const rights = Array.isArray(data.rights) ? data.rights.filter((r): r is RightsReview => {
      if (!r || typeof r !== "object") return false;
      const x = r as Record<string, unknown>;
      return isSlug(x.slug) && allowedRights.has(x.status as RightsState);
    }).slice(-100) : [];
    const intakes = Array.isArray(data.intakes) ? data.intakes.filter((r): r is IntakeTask => {
      if (!r || typeof r !== "object") return false;
      const x = r as Record<string, unknown>;
      return isSlug(x.id) && isSlug(x.slug) && (x.asset === "poster" || x.asset === "video" || x.asset === "subtitles") && (x.status === "queued" || x.status === "reviewed") && typeof x.createdAt === "string" && x.createdAt.length < 40;
    }).slice(-60) : [];
    const activity = Array.isArray(data.activity) ? data.activity.filter((r): r is OperatorEvent => {
      if (!r || typeof r !== "object") return false;
      const x = r as Record<string, unknown>;
      return isSlug(x.id) && typeof x.at === "string" && x.at.length < 40 && typeof x.message === "string" && x.message.length <= 160;
    }).slice(-35) : [];
    return { featuredOrder, hiddenShelves, releases, rights, intakes, activity };
  } catch { return { ...emptyOperations }; }
}
const read = () => typeof window === "undefined" ? "" : localStorage.getItem(KEY) ?? "";
const server = () => "";
const subscribe = (listener: () => void) => {
  window.addEventListener("storage", listener);
  window.addEventListener(EVENT, listener);
  return () => { window.removeEventListener("storage", listener); window.removeEventListener(EVENT, listener); };
};
export function useDemoOperations() {
  const raw = useSyncExternalStore(subscribe, read, server);
  return useMemo(() => parseOperations(raw), [raw]);
}
function update(operation: (state: DemoOperations) => DemoOperations) {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(KEY, JSON.stringify(operation(parseOperations(localStorage.getItem(KEY)))));
    window.dispatchEvent(new Event(EVENT));
  } catch { /* browser storage can be disabled; fail safely */ }
}
function log(state: DemoOperations, message: string): DemoOperations {
  return { ...state, activity: [{ id: `ev-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 6)}`, at: new Date().toISOString(), message: message.slice(0, 160) }, ...state.activity].slice(0, 35) };
}
export function recordOperatorEvent(message: string) { update((state) => log(state, message)); }
export function setShelfVisible(id: string, visible: boolean) {
  if (!allowedShelves.has(id)) return;
  update((state) => log({ ...state, hiddenShelves: visible ? state.hiddenShelves.filter((x) => x !== id) : [...new Set([...state.hiddenShelves, id])] }, `${visible ? "Enabled" : "Hidden"} homepage shelf: ${SHELVES.find(s=>s.id===id)?.name}`));
}
export function moveFeatured(slugs: string[], slug: string, direction: -1 | 1) {
  if (!isSlug(slug)) return;
  const order = [...slugs]; const index = order.indexOf(slug); const target = index + direction;
  if (index < 0 || target < 0 || target >= order.length) return;
  [order[index], order[target]] = [order[target], order[index]];
  update((state) => log({ ...state, featuredOrder: order }, `Reordered featured title: ${slug}`));
}
export function orderFeatured(titles: MediaTitle[], preferred: string[]): MediaTitle[] {
  const indexes = new Map(preferred.map((slug, index) => [slug, index]));
  return [...titles].sort((a, b) => (indexes.get(a.slug) ?? Number.MAX_SAFE_INTEGER) - (indexes.get(b.slug) ?? Number.MAX_SAFE_INTEGER));
}
export function setReleasePlan(slug: string, date: string, note: string) {
  if (!isSlug(slug) || !isDate(date) || note.length > 160) return false;
  update((state) => log({ ...state, releases: [...state.releases.filter((x) => x.slug !== slug), { slug, date, note: note.trim() }].slice(-100) }, `Planned release for ${slug}: ${date}`));
  return true;
}
export function removeReleasePlan(slug: string) {
  if (!isSlug(slug)) return;
  update((state) => log({ ...state, releases: state.releases.filter((x) => x.slug !== slug) }, `Removed release plan: ${slug}`));
}
export function setRightsReview(slug: string, status: RightsState) {
  if (!isSlug(slug) || !allowedRights.has(status)) return;
  update((state) => log({ ...state, rights: [...state.rights.filter((x) => x.slug !== slug), { slug, status }].slice(-100) }, `Set rights checklist for ${slug}: ${status}`));
}
export function queueIntake(slug: string, asset: IntakeTask["asset"]) {
  if (!isSlug(slug) || !["poster", "video", "subtitles"].includes(asset)) return;
  update((state) => log({ ...state, intakes: [{ id: `task-${Date.now().toString(36)}`, slug, asset, status: "queued" as const, createdAt: new Date().toISOString() }, ...state.intakes].slice(0, 60) }, `Created ${asset} intake checklist: ${slug}`));
}
export function completeIntake(id: string) {
  if (!isSlug(id)) return;
  update((state) => log({ ...state, intakes: state.intakes.map((x) => x.id === id ? { ...x, status: "reviewed" as const } : x) }, `Reviewed intake task ${id}`));
}
export function resetDemoOperations() { update(() => ({ ...emptyOperations })); }
