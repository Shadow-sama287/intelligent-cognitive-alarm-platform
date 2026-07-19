import React, { useState, useEffect } from 'react';
import { CheckCircle2, XCircle, Clock, Play } from 'lucide-react';

export const ChallengeWidget = ({ challenge, onVerify, isActive, onStart, onTimeout }) => {
  const [answer, setAnswer] = useState('');
  const [loading, setLoading] = useState(false);
  const [feedback, setFeedback] = useState(null);
  const [timeLeft, setTimeLeft] = useState(challenge?.time_limit_seconds || 45);

  useEffect(() => {
    setFeedback(null);
    setAnswer('');
    setTimeLeft(challenge?.time_limit_seconds || 45);
  }, [challenge]);

  useEffect(() => {
    if (!isActive || timeLeft <= 0 || loading || feedback?.success) return;

    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          onTimeout && onTimeout();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [isActive, timeLeft, loading, feedback, onTimeout]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!answer.trim() || !isActive || timeLeft <= 0) return;
    setLoading(true);
    setFeedback(null);

    try {
      const result = await onVerify(answer);
      if (result.is_correct) {
        setFeedback({ success: true, message: `Correct! Solved in ${challenge.time_limit_seconds - timeLeft}s` });
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

  if (!isActive) {
    return (
      <div className="bg-white p-8 rounded-xl w-full border border-slate-200 shadow-sm text-center flex flex-col items-center justify-center min-h-[300px]">
        <h3 className="text-xl font-bold text-slate-800 mb-2">Ready?</h3>
        <p className="text-slate-500 mb-6 text-sm max-w-md">
          Start the timer to reveal the challenge. You will have {challenge?.time_limit_seconds || 45} seconds to solve it.
        </p>
        <button
          onClick={onStart}
          className="bg-indigo-600 hover:bg-indigo-500 text-white font-semibold py-3 px-8 rounded-lg shadow-sm flex items-center gap-2 transition-colors"
        >
          <Play className="w-5 h-5" /> Start Challenge
        </button>
      </div>
    );
  }

  const progressPercentage = ((challenge?.time_limit_seconds || 45) - timeLeft) / (challenge?.time_limit_seconds || 45) * 100;

  return (
    <div className="bg-white p-8 rounded-xl w-full space-y-6 border border-slate-200 shadow-sm text-left">
      <div className="flex items-center justify-between">
        <div className="inline-flex items-center gap-2 rounded-full bg-slate-100 px-4 py-2 text-xs font-semibold text-slate-700">
          <Clock className={`w-4 h-4 ${timeLeft <= 10 ? 'text-rose-500 animate-pulse' : 'text-slate-500'}`} /> 
          <span className={timeLeft <= 10 ? 'text-rose-600 font-bold' : ''}>{timeLeft}s Remaining</span>
        </div>
      </div>

      {/* Visual Progress Bar */}
      <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
        <div 
          className={`h-full transition-all duration-1000 linear ${timeLeft <= 10 ? 'bg-rose-500' : 'bg-indigo-500'}`}
          style={{ width: `${100 - progressPercentage}%` }}
        />
      </div>

      <h2 className="text-2xl font-bold text-slate-900 tracking-tight">{challenge.prompt}</h2>

      {timeLeft === 0 && !feedback?.success && (
        <div className="p-4 rounded-xl flex items-center justify-center gap-2 font-semibold bg-rose-50 text-rose-700 border border-rose-200">
          <XCircle className="w-5 h-5" /> Time is up!
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <input
          type="text"
          value={answer}
          onChange={(e) => setAnswer(e.target.value)}
          placeholder="Type your answer..."
          disabled={timeLeft === 0 || loading || feedback?.success}
          className="w-full rounded-lg border border-slate-200 bg-slate-50 px-5 py-4 text-center text-xl font-semibold text-slate-800 placeholder:text-slate-400 focus:border-indigo-500 focus:outline-none disabled:opacity-50"
          autoFocus
        />
        <button
          type="submit"
          disabled={loading || timeLeft === 0 || feedback?.success}
          className="w-full rounded-lg bg-slate-900 py-4 text-base font-bold text-white shadow-sm transition hover:bg-slate-800 disabled:opacity-50"
        >
          {loading ? 'Verifying...' : 'Submit Answer'}
        </button>
      </form>

      {feedback && (
        <div className={`p-4 rounded-xl flex items-center justify-center gap-2 font-semibold ${feedback.success ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' : 'bg-rose-50 text-rose-700 border border-rose-200'}`}>
          {feedback.success ? <CheckCircle2 className="w-5 h-5" /> : <XCircle className="w-5 h-5" />}
          {feedback.message}
        </div>
      )}
    </div>
  );
};