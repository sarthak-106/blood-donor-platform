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
  Phone,
  MapPin,
  Calendar,
} from 'lucide-react';
import { formatDate } from '@/lib/utils';

export default function DonorQRProfilePage() {
  const { currentDonor } = useAuth();
  const [qrUrl, setQrUrl] = useState<string>('');
  const [isCopied, setIsCopied] = useState<boolean>(false);

  const donor = currentDonor || db.getDonorById('donor-1');

  useEffect(() => {
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
        <h2 className="text-xl font-bold">Please select a donor account</h2>
      </div>
    );
  }

  const handleDownload = () => {
    if (!qrUrl) return;
    const a = document.createElement('a');
    a.href = qrUrl;
    a.download = `digital_pass_${donor.name.replace(/\s+/g, '_')}.png`;
    a.click();
  };

  const handlePrint = () => {
    if (typeof window !== 'undefined') {
      window.print();
    }
  };

  const handleShare = () => {
    if (typeof window !== 'undefined') {
      navigator.clipboard.writeText(`${window.location.origin}/donors/${donor.id}`);
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
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white tracking-tight">
            Digital Donor QR Pass
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
            Universal scannable verification pass for hospital reception and blood banks.
          </p>
        </div>

        <div className="flex space-x-2">
          <button
            onClick={handleDownload}
            className="px-4 py-2 rounded-xl bg-slate-900 text-white dark:bg-slate-100 dark:text-slate-900 font-bold text-xs shadow transition flex items-center space-x-1.5"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Download PNG</span>
          </button>
          <button
            onClick={handlePrint}
            className="px-4 py-2 rounded-xl border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 font-semibold text-xs transition flex items-center space-x-1.5"
          >
            <Printer className="w-3.5 h-3.5" />
            <span>Print Pass</span>
          </button>
        </div>
      </div>

      {/* High-Resolution ID Card */}
      <div className="max-w-md mx-auto bg-gradient-to-b from-white to-slate-50 dark:from-slate-800 dark:to-slate-900 rounded-3xl p-6 sm:p-8 border-2 border-red-500/30 shadow-2xl space-y-6 text-center relative overflow-hidden">
        
        {/* Top Branding */}
        <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-700 pb-4">
          <div className="flex items-center space-x-2 text-left">
            <div className="w-8 h-8 rounded-xl bg-medical-red flex items-center justify-center text-white font-black text-sm">
              <Droplet className="w-4 h-4 fill-current" />
            </div>
            <div>
              <span className="font-black text-xs text-slate-900 dark:text-white block">
                NATIONAL BLOOD DONOR ID
              </span>
              <span className="text-[10px] text-slate-400">Verified Donor Registry</span>
            </div>
          </div>
          <BloodGroupBadge bloodGroup={donor.blood_group} size="md" />
        </div>

        {/* User Info */}
        <div className="space-y-1">
          <h2 className="text-xl font-black text-slate-900 dark:text-white">
            {donor.name}
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 flex items-center justify-center">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-500 mr-1" />
            <span>Identity & Blood Test Verified</span>
          </p>
        </div>

        {/* High Res QR Box */}
        <div className="bg-white p-4 rounded-2xl inline-block shadow-lg border border-slate-200">
          {qrUrl ? (
            <img
              src={qrUrl}
              alt={`QR Pass for ${donor.name}`}
              className="w-56 h-56 object-contain mx-auto"
            />
          ) : (
            <div className="w-56 h-56 flex items-center justify-center text-slate-400">
              <QrCode className="w-16 h-16 animate-pulse" />
            </div>
          )}
        </div>

        {/* Ledger & Metadata */}
        <div className="grid grid-cols-3 gap-2 bg-slate-100 dark:bg-slate-800/80 p-3 rounded-2xl text-xs">
          <div>
            <span className="text-[10px] text-slate-400 uppercase font-bold block">Donations</span>
            <span className="font-bold text-slate-800 dark:text-slate-200">{donor.total_donations} Units</span>
          </div>
          <div>
            <span className="text-[10px] text-slate-400 uppercase font-bold block">City</span>
            <span className="font-bold text-slate-800 dark:text-slate-200 truncate block">{donor.city}</span>
          </div>
          <div>
            <span className="text-[10px] text-slate-400 uppercase font-bold block">Emergency</span>
            <span className="font-bold text-medical-red">Active SOS</span>
          </div>
        </div>

        <div className="text-[10px] text-slate-400 font-mono">
          PASS ID: DONOR-PASS-{donor.id.toUpperCase()}-VERIFIED
        </div>
      </div>
    </div>
  );
}
