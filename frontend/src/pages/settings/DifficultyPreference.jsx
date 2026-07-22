import React, { useState, useEffect } from "react";
import { Loader2 } from "lucide-react";
import { apiClient } from "../../api/client";

export const DifficultyPreference = () => {
  const [preference, setPreference] = useState("Medium");
  const [status, setStatus] = useState({ text: "", isError: false });
  const [isFetching, setIsFetching] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    const fetchPreference = async () => {
      try {
        setIsFetching(true);
        const res = await apiClient.get("/telemetry/difficulty-preference");
        const data = res.data?.data || res.data;
        if (data?.preferred_difficulty) {
          setPreference(data.preferred_difficulty);
        }
      } catch (err) {
        console.error("Failed to fetch initial difficulty preference", err);
      } finally {
        setIsFetching(false);
      }
    };
    fetchPreference();
  }, []);

  const handleSave = async () => {
    try {
      setIsSaving(true);
      setStatus({ text: "", isError: false });
      await apiClient.put("/telemetry/difficulty-preference", {
        preferred_difficulty: preference,
      });
      setStatus({ text: "Saved successfully!", isError: false });
    } catch (err) {
      setStatus({ text: "Error saving preference.", isError: true });
    } finally {
      setIsSaving(false);
    }
  };

  const handlePreferenceChange = (e) => {
    setPreference(e.target.value);
    if (status.text) {
      setStatus({ text: "", isError: false });
    }
  };

  return (
    <div className="glass-panel p-6 rounded-2xl max-w-md mx-auto mt-10">
      <h2 className="text-xl text-white font-bold mb-4">
        Difficulty Preferences
      </h2>
      <div className="space-y-4">
        <label className="text-sm text-slate-400 block">
          Preferred Challenge Level
        </label>
        <select
          className="w-full bg-slate-900 border border-slate-700 text-white rounded p-2 disabled:opacity-50"
          value={preference}
          onChange={handlePreferenceChange}
          disabled={isFetching || isSaving}
        >
          <option value="Easy">Easy</option>
          <option value="Medium">Medium</option>
          <option value="Hard">Hard</option>
          <option value="Expert">Expert</option>
        </select>
        <button
          onClick={handleSave}
          disabled={isFetching || isSaving}
          className="w-full bg-indigo-500 hover:bg-indigo-600 disabled:bg-indigo-500/50 text-white font-bold py-2 px-4 rounded transition-colors flex items-center justify-center gap-2"
        >
          {isSaving ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" /> Saving...
            </>
          ) : (
            "Save Preference"
          )}
        </button>
        {status.text && (
          <p
            className={`text-sm mt-2 ${
              status.isError ? "text-rose-400" : "text-emerald-400"
            }`}
          >
            {status.text}
          </p>
        )}
      </div>
    </div>
  );
};
