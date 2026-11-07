'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { BloodGroup } from '@/lib/types';
import { ALL_BLOOD_GROUPS, RBC_COMPATIBILITY } from '@/lib/compatibility';
import { BloodGroupBadge } from '@/components/blood/BloodGroupBadge';
import { DonorCard } from '@/components/donors/DonorCard';
import { db } from '@/lib/db';
import {
  Search,
  Zap,
  ShieldCheck,
  Sparkles,
  Heart,
  Droplet,
  Users,
  Clock,
  Building2,
  ArrowRight,
  CheckCircle2,
  Activity,
  AlertTriangle,
  QrCode,
  Award,
} from 'lucide-react';

export default function HomePage() {
  const router = useRouter();
  const [selectedBloodGroup, setSelectedBloodGroup] = useState<BloodGroup | ''>('');
  const [selectedCity, setSelectedCity] = useState('New Delhi');
  const [includeCompatible, setIncludeCompatible] = useState(true);

  // Interactive quick compatibility preview on home
  const [compatBloodType, setCompatBloodType] = useState<BloodGroup>('O-');
  const compatData = RBC_COMPATIBILITY[compatBloodType];

  const featuredDonors = db.getDonors({ verifiedOnly: true }).slice(0, 3);
  const emergencyRequests = db.getBloodRequests({ urgency: 'Critical' });

  const handleQuickSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedBloodGroup) {
      router.push(`/find-donor?city=${encodeURIComponent(selectedCity)}`);
      return;
    }
    router.push(
      `/find-donor?bloodGroup=${encodeURIComponent(selectedBloodGroup)}&city=${encodeURIComponent(
        selectedCity
      )}&compatible=${includeCompatible}`
    );
  };

  return (
    <div className="space-y-16 pb-20 overflow-hidden">
      
      {/* 1. HERO SECTION */}
      <section className="relative pt-8 sm:pt-14 pb-12 overflow-hidden">
        {/* Subtle Background Red Glow */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-7xl h-[500px] bg-gradient-to-b from-red-500/10 via-red-500/5 to-transparent blur-3xl pointer-events-none -z-10" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto space-y-4">
            
            {/* Top pill badge */}
            <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-red-100 dark:bg-red-950/80 text-medical-red text-xs font-bold shadow-sm">
              <span className="flex h-2 w-2 relative">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-medical-red opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-medical-red"></span>
              </span>
              <span>Fastest Real-time Blood Donation & Emergency Coordination</span>
            </div>

            <h1 className="text-3xl sm:text-5xl lg:text-6xl font-black text-slate-900 dark:text-white tracking-tight leading-[1.15]">
              Connecting Blood Donors. <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-red-600 via-rose-600 to-red-500">
                Saving Precious Lives.
              </span>
            </h1>

            <p className="text-sm sm:text-base text-slate-600 dark:text-slate-300 max-w-2xl mx-auto leading-relaxed">
              Find verified, nearby voluntary donors in seconds. Powered by smart transfusion compatibility algorithms, instant emergency SOS broadcast, and digital QR donor verification.
            </p>
          </div>

          {/* Floating Search Hub Box */}
          <div className="mt-8 max-w-4xl mx-auto">
            <form
              onSubmit={handleQuickSearch}
              className="bg-white dark:bg-slate-900/90 rounded-2xl sm:rounded-3xl p-4 sm:p-6 shadow-xl border border-slate-200/80 dark:border-slate-800 backdrop-blur-md"
            >
              <div className="grid grid-cols-1 sm:grid-cols-12 gap-3 sm:gap-4 items-center">
                
                {/* Blood Group Select */}
                <div className="sm:col-span-4">
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-300 mb-1.5">
                    1. Blood Group Required
                  </label>
                  <div className="flex items-center space-x-2 bg-slate-50 dark:bg-slate-800 rounded-xl px-3 py-2 border border-slate-200 dark:border-slate-700">
                    <Droplet className="w-5 h-5 text-medical-red shrink-0" />
                    <select
                      value={selectedBloodGroup}
                      onChange={(e) => setSelectedBloodGroup(e.target.value as BloodGroup)}
                      className="w-full bg-transparent text-sm font-extrabold text-slate-900 dark:text-white focus:outline-none cursor-pointer"
                    >
                      <option value="" disabled className="bg-white dark:bg-slate-900 text-slate-400">
                        Select blood group
                      </option>
                      {ALL_BLOOD_GROUPS.map((bg) => {
                        const count = RBC_COMPATIBILITY[bg].canReceiveFrom.length;
                        return (
                          <option key={bg} value={bg} className="bg-white dark:bg-slate-900 text-slate-900 dark:text-white">
                            {bg} — can receive from {count} {count === 1 ? 'type' : 'types'}
                          </option>
                        );
                      })}
                    </select>
                  </div>
                </div>

                {/* City Location */}
                <div className="sm:col-span-5">
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-300 mb-1.5">
                    2. Location / Metro Area
                  </label>
                  <div className="flex items-center space-x-2 bg-slate-50 dark:bg-slate-800 rounded-xl px-3 py-2 border border-slate-200 dark:border-slate-700">
                    <Building2 className="w-5 h-5 text-slate-400 shrink-0" />
                    <select
                      value={selectedCity}
                      onChange={(e) => setSelectedCity(e.target.value)}
                      className="w-full bg-transparent text-sm font-semibold text-slate-900 dark:text-white focus:outline-none cursor-pointer"
                    >
                      <option value="All Cities">All Indian Cities</option>
                      <option value="New Delhi">Delhi NCR (AIIMS, Saket, Connaught Place)</option>
                      <option value="Mumbai">Mumbai (Bandra, Parel, Andheri)</option>
                      <option value="Bengaluru">Bengaluru (Koramangala, Indiranagar, Whitefield)</option>
                      <option value="Hyderabad">Hyderabad (Banjara Hills, Hitec City)</option>
                      <option value="Chennai">Chennai (Greams Road, Adyar, Anna Nagar)</option>
                      <option value="Kolkata">Kolkata (Park Street, Salt Lake)</option>
                      <option value="Pune">Pune (Kothrud, Viman Nagar, Hinjewadi)</option>
                      <option value="Ahmedabad">Ahmedabad (Navrangpura, Satellite)</option>
                    </select>
                  </div>
                </div>

                {/* Search Button */}
                <div className="sm:col-span-3 sm:self-end">
                  <button
                    type="submit"
                    className="w-full h-12 rounded-xl bg-medical-red hover:bg-red-700 text-white font-bold text-sm shadow-md shadow-red-500/25 transition-all duration-200 flex items-center justify-center space-x-2 hover:scale-[1.02]"
                  >
                    <Search className="w-4 h-4" />
                    <span>Find Donors</span>
                  </button>
                </div>
              </div>

              {/* Bottom Search Filter Checkbox Options */}
              <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800 flex flex-wrap items-center justify-between gap-3 text-xs">
                <label className="flex items-center space-x-2 text-slate-600 dark:text-slate-300 cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={includeCompatible}
                    onChange={(e) => setIncludeCompatible(e.target.checked)}
                    className="rounded text-medical-red focus:ring-medical-red h-4 w-4"
                  />
                  <span>
                    Include all medically compatible types (e.g. O- universal donors)
                  </span>
                </label>

                <Link
                  href="/recipient/emergency-sos"
                  className="text-medical-red hover:underline font-bold flex items-center space-x-1"
                >
                  <Zap className="w-3.5 h-3.5 fill-current animate-pulse" />
                  <span>Immediate Life-Threatening Emergency? Click SOS</span>
                </Link>
              </div>
            </form>
          </div>

          {/* Platform Impact Counters */}
          <div className="mt-12 grid grid-cols-2 md:grid-cols-4 gap-4 max-w-4xl mx-auto">
            <div className="bg-white/80 dark:bg-slate-900/80 rounded-2xl p-4 border border-slate-200/80 dark:border-slate-800 text-center shadow-sm">
              <span className="block text-2xl sm:text-3xl font-black text-slate-900 dark:text-white">
                1,280+
              </span>
              <span className="text-xs text-slate-500 font-medium">Verified Active Donors</span>
            </div>
            <div className="bg-white/80 dark:bg-slate-900/80 rounded-2xl p-4 border border-slate-200/80 dark:border-slate-800 text-center shadow-sm">
              <span className="block text-2xl sm:text-3xl font-black text-emerald-600 dark:text-emerald-400">
                98.4%
              </span>
              <span className="text-xs text-slate-500 font-medium">Response Rate</span>
            </div>
            <div className="bg-white/80 dark:bg-slate-900/80 rounded-2xl p-4 border border-slate-200/80 dark:border-slate-800 text-center shadow-sm">
              <span className="block text-2xl sm:text-3xl font-black text-medical-red">
                &lt; 12 mins
              </span>
              <span className="text-xs text-slate-500 font-medium">Average Response Time</span>
            </div>
            <div className="bg-white/80 dark:bg-slate-900/80 rounded-2xl p-4 border border-slate-200/80 dark:border-slate-800 text-center shadow-sm">
              <span className="block text-2xl sm:text-3xl font-black text-slate-900 dark:text-white">
                3,450+
              </span>
              <span className="text-xs text-slate-500 font-medium">Units Coordinated</span>
            </div>
          </div>
        </div>
      </section>

      {/* 2. ACTIVE EMERGENCY SOS BROADCAST TICKER */}
      {emergencyRequests.length > 0 && (
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-gradient-to-r from-red-600 via-rose-600 to-red-700 rounded-3xl p-6 text-white shadow-xl relative overflow-hidden">
            <div className="absolute right-0 top-0 translate-x-10 -translate-y-10 w-64 h-64 bg-white/10 rounded-full blur-2xl pointer-events-none" />
            
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 relative z-10">
              <div className="space-y-1.5">
                <div className="inline-flex items-center space-x-2 bg-black/20 px-3 py-1 rounded-full text-xs font-black uppercase tracking-wider">
                  <AlertTriangle className="w-3.5 h-3.5 text-yellow-300" />
                  <span>High Priority Emergency Broadcast</span>
                </div>
                <h3 className="text-xl sm:text-2xl font-black">
                  Critical Blood Shortage: {emergencyRequests[0].blood_group} Needed at {emergencyRequests[0].hospital}
                </h3>
                <p className="text-xs text-white/90 max-w-xl">
                  {emergencyRequests[0].patient_name} requires {emergencyRequests[0].quantity_units} unit(s) of compatible blood for urgent surgery in {emergencyRequests[0].city}.
                </p>
              </div>

              <div className="flex items-center space-x-3 shrink-0">
                <Link
                  href={`/recipient/requests/${emergencyRequests[0].id}`}
                  className="px-5 py-3 rounded-xl bg-white text-red-700 font-extrabold text-xs sm:text-sm hover:bg-red-50 shadow-md transition flex items-center space-x-2"
                >
                  <Heart className="w-4 h-4 fill-current" />
                  <span>Respond as Donor</span>
                </Link>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* 3. INTERACTIVE BLOOD COMPATIBILITY MATRIX TEASER */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 sm:p-10 border border-slate-200/80 dark:border-slate-800 shadow-sm">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
            
            <div className="lg:col-span-5 space-y-4">
              <div className="inline-flex items-center space-x-1.5 px-3 py-1 rounded-full bg-red-50 dark:bg-red-950/60 text-medical-red text-xs font-bold">
                <Activity className="w-3.5 h-3.5" />
                <span>Interactive Transfusion Engine</span>
              </div>
              <h2 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white tracking-tight">
                Understand Transfusion Compatibility in 1 Click
              </h2>
              <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
                Transfusion medicine relies on precise ABO and Rh blood group antigens. Click any blood type below to test recipient and donor eligibility in real time.
              </p>

              <div className="pt-2">
                <Link
                  href="/blood-compatibility"
                  className="inline-flex items-center space-x-2 text-xs font-bold text-medical-red hover:underline"
                >
                  <span>Explore Full Matrix (RBC, Plasma & Platelets)</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            </div>

            {/* Interactive Selector & Display */}
            <div className="lg:col-span-7 bg-slate-50 dark:bg-slate-800/60 p-6 rounded-2xl border border-slate-200 dark:border-slate-700">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-500 block mb-3">
                Select a Blood Type to Inspect:
              </span>
              
              {/* Blood group button row */}
              <div className="grid grid-cols-4 sm:grid-cols-8 gap-2 mb-6">
                {ALL_BLOOD_GROUPS.map((bg) => {
                  const isSelected = compatBloodType === bg;
                  return (
                    <button
                      key={bg}
                      onClick={() => setCompatBloodType(bg)}
                      className={`py-2 rounded-xl text-xs font-black transition-all ${
                        isSelected
                          ? 'bg-medical-red text-white shadow-md scale-105 ring-2 ring-red-400'
                          : 'bg-white dark:bg-slate-700 text-slate-800 dark:text-slate-200 hover:bg-red-50 dark:hover:bg-slate-600 border border-slate-200 dark:border-slate-600'
                      }`}
                    >
                      {bg}
                    </button>
                  );
                })}
              </div>

              {/* Dynamic compatibility result cards */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="bg-white dark:bg-slate-900 p-4 rounded-xl border border-slate-200 dark:border-slate-700">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-bold text-slate-700 dark:text-slate-300">
                      Can Receive RBC From:
                    </span>
                    <span className="text-[10px] text-slate-400">
                      ({compatData.canReceiveFrom.length} {compatData.canReceiveFrom.length === 1 ? 'type' : 'types'})
                    </span>
                  </div>
                  <div className="flex flex-wrap gap-1.5">
                    {compatData.canReceiveFrom.map((bg) => (
                      <BloodGroupBadge key={bg} bloodGroup={bg} size="sm" />
                    ))}
                  </div>
                </div>

                <div className="bg-white dark:bg-slate-900 p-4 rounded-xl border border-slate-200 dark:border-slate-700">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-bold text-slate-700 dark:text-slate-300">
                      Can Donate RBC To:
                    </span>
                    <span className="text-[10px] text-slate-400">
                      ({compatData.canDonateTo.length} {compatData.canDonateTo.length === 1 ? 'type' : 'types'})
                    </span>
                  </div>
                  <div className="flex flex-wrap gap-1.5">
                    {compatData.canDonateTo.map((bg) => (
                      <BloodGroupBadge key={bg} bloodGroup={bg} size="sm" />
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 4. BLOOD GROUP GUIDE FEATURE BANNER */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="relative rounded-3xl bg-gradient-to-br from-slate-900 via-slate-800 to-red-950 p-8 sm:p-12 text-white border border-slate-800 shadow-2xl overflow-hidden">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center relative z-10">
            <div className="lg:col-span-7 space-y-4">
              <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/30 text-xs font-bold">
                <Sparkles className="w-3.5 h-3.5" />
                <span>Certified Lab Report Reader & Reference Guide</span>
              </div>
              <h2 className="text-2xl sm:text-4xl font-black tracking-tight">
                Blood Group Guide & Pathology Report Reader
              </h2>
              <p className="text-xs sm:text-sm text-slate-300 leading-relaxed max-w-xl">
                Upload your certified pathology lab report or donor card to automatically read your documented ABO and Rh blood group profile with biological compatibility explanations.
              </p>
              <div className="pt-2 flex flex-wrap gap-3">
                <Link
                  href="/blood-recognition"
                  className="px-6 py-3 rounded-xl bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-500 hover:to-rose-500 text-white font-bold text-xs sm:text-sm shadow-lg shadow-red-600/30 transition flex items-center space-x-2"
                >
                  <Sparkles className="w-4 h-4" />
                  <span>Launch Blood Group Guide</span>
                </Link>
                <Link
                  href="/about"
                  className="px-5 py-3 rounded-xl bg-white/10 hover:bg-white/20 text-white font-semibold text-xs sm:text-sm border border-white/20 transition"
                >
                  Medical Disclaimer
                </Link>
              </div>
            </div>

            <div className="lg:col-span-5 flex justify-center">
              <div className="w-full max-w-sm bg-slate-800/80 backdrop-blur-md rounded-2xl p-5 border border-slate-700 shadow-xl space-y-3">
                <div className="flex items-center justify-between pb-3 border-b border-slate-700">
                  <div className="flex items-center space-x-2">
                    <div className="w-3 h-3 rounded-full bg-emerald-500 animate-pulse" />
                    <span className="text-xs font-bold text-slate-200">AI Diagnostic Engine</span>
                  </div>
                  <span className="text-[10px] text-slate-400 font-mono">v2.4 Ready</span>
                </div>
                <div className="space-y-2 text-xs">
                  <div className="p-2.5 rounded-lg bg-slate-900/60 flex items-center justify-between">
                    <span className="text-slate-400">Antigen A Detection</span>
                    <span className="text-emerald-400 font-mono font-bold">Positive (+)</span>
                  </div>
                  <div className="p-2.5 rounded-lg bg-slate-900/60 flex items-center justify-between">
                    <span className="text-slate-400">Antigen B Detection</span>
                    <span className="text-emerald-400 font-mono font-bold">Positive (+)</span>
                  </div>
                  <div className="p-2.5 rounded-lg bg-slate-900/60 flex items-center justify-between">
                    <span className="text-slate-400">Rh (D) Factor</span>
                    <span className="text-emerald-400 font-mono font-bold">Positive (+)</span>
                  </div>
                  <div className="p-3 rounded-xl bg-red-950/60 border border-red-800/80 flex items-center justify-between">
                    <div>
                      <span className="text-[10px] text-slate-400 uppercase font-bold block">Classified Type</span>
                      <span className="text-sm font-black text-red-400">Blood Group AB+</span>
                    </div>
                    <span className="text-[10px] bg-red-900 text-red-200 px-2 py-0.5 rounded font-bold">
                      Universal Recipient
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 5. TOP VERIFIED DONORS HIGHLIGHT */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-8">
          <div>
            <div className="inline-flex items-center space-x-1.5 px-3 py-1 rounded-full bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 text-xs font-bold mb-2">
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>Verified Life Savers</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white tracking-tight">
              Featured Available Donors
            </h2>
            <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400">
              Identity-verified voluntary donors ready for routine and emergency coordination.
            </p>
          </div>

          <Link
            href="/find-donor"
            className="mt-3 sm:mt-0 inline-flex items-center space-x-1.5 text-xs font-bold text-medical-red hover:underline"
          >
            <span>View All Donors</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {featuredDonors.map((donor) => (
            <DonorCard key={donor.id} donor={donor} />
          ))}
        </div>
      </section>

      {/* 6. HOW IT WORKS WORKFLOW */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-2xl mx-auto mb-12 space-y-2">
          <h2 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white tracking-tight">
            How The Platform Works
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400">
            A seamless, transparent loop designed to bridge the gap between donors and patients in need.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Step 1 */}
          <div className="bg-white dark:bg-slate-800/80 rounded-2xl p-6 border border-slate-200/80 dark:border-slate-700/80 shadow-sm relative">
            <div className="w-12 h-12 rounded-2xl bg-red-100 dark:bg-red-950/80 text-medical-red flex items-center justify-center font-black text-lg mb-4">
              01
            </div>
            <h3 className="font-bold text-base text-slate-900 dark:text-white mb-1.5">
              1. Search or Trigger SOS
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
              Recipients filter by blood group and metro location or trigger an instant Emergency SOS broadcast to all compatible nearby donors.
            </p>
          </div>

          {/* Step 2 */}
          <div className="bg-white dark:bg-slate-800/80 rounded-2xl p-6 border border-slate-200/80 dark:border-slate-700/80 shadow-sm relative">
            <div className="w-12 h-12 rounded-2xl bg-red-100 dark:bg-red-950/80 text-medical-red flex items-center justify-center font-black text-lg mb-4">
              02
            </div>
            <h3 className="font-bold text-base text-slate-900 dark:text-white mb-1.5">
              2. Instant Donor Notification
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
              Available donors receive rapid alerts with patient details and hospital location, allowing them to accept and share an estimated arrival time.
            </p>
          </div>

          {/* Step 3 */}
          <div className="bg-white dark:bg-slate-800/80 rounded-2xl p-6 border border-slate-200/80 dark:border-slate-700/80 shadow-sm relative">
            <div className="w-12 h-12 rounded-2xl bg-red-100 dark:bg-red-950/80 text-medical-red flex items-center justify-center font-black text-lg mb-4">
              03
            </div>
            <h3 className="font-bold text-base text-slate-900 dark:text-white mb-1.5">
              3. Hospital Verification & Donation
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
              The donor presents their digital QR pass at the hospital or blood bank. Certified cross-matching is performed and the donation is logged.
            </p>
          </div>
        </div>
      </section>

      {/* 7. CALL TO ACTION FOR DONORS */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-gradient-to-r from-red-600 to-rose-600 rounded-3xl p-8 sm:p-12 text-white shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2 max-w-xl">
            <h2 className="text-2xl sm:text-3xl font-black">
              Ready to Become a Verified Life Saver?
            </h2>
            <p className="text-xs sm:text-sm text-red-100 leading-relaxed">
              Join thousands of voluntary donors. Track your donation milestones, earn digital badges, and save lives in your local community.
            </p>
          </div>

          <div className="flex flex-wrap gap-3 shrink-0">
            <Link
              href="/auth?mode=register&role=donor"
              className="px-6 py-3 rounded-xl bg-white text-red-700 hover:bg-red-50 font-black text-xs sm:text-sm shadow-md transition"
            >
              Register as Donor
            </Link>
            <Link
              href="/recipient/create-request"
              className="px-6 py-3 rounded-xl bg-red-800 hover:bg-red-900 text-white font-bold text-xs sm:text-sm border border-red-400/30 transition"
            >
              Request Blood
            </Link>
          </div>
        </div>
      </section>

    </div>
  );
}
