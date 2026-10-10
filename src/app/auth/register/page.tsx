'use client';

import React, { useState, Suspense } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { BloodGroup, UserRole } from '@/lib/types';
import { ALL_BLOOD_GROUPS } from '@/lib/compatibility';
import { Droplet, User, Heart, Hospital, ArrowRight, ShieldCheck } from 'lucide-react';

function RegisterForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const initialRole = (searchParams.get('role') as UserRole) || 'donor';

  const { register } = useAuth();
  const [role, setRole] = useState<UserRole>(initialRole);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [bloodGroup, setBloodGroup] = useState<BloodGroup>('O+');
  const [city, setCity] = useState('New Delhi');
  const [area, setArea] = useState('Saket / South Delhi');
  const [pinCode, setPinCode] = useState('110017');

  const handleRegister = (e: React.FormEvent) => {
    e.preventDefault();
    register(
      {
        name,
        email,
        phone,
        role,
      },
      role === 'donor'
        ? {
            blood_group: bloodGroup,
            city,
            area,
            pin_code: pinCode,
            emergency_ready: true,
          }
        : undefined
    );

    router.push(`/auth/verify-otp?phone=${encodeURIComponent(phone || '+91 98765 43210')}`);
  };

  return (
    <div className="max-w-xl mx-auto px-4 py-10 space-y-6">
      
      {/* Brand Header */}
      <div className="text-center space-y-1.5">
        <div className="w-12 h-12 rounded-2xl bg-medical-red text-white flex items-center justify-center mx-auto shadow-md shadow-red-500/30">
          <Droplet className="w-6 h-6 fill-current" />
        </div>
        <h1 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white">
          Create Your Account
        </h1>
        <p className="text-xs text-slate-500">Join the verified donor and emergency network</p>
      </div>

      <form
        onSubmit={handleRegister}
        className="bg-white dark:bg-slate-900 rounded-3xl p-6 sm:p-8 border border-slate-200/80 dark:border-slate-800 shadow-sm space-y-5"
      >
        {/* Role Picker */}
        <div>
          <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-300 mb-2">
            1. Select Your Role:
          </label>
          <div className="grid grid-cols-3 gap-2">
            <button
              type="button"
              onClick={() => setRole('donor')}
              className={`p-3 rounded-2xl border text-center transition ${
                role === 'donor'
                  ? 'border-medical-red bg-red-50 dark:bg-red-950/40 text-medical-red font-bold ring-2 ring-medical-red/30'
                  : 'border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-50'
              }`}
            >
              <Heart className="w-5 h-5 mx-auto mb-1 text-medical-red" />
              <span className="text-xs block font-bold">Voluntary Donor</span>
            </button>

            <button
              type="button"
              onClick={() => setRole('recipient')}
              className={`p-3 rounded-2xl border text-center transition ${
                role === 'recipient'
                  ? 'border-medical-red bg-red-50 dark:bg-red-950/40 text-medical-red font-bold ring-2 ring-medical-red/30'
                  : 'border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-50'
              }`}
            >
              <User className="w-5 h-5 mx-auto mb-1 text-blue-500" />
              <span className="text-xs block font-bold">Recipient / Patient</span>
            </button>

            <button
              type="button"
              onClick={() => setRole('hospital')}
              className={`p-3 rounded-2xl border text-center transition ${
                role === 'hospital'
                  ? 'border-medical-red bg-red-50 dark:bg-red-950/40 text-medical-red font-bold ring-2 ring-medical-red/30'
                  : 'border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-50'
              }`}
            >
              <Hospital className="w-5 h-5 mx-auto mb-1 text-emerald-500" />
              <span className="text-xs block font-bold">Hospital Staff</span>
            </button>
          </div>
        </div>

        {/* Basic Fields */}
        <div className="space-y-3 pt-2">
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Full Name *
            </label>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Rahul Sharma"
              className="w-full px-3.5 py-2.5 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-medical-red focus:outline-none"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Email Address *
              </label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="rahul.sharma@example.in"
                className="w-full px-3.5 py-2.5 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-medical-red focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Mobile Phone (for OTP) *
              </label>
              <input
                type="tel"
                required
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="+91 98765 43210"
                className="w-full px-3.5 py-2.5 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-medical-red focus:outline-none"
              />
            </div>
          </div>
        </div>

        {/* Donor-Specific Fields */}
        {role === 'donor' && (
          <div className="space-y-3 pt-3 border-t border-slate-100 dark:border-slate-800">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-300 mb-2">
                Blood Group *
              </label>
              <div className="grid grid-cols-4 sm:grid-cols-8 gap-2">
                {ALL_BLOOD_GROUPS.map((bg) => (
                  <button
                    type="button"
                    key={bg}
                    onClick={() => setBloodGroup(bg)}
                    className={`py-2 rounded-xl text-xs font-black transition ${
                      bloodGroup === bg
                        ? 'bg-medical-red text-white shadow-md ring-2 ring-red-400 scale-105'
                        : 'bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-200'
                    }`}
                  >
                    {bg}
                  </button>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  City
                </label>
                <input
                  type="text"
                  required
                  value={city}
                  onChange={(e) => setCity(e.target.value)}
                  className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Area / Neighborhood
                </label>
                <input
                  type="text"
                  required
                  value={area}
                  onChange={(e) => setArea(e.target.value)}
                  className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  PIN Code
                </label>
                <input
                  type="text"
                  required
                  value={pinCode}
                  onChange={(e) => setPinCode(e.target.value)}
                  className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
                />
              </div>
            </div>
          </div>
        )}

        <button
          type="submit"
          className="w-full py-3.5 rounded-xl bg-medical-red hover:bg-red-700 text-white font-bold text-xs sm:text-sm shadow-md transition"
        >
          Continue to Mobile OTP Verification →
        </button>

        <p className="text-center text-xs text-slate-500">
          Already registered?{' '}
          <Link href="/auth/login" className="text-medical-red font-bold hover:underline">
            Sign In
          </Link>
        </p>
      </form>
    </div>
  );
}

export default function RegisterPage() {
  return (
    <Suspense fallback={<div className="p-12 text-center text-xs text-slate-400">Loading registration...</div>}>
      <RegisterForm />
    </Suspense>
  );
}
