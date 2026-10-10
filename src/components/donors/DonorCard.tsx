'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { Donor } from '@/lib/types';
import { BloodGroupBadge } from '@/components/blood/BloodGroupBadge';
import { DirectRequestModal } from './DirectRequestModal';
import { QRCardModal } from './QRCardModal';
import { useAuth } from '@/context/AuthContext';
import { db } from '@/lib/db';
import {
  ShieldCheck,
  Star,
  MapPin,
  Clock,
  Heart,
  Droplet,
  QrCode,
  Zap,
  CheckCircle,
  AlertCircle,
} from 'lucide-react';
import { getAvailabilityBadgeStyle, getVerificationBadgeStyle } from '@/lib/utils';

interface DonorCardProps {
  donor: Donor;
  onFavoriteChange?: () => void;
}

export const DonorCard: React.FC<DonorCardProps> = ({ donor, onFavoriteChange }) => {
  const { currentUser } = useAuth();
  const [isRequestModalOpen, setIsRequestModalOpen] = useState(false);
  const [isQROpen, setIsQROpen] = useState(false);
  const [isFav, setIsFav] = useState(
    currentUser ? db.isFavorite(currentUser.id, donor.id) : false
  );

  const availStyle = getAvailabilityBadgeStyle(donor.availability);
  const verifyStyle = getVerificationBadgeStyle(donor.verification_status);

  const handleToggleFavorite = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (!currentUser) {
      alert('Please switch or log in as a persona to save favorite donors.');
      return;
    }
    const nextState = db.toggleFavorite(currentUser.id, donor.id);
    setIsFav(nextState);
    if (onFavoriteChange) onFavoriteChange();
  };

  return (
    <>
      <div className="group relative bg-white dark:bg-slate-800/90 rounded-2xl border border-slate-200/80 dark:border-slate-700/80 hover:border-red-300 dark:hover:border-red-800/80 shadow-sm hover:shadow-soft-lg transition-all duration-200 overflow-hidden flex flex-col justify-between">
        
        {/* Top Header Card */}
        <div className="p-5 pb-3">
          <div className="flex items-start justify-between">
            <div className="flex items-center space-x-3">
              <div className="relative">
                <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-slate-100 to-slate-200 dark:from-slate-700 dark:to-slate-600 flex items-center justify-center text-slate-700 dark:text-slate-200 font-bold text-lg shadow-sm">
                  {donor.name.charAt(0)}
                </div>
                {donor.verification_status === 'Verified' && (
                  <div
                    className="absolute -bottom-1 -right-1 bg-white dark:bg-slate-800 rounded-full p-0.5 shadow"
                    title="Verified Donor ID"
                  >
                    <ShieldCheck className="w-4 h-4 text-emerald-500 fill-emerald-100 dark:fill-emerald-950" />
                  </div>
                )}
              </div>

              <div>
                <div className="flex items-center space-x-1.5">
                  <Link
                    href={`/donors/${donor.id}`}
                    className="font-bold text-sm sm:text-base text-slate-900 dark:text-white hover:text-medical-red transition"
                  >
                    {donor.name}
                  </Link>
                  {donor.emergency_ready && (
                    <span
                      className="px-1.5 py-0.5 rounded bg-red-100 dark:bg-red-950/80 text-medical-red text-[10px] font-bold inline-flex items-center"
                      title="Available for immediate emergency calls"
                    >
                      <Zap className="w-2.5 h-2.5 mr-0.5 fill-current" />
                      SOS
                    </span>
                  )}
                </div>

                <div className="flex items-center space-x-2 text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                  <span className="flex items-center truncate max-w-[140px]">
                    <MapPin className="w-3 h-3 mr-1 text-slate-400 shrink-0" />
                    {donor.area}, {donor.city}
                  </span>
                </div>
              </div>
            </div>

            {/* Blood Badge & Favorite */}
            <div className="flex flex-col items-end space-y-1.5">
              <BloodGroupBadge bloodGroup={donor.blood_group} size="md" />
              <button
                onClick={handleToggleFavorite}
                className="p-1 rounded-lg text-slate-400 hover:text-amber-500 transition"
                title={isFav ? 'Remove from favorites' : 'Save to favorites'}
              >
                <Star
                  className={`w-4 h-4 ${
                    isFav ? 'fill-amber-400 text-amber-400' : 'text-slate-400 hover:text-amber-400'
                  }`}
                />
              </button>
            </div>
          </div>

          {/* Availability & Response Specs */}
          <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-700/60 flex items-center justify-between text-xs">
            <div className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-semibold ${availStyle.bg}`}>
              <span className={`w-1.5 h-1.5 rounded-full mr-1.5 ${availStyle.dot}`} />
              <span>{donor.availability}</span>
            </div>

            <div className="flex items-center space-x-3 text-slate-500 dark:text-slate-400 text-[11px]">
              <span className="flex items-center">
                <Clock className="w-3 h-3 mr-1 text-slate-400" />
                ~{donor.avg_response_time}
              </span>
              <span className="flex items-center text-amber-600 dark:text-amber-400 font-semibold">
                ★ {donor.rating} ({donor.total_donations} drops)
              </span>
            </div>
          </div>
        </div>

        {/* Card Footer Actions */}
        <div className="p-3 bg-slate-50 dark:bg-slate-800/50 border-t border-slate-100 dark:border-slate-700/60 flex items-center space-x-2">
          <button
            onClick={() => setIsRequestModalOpen(true)}
            className="flex-1 py-2 px-3 rounded-xl bg-medical-red hover:bg-red-700 text-white font-bold text-xs shadow-sm transition flex items-center justify-center space-x-1.5"
          >
            <Droplet className="w-3.5 h-3.5 fill-current" />
            <span>Request Blood</span>
          </button>

          <Link
            href={`/donors/${donor.id}`}
            className="py-2 px-3 rounded-xl border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 font-semibold text-xs transition"
          >
            Profile
          </Link>

          <button
            onClick={() => setIsQROpen(true)}
            className="p-2 rounded-xl border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-500 dark:text-slate-400 hover:text-medical-red transition"
            title="View Digital QR Pass"
          >
            <QrCode className="w-4 h-4" />
          </button>
        </div>
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
    </>
  );
};
