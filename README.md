# BharatFlix — OTT Platform Prototype

An original **BharatFlix** (without an H) concept prototype for a six-page streaming experience, developed across five reviewable phases. The project starts from a clean repository and selectively adapts MIT-licensed open-source UI components.

> **Prototype only.** The catalogue titles and artwork are fictional. No unauthorized movie sources, scraped streaming providers, or commercial video content are included. Public access to the website is not required for testing.

## Roadmap

| Phase | Focus | Outcome |
|---|---|---|
| **01 — Foundation & Homepage** | Next.js/TypeScript, design tokens, fictional catalogue, responsive navigation, featured hero, carousels, search overlay and title preview | A polished, navigable homepage (this PR) |
| **02 — Discovery & Details** | `/explore`, `/title/[slug]`; working filters, movie and series details, season/episode data | Visitors find and inspect a title |
| **03 — Playback** | `/watch/[id]`; official YouTube IFrame API for authorized embeddable clips, optional sample MP4, playback controls, episode progression | Playable demonstration with graceful errors |
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
- Do not add commercial posters, video streams, or metadata without appropriate permissions. Official YouTube embeds, if used in Phase 3, must preserve YouTube's required player controls and terms.
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
3. Open `/watch/[id]`, test native playback/YouTube demo, navigate episodes.
4. Add a title to My List; use `/my-space` to resume sample playback.
5. Visit `/admin`, edit and publish fictional titles; verify local viewer changes.

**Not included:** actual accounts, paid subscriptions, secure admin, transcoding, content-rights verification, real movie hosting, or shared persistence. Video/credit sources and licensing are documented in Phase 3.

## Open Cinema (premium demo polish)

The homepage includes real Blender open films, credited Creative Commons poster URLs and selected official YouTube embedded films. Fictional titles/series remain for demo workflows. For each open film, see its source and license on the detail page. Full image/video inventory: [docs/OPEN_FILM_ASSETS.md](docs/OPEN_FILM_ASSETS.md). A network connection is required to load remote posters and YouTube frames.

This viewer-side catalogue polish is intentionally independent of the CMS implementation workstream. Existing browser-local CMS behavior remains unchanged. Remote image and embedded YouTube availability depend on third-party services and must be verified on the presentation network.

## Premium design system and imagery

The canonical dark, neutral-champagne OTT design is [DESIGN.md](DESIGN.md). Real Blender film credits are in [Open film assets](docs/OPEN_FILM_ASSETS.md); the 12 photographic **fictional** concepts with source links are listed in [Concept photography](docs/CONCEPT_PHOTOGRAPHY.md). Do not add purple gradients or abstract SVG pseudo-posters. CMS contributors should branch from `main` and avoid changing catalogue components concurrently.
