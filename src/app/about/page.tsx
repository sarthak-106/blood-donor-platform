import React from 'react';
import Link from 'next/link';
import { Droplet, Shield, Heart, Award, Users, CheckCircle2 } from 'lucide-react';
import { MEDICAL_SAFETY_DISCLAIMER } from '@/lib/compatibility';

export default function AboutPage() {
  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-12">
      
      {/* Hero */}
      <div className="text-center max-w-3xl mx-auto space-y-3">
        <div className="inline-flex items-center space-x-1.5 px-3 py-1 rounded-full bg-red-50 dark:bg-red-950/60 text-medical-red text-xs font-bold">
          <Heart className="w-3.5 h-3.5 fill-current" />
          <span>Our Humanitarian Mission</span>
        </div>
        <h1 className="text-3xl sm:text-5xl font-black text-slate-900 dark:text-white tracking-tight">
          Bridging the Critical Gap in Emergency Blood Supply
        </h1>
        <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
          We built the Blood Donor Finder & AI Recognition Platform to ensure no patient ever faces a preventable delay in urgent transfusion care.
        </p>
      </div>

      {/* Core Principles Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 border border-slate-200/80 dark:border-slate-800 shadow-sm space-y-3">
          <div className="w-10 h-10 rounded-2xl bg-red-100 dark:bg-red-950 text-medical-red flex items-center justify-center font-bold">
            <Droplet className="w-5 h-5" />
          </div>
          <h3 className="font-bold text-base text-slate-900 dark:text-white">
            100% Voluntary & Non-Commercial
          </h3>
          <p className="text-xs text-slate-500 leading-relaxed">
            Strictly adhering to WHO and national standards. We prohibit any financial transaction for human blood products.
          </p>
        </div>

        <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 border border-slate-200/80 dark:border-slate-800 shadow-sm space-y-3">
          <div className="w-10 h-10 rounded-2xl bg-emerald-100 dark:bg-emerald-950 text-emerald-600 flex items-center justify-center font-bold">
            <Shield className="w-5 h-5" />
          </div>
          <h3 className="font-bold text-base text-slate-900 dark:text-white">
            Verified Clinical Credentials
          </h3>
          <p className="text-xs text-slate-500 leading-relaxed">
            Donors upload accredited laboratory test records and government IDs to prevent fraudulent blood type claims.
          </p>
        </div>

        <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 border border-slate-200/80 dark:border-slate-800 shadow-sm space-y-3">
          <div className="w-10 h-10 rounded-2xl bg-purple-100 dark:bg-purple-950 text-purple-600 flex items-center justify-center font-bold">
            <Award className="w-5 h-5" />
          </div>
          <h3 className="font-bold text-base text-slate-900 dark:text-white">
            Donor Gamification & Impact
          </h3>
          <p className="text-xs text-slate-500 leading-relaxed">
            Rewarding recurring donors with verified digital passes, milestone honors, and certificates.
          </p>
        </div>
      </div>

      {/* Safety Notice Banner */}
      <div className="p-6 rounded-3xl bg-slate-900 text-white space-y-3 border border-slate-800 shadow-lg">
        <h3 className="font-bold text-base text-amber-400 flex items-center space-x-2">
          <Shield className="w-5 h-5" />
          <span>Platform Safety & Medical Principles</span>
        </h3>
        <p className="text-xs text-slate-300 leading-relaxed">
          {MEDICAL_SAFETY_DISCLAIMER}
        </p>
      </div>
    </div>
  );
}
