import { requireOperator } from "@/lib/admin/auth";
import { listRows } from "@/lib/admin/queries";
import { RowsEditor } from "@/components/admin/rows-editor";
import { Notice } from "@/components/admin/notice";

export const dynamic = "force-dynamic";

export default async function StudioRowsPage({ searchParams }: { searchParams: Promise<{ saved?: string; error?: string }> }) {
  await requireOperator();
  const { saved, error } = await searchParams;
  const rows = listRows();
  return (
    <>
      <div className="admin-toolbar">
        <div><span>HOMEPAGE</span><h1>Rows</h1></div>
      </div>
      <Notice saved={saved} error={error} />
      <section className="admin-section">
        <h2>How rows work</h2>
        <p>Each row is a carousel on the home page. Pick a collection (trending, discovery…), a type (movie / series), or leave it manual — then reorder or hide rows with the buttons on the right.</p>
      </section>
      <RowsEditor rows={rows} />
    </>
  );
}
