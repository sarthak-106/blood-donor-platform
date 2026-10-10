'use client';

import React, { useEffect, useState } from 'react';
import QRCode from 'qrcode';
import { Donor } from '@/lib/types';
import { BloodGroupBadge } from '@/components/blood/BloodGroupBadge';
import { X, QrCode, Download, ShieldCheck, Award, Heart, CheckCircle2 } from 'lucide-react';

interface QRCardModalProps {
  donor: Donor;
  isOpen: boolean;
  onClose: () => void;
}

export const QRCardModal: React.FC<QRCardModalProps> = ({ donor, isOpen, onClose }) => {
  const [qrDataUrl, setQrDataUrl] = useState<string>('');

  useEffect(() => {
    if (donor && isOpen) {
      const profileUrl = `${typeof window !== 'undefined' ? window.location.origin : ''}/donors/${donor.id}`;
      QRCode.toDataURL(profileUrl, {
        width: 240,
        margin: 2,
        color: {
          dark: '#E53935',
          light: '#FFFFFF',
        },
      })
        .then((url) => setQrDataUrl(url))
        .catch((err) => console.error(err));
    }
  }, [donor, isOpen]);

  if (!isOpen) return null;

  const handleDownload = () => {
    if (!qrDataUrl) return;
    const a = document.createElement('a');
    a.href = qrDataUrl;
    a.download = `donor_pass_${donor.name.replace(/\s+/g, '_')}.png`;
    a.click();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fadeIn">
      <div className="relative w-full max-w-sm bg-white dark:bg-slate-900 rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-800 p-6 overflow-hidden">
        
        {/* Close */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-1.5 text-slate-400 hover:text-slate-700 dark:hover:text-white rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Digital Pass Card UI */}
        <div className="text-center pt-2">
          <div className="inline-flex items-center space-x-1.5 px-3 py-1 rounded-full bg-red-50 dark:bg-red-950/60 text-medical-red text-xs font-extrabold uppercase tracking-wider mb-3">
            <Heart className="w-3.5 h-3.5 fill-current" />
            <span>Digital Donor ID Pass</span>
          </div>

          <div className="p-4 rounded-2xl bg-gradient-to-b from-slate-50 to-slate-100 dark:from-slate-800/80 dark:to-slate-800/40 border border-slate-200 dark:border-slate-700 shadow-sm relative overflow-hidden">
            {/* Blood Type Badge Absolute Top Right */}
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center space-x-2 text-left">
                <div className="w-10 h-10 rounded-full bg-red-100 dark:bg-red-900/60 flex items-center justify-center text-medical-red font-bold">
                  {donor.name.charAt(0)}
                </div>
                <div>
                  <h4 className="font-bold text-sm text-slate-900 dark:text-white leading-tight">
                    {donor.name}
                  </h4>
                  <span className="text-[11px] text-slate-500 flex items-center mt-0.5">
                    <ShieldCheck className="w-3 h-3 text-emerald-500 mr-1" />
                    Verified Donor ID
                  </span>
                </div>
              </div>
              <BloodGroupBadge bloodGroup={donor.blood_group} size="md" />
            </div>

            {/* QR Code Container */}
            <div className="bg-white p-3 rounded-xl inline-block shadow-inner my-2 border border-slate-200">
              {qrDataUrl ? (
                <img
                  src={qrDataUrl}
                  alt={`QR Code for ${donor.name}`}
                  className="w-44 h-44 object-contain mx-auto"
                />
              ) : (
                <div className="w-44 h-44 flex items-center justify-center text-slate-400">
                  <QrCode className="w-12 h-12 animate-pulse" />
                </div>
              )}
            </div>

            {/* Donor Metrics */}
            <div className="grid grid-cols-3 gap-2 mt-3 pt-3 border-t border-slate-200 dark:border-slate-700/80 text-center">
              <div>
                <span className="text-[10px] text-slate-400 uppercase font-semibold block">Donations</span>
                <span className="text-xs font-bold text-slate-800 dark:text-slate-200">
                  {donor.total_donations} Units
                </span>
              </div>
              <div>
                <span className="text-[10px] text-slate-400 uppercase font-semibold block">City</span>
                <span className="text-xs font-bold text-slate-800 dark:text-slate-200 truncate block">
                  {donor.city}
                </span>
              </div>
              <div>
                <span className="text-[10px] text-slate-400 uppercase font-semibold block">Rating</span>
                <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400">
                  ★ {donor.rating}
                </span>
              </div>
            </div>
          </div>

          <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-4 leading-normal">
            Scan at authorized hospital intake or blood bank reception for instant verification and identity check.
          </p>

          <div className="mt-4 flex space-x-2">
            <button
              onClick={handleDownload}
              className="flex-1 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white dark:bg-slate-100 dark:text-slate-900 font-bold text-xs shadow-md transition flex items-center justify-center space-x-2"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Download QR</span>
            </button>
            <button
              onClick={onClose}
              className="px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 font-semibold text-xs hover:bg-slate-50 dark:hover:bg-slate-800 transition"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
