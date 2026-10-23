"use client";

import { useCallback, useEffect, useState, type ReactNode } from "react";
import { useRouter } from "next/navigation";
import { SiteHeader } from "@/components/home/site-header";
import { SearchOverlay } from "@/components/home/search-overlay";
import type { MediaTitle } from "@/types/media";

/** Shared header and keyboard search on the homepage-adjacent routes. */
export function DiscoveryShell({ children }: { children: ReactNode }) {
  const router = useRouter();
  const [searchOpen, setSearchOpen] = useState(false);
  const openSearch = useCallback(() => setSearchOpen(true), []);
  const closeSearch = useCallback(() => setSearchOpen(false), []);
  const openTitle = useCallback((title: MediaTitle) => {
    closeSearch();
    router.push(`/title/${title.slug}`);
  }, [router, closeSearch]);
  useEffect(() => {
    const shortcut = (event: KeyboardEvent) => {
      if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === "k") {
        event.preventDefault(); openSearch();
      }
    };
    window.addEventListener("keydown", shortcut);
    return () => window.removeEventListener("keydown", shortcut);
  }, [openSearch]);
  return <div className="site-shell discovery-shell"><SiteHeader onOpenSearch={openSearch}/>{children}{searchOpen && <SearchOverlay onClose={closeSearch} onSelect={openTitle}/>}</div>;
}
