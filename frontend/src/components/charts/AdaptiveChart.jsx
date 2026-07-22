import React, { useState, useEffect } from "react";
import { Sparkles, TrendingUp, Loader2 } from "lucide-react";
import { apiClient } from "../../api/client";

const TIER_COLORS = {
  easy: "bg-emerald-50 text-emerald-700 border-emerald-200",
  medium: "bg-amber-50 text-amber-700 border-amber-200",
  hard: "bg-rose-50 text-rose-700 border-rose-200",
  expert: "bg-purple-50 text-purple-700 border-purple-200",
};

export const AdaptiveChart = () => {
  const [difficulty, setDifficulty] = useState("Medium");
  const [efficiencyScore, setEfficiencyScore] = useState(84);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchDifficulty = async () => {
      try {
        setIsLoading(true);
        const res = await apiClient.get("/ml/recommended-difficulty");
        const data = res.data?.data || res.data;
        if (data?.difficulty) {
          setDifficulty(data.difficulty);
        }
        if (data?.efficiency_score !== undefined) {
          setEfficiencyScore(data.efficiency_score);
        }
      } catch (err) {
        console.error("Failed to fetch difficulty", err);
      } finally {
        setIsLoading(false);
      }
    };
    fetchDifficulty();
  }, []);

  const badgeColorClass =
    TIER_COLORS[difficulty.toLowerCase()] || TIER_COLORS.medium;

  return (
    <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6 space-y-4">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div className="flex items-center gap-2">
          <Sparkles className="w-5 h-5 text-amber-500" />
          <h3 className="text-lg font-semibold text-slate-800">
            AI Adaptive Difficulty
          </h3>
        </div>
        {isLoading ? (
          <div className="flex items-center gap-1.5 text-xs text-slate-400 font-medium">
            <Loader2 className="w-3.5 h-3.5 animate-spin text-indigo-500" /> Loading...
          </div>
        ) : (
          <span
            className={`px-3 py-1 border text-xs rounded-full font-bold uppercase tracking-wider transition-colors ${badgeColorClass}`}
          >
            {difficulty} Tier
          </span>
        )}
      </div>

      {/* Progress Metric */}
      <div>
        <div className="flex justify-between items-center text-xs mb-1.5">
          <span className="font-semibold text-slate-500 uppercase tracking-wider">
            Cognitive Efficiency Index
          </span>
          <span className="font-bold text-slate-900 text-sm">
            {efficiencyScore}%
          </span>
        </div>
        <div className="w-full h-3 bg-slate-100 rounded-full overflow-hidden border border-slate-200 p-0.5">
          <div
            className="h-full bg-gradient-to-r from-indigo-500 to-amber-500 rounded-full transition-all duration-500"
            style={{ width: `${efficiencyScore}%` }}
          />
        </div>
      </div>

      {/* Insight Footer */}
      <p className="text-xs text-slate-500 flex items-center gap-1.5 pt-1">
        <TrendingUp className="w-4 h-4 text-emerald-500 shrink-0" />
        <span>
          AI automatically scaled your puzzle level based on recent solve times.
        </span>
      </p>
    </div>
  );
};

export default AdaptiveChart;
