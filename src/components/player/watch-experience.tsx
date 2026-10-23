"use client";

import Image from "next/image";
import Link from "next/link";
import { useRef, useState } from "react";
import { ArrowLeft, ArrowRight, AlertCircle, Clapperboard, Film, Info, PlayCircle, Youtube } from "lucide-react";
import { saveViewingProgress, useDemoLibrary } from "@/lib/demo-library";
import { DEMO_MP4, DEMO_YOUTUBE_ID, type WatchTarget } from "@/lib/demo-media";

/** Native sample + official YouTube embed. No unauthorized video streams or YouTube UI overlays. */
export function WatchExperience({ target }: { target: WatchTarget }) {
  const [provider, setProvider] = useState<"sample" | "youtube">(target.title.youtubeId ? "youtube" : "sample");
  const [videoError, setVideoError] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);
  const library = useDemoLibrary();
  const saved = library.history.find((item) => item.id === target.id);
  const lastSave = useRef(0);
  const heading = target.episode ? target.episode.title : target.title.title;
  return <main className="watch-screen">
    <header className="watch-topbar">
      <Link href={`/title/${target.title.slug}`} className="watch-back"><ArrowLeft size={19}/> Back to title</Link>
      <Link href="/" className="watch-wordmark">bharat<span>flix</span><b>.</b></Link>
      <span className="watch-demo-label"><span/> INTERACTIVE DEMO</span>
    </header>
    <section className="watch-shell" aria-labelledby="watch-heading">
      <div className="watch-intro"><div><span className="section-eyebrow">{target.episode ? `SEASON ${target.seasonNumber} · EPISODE ${target.episode.number}` : "FEATURE FILM"} / PREVIEW</span><h1 id="watch-heading">{heading}</h1><p>{target.title.title}{target.episode ? ` · ${target.episode.runtime}` : ` · ${target.title.runtime}`}</p></div><Link href={`/title/${target.title.slug}`} className="watch-more"><Info size={17}/> Title information</Link></div>
      <div className="watch-cinema">
        {provider === "sample" ? <>
          {videoError ? <div className="watch-error"><AlertCircle size={32}/><strong>Sample video unavailable</strong><p>Check your network connection, or try the YouTube sample below.</p><button type="button" onClick={() => {setVideoError(false);videoRef.current?.load();}}>Try again</button></div> : <video key={target.id} ref={videoRef} poster={target.title.backdrop} controls playsInline preload="metadata" onLoadedMetadata={(event) => {if (saved && saved.seconds > 0 && saved.seconds < event.currentTarget.duration - 0.5) event.currentTarget.currentTime = saved.seconds;}} onTimeUpdate={(event) => {const now = Date.now(); if (now - lastSave.current > 2500 && event.currentTarget.duration > 0) {lastSave.current = now; saveViewingProgress(target.id, event.currentTarget.currentTime, event.currentTarget.duration);}}} onPause={(event) => {if (event.currentTarget.duration > 0) saveViewingProgress(target.id, event.currentTarget.currentTime, event.currentTarget.duration);}} onEnded={(event) => {if (event.currentTarget.duration > 0) saveViewingProgress(target.id, event.currentTarget.duration, event.currentTarget.duration);}} onError={() => setVideoError(true)} aria-label={`Sample clip for ${heading}`}><source src={DEMO_MP4} type="video/mp4"/>Your browser does not support HTML5 video.</video>}
        </> : <iframe title={`${target.title.youtubeId ? target.title.title : "Big Buck Bunny"} — official YouTube embed`} loading="lazy" src={`https://www.youtube-nocookie.com/embed/${target.title.youtubeId ?? DEMO_YOUTUBE_ID}?rel=0`} allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" allowFullScreen referrerPolicy="strict-origin-when-cross-origin" />}
        <span className="watch-overlay-label"><Clapperboard size={14}/> {provider === "youtube" && target.title.youtubeId ? "OFFICIAL OPEN FILM · YOUTUBE" : `SAMPLE FOOTAGE — NOT ${target.title.title.toUpperCase()}`}</span>
      </div>
      <div className="watch-provider-row"><div className="watch-tabs" role="group" aria-label="Video source"><button type="button" aria-pressed={provider === "sample"} onClick={() => {setProvider("sample");setVideoError(false);}}><PlayCircle size={17}/> Browser player</button><button type="button" aria-pressed={provider === "youtube"} onClick={() => setProvider("youtube")}><Youtube size={17}/> {target.title.youtubeId ? "Official film" : "YouTube demo"}</button></div><div className="watch-playback-note"><Info size={16}/> HTML5 playback saves progress locally. YouTube viewing progress is not yet synchronized.</div></div>
      <div className="watch-next-row"><div><span className="section-eyebrow">UP NEXT</span><h2>{target.nextId ? "The next chapter awaits" : "Discover more stories"}</h2><p>{target.episode?.synopsis ?? target.title.synopsis}</p></div><div className="watch-next-actions">{target.previousId && <Link href={`/watch/${target.previousId}`} className="button-secondary"><ArrowLeft size={16}/> Previous episode</Link>}{target.nextId ? <Link href={`/watch/${target.nextId}`} className="button-primary">Next episode <ArrowRight size={16}/></Link> : <Link href="/explore" className="button-primary"><Film size={17}/> Explore films</Link>}</div></div>
      <div className="watch-credits"><Image src={target.title.poster} width={52} height={76} alt=""/><div><strong>{target.title.title}</strong><p>{target.title.year} · {target.title.genres.join(" · ")}</p><small>{provider === "youtube" && target.title.youtubeId ? "Official Blender open film embedded with YouTube's native player. Artwork attribution and license on the film detail page." : "Demo clips: MDN CC0 flower / Blender Foundation Big Buck Bunny (CC BY 3.0). Embedded YouTube controls remain intact."}</small></div></div>
    </section>
  </main>;
}
