'use client';

import React, { useState, useEffect, use } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Donor, BloodGroup } from '@/lib/types';
import { BloodGroupBadge } from '@/components/blood/BloodGroupBadge';
import { DirectRequestModal } from '@/components/donors/DirectRequestModal';
import { QRCardModal } from '@/components/donors/QRCardModal';
import { db } from '@/lib/db';
import { useAuth } from '@/context/AuthContext';
import {
  ShieldCheck,
  Star,
  MapPin,
  Clock,
  Heart,
  Droplet,
  QrCode,
  Zap,
  Award,
  Calendar,
  Share2,
  CheckCircle,
  ArrowLeft,
  Lock,
  HeartHandshake,
} from 'lucide-react';
import {
  formatDate,
  getAvailabilityBadgeStyle,
  getVerificationBadgeStyle,
} from '@/lib/utils';
import { RBC_COMPATIBILITY, MEDICAL_SAFETY_DISCLAIMER } from '@/lib/compatibility';

export default function DonorProfilePage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = use(params);
  const donorId = resolvedParams.id;
  const router = useRouter();
  const { currentUser } = useAuth();

  const [donor, setDonor] = useState<Donor | null>(null);
  const [isRequestModalOpen, setIsRequestModalOpen] = useState(false);
  const [isQROpen, setIsQROpen] = useState(false);
  const [isFav, setIsFav] = useState(false);
  const [isCopied, setIsCopied] = useState(false);

  useEffect(() => {
    const foundDonor = db.getDonorById(donorId);
    if (foundDonor) {
      setDonor(foundDonor);
      if (currentUser) {
        setIsFav(db.isFavorite(currentUser.id, foundDonor.id));
      }
    }
  }, [donorId, currentUser]);

  if (!donor) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-20 text-center space-y-4">
        <h2 className="text-2xl font-bold text-slate-900 dark:text-white">Donor Profile Not Found</h2>
        <p className="text-xs text-slate-500">The donor profile you requested does not exist or has been made private.</p>
        <Link
          href="/find-donor"
          className="inline-flex items-center space-x-2 px-4 py-2 rounded-xl bg-medical-red text-white font-bold text-xs"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Find Donors</span>
        </Link>
      </div>
    );
  }

  const availStyle = getAvailabilityBadgeStyle(donor.availability);
  const verifyStyle = getVerificationBadgeStyle(donor.verification_status);
  const achievements = db.getAchievementsByDonor(donor.id);
  const donationHistory = db.getDonationHistoryByDonor(donor.id);
  const compatData = RBC_COMPATIBILITY[donor.blood_group];

  const handleToggleFavorite = () => {
    if (!currentUser) {
      alert('Please select or log in as a persona to favorite donors.');
      return;
    }
    const nextState = db.toggleFavorite(currentUser.id, donor.id);
    setIsFav(nextState);
  };

  const handleShare = () => {
    if (typeof window !== 'undefined') {
      navigator.clipboard.writeText(window.location.href);
      setIsCopied(true);
      setTimeout(() => setIsCopied(false), 2500);
    }
  };

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      
      {/* Back Link */}
      <div>
        <Link
          href="/find-donor"
          className="inline-flex items-center space-x-1.5 text-xs font-semibold text-slate-500 hover:text-medical-red transition"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Donor Directory</span>
        </Link>
      </div>

      {/* Main Profile Header Card */}
      <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 sm:p-8 border border-slate-200/80 dark:border-slate-800 shadow-sm relative overflow-hidden">
        
        {/* Subtle Background Accent */}
        <div className="absolute top-0 right-0 w-96 h-96 bg-red-500/5 rounded-full blur-3xl pointer-events-none" />

        <div className="flex flex-col lg:flex-row lg:items-start justify-between gap-6 relative z-10">
          
          {/* Avatar and Basic Details */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center space-y-4 sm:space-y-0 sm:space-x-5">
            <div className="relative">
              <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-3xl bg-gradient-to-tr from-slate-100 to-slate-200 dark:from-slate-800 dark:to-slate-700 flex items-center justify-center text-slate-800 dark:text-slate-200 font-black text-3xl shadow-md border-2 border-white dark:border-slate-800">
                {donor.name.charAt(0)}
              </div>
              {donor.verification_status === 'Verified' && (
                <div
                  className="absolute -bottom-1 -right-1 bg-white dark:bg-slate-900 rounded-full p-1 shadow"
                  title="Identity & Medical Test Verified"
                >
                  <ShieldCheck className="w-6 h-6 text-emerald-500 fill-emerald-100 dark:fill-emerald-950" />
                </div>
              )}
            </div>

            <div className="space-y-1.5">
              <div className="flex flex-wrap items-center gap-2">
                <h1 className="text-xl sm:text-3xl font-black text-slate-900 dark:text-white">
                  {donor.name}
                </h1>
                <span className={`px-2.5 py-0.5 rounded-full text-xs font-bold ${verifyStyle.bg}`}>
                  {verifyStyle.label}
                </span>
                {donor.emergency_ready && (
                  <span className="px-2 py-0.5 rounded-full bg-red-100 dark:bg-red-950/80 text-medical-red text-xs font-extrabold flex items-center">
                    <Zap className="w-3 h-3 mr-1 fill-current" />
                    Emergency Responder
                  </span>
                )}
              </div>

              <div className="flex flex-wrap items-center gap-4 text-xs text-slate-500 dark:text-slate-400">
                <span className="flex items-center">
                  <MapPin className="w-3.5 h-3.5 mr-1 text-slate-400" />
                  {donor.area}, {donor.city} (PIN: {donor.pin_code})
                </span>
                <span>•</span>
                <span className="flex items-center">
                  <Star className="w-3.5 h-3.5 mr-1 text-amber-500 fill-amber-400" />
                  {donor.rating} Rating ({donor.review_count} reviews)
                </span>
              </div>

              {/* Availability status badge */}
              <div className="pt-1">
                <div className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-bold ${availStyle.bg}`}>
                  <span className={`w-2 h-2 rounded-full mr-1.5 ${availStyle.dot}`} />
                  <span>Status: {donor.availability}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Blood Shield & Action CTAs */}
          <div className="flex flex-col sm:flex-row lg:flex-col items-start sm:items-center lg:items-end justify-between gap-4">
            <div className="flex items-center space-x-3">
              <div className="text-right hidden sm:block">
                <span className="text-[10px] uppercase font-bold text-slate-400 block">Blood Group</span>
                <span className="text-xs font-bold text-slate-700 dark:text-slate-300">
                  {donor.blood_group === 'O-' ? 'Universal RBC' : donor.blood_group === 'AB+' ? 'Universal Plasma' : 'Standard'}
                </span>
              </div>
              <BloodGroupBadge bloodGroup={donor.blood_group} size="xl" />
            </div>

            {/* Actions */}
            <div className="flex flex-wrap items-center gap-2 w-full sm:w-auto">
              <button
                onClick={() => setIsRequestModalOpen(true)}
                className="flex-1 sm:flex-none py-2.5 px-5 rounded-xl bg-medical-red hover:bg-red-700 text-white font-bold text-xs shadow-md shadow-red-500/25 transition flex items-center justify-center space-x-1.5"
              >
                <HeartHandshake className="w-4 h-4" />
                <span>Send Blood Request</span>
              </button>

              <button
                onClick={() => setIsQROpen(true)}
                className="py-2.5 px-3 rounded-xl border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-200 font-semibold text-xs transition flex items-center space-x-1.5"
                title="View Digital QR Pass"
              >
                <QrCode className="w-4 h-4 text-medical-red" />
                <span className="hidden sm:inline">QR Pass</span>
              </button>

              <button
                onClick={handleToggleFavorite}
                className="p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 transition"
                title={isFav ? 'Remove Favorite' : 'Save Favorite'}
              >
                <Star
                  className={`w-4 h-4 ${
                    isFav ? 'fill-amber-400 text-amber-400' : 'text-slate-400 hover:text-amber-400'
                  }`}
                />
              </button>

              <button
                onClick={handleShare}
                className="p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-500 dark:text-slate-400 transition relative"
                title="Share Profile Link"
              >
                <Share2 className="w-4 h-4" />
                {isCopied && (
                  <span className="absolute -top-8 left-1/2 -translate-x-1/2 bg-slate-900 text-white text-[10px] font-bold px-2 py-0.5 rounded shadow">
                    Copied!
                  </span>
                )}
              </button>
            </div>
          </div>
        </div>

        {/* Bio */}
        {donor.bio && (
          <div className="mt-6 pt-5 border-t border-slate-100 dark:border-slate-800">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-1">About the Donor</h3>
            <p className="text-xs sm:text-sm text-slate-700 dark:text-slate-300 leading-relaxed max-w-3xl">
              "{donor.bio}"
            </p>
          </div>
        )}
      </div>

      {/* Grid: Stats, Compatibility & Privacy */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Donor Impact Stats */}
        <div className="bg-white dark:bg-slate-900 rounded-2xl p-5 border border-slate-200/80 dark:border-slate-800 shadow-sm space-y-4">
          <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center space-x-1.5">
            <Droplet className="w-4 h-4 text-medical-red" />
            <span>Donation Statistics</span>
          </h3>

          <div className="grid grid-cols-2 gap-3 text-center">
            <div className="p-3 bg-slate-50 dark:bg-slate-800/60 rounded-xl border border-slate-100 dark:border-slate-800">
              <span className="text-xl font-black text-slate-900 dark:text-white block">
                {donor.total_donations}
              </span>
              <span className="text-[10px] text-slate-400 font-semibold uppercase">Total Donations</span>
            </div>

            <div className="p-3 bg-slate-50 dark:bg-slate-800/60 rounded-xl border border-slate-100 dark:border-slate-800">
              <span className="text-xl font-black text-emerald-600 dark:text-emerald-400 block">
                {donor.response_rate_percent}%
              </span>
              <span className="text-[10px] text-slate-400 font-semibold uppercase">Response Rate</span>
            </div>

            <div className="p-3 bg-slate-50 dark:bg-slate-800/60 rounded-xl border border-slate-100 dark:border-slate-800">
              <span className="text-base font-black text-slate-900 dark:text-white block">
                ~{donor.avg_response_time}
              </span>
              <span className="text-[10px] text-slate-400 font-semibold uppercase">Avg. Response Time</span>
            </div>

            <div className="p-3 bg-slate-50 dark:bg-slate-800/60 rounded-xl border border-slate-100 dark:border-slate-800">
              <span className="text-xs font-bold text-slate-800 dark:text-slate-200 block truncate">
                {formatDate(donor.last_donation_date)}
              </span>
              <span className="text-[10px] text-slate-400 font-semibold uppercase">Last Donation</span>
            </div>
          </div>

          {/* Privacy Note */}
          <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-700/60 text-[11px] text-slate-500 dark:text-slate-400 flex items-start space-x-2">
            <Lock className="w-3.5 h-3.5 text-slate-400 shrink-0 mt-0.5" />
            <span>
              Contact details and full phone numbers are protected under HIPAA/GDPR rules and only exchanged upon mutual request approval.
            </span>
          </div>
        </div>

        {/* Compatibility Matrix Breakdown */}
        <div className="bg-white dark:bg-slate-900 rounded-2xl p-5 border border-slate-200/80 dark:border-slate-800 shadow-sm space-y-4">
          <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center space-x-1.5">
            <Heart className="w-4 h-4 text-medical-red" />
            <span>Transfusion Compatibility</span>
          </h3>

          <div className="space-y-3 text-xs">
            <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-800">
              <span className="font-bold text-slate-700 dark:text-slate-300 block mb-2">
                This donor ({donor.blood_group}) can donate RBC to:
              </span>
              <div className="flex flex-wrap gap-1.5">
                {compatData.canDonateTo.map((bg) => (
                  <BloodGroupBadge key={bg} bloodGroup={bg} size="sm" />
                ))}
              </div>
            </div>

            <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-800">
              <span className="font-bold text-slate-700 dark:text-slate-300 block mb-2">
                If this donor needs blood, they can receive from:
              </span>
              <div className="flex flex-wrap gap-1.5">
                {compatData.canReceiveFrom.map((bg) => (
                  <BloodGroupBadge key={bg} bloodGroup={bg} size="sm" />
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Achievements & Badges */}
        <div className="bg-white dark:bg-slate-900 rounded-2xl p-5 border border-slate-200/80 dark:border-slate-800 shadow-sm space-y-4">
          <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center space-x-1.5">
            <Award className="w-4 h-4 text-amber-500" />
            <span>Earned Achievements</span>
          </h3>

          {achievements.length === 0 ? (
            <p className="text-xs text-slate-400 py-4 text-center">No badges awarded yet.</p>
          ) : (
            <div className="space-y-2.5">
              {achievements.map((ach) => (
                <div
                  key={ach.id}
                  className="flex items-center space-x-3 p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-800"
                >
                  <div className="w-8 h-8 rounded-lg bg-amber-100 dark:bg-amber-950 flex items-center justify-center text-amber-600 font-bold shrink-0">
                    🏆
                  </div>
                  <div className="flex-1 min-w-0">
                    <h4 className="text-xs font-bold text-slate-900 dark:text-white truncate">
                      {ach.name}
                    </h4>
                    <p className="text-[10px] text-slate-500 dark:text-slate-400 truncate">
                      {ach.description}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Donation History Table */}
      <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 border border-slate-200/80 dark:border-slate-800 shadow-sm space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center space-x-2">
            <Calendar className="w-4 h-4 text-medical-red" />
            <span>Verified Donation Records</span>
          </h3>
          <span className="text-xs text-slate-400">
            {donationHistory.length} verified records on ledger
          </span>
        </div>

        {donationHistory.length === 0 ? (
          <div className="py-6 text-center text-xs text-slate-400">
            No past donation records logged in the system.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 dark:bg-slate-800/60 text-slate-500 uppercase font-bold text-[10px]">
                <tr>
                  <th className="px-4 py-3 rounded-l-xl">Date</th>
                  <th className="px-4 py-3">Facility / Blood Center</th>
                  <th className="px-4 py-3">Donation Type</th>
                  <th className="px-4 py-3">Units</th>
                  <th className="px-4 py-3 rounded-r-xl">Certificate / ID</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800 text-slate-700 dark:text-slate-300 font-medium">
                {donationHistory.map((rec) => (
                  <tr key={rec.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/40 transition">
                    <td className="px-4 py-3 font-semibold">{formatDate(rec.donation_date)}</td>
                    <td className="px-4 py-3">{rec.hospital_or_blood_bank}</td>
                    <td className="px-4 py-3">{rec.donation_type}</td>
                    <td className="px-4 py-3">{rec.units_donated} Unit</td>
                    <td className="px-4 py-3 font-mono text-[11px] text-medical-red font-bold">
                      {rec.certificate_url || 'CERT-VERIFIED'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Medical Safety Disclaimer Alert */}
      <div className="p-4 rounded-2xl bg-slate-100 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 text-slate-500 dark:text-slate-400 text-xs leading-relaxed">
        <span className="font-bold text-slate-800 dark:text-slate-200">Medical Safety Notice: </span>
        {MEDICAL_SAFETY_DISCLAIMER}
      </div>

      {/* Modals */}
      <DirectRequestModal
        donor={donor}
        isOpen={isRequestModalOpen}
        onClose={() => setIsRequestModalOpen(false)}
      />

      <QRCardModal
        donor={donor}
        isOpen={isQROpen}
        onClose={() => setIsQROpen(false)}
      />
    </div>
  );
}
