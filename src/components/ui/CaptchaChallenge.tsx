'use client';

import React, { useState, useEffect } from 'react';
import { ShieldCheck, RefreshCw } from 'lucide-react';

interface CaptchaChallengeProps {
  onVerify: (token: string, answer: string) => void;
  error?: string | null;
  className?: string;
}

export const CaptchaChallenge: React.FC<CaptchaChallengeProps> = ({
  onVerify,
  error,
  className = '',
}) => {
  const [token, setToken] = useState<string>('');
  const [question, setQuestion] = useState<string>('Loading security verification...');
  const [userAnswer, setUserAnswer] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(true);

  const fetchCaptcha = async () => {
    setIsLoading(true);
    setUserAnswer('');
    try {
      const res = await fetch('/api/auth/captcha');
      const data = await res.json();
      if (data.success) {
        setToken(data.token);
        setQuestion(data.question);
        onVerify(data.token, '');
      }
    } catch {
      setQuestion('Failed to load challenge. Click refresh.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchCaptcha();
  }, []);

  const handleAnswerChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setUserAnswer(val);
    onVerify(token, val);
  };

  return (
    <div className={`p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 space-y-2 select-none ${className}`}>
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-1.5 text-xs font-bold text-slate-700 dark:text-slate-300">
          <ShieldCheck className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
          <span>Security Verification (Anti-Spam CAPTCHA)</span>
        </div>
        <button
          type="button"
          onClick={fetchCaptcha}
          disabled={isLoading}
          className="p-1 rounded-lg text-slate-400 hover:text-medical-red hover:bg-slate-200 dark:hover:bg-slate-700 transition"
          title="New Challenge"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin' : ''}`} />
        </button>
      </div>

      <div className="flex items-center space-x-3">
        <div className="px-3.5 py-2 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 font-mono font-bold text-sm tracking-wider text-slate-900 dark:text-white shadow-inner">
          {question}
        </div>
        <input
          type="text"
          inputMode="numeric"
          pattern="[0-9-]*"
          value={userAnswer}
          onChange={handleAnswerChange}
          placeholder="Answer"
          required
          className="w-28 px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-sm font-bold text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-medical-red"
        />
      </div>

      {error && (
        <p className="text-[11px] font-semibold text-medical-red pt-0.5">
          {error}
        </p>
      )}
    </div>
  );
};
