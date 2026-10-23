"use client";

import { createContext, useContext, type ReactNode } from "react";
import { SEED_SNAPSHOT } from "@/lib/catalog";
import type { CatalogSnapshot } from "@/types/media";

/**
 * The catalogue snapshot read on the server (from SQLite) and passed down to
 * every client component on the page. Components outside a provider fall back
 * to the JSON fixture so nothing crashes in isolation.
 */
const CatalogContext = createContext<CatalogSnapshot>(SEED_SNAPSHOT);

export function CatalogProvider({ snapshot, children }: { snapshot: CatalogSnapshot; children: ReactNode }) {
  return <CatalogContext.Provider value={snapshot}>{children}</CatalogContext.Provider>;
}

export function useCatalog(): CatalogSnapshot {
  return useContext(CatalogContext);
}
