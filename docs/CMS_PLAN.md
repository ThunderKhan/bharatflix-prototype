# BharatFlix CMS — build plan

The prototype renders a catalogue that used to live in three JSON files. This plan
turns it into a locally runnable CMS: an admin studio backed by a real database,
with the public site reading the same data. No deployment, no billing, no DRM —
local testing only.

## Where the project stood

- `src/data/catalog.json`, `episodes.json`, `credits.json` — 12 fictional titles,
  4 seasons, 14 episodes, 36 cast names.
- `/admin` existed as a browser-local demo studio (4 editable fields, `localStorage`
  only, unauthenticated).
- Every viewer surface read the catalogue through one hook (`useDemoCMS`), which
  made the storage swap a single seam.

## Target architecture

| Layer | Choice | Why |
| --- | --- | --- |
| Database | SQLite (`better-sqlite3`) at `data/bharatflix.db` | Zero setup, one file, fast; the repository seam keeps a later Postgres move cheap |
| Access | `src/lib/db/*` — connection, schema, seed, pure snapshot builder, cached queries | One place reads the catalogue; pages never write SQL |
| Data flow | server component → `CatalogProvider` → client components | The viewer keeps rendering the same `CatalogSnapshot` shape it always had |
| Mutations | Server Actions (phase 3) | Same origin, no API plumbing, typed end to end |
| Media | `public/uploads` + `sharp` (phase 4) | Local files are enough for testing |
| Auth | Email + password, sessions in SQLite (phase 2) | Enough to guard the studio locally |

## Entities

`titles`, `genres` + `title_genres`, `collections` + `title_collections`,
`seasons`, `episodes`, `people` + `credits`, `streams` (per-title/episode sources
with label, quality, url, priority), `rows` (homepage carousel config), `users`,
`audit_log`, `settings`.

All of them exist from phase 1 so later phases never need a schema migration.

## Phases

| Phase | Scope | Status |
| --- | --- | --- |
| 1. Data foundation | Schema, JSON→SQLite seed, query layer, viewer reads the DB with no visual change | ✅ done |
| 2. Auth & studio shell | Operator login (`/admin/login`), guard layout for `/admin`, roles (admin/editor), audit log | ✅ done |
| 3. Catalogue CRUD | Studio catalogue list + full title editor, publish/draft/schedule, server actions, activity trail | ✅ done |
| 4. Artwork | Poster/backdrop paths with live preview against local `public/` files | ✅ done (path-based; resize-on-upload later if needed) |
| 5. Episodes, streams & rows | Season/episode editor, stream editor, homepage row builder, settings, operators | ✅ done |
| 6. Hardening | Backup/export/import, validation tests, docs | ⬜ |

## Signing in

The seed creates one local operator: **admin@bharatflix.local / admin123**
(override with `ADMIN_EMAIL` / `ADMIN_PASSWORD` before the first run; change it
from **Operators** afterwards). Sessions are signed cookies
(`data/.session-secret`); every studio page and every mutation checks for one,
and each change writes an `audit_log` row naming the operator.

## Running the database locally

```bash
npm run db:seed     # rebuild/refresh from src/data/*.json
npm run db:reset    # delete the file and reseed
npm run db:status   # row counts + JSON parity
npm run db:inspect  # print the catalogue the app would render
```

The app creates and seeds `data/bharatflix.db` on first run if it is missing, so
a fresh clone works with `npm run dev` alone. The JSON files stay in the repo as
the fixture the seed and the parity test rebuild from; `tests/db.test.mjs` checks
the two stay in step.

## Notes

- Public pages are `force-dynamic` for now: an edit in the studio is visible on
  refresh. Phase 3 replaces that with tag-based revalidation.
- `/admin` is still the original browser-local demo studio. It moves onto the
  database in phase 3 and is guarded by auth in phase 2.
- The player still uses the two demo clips; the `streams` table is seeded and
  ready, and the player switches to it in phase 5.
