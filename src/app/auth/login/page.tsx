'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth, DEMO_PERSONAS } from '@/context/AuthContext';
import { Droplet, ArrowRight, UserCheck, Lock, Mail, Sparkles } from 'lucide-react';

export default function LoginPage() {
  const router = useRouter();
  const { loginAsPersona, login } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleCustomLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) return;
    login(email, 'recipient');
    router.push('/recipient/dashboard');
  };

  const handleSelectPersona = (personaId: string, role: string) => {
    loginAsPersona(personaId);
    if (role === 'admin') router.push('/admin/dashboard');
    else if (role === 'donor') router.push('/donor/dashboard');
    else router.push('/recipient/dashboard');
  };

  return (
    <div className="max-w-md mx-auto px-4 py-12 space-y-6">
      
      {/* Brand header */}
      <div className="text-center space-y-2">
        <div className="w-12 h-12 rounded-2xl bg-medical-red text-white flex items-center justify-center mx-auto shadow-md shadow-red-500/30">
          <Droplet className="w-6 h-6 fill-current" />
        </div>
        <h1 className="text-2xl font-black text-slate-900 dark:text-white">
          Sign In to Blood<span className="text-medical-red">Donor</span>
        </h1>
        <p className="text-xs text-slate-500">Access your donor or recipient portal</p>
      </div>

      {/* 1-Click Fast Demo Login Card */}
      <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 border border-slate-200/80 dark:border-slate-800 shadow-sm space-y-3">
        <div className="flex items-center space-x-2 text-xs font-bold text-slate-700 dark:text-slate-300 pb-2 border-b border-slate-100 dark:border-slate-800">
          <Sparkles className="w-4 h-4 text-amber-500" />
          <span>One-Click Demo Personas (Instant Login)</span>
        </div>

        <div className="space-y-2">
          {DEMO_PERSONAS.map((persona) => (
            <button
              key={persona.id}
              onClick={() => handleSelectPersona(persona.id, persona.role)}
              className="w-full flex items-center p-3 rounded-2xl border border-slate-200 dark:border-slate-800 hover:border-medical-red hover:bg-red-50/50 dark:hover:bg-red-950/20 text-left transition"
            >
              <img
                src={persona.avatar}
                alt={persona.name}
                className="w-9 h-9 rounded-full object-cover border shadow-sm"
              />
              <div className="ml-3 flex-1 min-w-0">
                <span className="font-bold text-xs text-slate-900 dark:text-white block">
                  {persona.name}
                </span>
                <span className="text-[10px] text-slate-500 dark:text-slate-400 truncate block">
                  {persona.description}
                </span>
              </div>
              <ArrowRight className="w-3.5 h-3.5 text-slate-400" />
            </button>
          ))}
        </div>
      </div>

      {/* Standard Form */}
      <form
        onSubmit={handleCustomLogin}
        className="bg-white dark:bg-slate-900 rounded-3xl p-6 border border-slate-200/80 dark:border-slate-800 shadow-sm space-y-4"
      >
        <div>
          <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
            Email Address
          </label>
          <div className="relative">
            <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
              className="w-full pl-9 pr-3 py-2.5 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-medical-red focus:outline-none"
            />
          </div>
        </div>

        <div>
          <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
            Password
          </label>
          <div className="relative">
            <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              className="w-full pl-9 pr-3 py-2.5 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-medical-red focus:outline-none"
            />
          </div>
        </div>

        <div className="flex items-center justify-between text-[11px]">
          <label className="flex items-center space-x-1.5 text-slate-500 cursor-pointer">
            <input type="checkbox" defaultChecked className="rounded text-medical-red" />
            <span>Remember me</span>
          </label>
          <Link href="/auth/forgot-password" className="text-medical-red hover:underline font-semibold">
            Forgot password?
          </Link>
        </div>

        <button
          type="submit"
          className="w-full py-3 rounded-xl bg-medical-red hover:bg-red-700 text-white font-bold text-xs shadow-md transition"
        >
          Sign In
        </button>

        <p className="text-center text-xs text-slate-500 pt-2">
          Don't have an account?{' '}
          <Link href="/auth/register" className="text-medical-red font-bold hover:underline">
            Register now
          </Link>
        </p>
      </form>
    </div>
  );
}
