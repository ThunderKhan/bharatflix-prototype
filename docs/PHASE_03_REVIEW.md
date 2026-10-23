# Phase 3 — Native OTT playback (editorial revision)

## Delivered
- `/watch/[id]` routes for open films and all 14 fictional series episodes.
- **Video.js 10 React `NeutralVideoSkin`** over a native HTML5 `<video>` element: no YouTube embeds or third-party video-player branding.
- Seek, volume, fullscreen, rate and text-track-ready controls provided by Video.js; progress persists locally.
- Previous/next episode navigation, accessible playback errors, and in-player title information.

## Licensed sample streams
- *Big Buck Bunny* — full Blender Foundation open film (CC BY 3.0): https://storage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4; filmmaker source https://studio.blender.org/projects/big-buck-bunny/.
- *Elephants Dream* — Blender Foundation open film: https://storage.googleapis.com/gtv-videos-bucket/sample/ElephantsDream.mp4; filmmaker source https://studio.blender.org/projects/elephants-dream/.
- Other title routes — **clearly labeled unrelated** CC0 flower sample: https://interactive-examples.mdn.mozilla.net/media/cc0-videos/flower.mp4.

## Acceptance checks
1. Player controls are present without any iframe.
2. Play/pause, seek, volume, fullscreen and keyboard interactions work in the target browser.
3. Exit and re-enter a title; previously saved progress resumes.
4. Navigate previous/next episode without losing the correct title context.
5. Simulate a media-loading failure and verify recovery UI.

## Limitations
A prototype, not DRM, paid streaming, licensed commercial catalogue, secured playback or cloud transcoding. Video.js player UI and remote MP4 availability still need live-browser and network verification. Preview stream availability may change.
