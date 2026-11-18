'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import QRCode from 'qrcode';
import { useAuth } from '@/context/AuthContext';
import { db } from '@/lib/db';
import { BloodGroupBadge } from '@/components/blood/BloodGroupBadge';
import {
  QrCode,
  Download,
  Printer,
  ShieldCheck,
  Award,
  Heart,
  Droplet,
  ArrowLeft,
  Share2,
  Calendar,
  CheckCircle,
  Activity,
  FileText,
  BadgeCheck,
} from 'lucide-react';
import { formatDate } from '@/lib/utils';

export default function DonorQRProfilePage() {
  const { currentDonor } = useAuth();
  const [qrUrl, setQrUrl] = useState<string>('');
  const [isCopied, setIsCopied] = useState<boolean>(false);

  const donor = currentDonor || db.getDonorById('donor-1');

  useEffect(() => {
    document.title = 'Donor Health Passport & Digital Verification Pass | BloodDonor Platform';
    if (donor) {
      const publicUrl = `${typeof window !== 'undefined' ? window.location.origin : ''}/donors/${donor.id}`;
      QRCode.toDataURL(publicUrl, {
        width: 320,
        margin: 2,
        color: {
          dark: '#E53935',
          light: '#FFFFFF',
        },
      })
        .then((url) => setQrUrl(url))
        .catch((err) => console.error(err));
    }
  }, [donor]);

  if (!donor) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-20 text-center">
        <h2 className="text-xl font-bold">Please select or register as a donor</h2>
      </div>
    );
  }

  // Calculate next eligible donation date (90 days from last donation)
  const lastDate = donor.last_donation_date ? new Date(donor.last_donation_date) : new Date(Date.now() - 86400000 * 95);
  const nextEligibleDate = new Date(lastDate.getTime() + 90 * 24 * 60 * 60 * 1000);
  const isEligibleNow = Date.now() >= nextEligibleDate.getTime();

  const handleDownload = () => {
    if (!qrUrl) return;
    const a = document.createElement('a');
    a.href = qrUrl;
    a.download = `donor_passport_${donor.name.replace(/\s+/g, '_')}.png`;
    a.click();
  };

  const handlePrint = () => {
    if (typeof window !== 'undefined') {
      window.print();
    }
  };

  const handleShare = () => {
    if (typeof window !== 'undefined') {
      const shareUrl = `${window.location.origin}/donors/${donor.id}`;
      navigator.clipboard.writeText(shareUrl);
      setIsCopied(true);
      setTimeout(() => setIsCopied(false), 2000);
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
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
          <div className="inline-flex items-center space-x-1.5 px-3 py-1 rounded-full bg-red-100 dark:bg-red-950 text-medical-red text-xs font-bold mb-2">
            <BadgeCheck className="w-3.5 h-3.5" />
            <span>Official Verifiable Credential</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white tracking-tight">
            Donor Health Passport & Verification Pass
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
            Universal scannable verification pass for instant hospital reception, emergency triage, and blood banks.
          </p>
        </div>

        <div className="flex space-x-2">
          <button
            onClick={handlePrint}
            className="px-4 py-2.5 rounded-xl bg-medical-red hover:bg-red-700 text-white font-bold text-xs shadow transition flex items-center space-x-1.5"
          >
            <Printer className="w-3.5 h-3.5" />
            <span>Download / Print PDF</span>
          </button>
          <button
            onClick={handleDownload}
            className="px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 font-semibold text-xs transition flex items-center space-x-1.5"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Save QR</span>
          </button>
        </div>
      </div>

      {/* Verified Health Passport Layout */}
      <div className="max-w-xl mx-auto bg-white dark:bg-slate-900 rounded-3xl p-8 border-2 border-red-500/30 shadow-2xl space-y-6 text-center relative overflow-hidden">
        {/* Top Watermark */}
        <div className="absolute top-0 right-0 w-48 h-48 bg-red-500/5 rounded-full blur-2xl pointer-events-none" />

        {/* Passport Header */}
        <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-5">
          <div className="flex items-center space-x-3 text-left">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-red-600 to-rose-600 flex items-center justify-center text-white font-black text-base shadow-md">
              <Droplet className="w-5 h-5 fill-current" />
            </div>
            <div>
              <span className="font-black text-sm text-slate-900 dark:text-white block">
                NATIONAL BLOOD DONOR PASSPORT
              </span>
              <span className="text-[11px] text-slate-500">Government NBTC Aligned Registry</span>
            </div>
          </div>
          <BloodGroupBadge bloodGroup={donor.blood_group} size="lg" />
        </div>

        {/* Donor Identity Card */}
        <div className="space-y-1">
          <h2 className="text-2xl font-black text-slate-900 dark:text-white">
            {donor.name}
          </h2>
          <div className="flex items-center justify-center space-x-2 text-xs">
            <span className="inline-flex items-center text-emerald-600 dark:text-emerald-400 font-bold">
              <ShieldCheck className="w-4 h-4 mr-1" />
              Verified Voluntary LifeSaver
            </span>
            <span>•</span>
            <span className="text-slate-500">{donor.city}, India</span>
          </div>
        </div>

        {/* Dynamic High-Res Scannable QR Code */}
        <div className="bg-slate-50 dark:bg-slate-800/80 p-5 rounded-3xl inline-block shadow-inner border border-slate-200/80 dark:border-slate-700">
          {qrUrl ? (
            <img
              src={qrUrl}
              alt={`Health Passport QR for ${donor.name}`}
              className="w-52 h-52 object-contain mx-auto rounded-xl"
            />
          ) : (
            <div className="w-52 h-52 flex items-center justify-center text-slate-400">
              <QrCode className="w-16 h-16 animate-pulse" />
            </div>
          )}
          <span className="text-[10px] font-mono text-slate-400 block mt-2">
            SCAN TO VERIFY TRANSFUSION READINESS
          </span>
        </div>

        {/* Clinical Eligibility Status Banner */}
        <div
          className={`p-4 rounded-2xl border text-xs font-semibold flex items-center justify-between ${
            isEligibleNow
              ? 'bg-emerald-50 dark:bg-emerald-950/40 border-emerald-300 dark:border-emerald-800 text-emerald-800 dark:text-emerald-300'
              : 'bg-amber-50 dark:bg-amber-950/40 border-amber-300 dark:border-amber-800 text-amber-800 dark:text-amber-300'
          }`}
        >
          <div className="flex items-center space-x-2 text-left">
            <Activity className="w-4 h-4 shrink-0" />
            <div>
              <span className="block font-bold">
                {isEligibleNow ? 'Eligible for Voluntary Donation' : 'Mandatory 90-Day Waiting Gap Active'}
              </span>
              <span className="text-[10px] opacity-80 block">
                Next Safe Donation: {formatDate(nextEligibleDate.toISOString())}
              </span>
            </div>
          </div>
          <span className="px-2.5 py-1 rounded-full text-[10px] font-extrabold bg-white dark:bg-slate-900 shadow-sm shrink-0">
            {isEligibleNow ? 'READY' : 'DEFERRED'}
          </span>
        </div>

        {/* Vitals & History Ledger */}
        <div className="grid grid-cols-3 gap-3 bg-slate-50 dark:bg-slate-800/60 p-4 rounded-2xl text-xs text-left">
          <div>
            <span className="text-[10px] text-slate-400 uppercase font-bold block">Lifetime Donations</span>
            <span className="text-sm font-black text-slate-900 dark:text-white">{donor.total_donations} Units</span>
          </div>
          <div>
            <span className="text-[10px] text-slate-400 uppercase font-bold block">Last Donated</span>
            <span className="text-xs font-bold text-slate-700 dark:text-slate-300">
              {donor.last_donation_date ? formatDate(donor.last_donation_date) : 'Over 90 days ago'}
            </span>
          </div>
          <div>
            <span className="text-[10px] text-slate-400 uppercase font-bold block">Lives Impacted</span>
            <span className="text-sm font-black text-medical-red">~{donor.total_donations * 3}+</span>
          </div>
        </div>

        {/* Security & Ledger ID */}
        <div className="flex items-center justify-between text-[10px] text-slate-400 font-mono pt-2 border-t border-slate-100 dark:border-slate-800">
          <span>REGISTRY ID: {donor.id.toUpperCase()}</span>
          <span>SECURITY HASH: #LK-{donor.id.slice(-4)}-OK</span>
        </div>
      </div>
    </div>
  );
}
