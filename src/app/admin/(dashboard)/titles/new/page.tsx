import Link from "next/link";
import { requireOperator } from "@/lib/admin/auth";
import { listCollections } from "@/lib/admin/queries";
import { TitleForm } from "@/components/admin/title-form";
import { Notice } from "@/components/admin/notice";

export const dynamic = "force-dynamic";

export default async function NewTitlePage({ searchParams }: { searchParams: Promise<{ error?: string }> }) {
  await requireOperator();
  const { error } = await searchParams;
  return (
    <>
      <div className="admin-toolbar">
        <div><span>CATALOGUE</span><h1>New title</h1></div>
        <Link href="/admin/titles" className="admin-preview">← Back to titles</Link>
      </div>
      <Notice error={error} />
      <TitleForm mode="create" collections={listCollections()} titleCollections={[]} genres={[]} />
    </>
  );
}
