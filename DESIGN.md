---
name: BharatFlix · Editorial Cinema
version: "2.0"
description: Dark, media-first OTT browsing and immersive playback. Original BharatFlix identity.
colors:
  background: "#080A0D"
  surface: "#15181D"
  surfaceRaised: "#1E242B"
  primary: "#F7F8FA"
  secondary: "#A4ACB8"
  accent: "#92B9D3"
  accentHover: "#B2D2E4"
  outline: "rgba(255,255,255,0.13)"
  focus: "#DCECF5"
typography:
  heading:
    fontFamily: "Inter, system-ui, sans-serif"
    fontSize: "32px"
    fontWeight: 700
    lineHeight: 1.15
  body:
    fontFamily: "Inter, system-ui, sans-serif"
    fontSize: "14px"
    fontWeight: 400
    lineHeight: 1.5
rounded:
  card: "5px"
  controls: "6px"
spacing:
  sm: "8px"
  md: "16px"
  lg: "24px"
  gutter: "clamp(18px, 4vw, 64px)"
---

# BharatFlix Editorial Cinema · Design System

## Overview
Use the content-dense browsing hierarchy seen in established OTT platforms: compact persistent navigation, a full-bleed feature hero, immediate movie/TV shelves, dense landscape or portrait cards, and dedicated series/movie detail pages. Stop using decorative promotional slogans, oversized empty spaces, abstract gradient banners, fake metrics and gradients in place of posters. One key art image is the primary visual event in each section.

**Reference pattern:** [Netflix design-system study](https://github.com/ndroussi/design-md-for-ai/blob/main/design-md/netflix/DESIGN.md) and [Google DESIGN.md specification](https://github.com/google-labs-code/design.md/blob/main/docs/spec.md). This is an original adaptation for BharatFlix, not a copy of Netflix's brand, trademark, custom font, or copyrighted artwork.

## Colors
Near-black `#080A0D` is the canvas; charcoal `#15181D` is the surface; `#F7F8FA` is primary text. Use cool silver `#A4ACB8` for metadata. Desaturated ice blue `#92B9D3` is reserved for focus, selected filters and navigation, not massive CTA fills. Primary play CTAs should be warm-white with dark text. **No purple gradients, glows, glass cards, champagne-gold decorative bars, pink accents or abstract poster art.** Dark-to-transparent scrims over real key art are allowed for legibility.

## Typography
Product UI uses system/Inter with consistent 600–750 headline weight; hero 48–84px, shelf headings 22–28px, card labels 13–15px, metadata 11–13px. Avoid eyebrow label + huge headline + ornamental subtitle on every shelf. Favor concise, factual labels: Trending Movies, Trending TV, Hindi Movies & Series, Animation & Family, Open Cinema.

## Layout
Maximum content canvas 1600px, adaptive gutter 18–64px. Navigation 66px. Hero is 66–72vh on desktop, 560px minimum, using real film artwork and bottom scrim. First content shelf follows hero immediately. Poster rails use 2:3 art with compact gaps (12–16px), minimum visible density around 7 posters on 1440px desktop; horizontal overflow and scroll arrows remain available. On mobile, horizontal rails remain scrollable, with 132–155px posters. Use touch targets at least 44px.

## Elevation & Depth
No floating glass surfaces or ornamental cards. Subtle borders; shadows only for hovered poster lift and player menus. Images carry atmospheric color; the rest of the UI should be visually quiet.

## Shapes
Card radius 5px; control radius 6px. Hover lifts limited to 1–2% scale. Hero controls and navigation use clear geometry and 200ms motion; respect `prefers-reduced-motion`.

## Components
- Header: BharatFlix wordmark, Movies, TV Shows, Open Cinema, My Space; search and user icon; do not put operator controls in the principal viewer navigation.
- Hero: real licensable backdrop, single film title, essential metadata, Watch or Preview CTA, More Info CTA. No blank hero fallback.
- Poster rails: compact editorial titles, true local artwork or attributed remote imagery, readable metadata, keyboard scroll support.
- Provider discovery: text-link directory to official Netflix, Prime Video, Disney+, JioHotstar and Tata Play Binge pages. **Never suggest the displayed sample films belong to those services.** No third-party service embeds.
- Player: use the open-source Video.js 10 React preset `NeutralVideoSkin`, with real HTML5 video, seek/scrub, volume, captions-ready UI, playback rate, fullscreen, keyboard interaction and saved progress. Avoid third-party video-embed chrome. Show a visible source/rights label below the player.
- Detail & search: keep accessible filters and licensed image credits; avoid fabricated scores for open films and concepts.
- My Space: simple library cards and viewing progress; CMS: existing demo behavior and shared tokens only, colleague owns CMS integration.

## Do's and Don'ts
Do: display real open-film posters and artwork credits; label fictional demos clearly; check embed/network failures; preserve source links; verify playback CORS and buffering; ensure deterministic fallback UI. Don't: copy Netflix/Prime Video logos, imply affiliations, stream copyrighted catalogues without rights, hide sample-media mismatch, use unsourced poster images, or alter CMS data APIs during design work.

## Collaboration / Implementation
All viewer UI reads `src/app/globals.css` tokens; keep component CSS consistent with this document. CMS feature development stays on its own branch. Public prototype assets and film streams require source attribution; when a remote media URL breaks, replace with a rights-cleared local copy after confirmation. Real deployment requires content licensing and production-grade authentication/media handling.
