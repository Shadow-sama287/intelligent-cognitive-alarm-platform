import React, { useState, useEffect } from "react";
import { Award, Lightbulb, CheckCircle } from "lucide-react";
import { apiClient } from "../api/client";

export const AnalyticsPage = () => {
  const [score, setScore] = useState(0);

  useEffect(() => {
    const fetchAnalytics = async () => {
      try {
        const res = await apiClient.get("/analytics/summary");
        if (res.data && res.data.data) {
          setScore(res.data.data.habit_score || 0);
        }
      } catch (err) {
        console.error("Failed to fetch analytics", err);
      }
    };
    fetchAnalytics();
  }, []);

  return (
    <div className="max-w-6xl mx-auto p-4 md:p-8 text-slate-800 space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-slate-900 mb-2 flex items-center gap-3">
          <Award className="w-8 h-8 text-indigo-600" /> Behavioral Analytics &
          Habit Score
        </h1>
        <p className="text-slate-500 text-sm">
          Track your long-term wake-up consistency and AI recommendations.
        </p>
      </div>

      <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6 text-center max-w-xl mx-auto">
        <h2 className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">
          Overall Habit Score
        </h2>
        <div className="text-6xl font-black text-slate-900 my-4">
          {score}{" "}
          <span className="text-2xl text-slate-400 font-normal">/ 100</span>
        </div>
        <span className="inline-flex items-center gap-1 bg-emerald-50 text-emerald-700 border border-emerald-200 px-3 py-1 rounded-full text-xs font-semibold">
          +6.2% improvement from last month
        </span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-1 gap-6">
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6">
          <h2 className="text-lg font-semibold text-slate-800 flex items-center gap-2 mb-4">
            <Lightbulb className="w-5 h-5 text-amber-500" /> AI Sleep
            Recommendations
          </h2>
          <ul className="text-sm text-slate-600 space-y-3">
            <li className="flex items-start gap-2.5">
              <CheckCircle className="w-4 h-4 text-indigo-500 mt-0.5 shrink-0" />
              <span>
                Shift Sunday bedtime 30 minutes earlier to reduce Monday snooze
                tendencies.
              </span>
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
};
