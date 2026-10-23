import { requireOperator } from "@/lib/admin/auth";
import { listAudit } from "@/lib/admin/queries";

export const dynamic = "force-dynamic";

export default async function StudioAuditPage() {
  await requireOperator();
  const entries = listAudit(200);
  return (
    <>
      <div className="admin-toolbar">
        <div><span>GOVERNANCE</span><h1>Activity</h1></div>
      </div>
      <section className="admin-section">
        <div className="admin-section-top">
          <div><h2>Change history</h2><p>The last {entries.length} actions. Every save, publish, delete and sign-in is recorded with the operator who did it.</p></div>
        </div>
        {entries.length === 0 ? (
          <p className="studio-empty">Nothing recorded yet.</p>
        ) : (
          <div className="admin-table-scroll">
            <table className="admin-table">
              <thead><tr><th>WHEN</th><th>OPERATOR</th><th>ACTION</th><th>ENTITY</th><th>DETAIL</th></tr></thead>
              <tbody>
                {entries.map((entry) => (
                  <tr key={entry.id}>
                    <td>{entry.created_at}</td>
                    <td>{entry.actor}</td>
                    <td><span className="admin-status">{entry.action}</span></td>
                    <td>{entry.entity}<small className="studio-hint"> {entry.entity_id}</small></td>
                    <td>{entry.detail}</td>
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
