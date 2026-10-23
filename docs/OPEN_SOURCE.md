# Open-source provenance & asset ledger

This project **adapts actual source code patterns** from the MIT-licensed `xalonious/streaming-app` project rather than cloning its whole application.

## Adaptations

| Local path | Upstream source | Substantive adaptation |
|---|---|---|
| `src/components/home/title-row.tsx` | [CardRow.tsx](https://github.com/xalonious/streaming-app/blob/main/frontend/src/components/rows/CardRow.tsx) | `useRef` scroller, measure card+gap, `scrollBy` direction; added labelled controls and local data |
| `src/components/home/title-card.tsx` | [MediaCard.tsx](https://github.com/xalonious/streaming-app/blob/main/frontend/src/components/cards/MediaCard.tsx) | Card poster/metadata/rank structure; rewired to fictional catalogue, Next Image and button interaction |
| `src/components/home/featured-hero.tsx` | [HeroSection.tsx](https://github.com/xalonious/streaming-app/blob/main/frontend/src/components/layout/HeroSection.tsx) | Image/gradient/text layer pattern, featured slide selector; removed TMDB fetches, logo API, autoplay and stream sources |

These files were reviewed in October 2026. The app's other components are original unless otherwise noted. Reuse is governed by the notice below.

## Required MIT copyright and license notice

Copyright (c) 2026 xalonious

Permission is hereby granted, free of charge, to any person
obtaining a copy of this software and associated documentation
files (the "Software"), to deal in the Software without
restriction, including without limitation the rights to use,
copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software
is furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be
included in all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND,
EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES
OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND
NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT
HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY,
WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING
FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR
OTHER DEALINGS IN THE SOFTWARE.

## Other dependencies

- [lucide-react](https://github.com/lucide-icons/lucide) — ISC, used for outline icons; license remains in the installed package.
- Next.js, React, Tailwind CSS — normal package-distribution licenses; consult upstream LICENSE for current installed version.

## Visual and media assets

- `public/artwork/*.svg` — original code-generated abstract conceptual art for invented film/series titles. Not copied from any streaming platform or film campaign.
- No movie footage, media streams, commercial images, downloaded YouTube content, or third-party streaming providers are included in Phase 01.
- Do not assume a GitHub project with no LICENSE is permissible to copy. Do not copy Jellyfin GPL source into a proprietary project without reviewing copyleft obligations.
