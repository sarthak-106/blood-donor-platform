'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { BloodGroup } from '@/lib/types';
import { ALL_BLOOD_GROUPS, RBC_COMPATIBILITY } from '@/lib/compatibility';
import { BloodGroupBadge } from '@/components/blood/BloodGroupBadge';
import { DonorCard } from '@/components/donors/DonorCard';
import { db } from '@/lib/db';
import { useLanguage } from '@/context/LanguageContext';
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
  Radio,
  MapPin,
  Flame,
  ChevronRight,
} from 'lucide-react';

const LIVE_RADAR_ITEMS = [
  { hospital: 'AIIMS New Delhi', city: 'Delhi', group: 'B+', type: 'Platelets', time: '4m ago' },
  { hospital: 'KEM Hospital', city: 'Mumbai', group: 'O-', type: 'Whole Blood', time: '11m ago' },
  { hospital: 'Apollo Hospitals', city: 'Chennai', group: 'A+', type: 'Plasma', time: '18m ago' },
  { hospital: 'Fortis Hospital', city: 'Bengaluru', group: 'AB-', type: 'Platelets', time: '25m ago' },
  { hospital: 'Tata Memorial', city: 'Mumbai', group: 'O+', type: 'PRBC', time: '32m ago' },
  { hospital: 'Safdarjung Hospital', city: 'Delhi', group: 'B-', type: 'Whole Blood', time: '39m ago' },
];

export default function HomePage() {
  const router = useRouter();
  const { t } = useLanguage();
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
      
      {/* 0. LIVE EMERGENCY SOS RADAR MARQUEE TICKER */}
      <div className="w-full bg-slate-950/90 dark:bg-black/90 backdrop-blur-md border-y border-red-900/30 py-2.5 overflow-hidden relative shadow-inner">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center">
          <div className="flex items-center space-x-2 shrink-0 pr-4 sm:pr-6 border-r border-slate-800 z-10 bg-slate-950/90 dark:bg-black/90">
            <span className="relative flex h-2.5 w-2.5">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-500 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-red-600"></span>
            </span>
            <span className="text-[11px] font-black uppercase tracking-wider text-red-400 flex items-center gap-1.5">
              <Radio className="w-3.5 h-3.5 animate-pulse text-red-500" />
              <span>Live SOS Radar</span>
            </span>
          </div>

          {/* Marquee ticker content */}
          <div className="overflow-hidden whitespace-nowrap pl-4 sm:pl-6 flex-1">
            <div className="animate-marquee flex items-center space-x-8">
              {[...LIVE_RADAR_ITEMS, ...LIVE_RADAR_ITEMS].map((item, idx) => (
                <Link
                  key={idx}
                  href={`/find-donor?bloodGroup=${encodeURIComponent(item.group)}&city=${encodeURIComponent(item.city)}`}
                  className="inline-flex items-center space-x-2 text-xs text-slate-300 hover:text-white transition group"
                >
                  <span className="px-2 py-0.5 rounded-md bg-red-600/20 border border-red-500/40 text-red-400 font-mono font-bold text-[10px]">
                    {item.group} {item.type}
                  </span>
                  <span className="font-semibold text-slate-200 group-hover:text-red-400 transition-colors">
                    {item.hospital}, {item.city}
                  </span>
                  <span className="text-[10px] text-slate-500">• {item.time}</span>
                  <span className="text-[10px] text-emerald-400 font-bold flex items-center gap-0.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 inline-block animate-pulse" />
                    Matching
                  </span>
                </Link>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* 1. HERO SECTION */}
      <section className="relative pt-6 sm:pt-12 pb-10 overflow-hidden">
        {/* Dynamic Multi-Layer Ambient Red Mesh Glow */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-7xl h-[650px] pointer-events-none -z-10 overflow-hidden">
          <div className="absolute -top-24 left-1/4 w-[480px] h-[480px] bg-red-600/15 dark:bg-red-600/20 rounded-full blur-[140px] animate-pulse-slow" />
          <div className="absolute top-12 right-1/4 w-[420px] h-[420px] bg-rose-500/10 dark:bg-rose-500/15 rounded-full blur-[130px]" />
          <div className="absolute top-36 left-1/2 -translate-x-1/2 w-[720px] h-[280px] bg-gradient-to-r from-red-600/10 via-amber-500/5 to-rose-600/10 rounded-full blur-[120px]" />
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto space-y-4">
            
            {/* Top pill badge */}
            <div className="inline-flex items-center space-x-2.5 px-4 py-1.5 rounded-full bg-gradient-to-r from-red-500/10 via-rose-500/10 to-amber-500/10 border border-red-500/30 text-slate-800 dark:text-red-300 text-xs font-bold shadow-sm shadow-red-500/5">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-500 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-red-600"></span>
              </span>
              <span>Zero Commercialization • 100% Free & Verified Voluntary Network</span>
            </div>

            <h1 className="text-3xl sm:text-5xl lg:text-6xl font-black text-slate-900 dark:text-white tracking-tight leading-[1.12]">
              Every Drop Connects. <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-red-600 via-rose-500 to-amber-500">
                Every Second Saves a Life.
              </span>
            </h1>

            <p className="text-sm sm:text-base text-slate-600 dark:text-slate-300 max-w-2xl mx-auto leading-relaxed font-normal">
              {t('heroSubtitle')}
            </p>
          </div>

          {/* Glassmorphic Search Command Center */}
          <div className="mt-8 max-w-4xl mx-auto">
            <form
              onSubmit={handleQuickSearch}
              className="glass-panel rounded-3xl p-5 sm:p-7 shadow-2xl border border-slate-200/80 dark:border-white/10 relative overflow-hidden backdrop-blur-xl"
            >
              {/* Subtle top shimmer bar */}
              <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-red-500 to-transparent opacity-80" />

              <div className="space-y-6">
                
                {/* 1. Interactive Blood Group Matrix Chips */}
                <div>
                  <div className="flex items-center justify-between mb-2.5">
                    <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-200 flex items-center gap-1.5">
                      <Droplet className="w-4 h-4 text-medical-red fill-current" />
                      <span>1. Select Required Blood Group</span>
                    </label>

                    {selectedBloodGroup && (
                      <span className="text-[11px] font-bold text-rose-600 dark:text-rose-400 flex items-center gap-1">
                        <Sparkles className="w-3 h-3" />
                        {selectedBloodGroup === 'O-'
                          ? 'Universal Donor (Can give to all 8 types)'
                          : selectedBloodGroup === 'AB+'
                          ? 'Universal Recipient (Can receive from all 8 types)'
                          : `Compatible with ${RBC_COMPATIBILITY[selectedBloodGroup].canReceiveFrom.length} donor types`}
                      </span>
                    )}
                  </div>

                  {/* 8 Tactile Interactive Chips */}
                  <div className="grid grid-cols-4 sm:grid-cols-8 gap-2">
                    {ALL_BLOOD_GROUPS.map((bg) => {
                      const isSelected = selectedBloodGroup === bg;
                      const isCompatible =
                        selectedBloodGroup &&
                        RBC_COMPATIBILITY[selectedBloodGroup].canReceiveFrom.includes(bg);

                      return (
                        <button
                          key={bg}
                          type="button"
                          onClick={() => setSelectedBloodGroup(isSelected ? '' : bg)}
                          className={`relative group p-2.5 sm:py-3 rounded-2xl font-black text-sm transition-all duration-200 flex flex-col items-center justify-center border cursor-pointer ${
                            isSelected
                              ? 'bg-gradient-to-br from-red-600 via-rose-600 to-red-700 text-white border-red-500 shadow-lg shadow-red-600/30 scale-105 ring-2 ring-red-400/50'
                              : isCompatible
                              ? 'bg-emerald-500/10 dark:bg-emerald-950/40 border-emerald-500/50 text-emerald-700 dark:text-emerald-300 hover:scale-102 hover:border-emerald-500'
                              : 'bg-white/90 dark:bg-slate-800/80 border-slate-200 dark:border-slate-700/80 text-slate-800 dark:text-slate-200 hover:border-red-400 hover:bg-red-50/50 dark:hover:bg-red-950/20'
                          }`}
                        >
                          <span className="text-base tracking-tight">{bg}</span>
                          {isSelected && (
                            <span className="w-1.5 h-1.5 rounded-full bg-white mt-0.5 animate-ping" />
                          )}
                          {isCompatible && !isSelected && (
                            <span className="text-[9px] font-bold text-emerald-600 dark:text-emerald-400 uppercase tracking-tighter">
                              Match
                            </span>
                          )}
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* 2. Location & Quick Search Action Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-12 gap-3 sm:gap-4 items-center pt-2">
                  
                  {/* City Location */}
                  <div className="sm:col-span-7">
                    <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-1.5 flex items-center gap-1.5">
                      <Building2 className="w-4 h-4 text-slate-400" />
                      <span>2. Metro Hospital Region</span>
                    </label>
                    <div className="flex items-center space-x-2 bg-white/90 dark:bg-slate-800/90 rounded-2xl px-3.5 py-2.5 border border-slate-200 dark:border-slate-700 shadow-inner">
                      <MapPin className="w-4 h-4 text-medical-red shrink-0" />
                      <select
                        value={selectedCity}
                        onChange={(e) => setSelectedCity(e.target.value)}
                        className="w-full bg-transparent text-sm font-bold text-slate-900 dark:text-white focus:outline-none cursor-pointer"
                      >
                        <option value="All Cities">All Indian Cities & Regions</option>
                        <option value="New Delhi">Delhi NCR (AIIMS, Saket, Connaught Place)</option>
                        <option value="Mumbai">Mumbai (Bandra, Parel, Andheri, KEM)</option>
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
                  <div className="sm:col-span-5 sm:self-end">
                    <button
                      type="submit"
                      className="w-full h-12 rounded-2xl bg-gradient-to-r from-red-600 via-rose-600 to-red-600 hover:from-red-500 hover:to-rose-500 text-white font-black text-sm uppercase tracking-wider shadow-xl shadow-red-600/30 hover:shadow-red-600/50 transition-all duration-300 flex items-center justify-center space-x-2 hover:scale-[1.02] active:scale-98 cursor-pointer"
                    >
                      <Search className="w-4 h-4" />
                      <span>{t('searchDonors')}</span>
                      <ArrowRight className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                {/* Bottom Search Filter Checkbox Options */}
                <div className="pt-3 border-t border-slate-200/60 dark:border-slate-800/80 flex flex-wrap items-center justify-between gap-3 text-xs">
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
                    className="text-medical-red hover:underline font-bold flex items-center space-x-1.5"
                  >
                    <Zap className="w-4 h-4 fill-current animate-pulse" />
                    <span>Immediate Life-Threatening Emergency? Click SOS</span>
                  </Link>
                </div>
              </div>
            </form>
          </div>

          {/* Modernized Floating Impact & Trust Metrics */}
          <div className="mt-12 grid grid-cols-2 md:grid-cols-4 gap-4 max-w-4xl mx-auto">
            <div className="glass-panel rounded-2xl p-4 sm:p-5 text-center shadow-lg hover:shadow-xl transition-all hover:-translate-y-0.5 border border-slate-200/60 dark:border-white/10">
              <div className="w-10 h-10 rounded-xl bg-red-100 dark:bg-red-950/80 text-medical-red flex items-center justify-center mx-auto mb-2">
                <Users className="w-5 h-5" />
              </div>
              <span className="block text-2xl sm:text-3xl font-black text-slate-900 dark:text-white tracking-tight">
                1,280+
              </span>
              <span className="text-xs text-slate-500 dark:text-slate-400 font-semibold">Verified Active Donors</span>
            </div>

            <div className="glass-panel rounded-2xl p-4 sm:p-5 text-center shadow-lg hover:shadow-xl transition-all hover:-translate-y-0.5 border border-slate-200/60 dark:border-white/10">
              <div className="w-10 h-10 rounded-xl bg-emerald-100 dark:bg-emerald-950/80 text-emerald-600 dark:text-emerald-400 flex items-center justify-center mx-auto mb-2">
                <ShieldCheck className="w-5 h-5" />
              </div>
              <span className="block text-2xl sm:text-3xl font-black text-emerald-600 dark:text-emerald-400 tracking-tight">
                98.4%
              </span>
              <span className="text-xs text-slate-500 dark:text-slate-400 font-semibold">Coordination Success</span>
            </div>

            <div className="glass-panel rounded-2xl p-4 sm:p-5 text-center shadow-lg hover:shadow-xl transition-all hover:-translate-y-0.5 border border-slate-200/60 dark:border-white/10">
              <div className="w-10 h-10 rounded-xl bg-rose-100 dark:bg-rose-950/80 text-rose-600 flex items-center justify-center mx-auto mb-2">
                <Zap className="w-5 h-5 fill-current animate-pulse" />
              </div>
              <span className="block text-2xl sm:text-3xl font-black text-medical-red tracking-tight">
                &lt; 9 mins
              </span>
              <span className="text-xs text-slate-500 dark:text-slate-400 font-semibold">Avg Emergency Response</span>
            </div>

            <div className="glass-panel rounded-2xl p-4 sm:p-5 text-center shadow-lg hover:shadow-xl transition-all hover:-translate-y-0.5 border border-slate-200/60 dark:border-white/10">
              <div className="w-10 h-10 rounded-xl bg-amber-100 dark:bg-amber-950/80 text-amber-500 flex items-center justify-center mx-auto mb-2">
                <Heart className="w-5 h-5 fill-current" />
              </div>
              <span className="block text-2xl sm:text-3xl font-black text-slate-900 dark:text-white tracking-tight">
                3,450+
              </span>
              <span className="text-xs text-slate-500 dark:text-slate-400 font-semibold">Lives Saved Together</span>
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
        <div className="glass-panel rounded-3xl p-6 sm:p-10 border border-slate-200/80 dark:border-white/10 shadow-xl">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
            
            <div className="lg:col-span-5 space-y-4">
              <div className="inline-flex items-center space-x-1.5 px-3 py-1 rounded-full bg-red-500/10 border border-red-500/20 text-red-600 dark:text-red-400 text-xs font-black">
                <Activity className="w-3.5 h-3.5" />
                <span>Interactive Transfusion Engine</span>
              </div>
              <h2 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white tracking-tight">
                Understand Transfusion Compatibility in 1 Click
              </h2>
              <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 leading-relaxed font-medium">
                Transfusion medicine relies on precise ABO and Rh blood group antigens. Click any blood type below to test recipient and donor eligibility in real time.
              </p>

              <div className="pt-2">
                <Link
                  href="/blood-compatibility"
                  className="inline-flex items-center space-x-2 text-xs font-bold text-red-600 dark:text-red-400 hover:underline"
                >
                  <span>Explore Full Matrix (RBC, Plasma & Platelets)</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            </div>

            {/* Interactive Selector & Display */}
            <div className="lg:col-span-7 bg-slate-100/70 dark:bg-slate-800/40 backdrop-blur-sm p-6 rounded-2xl border border-slate-200/50 dark:border-white/5 shadow-inner">
              <span className="text-xs font-black uppercase tracking-wider text-slate-500 dark:text-slate-400 block mb-3">
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
                      className={`py-2.5 rounded-xl text-xs font-black transition-all ${
                        isSelected
                          ? 'bg-gradient-to-r from-red-600 to-rose-600 text-white shadow-md shadow-red-600/30 scale-105 ring-2 ring-red-400/50'
                          : 'bg-white dark:bg-slate-700/80 text-slate-800 dark:text-slate-200 hover:bg-red-50 dark:hover:bg-slate-600 border border-slate-200/70 dark:border-white/5'
                      }`}
                    >
                      {bg}
                    </button>
                  );
                })}
              </div>

              {/* Dynamic compatibility result cards */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="glass-panel p-4 rounded-xl border border-slate-200/60 dark:border-white/10 shadow-sm">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-black text-slate-800 dark:text-slate-200">
                      Can Receive RBC From:
                    </span>
                    <span className="text-[10px] text-slate-400 font-mono">
                      ({compatData.canReceiveFrom.length} {compatData.canReceiveFrom.length === 1 ? 'type' : 'types'})
                    </span>
                  </div>
                  <div className="flex flex-wrap gap-1.5">
                    {compatData.canReceiveFrom.map((bg) => (
                      <BloodGroupBadge key={bg} bloodGroup={bg} size="sm" />
                    ))}
                  </div>
                </div>

                <div className="glass-panel p-4 rounded-xl border border-slate-200/60 dark:border-white/10 shadow-sm">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-black text-slate-800 dark:text-slate-200">
                      Can Donate RBC To:
                    </span>
                    <span className="text-[10px] text-slate-400 font-mono">
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
              {t('featuredDonors')}
            </h2>
            <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400">
              Identity-verified voluntary donors ready for routine and emergency coordination.
            </p>
          </div>

          <Link
            href="/find-donor"
            className="mt-3 sm:mt-0 inline-flex items-center space-x-1.5 text-xs font-bold text-medical-red hover:underline"
          >
            <span>{t('viewAllDonors')}</span>
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
          <div className="inline-flex items-center space-x-1.5 px-3 py-1 rounded-full bg-red-500/10 border border-red-500/20 text-red-600 dark:text-red-400 text-xs font-black">
            <span>Seamless Coordination</span>
          </div>
          <h2 className="text-2xl sm:text-4xl font-black text-slate-900 dark:text-white tracking-tight">
            {t('howItWorks')}
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 font-medium">
            {t('howItWorksSubtitle')}
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Step 1 */}
          <div className="glass-panel rounded-3xl p-7 border border-slate-200/80 dark:border-white/10 shadow-lg hover:shadow-2xl hover:border-red-500/40 hover:-translate-y-1.5 transition-all duration-300 relative group">
            <div className="w-13 h-13 p-0.5 rounded-2xl bg-gradient-to-tr from-red-600 to-rose-500 text-white flex items-center justify-center font-black text-lg mb-5 shadow-md shadow-red-600/30 group-hover:scale-110 transition-transform">
              <span className="w-full h-full rounded-[14px] bg-white dark:bg-slate-900 text-red-600 dark:text-red-400 flex items-center justify-center">
                01
              </span>
            </div>
            <h3 className="font-black text-lg text-slate-900 dark:text-white mb-2 group-hover:text-red-600 dark:group-hover:text-red-400 transition-colors">
              {t('step1Title')}
            </h3>
            <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 leading-relaxed font-medium">
              {t('step1Desc')}
            </p>
          </div>

          {/* Step 2 */}
          <div className="glass-panel rounded-3xl p-7 border border-slate-200/80 dark:border-white/10 shadow-lg hover:shadow-2xl hover:border-red-500/40 hover:-translate-y-1.5 transition-all duration-300 relative group">
            <div className="w-13 h-13 p-0.5 rounded-2xl bg-gradient-to-tr from-rose-500 to-amber-500 text-white flex items-center justify-center font-black text-lg mb-5 shadow-md shadow-rose-600/30 group-hover:scale-110 transition-transform">
              <span className="w-full h-full rounded-[14px] bg-white dark:bg-slate-900 text-rose-600 dark:text-rose-400 flex items-center justify-center">
                02
              </span>
            </div>
            <h3 className="font-black text-lg text-slate-900 dark:text-white mb-2 group-hover:text-rose-600 dark:group-hover:text-rose-400 transition-colors">
              {t('step2Title')}
            </h3>
            <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 leading-relaxed font-medium">
              {t('step2Desc')}
            </p>
          </div>

          {/* Step 3 */}
          <div className="glass-panel rounded-3xl p-7 border border-slate-200/80 dark:border-white/10 shadow-lg hover:shadow-2xl hover:border-red-500/40 hover:-translate-y-1.5 transition-all duration-300 relative group">
            <div className="w-13 h-13 p-0.5 rounded-2xl bg-gradient-to-tr from-emerald-500 to-teal-500 text-white flex items-center justify-center font-black text-lg mb-5 shadow-md shadow-emerald-600/30 group-hover:scale-110 transition-transform">
              <span className="w-full h-full rounded-[14px] bg-white dark:bg-slate-900 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
                03
              </span>
            </div>
            <h3 className="font-black text-lg text-slate-900 dark:text-white mb-2 group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors">
              {t('step3Title')}
            </h3>
            <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 leading-relaxed font-medium">
              {t('step3Desc')}
            </p>
          </div>
        </div>
      </section>

      {/* 7. CALL TO ACTION FOR DONORS */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-red-600 via-rose-600 to-red-700 p-8 sm:p-14 text-white shadow-2xl flex flex-col md:flex-row md:items-center justify-between gap-8 border border-red-500/30">
          <div className="absolute -top-24 -right-24 w-80 h-80 bg-white/10 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute -bottom-24 -left-24 w-80 h-80 bg-black/20 rounded-full blur-3xl pointer-events-none" />

          <div className="space-y-3 max-w-xl relative z-10">
            <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-white/20 backdrop-blur-md text-white text-xs font-black">
              <Heart className="w-3.5 h-3.5 fill-current" />
              <span>Join India&apos;s Lifesaver Network</span>
            </div>
            <h2 className="text-2xl sm:text-4xl font-black tracking-tight leading-tight">
              {t('readyToSaveLife')}
            </h2>
            <p className="text-xs sm:text-sm text-red-100 leading-relaxed font-medium">
              {t('readyToSaveLifeDesc')}
            </p>
          </div>

          <div className="flex flex-wrap gap-3.5 shrink-0 relative z-10">
            <Link
              href="/auth?mode=register&role=donor"
              className="px-6 py-3.5 rounded-2xl bg-white text-red-700 hover:bg-red-50 font-black text-xs sm:text-sm shadow-xl hover:shadow-2xl hover:scale-105 transition-all"
            >
              Register as Donor
            </Link>
            <Link
              href="/recipient/create-request"
              className="px-6 py-3.5 rounded-2xl bg-black/30 hover:bg-black/40 text-white font-black text-xs sm:text-sm border border-white/20 backdrop-blur-md transition-all"
            >
              Request Blood
            </Link>
          </div>
        </div>
      </section>

    </div>
  );
}
