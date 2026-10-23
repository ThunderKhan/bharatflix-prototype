import Link from "next/link";
import { Clapperboard, Film, Layers, Link2, ListVideo, Star, Users } from "lucide-react";
import { requireOperator } from "@/lib/admin/auth";
import { listAudit, studioStats } from "@/lib/admin/queries";
import { Notice } from "@/components/admin/notice";

export const dynamic = "force-dynamic";

export default async function StudioDashboard({ searchParams }: { searchParams: Promise<{ saved?: string; error?: string }> }) {
  await requireOperator();
  const { saved, error } = await searchParams;
  const stats = studioStats();
  const activity = listAudit(8);

  const cards = [
    { label: "TITLES", value: stats.total, icon: Film },
    { label: "PUBLISHED", value: stats.published, icon: Clapperboard },
    { label: "DRAFTS", value: stats.drafts, icon: Star },
    { label: "EPISODES", value: stats.episodes, icon: ListVideo },
    { label: "STREAMS", value: stats.streams, icon: Link2 },
    { label: "HOMEPAGE ROWS", value: stats.rows, icon: Layers },
    { label: "OPERATORS", value: stats.users, icon: Users },
  ];

  return (
    <>
      <div className="admin-toolbar">
        <div><span>STUDIO OVERVIEW</span><h1>Dashboard</h1></div>
        <Link href="/admin/titles/new" className="studio-primary">+ New title</Link>
      </div>
      <Notice saved={saved} error={error} />

      <div className="studio-stats-wide">
        {cards.map((card) => {
          const Icon = card.icon;
          return (
            <div key={card.label}>
              <Icon size={19} />
              <small>{card.label}</small>
              <strong>{card.value}</strong>
            </div>
          );
        })}
      </div>

      <section className="admin-section">
        <div className="admin-section-top">
          <div><h2>Recent activity</h2><p>Every change made in the studio is recorded here.</p></div>
          <Link href="/admin/audit" className="admin-edit">View all</Link>
        </div>
        {activity.length === 0 ? (
          <p className="studio-empty">No activity yet — edits you make will appear here.</p>
        ) : (
          <div className="admin-table-scroll">
            <table className="admin-table">
              <thead><tr><th>WHEN</th><th>OPERATOR</th><th>ACTION</th><th>WHAT CHANGED</th></tr></thead>
              <tbody>
                {activity.map((entry) => (
                  <tr key={entry.id}>
                    <td>{entry.created_at}</td>
                    <td>{entry.actor}</td>
                    <td><span className="admin-status">{entry.action}</span> <small>{entry.entity}</small></td>
                    <td>{entry.detail || entry.entity_id}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>

      <section className="admin-section">
        <h2>Getting around</h2>
        <div className="studio-links">
          <Link href="/admin/titles"><strong>Catalogue</strong><p>Edit titles, artwork, genres, seasons, episodes and streams. Publish or unpublish in one click.</p></Link>
          <Link href="/admin/rows"><strong>Homepage rows</strong><p>Rename, reorder, hide or retarget the carousels on the home page.</p></Link>
          <Link href="/admin/settings"><strong>Settings</strong><p>Site name and tagline.</p></Link>
          <Link href="/admin/users"><strong>Operators</strong><p>Add or remove people who can sign in to the studio.</p></Link>
        </div>
      </section>
    </>
  );
}
