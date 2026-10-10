'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';
import { db } from '@/lib/db';
import { Donor, BloodRequest, DonorAvailability } from '@/lib/types';
import { BloodGroupBadge } from '@/components/blood/BloodGroupBadge';
import {
  Heart,
  Droplet,
  ShieldCheck,
  Zap,
  Clock,
  Award,
  QrCode,
  Calendar,
  AlertTriangle,
  ArrowRight,
  CheckCircle2,
  XCircle,
  FileText,
} from 'lucide-react';
import {
  formatDate,
  getAvailabilityBadgeStyle,
  getUrgencyBadgeStyle,
} from '@/lib/utils';
import confetti from 'canvas-confetti';

export default function DonorDashboard() {
  const { currentUser, currentDonor, refreshUserData } = useAuth();
  const [donor, setDonor] = useState<Donor | null>(null);
  const [incomingRequests, setIncomingRequests] = useState<BloodRequest[]>([]);
  const [selectedAvailability, setSelectedAvailability] = useState<DonorAvailability>('Available');

  const refreshDashboard = () => {
    // If logged in as donor, use current donor, else fallback to demo donor-1 (David Chen)
    const activeDonor = currentDonor || db.getDonorById('donor-1');
    if (activeDonor) {
      setDonor({ ...activeDonor });
      setSelectedAvailability(activeDonor.availability);
      // Fetch open requests matching donor's blood group
      const openReqs = db.getBloodRequests().filter((r) => r.status === 'Open' || r.status === 'Donor Contacted');
      setIncomingRequests(openReqs);
    }
  };

  useEffect(() => {
    refreshDashboard();
  }, [currentDonor]);

  if (!donor) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-20 text-center space-y-4">
        <h2 className="text-2xl font-bold">Donor Account Required</h2>
        <p className="text-xs text-slate-500">Please switch to a Donor persona (e.g. David Chen) using the top switcher.</p>
      </div>
    );
  }

  const availStyle = getAvailabilityBadgeStyle(selectedAvailability);
  const achievements = db.getAchievementsByDonor(donor.id);
  const history = db.getDonationHistoryByDonor(donor.id);

  const handleAvailabilityChange = (newStatus: DonorAvailability) => {
    setSelectedAvailability(newStatus);
    db.updateDonorAvailability(donor.id, newStatus);
    refreshUserData();
  };

  const handleAcceptRequest = (requestId: string) => {
    db.respondToDonorRequest(requestId, donor.id, 'accept', {
      eta: '45 mins',
      notes: 'On my way to hospital donation center.',
    });
    refreshDashboard();
    confetti({
      particleCount: 80,
      spread: 60,
      origin: { y: 0.6 },
    });
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      
      {/* Header & Status Controller */}
      <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 sm:p-8 border border-slate-200/80 dark:border-slate-800 shadow-sm space-y-6">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 pb-6 border-b border-slate-100 dark:border-slate-800">
          
          <div className="flex items-center space-x-4">
            <div className="relative">
              <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-red-600 to-rose-600 flex items-center justify-center text-white font-black text-2xl shadow-md">
                {donor.name.charAt(0)}
              </div>
              {donor.verification_status === 'Verified' && (
                <div className="absolute -bottom-1 -right-1 bg-white dark:bg-slate-900 rounded-full p-0.5 shadow">
                  <ShieldCheck className="w-5 h-5 text-emerald-500 fill-emerald-100 dark:fill-emerald-950" />
                </div>
              )}
            </div>

            <div>
              <div className="flex flex-wrap items-center gap-2">
                <h1 className="text-2xl font-black text-slate-900 dark:text-white">
                  {donor.name}
                </h1>
                <BloodGroupBadge bloodGroup={donor.blood_group} size="md" />
                <span className="px-2.5 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 text-xs font-bold">
                  Verified Life Saver
                </span>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                {donor.area}, {donor.city} • Registered Donor ID: <span className="font-mono">{donor.id}</span>
              </p>
            </div>
          </div>

          {/* Availability Status Switcher */}
          <div className="bg-slate-50 dark:bg-slate-800/80 p-3 rounded-2xl border border-slate-200 dark:border-slate-700 space-y-1.5">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
              Live Donation Availability Status:
            </span>
            <div className="flex flex-wrap gap-1.5">
              {(
                [
                  'Available',
                  'Emergency-Only',
                  'Recently Donated',
                  'Temporarily Unavailable',
                ] as DonorAvailability[]
              ).map((status) => {
                const isSelected = selectedAvailability === status;
                return (
                  <button
                    key={status}
                    onClick={() => handleAvailabilityChange(status)}
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold transition ${
                      isSelected
                        ? status === 'Available'
                          ? 'bg-emerald-600 text-white shadow'
                          : status === 'Emergency-Only'
                          ? 'bg-medical-red text-white shadow'
                          : 'bg-slate-800 text-white dark:bg-slate-100 dark:text-slate-900 shadow'
                        : 'bg-white dark:bg-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-100'
                    }`}
                  >
                    {status}
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* Impact Metrics Row */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 text-center">
          <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-800">
            <span className="text-2xl font-black text-slate-900 dark:text-white block">
              {donor.total_donations}
            </span>
            <span className="text-[10px] uppercase font-bold text-slate-400">Total Donations</span>
          </div>

          <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-800">
            <span className="text-2xl font-black text-emerald-600 dark:text-emerald-400 block">
              {donor.total_donations * 3}+
            </span>
            <span className="text-[10px] uppercase font-bold text-slate-400">Lives Saved / Impacted</span>
          </div>

          <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-800">
            <span className="text-2xl font-black text-medical-red block">
              ~{donor.avg_response_time}
            </span>
            <span className="text-[10px] uppercase font-bold text-slate-400">Avg. Response Speed</span>
          </div>

          <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-800">
            <span className="text-2xl font-black text-amber-500 block">
              ★ {donor.rating}
            </span>
            <span className="text-[10px] uppercase font-bold text-slate-400">Hospital Rating</span>
          </div>
        </div>
      </div>

      {/* Grid: Incoming Requests Feed + Quick Links & Badges */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Incoming Requests Column */}
        <div className="lg:col-span-8 bg-white dark:bg-slate-900 rounded-3xl p-6 sm:p-8 border border-slate-200/80 dark:border-slate-800 shadow-sm space-y-6">
          <div className="flex items-center justify-between pb-2">
            <div>
              <h3 className="font-bold text-base text-slate-900 dark:text-white flex items-center space-x-2">
                <Droplet className="w-4 h-4 text-medical-red" />
                <span>Incoming Blood Requests Matching Your Blood Group</span>
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Review urgent and routine cases requiring {donor.blood_group} or universal blood
              </p>
            </div>
            <Link
              href="/donor/requests"
              className="text-xs font-bold text-medical-red hover:underline"
            >
              View All ({incomingRequests.length}) →
            </Link>
          </div>

          {incomingRequests.length === 0 ? (
            <div className="py-10 text-center text-xs text-slate-400">
              No pending blood requests in your area right now.
            </div>
          ) : (
            <div className="space-y-4">
              {incomingRequests.slice(0, 3).map((req) => {
                const urgencyStyle = getUrgencyBadgeStyle(req.urgency);

                return (
                  <div
                    key={req.id}
                    className="p-5 rounded-2xl border border-slate-200 dark:border-slate-800 hover:border-red-300 dark:hover:border-red-800 transition flex flex-col sm:flex-row sm:items-center justify-between gap-4"
                  >
                    <div className="space-y-1.5">
                      <div className="flex items-center space-x-2">
                        <BloodGroupBadge bloodGroup={req.blood_group} size="sm" />
                        <span className="font-bold text-sm text-slate-900 dark:text-white">
                          {req.patient_name}
                        </span>
                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${urgencyStyle.bg}`}>
                          {urgencyStyle.label}
                        </span>
                      </div>
                      <p className="text-xs text-slate-500 dark:text-slate-400">
                        {req.hospital} • {req.quantity_units} Unit(s) Needed
                      </p>
                      {req.notes && (
                        <p className="text-[11px] text-slate-600 dark:text-slate-400 italic">
                          "{req.notes}"
                        </p>
                      )}
                    </div>

                    <div className="flex items-center space-x-2">
                      <button
                        onClick={() => handleAcceptRequest(req.id)}
                        className="px-4 py-2 rounded-xl bg-medical-red hover:bg-red-700 text-white font-bold text-xs shadow transition flex items-center space-x-1"
                      >
                        <Heart className="w-3.5 h-3.5 fill-current" />
                        <span>Accept & Coordinate</span>
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Sidebar: Digital Pass & Badges */}
        <div className="lg:col-span-4 space-y-6">
          
          {/* Digital Pass Quick Card */}
          <div className="bg-gradient-to-br from-slate-900 to-slate-800 rounded-3xl p-6 text-white space-y-4 shadow-lg">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <QrCode className="w-5 h-5 text-red-400" />
                <span className="font-bold text-sm">Digital Donor Pass</span>
              </div>
              <span className="text-[10px] bg-red-950 text-red-300 font-bold px-2 py-0.5 rounded">
                Verified
              </span>
            </div>

            <p className="text-xs text-slate-300 leading-relaxed">
              Show your dynamic QR code pass at hospital intake for instant identity and cross-match verification.
            </p>

            <Link
              href="/donor/qr-profile"
              className="w-full py-2.5 rounded-xl bg-white text-slate-900 hover:bg-slate-100 font-bold text-xs shadow transition flex items-center justify-center space-x-2"
            >
              <QrCode className="w-4 h-4 text-medical-red" />
              <span>Open Scannable Pass</span>
            </Link>
          </div>

          {/* Achievements Summary */}
          <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 border border-slate-200/80 dark:border-slate-800 shadow-sm space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-sm font-bold text-slate-900 dark:text-white flex items-center space-x-1.5">
                <Award className="w-4 h-4 text-amber-500" />
                <span>Earned Badges</span>
              </span>
              <Link href="/donor/achievements" className="text-xs text-medical-red font-bold hover:underline">
                View All →
              </Link>
            </div>

            <div className="space-y-2">
              {achievements.map((ach) => (
                <div
                  key={ach.id}
                  className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 flex items-center space-x-2.5 text-xs"
                >
                  <span className="text-base">🏆</span>
                  <div className="flex-1 min-w-0">
                    <span className="font-bold text-slate-900 dark:text-white block truncate">
                      {ach.name}
                    </span>
                    <span className="text-[10px] text-slate-400 truncate block">
                      {ach.description}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
