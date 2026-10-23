# Phase 5 — demo operator studio and presentation hardening

- Local operator studio `/admin`: catalogue table, title edits, publish/draft, featured toggle, new fictional draft records, local reset.
- Viewer views (home, explore, details, search) read overlay records from browser-local CMS so changes appear **only in the same browser**.
- Prime Video UI reference: dense dark content rails, cinema-like title information, compact categories/navigation.
- Tata Play Binge reference: language-focused discovery rail for Hindi/Tamil/Telugu/Malayalam/English and direct filtered Explore links.
- Source inspiration only. No copied logos, movies, screenshots, or third-party copyrighted assets.

## Important non-production constraints

Admin is **not authenticated or secure**. Only browser localStorage is written, with no shared server persistence, server-side authorization, upload pipeline, billing, DRM, compliance, or user profiles. Keep prototype access limited and never use real client assets/data. Custom draft titles use placeholder fictional artwork and do not have playable media.
