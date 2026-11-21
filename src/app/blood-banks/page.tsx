'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { BloodBank, BloodGroup } from '@/lib/types';
import { ALL_BLOOD_GROUPS } from '@/lib/compatibility';
import { BloodGroupBadge } from '@/components/blood/BloodGroupBadge';
import { db } from '@/lib/db';
import { useAuth } from '@/context/AuthContext';
import {
  Building2,
  MapPin,
  Phone,
  Clock,
  Search,
  Navigation,
  ShieldCheck,
  Droplet,
  ExternalLink,
  AlertTriangle,
  Heart,
  PlusCircle,
  Activity,
} from 'lucide-react';

export default function BloodBanksPage() {
  const { currentUser } = useAuth();
  const [selectedCity, setSelectedCity] = useState<string>('All Cities');
  const [selectedGroup, setSelectedGroup] = useState<BloodGroup | 'All'>('All');
  const [is24x7Only, setIs24x7Only] = useState<boolean>(false);
  const [searchQuery, setSearchQuery] = useState<string>('');

  useEffect(() => {
    document.title = 'Live Blood Bank Stock & 24x7 Storage Units | BloodDonor Platform';
  }, []);

  const allBanks = db.getBloodBanks();

  const filteredBanks = allBanks
    .filter((bank) => {
      if (selectedCity !== 'All Cities' && !bank.city.toLowerCase().includes(selectedCity.toLowerCase())) {
        return false;
      }
      if (is24x7Only && !bank.is_24x7) {
        return false;
      }
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchName = bank.name.toLowerCase().includes(q);
        const matchAddress = bank.address.toLowerCase().includes(q);
        const matchServices = bank.services.some((s) => s.toLowerCase().includes(q));
        if (!matchName && !matchAddress && !matchServices) return false;
      }
      return true;
    })
    .sort((a, b) => {
      if (selectedGroup !== 'All') {
        const unitsA = a.inventory?.[selectedGroup] || 0;
        const unitsB = b.inventory?.[selectedGroup] || 0;
        return unitsB - unitsA; // Show highest available stock first
      }
      return 0;
    });

  const getStockStatus = (units: number) => {
    if (units === 0) {
      return {
        label: 'Out of Stock',
        badge: 'bg-red-100 text-red-700 dark:bg-red-950/80 dark:text-red-300 border-red-200',
        dot: 'bg-red-500',
      };
    }
    if (units < 10) {
      return {
        label: 'Low Stock',
        badge: 'bg-amber-100 text-amber-800 dark:bg-amber-950/80 dark:text-amber-300 border-amber-200',
        dot: 'bg-amber-500',
      };
    }
    return {
      label: 'Available in Stock',
      badge: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/80 dark:text-emerald-300 border-emerald-200',
      dot: 'bg-emerald-500',
    };
  };

  return (
    <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 space-y-8 overflow-hidden">
      {/* Ambient Red Glow Mesh */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-7xl h-[450px] pointer-events-none -z-10 overflow-hidden">
        <div className="absolute -top-20 left-1/3 w-[450px] h-[450px] bg-red-600/10 dark:bg-red-600/15 rounded-full blur-[140px] animate-pulse-slow" />
        <div className="absolute top-10 right-1/4 w-[350px] h-[350px] bg-rose-500/10 rounded-full blur-[120px]" />
      </div>

      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 pb-6 border-b border-slate-200/80 dark:border-slate-800">
        <div className="space-y-2 max-w-3xl">
          <div className="inline-flex items-center space-x-2 px-3.5 py-1 rounded-full bg-red-500/10 border border-red-500/30 text-medical-red text-xs font-bold shadow-xs">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-500 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-red-600"></span>
            </span>
            <span>Real-Time Clinical Stock & Storage Hubs</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-black text-slate-900 dark:text-white tracking-tight leading-tight">
            Verified Blood Banks & <span className="text-transparent bg-clip-text bg-gradient-to-r from-red-600 via-rose-500 to-amber-500">Live Stock Directory</span>
          </h1>
          <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 leading-relaxed font-normal">
            Real-time blood unit availability across certified regional blood banks, apheresis centers, and 24x7 storage facilities in India.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5 shrink-0">
          <Link
            href="/camps"
            className="px-4 py-2.5 rounded-2xl bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-100 hover:text-medical-red border border-slate-200 dark:border-slate-700 font-bold text-xs shadow-sm transition flex items-center space-x-1.5 hover:-translate-y-0.5"
          >
            <Heart className="w-4 h-4 text-medical-red fill-current" />
            <span>Donation Camps</span>
          </Link>
          <a
            href="tel:104"
            className="px-4 py-2.5 rounded-2xl bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-500 hover:to-rose-500 text-white font-black text-xs shadow-md shadow-red-600/30 transition flex items-center space-x-1.5 hover:-translate-y-0.5 active:scale-95"
          >
            <Phone className="w-4 h-4" />
            <span>National Helpline: 104</span>
          </a>
        </div>
      </div>

      {/* Filter Bar */}
      <div className="glass-panel rounded-3xl p-5 sm:p-6 border border-slate-200/80 dark:border-white/10 shadow-xl space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-12 gap-3 items-center">
          {/* Search */}
          <div className="sm:col-span-5 relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search facility name, address, or service..."
              className="w-full pl-10 pr-3 py-2.5 text-xs rounded-2xl border border-slate-200 dark:border-slate-700 bg-white/80 dark:bg-slate-800/80 text-slate-900 dark:text-white focus:ring-2 focus:ring-medical-red focus:outline-none shadow-inner"
            />
          </div>

          {/* City Filter */}
          <div className="sm:col-span-4">
            <select
              value={selectedCity}
              onChange={(e) => setSelectedCity(e.target.value)}
              className="w-full px-3.5 py-2.5 text-xs rounded-2xl border border-slate-200 dark:border-slate-700 bg-white/80 dark:bg-slate-800/80 text-slate-900 dark:text-white font-bold focus:ring-2 focus:ring-medical-red focus:outline-none cursor-pointer shadow-inner"
            >
              <option value="All Cities">All Indian Metropolitan Centers</option>
              <option value="New Delhi">New Delhi (NCR)</option>
              <option value="Mumbai">Mumbai</option>
              <option value="Bengaluru">Bengaluru</option>
              <option value="Pune">Pune</option>
              <option value="Chennai">Chennai</option>
              <option value="Ahmedabad">Ahmedabad</option>
            </select>
          </div>

          {/* 24/7 Filter */}
          <div className="sm:col-span-3 flex items-center justify-start sm:justify-end">
            <label className="flex items-center space-x-2 text-xs font-bold text-slate-700 dark:text-slate-200 cursor-pointer select-none bg-slate-100 dark:bg-slate-800/60 px-3 py-2 rounded-xl border border-slate-200/60 dark:border-slate-700/60">
              <input
                type="checkbox"
                checked={is24x7Only}
                onChange={(e) => setIs24x7Only(e.target.checked)}
                className="rounded text-medical-red focus:ring-medical-red h-4 w-4"
              />
              <span>24x7 Facilities Only</span>
            </label>
          </div>
        </div>

        {/* Blood Group Live Stock Filter Chips */}
        <div className="pt-3 border-t border-slate-200/60 dark:border-slate-800 flex flex-wrap items-center gap-2">
          <span className="text-[11px] font-black text-slate-500 uppercase tracking-wider mr-1">
            Filter by Target Stock Group:
          </span>
          <button
            onClick={() => setSelectedGroup('All')}
            className={`px-3 py-1.5 rounded-xl text-xs font-black transition cursor-pointer ${
              selectedGroup === 'All'
                ? 'bg-slate-900 text-white dark:bg-white dark:text-slate-900 shadow-md'
                : 'bg-white/80 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-700'
            }`}
          >
            All Groups
          </button>
          {ALL_BLOOD_GROUPS.map((bg) => (
            <button
              key={bg}
              onClick={() => setSelectedGroup(bg)}
              className={`px-3 py-1.5 rounded-xl text-xs font-black transition cursor-pointer ${
                selectedGroup === bg
                  ? 'bg-gradient-to-r from-red-600 to-rose-600 text-white shadow-md shadow-red-600/30 ring-2 ring-red-400/50 scale-105'
                  : 'bg-white/80 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-red-50 hover:text-medical-red border border-slate-200 dark:border-slate-700'
              }`}
            >
              {bg}
            </button>
          ))}
        </div>
      </div>

      {/* Blood Banks Card List */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {filteredBanks.map((bank) => {
          const targetStock = selectedGroup !== 'All' ? bank.inventory?.[selectedGroup] || 0 : null;
          const status = targetStock !== null ? getStockStatus(targetStock) : null;

          return (
            <div
              key={bank.id}
              className="glass-panel rounded-3xl p-6 sm:p-7 border border-slate-200/80 dark:border-white/10 shadow-lg hover:shadow-2xl hover:border-red-500/40 hover:-translate-y-1 transition-all duration-300 flex flex-col justify-between space-y-4 group"
            >
              <div className="space-y-3.5">
                <div className="flex items-start justify-between gap-3">
                  <div className="space-y-1">
                    <div className="flex items-center space-x-2">
                      <h3 className="font-black text-lg text-slate-900 dark:text-white group-hover:text-red-600 dark:group-hover:text-red-400 transition-colors">
                        {bank.name}
                      </h3>
                    </div>
                    <p className="text-xs text-slate-500 dark:text-slate-400 flex items-center">
                      <MapPin className="w-3.5 h-3.5 mr-1 text-red-500 shrink-0" />
                      {bank.address}
                    </p>
                  </div>

                  <div className="flex flex-col items-end gap-1.5 shrink-0">
                    {bank.is_24x7 && (
                      <span className="inline-flex items-center px-2.5 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 dark:text-emerald-400 text-[10px] font-black tracking-wider shadow-sm">
                        <span className="relative flex h-2 w-2 mr-1.5">
                          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                          <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                        </span>
                        24/7 OPEN
                      </span>
                    )}
                    {status && (
                      <span
                        className={`inline-flex items-center space-x-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold border ${status.badge}`}
                      >
                        <span className={`w-1.5 h-1.5 rounded-full ${status.dot}`} />
                        <span>
                          {selectedGroup}: {targetStock}u ({status.label})
                        </span>
                      </span>
                    )}
                  </div>
                </div>

                {/* Timing & Phone */}
                <div className="grid grid-cols-2 gap-2 text-xs text-slate-600 dark:text-slate-300 bg-slate-100/70 dark:bg-slate-800/50 backdrop-blur-sm p-3 rounded-2xl border border-slate-200/50 dark:border-white/5">
                  <div className="flex items-center space-x-1.5">
                    <Clock className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                    <span className="truncate">{bank.opening_hours}</span>
                  </div>
                  <div className="flex items-center space-x-1.5">
                    <Phone className="w-3.5 h-3.5 text-red-500 shrink-0" />
                    <a href={`tel:${bank.phone}`} className="font-semibold hover:underline truncate">
                      {bank.phone}
                    </a>
                  </div>
                </div>

                {/* Live Blood Inventory Units */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] uppercase font-black tracking-wider text-slate-400 flex items-center space-x-1">
                      <Activity className="w-3 h-3 text-red-500" />
                      <span>Live Stock Inventory (Units):</span>
                    </span>
                    <span className="text-[10px] font-semibold text-slate-400 dark:text-slate-500">
                      Live Hospital Feed
                    </span>
                  </div>

                  <div className="grid grid-cols-4 sm:grid-cols-8 gap-2">
                    {ALL_BLOOD_GROUPS.map((bg) => {
                      const units = bank.inventory[bg] || 0;
                      const isHighlighted = selectedGroup === bg;
                      return (
                        <div
                          key={bg}
                          className={`p-2 rounded-2xl text-center border transition-all duration-200 ${
                            isHighlighted
                              ? 'border-red-500 bg-red-50/80 dark:bg-red-950/70 ring-2 ring-red-500/30 shadow-sm'
                              : 'border-slate-200/60 dark:border-white/5 bg-slate-50/70 dark:bg-slate-800/40 hover:border-slate-300 dark:hover:border-white/20'
                          }`}
                        >
                          <span className="text-[10px] font-black text-slate-500 dark:text-slate-400 block tracking-tight">{bg}</span>
                          <span
                            className={`text-xs font-black font-mono block my-0.5 ${
                              units === 0
                                ? 'text-slate-400'
                                : units < 5
                                ? 'text-red-500'
                                : units < 15
                                ? 'text-amber-500'
                                : 'text-emerald-600 dark:text-emerald-400'
                            }`}
                          >
                            {units}u
                          </span>
                          <div className="w-full h-1 bg-slate-200 dark:bg-slate-700/60 rounded-full overflow-hidden mt-0.5">
                            <div
                              className={`h-full rounded-full transition-all duration-500 ${
                                units === 0
                                  ? 'bg-slate-300 dark:bg-slate-600'
                                  : units < 5
                                  ? 'bg-red-500'
                                  : units < 15
                                  ? 'bg-amber-500'
                                  : 'bg-emerald-500'
                              }`}
                              style={{ width: `${Math.min(100, (units / 20) * 100)}%` }}
                            />
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>

              {/* Actions */}
              <div className="pt-3 border-t border-slate-100 dark:border-white/10 flex space-x-2">
                <a
                  href={`tel:${bank.phone}`}
                  className="flex-1 py-2.5 px-4 rounded-2xl bg-gradient-to-r from-red-600 via-rose-600 to-red-600 hover:from-red-500 hover:to-rose-500 text-white font-bold text-xs shadow-md shadow-red-600/25 hover:shadow-lg hover:shadow-red-600/40 transition-all flex items-center justify-center space-x-1.5 group-hover:scale-[1.01]"
                >
                  <Phone className="w-3.5 h-3.5" />
                  <span>Call Now</span>
                </a>
                <a
                  href={`https://maps.google.com/?q=${encodeURIComponent(bank.name + ' ' + bank.address)}`}
                  target="_blank"
                  rel="noreferrer"
                  className="py-2.5 px-4 rounded-2xl border border-slate-200 dark:border-white/10 hover:bg-slate-100 dark:hover:bg-white/5 text-slate-700 dark:text-slate-200 font-bold text-xs transition-all flex items-center space-x-1.5"
                >
                  <Navigation className="w-3.5 h-3.5 text-slate-500" />
                  <span>Directions</span>
                </a>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
