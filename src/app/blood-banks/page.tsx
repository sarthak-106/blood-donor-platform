'use client';

import React, { useState, useEffect } from 'react';
import { BloodBank, BloodGroup } from '@/lib/types';
import { ALL_BLOOD_GROUPS } from '@/lib/compatibility';
import { BloodGroupBadge } from '@/components/blood/BloodGroupBadge';
import { db } from '@/lib/db';
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
} from 'lucide-react';

export default function BloodBanksPage() {
  const [selectedCity, setSelectedCity] = useState<string>('All Cities');
  const [is24x7Only, setIs24x7Only] = useState<boolean>(false);
  const [searchQuery, setSearchQuery] = useState<string>('');

  useEffect(() => {
    document.title = 'Blood Banks & 24x7 Storage Units Directory | BloodDonor Platform';
  }, []);

  const allBanks = db.getBloodBanks();

  const filteredBanks = allBanks.filter((bank) => {
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
  });

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-slate-200 dark:border-slate-800">
        <div>
          <div className="inline-flex items-center space-x-1.5 px-3 py-1 rounded-full bg-red-50 dark:bg-red-950/60 text-medical-red text-xs font-bold mb-2">
            <Building2 className="w-3.5 h-3.5" />
            <span>Facility & Storage Directory</span>
          </div>
          <h1 className="text-2xl sm:text-4xl font-black text-slate-900 dark:text-white tracking-tight">
            Blood Banks & Storage Centers
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
            Locate certified regional blood banks, apheresis centers, and 24/7 emergency dispatch repositories.
          </p>
        </div>
      </div>

      {/* Filter Bar */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl p-4 sm:p-5 border border-slate-200/80 dark:border-slate-800 shadow-sm grid grid-cols-1 sm:grid-cols-12 gap-3 items-center">
        {/* Search */}
        <div className="sm:col-span-6 relative">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search facility name, address, or service..."
            className="w-full pl-9 pr-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-medical-red focus:outline-none"
          />
        </div>

        {/* City Filter */}
        <div className="sm:col-span-3">
          <select
            value={selectedCity}
            onChange={(e) => setSelectedCity(e.target.value)}
            className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white font-semibold focus:ring-2 focus:ring-medical-red focus:outline-none cursor-pointer"
          >
            <option value="All Cities">All Indian Metropolitan Centers</option>
            <option value="New Delhi">New Delhi (NCR)</option>
            <option value="Mumbai">Mumbai</option>
            <option value="Bengaluru">Bengaluru</option>
            <option value="Chennai">Chennai</option>
            <option value="Ahmedabad">Ahmedabad</option>
          </select>
        </div>

        {/* 24/7 Filter */}
        <div className="sm:col-span-3 flex items-center justify-end">
          <label className="flex items-center space-x-2 text-xs font-semibold text-slate-700 dark:text-slate-300 cursor-pointer select-none">
            <input
              type="checkbox"
              checked={is24x7Only}
              onChange={(e) => setIs24x7Only(e.target.checked)}
              className="rounded text-medical-red focus:ring-medical-red h-4 w-4"
            />
            <span>24/7 Open Only</span>
          </label>
        </div>
      </div>

      {/* Blood Banks Card List */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {filteredBanks.map((bank) => (
          <div
            key={bank.id}
            className="bg-white dark:bg-slate-900 rounded-3xl p-6 border border-slate-200/80 dark:border-slate-800 shadow-sm flex flex-col justify-between space-y-4"
          >
            <div className="space-y-3">
              <div className="flex items-start justify-between">
                <div className="space-y-1">
                  <div className="flex items-center space-x-2">
                    <h3 className="font-bold text-base text-slate-900 dark:text-white">
                      {bank.name}
                    </h3>
                  </div>
                  <p className="text-xs text-slate-500 dark:text-slate-400 flex items-center">
                    <MapPin className="w-3.5 h-3.5 mr-1 text-slate-400 shrink-0" />
                    {bank.address}
                  </p>
                </div>

                {bank.is_24x7 && (
                  <span className="px-2.5 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-950/80 text-emerald-700 dark:text-emerald-300 text-[10px] font-extrabold tracking-wider">
                    24/7 OPEN
                  </span>
                )}
              </div>

              {/* Timing & Phone */}
              <div className="grid grid-cols-2 gap-2 text-xs text-slate-600 dark:text-slate-300 bg-slate-50 dark:bg-slate-800/60 p-3 rounded-xl">
                <div className="flex items-center space-x-1.5">
                  <Clock className="w-3.5 h-3.5 text-slate-400" />
                  <span className="truncate">{bank.opening_hours}</span>
                </div>
                <div className="flex items-center space-x-1.5">
                  <Phone className="w-3.5 h-3.5 text-medical-red" />
                  <a href={`tel:${bank.phone}`} className="font-semibold hover:underline">
                    {bank.phone}
                  </a>
                </div>
              </div>

              {/* Services Offered */}
              <div>
                <span className="text-[10px] uppercase font-bold text-slate-400 block mb-1.5">
                  Services & Facilities:
                </span>
                <div className="flex flex-wrap gap-1.5">
                  {bank.services.map((srv) => (
                    <span
                      key={srv}
                      className="px-2 py-0.5 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 text-[10px] font-medium"
                    >
                      {srv}
                    </span>
                  ))}
                </div>
              </div>

              {/* Live Blood Inventory Units */}
              <div>
                <span className="text-[10px] uppercase font-bold text-slate-400 block mb-1.5">
                  Estimated Stock Inventory:
                </span>
                <div className="grid grid-cols-4 sm:grid-cols-8 gap-1.5">
                  {ALL_BLOOD_GROUPS.map((bg) => {
                    const units = bank.inventory[bg] || 0;
                    return (
                      <div
                        key={bg}
                        className="p-1.5 rounded-lg bg-slate-50 dark:bg-slate-800 text-center border border-slate-100 dark:border-slate-700"
                      >
                        <span className="text-[9px] font-bold text-slate-400 block">{bg}</span>
                        <span
                          className={`text-xs font-black font-mono ${
                            units < 5
                              ? 'text-medical-red'
                              : units < 15
                              ? 'text-amber-500'
                              : 'text-emerald-600 dark:text-emerald-400'
                          }`}
                        >
                          {units}u
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex space-x-2">
              <a
                href={`tel:${bank.phone}`}
                className="flex-1 py-2 px-3 rounded-xl bg-medical-red hover:bg-red-700 text-white font-bold text-xs shadow-sm transition flex items-center justify-center space-x-1.5"
              >
                <Phone className="w-3.5 h-3.5" />
                <span>Call Center</span>
              </a>
              <a
                href={`https://maps.google.com/?q=${encodeURIComponent(bank.name + ' ' + bank.address)}`}
                target="_blank"
                rel="noreferrer"
                className="py-2 px-4 rounded-xl border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-200 font-semibold text-xs transition flex items-center space-x-1"
              >
                <Navigation className="w-3.5 h-3.5" />
                <span>Directions</span>
              </a>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
