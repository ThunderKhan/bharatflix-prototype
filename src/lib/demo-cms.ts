"use client";

import { useMemo, useSyncExternalStore } from "react";
import { titles as seed } from "@/lib/catalog";
import type { MediaKind, MediaTitle } from "@/types/media";

const KEY = "bharatflix:cms:v1";
const EVENT = "bharatflix:cms-change";
export type ManagedItem = { slug: string; title: string; synopsis: string; featured: boolean; published: boolean };
export type DemoCMS = { edits: ManagedItem[]; created: MediaTitle[] };

export function parseCMS(raw: string | null): DemoCMS {
  const fallback = { edits: [], created: [] };
  try {
    const value: unknown = JSON.parse(raw || "null");
    if (!value || typeof value !== "object") return fallback;
    const data = value as Record<string, unknown>;
    const edits = Array.isArray(data.edits) ? data.edits.filter((item): item is ManagedItem => {
      if (!item || typeof item !== "object") return false;
      const m = item as Record<string, unknown>;
      return typeof m.slug === "string" && /^[a-z0-9-]{1,100}$/.test(m.slug) && typeof m.title === "string" && m.title.length <= 120 && typeof m.synopsis === "string" && m.synopsis.length <= 1500 && typeof m.featured === "boolean" && typeof m.published === "boolean";
    }).slice(0, 100) : [];
    const created = Array.isArray(data.created) ? data.created.filter((item): item is MediaTitle => {
      if (!item || typeof item !== "object") return false;
      const t = item as Record<string, unknown>;
      return typeof t.slug === "string" && /^demo-[a-z0-9-]{1,100}$/.test(t.slug) && typeof t.title === "string" && t.title.length <= 120 && (t.kind === "movie" || t.kind === "series") && typeof t.poster === "string" && t.poster.startsWith("/artwork/") && typeof t.backdrop === "string" && t.backdrop.startsWith("/artwork/") && Array.isArray(t.genres) && typeof t.synopsis === "string" && t.synopsis.length <= 1500;
    }).slice(0, 40) : [];
    return { edits, created };
  } catch { return fallback; }
}

const subscribe = (fn: () => void) => { window.addEventListener(EVENT,fn);window.addEventListener("storage",fn);return()=>{window.removeEventListener(EVENT,fn);window.removeEventListener("storage",fn);}; };
const snapshot = () => typeof window === "undefined" ? "" : localStorage.getItem(KEY) || "";
const serverSnapshot = () => "";
export function applyCMS(data: DemoCMS): { all: MediaTitle[]; published: MediaTitle[] } {
  const edits = new Map(data.edits.map((x) => [x.slug,x]));
  const all = [...seed, ...data.created].map((title) => {
    const edit = edits.get(title.slug);
    return edit ? { ...title, title: edit.title, synopsis: edit.synopsis, featured: edit.featured } : title;
  });
  return { all, published: all.filter((title) => edits.get(title.slug)?.published !== false) };
}
export function useDemoCMS() {
  const raw = useSyncExternalStore(subscribe, snapshot, serverSnapshot);
  const cms = useMemo(() => parseCMS(raw),[raw]);
  return { cms, ...useMemo(() => applyCMS(cms),[cms]) };
}
function change(fn: (state: DemoCMS) => DemoCMS) {
  if (typeof window === "undefined") return;
  try {localStorage.setItem(KEY, JSON.stringify(fn(parseCMS(localStorage.getItem(KEY)))));window.dispatchEvent(new Event(EVENT));} catch {/* browser storage may be disabled */}
}
export function editDemoTitle(item: ManagedItem) {
  if (!/^[a-z0-9-]{1,100}$/.test(item.slug) || !item.title.trim() || item.title.length > 120 || item.synopsis.length > 1500) return;
  change((data) => ({...data,edits:[...data.edits.filter((x)=>x.slug!==item.slug),item]}));
}
export function createDemoTitle(details: { title: string; synopsis: string; kind: MediaKind }) {
  const title = details.title.trim().slice(0,120),synopsis = details.synopsis.trim().slice(0,1500);
  if (title.length < 3 || synopsis.length < 15) return false;
  const reference = seed.find((item) => item.kind === details.kind) ?? seed[0];
  const slug = `demo-${title.toLowerCase().replace(/[^a-z0-9]+/g,"-").replace(/^-|-$/g,"").slice(0,48)}-${Date.now().toString(36)}`;
  const created: MediaTitle = { ...reference, id: slug, slug, title, synopsis, tagline: "A new fictional demo title", kind: details.kind, year: 2026, runtime: details.kind === "movie" ? "Preview" : "Series concept", featured:false, collection:["discovery"], rating:0, badge:"NEW CONCEPT" };
  change((data) => ({ created:[...data.created,created].slice(-40),edits:[...data.edits,{slug,title,synopsis,featured:false,published:false}] }));
  return true;
}
export function resetDemoCMS() { change(() => ({ edits:[],created:[] })); }
export function isSamplePlayable(slug: string): boolean { return seed.some((item) => item.slug === slug); }
