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
  // "loading" | "denied" | "error" | "ready"
  const [status, setStatus] = useState("loading");
  const [errorMsg, setErrorMsg] = useState("");

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const res = await apiClient.get("/admin/stats");
        setStats(res.data.data);
        setStatus("ready");
      } catch (err) {
        if (err.response?.status === 403) {
          setStatus("denied");
        } else {
          setErrorMsg("Failed to load admin stats. Please try again.");
          setStatus("error");
        }
      }
    };
    fetchStats();
  }, []);

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

  // --- Stats ---
  return (
    <div className="dashboard">
      <div className="dashboard-hero">
        <div>
          <h2>Admin Dashboard</h2>
          <p>Platform-wide statistics and user overview.</p>
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
    </div>
  );
}
