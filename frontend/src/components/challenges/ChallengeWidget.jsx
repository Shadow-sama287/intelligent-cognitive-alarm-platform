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
    setFeedback(null);

    try {
      const result = await onVerify(answer);
      if (result.is_correct) {
        setFeedback({ success: true, message: `Correct! Solved in ${result.time_taken_seconds}s` });
      } else {
        setFeedback({ success: false, message: 'Incorrect answer. Try again!' });
      }
    } catch (error) {
      console.error('Verification failed', error);
      setFeedback({ success: false, message: 'Unable to verify answer. Please try again later.' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="glass-panel p-8 rounded-[2rem] w-full space-y-6 border border-white/10 bg-slate-950/80 shadow-xl shadow-indigo-950/20 text-left">
      <div className="inline-flex items-center gap-2 rounded-full bg-indigo-500/10 px-4 py-2 text-xs font-semibold text-indigo-200">
        <Clock className="w-4 h-4" /> {challenge.time_limit_seconds || 45}s Time Limit
      </div>

      <h2 className="text-3xl font-extrabold text-white tracking-tight">{challenge.prompt}</h2>

      <form onSubmit={handleSubmit} className="space-y-4">
        <input
          type="text"
          value={answer}
          onChange={(e) => setAnswer(e.target.value)}
          placeholder="Type your answer..."
          className="w-full rounded-[1.5rem] border border-white/10 bg-slate-900/90 px-5 py-4 text-center text-xl font-semibold text-white placeholder:text-slate-500 focus:border-indigo-400 focus:outline-none"
          autoFocus
        />
        <button
          type="submit"
          disabled={loading}
          className="w-full rounded-2xl bg-gradient-to-r from-violet-500 via-indigo-500 to-fuchsia-500 py-4 text-base font-bold text-white shadow-2xl shadow-violet-500/20 transition hover:opacity-95"
        >
          {loading ? 'Verifying...' : 'Submit Answer'}
        </button>
      </form>

      {feedback && (
        <div className={`p-4 rounded-2xl flex items-center justify-center gap-2 font-semibold ${feedback.success ? 'bg-emerald-500/15 text-emerald-200 border border-emerald-500/25' : 'bg-rose-500/15 text-rose-200 border border-rose-500/25'}`}>
          {feedback.success ? <CheckCircle2 className="w-5 h-5" /> : <XCircle className="w-5 h-5" />}
          {feedback.message}
        </div>
      )}
    </div>
  );
};