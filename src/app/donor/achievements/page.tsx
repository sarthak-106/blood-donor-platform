'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';
import { db } from '@/lib/db';
import { Achievement } from '@/lib/types';
import {
  Award,
  ShieldCheck,
  Zap,
  Sparkles,
  Crown,
  Droplet,
  ArrowLeft,
  Lock,
  CheckCircle2,
} from 'lucide-react';
import { formatDate } from '@/lib/utils';

export default function DonorAchievementsPage() {
  const { currentDonor } = useAuth();
  const donor = currentDonor || db.getDonorById('donor-1');

  const [allAchievements, setAllAchievements] = useState<Achievement[]>([]);
  const [earnedMap, setEarnedMap] = useState<Record<string, string>>({});

  useEffect(() => {
    if (donor) {
      setAllAchievements(db.getAchievements());
      const earned = db.getAchievementsByDonor(donor.id);
      const mapping: Record<string, string> = {};
      earned.forEach((e) => {
        mapping[e.id] = e.awarded_at;
      });
      setEarnedMap(mapping);
    }
  }, [donor]);

  const earnedCount = Object.keys(earnedMap).length;

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      
      <div>
        <Link
          href="/donor/dashboard"
          className="inline-flex items-center space-x-1.5 text-xs font-semibold text-slate-500 hover:text-medical-red transition"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Donor Dashboard</span>
        </Link>
      </div>

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-slate-200 dark:border-slate-800">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white tracking-tight">
            Donor Achievements & Honors
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
            Unlock badges and community distinctions through consistent donations and emergency responses.
          </p>
        </div>

        <div className="bg-amber-100 dark:bg-amber-950/80 text-amber-800 dark:text-amber-300 px-4 py-2 rounded-2xl border border-amber-300 dark:border-amber-800 flex items-center space-x-2 text-xs font-bold">
          <Award className="w-4 h-4" />
          <span>
            {earnedCount} of {allAchievements.length} Badges Unlocked
          </span>
        </div>
      </div>

      {/* Achievement Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {allAchievements.map((ach) => {
          const isEarned = !!earnedMap[ach.id];
          const awardedDate = earnedMap[ach.id];

          return (
            <div
              key={ach.id}
              className={`rounded-3xl p-6 border transition-all flex flex-col justify-between space-y-4 ${
                isEarned
                  ? 'bg-white dark:bg-slate-900 border-amber-300/80 dark:border-amber-800/80 shadow-md ring-1 ring-amber-400/20'
                  : 'bg-slate-50/80 dark:bg-slate-800/40 border-slate-200 dark:border-slate-800 opacity-70'
              }`}
            >
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div
                    className={`w-12 h-12 rounded-2xl flex items-center justify-center font-bold text-xl ${
                      isEarned
                        ? 'bg-amber-100 dark:bg-amber-950 text-amber-600 shadow-sm'
                        : 'bg-slate-200 dark:bg-slate-700 text-slate-400'
                    }`}
                  >
                    {isEarned ? '🏆' : <Lock className="w-5 h-5" />}
                  </div>

                  <span
                    className={`text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-full ${
                      ach.tier === 'Platinum'
                        ? 'bg-purple-100 text-purple-700 dark:bg-purple-950 dark:text-purple-300'
                        : ach.tier === 'Gold'
                        ? 'bg-amber-100 text-amber-700 dark:bg-amber-950 dark:text-amber-300'
                        : 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-300'
                    }`}
                  >
                    {ach.tier} Tier
                  </span>
                </div>

                <div>
                  <h3 className="font-bold text-base text-slate-900 dark:text-white">
                    {ach.name}
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 leading-relaxed">
                    {ach.description}
                  </p>
                </div>
              </div>

              {/* Status / Criteria */}
              <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs">
                <span className="text-[11px] text-slate-400">
                  Criteria: {ach.criteria}
                </span>
                {isEarned ? (
                  <span className="text-[11px] font-bold text-emerald-600 dark:text-emerald-400 flex items-center">
                    <CheckCircle2 className="w-3.5 h-3.5 mr-1" />
                    Unlocked
                  </span>
                ) : (
                  <span className="text-[11px] text-slate-400">Locked</span>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
