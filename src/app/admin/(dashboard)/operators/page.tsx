import { requireOperator } from "@/lib/admin/auth";
import { createUser, deleteUser } from "@/lib/admin/actions";
import { listUsers } from "@/lib/admin/queries";
import { ConfirmButton } from "@/components/admin/confirm-button";
import { Notice } from "@/components/admin/notice";

export const dynamic = "force-dynamic";

export default async function StudioUsersPage({ searchParams }: { searchParams: Promise<{ saved?: string; error?: string }> }) {
  const operator = await requireOperator();
  const { saved, error } = await searchParams;
  const users = listUsers();

  return (
    <>
      <div className="admin-toolbar">
        <div><span>ACCESS</span><h1>Operators</h1></div>
      </div>
      <Notice saved={saved} error={error} />

      <section className="admin-section">
        <div className="admin-section-top">
          <div><h2>Who can sign in</h2><p>Admins manage operators as well as the catalogue; editors only see the catalogue.</p></div>
        </div>
        <div className="admin-table-scroll">
          <table className="admin-table">
            <thead><tr><th>EMAIL</th><th>NAME</th><th>ROLE</th><th>ADDED</th><th></th></tr></thead>
            <tbody>
              {users.map((user) => (
                <tr key={user.id}>
                  <td>{user.email}{user.id === operator.id ? <small className="studio-hint"> (you)</small> : null}</td>
                  <td>{user.name}</td>
                  <td><span className={`admin-status${user.role === "admin" ? "" : " draft"}`}>{user.role}</span></td>
                  <td>{user.created_at}</td>
                  <td>
                    {user.id === operator.id ? null : (
                      <form action={deleteUser}>
                        <input type="hidden" name="id" value={user.id} />
                        <ConfirmButton message={`Remove ${user.email} from the studio?`} className="studio-danger-button">Remove</ConfirmButton>
                      </form>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <section className="admin-section">
        <h2>Add an operator</h2>
        <form className="studio-form" action={createUser}>
          <div className="studio-grid">
            <label>Email
              <input name="email" type="email" required placeholder="editor@studio.test" />
            </label>
            <label>Name
              <input name="name" maxLength={80} placeholder="Priya" />
            </label>
            <label>Password
              <input name="password" type="password" required minLength={8} placeholder="At least 8 characters" />
            </label>
            <label>Role
              <select name="role" defaultValue="editor">
                <option value="editor">Editor — catalogue only</option>
                <option value="admin">Admin — full access</option>
              </select>
            </label>
          </div>
          <div className="studio-form-actions">
            <button className="studio-primary" type="submit">Add operator</button>
          </div>
        </form>
      </section>
    </>
  );
}
