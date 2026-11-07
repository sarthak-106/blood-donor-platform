'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { BloodGroup } from '@/lib/types';
import { ALL_BLOOD_GROUPS, RBC_COMPATIBILITY, PLASMA_COMPATIBILITY, isBloodCompatible, MEDICAL_SAFETY_DISCLAIMER } from '@/lib/compatibility';
import { BloodGroupBadge } from '@/components/blood/BloodGroupBadge';
import {
  Layers,
  Heart,
  Droplet,
  CheckCircle2,
  XCircle,
  HelpCircle,
  Shield,
  Activity,
  ArrowRight,
  Search,
} from 'lucide-react';

export default function BloodCompatibilityPage() {
  const [activeTab, setActiveTab] = useState<'RBC' | 'Plasma' | 'Platelets'>('RBC');
  const [selectedRecipient, setSelectedRecipient] = useState<BloodGroup>('A+');
  const [selectedDonor, setSelectedDonor] = useState<BloodGroup>('O-');

  useEffect(() => {
    document.title = 'Blood Compatibility Matrix & Transfusion Simulator | BloodDonor Platform';
  }, []);

  const isCurrentPairCompatible = isBloodCompatible(
    selectedDonor,
    selectedRecipient,
    activeTab === 'Plasma' ? 'Plasma' : 'RBC'
  );

  // Blood rarity distribution data
  const bloodRarityStats = [
    { type: 'O+', percent: '38.67%', desc: 'Most Common • High Demand', color: 'bg-red-500' },
    { type: 'A+', percent: '34.00%', desc: 'Common • Routine Surgical', color: 'bg-emerald-600' },
    { type: 'B+', percent: '8.50%', desc: 'Moderate Distribution', color: 'bg-blue-600' },
    { type: 'O-', percent: '6.60%', desc: 'Universal RBC Donor • Rare', color: 'bg-rose-600' },
    { type: 'A-', percent: '6.30%', desc: 'Negative Rh Factor • Rare', color: 'bg-teal-600' },
    { type: 'AB+', percent: '3.40%', desc: 'Universal Recipient / Plasma Donor', color: 'bg-purple-600' },
    { type: 'B-', percent: '1.50%', desc: 'Very Rare Blood Group', color: 'bg-indigo-600' },
    { type: 'AB-', percent: '0.60%', desc: 'Rarest Blood Group (<1%)', color: 'bg-violet-600' },
  ];

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-10">
      
      {/* Header */}
      <div className="text-center max-w-3xl mx-auto space-y-3">
        <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-red-50 dark:bg-red-950/60 text-medical-red text-xs font-bold">
          <Layers className="w-3.5 h-3.5" />
          <span>Educational Transfusion Reference</span>
        </div>
        <h1 className="text-3xl sm:text-4xl font-black text-slate-900 dark:text-white tracking-tight">
          Blood Group Compatibility Matrix
        </h1>
        <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 max-w-2xl mx-auto leading-relaxed">
          Detailed ABO and Rh transfusion rules for Red Blood Cells, Plasma, and Platelets components, plus donor health eligibility criteria.
        </p>
      </div>

      {/* Interactive Transfusion Simulator Tool */}
      <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 sm:p-8 border border-slate-200/80 dark:border-slate-800 shadow-sm space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-100 dark:border-slate-800">
          <div>
            <h3 className="font-bold text-lg text-slate-900 dark:text-white">
              Instant Transfusion Match Simulator
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Select a donor type and recipient type to verify compatibility for {activeTab}
            </p>
          </div>

          {/* Component Tabs (RBC vs Plasma vs Platelets) */}
          <div className="bg-slate-100 dark:bg-slate-800 p-1 rounded-xl flex items-center">
            {(['RBC', 'Plasma', 'Platelets'] as const).map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition ${
                  activeTab === tab
                    ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-sm'
                    : 'text-slate-500 dark:text-slate-400 hover:text-slate-800'
                }`}
              >
                {tab === 'RBC' ? 'Red Blood Cells' : tab}
              </button>
            ))}
          </div>
        </div>

        {/* Pair Selection Controls */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-center">
          
          {/* Donor Column */}
          <div className="md:col-span-5 bg-slate-50 dark:bg-slate-800/60 p-5 rounded-2xl border border-slate-200 dark:border-slate-700 space-y-3">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500 block">
              1. Voluntary Donor Blood Group
            </span>
            <div className="grid grid-cols-4 gap-2">
              {ALL_BLOOD_GROUPS.map((bg) => (
                <button
                  key={bg}
                  onClick={() => setSelectedDonor(bg)}
                  className={`py-2 rounded-xl text-xs font-black transition ${
                    selectedDonor === bg
                      ? 'bg-medical-red text-white shadow ring-2 ring-red-400 scale-105'
                      : 'bg-white dark:bg-slate-700 text-slate-700 dark:text-slate-200 hover:bg-slate-100'
                  }`}
                >
                  {bg}
                </button>
              ))}
            </div>
          </div>

          {/* Center Indicator */}
          <div className="md:col-span-2 text-center py-2">
            <div
              className={`w-12 h-12 rounded-full mx-auto flex items-center justify-center font-bold shadow-md transition ${
                isCurrentPairCompatible
                  ? 'bg-emerald-100 text-emerald-600 dark:bg-emerald-950 dark:text-emerald-400'
                  : 'bg-red-100 text-red-600 dark:bg-red-950 dark:text-red-400'
              }`}
            >
              {isCurrentPairCompatible ? (
                <CheckCircle2 className="w-7 h-7" />
              ) : (
                <XCircle className="w-7 h-7" />
              )}
            </div>
            <span
              className={`text-xs font-extrabold block mt-2 ${
                isCurrentPairCompatible ? 'text-emerald-600 dark:text-emerald-400' : 'text-red-600 dark:text-red-400'
              }`}
            >
              {isCurrentPairCompatible ? 'COMPATIBLE' : 'INCOMPATIBLE'}
            </span>
          </div>

          {/* Recipient Column */}
          <div className="md:col-span-5 bg-slate-50 dark:bg-slate-800/60 p-5 rounded-2xl border border-slate-200 dark:border-slate-700 space-y-3">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500 block">
              2. Patient / Recipient Blood Group
            </span>
            <div className="grid grid-cols-4 gap-2">
              {ALL_BLOOD_GROUPS.map((bg) => (
                <button
                  key={bg}
                  onClick={() => setSelectedRecipient(bg)}
                  className={`py-2 rounded-xl text-xs font-black transition ${
                    selectedRecipient === bg
                      ? 'bg-slate-900 text-white dark:bg-white dark:text-slate-900 shadow ring-2 ring-slate-400 scale-105'
                      : 'bg-white dark:bg-slate-700 text-slate-700 dark:text-slate-200 hover:bg-slate-100'
                  }`}
                >
                  {bg}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Detailed Explanation Banner */}
        <div
          className={`p-4 rounded-2xl border text-xs leading-relaxed flex items-start space-x-3 ${
            isCurrentPairCompatible
              ? 'bg-emerald-50/70 dark:bg-emerald-950/30 border-emerald-300 dark:border-emerald-800 text-emerald-800 dark:text-emerald-300'
              : 'bg-red-50/70 dark:bg-red-950/30 border-red-300 dark:border-red-800 text-red-800 dark:text-red-300'
          }`}
        >
          <Activity className="w-4 h-4 shrink-0 mt-0.5" />
          <div>
            <span className="font-bold">Medical Rule: </span>
            {isCurrentPairCompatible
              ? `Donor ${selectedDonor} can safely provide ${activeTab} to a Patient with ${selectedRecipient}. Recipient plasma does not carry antibodies against donor red cell surface antigens.`
              : `Transfusion of ${activeTab} from ${selectedDonor} to ${selectedRecipient} would trigger acute hemolytic antibody reaction due to antigen mismatch.`}
          </div>
        </div>
      </div>

      {/* Comprehensive 8x8 Compatibility Grid Table */}
      <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 sm:p-8 border border-slate-200/80 dark:border-slate-800 shadow-sm space-y-4">
        <div>
          <h3 className="font-bold text-base text-slate-900 dark:text-white">
            Full 8×8 {activeTab} Transfusion Matrix
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Row: Recipient Blood Type | Column: Donor Blood Type
          </p>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-center text-xs">
            <thead>
              <tr className="bg-slate-50 dark:bg-slate-800 text-slate-500 font-bold uppercase text-[10px]">
                <th className="p-3 text-left">Recipient ↓ / Donor →</th>
                {ALL_BLOOD_GROUPS.map((bg) => (
                  <th key={bg} className="p-2.5">
                    <BloodGroupBadge bloodGroup={bg} size="sm" />
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {ALL_BLOOD_GROUPS.map((rec) => (
                <tr key={rec} className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition">
                  <td className="p-3 text-left font-bold text-slate-900 dark:text-white">
                    <div className="flex items-center space-x-2">
                      <BloodGroupBadge bloodGroup={rec} size="sm" />
                      <span>{rec}</span>
                    </div>
                  </td>
                  {ALL_BLOOD_GROUPS.map((don) => {
                    const compatible = isBloodCompatible(
                      don,
                      rec,
                      activeTab === 'Plasma' ? 'Plasma' : 'RBC'
                    );
                    return (
                      <td key={don} className="p-2">
                        {compatible ? (
                          <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-emerald-100 text-emerald-600 dark:bg-emerald-950 dark:text-emerald-400 text-xs font-black">
                            ✓
                          </span>
                        ) : (
                          <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-slate-100 text-slate-400 dark:bg-slate-800 text-[10px]">
                            —
                          </span>
                        )}
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Blood Group Rarity Distribution Grid */}
      <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 sm:p-8 border border-slate-200/80 dark:border-slate-800 shadow-sm space-y-4">
        <h3 className="font-bold text-base text-slate-900 dark:text-white">
          Blood Group Population Rarity & Distribution
        </h3>
        <p className="text-xs text-slate-500 dark:text-slate-400">
          Global average prevalence among voluntary donor registries.
        </p>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 pt-2">
          {bloodRarityStats.map((item) => (
            <div
              key={item.type}
              className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-800 space-y-2"
            >
              <div className="flex items-center justify-between">
                <BloodGroupBadge bloodGroup={item.type as BloodGroup} size="sm" />
                <span className="text-base font-black text-slate-900 dark:text-white font-mono">
                  {item.percent}
                </span>
              </div>
              <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-tight">
                {item.desc}
              </p>
            </div>
          ))}
        </div>
      </div>

      {/* Donor Eligibility Checklist */}
      <div className="bg-gradient-to-br from-slate-900 to-slate-800 rounded-3xl p-6 sm:p-8 text-white space-y-4 shadow-lg">
        <h3 className="font-bold text-lg flex items-center space-x-2">
          <Shield className="w-5 h-5 text-emerald-400" />
          <span>General Donor Health Eligibility Criteria</span>
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs text-slate-300">
          <div className="p-3.5 bg-slate-800/80 rounded-xl border border-slate-700">
            <span className="font-bold text-white block mb-1">Age & Weight</span>
            <span>Must be between 18–65 years old and weigh at least 45 kg (NBTC Indian Blood Transfusion guidelines).</span>
          </div>
          <div className="p-3.5 bg-slate-800/80 rounded-xl border border-slate-700">
            <span className="font-bold text-white block mb-1">Hemoglobin Levels</span>
            <span>Minimum hemoglobin level of 12.5 g/dL for females and 13.0 g/dL for males.</span>
          </div>
          <div className="p-3.5 bg-slate-800/80 rounded-xl border border-slate-700">
            <span className="font-bold text-white block mb-1">Donation Interval</span>
            <span>Mandatory minimum 90-day gap (3 months) between whole blood donations.</span>
          </div>
        </div>
      </div>

      {/* Medical Safety Disclaimer Alert */}
      <div className="p-4 rounded-2xl bg-slate-100 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 text-slate-500 dark:text-slate-400 text-xs leading-relaxed">
        <span className="font-bold text-slate-800 dark:text-slate-200">Disclaimer: </span>
        {MEDICAL_SAFETY_DISCLAIMER}
      </div>
    </div>
  );
}
