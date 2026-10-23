import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { requireOperator } from "@/lib/admin/auth";
import { deleteTitle } from "@/lib/admin/actions";
import { getTitle, getTitleCollections, getTitleGenres, listCollections, listSeasonsWithEpisodes, listStreams } from "@/lib/admin/queries";
import { ConfirmButton } from "@/components/admin/confirm-button";
import { Notice } from "@/components/admin/notice";
import { SeasonsEditor } from "@/components/admin/seasons-editor";
import { StreamsEditor } from "@/components/admin/streams-editor";
import { TitleForm } from "@/components/admin/title-form";

export const dynamic = "force-dynamic";

export default async function StudioTitlePage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ saved?: string; error?: string }>;
}) {
  await requireOperator();
  const { id } = await params;
  const { saved, error } = await searchParams;
  const title = getTitle(id);
  if (!title) notFound();

  return (
    <>
      <div className="admin-toolbar">
        <div><span>CATALOGUE · EDIT</span><h1>{title.title}</h1></div>
        <div className="studio-toolbar-links">
          <span className={`admin-status${title.status === "published" ? "" : " draft"}`}>{title.status}</span>
          {title.status === "published" ? <Link href={`/title/${title.slug}`} className="admin-preview" target="_blank">View live ↗</Link> : null}
          <Link href="/admin/titles" className="admin-preview">← All titles</Link>
        </div>
      </div>
      <Notice saved={saved} error={error} />

      <TitleForm
        mode="edit"
        title={title}
        genres={getTitleGenres(id)}
        collections={listCollections()}
        titleCollections={getTitleCollections(id)}
      />

      {title.kind === "series" ? (
        <SeasonsEditor titleId={id} seasons={listSeasonsWithEpisodes(id)} />
      ) : (
        <section className="admin-section">
          <h2>Episodes</h2>
          <p>This is a film. Switch the type to <strong>series</strong> in the form above to attach seasons and episodes.</p>
        </section>
      )}

      <StreamsEditor titleId={id} streams={listStreams(id)} />

      <section className="admin-section studio-danger">
        <h2>Delete this title</h2>
        <p>Removes the title, its seasons, episodes, cast links and streams from the catalogue. This cannot be undone.</p>
        <form action={deleteTitle}>
          <input type="hidden" name="id" value={title.id} />
          <ConfirmButton message={`Delete “${title.title}” permanently?`} className="studio-danger-button">
            Delete “{title.title}”
          </ConfirmButton>
        </form>
      </section>

      <section className="admin-section">
        <h2>Poster preview</h2>
        <div className="studio-artwork-preview">
          <Image src={title.poster} alt={`${title.title} poster`} width={130} height={187} />
          <Image src={title.backdrop} alt={`${title.title} backdrop`} width={426} height={240} />
        </div>
        <p>Artwork files live in <code>public/artwork/</code>. Reference them as <code>/artwork/your-file.jpg</code>.</p>
      </section>
    </>
  );
}
