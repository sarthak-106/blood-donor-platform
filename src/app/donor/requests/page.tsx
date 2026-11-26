'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';
import { db } from '@/lib/db';
import { BloodRequest, UrgencyLevel, Donor } from '@/lib/types';
import { BloodGroupBadge } from '@/components/blood/BloodGroupBadge';
import {
  Droplet,
  Heart,
  Clock,
  Hospital,
  MapPin,
  CheckCircle2,
  XCircle,
  ArrowLeft,
  Zap,
  Phone,
} from 'lucide-react';
import { formatDate, formatTimeAgo, getUrgencyBadgeStyle } from '@/lib/utils';
import confetti from 'canvas-confetti';

export default function DonorIncomingRequestsPage() {
  const { currentDonor } = useAuth();
  const [requests, setRequests] = useState<BloodRequest[]>([]);
  const [activeUrgencyFilter, setActiveUrgencyFilter] = useState<string>('all');
  const [respondingReqId, setRespondingReqId] = useState<string | null>(null);
  const [eta, setEta] = useState('30-45 mins');
  const [responseNote, setResponseNote] = useState('');
  const [declineReason, setDeclineReason] = useState('Unavailable due to travel/work');
  const [actionType, setActionType] = useState<'accept' | 'decline'>('accept');

  const donor = currentDonor || db.getDonorById('donor-1');

  const refreshRequests = () => {
    const list = db.getBloodRequests();
    setRequests([...list]);
  };

  useEffect(() => {
    refreshRequests();
  }, []);

  const filteredRequests = requests.filter((r) => {
    if (activeUrgencyFilter !== 'all' && r.urgency !== activeUrgencyFilter) {
      return false;
    }
    return true;
  });

  const handleOpenActionModal = (reqId: string, type: 'accept' | 'decline') => {
    setRespondingReqId(reqId);
    setActionType(type);
  };

  const handleConfirmResponse = (e: React.FormEvent) => {
    e.preventDefault();
    if (!respondingReqId || !donor) return;

    db.respondToDonorRequest(respondingReqId, donor.id, actionType, {
      eta: actionType === 'accept' ? eta : undefined,
      notes: actionType === 'accept' ? responseNote : undefined,
      decline_reason: actionType === 'decline' ? declineReason : undefined,
    });

    setRespondingReqId(null);
    refreshRequests();

    if (actionType === 'accept') {
      confetti({
        particleCount: 90,
        spread: 60,
        origin: { y: 0.6 },
      });
    }
  };

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      
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
            Incoming Blood Requests
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
            Accept or decline direct blood requests from patients and hospitals in your area.
          </p>
        </div>

        {/* Urgency Filter Pills */}
        <div className="bg-slate-100 dark:bg-slate-800 p-1 rounded-xl flex items-center">
          {['all', 'Critical', 'Urgent', 'Normal'].map((urg) => (
            <button
              key={urg}
              onClick={() => setActiveUrgencyFilter(urg)}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition ${
                activeUrgencyFilter === urg
                  ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-sm'
                  : 'text-slate-500 dark:text-slate-400 hover:text-slate-800'
              }`}
            >
              {urg === 'all' ? 'All Requests' : urg}
            </button>
          ))}
        </div>
      </div>

      {/* Requests Feed */}
      <div className="space-y-4">
        {filteredRequests.length === 0 ? (
          <div className="bg-white dark:bg-slate-900 rounded-3xl p-12 text-center border border-slate-200 dark:border-slate-800 text-slate-400 text-xs">
            No blood requests match this filter.
          </div>
        ) : (
          filteredRequests.map((req) => {
            const urgencyStyle = getUrgencyBadgeStyle(req.urgency);

            return (
              <div
                key={req.id}
                className="bg-white dark:bg-slate-900 rounded-3xl p-6 border border-slate-200/80 dark:border-slate-800 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-6"
              >
                <div className="space-y-2.5">
                  <div className="flex flex-wrap items-center gap-2.5">
                    <BloodGroupBadge bloodGroup={req.blood_group} size="md" />
                    <h3 className="font-bold text-base text-slate-900 dark:text-white">
                      {req.patient_name}
                    </h3>
                    <span className={`px-2.5 py-0.5 rounded-full text-xs font-bold ${urgencyStyle.bg}`}>
                      {urgencyStyle.label}
                    </span>
                    <span className="text-xs text-slate-400">
                      • {formatTimeAgo(req.created_at)}
                    </span>
                  </div>

                  <div className="flex flex-wrap items-center gap-4 text-xs text-slate-500 dark:text-slate-400">
                    <span className="flex items-center">
                      <Hospital className="w-3.5 h-3.5 mr-1 text-slate-400" />
                      {req.hospital} ({req.city})
                    </span>
                    <span>•</span>
                    <span>{req.quantity_units} Unit(s) Required</span>
                    <span>•</span>
                    <span className="flex items-center">
                      <Clock className="w-3.5 h-3.5 mr-1 text-slate-400" />
                      Needed by {formatDate(req.required_by)}
                    </span>
                  </div>

                  {req.notes && (
                    <p className="text-xs text-slate-600 dark:text-slate-300 italic">
                      "{req.notes}"
                    </p>
                  )}
                </div>

                {/* Accept / Decline CTA Buttons */}
                <div className="flex items-center space-x-2 shrink-0">
                  <button
                    onClick={() => handleOpenActionModal(req.id, 'accept')}
                    className="px-5 py-2.5 rounded-xl bg-medical-red hover:bg-red-700 text-white font-bold text-xs shadow-md transition flex items-center space-x-1.5"
                  >
                    <Heart className="w-3.5 h-3.5 fill-current" />
                    <span>Accept Request</span>
                  </button>

                  <button
                    onClick={() => handleOpenActionModal(req.id, 'decline')}
                    className="px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-300 font-semibold text-xs transition"
                  >
                    Decline
                  </button>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Response Action Modal */}
      {respondingReqId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fadeIn">
          <div className="w-full max-w-md bg-white dark:bg-slate-900 rounded-3xl p-6 border border-slate-200 dark:border-slate-800 shadow-2xl space-y-4">
            <h3 className="font-bold text-base text-slate-900 dark:text-white">
              {actionType === 'accept' ? 'Accept Blood Donation Request' : 'Decline Request'}
            </h3>

            <form onSubmit={handleConfirmResponse} className="space-y-3.5">
              {actionType === 'accept' ? (
                <>
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                      Estimated Arrival Time (ETA) *
                    </label>
                    <input
                      type="text"
                      required
                      value={eta}
                      onChange={(e) => setEta(e.target.value)}
                      placeholder="e.g. 30-45 mins or Tomorrow at 9 AM"
                      className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-medical-red focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                      Message for Recipient / Hospital (Optional)
                    </label>
                    <textarea
                      rows={2}
                      value={responseNote}
                      onChange={(e) => setResponseNote(e.target.value)}
                      placeholder="e.g. On my way to the blood bank now."
                      className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-medical-red focus:outline-none"
                    />
                  </div>

                  <div className="p-3 bg-red-50/80 dark:bg-red-950/40 border border-red-200 dark:border-red-900/60 rounded-xl space-y-1 text-xs">
                    <span className="font-bold text-red-700 dark:text-red-300 flex items-center gap-1.5">
                      <MapPin className="w-3.5 h-3.5 text-red-600" />
                      Live Transit GPS Tracking Notice
                    </span>
                    <p className="text-[11px] text-slate-600 dark:text-slate-300 leading-relaxed">
                      By confirming acceptance, you agree to share your real-time en-route transit location with the recipient and hospital team to coordinate emergency readiness. Location sharing terminates upon arrival at the blood bank (Privacy Policy Section 4).
                    </p>
                  </div>
                </>
              ) : (
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Reason for Declining
                  </label>
                  <select
                    value={declineReason}
                    onChange={(e) => setDeclineReason(e.target.value)}
                    className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-medical-red focus:outline-none"
                  >
                    <option value="Unavailable due to travel/work">Unavailable due to travel/work</option>
                    <option value="Recently donated in another facility">Recently donated in another facility</option>
                    <option value="Health/Medication temporary deferral">Health/Medication temporary deferral</option>
                    <option value="Hospital too far from current location">Hospital too far from current location</option>
                  </select>
                </div>
              )}

              <div className="flex space-x-2 pt-2">
                <button
                  type="submit"
                  className="flex-1 py-2.5 rounded-xl bg-medical-red hover:bg-red-700 text-white font-bold text-xs shadow transition"
                >
                  Confirm {actionType === 'accept' ? 'Acceptance' : 'Decline'}
                </button>
                <button
                  type="button"
                  onClick={() => setRespondingReqId(null)}
                  className="px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 font-semibold text-xs hover:bg-slate-50 dark:hover:bg-slate-800 transition"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
