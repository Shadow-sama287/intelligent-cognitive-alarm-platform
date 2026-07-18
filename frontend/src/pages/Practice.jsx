import { useState } from "react";
import { Link } from "react-router-dom";
import { FaArrowLeft, FaBrain, FaSyncAlt } from "react-icons/fa";
import { ChallengeWidget } from "../components/challenges/ChallengeWidget";
import { apiClient } from "../api/client";

export default function Practice() {
  const [toast, setToast] = useState(null);
  const [challenge, setChallenge] = useState(null);
  const [sessionId, setSessionId] = useState(null);
  const [loading, setLoading] = useState(false);
  const [category, setCategory] = useState("math");

  const categories = ["math", "logic", "memory", "riddles", "vocabulary", "trivia", "spatial"];

  const fetchChallenge = async () => {
    try {
      setLoading(true);
      setToast(null);
      setChallenge(null);
      setSessionId(null);

      const res = await apiClient.post(
        `/sessions/start?alarm_id=practice-mode&category=${category}`
      );
      const data = res.data.data;
      setSessionId(data.session_id);
      setChallenge(data.challenge);
    } catch (err) {
      console.error("Failed to fetch challenge", err);
      setToast({
        type: "error",
        message: "Failed to load challenge. Please try again.",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleVerify = async (answer) => {
    if (!sessionId) return { is_correct: false, time_taken_seconds: 0 };

    try {
      const res = await apiClient.post("/challenges/verify", {
        session_id: sessionId,
        user_answer: answer,
      });

      const result = res.data.data;

      setToast(
        result.is_correct
          ? {
              type: "success",
              message: `Correct! Solved in ${result.time_taken_seconds}s (${result.attempts} attempt${result.attempts !== 1 ? "s" : ""})`,
            }
          : {
              type: "error",
              message: `Incorrect answer (attempt ${result.attempts}). Try again!`,
            }
      );

      // If time expired and a new challenge was provided
      if (result.time_expired && result.new_challenge) {
        setChallenge(result.new_challenge);
        setToast({
          type: "error",
          message: "Time expired! Here's a new challenge.",
        });
      }

      return result;
    } catch (err) {
      console.error("Verification failed", err);
      setToast({
        type: "error",
        message: err.response?.data?.detail || "Verification failed.",
      });
      return { is_correct: false, time_taken_seconds: 0 };
    }
  };

  return (
    <div className="max-w-6xl mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <Link
          to="/dashboard"
          className="inline-flex items-center gap-2 text-indigo-600 hover:text-indigo-500 font-medium text-sm"
        >
          <FaArrowLeft /> Back to Dashboard
        </Link>
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-50 text-indigo-600 text-sm font-semibold">
          <FaBrain /> Practice Playground
        </div>
      </div>

      <div className="text-center space-y-3">
        <h1 className="text-3xl font-bold text-slate-900">
          Practice your cognitive challenge solving
        </h1>
        <p className="text-slate-500 max-w-2xl mx-auto">
          Select a category and generate a real challenge from the AI engine.
          Your practice results are saved to your performance history.
        </p>
      </div>

      {/* Category Selector & Generate Button */}
      <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
        <select
          value={category}
          onChange={(e) => setCategory(e.target.value)}
          className="bg-slate-50 border border-slate-200 text-slate-800 rounded-lg px-4 py-2.5 text-sm font-medium focus:outline-none focus:border-indigo-500"
        >
          {categories.map((cat) => (
            <option key={cat} value={cat}>
              {cat.charAt(0).toUpperCase() + cat.slice(1)}
            </option>
          ))}
        </select>

        <button
          onClick={fetchChallenge}
          disabled={loading}
          className="inline-flex items-center gap-2 bg-indigo-600 hover:bg-indigo-500 text-white font-semibold px-6 py-2.5 rounded-lg transition-colors shadow-sm"
        >
          <FaSyncAlt className={loading ? "animate-spin" : ""} />
          {loading ? "Generating..." : "Generate Challenge"}
        </button>
      </div>

      {toast && (
        <div
          className={`mx-auto max-w-md rounded-xl border px-4 py-3 text-center text-sm font-semibold ${
            toast.type === "success"
              ? "border-emerald-500/30 bg-emerald-50 text-emerald-700"
              : "border-rose-500/30 bg-rose-50 text-rose-700"
          }`}
        >
          {toast.message}
        </div>
      )}

      {challenge ? (
        <ChallengeWidget challenge={challenge} onVerify={handleVerify} />
      ) : (
        !loading && (
          <div className="text-center py-12 text-slate-400">
            <FaBrain className="mx-auto text-4xl mb-3 text-slate-300" />
            <p className="text-sm">
              Click "Generate Challenge" to start practicing!
            </p>
          </div>
        )
      )}
    </div>
  );
}