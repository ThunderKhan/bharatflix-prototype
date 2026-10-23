# BharatFlix — Five-phase prototype roadmap

**Project name:** BharatFlix (without an H). **Audience:** VSPH/client review. **Target:** Six integrated viewer/admin pages. **Media:** Fictional catalogue and authorized sample assets only.

## Phase 01 — Foundation & Homepage (implemented; draft PR #1)
- Next.js 16, React 19, TypeScript, Tailwind 4 tooling and custom scalable design tokens.
- Original fictional catalogue, complete with client-owned concept artwork; no TMDB or scraped content.
- Adapt open-source MIT carousel/card/hero patterns and preserve third-party notice.
- Responsive header, curated content rows, featured story selection, search overlay and details preview.
- Acceptance: all homepage actions work; no dead outbound app links; keyboard search opens; image artwork loads; no unauthorized video.

## Phase 02 — Discovery & Details (implemented; pending local validation)
- New **page 2** `/explore`: search, filter by kind/genre/language/year, sorting, empty states.
- New **page 3** `/title/[slug]`: reusable movie/series details with metadata, cast (fictional for demo), trailers/episodes and related titles.
- Typed season and episode IDs; episode-specific navigation targets, no fabricated player functionality.
- Acceptance: a film and a series each have correct detail data; filters compose; all navigations resolve.

## Phase 03 — Video Playback
- New **page 4** `/watch/[id]`: provider-neutral player adapter.
- Official YouTube IFrame embeds for verified authorized content; local/sample MP4 fallback to avoid broken embeds.
- Playback state, loading/error states, keyboard commands where supported, and Next Episode for series.
- Acceptance: playable, embeddable video with approved source; unsupported/blocked source displays honest fallback; no scraped stream resolvers.

## Phase 04 — My Space
- New **page 5** `/my-space`: add/remove watchlist, continue watching, recently watched, demo profile.
- Persist browser-local preferences/playback checkpoints and handle hydration safely.
- Acceptance: a title added to My Space persists after page refresh; supported playback can resume; controls don't falsely claim permanent cloud sync.

## Phase 05 — Admin & Presentation QA
- New **page 6** `/admin`: local demo catalogue management, add/edit draft content, publishing controls, overview cards.
- Admin edits propagate to the demo viewer catalogue through shared *controlled* local state; no publicly writable API.
- Full accessibility and responsive QA, end-to-end journey tests, final attribution audit, and deployment/playback privacy checklist.
- Acceptance: a draft title can be published in a protected/local demo and appears on the viewer side; all six pages are connected; no paid/real licensed assets needed.

## Scope and constraints

Prototype is not a production video-on-demand backend. Excludes billing, subscriptions, production authentication, CDN/transcoding, DRM, AI recommendations, and real content-rights management. Those are separate client-approved workstreams. Prices, delivery dates and infrastructure needs are not committed here.
