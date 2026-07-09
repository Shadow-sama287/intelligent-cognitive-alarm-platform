import React, { useState } from 'react';
import { CheckCircle2, XCircle, Clock } from 'lucide-react';

export const ChallengeWidget = ({ challenge, onVerify }) => {
  const [answer, setAnswer] = useState('');
  const [loading, setLoading] = useState(false);
  const [feedback, setFeedback] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!answer.trim()) return;
    setLoading(true);
    const result = await onVerify(answer);
    setLoading(false);
    
    if (result.is_correct) {
      setFeedback({ success: true, message: `Correct! Solved in ${result.time_taken_seconds}s` });
    } else {
      setFeedback({ success: false, message: 'Incorrect answer. Try again!' });
    }
  };

  return (
    <div className="glass-panel p-8 rounded-3xl max-w-lg mx-auto space-y-6 text-center">
      <div className="inline-flex items-center gap-2 px-3 py-1 bg-indigo-500/10 text-indigo-400 rounded-full text-xs font-semibold">
        <Clock className="w-4 h-4" /> {challenge.time_limit_seconds || 45}s Time Limit
      </div>

      <h2 className="text-4xl font-extrabold text-white tracking-wider">{challenge.prompt}</h2>

      <form onSubmit={handleSubmit} className="space-y-4">
        <input
          type="text"
          value={answer}
          onChange={(e) => setAnswer(e.target.value)}
          placeholder="Type your answer..."
          className="w-full text-center text-2xl font-bold py-3 bg-slate-900 border border-slate-700 rounded-xl text-white focus:outline-none focus:border-indigo-500"
          autoFocus
        />
        <button
          type="submit"
          disabled={loading}
          className="w-full py-3 bg-indigo-600 hover:bg-indigo-500 text-white font-bold rounded-xl transition-all shadow-lg shadow-indigo-600/30"
        >
          {loading ? 'Verifying...' : 'Submit Answer'}
        </button>
      </form>

      {feedback && (
        <div className={`p-4 rounded-xl flex items-center justify-center gap-2 font-semibold ${feedback.success ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30' : 'bg-rose-500/20 text-rose-400 border border-rose-500/30'}`}>
          {feedback.success ? <CheckCircle2 className="w-5 h-5" /> : <XCircle className="w-5 h-5" />}
          {feedback.message}
        </div>
      )}
    </div>
  );
};