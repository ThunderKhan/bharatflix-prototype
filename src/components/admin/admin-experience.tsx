"use client";

import Image from "next/image";
import Link from "next/link";
import { useMemo, useState } from "react";
import {
  Activity, ArrowDown, ArrowRight, ArrowUp, BarChart3, CalendarClock, Check, CheckCircle2,
  ChevronDown, ClipboardList, Clapperboard, Clock3, Download, ExternalLink, Eye, EyeOff,
  FileCheck2, Film, FolderOpen, Image as ImageIcon, LayoutDashboard, LayoutTemplate, ListFilter,
  LockKeyhole, MonitorPlay, PackageCheck, Pencil, Plus, RotateCcw, Search,
  ShieldAlert, ShieldCheck, Sparkles, Trash2, UsersRound, X,
} from "lucide-react";
import { createDemoTitle, editDemoTitle, resetDemoCMS, useDemoCMS } from "@/lib/demo-cms";
import { LICENSED_FILM_MP4 } from "@/lib/demo-media";
import {
  SHELVES, completeIntake, moveFeatured, orderFeatured, queueIntake, recordOperatorEvent,
  removeReleasePlan, resetDemoOperations, setReleasePlan, setRightsReview,
  setShelfVisible, useDemoOperations, type RightsState,
} from "@/lib/demo-ops";
import type { MediaKind, MediaTitle } from "@/types/media";
import "./admin-studio.css";

type Section = "overview" | "catalogue" | "editorial" | "media" | "releases" | "rights" | "insights";
type Form = { slug: string; title: string; synopsis: string; published: boolean; featured: boolean };
type StatusFilter = "all" | "published" | "draft";
const sections: { id: Section; name: string; caption: string; icon: typeof LayoutDashboard }[] = [
  { id: "overview", name: "Overview", caption: "Operations snapshot", icon: LayoutDashboard },
  { id: "catalogue", name: "Content library", caption: "Titles and publishing", icon: FolderOpen },
  { id: "editorial", name: "Homepage curation", caption: "Features and shelves", icon: LayoutTemplate },
  { id: "media", name: "Media operations", caption: "Asset readiness", icon: MonitorPlay },
  { id: "releases", name: "Release planner", caption: "Editorial calendar", icon: CalendarClock },
  { id: "rights", name: "Rights checklist", caption: "Content compliance", icon: ShieldCheck },
  { id: "insights", name: "Catalogue insights", caption: "Content distribution", icon: BarChart3 },
];
const formatDate = (iso: string) => { const t = new Date(iso); return Number.isNaN(t.getTime()) ? iso : t.toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" }); };
function percent(part: number, total: number) { return total ? Math.round((part / total) * 100) : 0; }
function csvCell(value: string | number) { return `"${String(value).replaceAll('"','""')}"`; }

export function AdminExperience() {
  const { all, published, cms } = useDemoCMS();
  const ops = useDemoOperations();
  const [section, setSection] = useState<Section>("overview");
  const [query, setQuery] = useState("");
  const [kind, setKind] = useState<MediaKind | "all">("all");
  const [visibility, setVisibility] = useState<StatusFilter>("all");
  const [selected, setSelected] = useState<Form | null>(null);
  const [selectedRows, setSelectedRows] = useState<string[]>([]);
  const [createOpen, setCreateOpen] = useState(false);
  const [newTitle, setNewTitle] = useState("");
  const [newSynopsis, setNewSynopsis] = useState("");
  const [newKind, setNewKind] = useState<MediaKind>("movie");
  const [notice, setNotice] = useState("");
  const [planSlug, setPlanSlug] = useState("");
  const [planDate, setPlanDate] = useState("");
  const [planNote, setPlanNote] = useState("");
  const [assetSlug, setAssetSlug] = useState("");
  const [assetType, setAssetType] = useState<"poster" | "video" | "subtitles">("video");

  const edits = useMemo(() => new Map(cms.edits.map((item) => [item.slug, item])), [cms.edits]);
  const rights = useMemo(() => new Map(ops.rights.map((item) => [item.slug, item.status])), [ops.rights]);
  const isPublished = (slug: string) => edits.get(slug)?.published !== false;
  const featured = useMemo(() => orderFeatured(published.filter((item) => item.featured), ops.featuredOrder), [published, ops.featuredOrder]);
  const draftCount = all.length - published.length;
  const filmCount = all.filter((item) => item.kind === "movie").length;
  const seriesCount = all.length - filmCount;
  const openFilmCount = all.filter((item) => item.mediaOrigin === "open-film").length;
  const nativePlaybackCount = all.filter((item) => Boolean(LICENSED_FILM_MP4[item.slug])).length;
  const reviewedCount = ops.rights.filter((item) => item.status === "reviewed").length;
  const heldCount = ops.rights.filter((item) => item.status === "hold").length;
  const activeShelves = SHELVES.length - ops.hiddenShelves.length;
  const filtered = useMemo(() => all.filter((item) => {
    const matchesQuery = `${item.title} ${item.slug} ${item.kind} ${item.language} ${item.genres.join(" ")}`.toLowerCase().includes(query.trim().toLowerCase());
    const record = edits.get(item.slug);
    const show = record?.published !== false;
    return matchesQuery && (kind === "all" || item.kind === kind) && (visibility === "all" || (visibility === "published" ? show : !show));
  }), [all, query, kind, visibility, edits]);
  const selectedFiltered = selectedRows.filter((slug) => filtered.some((item) => item.slug === slug));
  const releases = [...ops.releases].sort((a, b) => a.date.localeCompare(b.date));
  const titleName = (slug: string) => all.find((item) => item.slug === slug)?.title ?? slug;
  const languages = useMemo(() => tally(all.flatMap((item) => [item.language])), [all]);
  const genres = useMemo(() => tally(all.flatMap((item) => item.genres)), [all]);

  function switchSection(next: Section) { setSection(next); setNotice(""); }
  function editTitle(title: MediaTitle) {
    setSelected({ slug: title.slug, title: title.title, synopsis: title.synopsis, published: isPublished(title.slug), featured: title.featured });
  }
  function saveEdit() {
    if (!selected || !selected.title.trim() || !selected.synopsis.trim()) return;
    if (selected.published && rights.get(selected.slug) === "hold") {
      setNotice("This title has a rights hold. Clear its checklist status before publishing."); return;
    }
    editDemoTitle({ ...selected, title: selected.title.trim(), synopsis: selected.synopsis.trim() });
    recordOperatorEvent(`Updated ${selected.title.trim()} · ${selected.published ? "published" : "draft"}`);
    setSelected(null);
    setNotice("Catalogue change saved. It appears on the viewer site in this browser.");
  }
  function bulkPublish(publish: boolean) {
    const toProcess = selectedFiltered.map((slug) => all.find((item) => item.slug === slug)).filter((item): item is MediaTitle => Boolean(item));
    const allowed = publish ? toProcess.filter((item) => rights.get(item.slug) !== "hold") : toProcess;
    allowed.forEach((item) => editDemoTitle({ slug: item.slug, title: item.title, synopsis: item.synopsis, featured: item.featured, published: publish }));
    recordOperatorEvent(`Bulk ${publish ? "published" : "unpublished"} ${allowed.length} catalogue titles`);
    setSelectedRows([]);
    setNotice(`${allowed.length} title${allowed.length === 1 ? "" : "s"} updated.${allowed.length !== toProcess.length ? " Titles on rights hold were skipped." : ""}`);
  }
  function toggleFeatured(item: MediaTitle) {
    if (rights.get(item.slug) === "hold") { setNotice("A title on rights hold cannot be featured."); return; }
    editDemoTitle({ slug: item.slug, title: item.title, synopsis: item.synopsis, featured: !item.featured, published: isPublished(item.slug) });
    recordOperatorEvent(`${item.featured ? "Removed" : "Added"} homepage feature: ${item.title}`);
    setNotice(`${item.title} ${item.featured ? "removed from" : "added to"} homepage features.`);
  }
  function changeRights(item: MediaTitle, status: RightsState) {
    setRightsReview(item.slug, status);
    if (status === "hold") {
      editDemoTitle({ slug: item.slug, title: item.title, synopsis: item.synopsis, published: false, featured: false });
      recordOperatorEvent(`Rights hold removed ${item.title} from the viewer catalogue`);
      setNotice(`${item.title} placed on rights hold and unpublished from this browser's storefront.`);
    } else {
      setNotice(`Updated internal rights checklist for ${item.title}. This is not a legal clearance.`);
    }
  }
  function downloadCSV() {
    const header = ["Title", "Slug", "Format", "Year", "Language", "Genres", "State", "Featured", "Source"].map(csvCell);
    const rows = filtered.map((item) => [item.title, item.slug, item.kind, item.year, item.language, item.genres.join(" / "), isPublished(item.slug) ? "Published" : "Draft", item.featured ? "Yes" : "No", item.mediaOrigin === "open-film" ? "Open film" : "Concept"].map(csvCell));
    const content = [header, ...rows].map((row) => row.join(",")).join("\r\n");
    const blob = new Blob(["\uFEFF" + content], { type: "text/csv;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a"); link.href = url; link.download = "bharatflix-catalogue-demo.csv"; link.click();
    URL.revokeObjectURL(url);
    setNotice(`Exported ${filtered.length} catalogue records as CSV.`);
  }
  function createTitle() {
    const ok = createDemoTitle({ title: newTitle, synopsis: newSynopsis, kind: newKind });
    if (!ok) { setNotice("Enter a title with 3+ characters and a synopsis with 15+ characters."); return; }
    recordOperatorEvent(`Created draft ${newTitle.trim()}`);
    setCreateOpen(false); setNewTitle(""); setNewSynopsis(""); switchSection("catalogue");
    setNotice("Draft created. It uses concept artwork until a licensed asset is assigned.");
  }
  function schedule() {
    if (!planSlug || !planDate || !setReleasePlan(planSlug, planDate, planNote)) { setNotice("Choose a title and a valid release date."); return; }
    setPlanSlug(""); setPlanDate(""); setPlanNote(""); setNotice("Release plan saved to the local demo calendar. This does not automatically publish media.");
  }
  function addIntake() {
    if (!assetSlug) { setNotice("Select a title to create an intake task."); return; }
    queueIntake(assetSlug, assetType); setAssetSlug("");
    setNotice("Asset intake checklist created. No file was uploaded or transcoded.");
  }

  const heading = sections.find((item) => item.id === section)!;
  return <div className="studio-shell">
    <aside className="studio-side" aria-label="Operator Studio navigation">
      <Link href="/" className="studio-brand"><Clapperboard size={23}/><span>Bharat<span>Flix</span></span><small>STUDIO</small></Link>
      <div className="studio-workspace"><span className="studio-workspace-icon"><LayoutDashboard size={19}/></span><span><strong>Content operations</strong><small>Client demonstration</small></span><ChevronDown size={16}/></div>
      <div className="studio-nav-label">WORKSPACE</div>
      <nav className="studio-nav">{sections.map((item) => <button key={item.id} type="button" aria-current={section === item.id ? "page" : undefined} onClick={() => switchSection(item.id)}><item.icon size={18}/><span>{item.name}</span>{item.id === "catalogue" && <small>{all.length}</small>}</button>)}</nav>
      <div className="studio-nav-label studio-nav-label-bottom">ACCESS & PREVIEW</div>
      <nav className="studio-nav studio-secondary-nav"><Link href="/admin/users"><UsersRound size={18}/> User management <ExternalLink size={13}/></Link><Link href="/" target="_blank" rel="noopener noreferrer"><Eye size={18}/> View storefront <ExternalLink size={13}/></Link></nav>
      <div className="studio-side-footer"><span className="studio-live-dot"/><div><strong>Local demo workspace</strong><small>Changes are browser-specific</small></div></div>
    </aside>
    <main className="studio-main">
      <header className="studio-topbar"><div className="studio-breadcrumb"><span>BharatFlix</span><span className="studio-breadcrumb-separator">/</span><strong>Operator Studio</strong><span className="studio-breadcrumb-separator">/</span>{heading.name}</div><div className="studio-top-actions"><span className="studio-demo-pill"><span/> DEMO MODE</span><Link href="/" target="_blank" rel="noopener noreferrer"><ExternalLink size={15}/> View site</Link></div></header>
      <div className="studio-content">
        <div className="studio-page-head"><div><div className="studio-eyebrow">CONTENT OPERATIONS <span>/</span> BHARATFLIX</div><h1>{heading.name}</h1><p>{heading.caption}. Preview how a streaming service team manages its catalogue and editorial workflows.</p></div><button type="button" className="studio-primary" onClick={() => {setCreateOpen(true);setNotice("");}}><Plus size={18}/> Add title</button></div>
        <div className="studio-disclaimer"><InfoIcon/> <span><strong>Presentation environment:</strong> cataloguing, curation, release plans, media tasks and rights reviews are saved only in this browser. Accounts are authenticated, but the CMS is not yet connected to a shared content database or upload/transcoding pipeline. No fabricated viewership metrics are shown.</span></div>
        {notice && <div className="studio-toast" role="status"><CheckCircle2 size={17}/><span>{notice}</span><button type="button" onClick={() => setNotice("")} aria-label="Dismiss notification"><X size={15}/></button></div>}

        {section === "overview" && <>
          <div className="studio-kpis">
            <Kpi icon={Film} label="Total catalogue" value={all.length} sub={`${filmCount} films · ${seriesCount} series`}/>
            <Kpi icon={CheckCircle2} label="Published titles" value={published.length} sub={`${percent(published.length, all.length)}% of catalogue`}/>
            <Kpi icon={Clock3} label="Draft titles" value={draftCount} sub="Awaiting publication"/>
            <Kpi icon={LayoutTemplate} label="Homepage shelves" value={`${activeShelves}/${SHELVES.length}`} sub={`${featured.length} featured titles`}/>
          </div>
          <div className="studio-overview-layout"><section className="studio-panel studio-feature-panel"><div className="studio-panel-heading"><div><span className="studio-eyebrow">EDITORIAL CONTROL</span><h2>Featured on BharatFlix</h2><p>These titles appear in the storefront hero. Use curation to change order or visibility.</p></div><button type="button" className="studio-quiet-button" onClick={() => switchSection("editorial")}>Manage <ArrowRight size={15}/></button></div><div className="studio-feature-grid">{featured.slice(0,4).map((item, index) => <div className="studio-feature-item" key={item.slug}><div className="studio-feature-poster"><Image src={item.poster} alt="" fill sizes="90px"/></div><div><small>FEATURE {String(index+1).padStart(2,"0")}</small><strong>{item.title}</strong><span>{item.year} · {item.kind === "movie" ? "Film" : "Series"}</span></div></div>)}{!featured.length && <Empty message="No published featured titles. Open Homepage curation to add some."/>}</div></section>
            <section className="studio-panel"><div className="studio-panel-heading"><div><span className="studio-eyebrow">PLATFORM READINESS</span><h2>Content health</h2><p>Checks calculated from catalogue records.</p></div></div><div className="studio-health"><Progress label="Metadata entered" current={all.filter((x)=>Boolean(x.title && x.synopsis && x.language)).length} total={all.length}/><Progress label="Poster assigned" current={all.filter((x)=>Boolean(x.poster)).length} total={all.length}/><Progress label="Actual open-film playback" current={nativePlaybackCount} total={all.length}/><Progress label="Rights checklist reviewed" current={reviewedCount} total={all.length}/></div><div className="studio-health-foot"><ShieldAlert size={17}/><span>Artwork or demo-player availability is not proof of distribution rights.</span></div></section>
          </div>
          <div className="studio-bottom-grid"><section className="studio-panel"><div className="studio-panel-heading"><div><span className="studio-eyebrow">RELEASE PIPELINE</span><h2>Upcoming plans</h2></div><button className="studio-quiet-button" type="button" onClick={() => switchSection("releases")}>View planner <ArrowRight size={15}/></button></div>{releases.slice(0,4).map((item)=><div key={item.slug} className="studio-simple-row"><span className="studio-mini-icon"><CalendarClock size={17}/></span><span><strong>{titleName(item.slug)}</strong><small>{item.note || "Planned release"}</small></span><em>{formatDate(item.date)}</em></div>)}{!releases.length && <Empty message="No release plans yet. Schedule one for the client demo."/>}</section>
            <section className="studio-panel"><div className="studio-panel-heading"><div><span className="studio-eyebrow">WORKSPACE ACTIVITY</span><h2>Recent changes</h2></div></div>{ops.activity.slice(0,5).map((item)=><div key={item.id} className="studio-simple-row"><span className="studio-mini-icon"><Activity size={16}/></span><span><strong>{item.message}</strong><small>Demo operator action</small></span><em>{formatDate(item.at)}</em></div>)}{!ops.activity.length && <Empty message="Editorial edits, rights reviews and release plans will appear here."/>}</section></div>
        </>}

        {section === "catalogue" && <section className="studio-panel studio-library-panel"><div className="studio-panel-heading"><div><span className="studio-eyebrow">CONTENT LIBRARY</span><h2>Manage your catalogue</h2><p>Search, filter, export, publish and prepare titles for release.</p></div><button type="button" className="studio-quiet-button" onClick={downloadCSV}><Download size={16}/> Export CSV</button></div><div className="studio-filters"><label className="studio-search"><Search size={18}/><input aria-label="Search titles" placeholder="Search title, language or genre…" value={query} onChange={(e)=>setQuery(e.target.value)}/></label><label><span className="sr-only">Content format</span><select value={kind} onChange={(e)=>setKind(e.target.value as MediaKind | "all")}><option value="all">All formats</option><option value="movie">Films</option><option value="series">TV series</option></select></label><label><span className="sr-only">Publishing status</span><select value={visibility} onChange={(e)=>setVisibility(e.target.value as StatusFilter)}><option value="all">All statuses</option><option value="published">Published</option><option value="draft">Drafts</option></select></label><span className="studio-result-count"><ListFilter size={14}/> {filtered.length} results</span></div>
          {selectedFiltered.length > 0 && <div className="studio-bulk"><span><Check size={16}/> {selectedFiltered.length} selected</span><button type="button" onClick={()=>bulkPublish(true)}><Eye size={15}/> Publish</button><button type="button" onClick={()=>bulkPublish(false)}><EyeOff size={15}/> Move to draft</button><button type="button" onClick={()=>setSelectedRows([])}>Clear</button></div>}
          <div className="studio-table-scroll"><table className="studio-table"><thead><tr><th><input type="checkbox" aria-label="Select all filtered titles" checked={filtered.length > 0 && filtered.every((x)=>selectedRows.includes(x.slug))} onChange={(e)=>setSelectedRows(e.target.checked ? [...new Set([...selectedRows,...filtered.map((x)=>x.slug)])] : selectedRows.filter((slug)=>!filtered.some((x)=>x.slug===slug)))}/></th><th>CONTENT</th><th>TYPE</th><th>LANGUAGE</th><th>STATUS</th><th>HOMEPAGE</th><th>OPERATIONS</th></tr></thead><tbody>{filtered.map((item)=><tr key={item.slug}><td><input type="checkbox" aria-label={`Select ${item.title}`} checked={selectedRows.includes(item.slug)} onChange={(e)=>setSelectedRows((prev)=>e.target.checked?[...new Set([...prev,item.slug])]:prev.filter((slug)=>slug!==item.slug))}/></td><td><div className="studio-row-title"><span className="studio-table-poster"><Image src={item.poster} alt="" fill sizes="46px"/></span><span><strong>{item.title}</strong><small>{item.year} · {item.genres.slice(0,2).join(", ")}</small></span></div></td><td>{item.kind === "movie" ? "Film" : "Series"}</td><td>{item.language}</td><td><Status state={isPublished(item.slug) ? "published" : "draft"}/></td><td>{item.featured ? <span className="studio-featured-tag"><Sparkles size={14}/> Featured</span> : <span className="studio-muted">—</span>}</td><td><div className="studio-row-actions"><button type="button" onClick={()=>editTitle(item)} aria-label={`Edit ${item.title}`}><Pencil size={16}/> Edit</button><Link href={`/title/${item.slug}`} target="_blank" rel="noopener noreferrer" aria-label={`Preview ${item.title}`}><ExternalLink size={16}/></Link></div></td></tr>)}</tbody></table></div>{!filtered.length && <Empty message="No titles match these filters."/>}<div className="studio-table-footer">Showing {filtered.length} of {all.length} total catalogue records <span>Browser-local publishing state</span></div></section>}

        {section === "editorial" && <div className="studio-stack"><section className="studio-panel"><div className="studio-panel-heading"><div><span className="studio-eyebrow">HOMEPAGE BILLBOARD</span><h2>Featured story order</h2><p>Reorder the hero carousel. Updates are reflected on the storefront in this browser.</p></div><Link href="/" target="_blank" rel="noopener noreferrer" className="studio-quiet-button">Open homepage <ExternalLink size={15}/></Link></div><div className="studio-featured-list">{featured.map((item,index)=><div key={item.slug} className="studio-featured-row"><span className="studio-sequence">{String(index+1).padStart(2,"0")}</span><div className="studio-featured-row-thumb"><Image src={item.backdrop} alt="" fill sizes="100px"/></div><div className="studio-featured-row-info"><strong>{item.title}</strong><small>{item.kind === "movie" ? "Movie" : "Series"} · {item.language}</small></div><span className="studio-featured-badge">LIVE FEATURE</span><div className="studio-row-actions"><button type="button" aria-label={`Move ${item.title} up`} disabled={index===0} onClick={()=>moveFeatured(featured.map((f)=>f.slug),item.slug,-1)}><ArrowUp size={17}/></button><button type="button" aria-label={`Move ${item.title} down`} disabled={index===featured.length-1} onClick={()=>moveFeatured(featured.map((f)=>f.slug),item.slug,1)}><ArrowDown size={17}/></button><button type="button" aria-label={`Remove ${item.title} from feature`} onClick={()=>toggleFeatured(item)}><X size={17}/></button></div></div>)}{!featured.length && <Empty message="Use the catalogue below to select titles for the homepage."/>}</div><div className="studio-feature-picker"><span>ADD A FEATURED TITLE</span><div>{published.filter((item)=>!item.featured).slice(0,8).map((item)=><button type="button" key={item.slug} onClick={()=>toggleFeatured(item)}><Plus size={13}/>{item.title}</button>)}</div></div></section>
          <section className="studio-panel"><div className="studio-panel-heading"><div><span className="studio-eyebrow">DISCOVERY ROWS</span><h2>Homepage shelf visibility</h2><p>These toggles immediately control the content rails shown on the public homepage.</p></div><span className="studio-panel-count">{activeShelves} ACTIVE</span></div><div className="studio-shelf-grid">{SHELVES.map((shelf)=><label key={shelf.id} className="studio-shelf"><span className="studio-shelf-symbol"><LayoutTemplate size={19}/></span><span><strong>{shelf.name}</strong><small>{shelf.description}</small></span><input type="checkbox" className="studio-switch" checked={!ops.hiddenShelves.includes(shelf.id)} onChange={(e)=>setShelfVisible(shelf.id,e.target.checked)}/></label>)}</div></section></div>}

        {section === "media" && <div className="studio-stack"><div className="studio-kpis studio-three"><Kpi icon={ImageIcon} label="Poster references" value={all.filter((x)=>Boolean(x.poster)).length} sub="Catalogue entries with artwork"/><Kpi icon={MonitorPlay} label="Matching full-film samples" value={nativePlaybackCount} sub="Licensed MP4 demo links"/><Kpi icon={ClipboardList} label="Intake checklists" value={ops.intakes.length} sub="Planning records, not uploads"/></div><section className="studio-panel"><div className="studio-panel-heading"><div><span className="studio-eyebrow">ASSET INVENTORY</span><h2>Media readiness</h2><p>Catalogue poster, artwork attribution and playback availability.</p></div></div><div className="studio-media-grid">{all.map((item)=><div className="studio-media-card" key={item.slug}><div className="studio-media-image"><Image src={item.poster} alt="" fill sizes="80px"/></div><div className="studio-media-info"><strong>{item.title}</strong><small>{item.kind === "movie" ? "Film" : "Series"} · {item.year}</small><div className="studio-media-checks"><span className="studio-tiny-good"><CheckCircle2 size={13}/> Artwork</span><span className={item.imageSourceUrl ? "studio-tiny-good" : "studio-tiny-warn"}>{item.imageSourceUrl ? <CheckCircle2 size={13}/> : <ShieldAlert size={13}/>} {item.imageSourceUrl ? "Source credited" : "Concept / needs review"}</span><span className={LICENSED_FILM_MP4[item.slug] ? "studio-tiny-good" : "studio-tiny-warn"}>{LICENSED_FILM_MP4[item.slug] ? <CheckCircle2 size={13}/> : <Clock3 size={13}/>} {LICENSED_FILM_MP4[item.slug] ? "Film MP4 linked" : "Player sample only"}</span></div></div></div>)}</div></section><section className="studio-panel"><div className="studio-panel-heading"><div><span className="studio-eyebrow">ASSET PIPELINE</span><h2>Intake planning</h2><p>Record proposed upload tasks; actual ingest, transcoding, thumbnails and subtitles require the future media backend.</p></div></div><form className="studio-inline-form" onSubmit={(e)=>{e.preventDefault();addIntake();}}><label>CONTENT<select value={assetSlug} onChange={(e)=>setAssetSlug(e.target.value)} required><option value="">Select a title</option>{all.map((item)=><option key={item.slug} value={item.slug}>{item.title}</option>)}</select></label><label>ASSET TYPE<select value={assetType} onChange={(e)=>setAssetType(e.target.value as typeof assetType)}><option value="video">Video master</option><option value="poster">Poster artwork</option><option value="subtitles">Subtitle track</option></select></label><button className="studio-primary" type="submit"><Plus size={17}/> Add intake task</button></form><div className="studio-task-list">{ops.intakes.map((task)=><div className="studio-simple-row" key={task.id}><span className="studio-mini-icon"><PackageCheck size={17}/></span><span><strong>{titleName(task.slug)} · {task.asset}</strong><small>Created {formatDate(task.createdAt)} · Planning only</small></span><Status state={task.status}/>{task.status==="queued"&&<button type="button" className="studio-quiet-button" onClick={()=>completeIntake(task.id)}>Mark reviewed</button>}</div>)}{!ops.intakes.length && <Empty message="No intake tasks. Add one to demonstrate the media operations pipeline."/>}</div></section></div>}

        {section === "releases" && <div className="studio-stack"><section className="studio-panel"><div className="studio-panel-heading"><div><span className="studio-eyebrow">PUBLISHING WORKFLOW</span><h2>Release planner</h2><p>Plan upcoming premieres and editorial campaigns. A release date is not an automatic publish job in this local demo.</p></div></div><form className="studio-inline-form" onSubmit={(e)=>{e.preventDefault();schedule();}}><label>CONTENT<select required value={planSlug} onChange={(e)=>setPlanSlug(e.target.value)}><option value="">Choose title</option>{all.map((item)=><option key={item.slug} value={item.slug}>{item.title}</option>)}</select></label><label>PLANNED DATE<input required type="date" value={planDate} onChange={(e)=>setPlanDate(e.target.value)}/></label><label>CAMPAIGN NOTE<input maxLength={160} value={planNote} onChange={(e)=>setPlanNote(e.target.value)} placeholder="e.g. Weekend premiere"/></label><button className="studio-primary" type="submit"><Plus size={16}/> Save plan</button></form></section><section className="studio-panel"><div className="studio-panel-heading"><div><span className="studio-eyebrow">RELEASE CALENDAR</span><h2>Scheduled editorial activity</h2><p>{releases.length} plan{releases.length === 1 ? "" : "s"} · Stored in this browser</p></div></div>{releases.map((item)=><div className="studio-release-row" key={item.slug}><span className="studio-release-date"><strong>{item.date.slice(8,10)}</strong><small>{new Date(`${item.date}T12:00:00Z`).toLocaleString("en",{month:"short"})}</small></span><div><strong>{titleName(item.slug)}</strong><small>{item.note || "Editorial release"}</small></div><Status state={isPublished(item.slug) ? "published" : "draft"}/><button type="button" className="studio-icon-button" onClick={()=>removeReleasePlan(item.slug)} aria-label={`Remove plan for ${titleName(item.slug)}`}><Trash2 size={18}/></button></div>)}{!releases.length && <Empty message="No release plans. Pick a title and add its proposed premiere date above."/>}</section></div>}

        {section === "rights" && <section className="studio-panel"><div className="studio-panel-heading"><div><span className="studio-eyebrow">CONTENT COMPLIANCE</span><h2>Rights & licensing checklist</h2><p>Record internal review status. These controls do not create or verify any legal distribution rights.</p></div><div className="studio-rights-count"><span><ShieldCheck size={15}/> {reviewedCount} reviewed</span><span><ShieldAlert size={15}/> {heldCount} on hold</span></div></div><div className="studio-table-scroll"><table className="studio-table"><thead><tr><th>CONTENT</th><th>ARTWORK SOURCE</th><th>ASSET/LICENSE REFERENCE</th><th>INTERNAL REVIEW</th></tr></thead><tbody>{all.map((item)=><tr key={item.slug}><td><div className="studio-row-title"><span className="studio-table-poster"><Image src={item.poster} alt="" fill sizes="46px"/></span><span><strong>{item.title}</strong><small>{item.mediaOrigin === "open-film" ? "Blender open film" : "Fictional sample"}</small></span></div></td><td>{item.imageSourceUrl ? <a href={item.imageSourceUrl} target="_blank" rel="noopener noreferrer" className="studio-source-link">View attribution <ExternalLink size={12}/></a> : <span className="studio-muted">Concept artwork</span>}</td><td>{item.artworkLicenseUrl ? <a href={item.artworkLicenseUrl} target="_blank" rel="noopener noreferrer" className="studio-source-link">Artwork license <ExternalLink size={12}/></a> : <span className="studio-muted">Not documented</span>}</td><td><label className="studio-rights-picker"><span className="sr-only">Rights review for {item.title}</span><select value={rights.get(item.slug) ?? "needs-review"} onChange={(e)=>changeRights(item, e.target.value as RightsState)}><option value="needs-review">Needs review</option><option value="reviewed">Reviewed (internal)</option><option value="hold">On hold</option></select></label></td></tr>)}</tbody></table></div><div className="studio-legal-note"><LockKeyhole size={17}/> Changing a title to &quot;Reviewed&quot; is only a local checklist entry. Before any public distribution, VSPH must separately verify video, artwork, territorial and commercial rights.</div></section>}

        {section === "insights" && <div className="studio-stack"><div className="studio-kpis studio-three"><Kpi icon={Film} label="Films" value={filmCount} sub="Current catalogue"/><Kpi icon={MonitorPlay} label="TV series" value={seriesCount} sub="Current catalogue"/><Kpi icon={FileCheck2} label="Open-film references" value={openFilmCount} sub="Credited source projects"/></div><div className="studio-bottom-grid"><section className="studio-panel"><div className="studio-panel-heading"><div><span className="studio-eyebrow">AUDIENCE DISCOVERY</span><h2>Language coverage</h2><p>Based on catalogue metadata, not viewer activity.</p></div></div>{languages.slice(0,10).map(([label,count])=><Progress key={label} label={label} current={count} total={all.length}/>)}</section><section className="studio-panel"><div className="studio-panel-heading"><div><span className="studio-eyebrow">CONTENT MIX</span><h2>Genre distribution</h2><p>Counts include titles tagged with multiple genres.</p></div></div>{genres.slice(0,10).map(([label,count])=><Progress key={label} label={label} current={count} total={all.length}/>)}</section></div><section className="studio-panel studio-analytics-disclosure"><BarChart3 size={24}/><div><h2>Audience analytics integration</h2><p>Watch time, completion rate, churn, conversion and top-performing titles require consent-aware event collection and a real backend. This demo shows catalogue intelligence only; it does not invent engagement KPIs.</p></div><span className="studio-coming-soon">BACKEND INTEGRATION</span></section></div>}

        <footer className="studio-footer"><span><span className="studio-live-dot"/> BharatFlix · VSPH Operator Studio</span><span>Prototype workflow · Local catalogue operations · Not production CMS</span><button type="button" onClick={()=>{if(window.confirm("Restore all local CMS edits, release plans, media tasks and curation settings in this browser?")){resetDemoCMS();resetDemoOperations();setNotice("Local demo catalogue and operations restored.");setSelectedRows([]);}}}><RotateCcw size={15}/> Reset demo</button></footer>
      </div>
    </main>
    {selected && <div className="studio-modal-scrim" role="presentation" onMouseDown={(e)=>{if(e.target===e.currentTarget)setSelected(null);}}><form className="studio-modal" onSubmit={(e)=>{e.preventDefault();saveEdit();}} aria-label="Edit catalogue title"><div className="studio-modal-head"><div><span className="studio-eyebrow">CONTENT EDITOR</span><h2>Edit {selected.title}</h2></div><button type="button" onClick={()=>setSelected(null)} aria-label="Close editor"><X size={19}/></button></div><label>DISPLAY TITLE<input required maxLength={120} value={selected.title} onChange={(e)=>setSelected({...selected,title:e.target.value})}/></label><label>SYNOPSIS<textarea required rows={5} maxLength={1500} value={selected.synopsis} onChange={(e)=>setSelected({...selected,synopsis:e.target.value})}/></label><label className="studio-check-label"><input type="checkbox" checked={selected.published} onChange={(e)=>setSelected({...selected,published:e.target.checked})}/> Published in viewer catalogue</label><label className="studio-check-label"><input type="checkbox" checked={selected.featured} onChange={(e)=>setSelected({...selected,featured:e.target.checked})}/> Featured on homepage billboard</label><div className="studio-modal-actions"><button className="studio-outline" type="button" onClick={()=>setSelected(null)}>Cancel</button><button className="studio-primary" type="submit"><Check size={17}/> Save title</button></div></form></div>}
    {createOpen && <div className="studio-modal-scrim" role="presentation" onMouseDown={(e)=>{if(e.target===e.currentTarget)setCreateOpen(false);}}><form className="studio-modal" onSubmit={(e)=>{e.preventDefault();createTitle();}} aria-label="Create catalogue draft"><div className="studio-modal-head"><div><span className="studio-eyebrow">CATALOGUE INTAKE</span><h2>Create a draft title</h2></div><button type="button" onClick={()=>setCreateOpen(false)} aria-label="Close new title form"><X size={19}/></button></div><p className="studio-form-note">New titles use placeholder concept artwork and remain unpublished until an operator approves them. The media upload pipeline is not connected.</p><label>TITLE<input required minLength={3} maxLength={120} value={newTitle} onChange={(e)=>setNewTitle(e.target.value)} placeholder="Enter a film or series title"/></label><label>CONTENT TYPE<select value={newKind} onChange={(e)=>setNewKind(e.target.value as MediaKind)}><option value="movie">Film</option><option value="series">TV series</option></select></label><label>SYNOPSIS<textarea required rows={4} minLength={15} maxLength={1500} value={newSynopsis} onChange={(e)=>setNewSynopsis(e.target.value)} placeholder="Briefly describe the story"/></label><div className="studio-modal-actions"><button className="studio-outline" type="button" onClick={()=>setCreateOpen(false)}>Cancel</button><button className="studio-primary" type="submit"><Plus size={17}/> Create draft</button></div></form></div>}
  </div>;
}

function tally(values: string[]): [string,number][] {
  const counts = new Map<string,number>();
  for(const value of values)counts.set(value,(counts.get(value) ?? 0)+1);
  return [...counts].sort((a,b)=>b[1]-a[1] || a[0].localeCompare(b[0]));
}
function InfoIcon(){return <ShieldAlert size={18} aria-hidden="true"/>;}
function Kpi({icon:Icon,label,value,sub}:{icon:typeof Film;label:string;value:string|number;sub:string}) {return <div className="studio-kpi"><div className="studio-kpi-top"><span>{label}</span><Icon size={19}/></div><strong>{value}</strong><small>{sub}</small></div>;}
function Progress({label,current,total}:{label:string;current:number;total:number}) {return <div className="studio-progress"><div><span>{label}</span><strong>{current}<small> / {total}</small></strong></div><div className="studio-progress-track"><span style={{width:`${percent(current,total)}%`}}/></div></div>;}
function Status({state}:{state:"published"|"draft"|"queued"|"reviewed"}) {return <span className={`studio-status studio-status-${state}`}><span/>{state === "published" ? "Published" : state === "draft" ? "Draft" : state === "queued" ? "Queued" : "Reviewed"}</span>;}
function Empty({message}:{message:string}){return <div className="studio-empty"><ClipboardList size={24}/><p>{message}</p></div>;}
