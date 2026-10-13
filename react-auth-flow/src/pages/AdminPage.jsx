import { useAdminStats } from '../features/admin/hooks';
import { getErrorMessage } from '../lib/http';
import { Spinner } from '../components/Spinner';

export function AdminPage() {
  const stats = useAdminStats();

  if (stats.isPending) return <Spinner />;
  if (stats.isError) return <p className="form__error">{getErrorMessage(stats.error)}</p>;

  const { users, notes, activeSessions, accounts } = stats.data;

  return (
    <section className="card">
      <p className="eyebrow">Admin only</p>
      <h1>Server stats</h1>

      <div className="stats">
        <Stat label="Users" value={users} />
        <Stat label="Notes" value={notes} />
        <Stat label="Active refresh tokens" value={activeSessions} />
      </div>

      <table className="table">
        <thead>
          <tr>
            <th>Name</th>
            <th>Email</th>
            <th>Role</th>
          </tr>
        </thead>
        <tbody>
          {accounts.map((a) => (
            <tr key={a.id}>
              <td>{a.name}</td>
              <td>{a.email}</td>
              <td>
                <span className={`badge badge--${a.role}`}>{a.role}</span>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </section>
  );
}

function Stat({ label, value }) {
  return (
    <div className="stat">
      <span className="stat__value">{value}</span>
      <span className="muted small">{label}</span>
    </div>
  );
}
