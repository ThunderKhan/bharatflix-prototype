---
name: BharatFlix Nocturne Cinema
version: 1.0.0
status: prototype
inspiration:
  - https://github.com/google-labs-code/design.md/blob/main/docs/spec.md
  - https://github.com/stella/stella/blob/main/DESIGN.md
colors:
  background: "#080C10"
  surface: "#12181F"
  surfaceRaised: "#1B232C"
  textPrimary: "#F5F3EC"
  textMuted: "#AAB2BB"
  textSubtle: "#818C98"
  accent: "#D8B47B"
  accentHover: "#EACB98"
  accentPressed: "#B88D55"
  outline: "rgba(240,236,227,0.13)"
  focus: "#F3D49A"
typography:
  fontFamily: "Inter, ui-sans-serif, system-ui, -apple-system, Segoe UI, sans-serif"
  displayWeight: 750
  bodyWeight: 400
  labelWeight: 750
spacing:
  base: 4px
  pageGutter: "clamp(20px, 5.2vw, 88px)"
rounded:
  card: 10px
  control: 8px
  pill: 999px
motion:
  durationFast: 150ms
  durationRegular: 240ms
  easing: "cubic-bezier(.2,.8,.2,1)"
---

# BharatFlix · DESIGN.md

## Overview
**Nocturne Cinema:** gallery-grade restraint, cinematic scale, editorial hierarchy. The artwork is the star; interface chrome recedes behind it. Inspired by OTT content rails and language-first browsing, not by any third-party branding. Matte near-black, neutral slate panels, and restrained champagne accents project an upscale service.

Do not use violet/purple neon, decorative gradients, gradient-only pseudo-posters, fake ratings for released films or excessive frosted-glass effects.

## Colors
| Token | Value | Role |
| --- | --- | --- |
| Background | `#080C10` | Neutral base |
| Surface | `#12181F` | Panels, dialogs and CMS sidebar |
| Raised | `#1B232C` | Hover and raised cards |
| Text | `#F5F3EC` | Primary text |
| Muted | `#AAB2BB` | Supporting text |
| Subtle | `#818C98` | Tertiary metadata |
| Champagne | `#D8B47B` | Calls to action and selected states |
| Hover | `#EACB98` | Hover states |
| Outline | `rgba(240,236,227,.13)` | Quiet separation |

Use gold sparingly. Gold text on near-black identifies selected controls; body copy is warm white. Preserve image colors and use dark overlays only for legibility.

## Typography
- Inter when available, followed by system UI fonts; no external font dependency.
- Hero display 56–104px desktop / 40–64px mobile, section titles 26–38px.
- Body 14–16px at line height ≥1.5. Label caps 10–12px with tracking.
- One primary headline and supporting line; avoid multiple competing badge labels.

## Layout
- Max 1710px canvas, gutters `clamp(20px,5.2vw,88px)`.
- Consistent 2:3 poster rails, intentional whitespace, 44px interactive targets.
- Responsive mobile across 390/730/1040/1220px; preserve keyboard scrolling.

## Elevation & Depth
- Matte surfaces with fine borders and minimal shadows.
- No decorative gradients, purple glow, floating orbs, or abstract SVG film art.
- Allowed: dark-to-transparent scrims over authentic film imagery for text contrast.

## Shapes
8px controls, 10px cards, 14px large editorial containers; understated scale ≤1.02; reduced-motion accessibility.

## Components
- **Nav:** clear location, active state, search, My Space.
- **Hero:** authentic film art or illustrative photo, editorial title, metadata, one primary and one secondary CTA.
- **Movie cards:** real open-film poster remains intact; fictional demo entries use real photos with HTML title overlay and explicit concept labeling.
- **Explore:** accessible type/genre/language/year filters and sort.
- **Detail:** film licenses and concept-photo credits on relevant pages.
- **Player:** respect embedded platform controls and media-rights terms.
- **My Space:** neutral cards, progress bars in champagne.
- **Admin:** same design tokens without altering CMS state or colleague-owned backend logic.

## Do's and Don'ts
Do: use verified source links, credit photographs, distinguish fictional concepts, retain semantic headings and focus states, test mobile.

Don't: imply stock photography is an actual film poster, use unlicensed commercial assets, obscure rights, use magenta/purple gradients, or invent commercial catalog access.

## Implementation Contract
`src/app/globals.css` is the appearance source of truth. This `DESIGN.md` defines its tokens, hierarchy, and component behavior. CMS contributors should use shared CSS variables but keep functionality changes in separate feature branches. The application remains a prototype, not a production streaming service.
