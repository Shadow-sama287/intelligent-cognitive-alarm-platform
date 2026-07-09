import { useState, useEffect } from "react";
import {
  FaClock,
  FaMoon,
  FaGlobe,
  FaBrain,
  FaCheckCircle,
  FaExclamationCircle,
  FaUserCircle,
  FaSun,
  FaEnvelope,
} from "react-icons/fa";
import { apiClient } from "../api/client";
import { SnoozeSettingsPage } from "./SnoozeSettings";
import { useAuthStore } from "../store/useAuthStore";

export default function Profile() {
  const user = useAuthStore((state) => state.user);
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
          time_zone:
            data.time_zone ?? Intl.DateTimeFormat().resolvedOptions().timeZone,
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
      <div className="max-w-2xl mx-auto p-4 space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-white flex items-center gap-3">
            <FaUserCircle className="w-8 h-8 text-indigo-400" /> Profile
            Settings
          </h1>
          <p className="text-slate-400 mt-1">Loading your preferences…</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto p-4 md:p-8 space-y-6 text-slate-800">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-slate-900 mb-2">
          Profile Settings
        </h1>
        <p className="text-slate-500">
          Configure your personal profile, notification preferences, and
          application security.
        </p>
      </div>

      {toast && (
        <div
          className={`p-4 rounded-xl flex items-center gap-3 font-medium ${
            toast.type === "success"
              ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
              : "bg-rose-50 text-rose-700 border border-rose-200"
          }`}
        >
          {toast.type === "success" ? (
            <FaCheckCircle />
          ) : (
            <FaExclamationCircle />
          )}
          {toast.message}
        </div>
      )}

      <div className="grid md:grid-cols-3 gap-6">
        <div className="md:col-span-2 space-y-6">
          <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-lg font-semibold flex items-center gap-2">
                <FaUserCircle className="text-slate-400" /> Wake-up Profile
              </h2>
            </div>
            <form className="space-y-5" onSubmit={handleSave}>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">
                    Full Name
                  </label>
                  <div className="relative">
                    <FaUserCircle className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                    <div className="w-full bg-slate-100 border border-slate-200 text-slate-600 rounded-lg pl-10 pr-4 py-2 select-none">
                      {user?.full_name || user?.username || "—"}
                    </div>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">
                    Email Address
                  </label>
                  <div className="relative">
                    <FaEnvelope className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                    <div className="w-full bg-slate-100 border border-slate-200 text-slate-600 rounded-lg pl-10 pr-4 py-2 select-none">
                      {user?.email || "—"}
                    </div>
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">
                  Preferred Wake-up Time
                </label>
                <div className="relative">
                  <FaClock className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input
                    type="time"
                    className="w-full bg-slate-50 border border-slate-200 text-slate-800 rounded-lg pl-10 pr-4 py-2 focus:outline-none focus:border-indigo-500 transition-colors"
                    value={profile.preferred_wake_time}
                    onChange={(e) =>
                      handleChange("preferred_wake_time", e.target.value)
                    }
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">
                  Target Sleep Hours
                </label>
                <div className="relative">
                  <FaMoon className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input
                    type="number"
                    min="1"
                    max="24"
                    step="0.5"
                    className="w-full bg-slate-50 border border-slate-200 text-slate-800 rounded-lg pl-10 pr-4 py-2 focus:outline-none focus:border-indigo-500 transition-colors"
                    value={profile.target_sleep_hours}
                    onChange={(e) =>
                      handleChange("target_sleep_hours", Number(e.target.value))
                    }
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">
                  Time Zone
                </label>
                <div className="relative">
                  <FaGlobe className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                  <select
                    className="w-full bg-slate-50 border border-slate-200 text-slate-800 rounded-lg pl-10 pr-4 py-2 focus:outline-none focus:border-indigo-500 transition-colors appearance-none"
                    value={profile.time_zone}
                    onChange={(e) => handleChange("time_zone", e.target.value)}
                  >
                    {(
                      Intl.supportedValuesOf?.("timeZone") ?? [
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
                      ]
                    ).map((tz) => (
                      <option key={tz} value={tz}>
                        {tz.replace(/_/g, " ")}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">
                  Default Difficulty
                </label>
                <div className="relative">
                  <FaBrain className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                  <select
                    className="w-full bg-slate-50 border border-slate-200 text-slate-800 rounded-lg pl-10 pr-4 py-2 focus:outline-none focus:border-indigo-500 transition-colors appearance-none"
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
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">
                  Productivity Goals
                </label>
                <div className="relative">
                  <FaCheckCircle className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input
                    type="text"
                    className="w-full bg-slate-50 border border-slate-200 text-slate-800 rounded-lg pl-10 pr-4 py-2 focus:outline-none focus:border-indigo-500 transition-colors"
                    placeholder="e.g. Wake up by 6am, solve 2 challenges daily"
                    value={profile.productivity_goals}
                    onChange={(e) =>
                      handleChange("productivity_goals", e.target.value)
                    }
                  />
                </div>
              </div>

              <div className="pt-4 text-right">
                <button
                  className="bg-slate-900 text-white px-6 py-2 rounded-md font-semibold hover:bg-slate-800 transition-colors"
                  type="submit"
                  disabled={saving}
                >
                  {saving ? "Saving…" : "Save Changes"}
                </button>
              </div>
            </form>
          </div>

          <SnoozeSettingsPage />
        </div>

        <div className="space-y-6">
          <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6">
            <h3 className="text-lg font-semibold flex items-center gap-2 mb-4">
              <FaSun className="text-orange-400" /> Appearance
            </h3>
            <div className="grid grid-cols-2 gap-3">
              <button className="border-2 border-orange-400 text-orange-500 font-semibold py-4 rounded-xl flex flex-col items-center justify-center gap-2 bg-orange-50/30">
                <FaSun className="w-6 h-6" />
                <span className="text-xs uppercase tracking-wider">Light</span>
              </button>
              <button className="border-2 border-slate-200 text-slate-500 font-semibold py-4 rounded-xl flex flex-col items-center justify-center gap-2 bg-slate-100 hover:bg-slate-200 transition-colors">
                <FaMoon className="w-6 h-6 text-slate-400" />
                <span className="text-xs uppercase tracking-wider">Dark</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
