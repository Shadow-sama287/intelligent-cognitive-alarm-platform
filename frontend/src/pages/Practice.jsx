import { useState } from "react";
import { Link } from "react-router-dom";
import { FaArrowLeft, FaBrain } from "react-icons/fa";
import { ChallengeWidget } from "../components/challenges/ChallengeWidget";

export default function Practice() {
  const [toast, setToast] = useState(null);

  const challenge = {
    prompt: "What is 7 + 5?",
    time_limit_seconds: 45,
  };

  const handleVerify = async (answer) => {
    const is_correct = answer.trim().toLowerCase() === "12";

    setToast(
      is_correct
        ? { type: "success", message: "Correct! Solved in 8s" }
        : { type: "error", message: "Incorrect answer. Try again!" }
    );

    return {
      is_correct,
      time_taken_seconds: 8,
    };
  };

  return (
    <div className="max-w-6xl mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <Link to="/dashboard" className="inline-flex items-center gap-2 text-indigo-300 hover:text-indigo-200">
          <FaArrowLeft /> Back to Dashboard
        </Link>
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/10 text-indigo-300 text-sm font-semibold">
          <FaBrain /> Practice Playground
        </div>
      </div>

      <div className="text-center space-y-3">
        <h1 className="text-3xl font-bold text-white">Practice your cognitive challenge solving</h1>
        <p className="text-slate-300 max-w-2xl mx-auto">
          Try the interactive solver widget below to verify the UI, feedback states, and answer handling.
        </p>
      </div>

      {toast && (
        <div
          className={`mx-auto max-w-md rounded-xl border px-4 py-3 text-center text-sm font-semibold ${
            toast.type === "success"
              ? "border-emerald-500/30 bg-emerald-500/20 text-emerald-400"
              : "border-rose-500/30 bg-rose-500/20 text-rose-400"
          }`}
        >
          {toast.message}
        </div>
      )}

      <ChallengeWidget challenge={challenge} onVerify={handleVerify} />
    </div>
  );
}
