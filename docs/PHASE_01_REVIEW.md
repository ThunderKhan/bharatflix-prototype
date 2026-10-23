# Phase 01 review and acceptance

Branch: `feat/phase-01-foundation-home` · Base: `main`.

## What is implemented

- Complete Next.js, TypeScript and Tailwind tooling.
- Responsive homepage with branded navbar, hero, featured title selector, catalogue rows and footer.
- Interactive catalogue search: click search or press Ctrl/Cmd+K. Escape closes the dialog.
- Functional poster/card preview dialogs. All links and controls on Phase 01 have meaningful actions (no placeholder 404 navigation).
- Fictional/illustrative catalogue of 12 titles, with original local SVG artwork and no remote dependencies.
- Actual adapted MIT-licensed source patterns for three components, source link and full license text in `docs/OPEN_SOURCE.md`.
- Documented five-phase roadmap and sample-data boundaries.

## Acceptance on a local computer

1. `npm install` succeeds with Node.js 20.9+.
2. `npm run lint` succeeds.
3. `npm run typecheck` succeeds.
4. `npm run build` succeeds.
5. `npm test` succeeds.
6. At `http://localhost:3000`, the hero, poster rows and controls display on desktop and mobile widths.
7. Carousel arrows scroll horizontally, cards open the correct preview, featured buttons switch titles.
8. Search finds `monsoon`, `Sci-Fi`, `Hindi`, reports no matches, and closes on Escape.
9. Screen reader/tester can identify labelled buttons and the sample-content disclosure.

## Test evidence in the authoring environment

- `npm test`: **5/5 tests pass**.
- TypeScript/TSX syntax transpilation: **11 files, 0 parser diagnostics**.
- Full Next.js build, ESLint/typecheck and browser visual QA require `npm install`; dependency download was unavailable in the authoring container. Local reviewer should run all four checks before merge.

## Known limitations (by phase design)

- Only the homepage `/` is implemented. The rest of the six-page route list is **planned**, not implemented yet.
- Preview dialog is not a replacement for Phase 02's full title detail route; playback arrives in Phase 03.
- Search currently covers static seed catalogue. Admin storage/editing arrives in Phase 05.
- Decorative poster art is abstract and fictional; the client should replace it with approved assets later.
- Full modal focus trapping is a Phase 05 accessibility hardening item.
