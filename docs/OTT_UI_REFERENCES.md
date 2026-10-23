# OTT interface references and media-rights boundaries

User-provided screenshot: current bharatflix.xyz shows trending movies, trending TV, Bollywood, Netflix, Prime Video and Disney+ content shelves. The prototype now mirrors the **layout taxonomy** without asserting it has distribution rights to third-party films.

## Interface research
- [Netflix-themed DESIGN.md study](https://github.com/ndroussi/design-md-for-ai/blob/main/design-md/netflix/DESIGN.md): black/charcoal, media-first cards, 2:3 posters, compact density. Patterns only; its marks and custom font are not reused.
- [Google Labs DESIGN.md specification](https://github.com/google-labs-code/design.md/blob/main/docs/spec.md): portable design tokens, component rules and responsive contract.
- [Video.js 10 React player](https://videojs.org/docs/framework/react/reference/components/video-skin): Apache-2.0 licensed video-player UI; using `NeutralVideoSkin`, no YouTube iframe.
- [Tata Play Binge](https://www.tataplaybinge.com/) and [Prime Video](https://www.primevideo.com/) referenced for horizontal content rails, genre/language browsing and player treatment.

## Provider distinctions
Netflix, Prime Video, Disney+, JioHotstar, and Tata Play Binge are linked **only to their own official homepages**. They are external browse references, not video providers for BharatFlix. No commercial movie posters or streams from those services are included.

## Licensed demo playback
- Big Buck Bunny — Blender Foundation, CC BY 3.0. MP4 delivered from Google's public demo bucket, rights remain with original creator. Source: https://studio.blender.org/projects/big-buck-bunny/
- Elephants Dream — Blender Foundation open movie. MP4 delivered from Google's public demo bucket. Source: https://studio.blender.org/projects/elephants-dream/
- Other catalogue titles — MDN's CC0 flower sample. Clearly **not** the selected film. Source: https://interactive-examples.mdn.mozilla.net/media/cc0-videos/flower.mp4

Remote MP4 links require internet connectivity and can be moved; test in the target deployment environment. Do not claim end-to-end production playback or DRM support. Production should use signed client-licensed streams and server-side authorization.
