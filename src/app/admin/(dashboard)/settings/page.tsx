import { getDb } from "@/lib/db/connection";
import { requireOperator } from "@/lib/admin/auth";
import { saveSettings } from "@/lib/admin/actions";
import { Notice } from "@/components/admin/notice";

export const dynamic = "force-dynamic";

function readSetting(key: string, fallback: string): string {
  const row = getDb().prepare("SELECT value FROM settings WHERE key = ?").get(key) as { value: string } | undefined;
  return row?.value ?? fallback;
}

export default async function StudioSettingsPage({ searchParams }: { searchParams: Promise<{ saved?: string; error?: string }> }) {
  await requireOperator();
  const { saved, error } = await searchParams;
  const siteName = readSetting("site_name", "BharatFlix");
  const tagline = readSetting("tagline", "Stories worth staying for.");

  return (
    <>
      <div className="admin-toolbar">
        <div><span>SITE</span><h1>Settings</h1></div>
      </div>
      <Notice saved={saved} error={error} />
      <section className="admin-section">
        <h2>Identity</h2>
        <p>The name and line used across the site and in page titles.</p>
        <form className="studio-form" action={saveSettings}>
          <div className="studio-grid">
            <label>Site name
              <input name="siteName" defaultValue={siteName} maxLength={60} required />
            </label>
            <label>Tagline
              <input name="tagline" defaultValue={tagline} maxLength={120} required />
            </label>
          </div>
          <div className="studio-form-actions">
            <button className="studio-primary" type="submit">Save settings</button>
          </div>
        </form>
      </section>
    </>
  );
}
