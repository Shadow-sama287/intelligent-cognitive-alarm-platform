import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { FaArrowLeft, FaBrain, FaWandMagicSparkles, FaBookOpen } from "react-icons/fa6";
import { ChallengeWidget } from "../components/challenges/ChallengeWidget";
import { apiClient } from "../api/client";

const categories = [
  { id: "math", label: "Math Problems", levels: ["Beginner", "Easy", "Medium", "Hard", "Expert"] },
  { id: "logic", label: "Logic Puzzles", levels: ["Easy", "Medium", "Hard"] },
  { id: "memory", label: "Memory Challenges", levels: ["3×3 Matrix", "4×4 Matrix", "Pattern Sequence", "Timing"] },
  { id: "word", label: "Word Games", levels: ["Anagram", "Scramble", "Dictionary"] },
  { id: "pattern", label: "Pattern Recognition", levels: ["Easy", "Medium", "Hard"] },
  { id: "riddles", label: "Riddles", levels: ["Easy", "Medium", "Hard"] },
  { id: "trivia", label: "Quick Quizzes", levels: ["General", "Science", "History"] },
];

const challengeBank = [
  // Math
  { category: "math", level: "Beginner", prompt: "What is 7 + 5?", answer: "12", time_limit_seconds: 45 },
  { category: "math", level: "Medium", prompt: "What is 14 ÷ 2 + 6?", answer: "13", time_limit_seconds: 35 },
  
  // Logic
  { category: "logic", level: "Easy", prompt: "If some A are B, and all B are C, are some A definitely C?", answer: "yes", time_limit_seconds: 45 },
  
  // Memory
  { category: "memory", level: "Pattern Sequence", prompt: "What number comes next in the pattern: 3, 6, 9, 12, ?", answer: "15", time_limit_seconds: 45 },
  
  // Word
  { category: "word", level: "Anagram", prompt: "Unscramble this word: 'plepa'", answer: "apple", time_limit_seconds: 45 },
  
  // Pattern
  { category: "pattern", level: "Easy", prompt: "A, C, E, G, ?", answer: "I", time_limit_seconds: 30 },
  
  // Riddles
  { category: "riddles", level: "Easy", prompt: "I speak without a mouth and hear without ears. I have no body, but I come alive with wind. What am I?", answer: "echo", time_limit_seconds: 45 },
  
  // Trivia
  { category: "trivia", level: "General", prompt: "What is the capital of France?", answer: "paris", time_limit_seconds: 30 },
];

const getRandomChallenge = (category, level) => {
  const filtered = challengeBank.filter((item) => item.category === category && item.level === level);
  if (!filtered.length) {
    // Return a generic fallback if no mock exists for this level yet
    return {
      category,
      level,
      prompt: `Sample ${level} ${category} challenge (Add more to bank)`,
      answer: "test",
      time_limit_seconds: 60,
    };
  }
  return filtered[Math.floor(Math.random() * filtered.length)];
};

export default function Practice() {
  const [toast, setToast] = useState(null);
  
  // Mode: 'static' or 'generate'
  const [mode, setMode] = useState('static');

  const [selectedCategory, setSelectedCategory] = useState("math");
  const [selectedLevel, setSelectedLevel] = useState("Beginner");
  
  const [challenge, setChallenge] = useState(null);
  const [isActive, setIsActive] = useState(false);
  const [loadingChallenge, setLoadingChallenge] = useState(false);

  // Load static challenge when mode or filters change
  useEffect(() => {
    if (mode === 'static') {
      setChallenge(getRandomChallenge(selectedCategory, selectedLevel));
      setIsActive(false);
      setToast(null);
    }
  }, [selectedCategory, selectedLevel, mode]);

  const handleVerify = async (answer) => {
    // The backend uses LLM validation, but for Practice we do simple exact match for now 
    // OR we could call a verify endpoint. For now, exact match for static, and generate also returns 'correct_answer'
    const is_correct = answer.trim().toLowerCase() === challenge.answer?.toLowerCase() || 
                       answer.trim().toLowerCase() === challenge.correct_answer?.toLowerCase();

    if (is_correct) {
      setToast({ type: "success", message: `Correct! You solved the challenge.` });
    }

    return {
      is_correct,
      time_taken_seconds: 0 // handled in widget
    };
  };

  const handleNextChallenge = () => {
    setToast(null);
    setIsActive(false);
    if (mode === 'static') {
      setChallenge(getRandomChallenge(selectedCategory, selectedLevel));
    } else {
      setChallenge(null);
    }
  };

  const generateDynamicChallenge = async () => {
    setLoadingChallenge(true);
    setToast(null);
    try {
      const res = await apiClient.post("/challenges/generate", {
        category: selectedCategory,
        difficulty: selectedLevel
      });
      setChallenge(res.data.data);
      // For generate mode, auto-start once generated
      setIsActive(true); 
    } catch (err) {
      console.error(err);
      setToast({ type: "error", message: "Failed to generate dynamic challenge." });
    } finally {
      setLoadingChallenge(false);
    }
  };

  const currentCategory = categories.find((cat) => cat.id === selectedCategory);

  return (
    <div className="max-w-6xl mx-auto p-4 md:p-8 text-slate-800">
      <div className="flex flex-col md:flex-row justify-between md:items-end gap-4 mb-8">
        <div>
          <Link to="/dashboard" className="inline-flex items-center gap-2 text-indigo-500 hover:text-indigo-600 font-bold text-sm mb-4">
            <FaArrowLeft /> Back to Dashboard
          </Link>
          <h1 className="text-3xl font-bold text-slate-900 mb-2">Practice Playground</h1>
          <p className="text-slate-500 text-sm max-w-xl">
            Choose a topic and difficulty, then solve a series of challenges. Toggle between our static library or let AI generate fresh puzzles for you!
          </p>
        </div>

        {/* Mode Toggle */}
        <div className="flex items-center bg-slate-200 p-1 rounded-xl w-fit">
          <button
            onClick={() => setMode('static')}
            className={`px-4 py-2 rounded-lg text-sm font-semibold flex items-center gap-2 transition-all ${mode === 'static' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
          >
            <FaBookOpen /> Static Bank
          </button>
          <button
            onClick={() => { setMode('generate'); setChallenge(null); setIsActive(false); }}
            className={`px-4 py-2 rounded-lg text-sm font-semibold flex items-center gap-2 transition-all ${mode === 'generate' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
          >
            <FaWandMagicSparkles className="text-amber-500" /> AI Generate
          </button>
        </div>
      </div>

      <div className="grid gap-6 xl:grid-cols-[300px_minmax(0,1fr)]">
        {/* Left Sidebar Layout (Maintained Structure, Updated Styles) */}
        <aside className="bg-white rounded-xl border border-slate-200 shadow-sm p-6 h-fit">
          <div className="mb-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Topic</div>
          <div className="grid gap-2">
            {categories.map((category) => (
              <button
                key={category.id}
                onClick={() => {
                  setSelectedCategory(category.id);
                  setSelectedLevel(category.levels[0]);
                  setIsActive(false);
                  if (mode === 'generate') setChallenge(null);
                }}
                className={`rounded-lg px-4 py-2.5 text-left text-sm font-semibold transition-colors ${
                  selectedCategory === category.id
                    ? "bg-slate-900 text-white shadow-sm"
                    : "bg-slate-50 text-slate-700 hover:bg-slate-100 border border-slate-200"
                }`}
              >
                {category.label}
              </button>
            ))}
          </div>

          <div className="mt-8 mb-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Level</div>
          <div className="grid gap-2">
            {currentCategory.levels.map((level) => (
              <button
                key={level}
                onClick={() => {
                  setSelectedLevel(level);
                  setIsActive(false);
                  if (mode === 'generate') setChallenge(null);
                }}
                className={`rounded-lg px-4 py-2.5 text-left text-sm font-semibold transition-colors ${
                  selectedLevel === level
                    ? "bg-indigo-50 text-indigo-700 border border-indigo-200"
                    : "bg-slate-50 text-slate-700 hover:bg-slate-100 border border-slate-200"
                }`}
              >
                {level}
              </button>
            ))}
          </div>

          <div className="mt-8 pt-6 border-t border-slate-200">
            <button
              onClick={handleNextChallenge}
              className="w-full rounded-lg bg-slate-100 text-slate-700 font-bold px-4 py-3 text-sm hover:bg-slate-200 transition-colors"
            >
              Skip / Next Challenge
            </button>
          </div>
        </aside>

        {/* Right Content Area */}
        <section className="flex flex-col gap-6">
          
          {toast && (
            <div className={`p-4 rounded-xl flex items-center gap-3 font-medium ${toast.type === "success" ? "bg-emerald-50 text-emerald-700 border border-emerald-200" : "bg-rose-50 text-rose-700 border border-rose-200"}`}>
              {toast.message}
            </div>
          )}

          {mode === 'generate' && !challenge && (
            <div className="bg-white border-2 border-dashed border-slate-300 rounded-xl flex flex-col items-center justify-center p-12 min-h-[400px] text-slate-500">
              <FaBrain className="text-4xl text-indigo-200 mb-4" />
              <h3 className="text-lg font-bold text-slate-800 mb-2">Ready for a new challenge?</h3>
              <p className="text-sm text-center max-w-sm mb-6">
                Click below to generate a fresh, unique {selectedCategory} challenge at {selectedLevel} difficulty using AI.
              </p>
              <button
                onClick={generateDynamicChallenge}
                disabled={loadingChallenge}
                className="bg-rose-500 hover:bg-rose-600 text-white font-bold py-3 px-8 rounded-lg shadow-sm transition-colors flex items-center gap-2 disabled:opacity-50"
              >
                <FaWandMagicSparkles /> {loadingChallenge ? 'Generating...' : 'Generate Challenge'}
              </button>
            </div>
          )}

          {challenge && (
            <div className="flex flex-col gap-6 lg:flex-row">
              <div className="flex-1">
                <ChallengeWidget 
                  challenge={challenge} 
                  onVerify={handleVerify} 
                  isActive={isActive}
                  onStart={() => setIsActive(true)}
                  onTimeout={() => setToast({ type: "error", message: "Time is up!" })}
                />
              </div>

              {isActive && (
                <div className="lg:w-72 bg-white rounded-xl border border-slate-200 shadow-sm p-6 h-fit">
                  <div className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-4">Metadata</div>
                  <div className="space-y-4">
                    <div>
                      <p className="text-xs text-slate-400 uppercase">Category</p>
                      <p className="text-sm font-semibold text-slate-800 capitalize">{challenge.category}</p>
                    </div>
                    <div>
                      <p className="text-xs text-slate-400 uppercase">Difficulty</p>
                      <p className="text-sm font-semibold text-slate-800 capitalize">{challenge.level || challenge.difficulty}</p>
                    </div>
                    <div>
                      <p className="text-xs text-slate-400 uppercase">Time Limit</p>
                      <p className="text-sm font-semibold text-slate-800">{challenge.time_limit_seconds}s</p>
                    </div>
                    {mode === 'generate' && (
                      <div className="pt-4 border-t border-slate-100">
                        <span className="inline-flex items-center gap-1 text-[10px] uppercase font-bold text-amber-500 bg-amber-50 px-2 py-1 rounded-full">
                          <FaWandMagicSparkles /> AI Generated
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          )}
        </section>
      </div>
    </div>
  );
}