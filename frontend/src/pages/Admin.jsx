import { useState, useEffect } from "react";
import { FaUsers, FaCheckCircle, FaBan, FaBell, FaBrain, FaLock } from "react-icons/fa";
import { apiClient } from "../api/client";

function StatCard({ icon: Icon, label, value, accent }) {
  return (
    <div
      style={{
        background: "var(--card-bg, #1e293b)",
        border: `1px solid ${accent}33`,
        borderRadius: "14px",
        padding: "1.5rem",
        display: "flex",
        alignItems: "center",
        gap: "1.25rem",
        boxShadow: `0 4px 20px ${accent}22`,
      }}
    >
      <div
        style={{
          width: "52px",
          height: "52px",
          borderRadius: "12px",
          backgroundColor: `${accent}22`,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          color: accent,
          fontSize: "1.4rem",
          flexShrink: 0,
        }}
      >
        <Icon />
      </div>
      <div>
        <p style={{ margin: 0, fontSize: "0.8rem", color: "#94a3b8", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.05em" }}>
          {label}
        </p>
        <p style={{ margin: "0.2rem 0 0", fontSize: "2rem", fontWeight: 800, color: "#f1f5f9" }}>
          {value ?? <span style={{ fontSize: "1rem", color: "#64748b" }}>N/A</span>}
        </p>
      </div>
    </div>
  );
}

export default function Admin() {
  const [stats, setStats] = useState(null);
  const [users, setUsers] = useState([]);
  const [status, setStatus] = useState("loading");
  const [errorMsg, setErrorMsg] = useState("");
  const [updatingUser, setUpdatingUser] = useState(null);

  const fetchData = async () => {
    try {
      const [statsRes, usersRes] = await Promise.all([
        apiClient.get("/admin/stats"),
        apiClient.get("/admin/users"),
      ]);
      setStats(statsRes.data.data);
      setUsers(usersRes.data.data || []);
      setStatus("ready");
    } catch (err) {
      if (err.response?.status === 403) {
        setStatus("denied");
      } else {
        setErrorMsg("Failed to load admin dashboard. Please try again.");
        setStatus("error");
      }
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleRoleChange = async (userId, newRole) => {
    setUpdatingUser(userId);
    try {
      await apiClient.patch(`/admin/users/${userId}/role`, { role: newRole });
      await fetchData();
    } catch (err) {
      alert(err.response?.data?.detail || "Failed to update role");
    } finally {
      setUpdatingUser(null);
    }
  };

  // --- Loading ---
  if (status === "loading") {
    return (
      <div className="dashboard">
        <div className="dashboard-hero">
          <div>
            <h2>Admin Dashboard</h2>
            <p>Loading platform statistics…</p>
          </div>
        </div>
      </div>
    );
  }

  // --- Access Denied (server returned 403) ---
  if (status === "denied") {
    return (
      <div className="dashboard">
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            gap: "1rem",
            minHeight: "40vh",
            color: "#f43f5e",
          }}
        >
          <FaLock style={{ fontSize: "3rem" }} />
          <h2 style={{ margin: 0 }}>Access Denied</h2>
          <p style={{ color: "#94a3b8", margin: 0 }}>
            This page is restricted to administrators only.
          </p>
        </div>
      </div>
    );
  }

  // --- Error ---
  if (status === "error") {
    return (
      <div className="dashboard">
        <div className="dashboard-hero">
          <div>
            <h2>Admin Dashboard</h2>
            <p style={{ color: "#f43f5e" }}>{errorMsg}</p>
          </div>
        </div>
      </div>
    );
  }

  // --- Stats & Management ---
  return (
    <div className="dashboard">
      <div className="dashboard-hero">
        <div>
          <h2>Admin Dashboard</h2>
          <p>Platform-wide statistics and role management.</p>
        </div>
      </div>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fill, minmax(220px, 1fr))",
          gap: "1.25rem",
          marginTop: "1.5rem",
        }}
      >
        <StatCard
          icon={FaUsers}
          label="Total Users"
          value={stats?.total_users}
          accent="#6366f1"
        />
        <StatCard
          icon={FaCheckCircle}
          label="Active Users"
          value={stats?.active_users}
          accent="#10b981"
        />
        <StatCard
          icon={FaBan}
          label="Inactive Users"
          value={stats?.inactive_users}
          accent="#f43f5e"
        />
        <StatCard
          icon={FaBell}
          label="Total Alarms"
          value={stats?.total_alarms}
          accent="#f59e0b"
        />
        <StatCard
          icon={FaBrain}
          label="Challenges Seeded"
          value={stats?.total_challenges_seeded}
          accent="#8b5cf6"
        />
      </div>

      {/* User Role Management Section */}
      <div
        style={{
          marginTop: "2.5rem",
          background: "var(--card-bg, #1e293b)",
          borderRadius: "14px",
          padding: "1.5rem",
          boxShadow: "0 4px 20px rgba(0, 0, 0, 0.15)",
        }}
      >
        <h3 style={{ margin: "0 0 1rem", color: "#f1f5f9", fontSize: "1.2rem" }}>
          User Role Management
        </h3>
        <p style={{ color: "#94a3b8", fontSize: "0.875rem", marginBottom: "1.25rem" }}>
          Promote users to Coach or Administrator roles to grant elevated permissions.
        </p>

        <div style={{ overflowX: "auto" }}>
          <table style={{ width: "100%", borderCollapse: "collapse", color: "#cbd5e1", fontSize: "0.9rem" }}>
            <thead>
              <tr style={{ borderBottom: "1px solid #334155", textAlign: "left" }}>
                <th style={{ padding: "0.75rem" }}>Full Name</th>
                <th style={{ padding: "0.75rem" }}>Email</th>
                <th style={{ padding: "0.75rem" }}>Current Role</th>
                <th style={{ padding: "0.75rem" }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {users.map((u) => (
                <tr key={u.id} style={{ borderBottom: "1px solid #334155" }}>
                  <td style={{ padding: "0.75rem", fontWeight: 600, color: "#f8fafc" }}>
                    {u.full_name}
                  </td>
                  <td style={{ padding: "0.75rem" }}>{u.email}</td>
                  <td style={{ padding: "0.75rem" }}>
                    <span
                      style={{
                        padding: "0.25rem 0.6rem",
                        borderRadius: "12px",
                        fontSize: "0.75rem",
                        fontWeight: 700,
                        textTransform: "uppercase",
                        background:
                          u.role?.toUpperCase() === "COACH"
                            ? "#8b5cf633"
                            : u.role?.toUpperCase() === "ADMIN" || u.role?.toUpperCase() === "ADMINISTRATOR"
                            ? "#f59e0b33"
                            : "#3b82f633",
                        color:
                          u.role?.toUpperCase() === "COACH"
                            ? "#a78bfa"
                            : u.role?.toUpperCase() === "ADMIN" || u.role?.toUpperCase() === "ADMINISTRATOR"
                            ? "#fbbf24"
                            : "#60a5fa",
                      }}
                    >
                      {u.role}
                    </span>
                  </td>
                  <td style={{ padding: "0.75rem" }}>
                    <select
                      value={u.role?.toUpperCase()}
                      disabled={updatingUser === u.id}
                      onChange={(e) => handleRoleChange(u.id, e.target.value)}
                      style={{
                        background: "#0f172a",
                        color: "#f8fafc",
                        border: "1px solid #475569",
                        borderRadius: "6px",
                        padding: "0.35rem 0.6rem",
                        cursor: "pointer",
                      }}
                    >
                      <option value="USER">User</option>
                      <option value="COACH">Coach</option>
                      <option value="ADMIN">Administrator</option>
                    </select>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

