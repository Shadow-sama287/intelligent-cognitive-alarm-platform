import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { FaArrowLeft, FaBrain } from "react-icons/fa";
import { ChallengeWidget } from "../components/challenges/ChallengeWidget";

const categories = [
  {
    id: "math",
    label: "Math",
    levels: ["Beginner", "Easy", "Medium", "Hard", "Expert"],
  },
  {
    id: "memory",
    label: "Memory",
    levels: ["3×3 Matrix", "4×4 Matrix", "Pattern Sequence", "Timing"],
  },
  {
    id: "word",
    label: "Word",
    levels: ["Anagram", "Scramble", "Dictionary"],
  },
];

const challengeBank = [
  // Math challenges
  { category: "math", level: "Beginner", prompt: "What is 7 + 5?", answer: "12", time_limit_seconds: 45 },
  { category: "math", level: "Beginner", prompt: "What is 4 + 3?", answer: "7", time_limit_seconds: 40 },
  { category: "math", level: "Easy", prompt: "What is 8 × 2?", answer: "16", time_limit_seconds: 40 },
  { category: "math", level: "Easy", prompt: "What is 15 − 7?", answer: "8", time_limit_seconds: 40 },
  { category: "math", level: "Medium", prompt: "What is 9 × 3 − 5?", answer: "22", time_limit_seconds: 35 },
  { category: "math", level: "Medium", prompt: "What is 14 ÷ 2 + 6?", answer: "13", time_limit_seconds: 35 },
  { category: "math", level: "Hard", prompt: "What is 18 ÷ 3 + 4 × 2?", answer: "14", time_limit_seconds: 30 },
  { category: "math", level: "Hard", prompt: "What is 7 × 6 − 11?", answer: "31", time_limit_seconds: 30 },
  { category: "math", level: "Expert", prompt: "What is 5 × (3 + 4) − 2?", answer: "33", time_limit_seconds: 25 },
  { category: "math", level: "Expert", prompt: "What is 12 ÷ (2 + 1) + 7?", answer: "11", time_limit_seconds: 25 },

  // Memory challenges
  {
    category: "memory",
    level: "3×3 Matrix",
    prompt: "In a 3×3 matrix where numbers increase by 1 left-to-right, top-to-bottom, what number replaces the blank in row 2, column 3? (Row 1 has 1,2,3)",
    answer: "6",
    time_limit_seconds: 50,
  },
  {
    category: "memory",
    level: "4×4 Matrix",
    prompt: "In a 4×4 matrix with rows [1,2,3,4], [5,6,7,8], [9,10,11,12], [13,14,15,?], what is the missing number?",
    answer: "16",
    time_limit_seconds: 50,
  },
  {
    category: "memory",
    level: "Pattern Sequence",
    prompt: "What number comes next in the pattern: 3, 6, 9, 12, ?",
    answer: "15",
    time_limit_seconds: 45,
  },
  {
    category: "memory",
    level: "Timing",
    prompt: "Remember the sequence 4, 8, 2, 9. What was the second number?",
    answer: "8",
    time_limit_seconds: 45,
  },

  // Word challenges
  {
    category: "word",
    level: "Anagram",
    prompt: "Unscramble this word: 'plepa'",
    answer: "apple",
    time_limit_seconds: 45,
  },
  {
    category: "word",
    level: "Scramble",
    prompt: "Rearrange the letters 'oedc' to form a word.",
    answer: "code",
    time_limit_seconds: 45,
  },
  {
    category: "word",
    level: "Dictionary",
    prompt: "What word means 'a large body of water'?",
    answer: "ocean",
    time_limit_seconds: 45,
  },
];

const getRandomChallenge = (category, level) => {
  const filtered = challengeBank.filter((item) => item.category === category && item.level === level);
  if (!filtered.length) return null;
  return filtered[Math.floor(Math.random() * filtered.length)];
};

export default function Practice() {
  const [toast, setToast] = useState(null);
  const [selectedCategory, setSelectedCategory] = useState("math");
  const [selectedLevel, setSelectedLevel] = useState("Beginner");
  const [challenge, setChallenge] = useState(() => getRandomChallenge("math", "Beginner"));

  useEffect(() => {
    setChallenge(getRandomChallenge(selectedCategory, selectedLevel));
    setToast(null);
  }, [selectedCategory, selectedLevel]);

  const handleVerify = async (answer) => {
    const is_correct = answer.trim().toLowerCase() === challenge.answer.toLowerCase();

    setToast(
      is_correct
        ? { type: "success", message: `Correct! Solved in ${challenge.time_limit_seconds - 5 || 8}s` }
        : { type: "error", message: "Incorrect answer. Try again!" }
    );

    return {
      is_correct,
      time_taken_seconds: is_correct ? Math.max(5, challenge.time_limit_seconds - 5) : challenge.time_limit_seconds,
    };
  };

  const handleNextChallenge = () => {
    setToast(null);
    setChallenge(getRandomChallenge(selectedCategory, selectedLevel));
  };

  const currentCategory = categories.find((cat) => cat.id === selectedCategory);

  return (
    <div className="max-w-7xl mx-auto p-6 space-y-8 text-white">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div className="space-y-2">
          <Link to="/dashboard" className="inline-flex items-center gap-2 text-indigo-200 hover:text-indigo-100 text-sm font-medium">
            <FaArrowLeft /> Back to Dashboard
          </Link>
          <div className="text-3xl font-bold">Practice your cognitive challenge solving</div>
          <p className="max-w-2xl text-slate-300">
            Choose a topic and difficulty, then solve a series of challenges from Math, Memory, and Word categories.
          </p>
        </div>
        <div className="inline-flex items-center gap-2 rounded-full bg-violet-500/10 px-4 py-2 text-sm font-semibold text-violet-100 shadow-lg shadow-violet-900/20 backdrop-blur-xl">
          <FaBrain /> Practice Playground
        </div>
      </div>

      <div className="grid gap-6 xl:grid-cols-[300px_minmax(0,1fr)]">
        <aside className="rounded-[2rem] border border-white/10 bg-white/5 p-6 shadow-xl shadow-indigo-950/20 backdrop-blur-xl">
          <div className="mb-6 text-sm uppercase tracking-[0.35em] text-slate-400">Topic</div>
          <div className="grid gap-3">
            {categories.map((category) => (
              <button
                key={category.id}
                onClick={() => {
                  setSelectedCategory(category.id);
                  setSelectedLevel(category.levels[0]);
                }}
                className={`rounded-full px-4 py-3 text-left text-sm font-semibold transition ${
                  selectedCategory === category.id
                    ? "bg-violet-500 text-white shadow-lg shadow-violet-500/20"
                    : "bg-slate-900/70 text-slate-100 hover:bg-slate-900/90"
                }`}
              >
                {category.label}
              </button>
            ))}
          </div>

          <div className="mt-8 text-sm uppercase tracking-[0.35em] text-slate-400">Level</div>
          <div className="mt-3 grid gap-3">
            {currentCategory.levels.map((level) => (
              <button
                key={level}
                onClick={() => setSelectedLevel(level)}
                className={`rounded-full px-4 py-3 text-left text-sm font-semibold transition ${
                  selectedLevel === level
                    ? "bg-emerald-500 text-white shadow-lg shadow-emerald-500/20"
                    : "bg-slate-900/70 text-slate-100 hover:bg-slate-900/90"
                }`}
              >
                {level}
              </button>
            ))}
          </div>

          <div className="mt-8 rounded-[1.75rem] border border-white/10 bg-slate-950/40 p-5 text-sm text-slate-300">
            <div className="mb-3 text-slate-400">Selected</div>
            <p className="mb-2"><strong className="text-white">Category</strong>: {currentCategory.label}</p>
            <p className="mb-4"><strong className="text-white">Level</strong>: {selectedLevel}</p>
            <button
              onClick={handleNextChallenge}
              className="w-full rounded-2xl bg-indigo-500 px-4 py-3 text-sm font-semibold text-white shadow-lg shadow-indigo-500/20 transition hover:bg-indigo-400"
            >
              Next challenge
            </button>
          </div>
        </aside>

        <section className="grid gap-6">
          <div className="rounded-[2rem] border border-white/10 bg-white/5 p-6 shadow-xl shadow-indigo-950/20 backdrop-blur-xl">
            <div className="flex flex-wrap items-center justify-between gap-4">
              <span className="text-sm uppercase tracking-[0.35em] text-slate-400">Current challenge</span>
              <span className="rounded-full bg-slate-900/80 px-4 py-2 text-xs font-semibold uppercase tracking-[0.3em] text-slate-300">
                {challenge?.category?.toUpperCase() || "MATH"}
              </span>
            </div>
            <div className="mt-6 rounded-[1.75rem] bg-violet-500/10 p-8 text-slate-100">
              <p className="text-sm font-semibold uppercase tracking-[0.35em] text-emerald-300">
                {challenge?.level || "Beginner"}
              </p>
              <h2 className="mt-4 text-3xl font-bold leading-tight">{challenge?.prompt}</h2>
              <p className="mt-5 inline-flex items-center gap-2 rounded-full bg-white/10 px-4 py-2 text-sm text-slate-300">
                <span className="h-2 w-2 rounded-full bg-emerald-400" />
                Time limit: {challenge?.time_limit_seconds}s
              </p>
            </div>
          </div>

          {toast && (
            <div
              className={`rounded-[1.75rem] border px-4 py-3 text-center text-sm font-semibold ${
                toast.type === "success"
                  ? "border-emerald-500/30 bg-emerald-500/15 text-emerald-200"
                  : "border-rose-500/30 bg-rose-500/15 text-rose-200"
              }`}
            >
              {toast.message}
            </div>
          )}

          <div className="grid gap-6 lg:grid-cols-[1.7fr_0.9fr]">
            <ChallengeWidget challenge={challenge} onVerify={handleVerify} />

            <div className="rounded-[2rem] border border-white/10 bg-white/5 p-6 shadow-xl shadow-indigo-950/20 backdrop-blur-xl">
              <div className="text-sm uppercase tracking-[0.35em] text-slate-400">Challenge Preview</div>
              <div className="mt-6 space-y-4 rounded-[1.75rem] bg-slate-900/80 p-5">
                <p className="text-xs uppercase tracking-[0.35em] text-emerald-300">{challenge?.category?.toUpperCase() || "MATH"} • {challenge?.level}</p>
                <h3 className="text-xl font-semibold text-white">{challenge?.prompt}</h3>
                <p className="text-sm text-slate-300">Enter your answer in the box and submit before time runs out.</p>
                <p className="text-sm text-slate-400">Time limit: {challenge?.time_limit_seconds}s</p>
              </div>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
