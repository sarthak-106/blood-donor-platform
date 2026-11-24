'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { Mail, ArrowLeft, CheckCircle2, Droplet, Phone, Lock, KeyRound, AlertCircle, Loader2 } from 'lucide-react';

export default function ForgotPasswordPage() {
  const [identifier, setIdentifier] = useState('');
  const [otp, setOtp] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [step, setStep] = useState<'input' | 'otp' | 'success'>('input');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSendOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (!identifier) { setError('Phone number or email is required.'); return; }
    setLoading(true);

    try {
      const res = await fetch('/api/auth/otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone: identifier }),
      });
      const data = await res.json();
      if (!data.success) { setError(data.error); return; }
      setStep('otp');
    } catch {
      setError('Network error. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (!otp || otp.length < 6) { setError('Enter the 6-digit verification code.'); return; }
    if (!newPassword || newPassword.length < 6) { setError('Password must be at least 6 characters.'); return; }
    setLoading(true);

    try {
      // 1. Verify OTP
      const verifyRes = await fetch('/api/auth/otp', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone: identifier, otp }),
      });
      const verifyData = await verifyRes.json();
      if (!verifyData.success) { setError(verifyData.error); return; }

      // 2. Reset password
      const resetRes = await fetch('/api/auth/forgot-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ identifier, newPassword, otpVerified: true }),
      });
      const resetData = await resetRes.json();
      if (!resetData.success) { setError(resetData.error); return; }

      setStep('success');
    } catch {
      setError('Network error. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto px-4 py-16 space-y-6">
      <div>
        <Link
          href="/auth"
          className="inline-flex items-center space-x-1.5 text-xs font-semibold text-slate-500 hover:text-medical-red transition"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Sign In</span>
        </Link>
      </div>

      <div className="text-center space-y-1.5">
        <div className="w-12 h-12 rounded-2xl bg-medical-red text-white flex items-center justify-center mx-auto shadow-md shadow-red-500/30">
          <Droplet className="w-6 h-6 fill-current" />
        </div>
        <h1 className="text-2xl font-black text-slate-900 dark:text-white">
          Reset Password
        </h1>
        <p className="text-xs text-slate-500">
          Enter your registered phone number or email to receive recovery instructions.
        </p>
      </div>

      <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 sm:p-8 border border-slate-200/80 dark:border-slate-800 shadow-sm space-y-4">
        {error && (
          <div className="p-3 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            {error}
          </div>
        )}

        {step === 'input' && (
          <form onSubmit={handleSendOtp} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Registered Mobile Number
              </label>
              <div className="relative">
                <Phone className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                <input
                  type="tel"
                  required
                  value={identifier}
                  onChange={(e) => setIdentifier(e.target.value)}
                  placeholder="+91 98765 43210"
                  className="w-full pl-9 pr-3 py-2.5 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-medical-red focus:outline-none"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 rounded-xl bg-medical-red hover:bg-red-700 text-white font-bold text-xs shadow-md transition flex items-center justify-center gap-2"
            >
              {loading ? <><Loader2 className="w-4 h-4 animate-spin" /> Sending Code…</> : 'Send Verification OTP'}
            </button>
          </form>
        )}

        {step === 'otp' && (
          <form onSubmit={handleResetPassword} className="space-y-4">
            <div className="text-center text-xs text-slate-500 space-y-1">
              <p>Enter the 6-digit verification code sent via SMS to <strong className="text-slate-800 dark:text-slate-200">{identifier}</strong></p>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                6-Digit OTP Code
              </label>
              <div className="relative">
                <KeyRound className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                <input
                  type="text"
                  required
                  maxLength={6}
                  value={otp}
                  onChange={(e) => setOtp(e.target.value)}
                  placeholder="••••••"
                  className="w-full pl-9 pr-3 py-2.5 text-xs font-mono font-bold tracking-widest rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-medical-red focus:outline-none"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                New Password
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                <input
                  type="password"
                  required
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="At least 6 characters"
                  className="w-full pl-9 pr-3 py-2.5 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-medical-red focus:outline-none"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 rounded-xl bg-medical-red hover:bg-red-700 text-white font-bold text-xs shadow-md transition flex items-center justify-center gap-2"
            >
              {loading ? <><Loader2 className="w-4 h-4 animate-spin" /> Resetting…</> : 'Update Password & Save'}
            </button>
          </form>
        )}

        {step === 'success' && (
          <div className="text-center py-4 space-y-4">
            <CheckCircle2 className="w-12 h-12 text-green-500 mx-auto" />
            <div>
              <h2 className="text-base font-bold text-slate-900 dark:text-white">Password Updated!</h2>
              <p className="text-xs text-slate-500 mt-1">
                Your password has been reset successfully. You can now sign in with your new credentials.
              </p>
            </div>
            <Link
              href="/auth"
              className="block w-full py-2.5 rounded-xl bg-medical-red hover:bg-red-700 text-white font-bold text-xs shadow-md transition text-center"
            >
              Return to Sign In
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}
