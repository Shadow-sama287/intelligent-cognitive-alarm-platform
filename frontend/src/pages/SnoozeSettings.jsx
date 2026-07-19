import React, { useState, useEffect } from "react";
import {
  ShieldAlert,
  Zap,
  Clock,
  Save,
  CheckCircle2,
} from "lucide-react";
import { apiClient } from "../api/client";

export const SnoozeSettingsPage = () => {
  const [snoozeLimit, setSnoozeLimit] = useState(3);
  const [escalateDifficulty, setEscalateDifficulty] = useState(true);
  const [timePenalty, setTimePenalty] = useState(true);
  
  const [initialSettings, setInitialSettings] = useState(null);

  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  // Load settings from backend
  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const res = await apiClient.get("/profile/snooze-settings");
        const data = res.data.data;

        setSnoozeLimit(data.snooze_limit);
        setEscalateDifficulty(data.escalate_difficulty);
        setTimePenalty(data.time_penalty_enabled);
        
        setInitialSettings({
          snoozeLimit: data.snooze_limit,
          escalateDifficulty: data.escalate_difficulty,
          timePenalty: data.time_penalty_enabled,
        });
      } catch (err) {
        console.error("Failed to fetch snooze settings", err);
        setErrorMsg("Failed to load settings.");
      }
    };

    fetchSettings();
  }, []);

  const hasChanges = initialSettings && (
    snoozeLimit !== initialSettings.snoozeLimit ||
    escalateDifficulty !== initialSettings.escalateDifficulty ||
    timePenalty !== initialSettings.timePenalty
  );

  // Save settings
  const handleSave = async () => {
    try {
      setSaving(true);
      setErrorMsg("");

      await apiClient.put("/profile/snooze-settings", {
        snooze_limit: snoozeLimit,
        escalate_difficulty: escalateDifficulty,
        time_penalty_enabled: timePenalty,
      });

      setInitialSettings({
        snoozeLimit,
        escalateDifficulty,
        timePenalty,
      });
      setSaved(true);

      setTimeout(() => {
        setSaved(false);
      }, 2000);
    } catch (err) {
      console.error("Failed to save snooze settings", err);
      setErrorMsg("Failed to save settings. Please try again.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6 space-y-6">
      <div>
        <h2 className="text-lg font-semibold flex items-center gap-2 text-slate-800">
          <ShieldAlert className="w-5 h-5 text-indigo-500" />
          Anti-Snooze & Hardcore Rules
        </h2>

        <p className="text-xs text-slate-500 mt-1">
          Configure wake-up enforcement and difficulty escalation rules.
        </p>
      </div>

      {errorMsg && (
        <div className="bg-red-50 text-red-600 border border-red-200 rounded-lg p-3 text-sm">
          {errorMsg}
        </div>
      )}

      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h3 className="text-sm font-semibold text-slate-800">
              Max Snooze Limit
            </h3>

            <p className="text-xs text-slate-500">
              Total snoozes permitted before lock-out
            </p>
          </div>

          <select
            value={snoozeLimit}
            onChange={(e) => setSnoozeLimit(Number(e.target.value))}
            className="bg-slate-50 border border-slate-200 rounded-lg px-4 py-2"
          >
            <option value={0}>0 (No Snooze - Hardcore)</option>
            <option value={1}>1 Snooze</option>
            <option value={2}>2 Snoozes</option>
            <option value={3}>3 Snoozes</option>
            <option value={4}>4 Snoozes</option>
            <option value={5}>5 Snoozes</option>
          </select>
        </div>

        <hr />

        <div className="flex justify-between items-center">
          <div>
            <h3 className="text-sm font-semibold flex items-center gap-2">
              <Zap className="w-4 h-4 text-amber-500" />
              Escalating Difficulty
            </h3>

            <p className="text-xs text-slate-500">
              Increase puzzle difficulty tier each time snooze is pressed
            </p>
          </div>

          <input
            type="checkbox"
            checked={escalateDifficulty}
            onChange={(e) => setEscalateDifficulty(e.target.checked)}
            className="w-5 h-5 accent-indigo-600"
          />
        </div>

        <hr />

        <div className="flex justify-between items-center">
          <div>
            <h3 className="text-sm font-semibold flex items-center gap-2">
              <Clock className="w-4 h-4 text-rose-500" />
              Time Limit Penalties
            </h3>

            <p className="text-xs text-slate-500">
              Deduct 15 seconds from solve timer per snooze
            </p>
          </div>

          <input
            type="checkbox"
            checked={timePenalty}
            onChange={(e) => setTimePenalty(e.target.checked)}
            className="w-5 h-5 accent-rose-600"
          />
        </div>
      </div>

      <button
        onClick={handleSave}
        disabled={saving || (initialSettings !== null && !hasChanges)}
        className={`w-full py-3 rounded-lg flex justify-center items-center gap-2 font-semibold transition-colors
          ${(saving || (initialSettings !== null && !hasChanges))
            ? "bg-indigo-300 text-white cursor-not-allowed"
            : "bg-indigo-600 hover:bg-indigo-500 text-white shadow-sm"
          }`}
      >
        {saved ? (
          <>
            <CheckCircle2 className="w-4 h-4" />
            Saved!
          </>
        ) : saving ? (
          "Saving..."
        ) : (
          <>
            <Save className="w-4 h-4" />
            Save Settings
          </>
        )}
      </button>
    </div>
  );
};