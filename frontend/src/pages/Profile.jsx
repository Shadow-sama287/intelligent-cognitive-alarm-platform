import { useState, useEffect } from "react";
import { FaClock, FaMoon, FaGlobe, FaBrain, FaCheckCircle, FaExclamationCircle } from "react-icons/fa";
import { apiClient } from "../api/client";

export default function Profile() {
  const [profile, setProfile] = useState({
    preferred_wake_time: "07:00",
    target_sleep_hours: 8,
    time_zone: Intl.DateTimeFormat().resolvedOptions().timeZone,
    difficulty_preference: "medium",
    productivity_goals: "",
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState(null); // { type: "success"|"error", message: string }

  // Fetch profile from backend on mount to pre-fill the form
  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const res = await apiClient.get("/profile");
        const data = res.data.data;
        setProfile({
          preferred_wake_time: data.preferred_wake_time ?? "07:00",
          target_sleep_hours: data.target_sleep_hours ?? 8,
          time_zone: data.time_zone ?? Intl.DateTimeFormat().resolvedOptions().timeZone,
          difficulty_preference: data.difficulty_preference ?? "medium",
          productivity_goals: data.productivity_goals ?? "",
        });
      } catch (err) {
        console.error("Failed to load profile:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchProfile();
  }, []);

  const showToast = (type, message) => {
    setToast({ type, message });
    setTimeout(() => setToast(null), 4000);
  };

  const handleChange = (field, value) => {
    setProfile((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      await apiClient.put("/profile", profile);
      showToast("success", "Profile saved successfully!");
    } catch (err) {
      console.error("Failed to save profile:", err);
      showToast("error", "Failed to save profile. Please try again.");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="dashboard">
        <div className="dashboard-hero">
          <div>
            <h2>Profile Settings</h2>
            <p>Loading your preferences…</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="dashboard">
      <div className="dashboard-hero">
        <div>
          <h2>Profile Settings</h2>
          <p>Manage your wake-up preferences.</p>
        </div>
      </div>

      {/* Toast notification */}
      {toast && (
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "0.5rem",
            padding: "0.75rem 1.25rem",
            borderRadius: "8px",
            marginBottom: "1rem",
            fontWeight: 600,
            backgroundColor: toast.type === "success" ? "#d1fae5" : "#fee2e2",
            color: toast.type === "success" ? "#065f46" : "#991b1b",
            border: `1px solid ${toast.type === "success" ? "#6ee7b7" : "#fca5a5"}`,
          }}
        >
          {toast.type === "success" ? (
            <FaCheckCircle />
          ) : (
            <FaExclamationCircle />
          )}
          {toast.message}
        </div>
      )}

      <form className="auth-form" onSubmit={handleSave}>

        <label>Preferred Wake-up Time</label>
        <div className="input-group">
          <FaClock className="input-icon" />
          <input
            type="time"
            value={profile.preferred_wake_time}
            onChange={(e) =>
              handleChange("preferred_wake_time", e.target.value)
            }
          />
        </div>

        <label>Target Sleep Hours</label>
        <input
          type="number"
          min="1"
          max="24"
          step="0.5"
          value={profile.target_sleep_hours}
          onChange={(e) =>
            handleChange("target_sleep_hours", Number(e.target.value))
          }
        />


        <label style={{ display: "flex", alignItems: "center", gap: "0.4rem" }}>
          <FaGlobe /> Time Zone
        </label>
        <select
          value={profile.time_zone}
          onChange={(e) => handleChange("time_zone", e.target.value)}
        >
          {(Intl.supportedValuesOf?.("timeZone") ?? [
            "UTC",
            "America/New_York",
            "America/Chicago",
            "America/Denver",
            "America/Los_Angeles",
            "Europe/London",
            "Europe/Paris",
            "Europe/Berlin",
            "Asia/Kolkata",
            "Asia/Tokyo",
            "Asia/Shanghai",
            "Asia/Dubai",
            "Australia/Sydney",
            "Pacific/Auckland",
          ]).map((tz) => (
            <option key={tz} value={tz}>
              {tz.replace(/_/g, " ")}
            </option>
          ))}
        </select>


        <label>Default Difficulty</label>
        <select
          value={profile.difficulty_preference}
          onChange={(e) =>
            handleChange("difficulty_preference", e.target.value)
          }
        >
          <option value="beginner">Beginner</option>
          <option value="easy">Easy</option>
          <option value="medium">Medium</option>
          <option value="hard">Hard</option>
          <option value="expert">Expert</option>
        </select>

        <label>Productivity Goals</label>
        <div className="input-group">
          <FaBrain className="input-icon" />
          <input
            type="text"
            placeholder="e.g. Wake up by 6am, solve 2 challenges daily"
            value={profile.productivity_goals}
            onChange={(e) =>
              handleChange("productivity_goals", e.target.value)
            }
          />
        </div>

        <button className="btn-gradient" type="submit" disabled={saving}>
          {saving ? "Saving…" : "Save Changes"}
        </button>

      </form>
    </div>
  );
}