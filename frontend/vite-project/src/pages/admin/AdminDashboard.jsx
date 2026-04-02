import { useState, useEffect, useContext } from "react";
import { AuthContext } from "../../context/AuthContext";

const API = import.meta.env.VITE_API_URL;

export default function AdminDashboard() {
  const { token, user, logout } = useContext(AuthContext);
  const [tab, setTab] = useState("overview");
  const [stats, setStats] = useState({});
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (token) fetchAll();
  }, [token]);

  const fetchAll = async () => {
    setLoading(true);
    try {
      const h = { Authorization: `Bearer ${token}` };
      const [statsRes, usersRes] = await Promise.all([
        fetch(`${API}/admin/stats`, { headers: h }),
        fetch(`${API}/admin/users`, { headers: h }),
      ]);
      if (statsRes.ok) setStats(await statsRes.json());
      if (usersRes.ok) setUsers(await usersRes.json());
    } catch (e) {
      console.error(e);
    }
    setLoading(false);
  };

  if (user && user.role !== "admin") {
    return (
      <div style={{ color: "red", padding: 40, textAlign: "center" }}>
        Access Denied — Admins Only
      </div>
    );
  }

  return (
    <div style={{ minHeight: "100vh", background: "#070910", color: "#fff", fontFamily: "sans-serif", padding: 32 }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 24 }}>
        <h1 style={{ fontSize: 28, fontWeight: 700 }}>Admin Dashboard</h1>
        <span style={{ background: "#1a0a3d", border: "1px solid #a78bfa33", borderRadius: 100, padding: "6px 16px", fontSize: 12, color: "#a78bfa", fontWeight: 600 }}>
          Admin Panel
        </span>
      </div>

      {loading ? (
        <p style={{ color: "#6b7280" }}>Loading...</p>
      ) : (
        <>
          {/* Stats */}
          <div style={{ display: "flex", gap: 16, marginBottom: 32, flexWrap: "wrap" }}>
            {[
              { label: "Total Users", value: stats.totalUsers || 0 },
              { label: "Active Subscribers", value: stats.activeSubscribers || 0 },
              { label: "Prize Pool", value: `£${stats.totalPrizePool || 0}` },
              { label: "Charity Total", value: `£${stats.charityTotal || 0}` },
            ].map((s) => (
              <div key={s.label} style={{ background: "#0d0f18", border: "1px solid #1a1d2e", borderRadius: 12, padding: "20px 24px", minWidth: 160 }}>
                <p style={{ color: "#6b7280", fontSize: 12, marginBottom: 8 }}>{s.label}</p>
                <p style={{ fontSize: 24, fontWeight: 700 }}>{s.value}</p>
              </div>
            ))}
          </div>

          {/* Users Table */}
          <div style={{ background: "#0d0f18", border: "1px solid #1a1d2e", borderRadius: 12, overflow: "hidden" }}>
            <div style={{ padding: "16px 20px", borderBottom: "1px solid #1a1d2e" }}>
              <h2 style={{ fontSize: 16 }}>Users ({users.length})</h2>
            </div>
            <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13 }}>
              <thead>
                <tr style={{ background: "#13151f" }}>
                  {["Name", "Email", "Plan", "Status", "Scores"].map((h) => (
                    <th key={h} style={{ padding: "12px 16px", textAlign: "left", color: "#6b7280", fontWeight: 600 }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {users.length === 0 ? (
                  <tr>
                    <td colSpan={5} style={{ padding: 40, textAlign: "center", color: "#4b5563" }}>
                      No users found.
                    </td>
                  </tr>
                ) : (
                  users.map((u) => (
                    <tr key={u._id} style={{ borderTop: "1px solid #1a1d2e" }}>
                      <td style={{ padding: "12px 16px" }}>{u.name}</td>
                      <td style={{ padding: "12px 16px", color: "#9ca3af" }}>{u.email}</td>
                      <td style={{ padding: "12px 16px", color: "#60a5fa", textTransform: "capitalize" }}>{u.subscription?.plan || "—"}</td>
                      <td style={{ padding: "12px 16px" }}>
                        <span style={{
                          background: u.subscription?.status === "active" ? "#052e16" : "#1a1107",
                          color: u.subscription?.status === "active" ? "#4ade80" : "#f59e0b",
                          borderRadius: 100, padding: "3px 10px", fontSize: 11, fontWeight: 600
                        }}>
                          {u.subscription?.status || "Inactive"}
                        </span>
                      </td>
                      <td style={{ padding: "12px 16px", color: "#9ca3af" }}>{u.scores?.length || 0}/5</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          <button
            onClick={logout}
            style={{ marginTop: 24, background: "#1a1d26", color: "#ef4444", border: "none", borderRadius: 8, padding: "10px 20px", cursor: "pointer", fontSize: 14 }}
          >
            Logout
          </button>
        </>
      )}
    </div>
  );
}