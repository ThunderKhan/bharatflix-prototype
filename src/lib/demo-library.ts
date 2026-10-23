"use client";

import { useMemo, useSyncExternalStore } from "react";

const KEY = "bharatflix:library:v1";
const EVENT = "bharatflix:library-change";

export type ViewingEntry = { id: string; seconds: number; duration: number; updatedAt: number };
export type DemoLibrary = { watchlist: string[]; history: ViewingEntry[] };
export const emptyLibrary: DemoLibrary = { watchlist: [], history: [] };

/** Strictly normalize persisted browser data, without trusting raw localStorage JSON. */
export function parseLibrary(raw: string | null): DemoLibrary {
  if (!raw) return { watchlist: [], history: [] };
  try {
    const data: unknown = JSON.parse(raw);
    if (!data || typeof data !== "object") return { watchlist: [], history: [] };
    const obj = data as Record<string, unknown>;
    const watchlist = Array.isArray(obj.watchlist) ? [...new Set(obj.watchlist.filter((x): x is string => typeof x === "string" && /^[a-z0-9-]{1,100}$/.test(x)))].slice(0, 100) : [];
    const history = Array.isArray(obj.history) ? obj.history.filter((item): item is ViewingEntry => {
      if (!item || typeof item !== "object") return false;
      const x = item as Record<string, unknown>;
      return typeof x.id === "string" && /^[a-z0-9-]{1,100}$/.test(x.id) && typeof x.seconds === "number" && Number.isFinite(x.seconds) && x.seconds >= 0 && typeof x.duration === "number" && Number.isFinite(x.duration) && x.duration > 0 && typeof x.updatedAt === "number" && Number.isFinite(x.updatedAt);
    }).slice(0, 100) : [];
    return { watchlist, history };
  } catch { return { watchlist: [], history: [] }; }
}

const serverSnapshot = () => "";
const getSnapshot = () => typeof window === "undefined" ? "" : localStorage.getItem(KEY) ?? "";
const subscribe = (listener: () => void) => {
  window.addEventListener("storage", listener);
  window.addEventListener(EVENT, listener);
  return () => { window.removeEventListener("storage", listener); window.removeEventListener(EVENT, listener); };
};
export function useDemoLibrary() {
  const raw = useSyncExternalStore(subscribe, getSnapshot, serverSnapshot);
  return useMemo(() => parseLibrary(raw), [raw]);
}
function mutate(fn: (prev: DemoLibrary) => DemoLibrary) {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(KEY, JSON.stringify(fn(parseLibrary(localStorage.getItem(KEY)))));
    window.dispatchEvent(new Event(EVENT));
  } catch { /* Private mode or disabled storage; demo remains usable without persistence. */ }
}
export function toggleWatchlist(slug: string) {
  if (!/^[a-z0-9-]{1,100}$/.test(slug)) return;
  mutate((prev) => ({ ...prev, watchlist: prev.watchlist.includes(slug) ? prev.watchlist.filter((x) => x !== slug) : [...prev.watchlist, slug] }));
}
export function saveViewingProgress(id: string, seconds: number, duration: number) {
  if (!/^[a-z0-9-]{1,100}$/.test(id) || !Number.isFinite(seconds) || !Number.isFinite(duration) || duration <= 0) return;
  const validSeconds = Math.min(duration, Math.max(0, seconds));
  mutate((prev) => ({ ...prev, history: [{ id, seconds: validSeconds, duration, updatedAt: Date.now() }, ...prev.history.filter((x) => x.id !== id)].slice(0, 100) }));
}
export function removeHistory(id: string) {
  mutate((prev) => ({ ...prev, history: prev.history.filter((x) => x.id !== id) }));
}
export function resetDemoLibrary() {
  mutate(() => ({ watchlist: [], history: [] }));
}
