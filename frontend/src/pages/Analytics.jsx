import React, { useState, useEffect } from "react";
import { Award, Lightbulb, CheckCircle, TrendingUp, Calendar, Zap, AlertCircle, Clock, Brain, Grid, Sparkles } from "lucide-react";
import { apiClient } from "../api/client";

export const AnalyticsPage = () => {
  const [summary, setSummary] = useState(null);
  const [trends, setTrends] = useState([]);
  const [categoryPerf, setCategoryPerf] = useState([]);
  const [recommendations, setRecommendations] = useState([]);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);
  const [timeframeDays, setTimeframeDays] = useState(14);

  useEffect(() => {
    const fetchAnalytics = async () => {
      setLoading(true);
      try {
        const [summaryRes, trendsRes, recsRes, catPerfRes] = await Promise.all([
          apiClient.get("/analytics/summary"),
          apiClient.get(`/analytics/trends?days=${timeframeDays}`),
          apiClient.get("/analytics/recommendations"),
          apiClient.get(`/analytics/category-performance?days=${timeframeDays}`)
        ]);

        if (summaryRes.data?.data) {
          setSummary(summaryRes.data.data);
        }
        if (trendsRes.data?.data) {
          setTrends(trendsRes.data.data);
        }
        if (recsRes.data?.data) {
          setRecommendations(recsRes.data.data);
        }
        if (catPerfRes.data?.data) {
          setCategoryPerf(catPerfRes.data.data);
        }
      } catch (err) {
        console.error("Failed to fetch analytics", err);
        setError("Unable to load analytics data. Check API availability.");
      } finally {
        setLoading(false);
      }
    };

    fetchAnalytics();
  }, [timeframeDays]);

  const score = summary?.habit_score ?? 0;
  const breakdown = summary?.breakdown ?? {};

  const displayData = trends.length > 0 ? trends : [
    { day: "Mon", score: 0 },
    { day: "Tue", score: 0 },
    { day: "Wed", score: 0 },
    { day: "Thu", score: 0 },
    { day: "Fri", score: 0 },
    { day: "Sat", score: 0 },
    { day: "Sun", score: 0 }
  ];

  // Fastest category sector
  const fastestCategory = categoryPerf.length > 0 ? categoryPerf[0] : null;

  return (
    <div className="max-w-6xl mx-auto p-4 md:p-8 text-slate-800 dark:text-slate-100 space-y-6">
      {error && (
        <div className="bg-rose-50 dark:bg-slate-900 border border-rose-200 dark:border-slate-700 text-rose-700 dark:text-rose-300 rounded-xl p-4">
          {error}
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 dark:text-slate-100 mb-2 flex items-center gap-3">
            <Award className="w-8 h-8 text-indigo-600" />
            Behavioral Analytics & Habit Score
          </h1>
          <p className="text-slate-500 dark:text-slate-400 text-sm">
            Track your wake-up consistency, challenge performance, and habit improvement over time.
          </p>
        </div>

        {/* Timeframe Selector */}
        <div className="flex items-center gap-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl p-1 shadow-xs">
          {[7, 14, 30, 60].map((d) => (
            <button
              key={d}
              onClick={() => setTimeframeDays(d)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                timeframeDays === d
                  ? "bg-indigo-600 text-white shadow-xs"
                  : "text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800"
              }`}
            >
              {d} Days
            </button>
          ))}
        </div>
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

        <span className="inline-flex items-center gap-1 bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800 px-3 py-1 rounded-full text-xs font-semibold">
          <TrendingUp className="w-3.5 h-3.5" />
          Real-time evaluated baseline
        </span>

        {/* Breakdown Badges */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-6 pt-6 border-t border-slate-100 dark:border-slate-800 text-left">
          <div className="bg-slate-50 dark:bg-slate-800/50 p-2.5 rounded-lg border border-slate-100 dark:border-slate-800">
            <span className="text-[10px] uppercase font-semibold text-slate-400 block">Wake Consistency</span>
            <span className="text-base font-bold text-indigo-600 dark:text-indigo-400">{breakdown.wake_consistency ?? 0}%</span>
          </div>
          <div className="bg-slate-50 dark:bg-slate-800/50 p-2.5 rounded-lg border border-slate-100 dark:border-slate-800">
            <span className="text-[10px] uppercase font-semibold text-slate-400 block">Avg Snoozes</span>
            <span className="text-base font-bold text-amber-600 dark:text-amber-400">{breakdown.avg_snoozes ?? 0}</span>
          </div>
          <div className="bg-slate-50 dark:bg-slate-800/50 p-2.5 rounded-lg border border-slate-100 dark:border-slate-800">
            <span className="text-[10px] uppercase font-semibold text-slate-400 block">Challenge Speed</span>
            <span className="text-base font-bold text-emerald-600 dark:text-emerald-400">{breakdown.challenge_speed ?? 0} pts</span>
          </div>
          <div className="bg-slate-50 dark:bg-slate-800/50 p-2.5 rounded-lg border border-slate-100 dark:border-slate-800">
            <span className="text-[10px] uppercase font-semibold text-slate-400 block">Goal Adherence</span>
            <span className="text-base font-bold text-purple-600 dark:text-purple-400">{breakdown.goal_adherence ?? 0}%</span>
          </div>
        </div>
      </div>

      {/* Habit Score Trend Bar Chart */}
      <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-lg font-semibold text-slate-800 dark:text-slate-100 flex items-center gap-2">
            <Calendar className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
            Habit Score History ({timeframeDays} Days)
          </h2>
          <span className="text-xs text-slate-500 dark:text-slate-400">Showing {trends.length} recorded telemetry days</span>
        </div>

        {trends.length === 0 ? (
          <div className="h-[220px] flex flex-col items-center justify-center text-slate-400 text-sm">
            <AlertCircle className="w-8 h-8 text-slate-300 mb-2" />
            No telemetry records found for this timeframe. Run the telemetry seed script to populate!
          </div>
        ) : (
          <div className="overflow-x-auto pb-2">
            <div className="flex items-end gap-2.5 h-[220px] pt-4 min-w-[500px]">
              {displayData.map((item, idx) => {
                const heightPercent = Math.max(item.score, 12);
                const isGood = item.score >= 75;
                const isWarning = item.score >= 50 && item.score < 75;
                const barColorClass = isGood
                  ? "bg-emerald-500 hover:bg-emerald-400 shadow-emerald-500/20"
                  : isWarning
                  ? "bg-amber-500 hover:bg-amber-400 shadow-amber-500/20"
                  : "bg-rose-500 hover:bg-rose-400 shadow-rose-500/20";

                return (
                  <div key={item.date || idx} className="flex-1 h-full flex flex-col justify-end items-center gap-1.5 group relative">
                    {/* Tooltip */}
                    <div className="absolute -top-10 opacity-0 group-hover:opacity-100 transition-opacity bg-slate-900 text-white text-[10px] py-1 px-2.5 rounded-md shadow-xl pointer-events-none whitespace-nowrap z-30">
                      {item.date}: {item.score} pts ({item.snoozes} snoozes, {item.avg_solve_time}s solve)
                    </div>

                    <span className="text-[11px] font-bold text-slate-700 dark:text-slate-300">
                      {item.score}
                    </span>

                    {/* Bar Container */}
                    <div className="w-full flex-1 flex items-end bg-slate-100 dark:bg-slate-800/50 rounded-t-md p-0.5">
                      <div
                        className={`w-full rounded-t-sm transition-all duration-300 shadow-md ${barColorClass}`}
                        style={{ height: `${heightPercent}%` }}
                      />
                    </div>

                    <p className="text-[11px] font-semibold text-slate-500 dark:text-slate-400 truncate w-full text-center">
                      {item.day}
                    </p>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>

      {/* Wake-Up Consistency Heatmap Grid (30 / 60 Day Matrix) */}
      {trends.length > 0 && (
        <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm p-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-lg font-semibold text-slate-800 dark:text-slate-100 flex items-center gap-2">
              <Grid className="w-5 h-5 text-indigo-500" />
              Wake-Up Consistency Heatmap ({trends.length} Days)
            </h2>
            <div className="flex items-center gap-3 text-[11px] text-slate-500">
              <span className="flex items-center gap-1">
                <span className="w-3 h-3 rounded-xs bg-emerald-500 inline-block" /> Excellent (0 Snooze)
              </span>
              <span className="flex items-center gap-1">
                <span className="w-3 h-3 rounded-xs bg-amber-500 inline-block" /> Moderate
              </span>
              <span className="flex items-center gap-1">
                <span className="w-3 h-3 rounded-xs bg-rose-500 inline-block" /> Delayed Wake
              </span>
            </div>
          </div>

          <div className="grid grid-cols-5 sm:grid-cols-7 md:grid-cols-10 lg:grid-cols-15 gap-2 pt-2">
            {trends.map((item) => {
              const colorClass =
                item.score >= 75
                  ? "bg-emerald-500 border-emerald-400"
                  : item.score >= 50
                  ? "bg-amber-500 border-amber-400"
                  : "bg-rose-500 border-rose-400";
              return (
                <div
                  key={item.date}
                  className="group relative flex flex-col items-center justify-center p-2.5 rounded-lg border text-white font-bold text-xs transition-transform hover:scale-105 cursor-pointer shadow-xs"
                  style={{ backgroundColor: undefined }}
                >
                  <div className={`w-full h-full rounded-md flex flex-col items-center justify-center p-2 ${colorClass}`}>
                    <span className="text-[10px] font-semibold opacity-90">{item.day}</span>
                    <span className="text-xs font-black">{item.score}</span>
                  </div>

                  {/* Hover Tooltip */}
                  <div className="absolute -top-12 opacity-0 group-hover:opacity-100 transition-opacity bg-slate-900 text-white text-[10px] py-1.5 px-3 rounded-lg shadow-xl pointer-events-none whitespace-nowrap z-40">
                    <p className="font-bold">{item.date} ({item.day})</p>
                    <p>Score: {item.score} pts | Snoozes: {item.snoozes}</p>
                    <p>Avg Solve Time: {item.avg_solve_time}s</p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Cognitive Category Performance & Strengths Card */}
      {categoryPerf.length > 0 && (
        <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm p-6">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 mb-6">
            <div>
              <h2 className="text-lg font-semibold text-slate-800 dark:text-slate-100 flex items-center gap-2">
                <Brain className="w-5 h-5 text-purple-600 dark:text-purple-400" />
                Cognitive Sector Performance & Strengths
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                Speed and accuracy breakdown across intelligence categories.
              </p>
            </div>

            {fastestCategory && (
              <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold bg-purple-100 dark:bg-purple-950/60 text-purple-700 dark:text-purple-300 border border-purple-200 dark:border-purple-800">
                <Sparkles className="w-4 h-4 text-amber-500" />
                Fastest Sector: <strong className="capitalize">{fastestCategory.category} ({fastestCategory.avg_speed}s avg)</strong>
              </span>
            )}
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
            {categoryPerf.map((cat, idx) => {
              const maxSpeed = Math.max(...categoryPerf.map((c) => c.avg_speed));
              const speedPct = maxSpeed > 0 ? Math.max(20, Math.min(100, (1 - (cat.avg_speed / (maxSpeed * 1.2))) * 100)) : 50;

              return (
                <div
                  key={cat.category}
                  className="bg-slate-50 dark:bg-slate-800/50 rounded-xl p-4 border border-slate-200 dark:border-slate-700/70 space-y-3"
                >
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-bold text-slate-900 dark:text-slate-100 capitalize flex items-center gap-2">
                      <Zap className="w-4 h-4 text-indigo-500" />
                      {cat.category}
                    </span>
                    <span className="text-xs font-extrabold text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-950 px-2 py-0.5 rounded-md border border-indigo-200 dark:border-indigo-800">
                      {cat.avg_speed}s avg
                    </span>
                  </div>

                  {/* Progress Speed Bar */}
                  <div className="space-y-1">
                    <div className="flex justify-between text-[10px] text-slate-500 font-medium">
                      <span>Cognitive Speed Index</span>
                      <span>{cat.count} Solves ({cat.accuracy}% 1st Try)</span>
                    </div>
                    <div className="w-full h-2.5 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-gradient-to-r from-indigo-500 to-emerald-500 rounded-full transition-all duration-500"
                        style={{ width: `${speedPct}%` }}
                      />
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Daily Solve Breakdown */}
      {trends.length > 0 && (
        <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm p-6">
          <h2 className="text-lg font-semibold text-slate-800 dark:text-slate-100 mb-6 flex items-center gap-2">
            <Clock className="w-5 h-5 text-indigo-500" />
            Daily Solve & Snooze Logs ({trends.length} Days)
          </h2>

          <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-7 gap-3">
            {trends.map((item) => {
              const isGood = item.score >= 75;
              const isWarning = item.score >= 50 && item.score < 75;
              const accentBorder = isGood
                ? "hover:border-emerald-500/80 hover:shadow-emerald-500/10"
                : isWarning
                ? "hover:border-amber-500/80 hover:shadow-amber-500/10"
                : "hover:border-rose-500/80 hover:shadow-rose-500/10";

              const scoreColor = isGood
                ? "text-emerald-600 dark:text-emerald-400"
                : isWarning
                ? "text-amber-600 dark:text-amber-400"
                : "text-rose-600 dark:text-rose-400";

              return (
                <div
                  key={item.date}
                  className={`bg-slate-50 dark:bg-slate-800/60 rounded-xl p-3.5 text-center border border-slate-200 dark:border-slate-700/60 transition-all duration-300 transform hover:-translate-y-1.5 hover:scale-108 hover:z-20 cursor-pointer shadow-xs hover:shadow-xl ${accentBorder}`}
                >
                  <p className="text-[11px] font-semibold text-slate-500 dark:text-slate-400 mb-1.5 flex items-center justify-center gap-1">
                    <span>{item.day}</span>
                    <span className="text-[10px] opacity-70">({item.date.slice(5)})</span>
                  </p>
                  <p className={`font-black text-lg ${scoreColor}`}>
                    {item.score} <span className="text-xs font-semibold">pts</span>
                  </p>
                  <div className="mt-2.5 pt-2 border-t border-slate-200/60 dark:border-slate-700/60 text-[11px] space-y-1 font-medium text-slate-600 dark:text-slate-300">
                    <p className="flex items-center justify-center gap-1">
                      <span>⏱️</span> <strong>{item.avg_solve_time}s</strong>
                    </p>
                    <p className="flex items-center justify-center gap-1">
                      <span>💤</span> <strong>{item.snoozes}</strong> <span className="text-[10px] text-slate-400">snoozes</span>
                    </p>
                  </div>
                </div>
              );
            })}
          </div>

        </div>
      )}

      {/* AI Sleep & Challenge Recommendations */}
      <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm p-6">
        <h2 className="text-lg font-semibold text-slate-800 dark:text-slate-100 flex items-center gap-2 mb-4">
          <Lightbulb className="w-5 h-5 text-amber-500" />
          AI Sleep & Habit Recommendations
        </h2>

        {recommendations.length > 0 ? (
          <ul className="text-sm text-slate-600 dark:text-slate-300 space-y-3">
            {recommendations.map((rec, idx) => (
              <li key={idx} className="flex items-start gap-2.5">
                <CheckCircle className="w-4 h-4 text-indigo-500 mt-0.5 shrink-0" />
                <span>{rec}</span>
              </li>
            ))}
          </ul>
        ) : (
          <ul className="text-sm text-slate-600 dark:text-slate-300 space-y-3">
            <li className="flex items-start gap-2.5">
              <CheckCircle className="w-4 h-4 text-indigo-500 mt-0.5 shrink-0" />
              <span>Shift Sunday bedtime 30 minutes earlier to reduce Monday snooze tendencies.</span>
            </li>
            <li className="flex items-start gap-2.5">
              <CheckCircle className="w-4 h-4 text-indigo-500 mt-0.5 shrink-0" />
              <span>Complete at least one cognitive challenge daily to improve wake-up responsiveness.</span>
            </li>
          </ul>
        )}
      </div>
    </div>
  );
};




