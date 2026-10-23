# BharatFlix — Phase 02 review checklist

**Branch:** `feat/phase-02-discovery-details` (based on Phase 01, not directly on `main`).

**Scope:** Page 2 (`/explore`) and Page 3 (`/title/[slug]`). The existing homepage remains Page 1.

## Delivered

- Explore catalogue: combined search, movie/series toggle, genre, language and release year filters, five sort modes, clear-all and zero-results state.
- Navigable responsive poster grid and breadcrumb-style route links.
- Dynamic movie and series title pages for all 12 seeded fictional titles, with server-generated metadata and not-found handling for invalid slugs.
- Fictional cast, genre/language metadata and related-title navigation.
- Series season switching, typed episodes, episode selection and details; no dead `watch` links before Phase 03.
- Homepage header links, hero and cards now lead to functional Explore / details pages; modal includes Full Details.
- Seven new automated tests for filtering, sorting, manifests, credits and routes.
- No third-party posters, TMDB API key, scraped media, or streaming embed service.

## Manual validation

Run `npm install` (if needed), then `npm run lint`, `npm run typecheck`, `npm run build`, `npm test`, `npm run dev`.

1. Home page (`/`): click a card, then Full details. Use header to go to Explore, Movies and Series.
2. Explore: combine Movie + Drama + Hindi + 2026; The Last Monsoon should appear.
3. Explore: enter an impossible search term and verify helpful empty state; click Reset.
4. Explore: sort by rating and newest; inspect mobile layout.
5. Movie: `/title/last-monsoon` should show original artwork, fictional cast, metadata and recommendations.
6. Series: `/title/parallel` should show two seasons; switch to Season 2; expand an episode.
7. Invalid route `/title/not-real` must return not-found rather than fabricated content.
8. Ctrl/Cmd + K should open global search, including on title and Explore pages.
9. Playback controls must **not** imply that media can be played yet; player implementation is explicitly Phase 03.

## Known limitations

- **No video playback yet:** `/watch/[id]` is scheduled for Phase 03; there are no broken playback links in Phase 02.
- Search filters operate on a static demo JSON catalogue in the browser; no accounts or real backend.
- Cast, episodes, titles, ratings and artwork are fictional demonstration data.
- No subscriptions, authenticated admin functions, rights enforcement, or production media security.
- Full Next.js lint/typecheck/build must be run after installing dependencies in a machine with npm access. Local source transpilation tests alone are not sufficient.
- `npm audit` from the developer's machine is required to investigate reported high-severity findings before a public client deployment. Avoid `npm audit fix --force` until the advisory details are reviewed.
