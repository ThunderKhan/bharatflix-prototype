# BharatFlix — OTT Platform Prototype

An original **BharatFlix** (without an H) concept prototype for a six-page streaming experience, developed across five reviewable phases. The project starts from a clean repository and selectively adapts MIT-licensed open-source UI components.

> **Prototype only.** The demo mixes credited Blender open films with clearly labeled fictional concepts. No unauthorized movie sources, scraped streaming providers, or commercial video streams are included. Public access to the website is not required for testing.

## Roadmap

| Phase | Focus | Outcome |
|---|---|---|
| **01 — Foundation & Homepage** | Next.js/TypeScript, design tokens, fictional catalogue, responsive navigation, featured hero, carousels, search overlay and title preview | A polished, navigable homepage (this PR) |
| **02 — Discovery & Details** | `/explore`, `/title/[slug]`; working filters, movie and series details, season/episode data | Visitors find and inspect a title |
| **03 — Playback** | `/watch/[id]`; Video.js 10 native HTML5 streaming controls, licensed open-film MP4s, honest sample fallback, episode progression | Playable demonstration with graceful errors |
| **04 — Personal Experience** | `/my-space`; watchlist, continue watching, local progress persistence, demo profile | Realistic repeat-viewing journey |
| **05 — Operations & Polish** | `/admin`; local demo catalogue editing, publication state, responsive QA, accessibility, smoke tests, CI and client presentation guidance | Complete six-page pitch prototype |

Details and acceptance criteria: [docs/ROADMAP.md](docs/ROADMAP.md).

## Phase 01 delivered

- Original cinematic homepage: featured-title hero, multiple curated catalog rows, poster carousel navigation, responsive navbar and footer.
- Instant local catalogue search (Ctrl/Cmd+K), accessible search overlay and title preview modal.
- Fictional collection of 12 titles and original SVG concept art; all content is safe for demonstration.
- Actual **component-code adaptations** from an MIT-licensed project (rather than only design inspiration): the card-row scrolling algorithm, media-card presentation pattern, and layered featured hero. See [docs/OPEN_SOURCE.md](docs/OPEN_SOURCE.md) for origin and required license notice.
- No API keys, TMDB account, video-hosting charges, or backend required.

## Local development

Requires Node.js 20.9+ and npm.

```powershell
npm install
npm run dev
```

Open <http://localhost:3000>. Use the navigation anchors, manually change the featured hero, click cards to open previews, or press **Ctrl+K** to search.

Quality checks after installing dependencies:

```powershell
npm run lint
npm run typecheck
npm run build
npm test
```

## Licensing and content

- Copied/adapted component concepts from **xalonious/streaming-app**, copyright © 2026 xalonious, under MIT license. Full required copyright and license notice: [docs/OPEN_SOURCE.md](docs/OPEN_SOURCE.md).
- Icons from **lucide-react** (ISC license). Next.js/React/Tailwind licensed independently by their maintainers.
- All illustrations under `public/artwork` were generated for this prototype. Other repositories are references, **not copied assets**.
- Do not add commercial posters, video streams, or metadata without appropriate permissions. Do not add unauthorized commercial movie streams or copy other providers' branded player interfaces.
- Keep admin controls private in Phase 5; avoid deploying a writable unauthenticated admin interface.

## Branch strategy

Each phase has its own review branch/PR. Do not merge into `main` until local checks and the phase's acceptance criteria pass. Later phases begin from the accepted previous phase to minimize merge conflicts.


## Phase 02 — Discovery and title details

The Phase 02 branch adds:

- `/explore` — search, kind/genre/language/year filters, sorting and poster grid.
- `/title/[slug]` — dedicated movie/series detail page with fictional cast and recommendations.
- Series episode browser with season dropdown; actual playback is intentionally deferred to Phase 03.
- `/explore?kind=movie` and `/explore?kind=series` for direct catalogue tabs.

Validation: `npm run lint && npm run typecheck && npm run build && npm test`.
See `docs/PHASE_02_REVIEW.md` for test scenarios and prototype constraints.

## Phase 05 — Operator Studio (prototype)

Includes `/admin` demo CMS, browse/search/edit, feature/unfeature, draft/publish, new fictional draft, and restore. The viewer homepage, Explore, search and detail pages reflect changes within the **same browser only**. Added India-language discovery links and Prime-style content density. `/admin` is unauthenticated and must never be used as a production CMS. See [docs/PHASE_05_REVIEW.md](docs/PHASE_05_REVIEW.md).

### Client walkthrough

1. Browse `/`, open a fictional film or series.
2. Search/filter `/explore`, inspect a title at `/title/[slug]`.
3. Open `/watch/[id]`, test Video.js native open-film/sample playback, navigate episodes.
4. Add a title to My List; use `/my-space` to resume sample playback.
5. Visit `/admin`, edit and publish fictional titles; verify local viewer changes.

**Not included:** actual accounts, paid subscriptions, secure admin, transcoding, content-rights verification, real movie hosting, or shared persistence. Video/credit sources and licensing are documented in Phase 3.

## Open Cinema (premium demo polish)

The homepage includes real Blender open films, credited Creative Commons poster URLs and two native MP4 open-film streams. Fictional titles/series remain for demo workflows. For each open film, see its source and license on the detail page. Full image/video inventory: [docs/OPEN_FILM_ASSETS.md](docs/OPEN_FILM_ASSETS.md). A network connection is required to load remote posters and licensed MP4 streams.

This viewer-side catalogue polish is intentionally independent of the CMS implementation workstream. Existing browser-local CMS behavior remains unchanged. Remote image and MP4 availability depend on third-party services and must be verified on the presentation network.

## Design system & visual assets

The canonical premium design system is [DESIGN.md](DESIGN.md). Do not add purple gradients or abstract SVG film posters. Real open films and their license information are recorded in [Open film assets](docs/OPEN_FILM_ASSETS.md); the 12 photo-led fictional concept titles and source links are recorded in [Concept photography](docs/CONCEPT_PHOTOGRAPHY.md). CMS contributors should implement from `main` on their own branches, keeping application state logic separate from this UI styling.

## Editorial V2 — Premium OTT UI and native player

The [canonical DESIGN.md](DESIGN.md) now defines a media-first, compact OTT layout with neutral dark backgrounds, no purple gradients, and content-dense movie/TV rails. Homepage shelves include Trending Movies, Trending TV, Hindi Movies & Series, Animation & Family, and Open Cinema. Links to Netflix, Prime Video, Disney+, JioHotstar and Tata Play Binge are **external provider references only**; no commercial provider content is streamed here.

The player uses `@videojs/react` 10.1.0 with `NeutralVideoSkin` around native MP4 playback, not a YouTube iframe. Big Buck Bunny and Elephants Dream have matching open-film examples; all other routes clearly indicate they play unrelated demonstration footage. Full media and design sources: [OTT_UI_REFERENCES.md](docs/OTT_UI_REFERENCES.md) and [PHASE_03_REVIEW.md](docs/PHASE_03_REVIEW.md).

For review run `npm install`, `npm run lint`, `npm run typecheck`, `npm run build`, `npm test`, and manual browser checks. Full build and streaming availability have not yet been verified in the authoring environment. The CMS remains a browser-local demo; coordinate real CMS changes with its feature owner.

## Authenticated viewer and staff demo

A local SQLite-backed account layer now supports viewer signup and login, account-linked watchlists and playback progress, and staff roles: **viewer**, **admin**, **superadmin**. `/account` is the login/signup page; `/my-space` requires any account, `/admin` requires admin or superadmin, and `/admin/users` requires superadmin. There are no shared demo credentials.

See **[docs/AUTH_AND_ROLES.md](docs/AUTH_AND_ROLES.md)** for bootstrapping the first superadmin, security decisions, deployment limitations and colleague CMS integration guidance. Existing operator-studio content editing is still a browser-local prototype rather than a shared database CMS.
