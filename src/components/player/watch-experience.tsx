"use client";

import Image from "next/image";
import Link from "next/link";
import { useRef, useState } from "react";
import { ArrowLeft, ArrowRight, AlertCircle, Film, Info, ShieldCheck } from "lucide-react";
import { Video, VideoPlayer, NeutralVideoSkin } from "@videojs/react/video";
import "@videojs/react/video/neutral-skin.css";
import { saveViewerProgress, useViewerLibrary } from "@/lib/viewer-library";
import { resolvePlaybackSource, type WatchTarget } from "@/lib/demo-media";

/** Video.js 10 native media engine + accessible neutral control skin. No YouTube iframe. */
export function WatchExperience({ target }: { target: WatchTarget }) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const lastSave = useRef(0);
  const [failed, setFailed] = useState(false);
  const [retryKey, setRetryKey] = useState(0);
  const {library,account} = useViewerLibrary();
  const saved = library.history.find((entry) => entry.id === target.id);
  const source = resolvePlaybackSource(target);
  const heading = target.episode?.title ?? target.title.title;

  function save(video: HTMLVideoElement, force = false) {
    if (!Number.isFinite(video.duration) || video.duration <= 0) return;
    const now = Date.now();
    if (!force && now - lastSave.current < 3500) return;
    lastSave.current = now;
    saveViewerProgress(target.id, video.currentTime, video.duration);
  }

  return <main className="watch-screen watch-screen-cinema">
    <div className="watch-theater-header">
      <Link href={`/title/${target.title.slug}`} className="watch-theater-back"><ArrowLeft size={22} aria-hidden="true"/><span>Back</span></Link>
      <div className="watch-theater-identity"><small>{target.episode ? `S${target.seasonNumber} Â· E${target.episode.number}` : "NOW PLAYING"}</small><strong>{heading}</strong></div>
      <Link href={`/title/${target.title.slug}`} className="watch-theater-info"><Info size={19} aria-hidden="true"/><span>Details</span></Link>
    </div>

    <section className="watch-theater-stage" aria-label={`Player for ${heading}`}>
      <div className="watch-player-frame">
        {failed ? <div className="watch-player-error" role="alert"><AlertCircle size={36}/><h1>Video unavailable</h1><p>The licensed sample could not load. Check your connection, or try reloading the player.</p><button type="button" className="button-primary" onClick={() => { setFailed(false); setRetryKey((current) => current + 1); }}>Reload player</button></div> :
          <VideoPlayer key={`${target.id}-${retryKey}`} poster={target.title.backdrop}>
            <NeutralVideoSkin className="bharatflix-videojs">
              <Video
                ref={videoRef}
                src={source.url}
                playsInline
                preload="metadata"
                onLoadedMetadata={(event) => {
                  const v = event.currentTarget;
                  if (saved && saved.seconds > 0 && saved.seconds < v.duration - 3) v.currentTime = saved.seconds;
                }}
                onTimeUpdate={(event) => save(event.currentTarget)}
                onPause={(event) => save(event.currentTarget, true)}
                onEnded={(event) => save(event.currentTarget, true)}
                onError={() => setFailed(true)}
                aria-label={`${source.fullFilm ? "Open film" : "Demo preview"}: ${heading}`}
              />
            </NeutralVideoSkin>
          </VideoPlayer>}
      </div>
      <div className="watch-under-player"><span><ShieldCheck size={15} aria-hidden="true"/>{source.fullFilm ? "Licensed open film" : "Sample footage Â· not the selected title"}</span><span>{account ? "Progress saved to your account" : "Sign in to save progress across sessions"}</span></div>
      <div className="watch-next-row"><div><span className="section-eyebrow">UP NEXT</span><h2>{target.nextId ? "The next chapter awaits" : "Discover more stories"}</h2><p>{target.episode?.synopsis ?? target.title.synopsis}</p></div><div className="watch-next-actions">{target.previousId && <Link href={`/watch/${target.previousId}`} className="button-secondary"><ArrowLeft size={16}/> Previous episode</Link>}{target.nextId ? <Link href={`/watch/${target.nextId}`} className="button-primary">Next episode <ArrowRight size={16}/></Link> : <Link href="/explore" className="button-primary"><Film size={17}/> Explore films</Link>}</div></div>
      <div className="watch-credits"><Image src={target.title.poster} width={52} height={76} alt=""/><div><strong>{target.title.title}</strong><p>{target.title.year} Â· {target.title.genres.join(" Â· ")}</p><small>Video credits: MDN CC0 flower sample / Blender Foundation, Big Buck Bunny (CC BY 3.0). YouTube&apos;s native interface is maintained.</small></div></div>
    </section>

    <section className="watch-content-below" aria-label="Viewing information">
      <div className="watch-content-summary"><span className="section-eyebrow">BHARATFLIX PLAYER</span><h1>{heading}</h1><p>{target.title.title}{target.episode ? ` Â· S${target.seasonNumber}E${target.episode.number}` : ""} Â· {target.title.year} Â· {target.title.runtime}</p><small>{source.credit}</small></div>
      <div className="watch-content-actions">{target.previousId && <Link href={`/watch/${target.previousId}`} className="button-secondary"><ArrowLeft size={17}/> Previous episode</Link>}{target.nextId ? <Link href={`/watch/${target.nextId}`} className="button-primary">Next episode <ArrowRight size={18}/></Link> : <Link href="/explore" className="button-secondary"><Film size={17}/> Explore titles</Link>}</div>
    </section>
    <div className="watch-related-title"><Image src={target.title.poster} alt="" width={44} height={66}/><div><strong>{target.title.title}</strong><p>{target.title.synopsis}</p></div><Link href={`/title/${target.title.slug}`}>View title <ArrowRight size={15}/></Link></div>
  </main>;
}
