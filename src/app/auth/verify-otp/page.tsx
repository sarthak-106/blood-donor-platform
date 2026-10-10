'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { ShieldCheck, ArrowRight, RefreshCw, KeyRound } from 'lucide-react';
import confetti from 'canvas-confetti';

function VerifyOTPForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const phone = searchParams.get('phone') || '+1 (555) 234-5678';
  const { currentUser } = useAuth();

  const [otp, setOtp] = useState(['5', '8', '2', '9', '1', '4']);
  const [timer, setTimer] = useState(45);
  const [isVerifying, setIsVerifying] = useState(false);

  useEffect(() => {
    if (timer > 0) {
      const interval = setInterval(() => setTimer((t) => t - 1), 1000);
      return () => clearInterval(interval);
    }
  }, [timer]);

  const handleOtpChange = (val: string, index: number) => {
    if (val.length <= 1) {
      const newOtp = [...otp];
      newOtp[index] = val;
      setOtp(newOtp);
      // Auto focus next input
      if (val && index < 5) {
        const nextInput = document.getElementById(`otp-${index + 1}`);
        nextInput?.focus();
      }
    }
  };

  const handleVerify = (e: React.FormEvent) => {
    e.preventDefault();
    setIsVerifying(true);

    setTimeout(() => {
      setIsVerifying(false);
      confetti({
        particleCount: 100,
        spread: 70,
        origin: { y: 0.6 },
      });

      if (currentUser?.role === 'donor') {
        router.push('/donor/dashboard');
      } else {
        router.push('/recipient/dashboard');
      }
    }, 1000);
  };

  return (
    <div className="max-w-md mx-auto px-4 py-16 space-y-6 text-center">
      
      <div className="w-14 h-14 bg-red-100 dark:bg-red-950/80 text-medical-red rounded-3xl flex items-center justify-center mx-auto shadow-md">
        <KeyRound className="w-7 h-7" />
      </div>

      <div className="space-y-1">
        <h1 className="text-2xl font-black text-slate-900 dark:text-white">
          Verify Mobile Number
        </h1>
        <p className="text-xs text-slate-500">
          Enter the 6-digit verification code sent via SMS to <span className="font-bold text-slate-800 dark:text-slate-200">{phone}</span>
        </p>
      </div>

      <form
        onSubmit={handleVerify}
        className="bg-white dark:bg-slate-900 rounded-3xl p-6 sm:p-8 border border-slate-200/80 dark:border-slate-800 shadow-sm space-y-6"
      >
        {/* 6-box input */}
        <div className="flex justify-center space-x-2">
          {otp.map((digit, idx) => (
            <input
              key={idx}
              id={`otp-${idx}`}
              type="text"
              maxLength={1}
              value={digit}
              onChange={(e) => handleOtpChange(e.target.value, idx)}
              className="w-11 h-12 text-center font-mono font-black text-lg rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-medical-red focus:outline-none"
            />
          ))}
        </div>

        <button
          type="submit"
          disabled={isVerifying}
          className="w-full py-3 rounded-xl bg-medical-red hover:bg-red-700 text-white font-bold text-xs sm:text-sm shadow-md transition"
        >
          {isVerifying ? 'Verifying Code...' : 'Confirm & Activate Account'}
        </button>

        <div className="pt-2 text-xs text-slate-400">
          {timer > 0 ? (
            <span>Resend code in {timer}s</span>
          ) : (
            <button
              type="button"
              onClick={() => setTimer(45)}
              className="text-medical-red hover:underline font-semibold"
            >
              Resend SMS Code
            </button>
          )}
        </div>
      </form>
    </div>
  );
}

export default function VerifyOTPPage() {
  return (
    <React.Suspense fallback={<div className="p-12 text-center text-xs text-slate-400">Loading verification...</div>}>
      <VerifyOTPForm />
    </React.Suspense>
  );
}
