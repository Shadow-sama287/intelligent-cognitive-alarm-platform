import React, { useState } from "react";
import { ShieldAlert, Zap, Clock } from "lucide-react";

export const SnoozeSettingsPage = () => {
  const [snoozeLimit, setSnoozeLimit] = useState(2);
  const [escalateDifficulty, setEscalateDifficulty] = useState(true);
  const [timePenalty, setTimePenalty] = useState(true);

  return (
    <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6 space-y-6">
      <div>
        <h2 className="text-lg font-semibold flex items-center gap-2 text-slate-800">
          <ShieldAlert className="w-5 h-5 text-indigo-500" /> Anti-Snooze &
          Hardcore Rules
        </h2>
        <p className="text-xs text-slate-500 mt-1">
          Configure wake-up enforcement and difficulty escalation rules.
        </p>
      </div>

      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h3 className="text-sm font-semibold text-slate-800">Max Snooze Limit</h3>
            <p className="text-xs text-slate-500">
              Total snoozes permitted before lock-out
            </p>
          </div>
          <select
            value={snoozeLimit}
            onChange={(e) => setSnoozeLimit(Number(e.target.value))}
            className="bg-slate-50 border border-slate-200 text-slate-800 rounded-lg px-4 py-2 focus:outline-none focus:border-indigo-500"
          >
            <option value={0}>0 (No Snooze - Hardcore)</option>
            <option value={1}>1 Snooze</option>
            <option value={2}>2 Snoozes</option>
            <option value={3}>3 Snoozes</option>
          </select>
        </div>

        <hr className="border-slate-100" />

        <div className="flex justify-between items-center">
          <div>
            <h3 className="text-sm font-semibold flex items-center gap-2 text-slate-800">
              <Zap className="w-4 h-4 text-amber-500" /> Escalating Difficulty
            </h3>
            <p className="text-xs text-slate-500">
              Increase puzzle difficulty tier each time snooze is pressed
            </p>
          </div>
          <input
            type="checkbox"
            checked={escalateDifficulty}
            onChange={(e) => setEscalateDifficulty(e.target.checked)}
            className="w-5 h-5 accent-indigo-600 rounded"
          />
        </div>

        <hr className="border-slate-100" />

        <div className="flex justify-between items-center">
          <div>
            <h3 className="text-sm font-semibold flex items-center gap-2 text-slate-800">
              <Clock className="w-4 h-4 text-rose-500" /> Time Limit Penalties
            </h3>
            <p className="text-xs text-slate-500">
              Deduct 15 seconds from solve timer per snooze
            </p>
          </div>
          <input
            type="checkbox"
            checked={timePenalty}
            onChange={(e) => setTimePenalty(e.target.checked)}
            className="w-5 h-5 accent-rose-600 rounded"
          />
        </div>
      </div>
    </div>
  );
};
