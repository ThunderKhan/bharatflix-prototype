import Image from "next/image";
import Link from "next/link";
import { Search, Star } from "lucide-react";
import { requireOperator } from "@/lib/admin/auth";
import { deleteTitle, setStatus } from "@/lib/admin/actions";
import { listTitles } from "@/lib/admin/queries";
import { ConfirmButton } from "@/components/admin/confirm-button";
import { Notice } from "@/components/admin/notice";

export const dynamic = "force-dynamic";

export default async function StudioTitlesPage({ searchParams }: { searchParams: Promise<{ q?: string; saved?: string; error?: string }> }) {
  await requireOperator();
  const { q = "", saved, error } = await searchParams;
  const titles = listTitles(q);

  return (
    <>
      <div className="admin-toolbar">
        <div><span>CATALOGUE</span><h1>Titles</h1></div>
        <Link href="/admin/titles/new" className="studio-primary">+ New title</Link>
      </div>
      <Notice saved={saved} error={error} />

      <section className="admin-section">
        <div className="admin-section-top">
          <div><h2>All titles</h2><p>{titles.length} title{titles.length === 1 ? "" : "s"}{q ? ` · filtered by “${q}”` : ""} · drafts are invisible to visitors.</p></div>
          <form className="admin-search" method="get">
            <Search size={15} />
            <input name="q" defaultValue={q} placeholder="Search titles, slugs…" />
          </form>
        </div>

        {titles.length === 0 ? (
          <p className="studio-empty">No titles match. {q ? <Link href="/admin/titles">Clear the search</Link> : null}</p>
        ) : (
          <div className="admin-table-scroll">
            <table className="admin-table">
              <thead>
                <tr><th>TITLE</th><th>TYPE</th><th>YEAR</th><th>CONTENT</th><th>STATUS</th><th>ACTIONS</th></tr>
              </thead>
              <tbody>
                {titles.map((row) => (
                  <tr key={row.id}>
                    <td>
                      <div className="admin-table-title">
                        <Image src={row.poster} alt="" width={41} height={57} />
                        <div>
                          <strong>{row.featured ? <Star size={12} className="studio-star" /> : null} {row.title}</strong>
                          <small>/{row.slug} · {row.language}</small>
                        </div>
                      </div>
                    </td>
                    <td>{row.kind}</td>
                    <td>{row.year} · ★ {row.rating}</td>
                    <td>{row.kind === "series" ? `${row.seasons} season${row.seasons === 1 ? "" : "s"}, ${row.episodes} episodes` : "Film"}</td>
                    <td><span className={`admin-status${row.status === "published" ? "" : " draft"}`}>{row.status}</span></td>
                    <td>
                      <div className="studio-row-actions">
                        <Link href={`/admin/titles/${row.id}`} className="admin-edit">Edit</Link>
                        <form action={setStatus}>
                          <input type="hidden" name="id" value={row.id} />
                          <input type="hidden" name="status" value={row.status === "published" ? "draft" : "published"} />
                          <button className="admin-edit" type="submit">{row.status === "published" ? "Unpublish" : "Publish"}</button>
                        </form>
                        <form action={deleteTitle}>
                          <input type="hidden" name="id" value={row.id} />
                          <ConfirmButton message={`Delete “${row.title}” and all of its seasons, episodes and streams? This cannot be undone.`} className="studio-danger-button">
                            Delete
                          </ConfirmButton>
                        </form>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </>
  );
}
