'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { DonationCamp } from '@/lib/types';
import { db } from '@/lib/db';
import {
  Calendar,
  Clock,
  MapPin,
  Users,
  CheckCircle2,
  Heart,
  Navigation,
  Phone,
  Building2,
  Share2,
  Sparkles,
  ArrowRight,
} from 'lucide-react';
import confetti from 'canvas-confetti';

export default function DonationCampsPage() {
  const [camps, setCamps] = useState<DonationCamp[]>([]);
  const [selectedCity, setSelectedCity] = useState<string>('All');
  const [rsvpdCamps, setRsvpdCamps] = useState<Record<string, boolean>>({});

  const refreshCamps = () => {
    setCamps(db.getDonationCamps());
  };

  useEffect(() => {
    refreshCamps();
    document.title = 'Voluntary Blood Donation Camps & Community Drives | BloodDonor Platform';
    const saved = localStorage.getItem('rsvpd_camps');
    if (saved) {
      try {
        setRsvpdCamps(JSON.parse(saved));
      } catch (e) {}
    }
  }, []);

  const handleRsvp = (camp: DonationCamp) => {
    if (rsvpdCamps[camp.id]) return;

    db.rsvpDonationCamp(camp.id);
    const updated = { ...rsvpdCamps, [camp.id]: true };
    setRsvpdCamps(updated);
    localStorage.setItem('rsvpd_camps', JSON.stringify(updated));
    refreshCamps();

    confetti({
      particleCount: 100,
      spread: 70,
      origin: { y: 0.6 },
    });
  };

  const filteredCamps =
    selectedCity === 'All'
      ? camps
      : camps.filter((c) => c.city.toLowerCase().includes(selectedCity.toLowerCase()));

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Header Banner with Ambient Mesh */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-slate-900 via-rose-950 to-slate-900 text-white p-8 sm:p-12 border border-rose-900/40 shadow-2xl">
        <div className="absolute -top-24 -right-24 w-80 h-80 bg-red-600/25 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-24 -left-24 w-80 h-80 bg-rose-700/20 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 max-w-3xl space-y-4">
          <div className="inline-flex items-center space-x-2 px-3 py-1.5 rounded-full bg-red-600/30 border border-red-500/40 text-red-200 text-xs font-black backdrop-blur-md shadow-xs">
            <Sparkles className="w-3.5 h-3.5 text-amber-400" />
            <span>Community Blood Drives Across India</span>
          </div>

          <h1 className="text-2xl sm:text-4xl lg:text-5xl font-black tracking-tight leading-tight">
            Upcoming Voluntary <br className="hidden sm:inline" />Blood Donation Camps
          </h1>

          <p className="text-xs sm:text-sm text-red-100/80 leading-relaxed font-medium">
            Blood donation camps account for over 70% of voluntary units in India. RSVP for an upcoming verified drive in your city, pledge your units, and help maintain emergency hospital buffer stocks.
          </p>

          <div className="pt-2 flex flex-wrap gap-3">
            <Link
              href="/eligibility"
              className="px-5 py-3 rounded-2xl bg-gradient-to-r from-red-600 via-rose-600 to-red-600 hover:from-red-500 hover:to-rose-500 text-white font-black text-xs shadow-lg shadow-red-600/40 transition-all flex items-center space-x-2"
            >
              <CheckCircle2 className="w-4 h-4" />
              <span>Check Pre-Donation Eligibility First</span>
            </Link>
            <Link
              href="/blood-banks"
              className="px-5 py-3 rounded-2xl bg-white/10 hover:bg-white/20 text-white font-bold text-xs border border-white/20 backdrop-blur-md transition-all flex items-center space-x-2"
            >
              <Building2 className="w-4 h-4" />
              <span>View Permanent 24x7 Blood Banks</span>
            </Link>
          </div>
        </div>
      </div>

      {/* Filter Chips by City */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 glass-panel rounded-2xl p-4 border border-slate-200/80 dark:border-white/10 shadow-sm">
        <div className="flex items-center space-x-2">
          <MapPin className="w-4 h-4 text-red-500 shrink-0" />
          <span className="text-xs font-black text-slate-700 dark:text-slate-200 uppercase tracking-wider">
            Select Your Metro Region:
          </span>
        </div>

        <div className="flex items-center space-x-1.5 overflow-x-auto pb-1 sm:pb-0">
          {['All', 'New Delhi', 'Mumbai', 'Bengaluru', 'Pune'].map((city) => (
            <button
              key={city}
              onClick={() => setSelectedCity(city)}
              className={`px-4 py-1.5 rounded-xl text-xs font-black transition-all whitespace-nowrap ${
                selectedCity === city
                  ? 'bg-gradient-to-r from-red-600 to-rose-600 text-white shadow-md shadow-red-600/30'
                  : 'bg-slate-100 dark:bg-white/5 border border-transparent dark:border-white/5 text-slate-600 dark:text-slate-300 hover:border-slate-300 dark:hover:border-white/20'
              }`}
            >
              {city}
            </button>
          ))}
        </div>
      </div>

      {/* Camps Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {filteredCamps.map((camp) => {
          const isRsvpd = rsvpdCamps[camp.id];
          const daysLeft = Math.ceil(
            (new Date(camp.date).getTime() - Date.now()) / (1000 * 60 * 60 * 24)
          );

          return (
            <div
              key={camp.id}
              className="glass-panel rounded-3xl p-6 sm:p-7 border border-slate-200/80 dark:border-white/10 shadow-lg hover:shadow-2xl hover:border-red-500/40 hover:-translate-y-1 transition-all duration-300 flex flex-col justify-between space-y-5 group"
            >
              <div className="space-y-4">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <span className="text-[10px] font-black text-red-600 dark:text-red-400 uppercase tracking-wider block">
                      {camp.organizer}
                    </span>
                    <h3 className="font-black text-lg text-slate-900 dark:text-white mt-0.5 group-hover:text-red-600 dark:group-hover:text-red-400 transition-colors">
                      {camp.title}
                    </h3>
                  </div>

                  <span className={`px-2.5 py-1 rounded-full text-[10px] font-black tracking-wider shrink-0 border ${
                    daysLeft <= 0
                      ? 'bg-red-500/10 border-red-500/30 text-red-600 dark:text-red-400 animate-pulse'
                      : 'bg-emerald-500/10 border-emerald-500/20 text-emerald-600 dark:text-emerald-400'
                  }`}>
                    {daysLeft <= 0 ? 'TODAY' : `IN ${daysLeft} DAYS`}
                  </span>
                </div>

                <div className="space-y-2 text-xs text-slate-600 dark:text-slate-300">
                  <div className="flex items-center space-x-2">
                    <Calendar className="w-4 h-4 text-slate-400 shrink-0" />
                    <span className="font-bold text-slate-900 dark:text-white">
                      {new Date(camp.date).toLocaleDateString('en-IN', {
                        weekday: 'short',
                        day: 'numeric',
                        month: 'long',
                        year: 'numeric',
                      })}
                    </span>
                  </div>

                  <div className="flex items-center space-x-2">
                    <Clock className="w-4 h-4 text-slate-400 shrink-0" />
                    <span>{camp.time}</span>
                  </div>

                  <div className="flex items-start space-x-2">
                    <MapPin className="w-4 h-4 text-red-500 shrink-0 mt-0.5" />
                    <span>{camp.venue}</span>
                  </div>
                </div>

                {/* Turnout Progress Bar */}
                <div className="bg-slate-100/70 dark:bg-slate-800/40 backdrop-blur-sm p-3.5 rounded-2xl border border-slate-200/50 dark:border-white/5 space-y-2">
                  <div className="flex items-center justify-between text-xs font-black">
                    <span className="text-slate-500 dark:text-slate-400">Volunteers Pledged (RSVP):</span>
                    <span className="text-emerald-600 dark:text-emerald-400 font-mono">
                      {camp.rsvp_count} / {camp.target_units} Target Units
                    </span>
                  </div>
                  <div className="w-full bg-slate-200 dark:bg-slate-700/60 h-2.5 rounded-full overflow-hidden p-0.5">
                    <div
                      className="bg-gradient-to-r from-emerald-500 to-teal-400 h-full rounded-full transition-all duration-500 shadow-sm"
                      style={{
                        width: `${Math.min(100, (camp.rsvp_count / camp.target_units) * 100)}%`,
                      }}
                    />
                  </div>
                </div>

                {/* Coordinator Info */}
                <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400 pt-1">
                  <span>Coordinator: <strong className="text-slate-700 dark:text-slate-200">{camp.contact_person}</strong></span>
                  <a href={`tel:${camp.contact_phone}`} className="font-bold text-red-600 dark:text-red-400 hover:underline flex items-center space-x-1">
                    <Phone className="w-3.5 h-3.5" />
                    <span>{camp.contact_phone}</span>
                  </a>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="pt-3 border-t border-slate-100 dark:border-white/10 flex space-x-2">
                <button
                  onClick={() => handleRsvp(camp)}
                  disabled={isRsvpd}
                  className={`flex-1 py-2.5 px-3 rounded-2xl font-bold text-xs shadow-md transition-all flex items-center justify-center space-x-1.5 ${
                    isRsvpd
                      ? 'bg-emerald-600 text-white cursor-default shadow-emerald-600/30'
                      : 'bg-gradient-to-r from-red-600 via-rose-600 to-red-600 hover:from-red-500 hover:to-rose-500 text-white shadow-red-600/25 hover:shadow-lg hover:shadow-red-600/40 group-hover:scale-[1.01]'
                  }`}
                >
                  <Heart className={`w-3.5 h-3.5 ${isRsvpd ? 'fill-current' : ''}`} />
                  <span>{isRsvpd ? '✓ Pledged to Attend' : "I'll Attend (RSVP)"}</span>
                </button>

                <a
                  href={`https://maps.google.com/?q=${encodeURIComponent(camp.title + ' ' + camp.venue)}`}
                  target="_blank"
                  rel="noreferrer"
                  className="py-2.5 px-4 rounded-2xl border border-slate-200 dark:border-white/10 hover:bg-slate-100 dark:hover:bg-white/5 text-slate-700 dark:text-slate-200 font-bold text-xs transition flex items-center space-x-1.5"
                >
                  <Navigation className="w-3.5 h-3.5 text-slate-500" />
                  <span>Map</span>
                </a>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
