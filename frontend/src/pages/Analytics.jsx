import React, { useState, useEffect } from "react";
import { Award, Lightbulb, CheckCircle, TrendingUp } from "lucide-react";
import { apiClient } from "../api/client";

export const AnalyticsPage = () => {
  const [score, setScore] = useState(0);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAnalytics = async () => {
      try {
        const res = await apiClient.get("/analytics/summary");

        if (res.data?.data) {
          setScore(res.data.data.habit_score || 0);
        }
      } catch (err) {
        console.error("Failed to fetch analytics", err);
        setError("Unable to load analytics data. Check API availability and CORS settings.");
      } finally {
        setLoading(false);
      }
    };

    fetchAnalytics();
  }, []);

  // Temporary mock trend data
  // Replace with backend historical analytics later
  const chartData = [
    { day: "Mon", score: 68 },
    { day: "Tue", score: 72 },
    { day: "Wed", score: 75 },
    { day: "Thu", score: 80 },
    { day: "Fri", score: 84 },
    { day: "Sat", score: 88 },
    { day: "Sun", score: score || 90 },
  ];

  return (
    <div className="max-w-6xl mx-auto p-4 md:p-8 text-slate-800 dark:text-slate-100 space-y-6">
      {error && (
        <div className="bg-rose-50 dark:bg-slate-900 border border-rose-200 dark:border-slate-700 text-rose-700 dark:text-rose-300 rounded-xl p-4">
          {error}
        </div>
      )}

      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-slate-900 mb-2 flex items-center gap-3">
          <Award className="w-8 h-8 text-indigo-600" />
          Behavioral Analytics & Habit Score
        </h1>

        <p className="text-slate-500 text-sm">
          Track your wake-up consistency, challenge performance, and habit
          improvement over time.
        </p>
      </div>

      {/* Habit Score Card */}
      <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm p-6 text-center max-w-xl mx-auto">
        <h2 className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-2">
          Overall Habit Score
        </h2>

        <div className="text-6xl font-black text-slate-900 dark:text-slate-50 my-4">
          {score}
          <span className="text-2xl text-slate-400 dark:text-slate-400 font-normal"> / 100</span>
        </div>

        <span className="inline-flex items-center gap-1 bg-emerald-50 text-emerald-700 border border-emerald-200 px-3 py-1 rounded-full text-xs font-semibold">
          <TrendingUp className="w-3 h-3" />
          +6.2% improvement from last month
        </span>
      </div>

      {/* Habit Score Trend */}
      <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm p-6">
        <h2 className="text-lg font-semibold text-slate-800 dark:text-slate-100 mb-6">
          Habit Score Trend
        </h2>

        <div className="grid grid-cols-7 gap-3 items-end h-[260px] pb-4">
          {chartData.map((item) => (
            <div key={item.day} className="flex flex-col items-center gap-3">
              <div
                className="w-full rounded-t-xl bg-gradient-to-t from-indigo-700 to-indigo-400 shadow-md"
                style={{ height: `${Math.max(item.score, 8)}%` }}
              />
              <p className="text-xs text-slate-500 dark:text-slate-400">
                {item.day}
              </p>
            </div>
          ))}
        </div>

        <div className="mt-4 text-sm text-slate-500 dark:text-slate-400">
          Trend bars are a visual placeholder until backend analytics history is available.
        </div>
      </div>

      {/* Wake-Up Consistency */}
      <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm p-6">
        <h2 className="text-lg font-semibold text-slate-800 dark:text-slate-100 mb-6">
          Wake-up Consistency
        </h2>

        <div className="grid grid-cols-2 md:grid-cols-7 gap-3">
          {chartData.map((item) => (
            <div
              key={item.day}
              className="bg-indigo-50 rounded-lg p-4 text-center border border-indigo-100"
            >
              <p className="text-xs text-slate-500 mb-1">{item.day}</p>

              <p className="font-bold text-indigo-700 text-lg">
                {item.score}%
              </p>
            </div>
          ))}
        </div>
      </div>

      {/* Recommendations */}
      <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm p-6">
        <h2 className="text-lg font-semibold text-slate-800 dark:text-slate-100 flex items-center gap-2 mb-4">
          <Lightbulb className="w-5 h-5 text-amber-500" />
          AI Sleep Recommendations
        </h2>

        <ul className="text-sm text-slate-600 space-y-3">
          <li className="flex items-start gap-2.5">
            <CheckCircle className="w-4 h-4 text-indigo-500 mt-0.5 shrink-0" />
            <span>
              Shift Sunday bedtime 30 minutes earlier to reduce Monday snooze
              tendencies.
            </span>
          </li>

          <li className="flex items-start gap-2.5">
            <CheckCircle className="w-4 h-4 text-indigo-500 mt-0.5 shrink-0" />
            <span>
              Complete at least one cognitive challenge daily to improve wake-up
              responsiveness.
            </span>
          </li>

          <li className="flex items-start gap-2.5">
            <CheckCircle className="w-4 h-4 text-indigo-500 mt-0.5 shrink-0" />
            <span>
              Maintaining fewer than two snoozes per alarm can significantly
              increase your habit score.
            </span>
          </li>
        </ul>
      </div>
    </div>
  );
};


